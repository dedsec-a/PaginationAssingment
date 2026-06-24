import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query  # Added Query import
from dotenv import load_dotenv
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row  # Added dict_row import
from fastapi.middleware.cors import CORSMiddleware

# 1. Load hidden credentials from the .env file into memory
load_dotenv()

# 2. Manage the database connection pool lifecycle safely
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Establishing secure connection pool with Supabase...")
    
    conn_str = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        f"?sslmode=require"
    )
    
    app.state.db_pool = AsyncConnectionPool(
        conninfo=conn_str,
        open=False
    )
    await app.state.db_pool.open()
    print("✅ Supabase connection pool is active and online!")
    
    yield  # The server handles active API requests here
    
    print("🛑 Closing Supabase connection pool cleanly...")
    await app.state.db_pool.close()

# 3. Instantiate the core FastAPI application with the lifecycle hook
app = FastAPI(lifespan=lifespan)
# Inside BackEnd/main.py

origins = [
    "http://localhost:5173",
    "https://paginationassingment.onrender.com",
    "https://pagination-assingment-rdisuu3je.vercel.app"  # 👈 Add this exact link (NO trailing slash)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows requests from your React ports
    allow_credentials=True,
    allow_methods=["*"],              # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],              # Allows all headersz
)

# 4. Standard root diagnostic endpoint to verify everything is working
@app.get("/")
async def read_root():
    return {"status": "healthy", "message": "Backend engine is running smoothly"}

@app.get("/products")
async def get_products(
    limit: int = Query(20, le=100),
    cursor_category: str = None,
    cursor_created_at: str = None,
    cursor_id: int = None
):
    # Fixed typo: perf_counter
    start = time.perf_counter()
    products = []
    
    async with app.state.db_pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cursor:
            query = "SELECT id, name, category, created_at, price FROM products"
            params = []
            
            # Fixed typo in 'category' inside SQL string
            if cursor_category and cursor_created_at and cursor_id:
                query += """ 
                WHERE category = %s AND (created_at < %s OR (created_at = %s AND id < %s))
                """
                # Fixed: Added double timestamp placeholders to match the 4 query targets
                params.extend([cursor_category, cursor_created_at, cursor_created_at, cursor_id])
                 
            # Fixed indentation, missing LIMIT keyword, and order typos
            query += " ORDER BY category, created_at DESC, id DESC LIMIT %s;"
            params.append(limit)
            
            await cursor.execute(query, params)
            # Fixed typo: await cursor.fetchall()
            products = await cursor.fetchall()
    
    end_time = time.perf_counter()
    
    # Fixed: Added parentheses for math operator precedence
    execution_ms = (end_time - start) * 1000
     
    print(f"⚡ [BENCHMARK] Fetched {len(products)} products in {execution_ms:.2f} ms") 
     
    # Fixed: Added missing item separation commas
    return {
        "execution_time_ms": round(execution_ms, 2),
        "count": len(products),
        "data": products
    }
    
@app.get("/products/search")
async def search_products(
    query: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100)
):
    # 🎯 4 spaces inside the function definition block
    start = time.perf_counter()
    products = []
    offset = (page - 1) * limit
    
    async with app.state.db_pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cursor:
            
            # Utilizing our pg_trgm index for case-insensitive partial matching
            sql = """
                SELECT id, name, category, created_at, price 
                FROM products 
                WHERE name ILIKE %s
                ORDER BY id DESC
                LIMIT %s OFFSET %s;
            """
            
            search_param = f"%{query}%"
            
            await cursor.execute(sql, [search_param, limit, offset])
            products = await cursor.fetchall()
            
    # 🎯 Calculate performance tracking after closing connection blocks
    end_time = time.perf_counter()
    execution_ms = (end_time - start) * 1000
    print(f"🔍 [SEARCH API] Query='{query}' Page={page} Found {len(products)} matches in {execution_ms:.2f} ms")
    
    return {
        "execution_time_ms": round(execution_ms, 2),
        "current_page": page,
        "count": len(products),
        "data": products
    }