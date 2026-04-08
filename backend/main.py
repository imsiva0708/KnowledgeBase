from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
from ContentItem import ContentCreate, ImageCreate
from pool import connection_pool
from table_edit import insert_data_into_db, fetch_data , delete_data
from cloudinary import uploader
import cloudinary_config
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/all")
async def app_get_root():
    conn = connection_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT lookup_id FROM knowledge_base;")
            rows = cur.fetchall()
            return {"data": rows}
    finally:
        connection_pool.putconn(conn)

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
        conn.commit()
    finally:
        connection_pool.putconn(conn)

    return {
        "image_id": image_id
    }

@app.get("/data/{lookup_id}")
async def get_data(lookup_id: str):
    data = fetch_data(lookup_id)
    if data:
        return data
    else:
        return {"error": "Data not found"}

@app.delete("/data/{lookup_id}")
async def delete_data_route(lookup_id: str):
    existing_data = fetch_data(lookup_id)
    if not existing_data:
        return {"error": "Data not found"}
    delete_data(lookup_id)
    return {"message": "Data deleted successfully"}

def cleanup_detached_images():
    """Delete all detached images from the database and cloudinary."""
    conn = connection_pool.getconn()
    try:
        with conn.cursor() as cur:
            # Find images not associated with any knowledge base item
            cur.execute("""
                SELECT id, public_id FROM images 
                WHERE knowledge_base_id IS NULL;
            """)
            detached_images = cur.fetchall()
            
            for image_id, public_id in detached_images:
                # Delete from cloudinary
                uploader.destroy(public_id)
                
                # Delete from database
                cur.execute("DELETE FROM images WHERE id = %s", (image_id,))
        
        conn.commit()
    finally:
        connection_pool.putconn(conn)

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(cleanup_detached_images, 'interval', minutes=1)
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()


if __name__ == '__main__':
    os.system('fastapi dev main.py')