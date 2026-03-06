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

def fetch_data(lookup_id: str):
    conn = connection_pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, name, lookup_id, group_name, tags, article_links, video_links, md_notes
                    FROM knowledge_base
                    WHERE lookup_id = %s;
                    """,
                    (lookup_id,)
                )

                row = cur.fetchone()
                if not row:
                    return None

                knowledge_id = row[0]

                # Fetch associated images
                cur.execute(
                    """
                    SELECT id, public_id, image_name, position
                    FROM images
                    WHERE knowledge_base_id = %s;
                    """,
                    (knowledge_id,)
                )

                images = cur.fetchall()

                return {
                    "id": row[0],
                    "name": row[1],
                    "lookup_id": row[2],
                    "group_name": row[3],
                    "tags": row[4],
                    "article_links": row[5],
                    "video_links": row[6],
                    "md_notes": row[7],
                    "images": [
                        {
                            "id": img[0],
                            "public_id": img[1],
                            "image_name": img[2],
                            "position": img[3]
                        }
                        for img in images
                    ]
                }

    finally:
        connection_pool.putconn(conn)

def delete_data(lookup_id: str):
    conn = connection_pool.getconn()
    try:
        with conn:
            with conn.cursor() as cur:
                # 1️⃣ Get knowledge_base ID
                cur.execute(
                    """
                    SELECT id
                    FROM knowledge_base
                    WHERE lookup_id = %s;
                    """,
                    (lookup_id,)
                )

                row = cur.fetchone()
                if not row:
                    return False

                knowledge_id = row[0]

                # 2️⃣ Detach Images
                cur.execute(
                    """
                    UPDATE images
                    SET knowledge_base_id = NULL, status = 'detached'
                    WHERE knowledge_base_id = %s;
                    """,
                    (knowledge_id,)
                )

                # 3️⃣ Delete knowledge_base
                cur.execute(
                    """
                    DELETE FROM knowledge_base
                    WHERE id = %s;
                    """,
                    (knowledge_id,)
                )

                return True

    finally:
        connection_pool.putconn(conn)
    