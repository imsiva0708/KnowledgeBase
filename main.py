from fastapi import FastAPI
import os
from ContentItem import ContentCreate, ImageCreate
from cloudinary import uploader
import cloudinary_config
from pool import connection_pool

app = FastAPI()

@app.get("/")
async def app_get_root():
    return {"Hello":"World"}
lis = []

@app.post("/data")
async def app_post_Data(data:ContentCreate):
    conn = connection_pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                """
                INSERT INTO knowledge_base
                (name, lookup_id, group_name, tags, article_links, video_links,md_notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (
                    data.name,
                    data.lookup_id,
                    data.group_name,
                    data.tags,
                    data.article_links,
                    data.video_links,
                    data.md_notes
                )
                )
                knowledge_id = cur.fetchone()[0]


                if data.images:
                    for img in data.images:
                        cur.execute(
                            """
                            INSERT INTO images
                            (knowledge_base_id, public_id, image_name, position)
                            VALUES (%s, %s, %s, %s);
                            """,
                            (
                                knowledge_id,
                                img.public_id,
                                img.image_name,
                                img.position
                            )
                        )

                conn.commit()

    except Exception as e:
        conn.rollback()
        raise e

if __name__ == '__main__':
    os.system('fastapi dev main.py')