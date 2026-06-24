import os
import random
import asyncio
from dotenv import load_dotenv
import psycopg

# 1. Load your Supabase credentials from the .env file
load_dotenv()

# Fixed categories so we can test categorical filtering predictably later
CATEGORIES = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Fitness", "Beauty"]

ADJECTIVES = ["Premium", "Wireless", "Ergonomic", "Minimalist", "Ultra-Light", "Portable", "Pro", "Smart", "Waterproof", "Mechanical"]

# Pair specific materials and products directly with their matching categories
MARKETPLACE_MATRIX = {
    "Electronics": {
        "materials": ["Aluminium", "Matte", "Carbon Fiber", "Silicone", "Titanium"],
        "items": ["Keyboard", "Mouse", "Headphones", "Desk Mat", "Charger", "Earbuds", "Power Bank"]
    },
    "Clothing": {
        "materials": ["Cotton", "Leather", "Knit", "Fleece", "Denim"],
        "items": ["T-Shirt", "Hoodie", "Sneakers", "Jacket", "Socks", "Cap", "Shorts"]
    },
    "Home & Kitchen": {
        "materials": ["Bamboo", "Wooden", "Ceramic", "Glass", "Stainless Steel"],
        "items": ["Water Bottle", "Desk Lamp", "Coffee Mug", "Blender", "Organizer", "Air Purifier"]
    },
    "Books": {
        "materials": ["Paperback", "Hardcover", "Leather-bound"],
        "items": ["Notebook", "Journal", "Novel", "Study Guide", "Sketchbook", "Planner"]
    },
    "Fitness": {
        "materials": ["Rubber", "Neoprene", "Steel", "Silicone"],
        "items": ["Dumbbell", "Yoga Mat", "Resistance Band", "Skipping Rope", "Shaker Bottle", "Foam Roller"]
    },
    "Beauty": {
        "materials": ["Organic", "Natural", "Vegan", "Herbal"],
        "items": ["Face Wash", "Moisturizer", "Lip Balm", "Sunscreen", "Serum", "Hair Oil"]
    }
}

# ✅ ONLY ONE DEFINITION: This version handles high-fidelity product creation accurately
def generate_mock_products(count: int):
    """Generates a list of highly realistic, category-accurate product tuples"""
    products = []
    for _ in range(count):
        category = random.choice(CATEGORIES)
        
        # Safely pull the specific pool configuration map
        pool = MARKETPLACE_MATRIX[category]
        
        # Pick the context-aware material and product item type
        material = random.choice(pool["materials"])
        item_type = random.choice(pool["items"])
        
        # Formulate a bulletproof title: "Premium Leather Jacket" or "Smart Aluminium Keyboard"
        name = f"{random.choice(ADJECTIVES)} {material} {item_type}"
        
        price = round(random.uniform(19.99, 999.99), 2)
        
        # Matches our database column order: (name, category, price)
        products.append((name, category, price))
        
    return products

async def seed_database():
    print("🌱 Initializing high-fidelity database seeding engine...")
    
    # Construct the connection string using your port 5432 setup
    conn_str = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
        f"?sslmode=require"
    )
    
    TOTAL_RECORDS = 10000
    BATCH_SIZE = 2000
    
    async with await psycopg.AsyncConnection.connect(conn_str) as conn:
        async with conn.cursor() as cursor:
            print("🧹 Clearing out old test data...")
            # TRUNCATE empties the table, RESTART IDENTITY resets the auto-increment ID back to 1
            await cursor.execute("TRUNCATE TABLE products RESTART IDENTITY;")
            
            print(f"🚀 Injecting {TOTAL_RECORDS} realistic marketplace products...")
            
            # Send the rows over in 5 quick network bursts of 2,000 rows each
            for i in range(0, TOTAL_RECORDS, BATCH_SIZE):
                batch_data = generate_mock_products(BATCH_SIZE)
                
                await cursor.executemany("""
                    INSERT INTO products (name, category, price)
                    VALUES (%s, %s, %s);
                """, batch_data)
                
                print(f"📦 Successfully injected rows {i + BATCH_SIZE}/{TOTAL_RECORDS}...")

            # Commit changes permanently to the cloud
            await conn.commit()
            
    print("✨ Database seeding complete! 10,000 real-world style rows are loaded.")

if __name__ == "__main__":
    import sys
    # Apply the Windows asyncio fix we used earlier
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    asyncio.run(seed_database())