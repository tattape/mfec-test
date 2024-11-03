import generateWords from '../../../utils/generateWords';

export async function POST(req: Request) {
    try {
        await generateWords();
        return new Response(
            JSON.stringify({ message: 'Words Folder Structure Created Successfully.' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ message: 'Failed to Create Words Folder Structure.', error: error instanceof Error ? error.message : 'Unknown Error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
