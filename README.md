# 캠핏 영업 CRM 관리 시스템

캠핑장 영업 MD들이 사용할 웹/모바일 기반 영업 CRM 관리 페이지입니다.

## 주요 기능

1. **캠핑장 DB 기반 컨택 관리**
   - Google Sheets API 연동
   - 실시간 동기화
   - 리스트 형태로 캠핑장 정보 표시

2. **MD별 영업 활동 추적**
   - MD별 컨택 기록
   - 결과별 통계
   - 월간 입점 전환 순위

3. **입점 전환율 및 거절 사유 데이터 분석**
   - 대시보드를 통한 시각화
   - 거절 사유별 분석
   - 전환율 추적

4. **이미 입점된 업체 자동 필터링**
   - Fuzzy Matching을 통한 자동 매칭
   - 입점 업체 제외 필터

## 기술 스택

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Sheets API
- Recharts (차트 시각화)
- Fuse.js (Fuzzy Matching)

## 설치 및 실행

```bash
npm install
npm run dev
```

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```
GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email@example.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### Google Sheets API 설정 방법

1. **Google Cloud Console에서 프로젝트 생성**
   - https://console.cloud.google.com/ 접속
   - 새 프로젝트 생성

2. **Google Sheets API 활성화**
   - API 및 서비스 > 라이브러리
   - "Google Sheets API" 검색 후 활성화

3. **서비스 계정 생성**
   - API 및 서비스 > 사용자 인증 정보
   - "사용자 인증 정보 만들기" > "서비스 계정" 선택
   - 서비스 계정 이름 입력 후 생성
   - 생성된 서비스 계정의 이메일 주소를 `GOOGLE_SHEETS_CLIENT_EMAIL`에 설정

4. **키 생성**
   - 생성된 서비스 계정 클릭
   - "키" 탭 > "키 추가" > "JSON" 선택
   - 다운로드된 JSON 파일에서 `private_key` 값을 `GOOGLE_SHEETS_PRIVATE_KEY`에 설정
   - `\n` 문자를 실제 줄바꿈으로 변환하거나 그대로 사용 (코드에서 자동 처리)

5. **스프레드시트 공유 설정**
   - Google Sheets에서 스프레드시트 열기
   - "공유" 버튼 클릭
   - 서비스 계정 이메일 주소를 추가하고 "편집자" 권한 부여
   - 두 개의 스프레드시트 모두에 동일하게 설정:
     - 캠핑장 DB: https://docs.google.com/spreadsheets/d/1_laE9Yxj-tajY23k36z3Bg2A_Mds8_V2A81DHnrUO68
     - 캠핏 입점 리스트: https://docs.google.com/spreadsheets/d/1PHX-Qyk1KrlB8k9r9hEqUckUuQT3PGfu-vJI1R22XyA

## 배포

### Vercel 배포

1. **GitHub에 프로젝트 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repository-url
   git push -u origin main
   ```

2. **Vercel에 프로젝트 연결**
   - https://vercel.com 접속
   - "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정

3. **환경 변수 설정**
   - Vercel 대시보드에서 프로젝트 선택
   - Settings > Environment Variables
   - 다음 변수 추가:
     - `GOOGLE_SHEETS_CLIENT_EMAIL`
     - `GOOGLE_SHEETS_PRIVATE_KEY`

4. **배포 완료**
   - 자동으로 배포가 시작됩니다
   - 배포 완료 후 제공된 URL로 접속

### 로컬 개발

```bash
npm install
npm run dev
```

개발 서버는 http://localhost:3000 에서 실행됩니다.

## 주요 기능 설명

### 1. 캠핑장 리스트 페이지 (`/list`)
- Google Sheets에서 캠핑장 데이터를 불러와 표시
- 다양한 필터 기능 (지역, 운영상태, 유형, 예약시스템, 검색 등)
- MD 컨택 정보 입력 (행 단위)
- 입점 여부 자동 표시 (Fuzzy Matching)
- 엑셀 다운로드 기능

### 2. 대시보드 페이지 (`/dashboard`)
- MD별 활동 현황 (일/주/월 단위)
- 결과 비율 분석 (차트 시각화)
- 거절 사유 분석
- 입점전환 MD 순위
- 엑셀 다운로드 기능

### 3. 데이터 저장
- MD 컨택 정보는 Google Sheets의 'MD_Contacts' 시트에 저장됩니다
- 시트가 없으면 자동으로 생성되거나, 수동으로 생성해야 할 수 있습니다

## 주의사항

1. **Google Sheets 시트 구조**
   - 캠핑장 DB 시트의 첫 번째 행은 헤더여야 합니다
   - MD_Contacts 시트는 다음 컬럼을 가져야 합니다:
     - campingId, mdName, result, rejectionReason, content, contactDate

2. **권한 설정**
   - 서비스 계정에 스프레드시트 편집 권한이 있어야 합니다
   - 두 개의 스프레드시트 모두 공유 설정을 확인하세요

3. **데이터 동기화**
   - 데이터는 실시간으로 Google Sheets와 동기화됩니다
   - 변경사항은 즉시 반영됩니다
