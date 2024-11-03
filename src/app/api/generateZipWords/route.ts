import generateWordsZip from '@/utils/generateWordsSizeReport';

export async function POST() {
    try {
        await generateWordsZip(); // เรียกใช้ฟังก์ชัน zip
        return new Response(
            JSON.stringify({ message: 'Word Zipped Successfully!' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: 'Failed to Zip Word.',
                error: error instanceof Error ? error.message : 'Unknown Error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
