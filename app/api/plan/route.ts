import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const dataDir = path.resolve('./data');
    const planPath = path.join(dataDir, 'sample_plan.json');

    if (!fs.existsSync(planPath)) {
      return NextResponse.json({ error: 'Sample plan not found' }, { status: 404 });
    }

    const raw = fs.readFileSync(planPath, 'utf-8');
    const plan = JSON.parse(raw);

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error serving sample plan:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
