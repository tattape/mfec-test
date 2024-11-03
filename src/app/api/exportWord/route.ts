import { exportWordsToPDF } from "@/utils/exportWordToPDF";

export async function GET() {
    try {
        const pdfData = await exportWordsToPDF(); // สร้างรายงาน PDF

        return new Response(pdfData, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="words.pdf"', // ตั้งชื่อไฟล์ PDF
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: 'Failed to Export Words.',
                error: error instanceof Error ? error.message : 'Unknown Error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
