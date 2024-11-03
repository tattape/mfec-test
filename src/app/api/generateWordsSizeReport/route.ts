import generateWordsSizeReport from '../../../utils/generateWordsSizeReport';

export async function GET() {
    try {
        const pdfData = await generateWordsSizeReport(); // สร้างรายงาน PDF

        return new Response(pdfData, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="words_size_report.pdf"', // ตั้งชื่อไฟล์ PDF
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: 'Failed to Generate Words Size Report.',
                error: error instanceof Error ? error.message : 'Unknown Error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
