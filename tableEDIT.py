from pool import connection_pool

try:
    with conn:
        with conn.cursor() as cur:
            cur.execute(
            """
            INSERT INTO knowledge_base
            (name, lookup_id, group_name, tags, article_links, video_links)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (
                data.name,
                data.lookup_id,
                data.group_name,
                data.tags,
                data.article_links,
                data.video_links
            )
        )

        knowledge_id = cur.fetchone()[0]

        # 2️⃣ Insert images (if any)
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

        # 3️⃣ Commit once
        conn.commit()

    except Exception as e:
        conn.rollback()
        raise e