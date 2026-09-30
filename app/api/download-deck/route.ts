import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve('./docs/PHC_Pulse_Pitch_Deck.pptx');
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Pitch deck file not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="PHC_Pulse_Pitch_Deck.pptx"',
      },
    });
  } catch (error) {
    console.error('Error serving pitch deck:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
