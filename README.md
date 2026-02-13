# 올포유필라테스 홍보 웹사이트

서울시 강동구 둔촌동에 위치한 올포유필라테스 스튜디오의 홍보 웹사이트입니다.

## 📋 필요한 정보 및 업데이트 사항

웹사이트를 완성하기 위해 다음 정보들을 업데이트해주세요:

### 1. 기본 정보
- [ ] 정확한 주소 (현재: 서울시 강동구 둔촌동)
- [ ] 전화번호 (현재: 010-XXXX-XXXX)
- [ ] 실제 운영시간
- [ ] 주차 정보 (주차 가능 여부, 주차 공간 수 등)

### 2. 강사 정보
- [ ] 강사님들의 실제 이름
- [ ] 강사님들의 사진
- [ ] 강사님들의 경력 및 자격증 정보
- [ ] 강사님들의 전문 분야

### 3. 시설 사진
- [ ] 스튜디오 내부 사진
- [ ] 기구 사진 (리포머, 캐딜락 등)
- [ ] 수업 진행 사진
- [ ] 로비/대기실 사진

### 4. 후기 및 리뷰
- [ ] 네이버 플레이스에서 실제 후기 수집
- [ ] 네이버 블로그 후기 수집
- [ ] 회원들의 비포/애프터 사진 (허락 받은 경우)
- [ ] 더 구체적이고 신뢰할 수 있는 후기로 업데이트

### 5. 프로그램 정보
- [ ] 각 프로그램의 정확한 가격 정보
- [ ] 수업 시간표
- [ ] 프로그램별 상세 설명
- [ ] 체험 수업 정보 및 가격

### 6. 지도
- [ ] 네이버 지도 또는 카카오맵 임베드 코드 추가
- [ ] 교통편 안내 (지하철, 버스 등)

### 7. 소셜 미디어
- [ ] 네이버 블로그 링크
- [ ] 인스타그램 계정 링크
- [ ] 카카오톡 채널 링크

## 🚀 GitHub 및 Vercel 배포 가이드

### 1단계: GitHub 저장소 생성 및 코드 업로드

#### 1-1. GitHub에서 새 저장소 생성
1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `allforyou-pilates`)
4. Public 또는 Private 선택
5. "Create repository" 클릭

#### 1-2. 로컬에서 Git 초기화 및 푸시

**PowerShell 또는 터미널에서 다음 명령어 실행:**

```bash
# 프로젝트 폴더로 이동
cd "C:\Users\김경수\Desktop\커서AI\allforyou-pilates"

# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 올포유필라테스 웹사이트"

# GitHub 저장소 연결 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 메인 브랜치로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**또는 GitHub Desktop 사용:**
1. [GitHub Desktop](https://desktop.github.com/) 다운로드 및 설치
2. GitHub Desktop 실행 → "File" → "Add Local Repository"
3. 프로젝트 폴더 선택
4. "Publish repository" 클릭하여 GitHub에 업로드

### 2단계: Vercel 배포

#### 방법 1: Vercel 웹사이트에서 GitHub 연동 (추천)

1. **Vercel 가입/로그인**
   - [Vercel 웹사이트](https://vercel.com) 접속
   - GitHub 계정으로 로그인 (권장)

2. **프로젝트 추가**
   - 대시보드에서 "Add New Project" 클릭
   - GitHub 저장소 목록에서 `allforyou-pilates` 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - **Framework Preset**: "Other" 또는 "Vite" 선택
   - **Root Directory**: `./` (기본값 유지)
   - **Build Command**: 비워두기 (정적 사이트이므로)
   - **Output Directory**: 비워두기
   - **Install Command**: 비워두기

4. **환경 변수** (필요한 경우)
   - 현재는 필요 없음

5. **배포**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 자동으로 URL 생성 (예: `allforyou-pilates.vercel.app`)

6. **도메인 설정** (선택사항)
   - 프로젝트 설정 → Domains
   - 원하는 도메인 추가

#### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 폴더로 이동
cd "C:\Users\김경수\Desktop\커서AI\allforyou-pilates"

# Vercel 로그인
vercel login

# 배포 (처음은 개발 환경)
vercel

# 프로덕션 배포
vercel --prod
```

### 3단계: 자동 배포 설정

GitHub와 Vercel을 연동하면:
- GitHub에 코드를 푸시할 때마다 자동으로 배포됩니다
- Pull Request를 생성하면 미리보기 배포가 생성됩니다

### 4단계: 업데이트 방법

코드를 수정한 후:

```bash
# 변경사항 추가
git add .

# 커밋
git commit -m "업데이트 내용 설명"

# GitHub에 푸시
git push

# Vercel이 자동으로 배포합니다!
```

### 문제 해결

**이미지가 표시되지 않는 경우:**
- 이미지 경로가 상대 경로인지 확인
- 모든 이미지 파일이 GitHub에 업로드되었는지 확인

**배포 후 스타일이 깨지는 경우:**
- 브라우저 캐시 삭제 (Ctrl + Shift + Delete)
- Vercel에서 "Redeploy" 실행

**도메인 설정:**
- Vercel 프로젝트 설정 → Domains에서 커스텀 도메인 추가 가능

## 📁 파일 구조

```
allforyou-pilates/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # JavaScript 파일
├── package.json        # 프로젝트 설정
├── vercel.json         # Vercel 배포 설정
└── README.md           # 이 파일
```

## 🎨 커스터마이징

### 색상 변경
`styles.css` 파일의 `:root` 섹션에서 색상을 변경할 수 있습니다:

```css
:root {
    --primary-color: #6B8E9F;    /* 메인 색상 */
    --secondary-color: #D4A574;  /* 보조 색상 */
    --accent-color: #8B9A8F;     /* 강조 색상 */
}
```

### 폰트 변경
`index.html`의 Google Fonts 링크를 변경하거나, `styles.css`의 `font-family`를 수정하세요.

## 📝 문의 폼 연동

현재 문의 폼은 클라이언트 사이드에서만 작동합니다. 실제로 데이터를 받으려면:

1. 백엔드 API 엔드포인트 생성
2. `script.js`의 폼 제출 핸들러에서 실제 API 호출
3. 또는 서비스 사용 (예: Formspree, EmailJS 등)

## 🔧 기술 스택

- HTML5
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript
- Vercel (배포)

## 📞 지원

문제가 발생하거나 질문이 있으시면 언제든지 문의해주세요.
