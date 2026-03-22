import type { Strings } from "./ko";

export const ja: Strings = {
  // Header
  headerSubtitle: "AWSサービス関係図 + 学習ツール",

  // Tabs
  tabQuiz: "クイズ",
  tabConcept: "コンセプト",
  tabStatus: "進捗",

  // Filter
  filterAll: "すべて",

  // Difficulty
  diffEasy: "簡単",
  diffMedium: "普通",
  diffHard: "難しい",

  // Slots
  slotsTitle: "サービススロット",
  slotClickToAdd: "+ クリックして追加",

  // Buttons
  btnReset: "リセット",
  btnGenerate: "🚀 SAA-C03問題を生成",
  btnGenerating: "⏳ 生成中...",
  btnNextProblem: "別の問題を生成",

  // Problem labels
  labelConstraints: "制約条件:",
  labelCorrect: "✅ 正解!",
  labelWrong: "❌ 不正解",
  labelAnswer: "答え:",
  labelExplanation: "説明:",
  labelTrapOption: "この選択肢が間違っている理由:",
  labelPatterns: "🎯 重要パターン:",

  // Concept section headers
  sectionEasy: "💡 簡単な説明",
  sectionPoints: "🎯 重要なポイント",
  sectionRelated: "🔗 関連サービス",

  // Empty states
  emptyConceptHint: "グラフからサービスを選択すると\n詳細なコンセプトが表示されます",
  emptyStatus: "📈 学習進捗統計は近日公開予定です",

  // Graph
  graphLabel: "📊 AWSサービス関係図 (ドラッグで移動可)",

  // Error
  errorGenerate: "問題の生成に失敗しました",

  // Streak
  streakSuffix: "日連続",

  // Concept translation
  conceptTranslating: "翻訳中...",

  // Page metadata
  pageTitle: "AWS SAA-C03試験対策 - Claude AI問題生成",
  pageDescription: "Claude AIでAWS SAA-C03試験に備えましょう。インタラクティブなサービス地図とカスタマイズされた問題生成を提供します。",

  // Dashboard/Status tab
  dashboardTitle: "📈 学習進捗",
  totalProblems: "総問題数",
  correctRate: "正答率",
  consecutiveDays: "連続学習日数",
  weakServices: "苦手なサービス",
  weakServicesDesc: "(不正解が多い順)",
  timesAnswered: "回",
  setExamDate: "試験日を編集",
  examDateLabel: "試験日",
  examDatePlaceholder: "YYYY-MM-DD",
  loginPrompt: "ログインして学習記録を保存しましょう",
  loginButton: "Googleで始める",
  noData: "まだデータがありません",
};
