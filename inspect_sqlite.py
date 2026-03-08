import sqlite3
import os

db_path = r'c:\Users\Dell\Desktop\Derin Deniz\backend\offline.sqlite'

if not os.path.exists(db_path):
    print(f"Error: {db_path} does not exist")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Tables: {tables}")
        
        for table in tables:
            t_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {t_name}")
            count = cursor.fetchone()[0]
            print(f"Table {t_name} count: {count}")
            
            if t_name == 'categories':
                cursor.execute("SELECT id, name, parent_id FROM categories")
                cats = cursor.fetchall()
                print("Categories:")
                for c in cats:
                    print(c)
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
