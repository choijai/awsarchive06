import type { Strings } from "./ko";

export const ja: Strings = {
  // Header
  headerSubtitle: "AWSサービス関係図 + 学習ツール",
  currentVisitors: "現在のアクセス者数",

  // Tabs
  tabQuiz: "クイズ",
  tabConcept: "コンセプト",
  tabStatus: "進捗",
  tabMockExam: "📋 模擬試験",
  tabPosts: "投稿",
  tabUsers: "ユーザー",

  // Mock Exam
  mockExamTitle: "🎓 SAA-C03模擬試験",
  mockExamDescription: "実試験と同じ形式で練習できます",
  mockExamStart: "試験を開始 (130分)",
  mockExamInfo: "問題: 50問 | 制限時間: 130分 | 合格点: 720点",
  mockExamEmpty: "まだ模擬試験を開始していません",
  mockExamTimeRemaining: "残り時間",
  mockExamScore: "予想スコア",
  mockExamResult: "模擬試験の結果",
  mockExamResultCards: "📊 結果カード",
  mockExamAnalysis: "📋 問題別解析",
  mockExamTotalScore: "総得点",
  mockExamCorrect: "正解",
  mockExamWrong: "不正解",
  mockExamPassScore: "合格点 (720点)",
  mockExamRatio: "正解率",
  mockExamAdminForceCreate: "👨‍💼 強制生成 (管理者)",
  mockExamPdfDownload: "📥 PDFをダウンロード",
  mockExamPdfInfo: "PDFは24時間ダウンロード可能です",
  mockExamPdfExpired: "PDFダウンロード期間が満了しました (24時間経過)",
  mockExamAlreadyStartedToday: "⏰ 今日はすでにモック試験を開始しています。",
  mockExamNextAttempt: "明日の真夜中(UTC 00:00)に再度受験できます。",

  // Filter
  filterAll: "すべて",

  // Difficulty
  diffMedium: "普通",
  diffHard: "難しい",
  diffChallenge: "チャレンジ",

  // Slots
  slotsTitle: "サービススロット",
  slotClickToAdd: "+ クリックして追加",

  // Buttons
  btnReset: "リセット",
  btnGenerate: "🚀 SAA-C03問題を生成",
  btnGenerating: " 生成中...",
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

  // Login related
  btnLogin: "🔐 ログイン",
  msgLoginTip: "ログイン後、1日2回の無料試行が利用できます",
  googleLoginBtn: "Googleでログイン",
  logoutBtn: "ログアウト",
  userStatusGuest: "🔐 ゲスト",
  userStatusLoggedIn: "✨ ログイン",
  userStatusPaid: "💎 プレミアム",

  // Login modal
  verifyEmailTitle: "🔐 メールを認証",
  verifyEmailDesc: "メールアドレスを入力してください。",
  verifyEmailPlaceholder: "your.email@example.com",
  verifyBtn: "認証",
  continueWithGoogle: "Googleで続ける",
  continueWithMicrosoft: "Microsoftで続ける",
  loginGetTitle: "✨ ログインで以下が利用できます:",
  aiFeature: "🎯 AWSノードを選択するとAIが自動的にカスタマイズされたSAA-C03問題を生成",
  loginFreeAttempts: "📌 1日2回の無料試行",
  loginUpgradeOffer: "💎 または $14.99/月にアップグレードして1日20問を利用",
  cancelBtn: "キャンセル",
  btnSignUp: "サインアップ",
  btnLogIn: "ログイン",
  passwordPlaceholder: "パスワード (6文字以上)",
  alreadyHaveAccount: "既にアカウントをお持ちですか?",
  dontHaveAccount: "アカウントをお持ちではありませんか?",

  // Premium related
  premiumTitle: "💎 プレミアムにアップグレード",
  premiumFeature1: "✅ 1日20問",
  premiumFeature2: "✅ 毎日模擬試験 (50問、130分)",
  premiumFeature3: "✅ すべての難易度",
  premiumFeature4: "✅ 完全に広告なし",
  premiumUpgradeBtn: "✨ 今すぐアップグレード",
  premiumPlan: "プレミアムプラン",
  premiumBenefits: "プレミアムプラン",
  premiumUnlimited: "✅ 1日20問",
  premiumAllDifficulty: "✅ すべての難易度",
  premiumAdFree: "✅ 完全に広告なし",
  premiumCancelAnytime: "✅ いつでもキャンセル可能",
  quotaFullGuest: "🔐 1日の制限に達しました (2/2)。ログインして2回の無料試行を取得するか、アップグレードしてください。",
  quotaFullLoggedIn: "✨ 無料の2回の試行は使用済みです。1日20問の問題を生成するにはアップグレードしてください!",

  // D-Day related
  examDateLabel: "📅 試験開始日を設定",
  examDateTitle: "📅 試験開始日を設定",
  examDateHint: "SAA-C03試験日 (試験は開始日の84日後です)",
  examDateTip: "✨ ヒント: 試験日は開始日の84日後です。📍 右上のD-dayで確認できます!",
  examDateSetBtn: "✅ 完了",
  examDateCancelBtn: "キャンセル",
  labelQuotaFull: "アップグレード",

  // Page metadata & SEO
  pageTitle: "AWS SAA-C03試験対策 - Claude AI問題自動生成",
  pageDescription: "Claude AIでAWS SAA-C03試験に備えましょう。サービスアーキテクチャ図、AI自動問題生成、学習分析で合格を実現します。",
  pageKeywords: "AWS SAA-C03, AWS認定, AWS試験, ソリューションアーキテクト, AWSクラウド資格, 試験対策, AI問題生成, 練習問題",
  ogTitle: "AWS SAA-C03認定試験 - AI問題自動生成ツール",
  ogDescription: "AWSサービスアーキテクチャ図とClaude AI搭載の問題生成でAWS SAA-C03試験合格をサポートします。",
  twitterTitle: "AWS SAA-C03試験対策 - Claude AI",
  twitterDescription: "インテリジェントな問題生成とサービスアーキテクチャ可視化でAWS SAA-C03試験に合格しましょう。",

  // Dashboard/Status tab
  dashboardTitle: "📈 学習進捗",
  statisticsLabel: "📊 統計",
  totalProblems: "総問題数",
  correctRate: "正答率",
  consecutiveDays: "連続学習日数",
  weakServices: "苦手なサービス",
  weakServicesDesc: "(不正解が多い順)",
  timesAnswered: "回",
  setExamDate: "試験日を編集",
  examDatePlaceholder: "YYYY-MM-DD",
  loginPrompt: "ログインして学習記録を保存しましょう",
  loginButton: "Googleで始める",
  noData: "まだデータがありません",
  generatedSessionsTitle: "生成されたPDF",
  sessionAutoDeleteNotice: "⏱️ 生成されたPDFは1日後に自動削除されます",

  // Posts
  postsWrite: "投稿する",
  postsTitle: "タイトル",
  postsContent: "内容",
  postsAuthor: "投稿者",
  postsDate: "日付",
  postsPublic: "🌐 公開",
  postsSecret: "🔒 非公開",
  postsPassword: "パスワード",
  postsSearch: "タイトル検索...",
  postsMine: "自分の投稿",
  postsSubmit: "投稿",
  postsCancel: "キャンセル",
  postsEmpty: "投稿がありません",
  postsPasswordRequired: "パスワードを入力してください",
  postsPasswordWrong: "パスワードが間違っています",
  postsLoginRequired: "投稿にはログインが必要です",
  postsDeleteConfirm: "本当に削除しますか？",
  postsDelete: "削除",
  postsView: "閲覧",
  postsPage: "ページ",
};
