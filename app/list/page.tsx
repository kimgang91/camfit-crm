'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

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
}

const RESULT_OPTIONS = ['미응답', '재연락', '입점전환', '거절'];
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
    예약시스템: '',
    mdName: '',
    result: '',
    rejectionReason: '',
    search: '',
    excludeCampfit: false,
    onlyNonCampfit: false,
  });

  const [contactForm, setContactForm] = useState({
    mdName: '',
    result: '',
    rejectionReason: '',
    content: '',
  });

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

      const campingData = await campingRes.json();
      const contactsData = await contactsRes.json();

      setCampingList(campingData.data || []);
      setContacts(contactsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredList = useMemo(() => {
    return campingList.filter((item) => {
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
        if (
          !item['캠핑장명']?.toLowerCase().includes(searchLower) &&
          !item['주소']?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // 입점 필터
      if (filters.excludeCampfit && item.isCampfitMember) return false;
      if (filters.onlyNonCampfit && item.isCampfitMember) return false;

      // MD 이름 및 결과 필터
      const contact = getContactForItem(item.id);
      if (filters.mdName && contact?.mdName !== filters.mdName) return false;
      if (filters.result && contact?.result !== filters.result) return false;
      if (filters.rejectionReason && contact?.rejectionReason !== filters.rejectionReason) return false;

      return true;
    });
  }, [campingList, filters, contacts]);

  const getContactForItem = (id: number): ContactInfo | undefined => {
    return contacts.find((c) => c.campingId === id);
  };

  const handleSaveContact = async (campingId: number, rowNumber?: number) => {
    if (!contactForm.mdName || !contactForm.result) {
      alert('MD 이름과 결과를 입력해주세요.');
      return;
    }

    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campingId,
          rowNumber,
          ...contactForm,
          contactDate: format(new Date(), 'yyyy-MM-dd'),
        }),
      });

      setContactForm({
        mdName: '',
        result: '',
        rejectionReason: '',
        content: '',
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

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="excludeCampfit"
                checked={filters.excludeCampfit}
                onChange={(e) => setFilters({ ...filters, excludeCampfit: e.target.checked, onlyNonCampfit: false })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="excludeCampfit" className="text-sm text-slate-700 cursor-pointer">
                입점 업체 제외
              </label>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="onlyNonCampfit"
                checked={filters.onlyNonCampfit}
                onChange={(e) => setFilters({ ...filters, onlyNonCampfit: e.target.checked, excludeCampfit: false })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="onlyNonCampfit" className="text-sm text-slate-700 cursor-pointer">
                미입점만 보기
              </label>
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
                        <td className="p-3 text-sm">
                          <div className="font-semibold text-slate-900">{item['캠핑장명'] || '-'}</div>
                          <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">{item['주소'] || ''}</div>
                        </td>
                        <td className="p-3 text-sm text-slate-700 whitespace-nowrap">{item['연락처'] || '-'}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item['운영상태'] === '운영중' 
                              ? 'bg-green-100 text-green-800' 
                              : item['운영상태'] === '폐업'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {item['운영상태'] || '-'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-slate-700 whitespace-nowrap">{item['유형'] || '-'}</td>
                        <td className="p-3 text-sm text-slate-700">
                          <div className="flex flex-col gap-1">
                            {item['예약시스템1'] && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{item['예약시스템1']}</span>}
                            {item['예약시스템2'] && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{item['예약시스템2']}</span>}
                            {item['예약시스템3'] && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{item['예약시스템3']}</span>}
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
                        <td className="p-3 text-sm">
                          {contact ? (
                            <div className="text-xs space-y-1">
                              <div className="font-medium text-slate-900">MD: {contact.mdName}</div>
                              <div className="text-slate-600">결과: {contact.result}</div>
                              <div className="text-slate-500">일자: {contact.contactDate}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <button
                            onClick={() => setEditingId(item.id)}
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
                    <td colSpan={9} className="p-12 text-center text-slate-500">
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
                      if (e.target.value !== '거절') {
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

                {contactForm.result === '거절' && (
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
