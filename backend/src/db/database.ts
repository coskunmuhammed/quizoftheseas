import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function openDb(): Promise<Database> {
    if (db) return db;

    db = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      category_id INTEGER,
      score INTEGER,
      total_questions INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

    return db;
}
