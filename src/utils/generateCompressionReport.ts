import fs from 'fs';
import fspromise from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { PDFDocument, rgb } from 'pdf-lib';

// กำหนดไดเรกทอรีของ output และ zip
const outputDir = path.join(process.cwd(), 'src', 'words');
const zipOutputDir = path.join(process.cwd(), 'src', 'zipWords');

// ฟังก์ชันสำหรับ zip โฟลเดอร์ในระดับ 1 และสร้างรายงาน PDF
export const generateCompressionReport = async (): Promise<Uint8Array> => {
    const reportData: { dirName: string; unzippedSize: number; zippedSize: number; compressionPercentage: number }[] = [];

    try {
        // สร้างไดเรกทอรี zipWords หากยังไม่มีอยู่
        await fspromise.mkdir(zipOutputDir, { recursive: true });

        // อ่านโฟลเดอร์ใน outputDir
        const level1Dirs = await fspromise.readdir(outputDir, { withFileTypes: true });

        // สร้าง array ของ promises สำหรับการ zip โฟลเดอร์ทั้งหมดพร้อมกัน
        const zipPromises = level1Dirs
            .filter(dir => dir.isDirectory())
            .map(dir => processDirectory(dir.name));

        // รอให้ zip ทั้งหมดเสร็จสิ้น
        const results = await Promise.all(zipPromises);
        reportData.push(...results);

        // สร้าง PDF รายงาน
        const pdfData = await createPDFReport(reportData);
        return pdfData;

    } catch (error) {
        console.error('Error generating compression report:', error);
        throw error;
    }
};

// ฟังก์ชันสำหรับจัดการการ zip และคำนวณขนาดไฟล์
const processDirectory = async (dirName: string): Promise<{ dirName: string; unzippedSize: number; zippedSize: number; compressionPercentage: number }> => {
    const dirPath = path.join(outputDir, dirName);

    // คำนวณขนาดของโฟลเดอร์ทั้งหมดรวมถึงไฟล์ในทุกระดับ
    const unzippedSize = await getFolderSize(dirPath);

    // Zip โฟลเดอร์
    const zipOutputPath = path.join(zipOutputDir, `${dirName}.zip`);
    const output = fs.createWriteStream(zipOutputPath);
    const archive = archiver('zip', {
        zlib: { level: 9 }, // กำหนดระดับการบีบอัด
    });

    // Pipe archive data to the file
    archive.pipe(output);
    archive.directory(dirPath, false); // ตั้งค่า false เพื่อไม่รวมชื่อโฟลเดอร์หลักใน zip

    await archive.finalize();

    // อัปเดตขนาดที่ zip
    const zippedStats = await fspromise.stat(zipOutputPath);
    const zippedSize = zippedStats.size;

    // คำนวณเปอร์เซ็นต์การบีบอัด
    const compressionPercentage = ((unzippedSize - zippedSize) / unzippedSize) * 100;

    return { dirName, unzippedSize, zippedSize, compressionPercentage };
};

// ฟังก์ชันสำหรับคำนวณขนาดไฟล์ภายในโฟลเดอร์
const getFolderSize = async (folderPath: string): Promise<number> => {
    let totalSize = 0;
    const files = await fspromise.readdir(folderPath, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(folderPath, file.name);
        if (file.isDirectory()) {
            totalSize += await getFolderSize(filePath); // ถ้าเป็นไดเรกทอรี ให้รวมขนาดของไฟล์ในไดเรกทอรีนั้น
        } else {
            const stats = await fspromise.stat(filePath);
            totalSize += stats.size; // ถ้าเป็นไฟล์ ให้รวมขนาดไฟล์
        }
    }
    return totalSize;
};

// ฟังก์ชันสำหรับสร้าง PDF รายงาน
const createPDFReport = async (reportData: any[]): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { height } = page.getSize();
    const fontSizeTitle = 20;
    const fontSizeBody = 12; // Decreased font size for body text
    const lineHeight = 60; // Height between lines
    const columnWidth = 250; // Width for each column
    let yPosition = height - 50; // Starting Y position for the text
    let currentLine = 0; // Track current line number for the column

    // Draw title
    page.drawText('Compression Report', {
        x: 50,
        y: yPosition,
        size: fontSizeTitle,
        color: rgb(0, 0, 0),
    });
    yPosition -= 30; // Move down after title

    reportData.forEach(item => {
        // Calculate Y position for each column
        const baseYPosition = yPosition - (Math.floor(currentLine / 2) * (lineHeight + 20));
        const xPosition = (currentLine % 2 === 0) ? 50 : 50 + columnWidth;

        // Write report data to the PDF
        page.drawText(`Directory: ${item.dirName}`, {
            x: xPosition,
            y: baseYPosition,
            size: fontSizeBody,
            color: rgb(0, 0, 1), // Blue color
        });

        page.drawText(`Unzipped Size: ${(item.unzippedSize / 1024).toFixed(2)} Kbyte`, { x: xPosition, y: baseYPosition - 20, size: fontSizeBody });
        page.drawText(`Zipped Size: ${(item.zippedSize / 1024).toFixed(2)} Kbyte`, { x: xPosition, y: baseYPosition - 40, size: fontSizeBody });
        page.drawText(`Compression Percentage: ${item.compressionPercentage.toFixed(2)}%`, { x: xPosition, y: baseYPosition - 60, size: fontSizeBody });

        currentLine++;

        // Check if we need to create a new page after filling the columns
        if (currentLine % 2 === 0 && currentLine / 2 >= Math.floor((height - 100) / (lineHeight + 20))) {
            page = pdfDoc.addPage([595.28, 841.89]); // Add new page
            yPosition = height - 50; // Reset Y position
            currentLine = 0; // Reset line count
            page.drawText('Compression Report', {
                x: 50,
                y: yPosition,
                size: fontSizeTitle,
                color: rgb(0, 0, 0),
            }); // Redraw title on the new page
            yPosition -= 30; // Move down after title
        }
    });

    return pdfDoc.save();
};
