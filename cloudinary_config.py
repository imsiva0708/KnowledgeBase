import cloudinary 
import os
import dotenv
from cloudinary import uploader

dotenv.load_dotenv()

cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
)

if __name__ == "__main__":
    ret = uploader.upload_image('image.png',public_id='hat')
    ...