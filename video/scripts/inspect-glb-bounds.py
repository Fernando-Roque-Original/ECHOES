from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

import numpy as np


def load_glb_json(path: Path) -> dict:
    data = path.read_bytes()
    json_length = struct.unpack_from("<I", data, 12)[0]
    return json.loads(data[20 : 20 + json_length].decode("utf-8").rstrip("\x00 "))


def quaternion_matrix(values: list[float]) -> np.ndarray:
    x, y, z, w = values
    return np.array(
        [
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 0],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 0],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y), 0],
            [0, 0, 0, 1],
        ],
        dtype=float,
    )


def node_matrix(node: dict) -> np.ndarray:
    if "matrix" in node:
        return np.array(node["matrix"], dtype=float).reshape((4, 4), order="F")

    translation = np.eye(4)
    translation[:3, 3] = node.get("translation", [0, 0, 0])
    rotation = quaternion_matrix(node.get("rotation", [0, 0, 0, 1]))
    scale = np.diag([*node.get("scale", [1, 1, 1]), 1.0])
    return translation @ rotation @ scale


def transformed_accessor_bounds(
    accessor: dict,
    matrix: np.ndarray,
) -> tuple[np.ndarray, np.ndarray] | None:
    if accessor.get("type") != "VEC3":
        return None
    minimum = accessor.get("min")
    maximum = accessor.get("max")
    if minimum is None or maximum is None:
        return None

    corners = np.array(
        [
            [x, y, z, 1]
            for x in (minimum[0], maximum[0])
            for y in (minimum[1], maximum[1])
            for z in (minimum[2], maximum[2])
        ],
        dtype=float,
    )
    transformed = (matrix @ corners.T).T[:, :3]
    return transformed.min(axis=0), transformed.max(axis=0)


def main() -> None:
    path = Path(sys.argv[1])
    gltf = load_glb_json(path)
    nodes = gltf.get("nodes", [])
    meshes = gltf.get("meshes", [])
    accessors = gltf.get("accessors", [])

    records: list[dict] = []

    def visit(index: int, parent: np.ndarray) -> None:
        node = nodes[index]
        world = parent @ node_matrix(node)
        if "mesh" in node:
            mesh_index = node["mesh"]
            mesh = meshes[mesh_index]
            corners: list[np.ndarray] = []
            for primitive in mesh.get("primitives", []):
                position_index = primitive.get("attributes", {}).get("POSITION")
                if position_index is None:
                    continue
                bounds = transformed_accessor_bounds(
                    accessors[position_index],
                    world,
                )
                if bounds:
                    corners.append(np.stack(bounds))
            if corners:
                merged = np.concatenate(corners, axis=0)
                minimum = merged.min(axis=0)
                maximum = merged.max(axis=0)
                records.append(
                    {
                        "node": index,
                        "nodeName": node.get("name", ""),
                        "mesh": mesh_index,
                        "meshName": mesh.get("name", ""),
                        "minimum": minimum,
                        "maximum": maximum,
                        "center": (minimum + maximum) / 2,
                        "size": maximum - minimum,
                    }
                )
        for child in node.get("children", []):
            visit(child, world)

    for root in gltf.get("scenes", [{}])[gltf.get("scene", 0)].get("nodes", []):
        visit(root, np.eye(4))

    if not records:
        print("No mesh bounds found")
        return

    all_minimum = np.min([record["minimum"] for record in records], axis=0)
    all_maximum = np.max([record["maximum"] for record in records], axis=0)
    print("union", all_minimum, all_maximum, "size", all_maximum - all_minimum)
    records.sort(key=lambda record: float(np.linalg.norm(record["size"])), reverse=True)
    for record in records[:25]:
        print(
            f'{record["node"]:3d} {record["nodeName"]:20s} '
            f'diag={np.linalg.norm(record["size"]):7.3f} '
            f'center={np.round(record["center"], 3)} '
            f'size={np.round(record["size"], 3)}'
        )


if __name__ == "__main__":
    main()
