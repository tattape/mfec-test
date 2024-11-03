import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';

// กำหนดโฟลเดอร์เอาต์พุต
const outputDir = path.join(process.cwd(), 'src', 'words');

const getTotalSize = async (dirPath: any) => {
    let totalSize = 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            // ถ้าเป็นไดเรกทอรี ให้เรียกฟังก์ชันนี้ใหม่
            totalSize += await getTotalSize(entryPath);
        } else {
            // ถ้าเป็นไฟล์ ให้รวมขนาด
            const stats = await fs.stat(entryPath);
            totalSize += stats.size;
        }
    }

    return totalSize;
};

const generateWordsSizeReport = async (): Promise<Buffer> => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // ขนาด A4

    const { height } = page.getSize();
    const fontSizeTitle = 24; // ขนาดฟอนต์สำหรับหัวเรื่อง
    const fontSizeBody = 12; // ขนาดฟอนต์สำหรับเนื้อหา

    // เขียนหัวเรื่องใน PDF
    page.drawText('Folder Sizes Report', {
        x: 50,
        y: height - 50,
        size: fontSizeTitle,
        color: rgb(0, 0, 0),
    });

    const level1Dirs = await fs.readdir(outputDir, { withFileTypes: true });
    const columnWidth = 250; // ความกว้างของแต่ละคอลัมน์
    let yPosition = height - 100; // ตำแหน่งเริ่มต้นสำหรับข้อความ
    const maxLinesPerColumn = Math.floor((height - 100) / 20); // จำนวนแถวสูงสุดที่สามารถใส่ในคอลัมน์ได้
    let currentLine = 0; // ติดตามหมายเลขแถวปัจจุบันสำหรับคอลัมน์

    for (const dir of level1Dirs) {
        if (dir.isDirectory()) {
            const dirPath = path.join(outputDir, dir.name);
            const totalSize = await getTotalSize(dirPath); // คำนวณขนาดรวมสำหรับทุกไฟล์ในไดเรกทอรี

            // กำหนดตำแหน่ง x ขึ้นอยู่กับคอลัมน์
            const xPosition = (currentLine % 2 === 0) ? 50 : 50 + columnWidth;

            // เขียนขนาดรวมใน PDF
            page.drawText(`${dir.name}: ${(totalSize / 1024).toFixed(2)} Kbyte`, {
                x: xPosition,
                y: yPosition,
                size: fontSizeBody,
                color: rgb(0, 0, 0),
            });

            // อัปเดต yPosition และ currentLine
            currentLine++;

            // ถ้าตำแหน่ง y ต่ำกว่าค่าที่กำหนด และถึงจำนวนแถวสูงสุดในคอลัมน์แล้ว
            if (currentLine % 2 === 0 && currentLine / 2 >= maxLinesPerColumn) {
                // รีเซ็ตตำแหน่ง y และเพิ่มหน้าใหม่
                yPosition = height - 100; // ตั้งค่า yPosition กลับไปที่ตำแหน่งเริ่มต้น
                page = pdfDoc.addPage([595.28, 841.89]); // เพิ่มหน้าใหม่
                currentLine = 0; // รีเซ็ตจำนวนแถวในคอลัมน์
            } else if (currentLine % 2 === 0) {
                // กำหนดตำแหน่ง Y สำหรับแถวถัดไปในคอลัมน์
                yPosition -= 20; // ลดตำแหน่ง y สำหรับแถวถัดไป
            }

            // ถ้าตำแหน่ง y ต่ำกว่าเกณฑ์ ให้เพิ่มหน้าใหม่
            if (yPosition < 50) {
                yPosition = height - 100; // ตั้งค่า yPosition กลับไปที่ตำแหน่งเริ่มต้น
                page = pdfDoc.addPage([595.28, 841.89]); // เพิ่มหน้าใหม่
                currentLine = 0; // รีเซ็ต currentLine
            } else if (currentLine % 2 === 0) {
                // ปรับตำแหน่ง Y สำหรับคอลัมน์ขวาให้ตรงกับคอลัมน์ซ้าย
                yPosition -= 20; // ลดตำแหน่ง y สำหรับคอลัมน์ขวา
            }
        }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
};

export default generateWordsSizeReport;
