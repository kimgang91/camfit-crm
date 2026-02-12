import Fuse from 'fuse.js';

export interface MatchResult {
  item: any;
  score: number;
  isMatch: boolean;
}

// Fuzzy Matching을 통한 업체 매칭
export function matchCampingWithCampfit(
  campingList: any[],
  campfitList: any[]
): Map<number, boolean> {
  const matchMap = new Map<number, boolean>();

  // 캠핏 입점 리스트에서 캠핑장명과 주소 추출
  const campfitNames = campfitList.map((item) => 
    item['캠핑장명'] || item['업체명'] || ''
  ).filter(Boolean);
  const campfitAddresses = campfitList.map((item) => 
    item['주소'] || item['상세주소'] || ''
  ).filter(Boolean);

  // Fuse.js를 사용한 Fuzzy Matching 설정
  const nameFuse = new Fuse(campfitNames, {
    threshold: 0.6, // 유사도 임계값 (0-1)
    includeScore: true,
  });

  const addressFuse = new Fuse(campfitAddresses, {
    threshold: 0.6,
    includeScore: true,
  });

  campingList.forEach((camping, index) => {
    const campingName = (camping['캠핑장명'] || camping['업체명'] || '').trim();
    const campingAddress = (camping['주소'] || camping['상세주소'] || '').trim();

    let isMatched = false;

    if (!campingName && !campingAddress) {
      matchMap.set(index + 1, false);
      return;
    }

    // 정확 일치 확인 (대소문자 무시)
    const exactNameMatch = campfitNames.some(name => 
      name.toLowerCase().trim() === campingName.toLowerCase()
    );
    const exactAddressMatch = campfitAddresses.some(addr => 
      addr.toLowerCase().trim() === campingAddress.toLowerCase()
    );

    if (exactNameMatch || exactAddressMatch) {
      isMatched = true;
    } else if (campingName || campingAddress) {
      // Fuzzy Matching
      const nameMatch = campingName ? nameFuse.search(campingName) : [];
      const addressMatch = campingAddress ? addressFuse.search(campingAddress) : [];

      if (
        (nameMatch.length > 0 && nameMatch[0].score! < 0.3) ||
        (addressMatch.length > 0 && addressMatch[0].score! < 0.3)
      ) {
        isMatched = true;
      }
    }

    matchMap.set(index + 1, isMatched);
  });

  return matchMap;
}

// 문자열 유사도 계산 (Levenshtein Distance 기반)
export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
