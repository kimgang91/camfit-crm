# 배포 가이드

## 1. GitHub 저장소 생성 및 푸시

```bash
cd campfit-crm
git init
git add .
git commit -m "Initial commit: 캠핏 영업 CRM 시스템"
git branch -M main
git remote add origin https://github.com/your-username/campfit-crm.git
git push -u origin main
```

## 2. Vercel 배포

1. **Vercel 계정 생성 및 로그인**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 가져오기**
   - "Add New..." > "Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: Next.js (자동 감지)
   - Root Directory: `./campfit-crm` (또는 프로젝트 루트)
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **환경 변수 설정**
   - "Environment Variables" 섹션에서 다음 변수 추가:
     ```
     GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email@example.com
     GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
     ```
   - 각 변수에 대해 Production, Preview, Development 모두 선택

5. **배포**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 제공된 URL 확인

## 3. Google Sheets 권한 설정

배포 후에도 Google Sheets에 접근할 수 있도록 다음을 확인하세요:

1. **서비스 계정 이메일 확인**
   - Google Cloud Console > IAM & Admin > Service Accounts
   - 서비스 계정의 이메일 주소 복사

2. **스프레드시트 공유**
   - 캠핑장 DB 스프레드시트 열기
   - "공유" 버튼 클릭
   - 서비스 계정 이메일 추가 (편집자 권한)
   - 캠핏 입점 리스트 스프레드시트에도 동일하게 설정

## 4. 도메인 설정 (선택사항)

1. Vercel 대시보드에서 프로젝트 선택
2. Settings > Domains
3. 원하는 도메인 추가 및 DNS 설정

## 5. 모니터링

- Vercel 대시보드에서 배포 상태 확인
- Functions 탭에서 API 로그 확인
- Analytics 탭에서 사용량 모니터링

## 문제 해결

### 배포 실패
- 환경 변수가 올바르게 설정되었는지 확인
- 빌드 로그에서 오류 확인
- Google Sheets API 권한 확인

### 데이터가 표시되지 않음
- Google Sheets 공유 설정 확인
- 서비스 계정 권한 확인
- 브라우저 콘솔에서 오류 확인

### API 오류
- Vercel Functions 로그 확인
- Google Sheets API 할당량 확인
- 환경 변수 형식 확인 (특히 PRIVATE_KEY의 줄바꿈)
