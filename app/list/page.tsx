'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface CampingItem {
  id: number;
  지역?: string;
  주소?: string;
  캠핑장명?: string;
  연락처?: string;
  운영상태?: string;
  유형?: string;
  예약시스템1?: string;
  예약시스템2?: string;
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
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    return campingList.filter((item) => {
      // 필터 적용
      if (filters.지역 && item.지역 !== filters.지역) return false;
      if (filters.운영상태 && item.운영상태 !== filters.운영상태) return false;
      if (filters.유형 && item.유형 !== filters.유형) return false;
      if (filters.예약시스템 && 
          item.예약시스템1 !== filters.예약시스템 && 
          item.예약시스템2 !== filters.예약시스템) return false;
      
      // 검색어 필터
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !item.캠핑장명?.toLowerCase().includes(searchLower) &&
          !item.주소?.toLowerCase().includes(searchLower)
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

  const handleSaveContact = async (campingId: number) => {
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
      fetchData();
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
    return Array.from(new Set(campingList.map((item) => item[key]).filter(Boolean)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            캠핑장 리스트
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              엑셀 다운로드
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              홈으로
            </Link>
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">지역</label>
              <select
                value={filters.지역}
                onChange={(e) => setFilters({ ...filters, 지역: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">전체</option>
                {uniqueValues('지역').map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">운영상태</label>
              <select
                value={filters.운영상태}
                onChange={(e) => setFilters({ ...filters, 운영상태: e.target.value })}
                className="w-full p-2 border rounded"
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
              <label className="block text-sm font-medium mb-1">유형</label>
              <select
                value={filters.유형}
                onChange={(e) => setFilters({ ...filters, 유형: e.target.value })}
                className="w-full p-2 border rounded"
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
              <label className="block text-sm font-medium mb-1">검색</label>
              <input
                type="text"
                placeholder="캠핑장명/주소"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">MD 이름</label>
              <input
                type="text"
                placeholder="MD 이름"
                value={filters.mdName}
                onChange={(e) => setFilters({ ...filters, mdName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">결과</label>
              <select
                value={filters.result}
                onChange={(e) => setFilters({ ...filters, result: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">전체</option>
                {RESULT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="excludeCampfit"
                checked={filters.excludeCampfit}
                onChange={(e) => setFilters({ ...filters, excludeCampfit: e.target.checked, onlyNonCampfit: false })}
                className="w-4 h-4"
              />
              <label htmlFor="excludeCampfit" className="text-sm">
                입점 업체 제외
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="onlyNonCampfit"
                checked={filters.onlyNonCampfit}
                onChange={(e) => setFilters({ ...filters, onlyNonCampfit: e.target.checked, excludeCampfit: false })}
                className="w-4 h-4"
              />
              <label htmlFor="onlyNonCampfit" className="text-sm">
                미입점만 보기
              </label>
            </div>
          </div>
        </div>

        {/* 리스트 테이블 */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">지역</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">주소</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">캠핑장명</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">연락처</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">운영상태</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">유형</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">예약시스템1</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">예약시스템2</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">입점여부</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">컨택정보</th>
                  <th className="p-2 text-left text-xs md:text-sm font-semibold whitespace-nowrap">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((item) => {
                    const contact = getContactForItem(item.id);
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-xs md:text-sm whitespace-nowrap">{item.지역 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm max-w-xs truncate">{item.주소 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm font-medium whitespace-nowrap">{item.캠핑장명 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm whitespace-nowrap">{item.연락처 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm whitespace-nowrap">{item.운영상태 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm whitespace-nowrap">{item.유형 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm whitespace-nowrap">{item.예약시스템1 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm whitespace-nowrap">{item.예약시스템2 || '-'}</td>
                        <td className="p-2 text-xs md:text-sm whitespace-nowrap">
                          {item.isCampfitMember ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              입점
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              미입점
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-xs md:text-sm">
                          {contact ? (
                            <div className="text-xs">
                              <div className="whitespace-nowrap">MD: {contact.mdName}</div>
                              <div className="whitespace-nowrap">결과: {contact.result}</div>
                              <div className="whitespace-nowrap">일자: {contact.contactDate}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <button
                            onClick={() => setEditingId(item.id)}
                            className="px-2 md:px-3 py-1 bg-blue-500 text-white rounded text-xs md:text-sm hover:bg-blue-600"
                          >
                            컨택입력
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-gray-500">
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 컨택 입력 모달 */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">MD 컨택 정보 입력</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">MD 이름</label>
                  <input
                    type="text"
                    value={contactForm.mdName}
                    onChange={(e) => setContactForm({ ...contactForm, mdName: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="MD 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">결과</label>
                  <select
                    value={contactForm.result}
                    onChange={(e) => {
                      const newForm = { ...contactForm, result: e.target.value };
                      if (e.target.value !== '거절') {
                        newForm.rejectionReason = '';
                      }
                      setContactForm(newForm);
                    }}
                    className="w-full p-2 border rounded"
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
                    <label className="block text-sm font-medium mb-1">거절 사유</label>
                    <select
                      value={contactForm.rejectionReason}
                      onChange={(e) => setContactForm({ ...contactForm, rejectionReason: e.target.value })}
                      className="w-full p-2 border rounded"
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
                  <label className="block text-sm font-medium mb-1">내용</label>
                  <textarea
                    value={contactForm.content}
                    onChange={(e) => setContactForm({ ...contactForm, content: e.target.value })}
                    className="w-full p-2 border rounded"
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
                  className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={() => handleSaveContact(editingId)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
