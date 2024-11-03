import { PDFDocument, rgb } from 'pdf-lib';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// กำหนด path ไปยังไฟล์ฐานข้อมูล SQLite
const dbFilePath = path.join(process.cwd(), 'src', 'db', 'database.sqlite');

// ประเภทของฐานข้อมูล
type DB = Database<sqlite3.Database, sqlite3.Statement>;

// ฟังก์ชันในการ initialize หรือสร้างฐานข้อมูล
const initializeDatabase = async (): Promise<DB> => {
    return open({
        filename: dbFilePath,
        driver: sqlite3.Database,
    });
};

// ฟังก์ชันในการส่งออกคำศัพท์เป็น PDF
export const exportWordsToPDF = async (): Promise<Uint8Array> => {
    const db = await initializeDatabase();
    try {
        // ดึงคำทั้งหมดจากฐานข้อมูล
        const words = await db.all('SELECT word FROM Dictionary');
        if (words.length === 0) {
            throw new Error('No words found in the database.');
        }

        // สร้าง PDF
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595.28, 841.89]); // ขนาด A4
        const { height } = page.getSize();
        const fontSize = 12;
        let yPosition = height - 30; // เริ่มต้นที่ Y Position

        // เขียนคำลงใน PDF
        for (const row of words) {
            const word = row.word;

            // เช็คว่าถึงจุดสิ้นสุดของหน้าแล้วหรือยัง
            if (yPosition < 30) {
                page = pdfDoc.addPage([595.28, 841.89]); // เพิ่มหน้าใหม่
                yPosition = height - 30; // รีเซ็ต Y Position
            }

            // เขียนคำลงใน PDF
            page.drawText(word, {
                x: 50,
                y: yPosition,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
            yPosition -= fontSize + 5; // ปรับ Y Position สำหรับบรรทัดถัดไป
        }

        // ส่งกลับ pdfBytes แทนการบันทึกลงไฟล์
        return await pdfDoc.save();

    } catch (error) {
        throw new Error('Error Exporting Words to PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
        await db.close();
    }
};
