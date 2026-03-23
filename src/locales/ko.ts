export const ko = {
  // Header
  headerSubtitle: "서비스 관계도 + 학습 도구",
  currentVisitors: "현재 접속자 수",

  // Tabs
  tabQuiz: "퀴즈",
  tabConcept: "개념",
  tabStatus: "현황",

  // Filter
  filterAll: "전체",

  // Difficulty
  diffMedium: "보통",
  diffHard: "어려움",
  diffChallenge: "챌린지",

  // Slots
  slotsTitle: "서비스 슬롯",
  slotClickToAdd: "+ 클릭으로 추가",

  // Buttons
  btnReset: "초기화",
  btnGenerate: "🚀 SAA-C03 문제 생성",
  btnGenerating: " 생성 중...",
  btnNextProblem: "다른 문제 생성",

  // Problem labels
  labelConstraints: "제약 조건:",
  labelCorrect: "✅ 정답!",
  labelWrong: "❌ 오답",
  labelAnswer: "정답:",
  labelExplanation: "설명:",
  labelTrapOption: "이 선택지의 문제:",
  labelPatterns: "🎯 핵심 패턴:",

  // Concept section headers
  sectionEasy: "💡 쉽게 이해하기",
  sectionPoints: "🎯 핵심 포인트",
  sectionRelated: "🔗 연관 서비스",

  // Empty states
  emptyConceptHint: "그래프에서 서비스를 선택하면\n상세 개념이 표시됩니다",
  emptyStatus: "📈 학습 진행 통계는 곧 준비됩니다",

  // Graph
  graphLabel: "📊 AWS 서비스 관계도 (드래그로 이동 가능)",

  // Error
  errorGenerate: "문제 생성에 실패했습니다",

  // Streak
  streakSuffix: "일 연속",

  // Concept translation
  conceptTranslating: "번역 중...",

  // 로그인 관련
  btnLogin: "🔐 로그인",
  msgLoginTip: "로그인하면 2회 무료 이용 가능",
  googleLoginBtn: "Google로 로그인",
  logoutBtn: "로그아웃",
  userStatusGuest: "🔐 Guest",
  userStatusLoggedIn: "✨ Logged In",
  userStatusPaid: "💎 Premium",

  // 로그인 모달
  verifyEmailTitle: "🔐 이메일 인증",
  verifyEmailDesc: "이메일 주소를 입력하세요.",
  verifyEmailPlaceholder: "your.email@example.com",
  verifyBtn: "인증",
  continueWithGoogle: "Google로 계속",
  continueWithMicrosoft: "Microsoft로 계속",
  loginGetTitle: "✨ 로그인하면 다음을 이용할 수 있습니다:",
  aiFeature: "🎯 AWS 노드를 선택하면 AI가 맞춤형 SAA-C03 문제를 자동 생성",
  loginFreeAttempts: "📌 매일 2회 무료 시도",
  loginUpgradeOffer: "💎 또는 $9.99/월에 업그레이드하여 하루 20개 문제 이용",
  cancelBtn: "취소",
  btnSignUp: "회원가입",
  btnLogIn: "로그인",
  passwordPlaceholder: "비밀번호 (6자 이상)",
  alreadyHaveAccount: "이미 계정이 있으신가요?",
  dontHaveAccount: "계정이 없으신가요?",

  // 프리미엄 관련
  premiumTitle: "💎 프리미엄 업그레이드",
  premiumPrice: "$9.99 / 한 달",
  premiumFeature1: "✅ 하루 20개 무제한",
  premiumFeature2: "✅ 모든 난이도",
  premiumFeature3: "✅ 완전히 광고 없음",
  premiumUpgradeBtn: "✨ 지금 업그레이드하기",
  premiumPlan: "💎 프리미엄 플랜",
  premiumBenefits: "프리미엄 플랜",
  premiumUnlimited: "✅ 하루 20개 무제한",
  premiumAllDifficulty: "✅ 모든 난이도",
  premiumAdFree: "✅ 완전히 광고 없음",
  quotaFullGuest: "🔐 일일 제한에 도달했습니다 (2/2). 로그인하여 2회 무료를 받거나 무제한으로 업그레이드하세요.",
  quotaFullLoggedIn: "✨ 무료 2회가 모두 사용되었습니다. 하루 20개 문제를 생성하려면 업그레이드하세요!",

  // D-Day 관련
  examDateLabel: "📅 시험 시작일 설정",
  examDateTitle: "📅 시험 시작일 설정",
  examDateHint: "SAA-C03 시험 날짜 (84일 후가 시험일입니다)",
  examDateTip: "✨ 팁: 시작일부터 84일 후가 시험 예정일입니다. 📍 우측 상단에서 D-day를 확인할 수 있습니다!",
  examDateSetBtn: "✅ 설정 완료",
  examDateCancelBtn: "취소",
  labelQuotaFull: "Quota Limited",

  // Page metadata
  pageTitle: "AWS SAA-C03 시험 준비 - Claude AI 문제 생성",
  pageDescription: "AWS SAA-C03 시험을 Claude AI로 준비하세요. 서비스 관계도와 맞춤형 문제 생성을 제공합니다.",

  // Dashboard/Status tab
  dashboardTitle: "📈 학습 진행 통계",
  totalProblems: "총 문제",
  correctRate: "정답률",
  consecutiveDays: "연속 학습일",
  weakServices: "취약 서비스",
  weakServicesDesc: "(오답 많은 순)",
  timesAnswered: "회",
  setExamDate: "시험일 수정",
  examDatePlaceholder: "YYYY-MM-DD",
  loginPrompt: "로그인하면 학습 기록이 저장됩니다",
  loginButton: "Google로 시작하기",
  noData: "아직 데이터가 없습니다",
};

export type Strings = Record<keyof typeof ko, string>;
