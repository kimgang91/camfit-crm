import { NextRequest, NextResponse } from 'next/server';
import { saveContactInfo, getContactInfo } from '@/lib/googleSheets';

export async function GET() {
  try {
    const contacts = await getContactInfo();
    return NextResponse.json({ data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await saveContactInfo({
      campingId: body.campingId,
      rowNumber: body.rowNumber,
      mdName: body.mdName,
      result: body.result,
      rejectionReason: body.rejectionReason,
      content: body.content,
      contactDate: body.contactDate,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving contact:', error);
    return NextResponse.json(
      { error: 'Failed to save contact' },
      { status: 500 }
    );
  }
}
