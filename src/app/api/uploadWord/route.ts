import fs from 'fs/promises';
import path from 'path';
import { insertWord, wordExists } from '@/utils/database';

// กำหนด path ไปยังไฟล์ dictionary.txt
const dictionaryFilePath = path.join(process.cwd(), 'src', 'dictionary', 'dictionary.txt');

// ฟังก์ชันที่ใช้จัดการ API request
export async function POST() {
    try {
        // อ่านไฟล์ dictionary.txt
        const content = await fs.readFile(dictionaryFilePath, 'utf-8');
        const words = Array.from(new Set(content.split('\n').map(word => word.trim()).filter(Boolean))); // แยกคำและทำให้เป็นชุด

        const existenceChecks = await Promise.all(words.map(word => wordExists(word))); // ตรวจสอบการมีอยู่ในฐานข้อมูลแบบขนาน

        const wordsToInsert = words.filter((_, index) => !existenceChecks[index]); // กรองคำที่ไม่มีอยู่ในฐานข้อมูล
        let insertedCount = 0;

        // แทรกคำที่ไม่ซ้ำเข้าไปในฐานข้อมูลแบบเป็นลำดับเพื่อรักษาลำดับ
        for (const word of wordsToInsert) {
            await insertWord(word);
            insertedCount++;
        }

        return new Response(
            JSON.stringify({
                message: 'Words inserted into DB successfully',
                insertedCount: insertedCount,
                skippedCount: words.length - insertedCount
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: 'Failed to insert words.',
                error: error instanceof Error ? error.message : 'Unknown Error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}

