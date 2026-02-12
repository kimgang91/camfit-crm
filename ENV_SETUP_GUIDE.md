# 환경 변수 설정 가이드

## 📝 로컬 개발용 (.env.local)

`.env.local` 파일이 이미 생성되어 있습니다. 다음 단계를 따라 정보를 입력하세요:

### 1단계: JSON 파일 열기
다운로드한 JSON 키 파일을 텍스트 에디터로 엽니다.

### 2단계: client_email 복사
JSON 파일에서 `"client_email"` 값을 찾아 복사합니다.
예: `campfit-sheets-api@your-project.iam.gserviceaccount.com`

### 3단계: private_key 복사
JSON 파일에서 `"private_key"` 값을 찾아 복사합니다.
⚠️ **전체 키를 복사하세요** (-----BEGIN부터 -----END까지)

### 4단계: .env.local 파일 수정
`campfit-crm/.env.local` 파일을 열고:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=여기에_client_email_붙여넣기
GOOGLE_SHEETS_PRIVATE_KEY="여기에_private_key_전체_붙여넣기"
```

**예시:**
```env
GOOGLE_SHEETS_CLIENT_EMAIL=campfit-sheets-api@my-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### 5단계: 저장
파일을 저장합니다.

---

## 🌐 Vercel 배포용

Vercel 대시보드에서 환경 변수를 설정해야 합니다:

### 1단계: Vercel 대시보드 접속
- https://vercel.com 접속
- 프로젝트 선택

### 2단계: 환경 변수 추가
1. **Settings** > **Environment Variables** 클릭
2. **"Add New"** 버튼 클릭

### 3단계: 첫 번째 변수 추가
- **Key**: `GOOGLE_SHEETS_CLIENT_EMAIL`
- **Value**: JSON 파일의 `client_email` 값
- **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 체크
- **Save** 클릭

### 4단계: 두 번째 변수 추가
- **Key**: `GOOGLE_SHEETS_PRIVATE_KEY`
- **Value**: JSON 파일의 `private_key` 값 (전체, 줄바꿈 포함)
  - ⚠️ **따옴표 없이 입력하세요!**
  - 전체 키를 그대로 붙여넣기
- **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 체크
- **Save** 클릭

### 5단계: 재배포
환경 변수 추가 후 자동으로 재배포되거나, 수동으로 재배포합니다.

---

## ✅ 확인 방법

### 로컬에서 확인
```bash
cd campfit-crm
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 정상 작동 확인

### Vercel에서 확인
배포 완료 후 제공된 URL로 접속하여 정상 작동 확인

---

## 🐛 문제 해결

### "Invalid credentials" 오류
- PRIVATE_KEY에 줄바꿈(`\n`)이 포함되어 있는지 확인
- 로컬: 따옴표로 감싸야 함
- Vercel: 따옴표 없이 입력

### "Permission denied" 오류
- Google Sheets 공유 설정 확인
- 서비스 계정 이메일로 스프레드시트 공유 확인
