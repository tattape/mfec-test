import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getWordStats } from '@/utils/database';

// ประเภทของข้อมูลสถิติที่ดึงมา
export type WordStats = {
    moreThanFiveChars: number;
    duplicateChars: number;
    sameStartEnd: number;
};

// ฟังก์ชันในการสร้าง PDF
export const createPDF = async (stats: WordStats): Promise<Uint8Array> => {
    // สร้าง PDF document ใหม่
    const pdfDoc = await PDFDocument.create();

    // เพิ่มหน้าใหม่ขนาด A4 (595 x 842 พิกเซล)
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    // กำหนดฟอนต์
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // ตั้งค่าขนาดฟอนต์และสีข้อความ
    const fontSize = 16;
    page.setFont(font);
    page.setFontSize(fontSize);

    // แทรกข้อความในหน้า PDF ขนาด A4
    page.drawText('Word Statistics Report', { x: 50, y: height - 50 });
    page.drawText(`1. Words with more than 5 characters: ${stats.moreThanFiveChars}`, { x: 50, y: height - 100 });
    page.drawText(`2. Words with 2 or more duplicate characters: ${stats.duplicateChars}`, { x: 50, y: height - 150 });
    page.drawText(`3. Words that start and end with the same letter: ${stats.sameStartEnd}`, { x: 50, y: height - 200 });

    // สร้างไฟล์ PDF เป็น byte array
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

export async function GET(): Promise<Response> {
    try {
        // ดึง query จากฐานข้อมูล
        const stats: any = await getWordStats();

        // สร้าง PDF จากข้อมูล
        const pdfBytes = await createPDF(stats);

        // ส่ง PDF กลับใน response
        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="query_report.pdf"'
            }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: 'Failed to generate query report.',
                error: error instanceof Error ? error.message : 'Unknown Error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
