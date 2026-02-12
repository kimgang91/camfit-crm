'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';

interface CampingItem {
  id: number;
  rowNumber?: number;
  '구 분'?: string;
  '지역(광역)'?: string;
  '지역(시/군/리)'?: string;
  '주소'?: string;
  '캠핑장명'?: string;
  '연락처'?: string;
  '운영상태'?: string;
  '컨택MD'?: string;
  '최초컨택일'?: string;
  '최근컨택일'?: string;
  '내용'?: string;
  '유형'?: string;
  '예약시스템1'?: string;
  '예약시스템2'?: string;
  '예약시스템3'?: string;
  '네이버연동 업체'?: string;
  '홈페이지'?: string;
  '비고'?: string;
  isCampfitMember?: boolean;
}

interface ContactInfo {
  campingId: number;
  mdName: string;
  result: string;
  rejectionReason?: string;
  content: string;
  contactDate: string;
  followUpDate?: string; // 재연락 예정일
  lastContactDate?: string; // 최종 컨택일
  md입력예약시스템1?: string; // MD가 입력한 예약시스템1
  md입력예약시스템2?: string; // MD가 입력한 예약시스템2
  입점플랜?: string; // 입점 플랜명 (쉼표로 구분된 문자열)
}

const RESULT_OPTIONS = ['부재', '검토(재연락)', '입점(신규)', '거절(WHY)', '기타(내용입력)'];
const REJECTION_REASONS = ['수수료', '기능불만', '서비스불만', '현재만족', '약정계약', '기타'];

export default function ListPage() {
  const [campingList, setCampingList] = useState<CampingItem[]>([]);
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    지역: '',
    운영상태: '',
    유형: '',
    예약시스템: '', // DB의 예약시스템
    md입력예약시스템: '', // MD가 입력한 예약시스템
    mdName: '',
    result: '',
    rejectionReason: '',
    search: '',
    입점여부: '', // 전체, 미입점만, 입점만
    followUpDateFrom: '', // 재연락 예정일 시작
    followUpDateTo: '', // 재연락 예정일 종료
    daysSinceContactMin: '', // 경과일 최소
    daysSinceContactMax: '', // 경과일 최대
  });

  const [contactForm, setContactForm] = useState({
    mdName: '',
    result: '',
    rejectionReason: '',
    content: '',
    followUpDate: '', // 재연락 예정일
    입점플랜: [] as string[], // 입점 플랜명 (중복 선택 가능)
    // 데이터 보완 (별도 섹션)
    연락처: '',
    운영상태: '',
    유형: '',
    예약시스템1: '',
    예약시스템2: '',
  });

  const OPERATION_STATUS_OPTIONS = ['운영중', '폐업', '미확인', '무관업체'];
  const TYPE_OPTIONS = ['오토캠핑', '글램핑', '카라반', '펜션', '캠프닉', '기타'];
  const RESERVATION_SYSTEM_OPTIONS = ['땡큐캠핑', '캠핑톡', '네이버', '그래가', '자체예약', '떠나요', '야놀자', '여기어때', '온다', '기타'];

  // 컨택 히스토리 모달
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [contactHistory, setContactHistory] = useState<ContactInfo[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PER_PAGE = 5;

  const PLAN_OPTIONS = ['안심취소', '캠핑케어', '이지캠핑', '파트너', '오토플랜', '베이직'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [campingRes, contactsRes] = await Promise.all([
        fetch('/api/camping'),
        fetch('/api/contacts'),
      ]);

      // 응답 상태 확인
      if (!campingRes.ok) {
        const errorData = await campingRes.json().catch(() => ({}));
        console.error('Camping API error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${campingRes.status}`);
      }

      if (!contactsRes.ok) {
        const errorData = await contactsRes.json().catch(() => ({}));
        console.error('Contacts API error:', errorData);
        // contacts는 선택적이므로 에러가 나도 계속 진행
      }

      const campingData = await campingRes.json().catch(() => ({ data: [] }));
      const contactsData = await contactsRes.json().catch(() => ({ data: [] }));

      setCampingList(campingData.data || []);
      setContacts(contactsData.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // 에러가 발생해도 빈 배열로 설정하여 앱이 크래시되지 않도록
      setCampingList([]);
      setContacts([]);
      // alert는 사용자 경험을 해칠 수 있으므로 제거하거나 조건부로 표시
      if (error.message && !error.message.includes('HTTP error')) {
        console.warn('Data fetch warning:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 최근 컨택 정보 가져오기 (가장 최근 것)
  const getContactForItem = (id: number): ContactInfo | undefined => {
    const itemContacts = contacts
      .filter((c) => c.campingId === id)
      .sort((a, b) => {
        const dateA = a.lastContactDate || a.contactDate;
        const dateB = b.lastContactDate || b.contactDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    return itemContacts[0];
  };

  // 모든 컨택 히스토리 가져오기 (최신순)
  const getContactHistoryForItem = (id: number): ContactInfo[] => {
    return contacts
      .filter((c) => c.campingId === id)
      .sort((a, b) => {
        const dateA = a.lastContactDate || a.contactDate;
        const dateB = b.lastContactDate || b.contactDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  };

  // 컨택 후 경과일 계산
  const getDaysSinceContact = (contactDate?: string): number | null => {
    if (!contactDate) return null;
    try {
      const date = parseISO(contactDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return differenceInDays(today, date);
    } catch {
      return null;
    }
  };

  // 경과일 색상 클래스
  const getDaysSinceContactColor = (days: number | null): string => {
    if (days === null) return 'text-slate-400';
    if (days <= 3) return 'text-slate-700';
    if (days <= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredList = useMemo(() => {
    if (!campingList || campingList.length === 0) {
      return [];
    }

    return campingList.filter((item) => {
      if (!item) return false;

      // 필터 적용
      if (filters.지역 && item['지역(광역)'] !== filters.지역) return false;
      if (filters.운영상태 && item['운영상태'] !== filters.운영상태) return false;
      if (filters.유형 && item['유형'] !== filters.유형) return false;
      if (filters.예약시스템 && 
          item['예약시스템1'] !== filters.예약시스템 && 
          item['예약시스템2'] !== filters.예약시스템 &&
          item['예약시스템3'] !== filters.예약시스템) return false;
      
      // 검색어 필터
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const campingName = item['캠핑장명']?.toLowerCase() || '';
        const address = item['주소']?.toLowerCase() || '';
        if (!campingName.includes(searchLower) && !address.includes(searchLower)) {
          return false;
        }
      }

      // 입점여부 필터
      if (filters.입점여부 === '미입점만' && item.isCampfitMember) return false;
      if (filters.입점여부 === '입점만' && !item.isCampfitMember) return false;

      // MD 이름 및 결과 필터
      const contact = getContactForItem(item.id);
      if (filters.mdName && contact?.mdName !== filters.mdName) return false;
      if (filters.result && contact?.result !== filters.result) return false;
      if (filters.rejectionReason && contact?.rejectionReason !== filters.rejectionReason) return false;

      // MD가 입력한 예약시스템 필터
      if (filters.md입력예약시스템) {
        const md입력시스템1 = contact?.md입력예약시스템1 || '';
        const md입력시스템2 = contact?.md입력예약시스템2 || '';
        const filterLower = filters.md입력예약시스템.toLowerCase();
        if (
          !md입력시스템1.toLowerCase().includes(filterLower) &&
          !md입력시스템2.toLowerCase().includes(filterLower)
        ) {
          return false;
        }
      }

      // 재연락 예정일 필터
      if (filters.followUpDateFrom || filters.followUpDateTo) {
        const followUpDate = contact?.followUpDate;
        if (!followUpDate) return false;
        try {
          const followUp = parseISO(followUpDate);
          if (filters.followUpDateFrom) {
            const from = parseISO(filters.followUpDateFrom);
            if (isBefore(followUp, from)) return false;
          }
          if (filters.followUpDateTo) {
            const to = parseISO(filters.followUpDateTo);
            if (isAfter(followUp, to)) return false;
          }
        } catch {
          return false;
        }
      }

      // 컨택 후 경과일 필터
      if (filters.daysSinceContactMin || filters.daysSinceContactMax) {
        const days = getDaysSinceContact(contact?.lastContactDate || contact?.contactDate);
        if (days === null) return false;
        if (filters.daysSinceContactMin) {
          const min = parseInt(filters.daysSinceContactMin);
          if (days < min) return false;
        }
        if (filters.daysSinceContactMax) {
          const max = parseInt(filters.daysSinceContactMax);
          if (days > max) return false;
        }
      }

      return true;
    });
  }, [campingList, filters, contacts]);

  const handleSaveContact = async (campingId: number, rowNumber?: number) => {
    if (!contactForm.mdName || !contactForm.result) {
      alert('MD 이름과 결과를 입력해주세요.');
      return;
    }

    // 검토(재연락) 선택 시 예정일 필수
    if (contactForm.result === '검토(재연락)' && !contactForm.followUpDate) {
      alert('검토(재연락)를 선택하셨습니다. 재연락 예정일을 입력해주세요.');
      return;
    }

    try {
      const item = campingList.find(c => c.id === campingId);
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campingId,
          rowNumber,
          mdName: contactForm.mdName,
          result: contactForm.result,
          rejectionReason: contactForm.rejectionReason,
          content: contactForm.content,
          followUpDate: contactForm.followUpDate,
          contactDate: format(new Date(), 'yyyy-MM-dd'),
          // 공란 데이터 보완 (입력된 값이 있으면 업데이트)
          연락처: contactForm.연락처 || undefined,
          운영상태: contactForm.운영상태 || undefined,
          유형: contactForm.유형 || undefined,
          예약시스템1: contactForm.예약시스템1 || undefined,
          예약시스템2: contactForm.예약시스템2 || undefined,
          // 입점 플랜명
          입점플랜: contactForm.입점플랜.length > 0 ? contactForm.입점플랜.join(', ') : undefined,
        }),
      });

      setContactForm({
        mdName: '',
        result: '',
        rejectionReason: '',
        content: '',
        followUpDate: '',
        입점플랜: [],
        연락처: '',
        운영상태: '',
        유형: '',
        예약시스템1: '',
        예약시스템2: '',
      });
      setEditingId(null);
      await fetchData();
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campfit-crm-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  const uniqueValues = (key: keyof CampingItem) => {
    return Array.from(new Set(campingList.map((item) => item[key]).filter(Boolean))).sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-slate-600">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                캠핑장 영업 관리
              </h1>
              <p className="text-slate-600">총 {filteredList.length}개 업체</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? '새로고침 중...' : '새로고침'}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                엑셀 다운로드
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all shadow-sm"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>

        {/* 재연락 관리 섹션 */}
        {(() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const sevenDaysLater = new Date(today);
          sevenDaysLater.setDate(today.getDate() + 7);
          
          const upcomingFollowUps = contacts
            .filter(c => {
              if (!c.followUpDate) return false;
              try {
                const followUp = parseISO(c.followUpDate);
                followUp.setHours(0, 0, 0, 0);
                return followUp >= today && followUp <= sevenDaysLater;
              } catch {
                return false;
              }
            })
            .sort((a, b) => {
              if (!a.followUpDate || !b.followUpDate) return 0;
              try {
                return parseISO(a.followUpDate).getTime() - parseISO(b.followUpDate).getTime();
              } catch {
                return 0;
              }
            })
            .map(c => {
              const item = campingList.find(camp => camp.id === c.campingId);
              return { ...c, item };
            })
            .filter(c => c.item);

          if (upcomingFollowUps.length === 0) return null;

          return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-bold text-amber-900">7일 내 재연락 예정 캠핑장</h2>
                <span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-semibold">
                  {upcomingFollowUps.length}건
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {upcomingFollowUps.map((c) => (
                  <div key={c.campingId} className="bg-white rounded-lg p-3 border border-amber-200 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{c.item?.['캠핑장명'] || '-'}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          MD: {c.mdName} | 예정일: {c.followUpDate}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const item = campingList.find(camp => camp.id === c.campingId);
                          setEditingId(c.campingId);
                          // 기존 컨택 정보로 폼 초기화
                          setContactForm({
                            mdName: c.mdName,
                            result: c.result,
                            rejectionReason: c.rejectionReason || '',
                            content: c.content,
                            followUpDate: c.followUpDate || '',
                            입점플랜: c.입점플랜 ? c.입점플랜.split(', ').filter(Boolean) : [],
                            연락처: item?.['연락처'] || '',
                            운영상태: item?.['운영상태'] || '',
                            유형: item?.['유형'] || '',
                            예약시스템1: item?.['예약시스템1'] || '',
                            예약시스템2: item?.['예약시스템2'] || '',
                          });
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        수정
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 필터 영역 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">지역(광역)</label>
              <select
                value={filters.지역}
                onChange={(e) => setFilters({ ...filters, 지역: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">전체</option>
                {uniqueValues('지역(광역)').map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">운영상태</label>
              <select
                value={filters.운영상태}
                onChange={(e) => setFilters({ ...filters, 운영상태: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">전체</option>
                {uniqueValues('운영상태').map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">유형</label>
              <select
                value={filters.유형}
                onChange={(e) => setFilters({ ...filters, 유형: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">전체</option>
                {uniqueValues('유형').map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">검색</label>
              <input
                type="text"
                placeholder="캠핑장명/주소"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">입점여부</label>
              <select
                value={filters.입점여부}
                onChange={(e) => setFilters({ ...filters, 입점여부: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">전체</option>
                <option value="미입점만">미입점만</option>
                <option value="입점만">입점만</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">MD 입력 예약시스템</label>
              <input
                type="text"
                placeholder="MD가 입력한 예약시스템"
                value={filters.md입력예약시스템}
                onChange={(e) => setFilters({ ...filters, md입력예약시스템: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">재연락 예정일 (시작)</label>
              <input
                type="date"
                value={filters.followUpDateFrom}
                onChange={(e) => setFilters({ ...filters, followUpDateFrom: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">재연락 예정일 (종료)</label>
              <input
                type="date"
                value={filters.followUpDateTo}
                onChange={(e) => setFilters({ ...filters, followUpDateTo: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">경과일 (최소)</label>
              <input
                type="number"
                min="0"
                value={filters.daysSinceContactMin}
                onChange={(e) => setFilters({ ...filters, daysSinceContactMin: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="일"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">경과일 (최대)</label>
              <input
                type="number"
                min="0"
                value={filters.daysSinceContactMax}
                onChange={(e) => setFilters({ ...filters, daysSinceContactMax: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="일"
              />
            </div>
          </div>
        </div>

        {/* 리스트 테이블 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">지역</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">캠핑장명</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">연락처</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">운영상태</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">유형</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">예약시스템</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">입점여부</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">컨택정보</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">경과일</th>
                  <th className="p-3 text-left text-sm font-semibold whitespace-nowrap">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => {
                    const contact = getContactForItem(item.id);
                    return (
                      <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                        <td className="p-3 text-sm text-slate-700">
                          <div className="font-medium">{item['지역(광역)'] || '-'}</div>
                          <div className="text-xs text-slate-500">{item['지역(시/군/리)'] || ''}</div>
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap">
                          <div className="font-semibold text-slate-900 truncate max-w-[200px]" title={item['캠핑장명'] || '-'}>
                            {item['캠핑장명'] || '-'}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={item['주소'] || ''}>
                            {item['주소'] || ''}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-700 whitespace-nowrap truncate max-w-[120px]" title={item['연락처'] || '-'}>
                          {item['연락처'] || '-'}
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium truncate max-w-[100px] ${
                            item['운영상태'] === '운영중' 
                              ? 'bg-green-100 text-green-800' 
                              : item['운영상태'] === '폐업'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`} title={item['운영상태'] || '-'}>
                            {item['운영상태'] || '-'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-slate-700 whitespace-nowrap truncate max-w-[100px]" title={item['유형'] || '-'}>
                          {item['유형'] || '-'}
                        </td>
                        <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {item['예약시스템1'] && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded truncate max-w-[120px]" title={item['예약시스템1']}>
                                {item['예약시스템1']}
                              </span>
                            )}
                            {item['예약시스템2'] && (
                              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded truncate max-w-[120px]" title={item['예약시스템2']}>
                                {item['예약시스템2']}
                              </span>
                            )}
                            {item['예약시스템3'] && (
                              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded truncate max-w-[120px]" title={item['예약시스템3']}>
                                {item['예약시스템3']}
                              </span>
                            )}
                            {!item['예약시스템1'] && !item['예약시스템2'] && !item['예약시스템3'] && <span className="text-slate-400">-</span>}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          {item.isCampfitMember ? (
                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs font-semibold shadow-sm">
                              입점
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                              미입점
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap">
                          {contact ? (
                            <div className="text-xs space-y-1">
                              <div className="font-medium text-slate-900 truncate max-w-[150px]" title={`MD: ${contact.mdName}`}>
                                MD: {contact.mdName}
                              </div>
                              <div className="text-slate-600 truncate max-w-[150px]" title={`결과: ${contact.result}`}>
                                결과: {contact.result}
                              </div>
                              <div className="text-slate-500 truncate max-w-[150px]" title={`일자: ${contact.contactDate}`}>
                                일자: {contact.contactDate}
                              </div>
                              {contact.followUpDate && (
                                <div className="text-blue-600 font-medium truncate max-w-[150px]" title={`재연락: ${contact.followUpDate}`}>
                                  재연락: {contact.followUpDate}
                                </div>
                              )}
                              {getContactHistoryForItem(item.id).length > 0 && (
                                <button
                                  onClick={() => {
                                    const history = getContactHistoryForItem(item.id);
                                    setSelectedHistoryId(item.id);
                                    setContactHistory(history);
                                    setHistoryPage(1);
                                  }}
                                  className="mt-1 text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  히스토리 ({getContactHistoryForItem(item.id).length})
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap">
                          {(() => {
                            const days = getDaysSinceContact(contact?.lastContactDate || contact?.contactDate);
                            if (days === null) return <span className="text-slate-400">-</span>;
                            return (
                              <span className={`font-semibold ${getDaysSinceContactColor(days)}`}>
                                {days}일
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              // 기존 컨택 정보가 있으면 폼에 채우기
                              if (contact) {
                                setContactForm({
                                  mdName: contact.mdName,
                                  result: contact.result,
                                  rejectionReason: contact.rejectionReason || '',
                                  content: contact.content,
                                  followUpDate: contact.followUpDate || '',
                                  입점플랜: contact.입점플랜 ? contact.입점플랜.split(', ').filter(Boolean) : [],
                                  연락처: item['연락처'] || '',
                                  운영상태: item['운영상태'] || '',
                                  유형: item['유형'] || '',
                                  예약시스템1: item['예약시스템1'] || '',
                                  예약시스템2: item['예약시스템2'] || '',
                                });
                              } else {
                                setContactForm({
                                  mdName: '',
                                  result: '',
                                  rejectionReason: '',
                                  content: '',
                                  followUpDate: '',
                                  입점플랜: [],
                                  연락처: item['연락처'] || '',
                                  운영상태: item['운영상태'] || '',
                                  유형: item['유형'] || '',
                                  예약시스템1: item['예약시스템1'] || '',
                                  예약시스템2: item['예약시스템2'] || '',
                                });
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
                          >
                            컨택입력
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p>데이터가 없습니다.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 컨택 히스토리 모달 */}
        {selectedHistoryId && contactHistory.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  컨택 히스토리 ({contactHistory.length}건)
                </h2>
                <button
                  onClick={() => {
                    setSelectedHistoryId(null);
                    setContactHistory([]);
                    setHistoryPage(1);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                {contactHistory
                  .slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE)
                  .map((contact, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">{contact.mdName}</div>
                          <div className="text-sm text-slate-600 mt-1">
                            {contact.contactDate} | {contact.result}
                            {contact.rejectionReason && ` (${contact.rejectionReason})`}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          #{contactHistory.length - (historyPage - 1) * HISTORY_PER_PAGE - index}
                        </span>
                      </div>
                      {contact.content && (
                        <div className="text-sm text-slate-700 mt-2 p-2 bg-slate-50 rounded">
                          {contact.content}
                        </div>
                      )}
                      {contact.followUpDate && (
                        <div className="text-xs text-blue-600 mt-2">
                          재연락 예정일: {contact.followUpDate}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* 페이지네이션 */}
              {contactHistory.length > HISTORY_PER_PAGE && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                    disabled={historyPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    이전
                  </button>
                  <span className="text-sm text-slate-600">
                    {historyPage} / {Math.ceil(contactHistory.length / HISTORY_PER_PAGE)}
                  </span>
                  <button
                    onClick={() => setHistoryPage(Math.min(Math.ceil(contactHistory.length / HISTORY_PER_PAGE), historyPage + 1))}
                    disabled={historyPage >= Math.ceil(contactHistory.length / HISTORY_PER_PAGE)}
                    className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 컨택 입력 모달 */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">MD 컨택 정보 입력</h2>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setContactForm({
                      mdName: '',
                      result: '',
                      rejectionReason: '',
                      content: '',
                      followUpDate: '',
                      연락처: '',
                      운영상태: '',
                      유형: '',
                      예약시스템1: '',
                      예약시스템2: '',
                    });
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">MD 이름</label>
                  <input
                    type="text"
                    value={contactForm.mdName}
                    onChange={(e) => setContactForm({ ...contactForm, mdName: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="MD 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">결과</label>
                  <select
                    value={contactForm.result}
                    onChange={(e) => {
                      const newForm = { ...contactForm, result: e.target.value };
                      if (e.target.value !== '거절(WHY)') {
                        newForm.rejectionReason = '';
                      }
                      setContactForm(newForm);
                    }}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">선택하세요</option>
                    {RESULT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {contactForm.result === '거절(WHY)' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">거절 사유</label>
                    <select
                      value={contactForm.rejectionReason}
                      onChange={(e) => setContactForm({ ...contactForm, rejectionReason: e.target.value })}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="">선택하세요</option>
                      {REJECTION_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {contactForm.result === '검토(재연락)' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      재연락 예정일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={contactForm.followUpDate}
                      onChange={(e) => setContactForm({ ...contactForm, followUpDate: e.target.value })}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                )}

                {contactForm.result === '입점(신규)' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      입점 플랜명 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {PLAN_OPTIONS.map((plan) => (
                        <label key={plan} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contactForm.입점플랜.includes(plan)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setContactForm({
                                  ...contactForm,
                                  입점플랜: [...contactForm.입점플랜, plan],
                                });
                              } else {
                                setContactForm({
                                  ...contactForm,
                                  입점플랜: contactForm.입점플랜.filter((p) => p !== plan),
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{plan}</span>
                        </label>
                      ))}
                      {contactForm.입점플랜.length === 0 && (
                        <p className="text-xs text-red-500">최소 1개 이상 선택해주세요.</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">내용</label>
                  <textarea
                    value={contactForm.content}
                    onChange={(e) => setContactForm({ ...contactForm, content: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={4}
                    placeholder="컨택 내용을 입력하세요"
                  />
                </div>

                {/* 데이터 보완 섹션 */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">데이터 보완</h3>
                  <p className="text-xs text-slate-500 mb-3">컨택 과정에서 확보한 최신 정보를 입력하세요.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-slate-600">연락처</label>
                      <input
                        type="text"
                        value={contactForm.연락처}
                        onChange={(e) => setContactForm({ ...contactForm, 연락처: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                        placeholder="연락처 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-slate-600">운영상태</label>
                      <select
                        value={contactForm.운영상태}
                        onChange={(e) => setContactForm({ ...contactForm, 운영상태: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                      >
                        <option value="">선택하세요</option>
                        {OPERATION_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-slate-600">유형</label>
                      <select
                        value={contactForm.유형}
                        onChange={(e) => setContactForm({ ...contactForm, 유형: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                      >
                        <option value="">선택하세요</option>
                        {TYPE_OPTIONS.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-slate-600">예약시스템1</label>
                      <select
                        value={contactForm.예약시스템1}
                        onChange={(e) => setContactForm({ ...contactForm, 예약시스템1: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                      >
                        <option value="">선택하세요</option>
                        {RESERVATION_SYSTEM_OPTIONS.map((system) => (
                          <option key={system} value={system}>
                            {system}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-slate-600">예약시스템2</label>
                      <select
                        value={contactForm.예약시스템2}
                        onChange={(e) => setContactForm({ ...contactForm, 예약시스템2: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                      >
                        <option value="">선택하세요</option>
                        {RESERVATION_SYSTEM_OPTIONS.map((system) => (
                          <option key={system} value={system}>
                            {system}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(null);
                    setContactForm({
                      mdName: '',
                      result: '',
                      rejectionReason: '',
                      content: '',
                      followUpDate: '',
                      연락처: '',
                      운영상태: '',
                      유형: '',
                      예약시스템1: '',
                      예약시스템2: '',
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    const item = campingList.find(c => c.id === editingId);
                    handleSaveContact(editingId, item?.rowNumber);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
