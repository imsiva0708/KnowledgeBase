from pool import connection_pool
from ContentItem import ContentCreate

def insert_data_into_db(data: ContentCreate):
    conn = connection_pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:

                # 1️⃣ Validate & Lock Images (if provided)
                if data.image_ids:
                    cur.execute(
                        """
                        SELECT id
                        FROM images
                        WHERE id = ANY(%s)
                        AND knowledge_base_id IS NULL
                        FOR UPDATE;
                        """,
                        (data.image_ids,)
                    )

                    rows = cur.fetchall()

                    if len(rows) != len(data.image_ids):
                        raise Exception("One or more images are invalid or already attached.")

                # 2️⃣ Insert knowledge_base
                cur.execute(
                    """
                    INSERT INTO knowledge_base
                    (name, lookup_id, group_name, tags, article_links, video_links, md_notes)
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

                # 3️⃣ Attach Images
                if data.image_ids:
                    cur.execute(
                        """
                        UPDATE images
                        SET knowledge_base_id = %s, status = 'attached'
                        WHERE id = ANY(%s);
                        """,
                        (knowledge_id, data.image_ids)
                    )

                return knowledge_id

    except Exception as e:
        raise e

    finally:
        connection_pool.putconn(conn)