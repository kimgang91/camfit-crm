# Vercel 환경 변수 설정 가이드

## 🎯 제공된 인증 정보

- **Client Email**: `camfit-crm@cmafit-crm.iam.gserviceaccount.com`
- **Private Key**: (전체 키가 .env.local에 설정됨)

---

## 📝 Vercel 환경 변수 설정 방법

### 1단계: Vercel 대시보드 접속
1. https://vercel.com 접속
2. 로그인 후 프로젝트 선택 (`campfit-crm`)

### 2단계: 환경 변수 페이지로 이동
1. 프로젝트 대시보드에서 **Settings** 클릭
2. 좌측 메뉴에서 **Environment Variables** 클릭

### 3단계: 첫 번째 변수 추가

**"Add New"** 버튼 클릭 후:

- **Key**: `GOOGLE_SHEETS_CLIENT_EMAIL`
- **Value**: 
  ```
  camfit-crm@cmafit-crm.iam.gserviceaccount.com
  ```
  (따옴표 없이 입력)

- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
  - 모두 체크

- **Save** 클릭

### 4단계: 두 번째 변수 추가

다시 **"Add New"** 버튼 클릭 후:

- **Key**: `GOOGLE_SHEETS_PRIVATE_KEY`
- **Value**: 
  ```
  -----BEGIN PRIVATE KEY-----
  MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCxRBLuRj8aZFMZ
  c05E8IyYZZ6ULy54LG6cz+Wql8I9LlBagKDGSJr4gCG6v0Q4Y9MI35bzMRRGOVHJ
  ZsfYTX5sxr3/4zkaz6UwqPcWXBzJVVTEpCW/Nsk/mAGM2fNKvGxO/tI1sRlUsHSb
  CxQcObvWF2GTxVXhMw/oNOJI8Anq0zTQQCrjPoRNlV4M6iyhxMhgmcXq3E4yxZlR
  sN7MnTlkFPuube5NagkFn39LZQSoJ1l1a2j3Kl3WKXG9qeN85ex1bme+wiY905nU
  RiPnqHnmHPDlo0SeQM+moXuuN3QndEfVr+qRPFKPyXObo/4tq2HaoPRWfPx2RVCa
  ZkfZ+C8pAgMBAAECggEAALTyGXgf9r5iqkItfPHiPOewR69BYtx3OKBk3LmvARcs
  xsHJuZlnsj1UjdPBI9Zr4POt0/9qa1NDdS1Dmkcl6q0HSTDfQKVvCjvEbHP92Hva
  Hrj4ShtOUU4Y53ww/jNAC9qXFEJdSqEFT3Y5+7XrZ4AuF+ycX9Nd+qSkbili3RnJ
  nC7mVZS5F0umc4V9REFAkg7FbKyuLvFfQ1UjLPZP/yl4p2kWS77hGZOINuwXXFnH
  FFEzZJwwn95kmCVnrPrWE7VO9AvS4G4QkD0FlHZIhNV8A9iqOsWlatanAN8z7jxu
  3GlHkGImbtfbO7fX4NvSvLVzh3hc9ZVMNQSo1Fh/lwKBgQDgyQfLpOHpP4GjSx+k
  1vRF7lYaDDY6N17NBercyp2Y4eqy29iSusICrNGK6FI+uXoi/HS2mUmY3dJphbc3
  S/hyiOqkbX4fmETlvgNT3b8MsMRbc8y8l4Dpa0aaAvCgoRE5cDEwYmIONOQPLjLv
  Yvkqj2V+BBrn3tF3QH69zOo+JwKBgQDJ4cLi2N4QBAtWwPVxHDIn1kEmjp2UGy+O
  0qlpcPpHeXf9mDEZCBZMKwhQpv4wxVnsD1UdsJ8gMrN3jGvKDLamO0+BVWcaCSNk
  1ttID77gBi+hi1ruo7RFDNesp7wh3hwoxuB+Zf40Pe+Dv286ApsZsekpRhCdtLlM
  PVBJyjTKLwKBgFsCSXuz6BttsOkSM1+kAAaINqgZJaNwY5uSt8Jo7mHFpiaASDEw
  F/jJS5V39kSbB84+dGqxqVCRDu3WS5XB1ndY49dq1VOpbMuvoN1FvGJA918nhU8d
  7/2Rh2Y3poECdVzSBbhXPOgPlf5ncAvoAIWwxSC+PL6AQkKMBESIQJalAoGAVApJ
  aMnC14P3fGvjQOzt7CuC/5wK+SbAC4Kix6QibDKiwsziU3tMXPTlBz4dPwxIvL49
  PpjSBUNV9oRcMsZMGrNCC6MTwoDfXREcQ8laOkQY+/TZK9K2LrCD7/n7lVWy/z6b
  IcMvqWvHE19T3CBNlMq9N1NVg3FCWfyEOdOVWj0CgYATpcwsF2S5AEpjy/yQzTX4
  d7ea278cb00M2Oo+GkRdajr/cpjNUg9bDImRBpx/OX+a6nOp0kVFaI/vv0RXTzua
  8Fq9RJ3vE5j5Swvpk+rovr+f9YGLSi3fbmz1uqKRgXATNckJVyPdRmECdeXAy6J1
  9vJY540BmLrbC7vXFMo/xg==
  -----END PRIVATE KEY-----
  ```
  ⚠️ **따옴표 없이** 전체 키를 그대로 붙여넣기
  ⚠️ 줄바꿈은 그대로 유지

- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
  - 모두 체크

- **Save** 클릭

### 5단계: 재배포
환경 변수 추가 후:
- 자동으로 재배포가 시작되거나
- **Deployments** 탭에서 최신 배포를 클릭하여 **Redeploy** 클릭

---

## ✅ 확인 사항

### 환경 변수 목록 확인
Vercel 대시보드에서 다음 두 변수가 모두 보여야 합니다:
- ✅ `GOOGLE_SHEETS_CLIENT_EMAIL`
- ✅ `GOOGLE_SHEETS_PRIVATE_KEY`

### 배포 확인
1. **Deployments** 탭에서 배포 상태 확인
2. 배포가 성공적으로 완료되었는지 확인
3. 사이트 URL로 접속하여 데이터가 정상적으로 표시되는지 확인

---

## 🐛 문제 해결

### "Invalid credentials" 오류
- Vercel에서 PRIVATE_KEY는 **따옴표 없이** 입력해야 합니다
- 전체 키가 올바르게 복사되었는지 확인
- 줄바꿈이 유지되어 있는지 확인

### "Permission denied" 오류
다음 스프레드시트에 서비스 계정 이메일(`camfit-crm@cmafit-crm.iam.gserviceaccount.com`)을 공유해야 합니다:

1. **캠핑장 DB 스프레드시트**
   - https://docs.google.com/spreadsheets/d/1_laE9Yxj-tajY23k36z3Bg2A_Mds8_V2A81DHnrUO68
   - "공유" 버튼 클릭
   - `camfit-crm@cmafit-crm.iam.gserviceaccount.com` 추가
   - 권한: **편집자**

2. **캠핏 입점 리스트 스프레드시트**
   - https://docs.google.com/spreadsheets/d/1PHX-Qyk1KrlB8k9r9hEqUckUuQT3PGfu-vJI1R22XyA
   - 동일하게 공유 설정

---

## 🎉 완료!

환경 변수 설정이 완료되면:
1. Vercel에서 자동으로 재배포됩니다
2. 배포 완료 후 사이트가 정상 작동합니다
3. 스프레드시트 데이터가 정상적으로 표시됩니다
