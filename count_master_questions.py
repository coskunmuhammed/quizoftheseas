import sqlite3
import os

db_path = r'c:\Users\Dell\Desktop\Derin Deniz\backend\database.sqlite'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM questions")
    count = cursor.fetchone()[0]
    print(f"Total Questions in database.sqlite: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, category_id, question_text FROM questions LIMIT 5")
        qs = cursor.fetchall()
        print("Sample Questions:")
        for q in qs:
            print(q)
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
