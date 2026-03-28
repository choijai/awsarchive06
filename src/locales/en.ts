import type { Strings } from "./ko";

export const en: Strings = {
  // Header
  headerSubtitle: "AWS Service Map + Study Tools",
  currentVisitors: "Current Visitors",

  // Tabs
  tabQuiz: "Quiz",
  tabConcept: "Concepts",
  tabStatus: "Progress",
  tabMockExam: "📋 Mock Exam",
  tabPosts: "Posts",
  tabUsers: "Users",

  // Mock Exam
  mockExamTitle: "🎓 SAA-C03 Mock Exam",
  mockExamDescription: "Practice with the same format as the real exam",
  mockExamStart: "Start Exam (130 minutes)",
  mockExamInfo: "Questions: 50 | Time Limit: 130 min | Passing Score: 720",
  mockExamLanguageNote: "💡 Once you start the exam, changing the language UI won't affect the exam language",
  mockExamEmpty: "You haven't started a mock exam yet",
  mockExamTimeRemaining: "Time Remaining",
  mockExamScore: "Estimated Score",
  mockExamResult: "Mock Exam Results",
  mockExamResultCards: "📊 Result Cards",
  mockExamAnalysis: "📋 Problem Analysis",
  mockExamTotalScore: "Total Score",
  mockExamCorrect: "Correct",
  mockExamWrong: "Incorrect",
  mockExamPassScore: "Passing Score (720)",
  mockExamRatio: "Correct Rate",
  mockExamAdminForceCreate: "👨‍💼 Force Create (Admin)",
  mockExamPdfDownload: "📥 Download PDF",
  mockExamPdfInfo: "PDF is available for download for 24 hours",
  mockExamPdfExpired: "PDF download period has expired (24 hours have passed)",
  mockExamAlreadyStartedToday: "⏰ You've already started the mock exam today.",
  mockExamNextAttempt: "You can try again at midnight (UTC 00:00) tomorrow.",
  mockExamCurrentUTC: "Current UTC",
  mockExamRetryAtMidnight: "You can try again at midnight (UTC 00:00)",

  // Filter
  filterAll: "All",

  // Difficulty
  diffMedium: "Medium",
  diffHard: "Hard",
  diffChallenge: "Challenge",

  // Slots
  slotsTitle: "Service Slots",
  slotClickToAdd: "+ Click to add",

  // Buttons
  btnReset: "Reset",
  btnGenerate: "🚀 Generate SAA-C03 Problem",
  btnGenerating: " Generating...",
  btnNextProblem: "Generate Another Problem",

  // Problem labels
  labelConstraints: "Constraints:",
  labelCorrect: "✅ Correct!",
  labelWrong: "❌ Wrong",
  labelAnswer: "Answer:",
  labelExplanation: "Explanation:",
  labelTrapOption: "Why this option is wrong:",
  labelPatterns: "🎯 Key Patterns:",

  // Concept section headers
  sectionEasy: "💡 Easy Explanation",
  sectionPoints: "🎯 Key Points",
  sectionRelated: "🔗 Related Services",

  // Empty states
  emptyConceptHint: "Select a service on the graph to see\ndetailed concepts",
  emptyStatus: "📈 Learning progress stats coming soon",

  // Graph
  graphLabel: "📊 AWS Service Relationship Map (Drag to move)",

  // Error
  errorGenerate: "Failed to generate problem",

  // Streak
  streakSuffix: " day streak",

  // Concept translation
  conceptTranslating: "Translating...",

  // Login related
  btnLogin: "🔐 Login",
  msgLoginTip: "Get 2 free attempts per day when logged in",
  googleLoginBtn: "Login with Google",
  logoutBtn: "Logout",
  userStatusGuest: "🔐 Guest",
  userStatusLoggedIn: "✨ Logged in",
  userStatusPaid: "💎 Premium",

  // Login modal
  verifyEmailTitle: "🔐 Verify email",
  verifyEmailDesc: "Enter your email address.",
  verifyEmailPlaceholder: "your.email@example.com",
  verifyBtn: "Verify",
  continueWithGoogle: "Continue with Google",
  continueWithMicrosoft: "Continue with Microsoft",
  loginGetTitle: "✨ Log in to get:",
  aiFeature: "🎯 Select AWS nodes and AI automatically generates personalized SAA-C03 problems",
  loginFreeAttempts: "📌 2 free attempts per day",
  loginUpgradeOffer: "💎 Or upgrade to 20 problems/day for $14.99/month",
  loginMockExamFeature: "📋 Daily mock exam 1 session (50 questions, 130 minutes)",
  cancelBtn: "Cancel",
  btnSignUp: "Sign Up",
  btnLogIn: "Log In",
  passwordPlaceholder: "Password (6+ characters)",
  alreadyHaveAccount: "Already have an account?",
  dontHaveAccount: "Don't have an account?",

  // Premium related
  premiumTitle: "💎 Upgrade to Premium",
  premiumPrice: "$14.99 / month",
  premiumFeature1: "✅ 20 problems per day",
  premiumFeature2: "✅ Daily mock exam (50 questions, 130 min)",
  premiumFeature3: "✅ All difficulty levels",
  premiumFeature4: "✅ Completely ad-free",
  premiumUpgradeBtn: "✨ Upgrade Now",
  premiumPlan: "Premium Plan",
  premiumBenefits: "Premium Plan",
  premiumUnlimited: "✅ 20 problems per day",
  premiumAllDifficulty: "✅ All difficulty levels",
  premiumAdFree: "✅ Completely ad-free",
  premiumCancelAnytime: "✅ Cancel anytime",

  // Premium features card (Mock Exam section)
  mockExamPremiumTitle: "💎 Premium Features",
  mockExamPremiumDesc: "SAA-C03 mock exam is only available for premium subscribers.",
  mockExamPremiumSubscription: "✅ Premium Subscription ($14.99/month)",
  mockExamPremiumUpgradeBtn: "💳 Upgrade to Premium",
  mockExamPremiumLoginBtn: "Or login",
  mockExamPremiumNote: "💡 Log in and upgrade to premium to take the mock exam daily!",
  mockExamPremiumDaily: "📋 Daily mock exam once per day (50 questions, 130 min)",
  mockExamPremiumAnalysis: "📊 Detailed performance analysis",
  premiumFeatureList1: "🚀 20 problems per day",
  premiumFeatureList2: "📋 Daily mock exam once per day (50 questions, 130 min)",
  premiumFeatureList3: "📊 Detailed performance analysis",
  premiumFeatureList4: "🎯 All difficulty levels (Medium, Hard, Challenge)",

  // Status related
  guestStatus: "🔐 Guest",
  loggedInStatus: "✨ Logged in",
  paidStatus: "💎 Premium (Paid)",
  quotaFullGuest: "🔐 Daily limit reached (2/2). Please log in for 2 free attempts, or upgrade your plan.",
  quotaFullLoggedIn: "✨ Your free 2 attempts are used. Please upgrade to generate more problems today!",

  // D-Day related
  examDateLabel: "📅 Set Exam Start Date",
  examDateTitle: "📅 Set Exam Start Date",
  examDateHint: "SAA-C03 Exam Date (Exam is 84 days after start date)",
  examDateTip: "✨ Tip: Exam date is 84 days after the start date. 📍 Check the D-day in the top right corner!",
  examDateSetBtn: "✅ Complete",
  examDateCancelBtn: "Cancel",
  labelQuotaFull: "Upgrade",

  // Hero Section
  heroTitle: "✨ AWS SAA-C03 Exam Preparation Platform",
  heroDescription: "AWS Archive is an AI-powered platform that helps you prepare for the AWS Solutions Architect Associate certification. Free plan: 2 problems/day. Premium ($14.99/month): 20 problems/day + daily mock exams + advanced analytics.",
  heroClose: "Close",
  heroDontShowToday: "Don't show for 24 hours",

  // Page metadata & SEO
  pageTitle: "AWS SAA-C03 Exam Prep - Claude AI Question Generator",
  pageDescription: "Master AWS SAA-C03 with Claude AI. Interactive service architecture map, AI-powered questions, learning analytics, and unlimited practice.",
  pageKeywords: "AWS SAA-C03, AWS certification, AWS exam, cloud architect, AWS solutions architect, exam prep, AI question generator, practice exam",
  ogTitle: "AWS SAA-C03 Certification Exam - AI-Powered Study Tool",
  ogDescription: "Interactive AWS service map and AI-generated questions to help you pass the AWS SAA-C03 Solutions Architect Associate exam.",
  twitterTitle: "AWS SAA-C03 Exam Prep - Claude AI",
  twitterDescription: "Practice AWS SAA-C03 with an intelligent question generator and service architecture visualization.",

  // Dashboard/Status tab
  dashboardTitle: "📈 Learning Progress",
  statisticsLabel: "📊 Statistics",
  totalProblems: "Total Problems",
  correctRate: "Accuracy",
  consecutiveDays: "Streak",
  weakServices: "Weak Services",
  weakServicesDesc: "(Most incorrect)",
  timesAnswered: "times",
  setExamDate: "Edit Exam Date",
  examDatePlaceholder: "YYYY-MM-DD",
  loginPrompt: "Sign in to save your learning progress",
  loginButton: "Get Started with Google",
  noData: "No data yet",
  generatedSessionsTitle: "Generated PDFs",
  sessionAutoDeleteNotice: "⏱️ Generated PDFs are automatically deleted after 1 day",
  sessionPdfDescription: "💡 PDF contains quiz answers for each session",

  // Posts
  postsWrite: "Write Post",
  postsTitle: "Title",
  postsContent: "Content",
  postsAuthor: "Author",
  postsDate: "Date",
  postsPublic: "🌐 Public",
  postsSecret: "🔒 Private",
  postsPassword: "Password",
  postsSearch: "Search title...",
  postsMine: "My Posts",
  postsSubmit: "Post",
  postsCancel: "Cancel",
  postsEmpty: "No posts available",
  postsPasswordRequired: "Please enter the password",
  postsPasswordWrong: "Incorrect password",
  postsLoginRequired: "Login required to write posts",
  postsDeleteConfirm: "Are you sure you want to delete this post?",
  postsDelete: "Delete",
  postsView: "Views",
  postsPage: "Page",

  // Quiz Result Messages
  quizCorrect: "✅ Correct!",
  quizIncorrect: "❌ Incorrect.",
  quizKeyGoal: "🎯 Key Goal:",
  quizAnswer: "Answer:",
  quizExplanation: "Explanation",
  quizTrap: "⚠️ Trap:",
  quizKeywords: "📌 Key Keywords:",
  quizEasyMode: "👶 Easy Mode",
  quizEasyModeClose: "🧠 Close Easy Mode",
  quizEasyModeExplanation: "🎈 Easy Mode Explanation:",
  quizEachOptionExplanation: "Each Option Explanation:",
  quizCorePattern: "📚 Core Pattern",

  // Mock Exam Results
  mockExamPass: "🎉 Pass!",
  mockExamRetry: "Retry Needed",

  // Mock Exam Difficulty (context specific)
  diffMediumLabel: "Medium",
  diffHardLabel: "Hard",
  diffChallengeLabel: "Challenge",

  // PDF Export related
  pdfMockExamResults: "SAA-C03 Mock Exam Results",
  pdfStatus: "Status",
  pdfUserAnswer: "Your Answer",
  pdfTimeTaken: "Time Taken",
  pdfMinutes: "minutes",
  pdfSeconds: "seconds",
  pdfDetailedAnalysis: "Detailed Problem Analysis",
  pdfGoal: "🎯 Key Goal:",
  pdfAnswer: "Answer:",
  pdfExplanation: "Explanation:",
  pdfTrap: "⚠️ Trap:",
  pdfKeywords: "📌 Key Keywords:",
  pdfEasyMode: "👨‍🏫 Easy Explanation:",
  pdfOptionExplanations: "Each Option Explanation:",
  pdfOptions: "Options",
  pdfTotalScore: "Total Score",
  pdfTimeSpent: "Time Spent",
  pdfCorrect: "Correct",
  pdfWrong: "Wrong",
  pdfCorrectRate: "Correct Rate",

  // Exam Date Related
  examStartDateSetting: "📅 Exam Start Date Setting",
  examSelectDate: "Select a date",
  examDaysRemaining: "{n} days left until exam",
  examToday: "Today is the exam day",
  examDatePassed: "Exam date has passed",

  // Admin & Permissions
  adminLabel: "Admin",
  errorPermissionDenied: "You don't have permission.",
  errorAdminOnly: "Admin only.",

  // Validation & Error Messages
  errorInvalidEmail: "Please enter valid email",
  errorPasswordInvalid: "Password error",
  errorTooManyRequests: "Too many requests. Try again later.",
  errorProblemGeneration: "Problem generation failed",

  // Mock Exam Grading Messages
  mockExamNoAnswersGrading: "Nothing solved. Really grade?\nScore: 0 / Fail 🚫",
  mockExamPartialAnswersGrading: "{n} problems not solved.\nReally grade?",

  // Session Details
  sessionDetailsView: "View details for {n} problems",
};
