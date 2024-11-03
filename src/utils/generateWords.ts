import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const dictionaryFilePath = path.join(process.cwd(), 'src', 'dictionary', 'dictionary.txt');
const outputDir = path.join(process.cwd(), 'src', 'words');

// ฟังก์ชันเพื่อสร้างโฟลเดอร์
const createDirectories = async (words: string[]): Promise<void> => {
    const directories = new Set<string>();

    for (const word of words) {
        const lowerWord = word.toLowerCase();
        const firstChar = lowerWord.charAt(0);
        const secondChar = lowerWord.charAt(1);
        directories.add(path.join(outputDir, firstChar, secondChar));
    }

    // สร้างโฟลเดอร์ทั้งหมดในครั้งเดียว
    await Promise.all(Array.from(directories).map(dir => fs.mkdir(dir, { recursive: true })));
};

const generateWords = async (): Promise<void> => {
    try {
        // อ่านไฟล์คำศัพท์
        const data = await fs.readFile(dictionaryFilePath, 'utf8');
        const words = data.split('\n').map(word => word.trim()).filter(Boolean);

        // สร้างโฟลเดอร์ที่จำเป็น
        await createDirectories(words);

        // ตั้งค่าจำนวนงานที่ทำพร้อมกัน
        const limit = pLimit(10);

        // เขียนไฟล์คำศัพท์
        const tasks = words.map(word => limit(async () => {
            const lowerWord = word.toLowerCase();
            const firstChar = lowerWord.charAt(0);
            const secondChar = lowerWord.charAt(1);
            const filePath = path.join(outputDir, firstChar, secondChar, `${lowerWord}.txt`);
            const content = Array.from({ length: 100 }, () => lowerWord).join('\n') + '\n'; // ซ้ำคำศัพท์ 100 ครั้ง
            await fs.writeFile(filePath, content, 'utf8');
        }));

        // รอให้ทุกคำเสร็จสิ้น
        await Promise.all(tasks);

    } catch (error) {
        throw new Error('Error generating words: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
};

export default generateWords;
