# 🚀 빠른 배포 가이드

## GitHub에 올리기

### 1. GitHub 저장소 생성
1. https://github.com 접속 후 로그인
2. 우측 상단 "+" → "New repository"
3. 저장소 이름: `allforyou-pilates`
4. "Create repository" 클릭

### 2. 코드 업로드 (PowerShell)

```powershell
# 프로젝트 폴더로 이동
cd "C:\Users\김경수\Desktop\커서AI\allforyou-pilates"

# Git 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "올포유필라테스 웹사이트 초기 버전"

# GitHub 저장소 연결 (아래 YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/allforyou-pilates.git

# 브랜치 이름 설정
git branch -M main

# 업로드
git push -u origin main
```

**참고:** GitHub 사용자명과 저장소 이름을 정확히 입력해야 합니다.

## Vercel에 배포하기

### 방법 1: 웹사이트에서 배포 (가장 쉬움)

1. **https://vercel.com 접속**
   - GitHub 계정으로 로그인 (권장)

2. **"Add New Project" 클릭**

3. **GitHub 저장소 선택**
   - 방금 만든 `allforyou-pilates` 저장소 선택
   - "Import" 클릭

4. **설정 확인**
   - Framework Preset: **"Other"** 선택
   - 나머지는 기본값 유지

5. **"Deploy" 클릭**
   - 몇 분 후 배포 완료!
   - 자동으로 URL 생성됨 (예: `allforyou-pilates.vercel.app`)

### 방법 2: CLI로 배포

```powershell
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 폴더에서 실행
cd "C:\Users\김경수\Desktop\커서AI\allforyou-pilates"
vercel login
vercel --prod
```

## ✅ 완료!

배포가 완료되면:
- ✅ GitHub에 코드가 저장됨
- ✅ Vercel에서 웹사이트가 라이브로 배포됨
- ✅ GitHub에 푸시할 때마다 자동으로 재배포됨

## 🔄 업데이트 방법

코드를 수정한 후:

```powershell
git add .
git commit -m "업데이트 내용"
git push
```

Vercel이 자동으로 재배포합니다!

## 📝 도메인 설정 (선택사항)

1. Vercel 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 연결

## ❓ 문제 해결

**이미지가 안 보여요:**
- 모든 이미지 파일이 GitHub에 올라갔는지 확인
- 이미지 경로가 올바른지 확인

**스타일이 깨져요:**
- 브라우저 캐시 삭제 (Ctrl + Shift + Delete)
- Vercel에서 "Redeploy" 실행

**GitHub 푸시가 안 돼요:**
- GitHub 인증 확인
- 저장소 이름과 사용자명 확인
