from psycopg2 import pool
import os
import dotenv

dotenv.load_dotenv()

connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    host=os.getenv('HOST'),
    dbname=os.getenv('DB_NAME'),
    user=os.getenv('USER'),
    password=os.getenv('PASSWORD'),
    port=int(os.getenv('PORT', 5432))
)