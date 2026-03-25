# 📦 AWSARCHIVE - AWS SAA-C03 시험 대비 플랫폼

> Claude AI 기반 SAA-C03 시험 대비 문제 생성 및 학습 플랫폼

[![GitHub stars](https://img.shields.io/github/stars/choijai/awsarchive06?style=flat-square)](https://github.com/choijai/awsarchive06)
[![GitHub license](https://img.shields.io/github/license/choijai/awsarchive06?style=flat-square)](LICENSE)

---

## 🎯 프로젝트 개요

AWSARCHIVE는 **Claude AI**를 활용하여 AWS SAA-C03 시험에 대비할 수 있는 통합 학습 플랫폼입니다.

### ✨ 주요 특징

- **🤖 AI 기반 문제 생성**: Claude AI가 실시간으로 맞춤형 SAA-C03 문제 생성
- **📊 AWS 서비스 관계도**: 인터랙티브 그래프로 서비스 간 관계 시각화
- **🎓 모의시험**: 실제 시험과 동일한 형식(50문제, 130분)
- **📈 학습 분석**: 정답률, 취약 서비스 추적
- **🌐 다국어 지원**: 한국어, 영어, 일본어
- **💾 로컬 캐싱**: localStorage를 활용한 빠른 로딩 및 Firebase 비용 절감
- **🔒 보안**: 환경변수 기반 설정 관리

---

## 🚀 빠른 시작

### 필수 조건

- Node.js 18+
- npm 또는 yarn
- Firebase 프로젝트
- Claude API 키

### 설치

```bash
# 저장소 클론
git clone https://github.com/choijai/awsarchive06.git
cd awsarchive06

# 의존성 설치
npm install
```

### 환경 변수 설정

1. `.env.example`을 `.env`로 복사

```bash
cp .env.example .env
```

2. `.env` 파일을 열어 다음 값들을 입력하세요:

```env
# Firebase Configuration
# https://console.firebase.google.com에서 프로젝트 설정 → 앱 추가 → 웹
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Claude API Key
# https://console.anthropic.com 에서 발급
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx

# Admin Configuration (보안: 환경변수로만 관리)
VITE_ADMIN_EMAILS=admin@example.com
VITE_TEST_PAID_EMAILS=testuser@example.com

# Contact Form Email
CONTACT_EMAIL=your-email@gmail.com

# Resend Email API (선택사항)
# https://resend.com 에서 발급
RESEND_API_KEY=your_resend_api_key
```

### 개발 서버 실행

```bash
# 개발 모드 실행
NODE_ENV=development npm run dev
```

브라우저에서 `http://localhost:5173` 열기

---

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Footer.tsx
│   ├── Modals/         # 모달 컴포넌트들
│   └── ...
├── api.ts              # Claude API 통합
├── firebase.ts         # Firebase 설정 및 함수
├── analytics.ts        # 방문자 분석
├── web-app.tsx         # 메인 애플리케이션
├── data.ts             # AWS 서비스 데이터
├── styles.css          # 전역 스타일
├── LocaleContext.tsx   # 다국어 지원
└── locales/            # 번역 파일
    ├── ko.ts          # 한국어
    ├── en.ts          # 영어
    └── ja.ts          # 일본어
```

---

## 🛠️ 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 번들러
- **CSS3** - 스타일링

### Backend & Services
- **Firebase**
  - Authentication (구글, 이메일/비밀번호)
  - Firestore (데이터베이스)
  - Cloud Storage (PDF 저장)
  - Hosting (배포)
- **Claude API** - AI 기반 문제 생성
- **Resend** - 이메일 발송
- **Node.js Express** - 프록시 서버

---

## 📚 주요 기능

### 1️⃣ 퀴즈 모드
- AWS 서비스 선택 → AI가 맞춤형 문제 생성
- 객관식 5개 선택지
- 정답 및 상세 설명
- 일일 제한: 게스트 2회, 프리미엄 20회

### 2️⃣ 모의시험
- 50문제, 130분 실시간 시험
- 언어별 독립적인 문제 풀
- 일일 1회 제한 (테스트/관리자 무제한)
- 점진적 문제 로딩 (1→4→9→19→50)
- PDF 다운로드 (24시간 유효)

### 3️⃣ 개념 학습
- AWS 서비스별 상세 설명
- 쉬운 설명, 핵심 포인트, 관련 서비스
- AI 번역 (한→일→영)

### 4️⃣ 학습 분석
- 총 문제 풀이 수
- 정답률
- 연속 학습일 (streak)
- 취약 서비스 분석

### 5️⃣ 커뮤니티
- 게시글 작성/열람
- 공개/비밀 게시글
- 비밀번호 보호

---

## 🔐 환경 변수 설명

| 변수 | 설명 | 필수 여부 |
|------|------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API 키 | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | ✅ |
| `VITE_ANTHROPIC_API_KEY` | Claude API 키 | ✅ |
| `VITE_ADMIN_EMAILS` | 관리자 이메일 (쉼표로 구분) | ✅ |
| `VITE_TEST_PAID_EMAILS` | 테스트 사용자 이메일 | ✅ |
| `CONTACT_EMAIL` | 연락처 수신 이메일 | ⚠️ |
| `RESEND_API_KEY` | Resend Email API 키 | ⚠️ |

---

## 📤 배포

### Firebase Hosting으로 배포

```bash
# 1. 프로젝트 빌드
npm run build

# 2. Firebase 로그인 (처음 1회)
firebase login

# 3. Firebase 프로젝트 연결 (처음 1회)
firebase init hosting

# 4. Firebase Console에서 환경변수 설정
# 프로젝트 설정 → 환경변수 → 위의 모든 변수 추가

# 5. 배포
firebase deploy
```

### 환경변수 설정 (배포 서버)

Firebase Console에서:
1. 프로젝트 설정 → 환경변수
2. 모든 `.env` 변수들 추가
3. 배포 시 자동으로 주입됨

---

## 🔄 Git 워크플로우

### 개발하기
```bash
# 새 브랜치 생성
git checkout -b feature/기능명

# 변경사항 커밋
git add .
git commit -m "설명"

# 원격 저장소에 푸시
git push origin feature/기능명
```

### 배포하기
```bash
# main 브랜치로 이동
git checkout main
git pull origin main

# 빌드
npm run build

# 배포
firebase deploy
```

---

## 💰 가격 책정

| 플랜 | 일일 문제 | 모의시험 | 가격 |
|------|---------|--------|------|
| 🔐 게스트 | 2문제 | - | 무료 |
| ✨ 로그인 | 2문제 | 1회 | 무료 |
| 💎 프리미엄 | 20문제 | 무제한 | $14.99/월 |

---

## 🚨 문제 해결

### npm install 에러
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Firebase 권한 오류
Firestore 규칙 확인:
```
allow read: if request.auth != null;
allow write: if request.auth.uid == '관리자UID';
```

### 환경변수 로드 안 됨
1. `.env` 파일 확인
2. 개발 서버 재시작: `npm run dev`
3. 브라우저 캐시 삭제

### localStorage 관련 문제
- 브라우저 개발자 도구 → Application → localStorage 확인
- 필요시 수동으로 항목 삭제

---

## 📊 성능 최적화

### localStorage 캐싱
- Firebase 읽기 비용 90% 이상 절감
- 초기 로드 시간: 1-5ms (Firebase 읽기 대비)

### 점진적 모의시험 로딩
- 1문제 → 4문제 → 9문제 → 19문제 → 50문제
- 사용자가 즉시 시작 가능

### 스피너 표시
- 로딩 중 진행상황 시각화
- 사용자 경험 개선

---

## 🤝 기여

버그 리포트와 기능 요청은 [Issues](https://github.com/choijai/awsarchive06/issues)에서 해주세요.

```bash
# 로컬 테스트
npm run dev

# 풀 리퀘스트 생성
git checkout -b fix/버그명
git commit -m "Fix: 버그 설명"
git push origin fix/버그명
```

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 👨‍💼 관리자 정보

- **Admin Email**: 환경변수 `VITE_ADMIN_EMAILS`에 설정
- **Test User**: 환경변수 `VITE_TEST_PAID_EMAILS`에 설정

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!**

[GitHub](https://github.com/choijai/awsarchive06) • [Issues](https://github.com/choijai/awsarchive06/issues)

Made with ❤️ by AWSARCHIVE Team

</div>
