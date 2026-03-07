import psycopg2
import dotenv
import os

dotenv.load_dotenv()

with psycopg2.connect(
    host=os.getenv('HOST'),
    dbname=os.getenv('DB_NAME'),
    user=os.getenv('USER'),
    password=os.getenv('PASSWORD'),
    port=int(os.getenv('PORT', 5432))
) as conn:
    
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM cars;")
        print(cur.fetchall())
        conn.commit()




# print(result)
# cur.execute("""
#     INSERT INTO knowledge_base (lookup_id, name, group_name, md_notes)
#     VALUES (%s, %s, %s, %s)
#     RETURNING id;
# """, (lookup_id, name, group_name, md_notes))

# knowledge_id = cur.fetchone()[0]
# conn.commit()