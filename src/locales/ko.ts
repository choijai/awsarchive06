export const ko = {
  // Header
  headerSubtitle: "서비스 관계도 + 학습 도구",

  // Tabs
  tabQuiz: "퀴즈",
  tabConcept: "개념",
  tabStatus: "현황",

  // Filter
  filterAll: "전체",

  // Difficulty
  diffEasy: "쉬움",
  diffMedium: "보통",
  diffHard: "어려움",

  // Slots
  slotsTitle: "서비스 슬롯",
  slotClickToAdd: "+ 클릭으로 추가",

  // Buttons
  btnReset: "초기화",
  btnGenerate: "🚀 SAA-C03 문제 생성",
  btnGenerating: "⏳ 생성 중...",
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
  examDateLabel: "시험일",
  examDatePlaceholder: "YYYY-MM-DD",
  loginPrompt: "로그인하면 학습 기록이 저장됩니다",
  loginButton: "Google로 시작하기",
  noData: "아직 데이터가 없습니다",
} as const;

export type Strings = typeof ko;
