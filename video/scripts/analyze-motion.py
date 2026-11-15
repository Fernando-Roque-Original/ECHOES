import argparse
from pathlib import Path

import cv2
import numpy as np


def analyze(path: Path, sample_width: int = 480) -> dict:
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise SystemExit(f"Could not open {path}")

    fps = capture.get(cv2.CAP_PROP_FPS)
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    previous = None
    differences = []

    while True:
        ok, frame = capture.read()
        if not ok:
            break
        height, width = frame.shape[:2]
        target_height = max(1, round(sample_width * height / width))
        frame = cv2.resize(
            frame,
            (sample_width, target_height),
            interpolation=cv2.INTER_AREA,
        )
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY).astype(np.float32)
        if previous is not None:
            differences.append(float(np.mean(np.abs(gray - previous))))
        previous = gray

    capture.release()
    values = np.asarray(differences)
    duration = frame_count / fps if fps else 0
    return {
        "path": str(path),
        "duration": round(duration, 3),
        "fps": round(fps, 3),
        "frames": frame_count,
        "meanAdjacentDifference": round(float(values.mean()), 4),
        "p10AdjacentDifference": round(float(np.percentile(values, 10)), 4),
        "p50AdjacentDifference": round(float(np.percentile(values, 50)), 4),
        "p90AdjacentDifference": round(float(np.percentile(values, 90)), 4),
        "nearDuplicateRatio": round(float(np.mean(values < 0.12)), 4),
        "stalledRatio": round(float(np.mean(values < 0.03)), 4),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("videos", nargs="+", type=Path)
    args = parser.parse_args()
    for path in args.videos:
        print(analyze(path))


if __name__ == "__main__":
    main()
