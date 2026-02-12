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
            대시보드
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

        {/* 기간 선택 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="font-medium">기간 선택:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
              className="p-2 border rounded"
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
                className="p-2 border rounded"
              />
            )}
            <div className="text-sm text-gray-600">
              총 {filteredContacts.length}건
            </div>
          </div>
        </div>

        {/* MD별 활동 현황 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">MD별 활동 현황</h2>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">결과 비율 분석</h2>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">거절 사유 분석</h2>
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">입점전환 MD 순위</h2>
          {conversionRanking.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">순위</th>
                    <th className="p-3 text-left">MD 이름</th>
                    <th className="p-3 text-left">입점전환 건수</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionRanking.map((item) => (
                    <tr
                      key={item.mdName}
                      className={`border-b ${
                        item.rank === 1 ? 'bg-yellow-50 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3">
                        {item.rank === 1 ? (
                          <span className="text-yellow-600">🥇 {item.rank}위</span>
                        ) : (
                          `${item.rank}위`
                        )}
                      </td>
                      <td className="p-3">{item.mdName}</td>
                      <td className="p-3">{item.count}건</td>
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
