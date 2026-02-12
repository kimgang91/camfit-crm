import { NextResponse } from 'next/server';
import { getCampingList } from '@/lib/googleSheets';
import { getContactInfo } from '@/lib/googleSheets';
import { getCampfitList } from '@/lib/googleSheets';
import { matchCampingWithCampfit } from '@/lib/fuzzyMatch';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const [campingList, contacts, campfitList] = await Promise.all([
      getCampingList(),
      getContactInfo(),
      getCampfitList(),
    ]);

    const matchMap = matchCampingWithCampfit(campingList, campfitList);

    // 데이터 결합
    const exportData = campingList.map((camping, index) => {
      const contact = contacts.find((c) => c.campingId === index + 1);
      return {
        지역: camping['지역'] || '',
        주소: camping['주소'] || '',
        캠핑장명: camping['캠핑장명'] || '',
        연락처: camping['연락처'] || '',
        운영상태: camping['운영상태'] || '',
        유형: camping['유형'] || '',
        예약시스템1: camping['예약시스템1'] || '',
        예약시스템2: camping['예약시스템2'] || '',
        입점여부: matchMap.get(index + 1) ? '입점' : '미입점',
        MD이름: contact?.mdName || '',
        결과: contact?.result || '',
        거절사유: contact?.rejectionReason || '',
        컨택내용: contact?.content || '',
        컨택일: contact?.contactDate || '',
      };
    });

    // 엑셀 파일 생성
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '캠핑장 리스트');

    // 버퍼로 변환
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="campfit-crm-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
