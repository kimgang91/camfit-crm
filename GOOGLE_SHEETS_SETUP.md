# Google Sheets API 인증 정보 설정 가이드

## 📋 전체 과정 개요

1. Google Cloud Console에서 프로젝트 생성
2. Google Sheets API 활성화
3. 서비스 계정 생성
4. 키(JSON) 생성 및 다운로드
5. 환경 변수 설정
6. 스프레드시트 공유 설정

---

## 1단계: Google Cloud Console 접속 및 프로젝트 생성

### 1-1. Google Cloud Console 접속
1. **웹브라우저에서 접속**
   - https://console.cloud.google.com/ 접속
   - Google 계정으로 로그인

2. **프로젝트 선택 또는 생성**
   - 상단의 프로젝트 선택 드롭다운 클릭
   - "새 프로젝트" 클릭

### 1-2. 새 프로젝트 생성
1. **프로젝트 정보 입력**
   - 프로젝트 이름: `campfit-crm` (원하는 이름)
   - 조직: (선택사항)
   - 위치: (선택사항)

2. **생성 버튼 클릭**
   - "만들기" 버튼 클릭
   - 프로젝트 생성 완료까지 몇 초 소요

3. **프로젝트 선택**
   - 상단 드롭다운에서 방금 생성한 프로젝트 선택

---

## 2단계: Google Sheets API 활성화

### 2-1. API 라이브러리 접속
1. **좌측 메뉴에서 API 접속**
   - "API 및 서비스" > "라이브러리" 클릭
   - 또는 직접 링크: https://console.cloud.google.com/apis/library

2. **Google Sheets API 검색**
   - 검색창에 "Google Sheets API" 입력
   - "Google Sheets API" 선택

### 2-2. API 활성화
1. **API 활성화 버튼 클릭**
   - "사용 설정" 버튼 클릭
   - 활성화 완료까지 몇 초 소요

---

## 3단계: 서비스 계정 생성

### 3-1. 사용자 인증 정보 페이지 접속
1. **좌측 메뉴에서 인증 정보 접속**
   - "API 및 서비스" > "사용자 인증 정보" 클릭
   - 또는 직접 링크: https://console.cloud.google.com/apis/credentials

### 3-2. 서비스 계정 생성
1. **서비스 계정 만들기**
   - 상단의 "+ 사용자 인증 정보 만들기" 클릭
   - "서비스 계정" 선택

2. **서비스 계정 정보 입력**
   - 서비스 계정 이름: `campfit-sheets-api` (원하는 이름)
   - 서비스 계정 ID: 자동 생성됨
   - 서비스 계정 설명: (선택사항) "캠핏 CRM Google Sheets API 접근용"

3. **만들기 버튼 클릭**
   - "만들기" 버튼 클릭

### 3-3. 역할 부여 (선택사항)
1. **역할 선택**
   - "이 서비스 계정에 역할 부여" 섹션
   - 역할: "편집자" 또는 "뷰어" 선택 (또는 건너뛰기)
   - "계속" 클릭

2. **완료**
   - "완료" 버튼 클릭

---

## 4단계: 키(JSON) 생성 및 다운로드

### 4-1. 서비스 계정으로 이동
1. **서비스 계정 목록에서 선택**
   - "사용자 인증 정보" 페이지에서
   - 방금 생성한 서비스 계정 이메일 클릭
   - 또는 "API 및 서비스" > "서비스 계정" 메뉴에서 선택

### 4-2. 키 생성
1. **키 탭으로 이동**
   - 상단의 "키" 탭 클릭

2. **키 추가**
   - "키 추가" 버튼 클릭
   - "새 키 만들기" 선택

3. **키 유형 선택**
   - 키 유형: **"JSON"** 선택
   - "만들기" 버튼 클릭

4. **키 다운로드**
   - JSON 파일이 자동으로 다운로드됩니다
   - 파일명: `프로젝트명-랜덤문자.json`
   - ⚠️ **이 파일을 안전하게 보관하세요!** (다시 다운로드 불가능)

---

## 5단계: JSON 파일에서 정보 추출

### 5-1. JSON 파일 열기
1. **다운로드한 JSON 파일 열기**
   - 텍스트 에디터로 열기 (메모장, VS Code 등)
   - 파일 내용 예시:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "key-id",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
     "client_email": "campfit-sheets-api@your-project.iam.gserviceaccount.com",
     "client_id": "123456789",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
   }
   ```

### 5-2. 필요한 정보 확인
다음 두 가지 정보가 필요합니다:

1. **client_email**
   - JSON 파일의 `"client_email"` 값
   - 예: `campfit-sheets-api@your-project.iam.gserviceaccount.com`

2. **private_key**
   - JSON 파일의 `"private_key"` 값
   - `-----BEGIN PRIVATE KEY-----` 부터 `-----END PRIVATE KEY-----` 까지 전체
   - 줄바꿈(`\n`) 포함

---

## 6단계: 환경 변수 설정

### 6-1. 로컬 개발용 (.env.local)

1. **프로젝트 루트에 .env.local 파일 생성**
   ```bash
   # campfit-crm 폴더 안에 생성
   ```

2. **환경 변수 입력**
   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=campfit-sheets-api@your-project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```

   ⚠️ **주의사항:**
   - `PRIVATE_KEY`는 따옴표로 감싸야 합니다
   - 줄바꿈(`\n`)을 그대로 유지해야 합니다
   - JSON 파일에서 복사할 때 전체를 복사하세요

### 6-2. Vercel 배포용

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **환경 변수 설정**
   - Settings > Environment Variables 클릭
   - "Add New" 버튼 클릭

3. **첫 번째 변수 추가**
   - Key: `GOOGLE_SHEETS_CLIENT_EMAIL`
   - Value: JSON 파일의 `client_email` 값
   - Environment: Production, Preview, Development 모두 체크
   - "Save" 클릭

4. **두 번째 변수 추가**
   - Key: `GOOGLE_SHEETS_PRIVATE_KEY`
   - Value: JSON 파일의 `private_key` 값 (전체, 줄바꿈 포함)
   - ⚠️ **따옴표 없이 입력하세요!**
   - Environment: Production, Preview, Development 모두 체크
   - "Save" 클릭

5. **재배포**
   - 환경 변수 추가 후 자동으로 재배포되거나
   - 수동으로 "Deployments" 탭에서 재배포

---

## 7단계: Google Sheets 공유 설정

### 7-1. 서비스 계정 이메일 확인
1. **서비스 계정 이메일 복사**
   - JSON 파일의 `client_email` 값
   - 또는 Google Cloud Console > 서비스 계정에서 확인

### 7-2. 캠핑장 DB 스프레드시트 공유
1. **스프레드시트 열기**
   - https://docs.google.com/spreadsheets/d/1_laE9Yxj-tajY23k36z3Bg2A_Mds8_V2A81DHnrUO68 접속

2. **공유 설정**
   - 우측 상단의 "공유" 버튼 클릭
   - "사용자 및 그룹 추가" 입력란에 서비스 계정 이메일 입력
   - 권한: **"편집자"** 선택
   - "완료" 또는 "보내기" 클릭

### 7-3. 캠핏 입점 리스트 스프레드시트 공유
1. **스프레드시트 열기**
   - https://docs.google.com/spreadsheets/d/1PHX-Qyk1KrlB8k9r9hEqUckUuQT3PGfu-vJI1R22XyA 접속

2. **동일하게 공유 설정**
   - 서비스 계정 이메일 추가
   - 권한: **"편집자"** 선택

---

## ✅ 설정 완료 체크리스트

- [ ] Google Cloud Console 프로젝트 생성 완료
- [ ] Google Sheets API 활성화 완료
- [ ] 서비스 계정 생성 완료
- [ ] JSON 키 파일 다운로드 완료
- [ ] client_email 값 확인
- [ ] private_key 값 확인 (전체, 줄바꿈 포함)
- [ ] .env.local 파일 생성 및 환경 변수 설정 (로컬 개발용)
- [ ] Vercel 환경 변수 설정 (배포용)
- [ ] 캠핑장 DB 스프레드시트 공유 설정 완료
- [ ] 캠핏 입점 리스트 스프레드시트 공유 설정 완료

---

## 🐛 문제 해결

### "Permission denied" 오류
- **원인**: 스프레드시트 공유 설정이 안 되어 있음
- **해결**: 서비스 계정 이메일로 스프레드시트 공유 확인

### "Invalid credentials" 오류
- **원인**: 환경 변수 형식 오류
- **해결**: 
  - PRIVATE_KEY에 줄바꿈(`\n`)이 포함되어 있는지 확인
  - 따옴표 사용 확인 (로컬은 필요, Vercel은 불필요)

### "API not enabled" 오류
- **원인**: Google Sheets API가 활성화되지 않음
- **해결**: Google Cloud Console에서 API 활성화 확인

### JSON 파일을 잃어버렸을 때
- **해결**: 
  1. 서비스 계정 > 키 탭으로 이동
  2. 기존 키 삭제
  3. 새 키 생성 및 다운로드

---

## 📝 참고사항

### 보안 주의사항
- ⚠️ JSON 키 파일은 절대 공개 저장소(GitHub)에 업로드하지 마세요
- ⚠️ .env.local 파일은 .gitignore에 포함되어 있어야 합니다
- ⚠️ 키 파일을 안전한 곳에 보관하세요

### 비용
- Google Sheets API는 무료 할당량이 충분합니다
- 일일 100만 요청까지 무료

### 권한 범위
- 서비스 계정은 공유된 스프레드시트에만 접근 가능
- 프로젝트의 모든 스프레드시트에 접근하는 것은 아닙니다

---

## 🎉 완료!

모든 설정이 완료되면:
1. 로컬에서 `npm run dev` 실행하여 테스트
2. Vercel에 배포하여 실제 사용

문제가 발생하면 위의 문제 해결 섹션을 참고하거나, Google Cloud Console의 로그를 확인하세요!
