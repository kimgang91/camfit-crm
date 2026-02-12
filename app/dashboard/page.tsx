'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ContactInfo {
  campingId: number;
  mdName: string;
  result: string;
  rejectionReason?: string;
  content: string;
  contactDate: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
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

  // 기간 필터링된 데이터
  const filteredContacts = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (period === 'day') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      // month
      const [year, month] = selectedMonth.split('-').map(Number);
      startDate = startOfMonth(new Date(year, month - 1));
      endDate = endOfMonth(new Date(year, month - 1));
    }

    return contacts.filter((contact) => {
      const contactDate = new Date(contact.contactDate);
      return contactDate >= startDate && contactDate <= endDate;
    });
  }, [contacts, period, selectedMonth]);

  // MD별 활동 현황
  const mdActivity = useMemo(() => {
    const activityMap = new Map<string, {
      total: number;
      입점전환: number;
      거절: number;
      미응답: number;
      재연락: number;
    }>();

    filteredContacts.forEach((contact) => {
      if (!activityMap.has(contact.mdName)) {
        activityMap.set(contact.mdName, {
          total: 0,
          입점전환: 0,
          거절: 0,
          미응답: 0,
          재연락: 0,
        });
      }

      const activity = activityMap.get(contact.mdName)!;
      activity.total++;
      if (contact.result in activity) {
        activity[contact.result as keyof typeof activity]++;
      }
    });

    return Array.from(activityMap.entries()).map(([mdName, data]) => ({
      mdName,
      ...data,
    }));
  }, [filteredContacts]);

  // 결과 비율 분석
  const resultRatio = useMemo(() => {
    const total = filteredContacts.length;
    if (total === 0) return [];

    const ratioMap = new Map<string, number>();
    filteredContacts.forEach((contact) => {
      ratioMap.set(contact.result, (ratioMap.get(contact.result) || 0) + 1);
    });

    return Array.from(ratioMap.entries()).map(([result, count]) => ({
      name: result,
      value: count,
      percentage: ((count / total) * 100).toFixed(1),
    }));
  }, [filteredContacts]);

  // 거절 사유 분석
  const rejectionReasons = useMemo(() => {
    const rejected = filteredContacts.filter((c) => c.result === '거절');
    const reasonMap = new Map<string, number>();

    rejected.forEach((contact) => {
      const reason = contact.rejectionReason || '미기재';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    });

    return Array.from(reasonMap.entries())
      .map(([reason, count]) => ({
        name: reason,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredContacts]);

  // 입점전환 MD 순위
  const conversionRanking = useMemo(() => {
    const mdMap = new Map<string, number>();

    filteredContacts
      .filter((c) => c.result === '입점전환')
      .forEach((contact) => {
        mdMap.set(contact.mdName, (mdMap.get(contact.mdName) || 0) + 1);
      });

    return Array.from(mdMap.entries())
      .map(([mdName, count]) => ({ mdName, count }))
      .sort((a, b) => b.count - a.count)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [filteredContacts]);

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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                영업 대시보드
              </h1>
              <p className="text-slate-600">MD별 활동 현황 및 통계 분석</p>
            </div>
            <div className="flex gap-2">
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

        {/* 기간 선택 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="font-semibold text-slate-700">기간 선택:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
              className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="day">일</option>
              <option value="week">주</option>
              <option value="month">월</option>
            </select>
            {period === 'month' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            )}
            <div className="ml-auto px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
              총 {filteredContacts.length}건
            </div>
          </div>
        </div>

        {/* MD별 활동 현황 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">MD별 활동 현황</h2>
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mdActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mdName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="입점전환" fill="#00C49F" />
                <Bar dataKey="거절" fill="#FF8042" />
                <Bar dataKey="미응답" fill="#FFBB28" />
                <Bar dataKey="재연락" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 결과 비율 분석 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">결과 비율 분석</h2>
            <div className="mb-4">
              {resultRatio.map((item) => (
                <div key={item.name} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span>{item.value}건 ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resultRatio}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resultRatio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 거절 사유 분석 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">거절 사유 분석</h2>
            <div className="mb-4">
              {rejectionReasons.length > 0 ? (
                rejectionReasons.map((item) => (
                  <div key={item.name} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span>{item.value}건</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (item.value / rejectionReasons.reduce((sum, r) => sum + r.value, 0)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">거절 데이터가 없습니다.</p>
              )}
            </div>
            {rejectionReasons.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rejectionReasons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 입점전환 MD 순위 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">입점전환 MD 순위</h2>
          {conversionRanking.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="p-4 text-left font-semibold">순위</th>
                    <th className="p-4 text-left font-semibold">MD 이름</th>
                    <th className="p-4 text-left font-semibold">입점전환 건수</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionRanking.map((item) => (
                    <tr
                      key={item.mdName}
                      className={`border-b border-slate-200 hover:bg-blue-50 transition-colors ${
                        item.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 font-semibold' : ''
                      }`}
                    >
                      <td className="p-4">
                        {item.rank === 1 ? (
                          <span className="text-yellow-600 font-bold text-lg">🥇 {item.rank}위</span>
                        ) : (
                          <span className="text-slate-600">{item.rank}위</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-slate-900">{item.mdName}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {item.count}건
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">입점전환 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
