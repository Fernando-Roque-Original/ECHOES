from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "reel" / "echos-en"
OUTPUT = ROOT / "out" / "echos-en-source-contact-sheet.jpg"

files = sorted(ASSETS.glob("*.png"))
thumb_width = 480
thumb_height = 270
label_height = 36
columns = 4
rows = (len(files) + columns - 1) // columns
sheet = Image.new(
    "RGB",
    (columns * thumb_width, rows * (thumb_height + label_height)),
    "#07111d",
)
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default(size=20)

for index, path in enumerate(files):
    image = Image.open(path).convert("RGB")
    print(f"{path.name}: {image.width}x{image.height}")
    image.thumbnail((thumb_width, thumb_height))
    x = (index % columns) * thumb_width
    y = (index // columns) * (thumb_height + label_height)
    sheet.paste(image, (x, y))
    draw.text((x + 12, y + thumb_height + 7), path.name, fill="#f5eee2", font=font)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
sheet.save(OUTPUT, quality=92)
print(f"contact sheet: {OUTPUT}")
