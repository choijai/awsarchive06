# AWS SAA-C03 시험 준비 앱 - 개발 가이드

## 🎯 프로젝트 개요
Claude AI를 활용한 SAA-C03 시험 대비 문제 생성 및 학습 플랫폼

## 📋 최근 추가 기능 (2024-03-22)

### 1. 사용자 인증 및 일일 제한
- **로그인 전**: 하루 2회 무료
- **로그인 후**: 하루 2회 무료
- **프리미엄 (유료)**: 하루 20개 무제한 ($9.99/month)

### 2. 구글 로그인 (demo)
- 헤더 우측 상단 "🔐 로그인" 버튼
- 이메일 입력 후 자동 상태 변경
- localStorage에 사용자 정보 저장

### 3. D-Day 카운트다운
- 로그인 후 시험 시작일 설정
- 우측 상단에 D-day 표시 (실시간 업데이트)
- 84일 후가 시험 예정일

### 4. 프리미엄 배너
- 문제 생성 버튼 바로 아래
- $9.99/month 가격 안내
- 프리미엄 사용자는 숨김

---

## 🌐 다국어 문구 추가 규칙

**모든 새로운 UI 문구는 반드시 3개 언어로 작성해야 합니다:**

### 로케일 파일 위치
- `src/locales/ko.ts` - 한국어
- `src/locales/en.ts` - 영어
- `src/locales/ja.ts` - 일본어

### 예시: 새 기능 추가 시

**ko.ts (한국어)**
```typescript
// 로그인 관련
btnLogin: "🔐 로그인",
msgLoginTip: "로그인하면 2회 무료 이용 가능",

// 프리미엄 관련
premiumTitle: "💎 프리미엄 업그레이드",
premiumPrice: "$9.99 / 한 달",
premiumFeature1: "✅ 하루 20개 무제한",
premiumFeature2: "✅ 모든 난이도",
premiumFeature3: "✅ 완전히 광고 없음",

// D-Day 관련
examDateLabel: "📅 시험 시작일 설정",
examDateHint: "84일 후가 시험 예정일입니다",
```

**en.ts (영어)**
```typescript
// Login
btnLogin: "🔐 Login",
msgLoginTip: "Get 2 free attempts per day when logged in",

// Premium
premiumTitle: "💎 Upgrade to Premium",
premiumPrice: "$9.99 / month",
premiumFeature1: "✅ Unlimited 20 problems per day",
premiumFeature2: "✅ All difficulty levels",
premiumFeature3: "✅ Completely ad-free",

// D-Day
examDateLabel: "📅 Set Exam Start Date",
examDateHint: "Exam date is 84 days after the start date",
```

**ja.ts (日本語)**
```typescript
// ログイン
btnLogin: "🔐 ログイン",
msgLoginTip: "ログイン後、1日2回の無料試行が利用できます",

// プレミアム
premiumTitle: "💎 プレミアムにアップグレード",
premiumPrice: "$9.99 / 月",
premiumFeature1: "✅ 1日20問の無制限",
premiumFeature2: "✅ すべての難易度",
premiumFeature3: "✅ 完全に広告なし",

// D-Day
examDateLabel: "📅 試験開始日を設定",
examDateHint: "試験日は開始日の84日後です",
```

---

## 📝 주의사항

1. **다국어 동시 업데이트**: 새 기능 추가 시 3개 로케일 파일을 동시에 수정
2. **번역 정확성**: Google Translate 체크 후 자연스러운 문맥으로 조정
3. **키 네이밍**: camelCase 사용, 의미 있는 접두어 (btn, msg, lbl, btn 등)
4. **이모지 통일**: 각 카테고리별 이모지 일관성 유지

---

## 🔄 상태 관리 (localStorage)

```javascript
// 사용자 상태
localStorage.setItem("userStatus", "guest|loggedIn|paid");
localStorage.setItem("userEmail", "user@example.com");

// 일일 카운트
localStorage.setItem("problemCountDate", "2024-03-22");
localStorage.setItem("problemCount", "2");

// 시험 날짜
localStorage.setItem("examStartDate", "2024-03-22");
```

---

## 🧪 테스트 체크리스트

- [ ] 다국어 문구 모두 추가됨
- [ ] 로그인/로그아웃 작동 확인
- [ ] D-Day 실시간 업데이트
- [ ] 프리미엄 배너 표시/숨김
- [ ] 할당량 초과 시 모달 팝업
- [ ] 모든 버튼 클릭 작동 확인

---

## 🔧 npm run dev 오류 해결 (2026-03-22)

### ⚠️ 문제: 'vite'은(는) 내부 또는 외부 명령이 아닙니다

**원인:**
- `NODE_ENV=production` 환경변수가 설정되어 있었음
- npm이 devDependencies를 설치하지 않음
- 기존 package-lock.json이 손상되어 vite 패키지 정의 누락
- @types/react 버전 불일치 (@types/react-dom과 호환되지 않음)

**상황:**
- Windows bash 환경에서 npm 경로 문제
- 포트 3000은 이미 실행 중이었으나, 개발 서버를 재시작할 수 없음

### ✅ 해결책

**1단계: 환경변수 설정**
```bash
# 터미널에서 개발 모드 설정 (개발할 때마다 해야 함)
export NODE_ENV=development
```

**2단계: package.json 의존성 수정**
```json
{
  "devDependencies": {
    "@types/react": "^19.2.0",        // ~19.0.10 → ^19.2.0
    "@types/react-dom": "^19.2.0",    // ^19.0.0 → ^19.2.0
    // ... 나머지는 그대로
  }
}
```

**3단계: .npmrc 파일 생성** (프로젝트 루트)
```
legacy-peer-deps=true
force=true
production=false
```

**4단계: 재설치**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**5단계: 개발 서버 시작**
```bash
npm run dev
# 또는
npx vite
```

### 🚀 권장: 간편한 방법
```bash
# 이 명령어 한 줄로 시작 (환경변수 + dev)
NODE_ENV=development npm run dev
```

### 📌 앞으로 주의사항
- devDependencies 버전 충돌 발생 시 --legacy-peer-deps 플래그 사용
- NODE_ENV 환경변수는 개발할 때마다 설정
- package-lock.json은 git에 커밋 (재현성 보장)

---

## 📱 향후 계획

1. ⏳ 실제 Google OAuth 2.0 통합
2. ⏳ 결제 시스템 연동 (Stripe 등)
3. ⏳ 사용자 학습 기록 데이터베이스 저장
4. ⏳ 모의고사 기능
5. ⏳ 분석 대시보드
