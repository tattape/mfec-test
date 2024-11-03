import fs from 'fs';
import fspromise from 'fs/promises';
import path from 'path';
import archiver from 'archiver';

// กำหนดไดเรกทอรีของ output และ zip
const outputDir = path.join(process.cwd(), 'src', 'words');
const zipOutputDir = path.join(process.cwd(), 'src', 'zipWords');

// ฟังก์ชันสำหรับ zip โฟลเดอร์ในระดับ 1
export const generateWordsZip = async (): Promise<void> => {
    try {
        // สร้างไดเรกทอรี zipWords หากยังไม่มีอยู่
        await fspromise.mkdir(zipOutputDir, { recursive: true });

        // อ่านโฟลเดอร์ใน outputDir
        const level1Dirs = await fspromise.readdir(outputDir, { withFileTypes: true });

        // สร้าง array ของ promises เพื่อ zip ทุกโฟลเดอร์พร้อมกัน
        const zipPromises = level1Dirs
            .filter(dir => dir.isDirectory())
            .map(dir => zipDirectory(dir.name));

        // รอให้ zip ทั้งหมดเสร็จสิ้น
        await Promise.all(zipPromises);
    } catch (error) {
        throw new Error('Error Zipping Word: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
};

// ฟังก์ชัน zip โฟลเดอร์
const zipDirectory = async (dirName: string): Promise<void> => {
    const dirPath = path.join(outputDir, dirName);
    const zipOutputPath = path.join(zipOutputDir, `${dirName}.zip`);

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipOutputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }, // กำหนดระดับการบีบอัด
        });

        output.on('close', () => {
            console.log(`Zipped ${archive.pointer()} total bytes to ${zipOutputPath}`);
            resolve(); // เสร็จสิ้นการ zip
        });

        output.on('error', (err) => {
            reject(new Error(`Failed to write zip file: ${err.message}`)); // จัดการข้อผิดพลาด
        });

        archive.on('error', (err) => {
            reject(new Error(`Failed to create archive: ${err.message}`)); // จัดการข้อผิดพลาด
        });

        archive.pipe(output);
        archive.directory(dirPath, false); // ตั้งค่า false เพื่อไม่รวมชื่อโฟลเดอร์หลักใน zip

        archive.finalize();
    });
};
