import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { WordStats } from '@/app/api/queryFromDB/route';

// กำหนด path ไปยังไฟล์ฐานข้อมูล SQLite
const dbFilePath = path.join(process.cwd(), 'src', 'db', 'database.sqlite');

// ประเภทของฐานข้อมูล
type DB = Database<sqlite3.Database, sqlite3.Statement>;

// initialize หรือสร้างฐานข้อมูล
export const initializeDatabase = async (): Promise<DB> => {
  const db: DB = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  // สร้างตาราง Dictionary Table หากยังไม่มี
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Dictionary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL
    );
  `);

  return db;
};

// ฟังก์ชันในการเพิ่มคำศัพท์ลงในฐานข้อมูล
export const insertWord = async (word: string): Promise<void> => {
  const db = await initializeDatabase();
  await db.run(`INSERT INTO Dictionary (word) VALUES (?)`, [word]);
};

// ฟังก์ชันในการตรวจสอบว่าคำศัพท์มีอยู่ในฐานข้อมูลหรือไม่
export const wordExists = async (word: string): Promise<boolean> => {
  const db = await initializeDatabase();
  const result = await db.get(`SELECT 1 FROM Dictionary WHERE word = ?`, [word]);
  return result ? true : false;
};

// ฟังก์ชันในการตอบคำถาม 7.1 - 7.4
export const getWordStats = async () => {
  const db = await initializeDatabase();

  // 7.1 นับคำที่มีความยาว > 5 characters
  const result1 = await db.get(`SELECT COUNT(*) as count FROM Dictionary WHERE LENGTH(word) > 5`);

  // 7.2 นับคำที่มีตัวอักษรซ้ำ >= 2 character
  const result2 = await db.get(`
    SELECT COUNT(*) as count 
    FROM Dictionary 
    WHERE LENGTH(word) - LENGTH(REPLACE(word, SUBSTR(word, INSTR(word, SUBSTR(word, 1, 1)), 1), '')) >= 2
  `);

  // 7.3 นับคำที่ขึ้นต้นและลงท้ายด้วยตัวอักษรเดียวกัน
  const result3 = await db.get(`
    SELECT COUNT(*) as count 
    FROM Dictionary 
    WHERE SUBSTR(word, 1, 1) = SUBSTR(word, -1, 1)
  `);

  // 7.4 อัพเดตคำทั้งหมดให้ตัวอักษรตัวแรกเป็นตัวพิมพ์ใหญ่
  await db.run(`
    UPDATE Dictionary 
    SET word = UPPER(SUBSTR(word, 1, 1)) || SUBSTR(word, 2)
  `);

  return {
    moreThanFiveChars: result1.count,
    duplicateChars: result2.count,
    sameStartEnd: result3.count
  };
};