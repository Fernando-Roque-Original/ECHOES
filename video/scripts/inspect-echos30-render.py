import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
VIDEO = ROOT / "out" / "echos-abandoned-not-forgotten-30s-en.mp4"
FRAME_DIR = ROOT / "out" / "echos-abandoned-not-forgotten-30s-en-checks"
CONTACT_SHEET = (
    ROOT / "out" / "echos-abandoned-not-forgotten-30s-en-contact-sheet.jpg"
)
TIMES = [
    0.0,
    3.0,
    6.0,
    9.0,
    12.0,
    15.0,
    16.7,
    18.0,
    20.0,
    22.0,
    24.0,
    26.0,
    27.2,
    29.5,
]

FRAME_DIR.mkdir(parents=True, exist_ok=True)

ffprobe = subprocess.run(
    [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=codec_name,width,height,r_frame_rate,pix_fmt",
        "-of",
        "json",
        str(VIDEO),
    ],
    check=True,
    capture_output=True,
    text=True,
)
print(json.dumps(json.loads(ffprobe.stdout), indent=2))

frames = []
for index, timestamp in enumerate(TIMES):
    path = FRAME_DIR / f"{index:02d}-{timestamp:04.1f}s.png"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-ss",
            f"{timestamp:.3f}",
            "-i",
            str(VIDEO),
            "-frames:v",
            "1",
            str(path),
        ],
        check=True,
        capture_output=True,
    )
    image = Image.open(path).convert("RGB")
    frames.append((timestamp, image))

thumb_width = 640
thumb_height = 360
label_height = 32
columns = 3
rows = (len(frames) + columns - 1) // columns
sheet = Image.new(
    "RGB",
    (columns * thumb_width, rows * (thumb_height + label_height)),
    "#07111d",
)
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default(size=20)

for index, (timestamp, image) in enumerate(frames):
    image.thumbnail((thumb_width, thumb_height))
    x = (index % columns) * thumb_width
    y = (index // columns) * (thumb_height + label_height)
    sheet.paste(image, (x, y))
    draw.text((x + 10, y + thumb_height + 5), f"{timestamp:.1f}s", fill="#f5eee2", font=font)

sheet.save(CONTACT_SHEET, quality=92)
print(f"contact sheet: {CONTACT_SHEET}")
