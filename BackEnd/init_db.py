import os 
from dotenv import load_dotenv
import asyncio
import psycopg

load_dotenv()

async def connect_db():
    print("Initializing the DB for creating tables...")
    
    conn_str = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        f"?sslmode=require"
    )
    
    async with await psycopg.AsyncConnection.connect(conn_str) as conn:
        async with conn.cursor() as cursor:
            print("Creating Product Tables...")
            # Task 1: Create Table (Fixed parentheses and columns)
            await cursor.execute(""" 
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    category VARCHAR(60) NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)
            
            print("Creating the Pagination Index...")
            # Task 2: Create Index (Fixed hyphen to underscore, added missing comma)
            await cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_products_pagination
                ON products(category, created_at DESC, id DESC);
            """)
            
            # Commit the Transaction (Fixed: called on conn instead of cursor)
            await conn.commit()
            
            print("✨ The Schema is completely setup and live on Supabase!")

if __name__ == "__main__":
    import sys
    
    if sys.platform == "win32":
        import asyncio
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    asyncio.run(connect_db())