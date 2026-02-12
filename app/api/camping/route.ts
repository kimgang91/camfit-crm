import { NextResponse } from 'next/server';
import { getCampingList } from '@/lib/googleSheets';
import { getCampfitList } from '@/lib/googleSheets';
import { matchCampingWithCampfit } from '@/lib/fuzzyMatch';

export async function GET() {
  try {
    const [campingList, campfitList] = await Promise.all([
      getCampingList(),
      getCampfitList(),
    ]);

    console.log(`Camping list count: ${campingList.length}`);
    console.log(`Campfit list count: ${campfitList.length}`);

    // 입점 매칭
    const matchMap = matchCampingWithCampfit(campingList, campfitList);

    // 매칭 결과를 리스트에 추가
    const campingListWithMatch = campingList.map((item, index) => ({
      ...item,
      isCampfitMember: matchMap.get(index + 1) || false,
    }));

    return NextResponse.json({ 
      data: campingListWithMatch,
      count: campingListWithMatch.length 
    });
  } catch (error: any) {
    console.error('Error fetching camping list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch camping list',
        message: error.message || 'Unknown error',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
