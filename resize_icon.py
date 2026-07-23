import sys
from PIL import Image

input_path = sys.argv[1]
out_dir = "/Users/klaayd09/Downloads/COFFEE TEST/public"

try:
    img = Image.open(input_path)
    
    # Crop the central square if the image has a margin (assume the icon is roughly 60% in the middle, or just resize it directly if we don't know).
    # Since I don't know the exact bounding box of the rounded square, let's crop the center 65%.
    width, height = img.size
    crop_size = int(width * 0.65)
    left = (width - crop_size) // 2
    top = (height - crop_size) // 2
    img_cropped = img.crop((left, top, left + crop_size, top + crop_size))

    # Resize and save
    img_192 = img_cropped.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(f"{out_dir}/icon-192.png")
    
    img_512 = img_cropped.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(f"{out_dir}/icon-512.png")
    
    img_favicon = img_cropped.resize((32, 32), Image.Resampling.LANCZOS)
    img_favicon.save(f"{out_dir}/favicon.ico", format="ICO")
    
    print("Icons successfully generated and saved to public folder.")
except Exception as e:
    print(f"Error: {e}")
