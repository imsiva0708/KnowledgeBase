from fastapi import FastAPI, File, UploadFile
import os
from ContentItem import ContentCreate, ImageCreate
from pool import connection_pool
from table_edit import insert_data_into_db
from cloudinary import uploader
import cloudinary_config

app = FastAPI()

@app.get("/")
async def app_get_root():
    return {"Hello":"World"}
lis = []

@app.post("/data")
async def app_post_Data(data:ContentCreate):
    insert_data_into_db(data)

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    
    # Validate
    if not file.content_type or not file.content_type.startswith("image/"):
        return {"error": "Only image files allowed"}

    result = uploader.upload(
        file.file,
        folder="knowledge_base_images",
    )

    conn = connection_pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO images (knowledge_base_id, public_id, image_name, position)
                    VALUES (NULL, %s, %s, 0)
                    RETURNING id;
                    """,
                    (result["public_id"], file.filename)
                )
                image_id = cur.fetchone()[0]

    finally:
        connection_pool.putconn(conn)

    return {
        "image_id": image_id
    }

if __name__ == '__main__':
    os.system('fastapi dev main.py')