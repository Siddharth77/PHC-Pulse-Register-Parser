import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve('./docs/PHC_Pulse_12_Slide_Pitch_Deck.md');
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Pitch deck file not found', { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="PHC_Pulse_12_Slide_Pitch_Deck.md"',
      },
    });
  } catch (error) {
    console.error('Error serving pitch deck:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
