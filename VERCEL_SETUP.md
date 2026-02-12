# Vercel 프로젝트 연결 가이드

## 📋 사전 준비사항

✅ GitHub에 프로젝트가 업로드되어 있어야 합니다
✅ Vercel 계정이 있어야 합니다 (없으면 GitHub 계정으로 가입 가능)

---

## 🚀 단계별 연결 방법

### 1단계: Vercel 접속 및 로그인

1. **Vercel 웹사이트 접속**
   - https://vercel.com 접속
   - 또는 https://vercel.com/login

2. **GitHub 계정으로 로그인**
   - "Continue with GitHub" 버튼 클릭
   - GitHub 인증 완료

---

### 2단계: 새 프로젝트 추가

1. **대시보드에서 프로젝트 추가**
   - Vercel 대시보드 메인 화면에서
   - **"Add New..."** 버튼 클릭
   - 또는 상단의 **"New Project"** 버튼 클릭

2. **GitHub 저장소 선택**
   - GitHub 저장소 목록이 표시됩니다
   - `campfit-crm` 프로젝트를 찾아서 클릭
   - 또는 검색창에서 프로젝트 이름 검색

---

### 3단계: 프로젝트 설정

1. **프로젝트 이름 확인**
   - Project Name: `campfit-crm` (원하는 이름으로 변경 가능)
   - Root Directory: `./campfit-crm` 또는 `.` (프로젝트 구조에 따라)
     - 만약 GitHub 루트에 `campfit-crm` 폴더가 있다면: `./campfit-crm`
     - 만약 GitHub 루트가 바로 프로젝트라면: `.`

2. **Framework Preset 확인**
   - Framework Preset: **Next.js** (자동 감지됨)
   - 자동으로 감지되지 않으면 수동으로 "Next.js" 선택

3. **빌드 설정 확인**
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)

4. **환경 변수 설정 (중요!)**
   - "Environment Variables" 섹션 클릭
   - 다음 변수들을 추가:

   ```
   이름: GOOGLE_SHEETS_CLIENT_EMAIL
   값: your_client_email@example.com
   환경: Production, Preview, Development 모두 체크
   ```

   ```
   이름: GOOGLE_SHEETS_PRIVATE_KEY
   값: -----BEGIN PRIVATE KEY-----
       Your private key here
       -----END PRIVATE KEY-----
   환경: Production, Preview, Development 모두 체크
   ```
   
   ⚠️ **주의사항:**
   - PRIVATE_KEY 값에 줄바꿈(`\n`)이 포함되어야 합니다
   - 전체 키를 따옴표로 감싸지 마세요
   - 각 환경(Production, Preview, Development)에 모두 체크하세요

---

### 4단계: 배포 시작

1. **Deploy 버튼 클릭**
   - 설정 완료 후 하단의 **"Deploy"** 버튼 클릭
   - 배포가 자동으로 시작됩니다

2. **배포 진행 상황 확인**
   - 빌드 로그가 실시간으로 표시됩니다
   - 약 2-3분 정도 소요됩니다

---

### 5단계: 배포 완료 확인

1. **배포 성공 확인**
   - "Congratulations! Your project has been deployed" 메시지 확인
   - 배포된 URL 확인 (예: `https://campfit-crm.vercel.app`)

2. **사이트 접속 테스트**
   - 제공된 URL 클릭하여 사이트 접속
   - 홈 페이지가 정상적으로 표시되는지 확인

---

## 🔧 환경 변수 설정 상세 가이드

### Google Sheets API 인증 정보 가져오기

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/

2. **서비스 계정 확인**
   - 좌측 메뉴 > "IAM 및 관리자" > "서비스 계정"
   - 생성한 서비스 계정 클릭

3. **키 정보 확인**
   - "키" 탭 클릭
   - JSON 키 파일 다운로드 또는 기존 키 확인

4. **환경 변수 값 설정**
   - `client_email`: JSON 파일의 `client_email` 값
   - `private_key`: JSON 파일의 `private_key` 값 (전체, 줄바꿈 포함)

---

## 🐛 문제 해결

### 배포 실패 시

1. **빌드 로그 확인**
   - Vercel 대시보드 > 프로젝트 > "Deployments" 탭
   - 실패한 배포 클릭하여 로그 확인

2. **일반적인 오류**
   - **Module not found**: `package.json`의 dependencies 확인
   - **Build failed**: TypeScript 오류 확인
   - **Environment variable missing**: 환경 변수 설정 확인

### 환경 변수 오류

- **"Invalid credentials"**: 
  - PRIVATE_KEY의 줄바꿈(`\n`) 확인
  - 따옴표 제거 확인
  
- **"Permission denied"**:
  - Google Sheets 공유 설정 확인
  - 서비스 계정 이메일로 스프레드시트 공유 확인

### 사이트가 작동하지 않을 때

1. **브라우저 콘솔 확인**
   - F12 > Console 탭에서 오류 확인

2. **Vercel Functions 로그 확인**
   - Vercel 대시보드 > 프로젝트 > "Functions" 탭
   - API 호출 로그 확인

---

## 📝 추가 설정 (선택사항)

### 커스텀 도메인 연결

1. **도메인 추가**
   - 프로젝트 > Settings > Domains
   - 원하는 도메인 입력
   - DNS 설정 안내에 따라 설정

### 환경별 설정

- **Production**: 실제 운영 환경
- **Preview**: Pull Request마다 자동 생성
- **Development**: 개발 브랜치용

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] GitHub에 프로젝트가 업로드되어 있음
- [ ] Vercel 계정이 연결되어 있음
- [ ] 환경 변수 `GOOGLE_SHEETS_CLIENT_EMAIL` 설정됨
- [ ] 환경 변수 `GOOGLE_SHEETS_PRIVATE_KEY` 설정됨
- [ ] Google Sheets에 서비스 계정 이메일 공유됨
- [ ] 빌드가 성공적으로 완료됨
- [ ] 사이트가 정상적으로 접속됨

---

## 🎉 완료!

배포가 완료되면:
- 자동으로 HTTPS 적용
- 전 세계 CDN으로 빠른 속도
- GitHub에 푸시할 때마다 자동 재배포
- 무료 플랜으로도 충분한 성능 제공

문제가 발생하면 Vercel 대시보드의 로그를 확인하거나, GitHub Issues에 문의하세요!
