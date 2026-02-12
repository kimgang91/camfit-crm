import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          캠핏 영업 CRM 관리 시스템
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/list"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">캠핑장 리스트</h2>
            <p className="text-gray-600">
              캠핑장 DB를 확인하고 MD 컨택 정보를 입력하세요.
            </p>
          </Link>
          
          <Link
            href="/dashboard"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">대시보드</h2>
            <p className="text-gray-600">
              MD별 활동 현황과 통계를 확인하세요.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
