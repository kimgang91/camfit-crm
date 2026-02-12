# 환경 변수 설정 단계별 가이드

## 📋 준비물

1. Google Cloud Console에서 다운로드한 JSON 키 파일
2. 텍스트 에디터 (메모장, VS Code 등)

---

## 1단계: JSON 파일에서 정보 추출

### JSON 파일 열기
다운로드한 JSON 파일을 텍스트 에디터로 엽니다.

### 필요한 정보 찾기
JSON 파일에서 다음 두 가지 정보를 찾아 복사하세요:

1. **client_email** (서비스 계정 이메일)
   - 찾기: `"client_email": "여기에_이메일"`
   - 예시: `campfit-sheets-api@my-project-123456.iam.gserviceaccount.com`
   - ⚠️ 따옴표는 제외하고 이메일 주소만 복사

2. **private_key** (전체 개인 키)
   - 찾기: `"private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - ⚠️ **전체 키를 복사하세요** (-----BEGIN부터 -----END까지)
   - 줄바꿈(`\n`)이 포함된 전체 키를 복사

---

## 2단계: 로컬 개발용 (.env.local) 설정

### 파일 위치
`campfit-crm/.env.local` 파일을 엽니다.

### 내용 입력
다음 형식으로 입력하세요:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=여기에_client_email_붙여넣기
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n여기에_전체_키_붙여넣기\n-----END PRIVATE KEY-----\n"
```

### 실제 예시
```env
GOOGLE_SHEETS_CLIENT_EMAIL=campfit-sheets-api@my-project-123456.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2b01ZghM9FRw72c111aU7BQ2P9X7Nh8l2Y5S3qTzvJfZP3qH2\n... (전체 키 내용) ...\n-----END PRIVATE KEY-----\n"
```

### ⚠️ 중요 사항
- `PRIVATE_KEY`는 **따옴표로 감싸야** 합니다
- 줄바꿈(`\n`)을 그대로 유지하세요
- JSON 파일에서 전체 키를 복사하세요

---

## 3단계: Vercel 환경 변수 설정

### 3-1. Vercel 대시보드 접속
1. https://vercel.com 접속
2. 로그인 후 프로젝트 선택

### 3-2. 환경 변수 페이지로 이동
1. 프로젝트 대시보드에서 **Settings** 클릭
2. 좌측 메뉴에서 **Environment Variables** 클릭

### 3-3. 첫 번째 변수 추가
1. **"Add New"** 버튼 클릭
2. 다음 정보 입력:
   - **Key**: `GOOGLE_SHEETS_CLIENT_EMAIL`
   - **Value**: JSON 파일의 `client_email` 값 (따옴표 없이)
   - **Environment**: 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
     - 모두 체크
3. **Save** 클릭

### 3-4. 두 번째 변수 추가
1. 다시 **"Add New"** 버튼 클릭
2. 다음 정보 입력:
   - **Key**: `GOOGLE_SHEETS_PRIVATE_KEY`
   - **Value**: JSON 파일의 `private_key` 값 (전체, 줄바꿈 포함)
     - ⚠️ **따옴표 없이 입력하세요!**
     - 전체 키를 그대로 붙여넣기
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
     - 모두 체크
3. **Save** 클릭

### 3-5. 재배포
환경 변수 추가 후:
- 자동으로 재배포가 시작되거나
- 수동으로 **Deployments** 탭에서 **Redeploy** 클릭

---

## 4단계: 확인

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
- **원인**: PRIVATE_KEY 형식 오류
- **해결**: 
  - 로컬: 따옴표로 감싸야 함
  - Vercel: 따옴표 없이 입력
  - 줄바꿈(`\n`)이 포함되어 있는지 확인

### "Permission denied" 오류
- **원인**: 스프레드시트 공유 설정 안 됨
- **해결**: 
  1. Google Sheets에서 스프레드시트 열기
  2. "공유" 버튼 클릭
  3. 서비스 계정 이메일 추가 (편집자 권한)
  4. 두 개의 스프레드시트 모두 설정:
     - 캠핑장 DB: https://docs.google.com/spreadsheets/d/1_laE9Yxj-tajY23k36z3Bg2A_Mds8_V2A81DHnrUO68
     - 캠핏 입점 리스트: https://docs.google.com/spreadsheets/d/1PHX-Qyk1KrlB8k9r9hEqUckUuQT3PGfu-vJI1R22XyA

### 환경 변수가 적용되지 않음
- **로컬**: 서버 재시작 (`npm run dev` 중지 후 다시 시작)
- **Vercel**: 재배포 필요

---

## ✅ 체크리스트

- [ ] JSON 파일에서 `client_email` 값 복사
- [ ] JSON 파일에서 `private_key` 전체 값 복사
- [ ] `.env.local` 파일에 두 변수 입력 (로컬 개발용)
- [ ] Vercel에 `GOOGLE_SHEETS_CLIENT_EMAIL` 변수 추가
- [ ] Vercel에 `GOOGLE_SHEETS_PRIVATE_KEY` 변수 추가
- [ ] Vercel에서 Production, Preview, Development 모두 체크
- [ ] Google Sheets 공유 설정 완료
- [ ] 로컬에서 테스트 성공
- [ ] Vercel에서 배포 성공
