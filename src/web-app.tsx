import html2pdf from "html2pdf.js/dist/html2pdf.js";
import { useEffect, useRef, useState } from "react";
import { getDailyVisitorsForMonth, getMonthlyVisitors, getTodayPurchaseCount, getTotalVisitorCount, getWeeklyVisitorsForMonth, trackVisitor } from "./analytics";
import { Concept, generateSAAProblem, Problem } from "./api";
import { CAT, CONCEPTS_KO, LINKS, NODES } from "./data";
import { createPost, deleteExpiredResults, deletePost, getAdminStats, getAllUsersForAdmin, getCurrentUser, getExamStartDate, getPostById, getPosts, getUserProblemSessions, getUserQuizStats, recordQuizResult, saveExamStartDate, signIn, signInWithGoogle, signOut, signUp, updateStreakInFirebase, uploadPDFToStorage, getTodayMockExamProblems, saveTodayMockExamProblems, onAuthStateChange, saveUserInfoToFirebase, getUserPaidStatus, updateUserPaidStatus, getAdminStatsSecure, getAllUsersForAdminSecure, getUserProblemSessionsSecure } from "./firebase";
import { useLocale } from "./LocaleContext";
import Footer from "./components/Footer";
import PaymentModal from "./components/Modals/PaymentModal";
import "./styles.css";

// ===== 입력값 검증 함수 =====
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) return { valid: false, error: "비밀번호는 6자 이상이어야 합니다" };
  if (password.length > 128) return { valid: false, error: "비밀번호는 128자 이하여야 합니다" };
  return { valid: true };
}

function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date > new Date();
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 500); // XSS 방지: 길이 제한
}

// ===== Rate Limiting =====
const requestTimestamps: { [key: string]: number[] } = {};
const RATE_LIMIT_REQUESTS = 10; // 10초당 최대 10요청
const RATE_LIMIT_WINDOW = 10000; // 10초

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  if (!requestTimestamps[userId]) {
    requestTimestamps[userId] = [];
  }

  const timestamps = requestTimestamps[userId];
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentTimestamps.length >= RATE_LIMIT_REQUESTS) {
    return false; // Rate limit exceeded
  }

  recentTimestamps.push(now);
  requestTimestamps[userId] = recentTimestamps;
  return true;
}

// ===== 사용자 인증 및 일일 제한 관리 =====
type UserStatus = "guest" | "loggedIn" | "paid";

function getUserStatus(): UserStatus {
  if (typeof window === "undefined") return "guest";
  const status = localStorage.getItem("userStatus");
  return (status as UserStatus) || "guest";
}

function setUserStatus(status: UserStatus) {
  localStorage.setItem("userStatus", status);
}

function getTodayProblemCount(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  const stored = localStorage.getItem("problemCountDate");
  if (stored !== today) {
    localStorage.setItem("problemCountDate", today);
    localStorage.setItem("problemCount", "0");
    return 0;
  }
  return parseInt(localStorage.getItem("problemCount") || "0", 10);
}

function incrementProblemCount() {
  const count = getTodayProblemCount() + 1;
  localStorage.setItem("problemCount", count.toString());
}

function getDailyLimit(): number {
  const status = getUserStatus();
  if (status === "paid") return 20;
  if (status === "loggedIn") return 2;
  return 2; // 비로그인은 2회
}

// ===== 세션 타임아웃 =====
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
let sessionTimeoutId: NodeJS.Timeout | null = null;

function resetSessionTimeout(callback: () => void) {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }

  sessionTimeoutId = setTimeout(() => {
    callback(); // 로그아웃 실행
  }, SESSION_TIMEOUT);
}

function clearSessionTimeout() {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
}

/**
 * 운영자 계정 확인 (서버 API를 통해 검증, 실패 시 localStorage 사용)
 */
async function isAdminUser(email: string | null): Promise<boolean> {
  if (!email) return false;

  // localStorage에 캐시된 값 확인
  const cachedAdmin = localStorage.getItem(`isAdmin_${email}`);
  if (cachedAdmin !== null) {
    return cachedAdmin === 'true';
  }

  // 서버 API 시도 (포트 5000-5009 시도)
  try {
    // 상대 경로 사용 - 자동으로 현재 호스트와 포트 사용
    const response = await fetch('/api/checkAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(2000) // 2초 타임아웃
    });
    const data = await response.json();
    const isAdmin = data.isAdmin || false;

    // 결과를 localStorage에 캐시 (24시간)
    localStorage.setItem(`isAdmin_${email}`, String(isAdmin));
    localStorage.setItem(`isAdmin_${email}_time`, String(Date.now()));

    return isAdmin;
  } catch (error) {
    // 서버 호출 실패 - 다음 단계로
  }

  // 모든 포트 시도 실패 시 로컬 fallback 사용
  // (server.js가 실행 중이 아닐 때의 정상 동작)
  const adminEmails = ['imjaichoipro@gmail.com']; // 운영자 이메일 목록
  const paidTestEmails = ['imjaichoi@naver.com']; // 임시 테스트용 paid 이메일
  const isAdmin = adminEmails.includes(email);
  const isPaidTestUser = paidTestEmails.includes(email);

  // 결과를 localStorage에 캐시
  localStorage.setItem(`isAdmin_${email}`, String(isAdmin));

  return isAdmin;
}

/**
 * 이메일 마스킹 (개인정보 보호)
 * 예: imjaichoipro@gmail.com → im****ipro@gmail.com
 */
function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;

  // 첫 2글자 + **** + 마지막 4글자
  const masked = name.substring(0, 2) + '****' + name.slice(-4);
  return `${masked}@${domain}`;
}

/**
 * 연속 방문 일수 계산 및 업데이트
 */
function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  const lastVisitDate = localStorage.getItem("lastVisitDate");
  let streak = parseInt(localStorage.getItem("streak") || "0");

  if (lastVisitDate === today) {
    // 오늘 이미 방문함 - streak 유지
    return streak;
  }

  if (lastVisitDate) {
    const lastDate = new Date(lastVisitDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // 어제 방문했으므로 카운트 증가
      streak += 1;
    } else if (diffDays > 1) {
      // 2일 이상 지났으므로 리셋
      streak = 1;
    }
  } else {
    // 첫 방문
    streak = 1;
  }

  localStorage.setItem("lastVisitDate", today);
  localStorage.setItem("streak", streak.toString());
  return streak;
}

function getExamDday(): string {
  if (typeof window === "undefined") return "-";
  const examDate = localStorage.getItem("examStartDate");
  if (!examDate) return "-";

  const exam = new Date(examDate);
  const now = new Date();

  exam.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = exam.getTime() - now.getTime();
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return "D-Day";
  return `D-${daysLeft}`;
}

function setExamStartDate() {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("examStartDate", today);
}

const W = 900, H = 520;

function initPos() {
  const centers: Record<string, {x:number;y:number}> = {
    compute:{x:160,y:140}, storage:{x:760,y:140}, database:{x:760,y:420},
    network:{x:460,y:90}, security:{x:160,y:420}, messaging:{x:460,y:500}, monitor:{x:80,y:300},
  };
  const cnt: Record<string,number> = {};
  const pos: Record<string, {x:number;y:number;vx:number;vy:number}> = {};
  NODES.forEach(n => {
    const c = centers[n.cat];
    const i = cnt[n.cat] || 0;
    cnt[n.cat] = i + 1;
    const a = (i / 5) * 2 * Math.PI;
    const r = 65;
    pos[n.id] = {
      x: c.x + Math.cos(a) * r + (Math.random() - 0.5) * 20,
      y: c.y + Math.sin(a) * r + (Math.random() - 0.5) * 20,
      vx: 0, vy: 0,
    };
  });
  return pos;
}

function useForce() {
  const [pos, setPos] = useState(initPos);
  const posRef = useRef(pos);
  const dragRef = useRef<string | null>(null);
  posRef.current = pos;

  useEffect(() => {
    let running = true, frame = 0;
    const tick = () => {
      if (!running) return;
      frame++;
      if (frame > 450) { running = false; return; }
      const p = { ...posRef.current };
      const ids = NODES.map(n => n.id);
      ids.forEach(id => {
        if (dragRef.current === id) return;
        const node = { ...p[id] };
        let fx = 0, fy = 0;
        // Repulsion
        ids.forEach(o => {
          if (o === id) return;
          const d2 = Math.max((node.x - p[o].x) ** 2 + (node.y - p[o].y) ** 2, 1);
          const d = Math.sqrt(d2);
          const f = 5500 / d2;
          fx += (node.x - p[o].x) / d * f;
          fy += (node.y - p[o].y) / d * f;
        });
        // Link attraction
        LINKS.forEach(l => {
          const o = l.s === id ? l.t : l.t === id ? l.s : null;
          if (!o) return;
          const dx = p[o].x - node.x, dy = p[o].y - node.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - 150) * 0.03;
          fx += dx / d * f;
          fy += dy / d * f;
        });
        // Category clustering
        const myN = NODES.find(n => n.id === id)!;
        ids.forEach(o => {
          const oN = NODES.find(n => n.id === o);
          if (!oN || oN.cat !== myN.cat || o === id) return;
          const dx = p[o].x - node.x, dy = p[o].y - node.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - 100) * 0.012;
          fx += dx / d * f;
          fy += dy / d * f;
        });
        // Center gravity
        fx += (W / 2 - node.x) * 0.005;
        fy += (H / 2 - node.y) * 0.005;
        const damp = 0.78;
        node.vx = (node.vx + fx * 0.016) * damp;
        node.vy = (node.vy + fy * 0.016) * damp;
        node.x = Math.max(38, Math.min(W - 38, node.x + node.vx));
        node.y = Math.max(38, Math.min(H - 38, node.y + node.vy));
        p[id] = node;
      });
      setPos({ ...p });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { running = false; };
  }, []);

  return { pos, setPos, posRef, dragRef };
}

function GraphSVG({ pos, setPos, posRef, dragRef, selected, slots, onNodeClick, catFilter }: {
  pos: Record<string, any>;
  setPos: any;
  posRef: any;
  dragRef: any;
  selected: string | null;
  slots: string[];
  onNodeClick: (id: string | null) => void;
  catFilter: string | null;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const connectedIds = selected
    ? new Set([selected, ...LINKS.filter(l => l.s === selected || l.t === selected).flatMap(l => [l.s, l.t])])
    : null;

  const getSvgXY = (cx: number, cy: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
  };

  const R = 28;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", width: "100%", height: "100%", background: "#060e18", touchAction: "none", cursor: "grab" }}
      onMouseMove={e => {
        if (dragRef.current) {
          const { x, y } = getSvgXY(e.clientX, e.clientY);
          setPos((p: any) => ({ ...p, [dragRef.current!]: { ...p[dragRef.current!], x, y, vx: 0, vy: 0 } }));
        }
      }}
      onMouseUp={() => { dragRef.current = null; }}
      onMouseLeave={() => { dragRef.current = null; }}
      onTouchMove={e => {
        e.preventDefault();
        if (dragRef.current) {
          const t = e.touches[0];
          const { x, y } = getSvgXY(t.clientX, t.clientY);
          setPos((p: any) => ({ ...p, [dragRef.current!]: { ...p[dragRef.current!], x, y, vx: 0, vy: 0 } }));
        }
      }}
      onTouchEnd={() => { dragRef.current = null; }}
    >
      <defs>
        <filter id="glow1" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background dots */}
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={(i * 179 + 53) % W} cy={(i * 113 + 41) % H}
          r={i % 6 === 0 ? 1.3 : 0.5} fill="white" opacity={0.06 + (i % 4) * 0.03} />
      ))}

      {/* Links */}
      {LINKS.map((link, i) => {
        const sp = pos[link.s], tp = pos[link.t];
        if (!sp || !tp) return null;
        const active = !selected || (connectedIds?.has(link.s) && connectedIds?.has(link.t));
        const srcNode = NODES.find(n => n.id === link.s);
        return (
          <line key={i} x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
            stroke={active ? (srcNode ? CAT[srcNode.cat].color : "#fff") : "rgba(255,255,255,0.05)"}
            strokeWidth={active ? 2 : 1}
            opacity={active ? 0.5 : 0.15}
            pointerEvents="none"
          />
        );
      })}

      {/* Nodes */}
      {NODES.map(n => {
        const p = pos[n.id];
        if (!p) return null;
        const cat = CAT[n.cat];
        const isSelected = n.id === selected;
        const isSlotted = slots.includes(n.id);
        const isConnected = connectedIds?.has(n.id);
        const dimmed = (selected && !isConnected) || (catFilter && n.cat !== catFilter);
        const r = isSelected ? 32 : isSlotted ? 30 : R;

        return (
          <g key={n.id}
            style={{ cursor: "pointer" }}
            onMouseDown={e => { e.stopPropagation(); dragRef.current = n.id; }}
            onTouchStart={e => { e.stopPropagation(); dragRef.current = n.id; }}
            onClick={e => { e.stopPropagation(); onNodeClick(n.id); }}
          >
            {/* Glow ring */}
            {(isSelected || isSlotted) && (
              <circle cx={p.x} cy={p.y} r={r + 6} fill="none"
                stroke={cat.glow} strokeWidth={2} opacity={0.5} filter="url(#glow1)" />
            )}
            {/* Main circle */}
            <circle cx={p.x} cy={p.y} r={r} fill={cat.color}
              opacity={dimmed ? 0.2 : (isSelected ? 1 : 0.8)}
              filter={isSelected ? "url(#glow1)" : undefined}
            />
            {/* Emoji */}
            <text x={p.x} y={p.y - 2} textAnchor="middle" dominantBaseline="middle"
              fontSize={isSelected ? 18 : 15} fill="white" pointerEvents="none">
              {n.emoji}
            </text>
            {/* Label */}
            <text x={p.x} y={p.y + r + 14} textAnchor="middle" fontSize={10}
              fill={dimmed ? "rgba(255,255,255,0.2)" : "#cbd5e1"} pointerEvents="none" fontWeight={isSelected ? 700 : 400}>
              {n.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function App() {
  const { locale, setLocale, t } = useLocale();
  const { pos, setPos, posRef, dragRef } = useForce();
  const [tab, setTab] = useState<"quiz" | "concept" | "status" | "mockExam" | "posts" | "admin" | "users">("quiz");
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"medium" | "hard" | "challenge">("medium");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEasyMode, setShowEasyMode] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [totalVisitorCount, setTotalVisitorCount] = useState(0);
  const [graphPanelWidth, setGraphPanelWidth] = useState(50); // 비율 (%)
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPosRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [paidUsers, setPaidUsers] = useState(0);
  const [freeUsers, setFreeUsers] = useState(0);
  const [allUsers, setAllUsers] = useState<Array<{ userId: string; email: string; userStatus: string; createdAt: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<any[]>([]);
  const [graphPeriod, setGraphPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [graphMonthOffset, setGraphMonthOffset] = useState(0);
  const [graphWeekIndex, setGraphWeekIndex] = useState(0);
  const [graphData, setGraphData] = useState<Array<{ label: string; count: number }>>([]);
  const [graphZoom, setGraphZoom] = useState(1);
  const [conceptCache, setConceptCache] = useState<Map<string, Concept>>(new Map());
  const [conceptTranslating, setConceptTranslating] = useState(false);

  // 모의시험
  const [mockExamRunning, setMockExamRunning] = useState(false);
  const [mockExamProblems, setMockExamProblems] = useState<Problem[]>([]);
  const [mockExamStartTime, setMockExamStartTime] = useState<number | null>(null);
  const [mockExamCurrentIndex, setMockExamCurrentIndex] = useState(0);
  const [mockExamAnswers, setMockExamAnswers] = useState<(string | null)[]>([]);
  const [mockExamResults, setMockExamResults] = useState<{
    totalScore: number;
    correct: number;
    wrong: number;
    correctRate: number;
    passed: boolean;
    timeSpent: number;
  } | null>(null);
  const [mockExamTimeRemaining, setMockExamTimeRemaining] = useState(130 * 60); // 130분 (초)
  const [mockExamIsLoading, setMockExamIsLoading] = useState(false); // 문제 로딩 중 표시
  const [mockExamAlreadyTaken, setMockExamAlreadyTaken] = useState(false); // 오늘 이미 본 여부
  const [mockExamNextAvailableTime, setMockExamNextAvailableTime] = useState<string>(""); // 다시 볼 수 있는 시간
  const [mockExamPdfCreatedAt, setMockExamPdfCreatedAt] = useState<number | null>(null); // PDF 생성 시간
  const [currentUtcTime, setCurrentUtcTime] = useState<string>(""); // 현재 UTC 시간 (실시간)
  const [nextUtcDate, setNextUtcDate] = useState<string>(""); // 내일 UTC 날짜

  // 퀴즈 통계
  const [quizStats, setQuizStats] = useState<{
    totalAttempts: number;
    correctCount: number;
    accuracy: number;
    byDifficulty: {
      medium: { total: number; correct: number; accuracy: number };
      hard: { total: number; correct: number; accuracy: number };
      challenge: { total: number; correct: number; accuracy: number };
    };
    byService: { [service: string]: { total: number; correct: number; accuracy: number } };
  } | null>(null);

  // 사용자 상태 및 일일 제한
  const initialUserStatus: UserStatus = typeof window !== "undefined"
    ? (localStorage.getItem("userStatus") as UserStatus) || "guest"
    : "guest";
  const [userStatus, setUserStatusLocal] = useState<UserStatus>(initialUserStatus);
  const [dailyCount, setDailyCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [dday, setDday] = useState("-");
  const [showExamDateModal, setShowExamDateModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [sessionId, setSessionId] = useState<string>(`${Date.now()}`); // 현재 세션 ID
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null); // PDF 생성 중인 세션

  // 문제 세션 (PDF 다운로드용)
  const [problemSessions, setProblemSessions] = useState<Array<{
    date: string;
    time: string;
    problemCount: number;
    difficulty: string;
    problems: Problem[];
    sessionTimestamp: number;
  }> | null>(null);

  // 게시글 탭 상태
  const [posts, setPosts] = useState<any[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalCount, setPostsTotalCount] = useState(0);
  const [postsSearch, setPostsSearch] = useState("");
  const [postsFilterMine, setPostsFilterMine] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postFormData, setPostFormData] = useState({ title: "", content: "", authorName: "", password: "", isPublic: true });
  const [postFormLoading, setPostFormLoading] = useState(false);

  // 앱 초기화: 현재 있는 모든 PDF 삭제 & 날짜 변경 시 플래그 초기화 (한 번만 실행)
  useEffect(() => {
    localStorage.removeItem("mockExamPdfCreatedAt");
    console.log("✅ 앱 시작 시 모든 저장된 PDF 삭제 완료");

    // ✅ 자정이 지나면 모의시험 하루 제한 플래그 초기화
    const today = new Date().toISOString().split('T')[0];
    const mockExamStartedDate = localStorage.getItem("mockExamStartedToday");

    if (mockExamStartedDate && mockExamStartedDate !== today) {
      localStorage.removeItem("mockExamStartedToday");
      console.log("✅ 새로운 날짜 - 모의시험 제한 플래그 초기화 완료");
    }
  }, []);

  // 동적 메타데이터 업데이트 (다국어 SEO)
  useEffect(() => {
    const updateMetaTags = () => {
      const pageTitle = t("pageTitle");
      const pageDesc = t("pageDescription");
      const pageKeywords = t("pageKeywords");
      const ogTitle = t("ogTitle");
      const ogDesc = t("ogDescription");
      const twitterTitle = t("twitterTitle");
      const twitterDesc = t("twitterDescription");

      // 페이지 언어 업데이트
      const html = document.documentElement;
      const langMap: { [key: string]: string } = { ko: "ko", en: "en", ja: "ja" };
      html.lang = langMap[locale] || "ko";

      // title 업데이트
      document.title = pageTitle;

      // meta description 업데이트
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", pageDesc);

      // meta keywords 업데이트
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", pageKeywords);

      // Open Graph 업데이트
      const updateOGTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      };

      updateOGTag("og:title", ogTitle);
      updateOGTag("og:description", ogDesc);
      updateOGTag("og:locale", locale === "ja" ? "ja_JP" : locale === "en" ? "en_US" : "ko_KR");

      // Twitter Card 업데이트
      const updateTwitterTag = (name: string, content: string) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("name", name);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      };

      updateTwitterTag("twitter:title", twitterTitle);
      updateTwitterTag("twitter:description", twitterDesc);
    };

    updateMetaTags();
  }, [locale, t]);

  // Restore auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user?.email) {
        setUserEmail(user.email);

        // 사용자 정보를 Firestore에 저장
        try {
          await saveUserInfoToFirebase(user.uid, user.email);
        } catch (error) {
          // 에러 처리
        }

        // Firestore에서 결제 상태 로드
        try {
          const isPaid = await getUserPaidStatus(user.uid);
          const status: UserStatus = isPaid ? "paid" : "loggedIn";
          setUserStatusLocal(status);
          localStorage.setItem("userStatus", status);
        } catch (error) {
          const status = (localStorage.getItem("userStatus") as UserStatus) || "loggedIn";
          setUserStatusLocal(status);
        }
      } else {
        setUserEmail(null);
        setUserStatusLocal("guest");
        localStorage.removeItem("userStatus");
      }
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Track visitors and load purchase count on mount
  useEffect(() => {
    (async () => {
      try {
        const count = await trackVisitor();
        setVisitorCount(count);
        const totalCount = await getTotalVisitorCount();
        setTotalVisitorCount(totalCount);
        const purchaseCount = await getTodayPurchaseCount();
        setPurchaseCount(purchaseCount);
      } catch (error) {
        // 에러 처리만 수행 (로깅 제거)
      }
    })();

    // 일일 카운트 초기화
    setDailyCount(getTodayProblemCount());

    // D-day 초기화
    setDday(getExamDday());

    // 1초마다 D-day 업데이트
    const interval = setInterval(() => {
      setDday(getExamDday());
    }, 1000);

    // 화면 업데이트 강제 (날짜 변경 감지)
    const dateCheckInterval = setInterval(() => {
      const newDday = getExamDday();
      if (newDday !== dday) {
        setDday(newDday);
      }
    }, 60000); // 1분마다 확인

    return () => clearInterval(interval);
  }, []);

  // Check if user is admin (server verification)
  useEffect(() => {
    if (userEmail) {
      isAdminUser(userEmail).then(result => {
        setIsAdmin(result);
      });
    } else {
      setIsAdmin(false);
    }
  }, [userEmail]);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const accountMenu = document.querySelector('[data-account-menu]');
      if (accountMenu && !accountMenu.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  // UTC 시간 실시간 업데이트 (분 단위)
  useEffect(() => {
    const updateUtcTime = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const currentUtcStr = now.toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      const nextUtcStr = tomorrow.toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
      setCurrentUtcTime(currentUtcStr);
      setNextUtcDate(nextUtcStr);
    };

    updateUtcTime();
    const interval = setInterval(updateUtcTime, 60000); // 분 단위 업데이트
    return () => clearInterval(interval);
  }, []);

  // 로그인 후 streak 업데이트 + 시험 시작일 불러오기
  useEffect(() => {
    if (userEmail) {
      // Admin 자동 프리미엄 설정
      const paidTestEmails = ['imjaichoi@naver.com'];
      if (isAdmin || paidTestEmails.includes(userEmail)) {
        setUserStatusLocal("paid");
        localStorage.setItem("userStatus", "paid");
        if (paidTestEmails.includes(userEmail)) {
          console.log("✅ 테스트 이메일 자동 paid 처리:", userEmail);
        }
      }

      (async () => {
        try {
          // Firebase Auth의 실제 uid를 사용하여 업데이트
          const firebaseStreak = await updateStreakInFirebase(userStatus);
          setStreak(firebaseStreak);
          // 로컬 저장소에도 백업
          localStorage.setItem("streak", firebaseStreak.toString());

          // Firebase에서 시험 시작일 불러오기
          const user = getCurrentUser();
          if (user) {
            const examStartDate = await getExamStartDate(user.uid);
            if (examStartDate) {
              localStorage.setItem("examStartDate", examStartDate);
              setDday(getExamDday());
            }
          }
        } catch (error) {
          // Firebase 실패 시 로컬 함수 사용
          setStreak(updateStreak());
        }
      })();
    }
  }, [userEmail]);

  // Admin 탭 통계 로드 (서버 검증 포함)
  useEffect(() => {
    if (tab === "admin" && isAdmin && userEmail) {
      (async () => {
        try {
          const stats = await getAdminStatsSecure(userEmail);
          setPaidUsers(stats.paidUsers);
          setFreeUsers(stats.freeUsers);
        } catch (error) {
          // 에러 처리만 수행 (로깅 제거)
        }
      })();
    }
  }, [tab, isAdmin, userEmail]);

  // Users 탭 사용자 목록 로드 (서버 검증 포함)
  useEffect(() => {
    if (tab === "users" && isAdmin && userEmail) {
      (async () => {
        try {
          const users = await getAllUsersForAdminSecure(userEmail);
          setAllUsers(users);
          setSelectedUser(null);
          setSelectedUserSessions([]);
        } catch (error) {
          // 에러 처리만 수행 (로깅 제거)
        }
      })();
    }
  }, [tab, isAdmin, userEmail]);

  // 그래프 데이터 업데이트
  useEffect(() => {
    (async () => {
      try {
        if (graphPeriod === "daily") {
          const data = await getDailyVisitorsForMonth(graphMonthOffset);
          setGraphData(data.map(d => ({ label: d.date, count: d.count })));
        } else if (graphPeriod === "weekly") {
          const data = await getWeeklyVisitorsForMonth(graphMonthOffset);
          setGraphData(data.map(d => ({ label: d.week, count: d.count })));
        } else if (graphPeriod === "monthly") {
          const data = await getMonthlyVisitors();
          setGraphData(data.map(d => ({ label: d.month, count: d.count })));
        }
        setGraphZoom(1);
      } catch (error) {
        // 에러 처리만 수행 (로깅 제거)
      }
    })();
  }, [graphPeriod, graphMonthOffset, graphWeekIndex]);

  const onNodeClick = (id: string | null) => {
    if (!id) return;
    setSelected(id);
    // Add to slots
    if (!slots.includes(id) && slots.length < 4) {
      setSlots(s => [...s, id]);
    }
  };

  const removeSlot = (id: string) => {
    setSlots(s => s.filter(x => x !== id));
    if (selected === id) setSelected(null);
  };

  const resetSlots = () => {
    setSlots([]);
    setSelected(null);
    setDifficulty("medium");
    setProblem(null);
    setSelectedAnswer(null);
    setError(null);
  };

  // 탭 변경 시 에러 상태 초기화
  useEffect(() => {
    setError(null);
  }, [tab]);

  // 그래프 패널 리사이징
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeStartPosRef.current) return;

      const mainArea = document.querySelector('.main-area') as HTMLElement;
      if (!mainArea) return;

      const rect = mainArea.getBoundingClientRect();
      const deltaX = e.clientX - resizeStartPosRef.current.startX;
      const deltaPercent = (deltaX / rect.width) * 100;
      const newWidth = resizeStartPosRef.current.startWidth - deltaPercent;

      // 최소 25%, 최대 75% 제약
      if (newWidth >= 25 && newWidth <= 75) {
        setGraphPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartPosRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  const handleGenerateProblem = async () => {
    // 로그인 확인
    if (!userEmail) {
      setShowLoginModal(true);
      return;
    }

    if (slots.length === 0) return;

    // 일일 제한 확인 (운영자는 제한 없음)
    if (!isAdmin) {
      const limit = getDailyLimit();
      if (dailyCount >= limit) {
        setError(getQuotaMessage(userStatus, limit, dailyCount));
        setShowAuthModal(true);
        return;
      }
    }

    // Rate Limiting 확인
    if (!checkRateLimit(userEmail)) {
      setError("너무 많은 요청이 발생했습니다. 잠시 후 다시 시도하세요");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setShowEasyMode(false);

    try {
      const serviceNames = slots.map(id => {
        const node = NODES.find(n => n.id === id);
        return node?.name || id;
      });

      const generatedProblem = await generateSAAProblem(serviceNames, difficulty, locale);
      setProblem(generatedProblem);

      // 카운트 증가
      incrementProblemCount();
      setDailyCount(getTodayProblemCount());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGenerate"));
      // 에러 처리만 수행 (로깅 제거)
    } finally {
      setLoading(false);
    }
  };

  // 할당량 메시지 생성
  function getQuotaMessage(status: UserStatus, limit: number, current: number): string {
    const remaining = Math.max(0, limit - current);
    if (status === "guest") {
      return `🔐 Daily limit reached (2/2). Please log in for 2 free attempts, or upgrade your plan.`;
    }
    if (status === "loggedIn") {
      return `✨ Your free 2 attempts are used. Please upgrade to generate more problems today!`;
    }
    return `Limit reached (${current}/${limit}).`;
  }

  // Get concept for current locale
  const getConceptForLocale = async () => {
    if (!selected) return null;

    const conceptsByLocale = {
      ko: CONCEPTS_KO,
      en: CONCEPTS_KO, // Fallback to Korean (English version not available yet)
      ja: CONCEPTS_KO, // Fallback to Korean (Japanese version coming soon)
    };

    return conceptsByLocale[locale][selected] || null;
  };

  const [concept, setConcept] = useState<Concept | null>(null);

  // 현황 탭에서 퀴즈 통계 로드
  useEffect(() => {
    if (tab === "status") {
      (async () => {
        const user = getCurrentUser();
        if (user) {
          try {
            // 만료된 결과 자동 삭제
            await deleteExpiredResults(user.uid);

            const stats = await getUserQuizStats(user.uid);
            setQuizStats(stats);

            const sessions = await getUserProblemSessions(user.uid);
            setProblemSessions(sessions);
          } catch (error) {
            // 에러 처리만 수행 (로깅 제거)
          }
        } else {
          setQuizStats(null);
          setProblemSessions(null);
        }
      })();
    }
  }, [tab, userEmail]);

  // 모의시험 일일 제한 체크 및 PDF 초기화
  useEffect(() => {
    if (tab === "mockExam") {
      const today = new Date().toISOString().split("T")[0];
      const lastMockExamDate = localStorage.getItem("lastMockExamDate");
      const pdfCreatedAtStr = localStorage.getItem("mockExamPdfCreatedAt");

      // PDF 24시간 자동 삭제 로직
      if (pdfCreatedAtStr) {
        const pdfCreatedAt = parseInt(pdfCreatedAtStr, 10);
        const now = Date.now();
        const elapsedHours = (now - pdfCreatedAt) / (1000 * 60 * 60);

        // 24시간이 지났으면 자동 삭제
        if (elapsedHours >= 24) {
          localStorage.removeItem("mockExamPdfCreatedAt");
          setMockExamPdfCreatedAt(null);
        } else {
          setMockExamPdfCreatedAt(pdfCreatedAt);
        }
      }

      // 👨‍💼 Admin은 무제한 응시 가능
      if (lastMockExamDate === today && !isAdmin) {
        // 오늘 이미 본 경우 (admin 제외)
        setMockExamAlreadyTaken(true);
        // 내일 자정까지의 남은 시간 계산
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const now = new Date();
        const remainingMs = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setMockExamNextAvailableTime(`${hours}시간 ${minutes}분`);
      } else {
        setMockExamAlreadyTaken(false);
        setMockExamNextAvailableTime("");
        // 새로운 날짜이면 PDF 시간 초기화
        localStorage.removeItem("mockExamPdfCreatedAt");
        setMockExamPdfCreatedAt(null);
      }
    }
  }, [tab, userEmail]);

  // 모의시험 타이머
  useEffect(() => {
    if (!mockExamRunning) return;

    const timer = setInterval(() => {
      setMockExamTimeRemaining(prev => {
        if (prev <= 1) {
          // 시간 종료 - 자동 채점
          let correct = 0;
          mockExamProblems.forEach((problem, idx) => {
            if (mockExamAnswers[idx] === problem.answer) correct++;
          });
          const score = Math.round((correct / mockExamProblems.length) * 1000);
          const timeSpent = mockExamStartTime ? Math.floor((Date.now() - mockExamStartTime) / 1000) : 0;

          const results = {
            totalScore: score,
            correct: correct,
            wrong: mockExamProblems.length - correct,
            correctRate: Math.round((correct / mockExamProblems.length) * 100),
            passed: score >= 720,
            timeSpent: timeSpent
          };
          setMockExamResults(results);
          setMockExamRunning(false);

          // 👨‍💼 Admin은 일일 제한 없음 (lastMockExamDate 저장 안 함)
          // 일반 사용자는 오늘 날짜 저장 (일일 제한)
          const today = new Date().toISOString().split("T")[0];
          const isAdmin = isAdmin;
          if (!isAdmin) {
            localStorage.setItem("lastMockExamDate", today);
            setMockExamAlreadyTaken(true);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mockExamRunning, mockExamProblems, mockExamAnswers, mockExamStartTime]);

  // 📊 모의시험 백그라운드 점진적 로딩 (1 → 4 → 9 → 19 → 50)
  // UTC 기준으로 생성된 문제 사용 (모든 사용자 공유)
  useEffect(() => {
    if (!mockExamRunning || mockExamProblems.length >= 50) return;

    (async () => {
      try {
        const storedDifficulties = localStorage.getItem("mockExamDifficulties");
        const storedAllProblems = localStorage.getItem("mockExamAllProblems");

        if (!storedDifficulties || !storedAllProblems) return;

        const difficulties = JSON.parse(storedDifficulties);
        const allProblems = JSON.parse(storedAllProblems);
        let newProblems = [...mockExamProblems];

        // 점진적 로딩 패턴: 1 → 4 → 9 → 19 → 50
        const loadBatches = [
          { count: 3, target: 4, delay: 1000 },     // 1초 후 3개 추가 (총 4개)
          { count: 5, target: 9, delay: 1000 },     // 2초 후 5개 추가 (총 9개)
          { count: 10, target: 19, delay: 1000 },   // 3초 후 10개 추가 (총 19개)
          { count: 31, target: 50, delay: 1000 }    // 4초 후 31개 추가 (총 50개)
        ];

        for (const batch of loadBatches) {
          if (mockExamRunning && newProblems.length < batch.target) {
            // 대기
            await new Promise(resolve => setTimeout(resolve, batch.delay));

            if (!mockExamRunning) break;

            // 배치만큼 문제 추가 (캐시된 문제 또는 생성)
            const startIdx = newProblems.length;
            for (let i = 0; i < batch.count && startIdx + i < 50; i++) {
              if (startIdx + i < allProblems.length) {
                // 캐시된 문제 사용
                newProblems.push(allProblems[startIdx + i]);
              } else {
                // 추가 생성 (필요시)
                const difficulty = difficulties[startIdx + i] as "medium" | "hard" | "challenge";
                const problem = await generateSAAProblem([], difficulty, locale);
                newProblems.push(problem);
              }
            }

            // 상태 업데이트
            setMockExamProblems(newProblems);
            setMockExamAnswers(new Array(50).fill(null));
            localStorage.setItem("mockExamProblemsCount", newProblems.length.toString());
          }
        }

        // 모든 문제 로드 완료 후 (새로 생성된 경우만 저장)
        if (newProblems.length === 50 && allProblems.length < 50) {
          await saveTodayMockExamProblems(newProblems, locale);
          localStorage.removeItem("mockExamDifficulties");
          localStorage.removeItem("mockExamProblemsCount");
          localStorage.removeItem("mockExamAllProblems");
        }

        // 로딩 완료
        setMockExamIsLoading(false);
      } catch (error) {
        // 백그라운드 로딩 에러는 무시
        setMockExamIsLoading(false);
      }
    })();
  }, [mockExamRunning, locale]);

  // 게시글 탭에서 게시글 목록 로드
  useEffect(() => {
    if (tab === "posts") {
      (async () => {
        try {
          const result = await getPosts(
            postsPage,
            20,
            postsSearch,
            postsFilterMine && userEmail ? getCurrentUser()?.uid : "",
            userEmail ? getCurrentUser()?.uid : ""
          );
          setPosts(result.posts);
          setPostsTotalCount(result.totalCount);
        } catch (error) {
          // 에러 처리
        }
      })();
    }
  }, [tab, postsPage, postsSearch, postsFilterMine, userEmail]);

  useEffect(() => {
    if (tab === "concept" && selected) {
      getConceptForLocale().then(c => setConcept(c));
    }
  }, [tab, selected, locale]);

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null;

  // PDF 생성 및 업로드 함수 (html2pdf로 한글 지원)
  const generatePDF = async (session: any) => {
    if (!session || !session.problems || session.problems.length === 0) return;

    // 로딩 상태 시작
    setPdfGeneratingId(session.sessionTimestamp);

    try {
      // HTML 요소 생성
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.innerHTML = `
        <h1 style="text-align: center; margin-bottom: 10px; color: black;">AWS SAA-C03 Quiz Problems</h1>
        <p style="text-align: center; color: black; margin-bottom: 20px; font-size: 12px;">
          Date: ${session.date} ${session.time}
        </p>
        <hr style="border: 1px solid #ddd; margin-bottom: 20px;">
        ${session.problems.map((problem, index) => `
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <!-- 문제 번호 및 제목 -->
            <h3 style="margin-bottom: 12px; color: black; border-bottom: 2px solid #333; padding-bottom: 8px;">Q${index + 1}. ${problem.question}</h3>

            <!-- 보기 -->
            <div style="margin-left: 20px; margin-bottom: 15px;">
              ${["A", "B", "C", "D"].map(opt => `
                <div style="margin-bottom: 8px; color: black;">
                  <strong>${opt}.</strong> ${problem.options[opt as keyof typeof problem.options]}
                </div>
              `).join('')}
            </div>

            <!-- 정답 -->
            <div style="margin-left: 20px; color: black; font-weight: bold; margin-bottom: 20px; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              ✓ Answer: ${problem.answer}
            </div>

            <!-- 핵심 키워드 -->
            <div style="margin-left: 20px; margin-bottom: 15px;">
              <strong style="color: #333; font-size: 13px;">📌 Keywords:</strong>
              <div style="color: black; font-size: 12px; margin-top: 4px;">
                ${problem.keywords?.join(', ') || 'N/A'}
              </div>
            </div>

            <!-- 핵심 목표 -->
            <div style="margin-left: 20px; margin-bottom: 15px;">
              <strong style="color: #333; font-size: 13px;">🎯 Problem Goal:</strong>
              <div style="color: black; font-size: 12px; margin-top: 6px; line-height: 1.6;">
                ${problem.goal || 'N/A'}
              </div>
            </div>

            <!-- 정답 설명 -->
            <div style="margin-left: 20px; margin-bottom: 15px;">
              <strong style="color: #333; font-size: 13px;">📚 Answer Explanation:</strong>
              <div style="color: black; font-size: 12px; margin-top: 6px; line-height: 1.6;">
                <div style="margin-bottom: 8px;"><strong>Why Correct:</strong> ${problem.explanation?.correct || 'N/A'}</div>
                <div style="margin-bottom: 6px;"><strong>Trap A:</strong> ${problem.explanation?.trap_A || 'N/A'}</div>
                <div style="margin-bottom: 6px;"><strong>Trap B:</strong> ${problem.explanation?.trap_B || 'N/A'}</div>
                <div style="margin-bottom: 0;"><strong>Trap C:</strong> ${problem.explanation?.trap_C || 'N/A'}</div>
              </div>
            </div>

            <!-- 이지 모드 (쉬운 설명) -->
            <div style="margin-left: 20px; margin-bottom: 0;">
              <strong style="color: #333; font-size: 13px;">🎓 Easy Mode (Simplified Explanation):</strong>
              <div style="color: black; font-size: 12px; margin-top: 6px; line-height: 1.6; background: #fafafa; padding: 10px; border-radius: 4px;">
                <div style="margin-bottom: 8px;"><strong>Simple Explanation:</strong> ${problem.easyMode?.explanation || 'N/A'}</div>
                <div style="margin-bottom: 6px;"><strong>Option A (Easy):</strong> ${problem.easyMode?.A || 'N/A'}</div>
                <div style="margin-bottom: 6px;"><strong>Option B (Easy):</strong> ${problem.easyMode?.B || 'N/A'}</div>
                <div style="margin-bottom: 6px;"><strong>Option C (Easy):</strong> ${problem.easyMode?.C || 'N/A'}</div>
                <div style="margin-bottom: 0;"><strong>Option D (Easy):</strong> ${problem.easyMode?.D || 'N/A'}</div>
              </div>
            </div>

            <hr style="border: 1px solid #ddd; margin-top: 20px;">
          </div>
        `).join('')}
      `;

      const fileName = `SAA-Problems_${session.date.replace(/\//g, '-')}_${session.time.replace(/:/g, '-')}.pdf`;

      // html2pdf 옵션
      const options = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      // PDF 생성
      const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');

      // Cloud Storage에 업로드
      const user = getCurrentUser();
      if (user) {
        try {
          await uploadPDFToStorage(user.uid, pdfBlob, session.date, session.time);
          // PDF 업로드 완료
        } catch (error) {
          // 에러 처리만 수행 (로깅 제거)
        }
      }

      // 로컬 다운로드
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // 에러 처리만 수행 (로깅 제거)
    } finally {
      // 로딩 상태 종료
      setPdfGeneratingId(null);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>&#10022; AWS SAA-C03 &#10022;</h1>
          <p>{t("headerSubtitle")}</p>
        </div>
        <div className="header-right">
          <div className="lang-selector">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "ko" | "ja" | "en")}
              style={{
                padding: "6px 10px",
                background: "rgba(59,130,246,0.3)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                accentColor: "rgba(59,130,246,0.3)"
              }}
            >
              <option value="en" style={{ background: "rgba(59,130,246,0.3)", color: "#cbd5e1" }}>English</option>
              <option value="ko" style={{ background: "rgba(59,130,246,0.3)", color: "#cbd5e1" }}>한국어</option>
              <option value="ja" style={{ background: "rgba(59,130,246,0.3)", color: "#cbd5e1" }}>日本語</option>
            </select>
          </div>
          <div className="visitor-count">
            <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>{t("currentVisitors")}</div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>👥 {visitorCount}</div>
          </div>

          {/* 사용자 상태 및 일일 카운트 / 로그인 */}
          <div
            data-account-menu
            style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            fontSize: "10px", color: "#94a3b8", marginLeft: "16px", padding: "0 12px",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            position: "relative"
          }}>
            {userEmail ? (
              <>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  style={{
                    fontSize: "12px", color: "#cbd5e1", textAlign: "center", fontWeight: "bold",
                    background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
                    borderRadius: "4px", transition: "all 0.2s",
                    backgroundColor: showAccountMenu ? "rgba(59,130,246,0.2)" : "transparent"
                  }}
                  onMouseEnter={(e) => {
                    if (!showAccountMenu) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(59,130,246,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showAccountMenu) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  👤 {userEmail.split("@")[0]}
                </button>

                {/* 드롭다운 메뉴 */}
                {showAccountMenu && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    minWidth: "160px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    zIndex: 100
                  }}>
                    <button
                      onClick={async () => {
                        clearSessionTimeout();
                        setUserEmail(null);
                        setUserStatusLocal("guest");
                        setIsAdmin(false);
                        localStorage.removeItem("userStatus");
                        setShowAccountMenu(false);
                        try {
                          await signOut();
                        } catch (error) {
                          console.error("Sign out error:", error);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        color: "#cbd5e1",
                        fontSize: "12px",
                        cursor: "pointer",
                        textAlign: "left",
                        borderBottom: "1px solid rgba(255,255,255,0.1)"
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      }}
                    >
                      🚪 {t("logoutBtn")}
                    </button>

                    {(userStatus === "paid" || isAdmin) && (
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          setShowPaymentModal(true);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "transparent",
                          border: "none",
                          color: "#cbd5e1",
                          fontSize: "12px",
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(168,85,247,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        }}
                      >
                        ❌ 구독 취소
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : isAuthChecked ? (
              <button onClick={() => setShowLoginModal(true)} style={{
                fontSize: "11px", padding: "8px 12px", background: "#3b82f6", color: "#fff",
                border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold",
                whiteSpace: "nowrap"
              }}>
                {t("btnLogin")}
              </button>
            ) : null}
          </div>

          {/* D-day 배지 + 날짜 아이콘 통합 */}
          {userEmail && (
            <span className="badge" style={{ cursor: "pointer" }}
              onClick={() => setShowExamDateModal(true)}
              title="시작일 변경">
              📅 {dday === "-" ? "-" : dday}
            </span>
          )}
          {userEmail && <span className="streak">🔥 {streak}{t("streakSuffix")}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "quiz" ? "active" : ""}`} onClick={() => setTab("quiz")}>&#127919; {t("tabQuiz")}</button>
        <button className={`tab ${tab === "concept" ? "active" : ""}`} onClick={() => setTab("concept")}>&#128218; {t("tabConcept")}</button>
        <button className={`tab ${tab === "status" ? "active" : ""}`} onClick={() => setTab("status")}>&#128202; {t("tabStatus")}</button>
        <button className={`tab ${tab === "mockExam" ? "active" : ""}`} onClick={() => setTab("mockExam")}>{t("tabMockExam")}</button>
        {/* Posts tab - Hidden for now */}
        {/* <button className={`tab ${tab === "posts" ? "active" : ""}`} onClick={() => setTab("posts")}>📰 {t("tabPosts")}</button> */}
        {/* 관리자에게만 Admin 탭 표시 */}
        {isAdmin && (
          <>
            <button className={`tab ${tab === "admin" ? "active" : ""}`} onClick={() => setTab("admin")}>⚙️ Admin</button>
            <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>👥 {t("tabUsers")}</button>
          </>
        )}
      </div>

      <div className="main-area" style={{ cursor: isResizing ? 'col-resize' : 'default' }}>
        {/* Left: Controls */}
        <div className="controls-panel" style={{ flex: `0 0 ${tab === "posts" ? "0%" : (100 - graphPanelWidth) + "%"}`, display: tab === "posts" ? "none" : "flex" }}>
          {tab === "quiz" && (
            <>
              {/* Category filter */}
              <div className="filter-section">
                <button className={`filter-pill ${!catFilter ? "active" : ""}`} onClick={() => setCatFilter(null)}>{t("filterAll")}</button>
                {Object.entries(CAT).map(([key, val]) => (
                  <button key={key} className={`filter-pill ${catFilter === key ? "active" : ""}`}
                    onClick={() => setCatFilter(catFilter === key ? null : key)}>
                    <span className="filter-dot" style={{ background: val.color }} />
                    {val.label}
                  </button>
                ))}
              </div>

              {/* Slots */}
              <div className="slots-section">
                <div className="slots-header">
                  <span className="slots-title">&#9881; {t("slotsTitle")} ({slots.length}/4)</span>
                  <div className="difficulty-buttons">
                    {(["medium", "hard", "challenge"] as const).map(d => (
                      <button key={d} className={`diff-btn ${difficulty === d ? "active" : ""}`}
                        onClick={() => setDifficulty(d)}>
                        {d === "medium" ? t("diffMedium") : d === "hard" ? t("diffHard") : t("diffChallenge")}
                      </button>
                    ))}
                    <button className="diff-btn reset" onClick={resetSlots}>{t("btnReset")}</button>
                  </div>
                </div>

                <div className="slots-grid">
                  {[0, 1, 2, 3].map(i => {
                    const sid = slots[i];
                    const node = sid ? NODES.find(n => n.id === sid) : null;
                    return (
                      <div key={i} className={`slot-card ${node ? "filled" : ""}`}
                        onClick={() => !node && setTab("quiz")}>
                        {node ? (
                          <>
                            <span className="slot-emoji">{node.emoji}</span>
                            <span className="slot-name">{node.name}</span>
                            <span className="slot-cat">{CAT[node.cat].label}</span>
                            <button className="slot-remove" onClick={e => { e.stopPropagation(); removeSlot(sid); }}>&#215;</button>
                          </>
                        ) : (
                          <span className="slot-empty">{t("slotClickToAdd")}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button className="generate-btn"
                  disabled={slots.length === 0 || loading || (!isAdmin && dailyCount >= getDailyLimit())}
                  onClick={handleGenerateProblem}
                  title={!isAdmin && dailyCount >= getDailyLimit() ? getQuotaMessage(userStatus, getDailyLimit(), dailyCount) : ""}>
                  {loading && <span className="loading-icon">●●●</span>}
                  {loading ? t("btnGenerating") : t("btnGenerate")}
                  <br />
                  <span style={{ fontSize: "11px", opacity: 0.7, display: "block", marginTop: "4px" }}>
                    {isAdmin ? "관리자" : `${dailyCount}/${getDailyLimit()}`}
                  </span>
                </button>

                {/* 프리미엄 배너 (로그인하지 않았거나 일반 사용자일 때) */}
                {userStatus !== "paid" && (
                  <div style={{
                    marginTop: "16px", padding: "14px", background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)",
                    border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", textAlign: "center"
                  }}>
                    <div style={{ color: "#e0e7ff", fontSize: "12px", marginBottom: "8px" }}>
                      <strong>{t("premiumTitle")}</strong>
                    </div>
                    <div style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: "bold", marginBottom: "10px" }}>
                      {t("premiumFeature1")} - <span style={{ color: "#8b5cf6" }}>{t("premiumPrice")}</span>
                    </div>
                    <div style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: "bold", marginBottom: "12px" }}>
                      📋 매일 모의시험 1회 (50문제, 130분)
                    </div>
                    <button onClick={() => setShowPaymentModal(true)} style={{
                      width: "100%", padding: "10px", background: "#8b5cf6", color: "#fff",
                      border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                    }}>
                      {t("premiumUpgradeBtn")}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="error-message" style={{ color: "#ff6b6b", marginTop: "12px", padding: "10px", background: "rgba(255,107,107,0.1)", borderRadius: "6px" }}>
                    ⚠️ {error}
                  </div>
                )}

                {problem && (
                  <div className="problem-container" style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
                    <h3 style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "12px" }}>📝</h3>
                    <div className="problem-content">
                      <div className="problem-section" style={{ marginBottom: "16px" }}>
                        <p style={{ color: "#cbd5e1", lineHeight: "1.6", marginBottom: "8px" }}>{problem.question}</p>
                        {isSubmitted && (
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                            <strong>{t("labelConstraints")}</strong> {problem.constraint.join(" + ")}
                          </div>
                        )}
                      </div>

                      <div className="options" style={{ marginBottom: "16px" }}>
                        {(["A", "B", "C", "D"] as const).map(opt => (
                          <button
                            key={opt}
                            onClick={() => setSelectedAnswer(opt)}
                            disabled={isSubmitted}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "12px",
                              marginBottom: "8px",
                              background: selectedAnswer === opt
                                ? (isSubmitted && opt === problem.answer ? "#10b981" : isSubmitted && opt !== problem.answer ? "#ef4444" : "rgba(59,130,246,0.3)")
                                : isSubmitted && opt === problem.answer ? "rgba(16,185,129,0.15)"
                                : "rgba(255,255,255,0.05)",
                              border: `1px solid ${selectedAnswer === opt
                                ? (isSubmitted && opt === problem.answer ? "#10b981" : isSubmitted && opt !== problem.answer ? "#ef4444" : "rgba(59,130,246,0.6)")
                                : isSubmitted && opt === problem.answer ? "rgba(16,185,129,0.4)"
                                : "rgba(255,255,255,0.1)"}`,
                              borderRadius: "6px",
                              color: "#cbd5e1",
                              textAlign: "left",
                              cursor: isSubmitted ? "default" : "pointer",
                              fontSize: "13px",
                              transition: "all 0.2s",
                              opacity: isSubmitted && opt !== problem.answer && selectedAnswer !== opt ? 0.5 : 1,
                            }}
                          >
                            <strong>{opt}.</strong> {problem.options[opt]}
                          </button>
                        ))}
                      </div>

                      {!isSubmitted && selectedAnswer && (
                        <button
                          onClick={async () => {
                            setIsSubmitted(true);
                            // 로그인된 사용자면 결과 저장
                            const user = getCurrentUser();
                            if (user && problem) {
                              await recordQuizResult(
                                user.uid,
                                problem,
                                selectedAnswer,
                                difficulty as "medium" | "hard" | "challenge",
                                sessionId,
                                slots // 선택된 서비스 목록 전달
                              );
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "16px",
                            background: "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.3) 100%)",
                            border: "1px solid rgba(59,130,246,0.5)",
                            borderRadius: "6px",
                            color: "#60a5fa",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "13px",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(139,92,246,0.4) 100%)";
                            e.currentTarget.style.borderColor = "rgba(59,130,246,0.7)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.3) 100%)";
                            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                          }}
                        >
                          ✓ 제출
                        </button>
                      )}

                      {isSubmitted && (
                        <div className="explanation" style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "6px", marginTop: "12px" }}>
                          {/* 정답 표시 */}
                          <div style={{ fontSize: "12px", color: selectedAnswer === problem.answer ? "#10b981" : "#ef4444", marginBottom: "8px", fontWeight: "bold" }}>
                            {selectedAnswer === problem.answer ? "✅ 정답입니다!" : "❌ 틀렸습니다."}
                          </div>

                          {/* 핵심 목표 */}
                          {(problem as any).goal && (
                            <div style={{ fontSize: "12px", color: "#a78bfa", marginBottom: "8px", padding: "8px", background: "rgba(167,139,250,0.1)", borderRadius: "4px" }}>
                              <strong>🎯 핵심 목표:</strong> {(problem as any).goal}
                            </div>
                          )}

                          {/* 정답과 설명 */}
                          <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "8px" }}>
                            <strong>정답: {problem.answer}</strong>
                          </div>
                          <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "8px" }}>
                            <strong>설명</strong>
                            <p style={{ marginTop: "6px" }}>{problem.explanation.correct}</p>
                            {selectedAnswer !== problem.answer && problem.explanation[`trap_${selectedAnswer}` as keyof typeof problem.explanation] && (
                              <p style={{ marginTop: "6px", color: "#ef4444" }}>
                                <strong>⚠️ 함정:</strong> {problem.explanation[`trap_${selectedAnswer}` as keyof typeof problem.explanation]}
                              </p>
                            )}
                          </div>

                          {/* 핵심 키워드 */}
                          {(problem as any).keywords && (problem as any).keywords.length > 0 && (
                            <div style={{ fontSize: "12px", color: "#cbd5e1", marginBottom: "8px", padding: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px" }}>
                              <strong>📌 핵심 키워드:</strong>
                              <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {(problem as any).keywords.map((kw: string, i: number) => (
                                  <span key={i} style={{ background: "rgba(59,130,246,0.3)", padding: "2px 8px", borderRadius: "12px", color: "#60a5fa" }}>
                                    <strong>{kw}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* easyMode 버튼 */}
                          {(problem as any).easyMode && (
                            <button
                              onClick={() => setShowEasyMode(!showEasyMode)}
                              style={{
                                width: "100%",
                                padding: "10px",
                                marginBottom: "12px",
                                marginTop: "8px",
                                background: showEasyMode ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)",
                                border: `1px solid ${showEasyMode ? "rgba(34,197,94,0.4)" : "rgba(245,158,11,0.4)"}`,
                                borderRadius: "6px",
                                color: showEasyMode ? "#4ade80" : "#fbbf24",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontSize: "12px",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = showEasyMode ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = showEasyMode ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)";
                              }}
                            >
                              {showEasyMode ? "🧠 이지모드 닫기" : "👶 이지모드"}
                            </button>
                          )}

                          {/* easyMode 설명 */}
                          {showEasyMode && (problem as any).easyMode && (
                            <div style={{ fontSize: "12px", color: "#cbd5e1", padding: "12px", background: "rgba(245,158,11,0.1)", borderRadius: "6px", marginBottom: "12px" }}>
                              <strong style={{ color: "#fbbf24" }}>🎈 이지모드 설명:</strong>
                              <p style={{ marginTop: "6px", lineHeight: "1.6" }}>{(problem as any).easyMode.explanation}</p>
                              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(245,158,11,0.2)" }}>
                                <strong style={{ color: "#fbbf24" }}>각 보기 설명:</strong>
                                {(["A", "B", "C", "D"] as const).map(opt => (
                                  <div key={opt} style={{ marginTop: "6px", color: opt === problem.answer ? "#4ade80" : "#cbd5e1" }}>
                                    <strong>{opt}.</strong> {(problem as any).easyMode[opt]}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {problem.patterns && (
                            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                              <strong style={{ fontSize: "12px" }}>📚 핵심 패턴</strong>
                              <ul style={{ fontSize: "12px", marginTop: "4px", paddingLeft: "16px" }}>
                                {problem.patterns.map((p, i) => (
                                  <li key={i} style={{ color: "#94a3b8", marginTop: "4px" }}>{p}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setProblem(null)}
                        style={{
                          marginTop: "12px",
                          width: "100%",
                          padding: "10px",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "6px",
                          color: "#cbd5e1",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        {t("btnNextProblem")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "concept" && (
            <div className="concept-panel">
              {concept && selectedNode ? (
                <>
                  <div className="concept-header">
                    <span className="concept-emoji">{selectedNode.emoji}</span>
                    <h2>{concept.title}</h2>
                    <p className="concept-subtitle">{concept.subtitle}</p>
                  </div>
                  <div className="concept-section">
                    <h3>{t("sectionEasy")}</h3>
                    <p className="easy-text">{conceptTranslating ? t("conceptTranslating") : concept.easy}</p>
                  </div>
                  <div className="concept-section">
                    <h3>{t("sectionPoints")}</h3>
                    {concept.points.map((pt, i) => (
                      <div key={i} className="point-card">
                        <h4>{pt.label}</h4>
                        <p className="point-text">{pt.text}</p>
                        <p className="point-easy">{pt.easy}</p>
                      </div>
                    ))}
                  </div>
                  {/* Related services */}
                  <div className="concept-section">
                    <h3>{t("sectionRelated")}</h3>
                    <div className="related-grid">
                      {LINKS.filter(l => l.s === selected || l.t === selected).map((l, i) => {
                        const rid = l.s === selected ? l.t : l.s;
                        const rn = NODES.find(n => n.id === rid);
                        return rn ? (
                          <button key={i} className="related-btn" onClick={() => { setSelected(rid); }}>
                            {rn.emoji} {rn.name}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">{t("emptyConceptHint")}</div>
              )}
            </div>
          )}

          {tab === "mockExam" && (
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", height: "100%", overflowY: "auto" }}>
              {userStatus === "paid" || isAdmin ? (
                mockExamRunning ? (
                // 모의시험 진행 중
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(59, 130, 246, 0.3)"
                  }}>
                    <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>진행 상황</div>
                    <div style={{ fontSize: "24px", color: "#60a5fa", fontWeight: "bold", marginBottom: "8px" }}>
                      {mockExamCurrentIndex + 1} / {mockExamProblems.length}
                    </div>
                    <div style={{
                      width: "100%",
                      height: "6px",
                      background: "rgba(100, 116, 139, 0.3)",
                      borderRadius: "3px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${((mockExamCurrentIndex + 1) / mockExamProblems.length) * 100}%`,
                        height: "100%",
                        background: "rgba(59, 130, 246, 0.6)",
                        transition: "width 0.3s"
                      }} />
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(249, 115, 22, 0.1)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(249, 115, 22, 0.3)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>남은 시간</div>
                    <div style={{
                      fontSize: "28px",
                      color: mockExamTimeRemaining < 300 ? "#ef4444" : "#f59e0b",
                      fontWeight: "bold"
                    }}>
                      {Math.floor(mockExamTimeRemaining / 60)}:{String(mockExamTimeRemaining % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              ) : mockExamResults ? (
                // 결과 화면
                <>
                  <div style={{
                    textAlign: "center",
                    padding: "20px",
                    background: mockExamResults.passed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${mockExamResults.passed ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                    borderRadius: "8px"
                  }}>
                    <h2 style={{
                      fontSize: "36px",
                      color: mockExamResults.passed ? "#10b981" : "#ef4444",
                      margin: "0 0 8px 0"
                    }}>
                      {mockExamResults.totalScore}
                    </h2>
                    <p style={{
                      color: "#cbd5e1",
                      margin: "0",
                      fontSize: "14px"
                    }}>
                      {mockExamResults.passed ? "🎉 합격!" : "재응시 필요"}
                    </p>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                  }}>
                    <div style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "20px", color: "#10b981", fontWeight: "bold" }}>
                        {mockExamResults.correct}/{mockExamProblems.length}
                      </div>
                    </div>
                    <div style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "20px", color: "#ef4444", fontWeight: "bold" }}>
                        {mockExamResults.wrong}/{mockExamProblems.length}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(100, 116, 139, 0.2)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", color: "#60a5fa", fontWeight: "bold" }}>
                        {mockExamResults.correctRate}%
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", color: "#60a5fa", fontWeight: "bold" }}>
                        {Math.floor(mockExamResults.timeSpent / 60)}분
                      </div>
                    </div>
                  </div>

                  {/* PDF 다운로드 */}
                  {(() => {
                    const pdfExpiresAt = mockExamPdfCreatedAt ? mockExamPdfCreatedAt + 24 * 60 * 60 * 1000 : null;
                    const now = Date.now();
                    const isPdfExpired = pdfExpiresAt && now > pdfExpiresAt;
                    const hoursRemaining = pdfExpiresAt ? Math.floor((pdfExpiresAt - now) / (60 * 60 * 1000)) : 0;

                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button
                          onClick={() => {
                            if (!mockExamResults || !mockExamProblems) return;

                            const element = document.createElement("div");

                            // 문제별 분석 HTML 생성
                            const problemsHTML = mockExamProblems.map((problem, idx) => {
                              const userAnswer = mockExamAnswers[idx];
                              const isCorrect = userAnswer === problem.answer;
                              return `
                                <div style="page-break-inside: avoid; margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                                  <h3 style="margin: 0 0 10px 0; color: #333;">Q${idx + 1}. ${problem.question}</h3>

                                  <!-- 보기 -->
                                  <div style="margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.6;">
                                    <strong>보기:</strong><br/>
                                    <div style="margin-left: 10px;">
                                      <div style="margin: 3px 0;">A) ${problem.options.A}</div>
                                      <div style="margin: 3px 0;">B) ${problem.options.B}</div>
                                      <div style="margin: 3px 0;">C) ${problem.options.C}</div>
                                      <div style="margin: 3px 0;">D) ${problem.options.D}</div>
                                    </div>
                                  </div>

                                  <!-- 정답/오답 표시 -->
                                  <div style="margin: 10px 0; padding: 8px; background: ${isCorrect ? '#e8f5e9' : '#ffebee'}; border-radius: 4px;">
                                    <strong style="color: ${isCorrect ? '#2e7d32' : '#c62828'};">
                                      ${isCorrect ? '✅ 정답입니다!' : '❌ 틀렸습니다.'}
                                    </strong>
                                    ${userAnswer ? `<br/>사용자 답: <strong>${userAnswer}</strong>` : ''}
                                  </div>

                                  <!-- 핵심 목표 -->
                                  ${problem.goal ? `
                                    <div style="margin: 8px 0; padding: 6px; background: #f3e5f5; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.5;">
                                      <strong>🎯 핵심 목표:</strong><br/>
                                      ${problem.goal}
                                    </div>
                                  ` : ''}

                                  <!-- 정답과 설명 -->
                                  <div style="margin: 8px 0; page-break-inside: avoid;">
                                    <strong>정답: ${problem.answer}</strong><br/>
                                    <strong style="font-size: 13px;">설명:</strong>
                                    <p style="margin: 4px 0; padding: 6px; background: #e3f2fd; border-radius: 4px; font-size: 13px; line-height: 1.5;">${problem.explanation.correct}</p>
                                  </div>

                                  <!-- 함정 설명 -->
                                  ${userAnswer && userAnswer !== problem.answer && problem.explanation[`trap_${userAnswer}`] ? `
                                    <div style="margin: 8px 0; padding: 6px; background: #fff3e0; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.5;">
                                      <strong>⚠️ 함정:</strong> ${problem.explanation[`trap_${userAnswer}`]}
                                    </div>
                                  ` : ''}

                                  <!-- 핵심 키워드 -->
                                  ${problem.keywords && problem.keywords.length > 0 ? `
                                    <div style="margin: 8px 0; page-break-inside: avoid; font-size: 13px;">
                                      <strong>📌 핵심 키워드:</strong><br/>
                                      ${problem.keywords.map(kw => `<span style="display: inline-block; margin: 2px 4px 2px 0; padding: 3px 6px; background: #bbdefb; border-radius: 12px; font-size: 12px;"><strong>${kw}</strong></span>`).join('')}
                                    </div>
                                  ` : ''}

                                  <!-- 쉽게설명 -->
                                  ${problem.easyMode ? `
                                    <div style="margin: 8px 0; padding: 8px; background: #fff9c4; border-radius: 4px; page-break-inside: avoid; font-size: 13px; line-height: 1.5;">
                                      <strong style="color: #f57f17;">👨‍🏫 쉽게설명:</strong><br/>
                                      <p style="margin: 4px 0;">${problem.easyMode.explanation}</p>
                                      <strong style="font-size: 12px;">각 보기 설명:</strong>
                                      <div style="margin-left: 10px; font-size: 12px;">
                                        <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'A' ? '#4caf50' : '#666'};">A.</strong> ${problem.easyMode.A}</div>
                                        <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'B' ? '#4caf50' : '#666'};">B.</strong> ${problem.easyMode.B}</div>
                                        <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'C' ? '#4caf50' : '#666'};">C.</strong> ${problem.easyMode.C}</div>
                                        <div style="margin: 2px 0;"><strong style="color: ${problem.answer === 'D' ? '#4caf50' : '#666'};">D.</strong> ${problem.easyMode.D}</div>
                                      </div>
                                    </div>
                                  ` : ''}
                                </div>
                              `;
                            }).join('');

                            element.innerHTML = `
                              <div style="padding: 20px; color: #000; background: #fff; font-family: Arial, sans-serif;">
                                <h1 style="text-align: center; margin-bottom: 20px;">SAA-C03 모의시험 결과</h1>
                                <div style="margin-bottom: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
                                  <h2 style="font-size: 32px; text-align: center; margin: 10px 0;">총점: ${mockExamResults.totalScore}</h2>
                                  <p style="text-align: center; font-size: 16px; margin: 10px 0;">상태: ${mockExamResults.passed ? "🎉 합격!" : "재응시 필요"}</p>
                                  <div style="text-align: center; font-size: 14px; line-height: 1.8;">
                                    <p><strong>정답: ${mockExamResults.correct}/${mockExamProblems.length}</strong></p>
                                    <p><strong>오답: ${mockExamResults.wrong}/${mockExamProblems.length}</strong></p>
                                    <p><strong>정답률: ${mockExamResults.correctRate}%</strong></p>
                                    <p><strong>소요 시간: ${Math.floor(mockExamResults.timeSpent / 60)}분 ${mockExamResults.timeSpent % 60}초</strong></p>
                                  </div>
                                </div>

                                <h2 style="margin-top: 30px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">문제별 상세 분석</h2>
                                ${problemsHTML}
                              </div>
                            `;

                            const options = {
                              margin: 10,
                              filename: 'SAA-C03_mock_exam_results.pdf',
                              image: { type: 'jpeg', quality: 0.98 },
                              html2canvas: { scale: 2 },
                              jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
                            };

                            html2pdf().set(options).from(element).save();
                            const now = Date.now();
                            setMockExamPdfCreatedAt(now);
                            localStorage.setItem("mockExamPdfCreatedAt", now.toString());
                          }}
                          disabled={isPdfExpired}
                          style={{
                            padding: "12px 16px",
                            background: isPdfExpired ? "rgba(100, 116, 139, 0.5)" : "rgba(59, 130, 246, 0.3)",
                            border: `1px solid ${isPdfExpired ? "rgba(100, 116, 139, 0.3)" : "rgba(59, 130, 246, 0.6)"}`,
                            borderRadius: "6px",
                            color: isPdfExpired ? "#64748b" : "#60a5fa",
                            cursor: isPdfExpired ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          {isPdfExpired ? t("mockExamPdfExpired") : t("mockExamPdfDownload")}
                        </button>

                        {mockExamPdfCreatedAt && !isPdfExpired && (
                          <div style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            fontSize: "12px",
                            color: "#60a5fa",
                            textAlign: "center"
                          }}>
                            {t("mockExamPdfInfo")} ({hoursRemaining}시간 남음)
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : mockExamAlreadyTaken ? (
                // 오늘 이미 본 경우
                <div style={{
                  textAlign: "center",
                  background: "rgba(249, 115, 22, 0.1)",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  borderRadius: "8px",
                  padding: "16px"
                }}>
                  <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "0 0 8px 0" }}>
                    현재 UTC: {currentUtcTime}
                  </p>
                  <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "0" }}>
                    {nextUtcDate} 자정(UTC 00:00)에 다시 응시할 수 있습니다
                  </p>
                </div>
              ) : null
              ) : (
                // 프리미엄이 아닌 사용자
                <>
                  <div style={{
                    textAlign: "center",
                    background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(59, 130, 246, 0.1))",
                    border: "2px solid rgba(249, 115, 22, 0.4)",
                    borderRadius: "12px",
                    padding: "32px",
                    maxWidth: "450px"
                  }}>
                    <h2 style={{ fontSize: "24px", margin: "0 0 12px 0", color: "#fb923c" }}>
                      💎 프리미엄 기능
                    </h2>
                    <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "0 0 20px 0", lineHeight: "1.6" }}>
                      SAA-C03 모의시험은 프리미엄 구독자만 이용할 수 있습니다.
                    </p>

                    <div style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "20px",
                      textAlign: "left"
                    }}>
                      <p style={{ fontSize: "12px", color: "#10b981", fontWeight: "bold", margin: "0 0 8px 0" }}>
                        ✅ 프리미엄 이용권 ($14.99/월)
                      </p>
                      <ul style={{
                        fontSize: "12px",
                        color: "#cbd5e1",
                        margin: "0",
                        paddingLeft: "20px",
                        lineHeight: "1.8"
                      }}>
                        <li>🚀 하루 20개 문제 생성</li>
                        <li>📋 매일 모의시험 1회 (50문제, 130분)</li>
                        <li>📊 상세한 성과 분석</li>
                        <li>🎯 모든 난이도 (보통, 어려움, 챌린지)</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => setShowPaymentModal(true)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(59, 130, 246, 0.3))",
                        border: "2px solid rgba(249, 115, 22, 0.6)",
                        borderRadius: "8px",
                        color: "#fb923c",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "12px"
                      }}
                    >
                      💳 프리미엄 업그레이드
                    </button>

                    {userStatus === "guest" && (
                      <button
                        onClick={() => setShowLoginModal(true)}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: "rgba(59, 130, 246, 0.2)",
                          border: "1px solid rgba(59, 130, 246, 0.5)",
                          borderRadius: "8px",
                          color: "#60a5fa",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        또는 로그인하기
                      </button>
                    )}

                    <p style={{
                      fontSize: "11px",
                      color: "#64748b",
                      margin: "12px 0 0 0"
                    }}>
                      💡 로그인 후 프리미엄으로 업그레이드하면 모의시험을 매일 응시할 수 있습니다!
                    </p>
                  </div>

                  {/* 운영자 시험 생성 버튼 */}
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        try {
                          console.log("시험 생성 시작...");

                          // 캐시 삭제 - 항상 새로 생성
                          localStorage.removeItem("mockExamProblems");
                          localStorage.removeItem("mockExamProblemsLoaded");
                          localStorage.removeItem("mockExamDifficulties");
                          console.log("캐시 삭제 완료");

                          const problems: Problem[] = [];

                          // 테스트: API 2번 호출, 문제 2개 생성
                          for (let i = 0; i < 2; i++) {
                            console.log(`문제 ${i + 1} 생성 중...`);
                            const problem = await generateSAAProblem([], "medium", locale);
                            console.log(`문제 ${i + 1} 생성 완료:`, problem);
                            problems.push(problem);
                          }

                          console.log("총 문제 수:", problems.length);
                          setMockExamProblems(problems);
                          setMockExamCurrentIndex(0);
                          setMockExamAnswers(new Array(problems.length).fill(null));
                          setMockExamStartTime(Date.now());
                          setMockExamRunning(true);
                          console.log("시험 시작됨");
                        } catch (error) {
                          console.error("문제 생성 실패:", error);
                          alert("문제 생성 실패: " + (error instanceof Error ? error.message : String(error)));
                          setMockExamRunning(false);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(59, 130, 246, 0.3))",
                        border: "1px solid rgba(249, 115, 22, 0.5)",
                        borderRadius: "8px",
                        color: "#fb923c",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(249, 115, 22, 0.4), rgba(59, 130, 246, 0.4))";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(59, 130, 246, 0.3))";
                      }}
                    >
                      🎓 시험 생성하기
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "status" && (
            <div className="status-panel">
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h2 style={{ fontSize: "18px", color: "#e2e8f0", marginBottom: "12px" }}>
                  {t("dashboardTitle")}
                </h2>

                {/* Login prompt if not logged in */}
                {!userEmail ? (
                  <div style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center"
                  }}>
                    <p style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "12px" }}>
                      {t("loginPrompt")}
                    </p>
                    <button onClick={() => setShowLoginModal(true)} style={{
                      padding: "8px 16px",
                      background: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid rgba(59, 130, 246, 0.5)",
                      borderRadius: "6px",
                      color: "#60a5fa",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      {t("loginButton")}
                    </button>
                  </div>
                ) : (
                  <>
                {/* Stats cards */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px"
                }}>
                  {/* Total Problems */}
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#e2e8f0", marginBottom: "8px" }}>
                      {quizStats?.totalAttempts ?? 0}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {t("totalProblems")}
                    </div>
                  </div>

                  {/* Correct Rate */}
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: quizStats && quizStats.accuracy >= 70 ? "#10b981" : quizStats && quizStats.accuracy >= 50 ? "#f59e0b" : "#ef4444", marginBottom: "8px" }}>
                      {quizStats?.accuracy ?? 0}%
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {t("correctRate")} ({quizStats?.correctCount ?? 0}/{quizStats?.totalAttempts ?? 0})
                    </div>
                  </div>

                  {/* Consecutive Days */}
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#e2e8f0", marginBottom: "8px" }}>
                      0
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {t("consecutiveDays")}
                    </div>
                  </div>
                </div>

                {/* Problem Sessions */}
                {problemSessions && problemSessions.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
                      📄 {t("generatedSessionsTitle")}
                    </h3>
                    {/* 자동 삭제 안내 */}
                    <div style={{
                      fontSize: "12px",
                      color: "#f59e0b",
                      background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      marginBottom: "12px"
                    }}>
                      {t("sessionAutoDeleteNotice")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {problemSessions.map((session, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: "8px",
                            padding: "12px",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px"
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: 600 }}>
                              📅 {session.date} {session.time}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                              {session.problemCount} problems • {session.difficulty}
                            </div>
                          </div>
                          <button
                            onClick={() => generatePDF(session)}
                            disabled={pdfGeneratingId !== null}
                            style={{
                              padding: "6px 14px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background: pdfGeneratingId === session.sessionTimestamp
                                ? "rgba(245,158,11,0.4)"
                                : "rgba(245,158,11,0.2)",
                              border: "1px solid rgba(245,158,11,0.4)",
                              borderRadius: "6px",
                              color: "#f59e0b",
                              cursor: pdfGeneratingId !== null ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              whiteSpace: "nowrap",
                              opacity: pdfGeneratingId !== null ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (pdfGeneratingId === null) {
                                e.currentTarget.style.background = "rgba(245,158,11,0.3)";
                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (pdfGeneratingId === null) {
                                e.currentTarget.style.background = "rgba(245,158,11,0.2)";
                                e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
                              }
                            }}
                          >
                            {pdfGeneratingId === session.sessionTimestamp ? (
                              <>
                                <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: "4px" }}>
                                  ⏳
                                </span>
                                Generating...
                              </>
                            ) : (
                              "📥 Download PDF"
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Date */}
                <div style={{
                  marginTop: "auto",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                    <strong>{t("examDateLabel")}:</strong> {locale === "en" ? "Not set" : locale === "ja" ? "未設定" : "미설정"}
                  </div>
                  <button style={{
                    padding: "6px 12px",
                    fontSize: "11px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                    color: "#94a3b8",
                    cursor: "pointer"
                  }}>
                    {t("setExamDate")}
                  </button>
                </div>
                  </>
                )}
              </div>
            </div>
          )} {/* End of Status tab */}

          {/* Admin Panel - 관리자만 접근 가능 */}
          {tab === "admin" && isAdmin && userEmail && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "100%",
              color: "#e2e8f0"
            }}>
              <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                ⚙️ Admin Dashboard
              </div>

              {/* Admin Stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px"
              }}>
                {/* 오늘 방문자 */}
                <div style={{
                  background: "rgba(59,130,246,0.1)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  border: "1px solid rgba(59,130,246,0.3)"
                }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", fontWeight: 600 }}>
                    오늘 방문자
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: "#60a5fa" }}>
                    {visitorCount}
                  </div>
                </div>

                {/* 전체 방문자 */}
                <div style={{
                  background: "rgba(168,85,247,0.1)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  border: "1px solid rgba(168,85,247,0.3)"
                }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", fontWeight: 600 }}>
                    전체 방문자
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: "#c4b5fd" }}>
                    {totalVisitorCount}
                  </div>
                </div>

                {/* 유료 사용자 */}
                <div style={{
                  background: "rgba(34,197,94,0.1)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  border: "1px solid rgba(34,197,94,0.3)"
                }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", fontWeight: 600 }}>
                    💎 유료 사용자
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: "#4ade80" }}>
                    {paidUsers}
                  </div>
                </div>

                {/* 2회 무료 사용자 */}
                <div style={{
                  background: "rgba(249,115,22,0.1)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  border: "1px solid rgba(249,115,22,0.3)"
                }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", fontWeight: 600 }}>
                    ✨ 2회 무료 사용자
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: "#fb923c" }}>
                    {freeUsers}
                  </div>
                </div>
              </div>
              {/* Admin Info */}
              <div style={{
                marginTop: "auto",
                padding: "12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "6px",
                fontSize: "11px",
                color: "#64748b",
                lineHeight: "1.6"
              }}>
                <strong>Development Mode</strong><br/>
                Visitor and purchase tracking active.<br/>
                Production will require authentication.
              </div>
            </div>
          )}

          {/* Users Panel - 관리자만 접근 가능 */}
          {tab === "users" && isAdmin && userEmail && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              height: "100%",
              color: "#e2e8f0",
              overflow: "auto"
            }}>
              <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                👥 사용자 목록
              </div>

              {/* Users List */}
              <div style={{
                flex: 1,
                overflow: "auto",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.02)"
              }}>
                {allUsers.length === 0 ? (
                  <div style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "12px"
                  }}>
                    사용자가 없습니다
                  </div>
                ) : (
                  <div style={{
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    {allUsers.map((user) => (
                      <div
                        key={user.userId}
                        onClick={async () => {
                          setSelectedUser(user.userId);
                          try {
                            // 서버 검증 포함된 함수로 호출
                            const sessions = await getUserProblemSessionsSecure(userEmail, user.userId);
                            setSelectedUserSessions(sessions);
                          } catch (error) {
                            // 에러 처리만 수행 (로깅 제거)
                            setSelectedUserSessions([]);
                          }
                        }}
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          cursor: "pointer",
                          background: selectedUser === user.userId ? "rgba(59,130,246,0.2)" : "transparent",
                          borderLeft: selectedUser === user.userId ? "3px solid rgba(59,130,246,0.8)" : "3px solid transparent",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          if (selectedUser !== user.userId) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedUser !== user.userId) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                          {maskEmail(user.email)}
                        </div>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                          {user.userStatus === "paid" ? "💎 유료" : user.userStatus === "loggedIn" ? "✨ 로그인" : "🔐 게스트"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={(e) => {
            resizeStartPosRef.current = { startX: e.clientX, startWidth: graphPanelWidth };
            setIsResizing(true);
          }}
          style={{
            width: '6px',
            background: isResizing ? '#3b82f6' : 'rgba(255,255,255,0.15)',
            cursor: 'col-resize',
            transition: isResizing ? 'none' : 'all 0.2s',
            userSelect: 'none',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (!isResizing) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isResizing) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
            }
          }}
          title="드래그해서 패널 크기 조절"
        />

        {/* Right: Graph or Admin Chart */}
        <div className="graph-panel" style={{ flex: `0 0 ${tab === "posts" ? "100%" : graphPanelWidth + "%"}`, position: 'relative' }}>
          {tab === "admin" ? (
            <>
              {/* Admin Bar Graph */}
              <div className="graph-label">📊 Visitor Analytics</div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                gap: "12px",
                padding: "16px"
              }}>
                {/* Period Switching Buttons */}
                <div style={{
                  display: "flex",
                  gap: "8px"
                }}>
                  {["daily", "weekly", "monthly"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setGraphPeriod(period as "daily" | "weekly" | "monthly")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: "11px",
                        background: graphPeriod === period ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)",
                        border: `1px solid ${graphPeriod === period ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.2)"}`,
                        borderRadius: "6px",
                        color: graphPeriod === period ? "#60a5fa" : "#94a3b8",
                        cursor: "pointer",
                        fontWeight: graphPeriod === period ? 600 : 500,
                        transition: "all 0.2s"
                      }}
                    >
                      {period === "daily" && (locale === "en" ? "Daily" : locale === "ja" ? "日別" : "일별")}
                      {period === "weekly" && (locale === "en" ? "Weekly" : locale === "ja" ? "週別" : "주별")}
                      {period === "monthly" && (locale === "en" ? "Monthly" : locale === "ja" ? "月別" : "월별")}
                    </button>
                  ))}
                </div>

                {/* Bar Graph */}
                <div style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "8px",
                  padding: "16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden"
                }}>
                  {/* Graph Header with Navigation */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)"
                  }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: "500" }}>
                        {graphPeriod === "monthly"
                          ? locale === "en" ? "Monthly Overview" : locale === "ja" ? "月別概要" : "월별 현황"
                          : graphPeriod === "weekly"
                          ? locale === "en" ? "Weekly" : locale === "ja" ? "週別" : "주별"
                          : locale === "en" ? "Daily" : locale === "ja" ? "日別" : "일별"}
                      </span>
                      {graphPeriod !== "monthly" && (
                        <select
                          value={graphMonthOffset}
                          onChange={(e) => {
                            setGraphMonthOffset(parseInt(e.target.value));
                            setGraphZoom(1);
                            setGraphWeekIndex(0);
                          }}
                          style={{
                            padding: "6px 10px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "6px",
                            color: "#cbd5e1",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                          {Array.from({ length: new Date().getMonth() + 1 }, (_, i) => {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthName = date.toLocaleDateString(
                              locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR",
                              { month: "long", year: "numeric" }
                            );
                            return (
                              <option key={i} value={i}>
                                {monthName}
                              </option>
                            );
                          })}
                        </select>
                      )}
                      {graphPeriod !== "monthly" && (
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                          {new Date(new Date().getFullYear(), new Date().getMonth() - graphMonthOffset, 1).toLocaleDateString(
                            locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR",
                            { month: "long", year: "numeric" }
                          )}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                      {graphPeriod === "monthly"
                        ? locale === "en" ? "Click to zoom in" : locale === "ja" ? "クリックでズーム" : "클릭으로 확대"
                        : locale === "en" ? "Scroll to zoom, click bar" : locale === "ja" ? "スクロールでズーム" : "스크롤로 줌"}
                    </span>
                  </div>
                  {graphData && graphData.length > 0 ? (
                    <div style={{
                      flex: 1,
                      overflow: "hidden",
                      cursor: "default"
                    }}
                      onWheel={(e) => {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? 1.2 : 0.9;
                        setGraphZoom(Math.max(0.5, Math.min(60, graphZoom * delta)));
                      }}
                    >
                      {(() => {
                        const maxScale = Math.max(30000 / graphZoom, 200); // Y축 최대값이 200 이상

                        // Calculate appropriate gridStep based on maxScale
                        let gridStep = 1;
                        const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
                        for (const step of steps) {
                          if (maxScale / step <= 6) {
                            gridStep = step;
                            break;
                          }
                        }

                        const gridValues = [];
                        for (let i = 0; i <= maxScale; i += gridStep) {
                          gridValues.push(i);
                        }

                        return (
                          <svg viewBox="0 0 500 250" style={{ width: "100%", height: "100%" }}>
                            {/* X-axis */}
                            <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            {/* Y-axis */}
                            <line x1="40" y1="20" x2="40" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                            {/* Grid lines and labels (dynamic range) */}
                            {gridValues.map((value) => (
                              <g key={`grid-${value}`}>
                                <line x1="35" y1={200 - (value / maxScale) * 180} x2="480" y2={200 - (value / maxScale) * 180} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <text x="25" y={205 - (value / maxScale) * 180} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="end">
                                  {value}
                                </text>
                              </g>
                            ))}

                            {/* Bars */}
                            {graphData.map((item, idx) => {
                              const barHeight = (item.count / maxScale) * 180;
                          const barWidth = 430 / graphData.length;
                          const x = 45 + idx * barWidth + barWidth * 0.1;
                          const y = 200 - barHeight;

                          return (
                            <g key={`bar-${idx}`} style={{ cursor: graphPeriod !== "daily" ? "pointer" : "default" }}>
                              <rect x={x} y={y} width={barWidth * 0.8} height={barHeight}
                                fill="rgba(59,130,246,0.6)" rx="3"
                                onClick={() => {
                                  if (graphPeriod === "monthly") {
                                    // 월 클릭 → Weekly로 변경
                                    setGraphMonthOffset(idx);
                                    setGraphPeriod("weekly");
                                  } else if (graphPeriod === "weekly") {
                                    // 주 클릭 → Daily로 변경
                                    setGraphWeekIndex(idx);
                                    setGraphPeriod("daily");
                                  }
                                }} />
                              <text x={x + barWidth * 0.4} y="215" fontSize="9" fill="rgba(255,255,255,0.5)"
                                textAnchor="middle"
                                onClick={() => {
                                  if (graphPeriod === "monthly") {
                                    setGraphMonthOffset(idx);
                                    setGraphPeriod("weekly");
                                  } else if (graphPeriod === "weekly") {
                                    setGraphWeekIndex(idx);
                                    setGraphPeriod("daily");
                                  }
                                }}
                                style={{ cursor: graphPeriod !== "daily" ? "pointer" : "default" }}>
                                {item.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontSize: "12px"
                    }}>
                      {locale === "en" ? "No data available" : locale === "ja" ? "データがありません" : "데이터 없음"}
                    </div>
                  )}
                </div>

                {/* Zoom Info */}
                {graphData && graphData.length > 0 && (
                  <div style={{
                    fontSize: "10px",
                    color: "#64748b",
                    marginTop: "8px",
                    textAlign: "center"
                  }}>
                    {locale === "en" ? "Scroll to zoom, drag to pan" : locale === "ja" ? "スクロールでズーム、ドラッグで移動" : "스크롤로 줌, 드래그로 이동"}
                  </div>
                )}
              </div>
            </>
          ) : tab === "status" ? (
            <>
              <div className="graph-label">{t("statisticsLabel")}</div>
              <div style={{
                padding: "20px",
                overflowY: "auto",
                height: "100%"
              }}>
                {!userEmail ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#64748b",
                    fontSize: "13px",
                    textAlign: "center"
                  }}>
                    {t("loginPrompt")}
                  </div>
                ) : (
                  <>
                <h3 style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
                  {t("weakServices")} {t("weakServicesDesc")}
                </h3>
                {quizStats && Object.keys(quizStats.byService || {}).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* 정답률 낮은 순서대로 정렬 */}
                    {Object.entries(quizStats.byService || {})
                      .map(([service, stats]: any) => ({
                        service,
                        accuracy: stats.accuracy,
                        total: stats.total,
                        correct: stats.correct
                      }))
                      .sort((a, b) => a.accuracy - b.accuracy) // 낮은 정답률부터
                      .map(({ service, accuracy, total, correct }) => {
                        const nodeData = NODES.find(n => n.id === service);
                        return (
                          <div
                            key={service}
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              borderRadius: "8px",
                              padding: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              border: "1px solid rgba(255,255,255,0.08)"
                            }}
                          >
                            <div style={{ fontSize: "24px" }}>{nodeData?.emoji}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 600 }}>
                                {nodeData?.name || service}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                                {correct}/{total} ({accuracy}%)
                              </div>
                            </div>
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                background: accuracy < 50 ? "rgba(239,68,68,0.2)" : accuracy < 75 ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
                                border: accuracy < 50 ? "1px solid rgba(239,68,68,0.4)" : accuracy < 75 ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(34,197,94,0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: accuracy < 50 ? "#ef4444" : accuracy < 75 ? "#f59e0b" : "#4ade80"
                              }}
                            >
                              {accuracy}%
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div style={{ color: "#64748b", fontSize: "12px", textAlign: "center", padding: "20px" }}>
                    {t("noData")}
                  </div>
                )}
                  </>
                )}
              </div>
            </>
          ) : tab === "mockExam" ? (
            <>
              <div className="graph-label">{t("mockExamTitle")}</div>
              <div style={{
                padding: "20px",
                overflowY: "auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}>
                {mockExamRunning ? (
                  // 모의시험 진행 중
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    height: "100%"
                  }}>
                    {/* 진행 상황 헤더 */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(59, 130, 246, 0.1)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(59, 130, 246, 0.3)"
                    }}>
                      <div style={{ fontSize: "14px", color: "#e2e8f0" }}>
                        문제 {mockExamCurrentIndex + 1} / {mockExamProblems.length}
                        {mockExamIsLoading && (
                          <span style={{ marginLeft: "8px", color: "#60a5fa", fontSize: "12px" }}>
                            🔄 문제 로딩 중...
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: mockExamTimeRemaining < 300 ? "#ef4444" : "#60a5fa"
                      }}>
                        ⏱️ {Math.floor(mockExamTimeRemaining / 60)}분 {mockExamTimeRemaining % 60}초
                      </div>
                    </div>

                    {/* 문제 표시 영역 (status 탭과 동일한 스타일) */}
                    {mockExamProblems[mockExamCurrentIndex] && (
                      <div style={{
                        background: "rgba(30, 41, 59, 0.8)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                        padding: "16px",
                        flex: 1,
                        overflowY: "auto"
                      }}>
                        <div style={{ color: "#cbd5e1", lineHeight: "1.6", fontSize: "14px" }}>
                          <h3 style={{ color: "#e2e8f0", marginTop: 0 }}>
                            {mockExamProblems[mockExamCurrentIndex].question}
                          </h3>

                          {/* 보기 */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0" }}>
                            {(["A", "B", "C", "D"] as const).map((key) => {
                              const value = mockExamProblems[mockExamCurrentIndex].options[key];
                              return (
                                <label key={key} style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "12px",
                                  background: mockExamAnswers[mockExamCurrentIndex] === key ? "rgba(59, 130, 246, 0.2)" : "rgba(71, 85, 105, 0.3)",
                                  border: mockExamAnswers[mockExamCurrentIndex] === key ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid rgba(100, 116, 139, 0.3)",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}>
                                  <input
                                    type="radio"
                                    name="mock-answer"
                                    value={key}
                                    checked={mockExamAnswers[mockExamCurrentIndex] === key}
                                    onChange={() => {
                                      const newAnswers = [...mockExamAnswers];
                                      newAnswers[mockExamCurrentIndex] = key;
                                      setMockExamAnswers(newAnswers);
                                    }}
                                    style={{ cursor: "pointer" }}
                                  />
                                  <span style={{ fontWeight: "bold", marginRight: "8px" }}>{key})</span>
                                  <span>{value}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 네비게이션 버튼 */}
                    <div style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center"
                    }}>
                      <button
                        onClick={() => setMockExamCurrentIndex(Math.max(0, mockExamCurrentIndex - 1))}
                        disabled={mockExamCurrentIndex === 0}
                        style={{
                          padding: "8px 16px",
                          background: mockExamCurrentIndex === 0 ? "rgba(100, 116, 139, 0.3)" : "rgba(59, 130, 246, 0.2)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          borderRadius: "6px",
                          color: mockExamCurrentIndex === 0 ? "#64748b" : "#60a5fa",
                          cursor: mockExamCurrentIndex === 0 ? "not-allowed" : "pointer",
                          fontSize: "12px"
                        }}
                      >
                        ← 이전
                      </button>
                      <button
                        onClick={() => setMockExamCurrentIndex(Math.min(mockExamProblems.length - 1, mockExamCurrentIndex + 1))}
                        disabled={mockExamCurrentIndex >= mockExamProblems.length - 1}
                        style={{
                          padding: "8px 16px",
                          background: mockExamCurrentIndex >= mockExamProblems.length - 1 ? "rgba(100, 116, 139, 0.3)" : "rgba(59, 130, 246, 0.2)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          borderRadius: "6px",
                          color: mockExamCurrentIndex >= mockExamProblems.length - 1 ? "#64748b" : "#60a5fa",
                          cursor: mockExamCurrentIndex >= mockExamProblems.length - 1 ? "not-allowed" : "pointer",
                          fontSize: "12px"
                        }}
                      >
                        다음 →
                      </button>
                      <button
                        onClick={() => {
                          // 답변하지 않은 문제 개수 확인
                          const unanswered = mockExamAnswers.filter(answer => answer === null).length;

                          // 답변하지 않은 문제가 있으면 확인
                          if (unanswered > 0) {
                            const message = unanswered === mockExamProblems.length
                              ? `아무것도 풀지 않았습니다. 정말 채점하시겠습니까?\n점수: 0점 / 불합격 🚫`
                              : `${unanswered}개의 문제를 풀지 않았습니다.\n정말 채점하시겠습니까?`;

                            if (!window.confirm(message)) {
                              return; // 취소 클릭
                            }
                          }

                          // 채점 로직
                          let correct = 0;
                          mockExamProblems.forEach((problem, idx) => {
                            if (mockExamAnswers[idx] === problem.answer) correct++;
                          });
                          const score = Math.round((correct / mockExamProblems.length) * 1000);
                          const timeSpent = mockExamStartTime ? Math.floor((Date.now() - mockExamStartTime) / 1000) : 0;

                          const results = {
                            totalScore: score,
                            correct: correct,
                            wrong: mockExamProblems.length - correct,
                            correctRate: Math.round((correct / mockExamProblems.length) * 100),
                            passed: score >= 720,
                            timeSpent: timeSpent
                          };
                          setMockExamResults(results);
                          setMockExamRunning(false);

                          // 오늘 날짜 저장 (일일 제한)
                          const today = new Date().toISOString().split("T")[0];
                          localStorage.setItem("lastMockExamDate", today);
                          setMockExamAlreadyTaken(true);
                        }}
                        style={{
                          padding: "8px 16px",
                          background: "rgba(16, 185, 129, 0.2)",
                          border: "1px solid rgba(16, 185, 129, 0.5)",
                          borderRadius: "6px",
                          color: "#10b981",
                          cursor: "pointer",
                          fontSize: "12px",
                          marginLeft: "auto"
                        }}
                      >
                        ✓ 채점하기
                      </button>
                    </div>
                  </div>
                ) : mockExamResults ? (
                  // 모의시험 결과 - 문제별 분석
                  <>
                    <div style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      overflowY: "auto",
                      height: "100%"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {mockExamProblems.map((problem, idx) => {
                          const userAnswer = mockExamAnswers[idx];
                          const isCorrect = userAnswer === problem.answer;

                          return (
                            <div key={idx} style={{
                              background: "rgba(30, 41, 59, 0.8)",
                              border: "1px solid rgba(100, 116, 139, 0.3)",
                              borderRadius: "8px",
                              padding: "16px"
                            }}>
                              {/* 문제 제목 */}
                              <h4 style={{ color: "#e2e8f0", marginTop: 0, marginBottom: "12px", fontSize: "13px" }}>
                                Q{idx + 1}. {problem.question}
                              </h4>

                              {/* 정답/오답 표시 */}
                              <div style={{ fontSize: "12px", color: isCorrect ? "#10b981" : "#ef4444", marginBottom: "12px", fontWeight: "bold" }}>
                                {isCorrect ? "✅ 정답입니다!" : "❌ 틀렸습니다."}
                              </div>

                              {/* 핵심 목표 */}
                              {(problem as any).goal && (
                                <div style={{ fontSize: "12px", color: "#a78bfa", marginBottom: "12px", padding: "8px", background: "rgba(167,139,250,0.1)", borderRadius: "4px" }}>
                                  <strong>🎯 핵심 목표:</strong> {(problem as any).goal}
                                </div>
                              )}

                              {/* 정답과 설명 */}
                              <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "12px" }}>
                                <strong>정답: {problem.answer}</strong>
                              </div>
                              <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "12px" }}>
                                <strong>설명</strong>
                                <p style={{ marginTop: "6px" }}>{problem.explanation.correct}</p>
                                {userAnswer !== problem.answer && problem.explanation[`trap_${userAnswer}` as keyof typeof problem.explanation] && (
                                  <p style={{ marginTop: "6px", color: "#ef4444" }}>
                                    <strong>⚠️ 함정:</strong> {problem.explanation[`trap_${userAnswer}` as keyof typeof problem.explanation]}
                                  </p>
                                )}
                              </div>

                              {/* 핵심 키워드 */}
                              {(problem as any).keywords && (problem as any).keywords.length > 0 && (
                                <div style={{ fontSize: "12px", color: "#cbd5e1", marginBottom: "12px", padding: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px" }}>
                                  <strong>📌 핵심 키워드:</strong>
                                  <div style={{ marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {(problem as any).keywords.map((kw: string, i: number) => (
                                      <span key={i} style={{ background: "rgba(59,130,246,0.3)", padding: "2px 8px", borderRadius: "12px", color: "#60a5fa" }}>
                                        <strong>{kw}</strong>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 이지모드 */}
                              {(problem as any).easyMode && (
                                <div style={{ fontSize: "12px", color: "#cbd5e1", padding: "12px", background: "rgba(245,158,11,0.1)", borderRadius: "6px" }}>
                                  <strong style={{ color: "#fbbf24" }}>👨‍🏫 쉽게설명:</strong>
                                  <p style={{ marginTop: "6px", lineHeight: "1.6" }}>{(problem as any).easyMode.explanation}</p>
                                  <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(245,158,11,0.2)" }}>
                                    <strong style={{ color: "#fbbf24" }}>각 보기 설명:</strong>
                                    {(["A", "B", "C", "D"] as const).map(opt => (
                                      <div key={opt} style={{ marginTop: "6px", color: opt === problem.answer ? "#4ade80" : "#cbd5e1" }}>
                                        <strong>{opt}.</strong> {(problem as any).easyMode[opt]}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : mockExamAlreadyTaken ? (
                  // 오늘 이미 본 경우
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%"
                  }}>
                    <div style={{
                      textAlign: "center",
                      background: "rgba(249, 115, 22, 0.1)",
                      border: "2px solid rgba(249, 115, 22, 0.4)",
                      borderRadius: "12px",
                      padding: "24px",
                      maxWidth: "400px"
                    }}>
                      <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "0 0 12px 0", lineHeight: "1.6" }}>
                        현재 UTC: {currentUtcTime}
                      </p>
                      <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "0", lineHeight: "1.6" }}>
                        {nextUtcDate} 자정(UTC 00:00)에 다시 응시할 수 있습니다
                      </p>
                    </div>
                  </div>
                ) : (
                  // 모의시험 시작 전
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%"
                  }}>
                    <div style={{
                      textAlign: "center"
                    }}>
                      <h2 style={{ fontSize: "20px", color: "#e2e8f0", margin: "0 0 12px 0" }}>
                        {t("mockExamTitle")}
                      </h2>
                      <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "0 0 16px 0" }}>
                        {t("mockExamDescription")}
                      </p>
                      <p style={{
                        fontSize: "12px",
                        color: "#64748b",
                        background: "rgba(100, 116, 139, 0.2)",
                        padding: "12px",
                        borderRadius: "6px",
                        margin: "0"
                      }}>
                        {t("mockExamInfo")}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            // 서버에서 admin 재검증
                            const adminCheck = await fetch('http://localhost:5000/api/checkAdmin', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: userEmail })
                            });
                            const adminData = await adminCheck.json();

                            if (!adminData.isAdmin) {
                              setError("관리자만 접근 가능합니다");
                              return;
                            }

                            let problems = await getTodayMockExamProblems(locale);
                            if (!problems) {
                              problems = [];
                              // 난이도 분배: 보통 20개, 어려움 20개, 챌린지 10개
                              const difficulties = [
                                ...Array(20).fill("medium"),
                                ...Array(20).fill("hard"),
                                ...Array(10).fill("challenge")
                              ];
                              // 순서 섞기 (shuffle)
                              for (let i = difficulties.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
                              }

                              for (let i = 0; i < 50; i++) {
                                const difficulty = difficulties[i] as "medium" | "hard" | "challenge";
                                const problem = await generateSAAProblem([], difficulty, locale);
                                problems.push(problem);
                              }
                              await saveTodayMockExamProblems(problems, locale);
                            }
                            setMockExamProblems(problems);
                          } catch (err) {
                            setError(locale === "ko" ? "문제 생성 실패" : locale === "ja" ? "問題生成失敗" : "Failed to generate problems");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        style={{
                          padding: "16px 32px",
                          background: "rgba(147, 112, 219, 0.3)",
                          border: "2px solid rgba(147, 112, 219, 0.6)",
                          borderRadius: "8px",
                          color: "#d8b4fe",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "16px",
                          fontWeight: "bold",
                          opacity: loading ? 0.6 : 1
                        }}
                      >
                        {loading ? t("btnGenerating") : t("mockExamAdminForceCreate")}
                      </button>
                    )}

                    {(userStatus === "paid" || isAdmin) && (
                      <button
                        onClick={async () => {
                          // ✅ 오늘 시험을 이미 시작했는지 확인
                          const today = new Date().toISOString().split('T')[0];
                          const mockExamStartedDate = localStorage.getItem("mockExamStartedToday");

                          if (mockExamStartedDate === today) {
                            alert(t("mockExamAlreadyStartedToday"));
                            return;
                          }

                          setLoading(true);
                          setMockExamIsLoading(true);
                          try {
                            console.log("시험 시작하기 - UTC 기준 오늘 문제 확인 중...");

                            // 1단계: Firestore에서 오늘의 UTC 기준 문제 조회 (언어별)
                            const existingProblems = await getTodayMockExamProblems(locale);
                            let allProblems = existingProblems;
                            let difficulties: string[] = [];

                            if (existingProblems && existingProblems.length > 0) {
                              // 이미 생성된 문제 존재 - 공유 사용
                              console.log("✅ 기존 문제 발견 (UTC 기준):", existingProblems.length);
                              allProblems = existingProblems;
                              // 기존 문제에서 난이도 추출
                              difficulties = existingProblems.map(p => {
                                if (p.question.includes("Challenge")) return "challenge";
                                if (p.question.includes("Hard")) return "hard";
                                return "medium";
                              });
                            } else {
                              // 새 문제 생성
                              console.log("🆕 새 문제 생성 (UTC 기준)");
                              difficulties = [
                                ...Array(20).fill("medium"),
                                ...Array(20).fill("hard"),
                                ...Array(10).fill("challenge")
                              ];
                              // 순서 섞기 (shuffle)
                              for (let i = difficulties.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
                              }
                            }

                            // 2단계: 첫 1문제만 로드
                            let problems = [];
                            if (allProblems && allProblems.length > 0) {
                              problems.push(allProblems[0]);
                            } else {
                              const difficulty = difficulties[0] as "medium" | "hard" | "challenge";
                              const problem = await generateSAAProblem([], difficulty, locale);
                              problems.push(problem);
                              allProblems = [problem];
                            }

                            setMockExamProblems(problems);
                            setMockExamAnswers(new Array(50).fill(null));
                            setMockExamStartTime(Date.now());
                            setMockExamTimeRemaining(130 * 60);
                            setMockExamCurrentIndex(0);
                            setMockExamRunning(true);

                            // localStorage에 저장 (백그라운드 로딩용)
                            localStorage.setItem("mockExamDifficulties", JSON.stringify(difficulties));
                            localStorage.setItem("mockExamProblemsCount", "1");
                            localStorage.setItem("mockExamAllProblems", JSON.stringify(allProblems));

                            // ✅ 오늘 시험 시작했음을 표시 (하루 한 번 제한용)
                            const today = new Date().toISOString().split('T')[0];
                            localStorage.setItem("mockExamStartedToday", today);

                            console.log("첫 문제 로드 완료, 백그라운드 로딩 시작");
                          } catch (err) {
                            console.error("시험 생성 에러:", err);
                            setError("모의시험 생성 실패");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        style={{
                          padding: "16px 32px",
                          background: "rgba(59, 130, 246, 0.3)",
                          border: "2px solid rgba(59, 130, 246, 0.6)",
                          borderRadius: "8px",
                          color: "#60a5fa",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "16px",
                          fontWeight: "bold",
                          opacity: loading ? 0.6 : 1
                        }}
                      >
                        {loading ? t("btnGenerating") : t("mockExamStart")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : tab === "posts" ? (
            <>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflowY: "auto" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <h2 style={{ fontSize: "18px", color: "#e2e8f0", margin: 0 }}>
                    📰 {t("tabPosts")} ({postsTotalCount})
                  </h2>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {/* Search */}
                    <input
                      type="text"
                      placeholder={t("postsSearch")}
                      value={postsSearch}
                      onChange={(e) => {
                        setPostsSearch(e.target.value);
                        setPostsPage(1);
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        color: "#cbd5e1",
                        fontSize: "12px",
                        width: "150px"
                      }}
                    />
                    {/* My Posts Toggle */}
                    <button
                      onClick={() => {
                        setPostsFilterMine(!postsFilterMine);
                        setPostsPage(1);
                      }}
                      style={{
                        padding: "6px 12px",
                        background: postsFilterMine ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.08)",
                        border: postsFilterMine ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        color: postsFilterMine ? "#f59e0b" : "#94a3b8",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {t("postsMine")}
                    </button>
                    {/* Write Button */}
                    {userEmail && (
                      <button
                        onClick={() => {
                          setShowPostForm(true);
                          setPostFormData({ title: "", content: "", authorName: "", password: "", isPublic: true });
                        }}
                        style={{
                          padding: "6px 12px",
                          background: "rgba(139,92,246,0.2)",
                          border: "1px solid rgba(139,92,246,0.4)",
                          borderRadius: "6px",
                          color: "#a78bfa",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {t("postsWrite")}
                      </button>
                    )}
                  </div>
                </div>

                {/* Posts List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  {posts.length === 0 ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "200px",
                      color: "#64748b",
                      fontSize: "14px"
                    }}>
                      {t("postsEmpty")}
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          padding: "16px",
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start"
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: "40px",
                          height: "40px",
                          minWidth: "40px",
                          borderRadius: "50%",
                          background: "rgba(139,92,246,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#a78bfa",
                          fontSize: "18px",
                          fontWeight: 600
                        }}>
                          {post.authorName.charAt(0).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{
                              fontSize: "11px",
                              color: post.isPublic ? "#10b981" : "#ef4444",
                              fontWeight: 600
                            }}>
                              {post.isPublic ? t("postsPublic") : t("postsSecret")}
                            </span>
                          </div>
                          <div
                            onClick={async () => {
                              try {
                                const user = getCurrentUser();
                                const post_data = await getPostById(post.id, user?.uid || "");
                                setSelectedPost(post_data);
                              } catch (error: any) {
                                alert(error.message);
                              }
                            }}
                            style={{
                              fontSize: "14px",
                              color: "#e2e8f0",
                              fontWeight: 600,
                              marginBottom: "6px",
                              wordBreak: "break-word",
                              cursor: "pointer"
                            }}
                          >
                            {post.title}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#cbd5e1",
                              marginBottom: "8px",
                              wordBreak: "break-word",
                              lineHeight: "1.4"
                            }}
                          >
                            {post.content && (post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                            {t("postsAuthor")}: {post.authorName}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {new Date(post.createdAt).toLocaleDateString(locale === "en" ? "en-US" : locale === "ja" ? "ja-JP" : "ko-KR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </div>

                        {/* Menu */}
                        {userEmail && getCurrentUser()?.uid === post.authorId && (
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={() => {
                                if (confirm(t("postsDeleteConfirm"))) {
                                  (async () => {
                                    try {
                                      await deletePost(post.id, getCurrentUser()!.uid);
                                      setPostsPage(1);
                                      const result = await getPosts(1, 20, postsSearch, postsFilterMine ? getCurrentUser()?.uid : "", getCurrentUser()?.uid || "");
                                      setPosts(result.posts);
                                      setPostsTotalCount(result.totalCount);
                                    } catch (error: any) {
                                      alert(error.message);
                                    }
                                  })();
                                }
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                fontSize: "18px",
                                padding: "4px"
                              }}
                            >
                              ⋮
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {postsTotalCount > 20 && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <button
                      onClick={() => setPostsPage(p => Math.max(1, p - 1))}
                      disabled={postsPage === 1}
                      style={{
                        padding: "4px 8px",
                        background: postsPage === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "4px",
                        color: postsPage === 1 ? "#475569" : "#94a3b8",
                        cursor: postsPage === 1 ? "not-allowed" : "pointer",
                        fontSize: "12px"
                      }}
                    >
                      ← {locale === "en" ? "Prev" : locale === "ja" ? "前へ" : "이전"}
                    </button>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {postsPage} / {Math.ceil(postsTotalCount / 20)}
                    </span>
                    <button
                      onClick={() => setPostsPage(p => p + 1)}
                      disabled={postsPage >= Math.ceil(postsTotalCount / 20)}
                      style={{
                        padding: "4px 8px",
                        background: postsPage >= Math.ceil(postsTotalCount / 20) ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "4px",
                        color: postsPage >= Math.ceil(postsTotalCount / 20) ? "#475569" : "#94a3b8",
                        cursor: postsPage >= Math.ceil(postsTotalCount / 20) ? "not-allowed" : "pointer",
                        fontSize: "12px"
                      }}
                    >
                      {locale === "en" ? "Next" : locale === "ja" ? "次へ" : "다음"} →
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : tab === "users" ? (
            <>
              {/* Users Sessions Panel */}
              <div className="graph-label">📁 PDF 파일</div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                gap: "12px",
                padding: "16px",
                overflow: "auto"
              }}>
                {!selectedUser ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#64748b",
                    fontSize: "13px",
                    textAlign: "center"
                  }}>
                    왼쪽에서 사용자를 선택하면<br/>PDF 파일이 표시됩니다
                  </div>
                ) : selectedUserSessions.length === 0 ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#64748b",
                    fontSize: "13px"
                  }}>
                    생성된 PDF가 없습니다
                  </div>
                ) : (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    height: "100%"
                  }}>
                    {/* 일괄 다운로드 버튼 */}
                    {selectedUserSessions.length > 0 && (
                      <button
                        onClick={async () => {
                          for (let i = 0; i < selectedUserSessions.length; i++) {
                            await generatePDF(selectedUserSessions[i]);
                            // 다음 다운로드 전 0.5초 딜레이
                            await new Promise(resolve => setTimeout(resolve, 500));
                          }
                        }}
                        style={{
                          padding: "10px 16px",
                          background: "rgba(59,130,246,0.2)",
                          border: "1px solid rgba(59,130,246,0.4)",
                          borderRadius: "6px",
                          color: "#60a5fa",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(59,130,246,0.3)";
                          e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(59,130,246,0.2)";
                          e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                        }}
                      >
                        📥 전체 PDF 다운로드 ({selectedUserSessions.length}개)
                      </button>
                    )}

                    {/* 세션 목록 */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      overflow: "auto",
                      flex: 1
                    }}>
                      {selectedUserSessions.map((session, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "6px",
                          padding: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        }}
                      >
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: "8px"
                        }}>
                          <div>
                            <div style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#cbd5e1"
                            }}>
                              📅 {session.date} {session.time}
                            </div>
                            <div style={{
                              fontSize: "11px",
                              color: "#94a3b8",
                              marginTop: "4px"
                            }}>
                              문제 수: {session.problemCount}개
                            </div>
                          </div>
                          <div style={{
                            fontSize: "10px",
                            background: session.difficulty === "medium"
                              ? "rgba(249,115,22,0.2)"
                              : session.difficulty === "hard"
                              ? "rgba(239,68,68,0.2)"
                              : "rgba(168,85,247,0.2)",
                            color: session.difficulty === "medium"
                              ? "#fb923c"
                              : session.difficulty === "hard"
                              ? "#ef4444"
                              : "#d8b4fe",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: 600
                          }}>
                            {session.difficulty === "medium" ? "보통" : session.difficulty === "hard" ? "어려움" : "챌린지"}
                          </div>
                        </div>
                        <div style={{
                          fontSize: "10px",
                          color: "#64748b"
                        }}>
                          {session.problemCount} 문제의 세부 정보 보기
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="graph-label">{t("graphLabel")}</div>
              <div className="graph-box">
                <GraphSVG pos={pos} setPos={setPos} posRef={posRef} dragRef={dragRef}
                  selected={selected} slots={slots} onNodeClick={onNodeClick} catFilter={catFilter} />
              </div>
            </>
          )}
        </div>

        {/* 시험 시작일 설정 모달 */}
        {showExamDateModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1001
          }} onClick={() => setShowExamDateModal(false)}>
            <div style={{
              background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
              padding: "32px", maxWidth: "450px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ color: "#fff", marginBottom: "24px", fontSize: "20px", textAlign: "center" }}>📅 시험 시작일 설정</h2>

              <div style={{ marginBottom: "24px" }}>
                <input type="date"
                  defaultValue={localStorage.getItem("examStartDate") || new Date().toISOString().split("T")[0]}
                  id="examDateInput"
                  onChange={(e) => {
                    const examDate = new Date(e.target.value);

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    examDate.setHours(0, 0, 0, 0);

                    const diff = examDate.getTime() - today.getTime();
                    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

                    const resultDiv = document.getElementById("examDaysResult");
                    if (resultDiv) {
                      resultDiv.textContent = daysLeft > 0 ? `시험까지 ${daysLeft}일 남았습니다` : daysLeft === 0 ? "오늘이 시험일입니다" : "시험일이 지났습니다";
                    }
                  }}
                  style={{
                    width: "100%", padding: "10px", background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px",
                    color: "#cbd5e1", fontSize: "14px", boxSizing: "border-box"
                  }} />

                <div id="examDaysResult" style={{
                  marginTop: "16px", padding: "12px", background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6px", fontSize: "14px", color: "#60a5fa", textAlign: "center", fontWeight: 600
                }}>
                  날짜를 선택하세요
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={async () => {
                  const selectedDate = (document.getElementById("examDateInput") as HTMLInputElement).value;
                  localStorage.setItem("examStartDate", selectedDate);
                  setDday(getExamDday());

                  // Firebase에 저장
                  const user = getCurrentUser();
                  if (user) {
                    try {
                      await saveExamStartDate(user.uid, selectedDate);
                    } catch (error) {
                      // 에러 처리만 수행 (로깅 제거)
                    }
                  }

                  setShowExamDateModal(false);
                }} style={{
                  flex: 1, padding: "12px", background: "#3b82f6", color: "#fff",
                  border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                }}>
                  ✅ 설정 완료
                </button>
                <button onClick={() => setShowExamDateModal(false)} style={{
                  flex: 1, padding: "12px", background: "rgba(255,255,255,0.1)", color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer"
                }}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Firebase 로그인/회원가입 모달 */}
        {showLoginModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1001
          }}>
            <div style={{
              background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px",
              padding: "48px 40px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ color: "#fff", marginBottom: "12px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
                {isSignUp ? "📝 " + t("btnSignUp") : "🔐 " + t("btnLogIn")}
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", marginBottom: "24px" }}>
                {t("verifyEmailDesc")}
              </p>

              {/* Google 로그인 버튼 */}
              <button
                onClick={async () => {
                  setLoginError(null);
                  setLoginLoading(true);
                  try {
                    const user = await signInWithGoogle();
                    setUserEmail(user.email);

                    // 사용자 정보 저장 및 결제 상태 로드
                    await saveUserInfoToFirebase(user.uid, user.email);
                    let isPaid = await getUserPaidStatus(user.uid);

                    // ✅ 임시 테스트: 특정 이메일은 자동으로 paid 처리
                    const paidTestEmails = ['imjaichoi@naver.com'];
                    if (paidTestEmails.includes(user.email)) {
                      isPaid = true;
                      await updateUserPaidStatus(user.uid, true); // ✅ Firebase에도 저장
                      console.log("✅ 테스트 이메일 자동 paid 처리:", user.email);
                    }

                    const status: UserStatus = isPaid ? "paid" : "loggedIn";
                    setUserStatusLocal(status);
                    localStorage.setItem("userStatus", status);

                    setDailyCount(0);
                    localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
                    localStorage.setItem("problemCount", "0");
                    setShowLoginModal(false);

                    // Firebase에서 시험 시작일 확인
                    const examStartDate = await getExamStartDate(user.uid);
                    if (examStartDate) {
                      localStorage.setItem("examStartDate", examStartDate);
                      setDday(getExamDday());
                    } else {
                      // 시험일정이 설정되지 않았을 때만 팝업 띄우기
                      setTimeout(() => setShowExamDateModal(true), 300);
                    }
                  } catch (err: any) {
                    setLoginError(err.message);
                  } finally {
                    setLoginLoading(false);
                  }
                }}
                disabled={loginLoading}
                style={{
                  width: "100%", padding: "12px", background: "#fff", color: "#000",
                  border: "1px solid #e5e7eb", borderRadius: "8px", cursor: loginLoading ? "not-allowed" : "pointer",
                  fontSize: "14px", fontWeight: "bold", marginTop: "16px", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: "8px", opacity: loginLoading ? 0.6 : 1
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("continueWithGoogle")}
              </button>

              {/* 또는 구분선 */}
              <div style={{ display: "flex", alignItems: "center", margin: "20px 0", gap: "12px" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.2)" }}></div>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>또는</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.2)" }}></div>
              </div>

              {/* 에러 메시지 */}
              {loginError && (
                <div style={{
                  marginBottom: "16px", padding: "12px", background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#fca5a5",
                  fontSize: "12px", textAlign: "center"
                }}>
                  ⚠️ {loginError}
                </div>
              )}

              {/* 이메일/비밀번호 입력 */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoginError(null);
                setLoginLoading(true);

                const email = sanitizeInput((document.getElementById("loginEmail") as HTMLInputElement).value);
                const password = (document.getElementById("loginPassword") as HTMLInputElement).value;
                const displayName = "";

                // 입력값 검증
                if (!validateEmail(email)) {
                  setLoginError("유효한 이메일 주소를 입력하세요");
                  setLoginLoading(false);
                  return;
                }

                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                  setLoginError(passwordValidation.error || "비밀번호 오류");
                  setLoginLoading(false);
                  return;
                }

                // Rate Limiting 확인
                if (!checkRateLimit(email)) {
                  setLoginError("너무 많은 요청이 발생했습니다. 잠시 후 다시 시도하세요");
                  setLoginLoading(false);
                  return;
                }

                try {
                  if (isSignUp) {
                    await signUp(email, password, displayName);
                  } else {
                    await signIn(email, password);
                  }

                  // 성공 시 상태 업데이트
                  setUserEmail(email);
                  const userName = isSignUp ? displayName : (localStorage.getItem("userName") || email.split("@")[0]);

                  // 사용자 정보 저장 및 결제 상태 로드
                  const user = getCurrentUser();
                  if (user) {
                    await saveUserInfoToFirebase(user.uid, email);
                    let isPaid = await getUserPaidStatus(user.uid);

                    // ✅ 임시 테스트: 특정 이메일은 자동으로 paid 처리
                    const paidTestEmails = ['imjaichoi@naver.com'];
                    if (paidTestEmails.includes(email)) {
                      isPaid = true;
                      await updateUserPaidStatus(user.uid, true); // ✅ Firebase에도 저장
                      console.log("✅ 테스트 이메일 자동 paid 처리:", email);
                    }

                    const status: UserStatus = isPaid ? "paid" : "loggedIn";
                    setUserStatusLocal(status);
                    localStorage.setItem("userStatus", status);
                  } else {
                    setUserStatusLocal("loggedIn");
                    localStorage.setItem("userStatus", "loggedIn");
                  }

                  localStorage.setItem("userName", userName);
                  setDailyCount(0);
                  localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
                  localStorage.setItem("problemCount", "0");
                  setShowLoginModal(false);

                  // 세션 타임아웃 설정 (30분 비활동 시 자동 로그아웃)
                  resetSessionTimeout(() => {
                    setUserEmail(null);
                    setUserStatusLocal("guest");
                    localStorage.removeItem("userStatus");
                  });

                  // Firebase에서 시험 시작일 확인
                  const currentUser = getCurrentUser();
                  if (currentUser) {
                    const examStartDate = await getExamStartDate(currentUser.uid);
                    if (examStartDate) {
                      localStorage.setItem("examStartDate", examStartDate);
                      setDday(getExamDday());
                    } else {
                      // 시험일정이 설정되지 않았을 때만 팝업 띄우기
                      setTimeout(() => setShowExamDateModal(true), 300);
                    }
                  } else {
                    // user가 없으면 localStorage에서 확인
                    const examDate = localStorage.getItem("examStartDate");
                    if (!examDate) {
                      setTimeout(() => setShowExamDateModal(true), 300);
                    }
                  }
                } catch (err: any) {
                  setLoginError(err.message);
                } finally {
                  setLoginLoading(false);
                }
              }} style={{ marginBottom: "24px" }}>
                <input type="email"
                  id="loginEmail"
                  placeholder={t("verifyEmailPlaceholder")}
                  required
                  style={{
                    width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px",
                    color: "#cbd5e1", fontSize: "14px", boxSizing: "border-box",
                    marginBottom: "12px"
                  }} />

                <input type="password"
                  id="loginPassword"
                  placeholder={t("passwordPlaceholder")}
                  required
                  minLength={6}
                  style={{
                    width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px",
                    color: "#cbd5e1", fontSize: "14px", boxSizing: "border-box",
                    marginBottom: "12px"
                  }} />

                <button type="submit"
                  disabled={loginLoading}
                  style={{
                    width: "100%", padding: "12px", background: "#3b82f6", color: "#fff",
                    border: "none", borderRadius: "8px", cursor: loginLoading ? "not-allowed" : "pointer",
                    fontSize: "14px", fontWeight: "bold", opacity: loginLoading ? 0.6 : 1
                  }}>
                  {loginLoading ? t("btnGenerating") : (isSignUp ? t("btnSignUp") : t("btnLogIn"))}
                </button>
              </form>

              {/* 로그인/회원가입 토글 */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                  {isSignUp ? t("alreadyHaveAccount") + " " : t("dontHaveAccount") + " "}
                  <button onClick={() => { setIsSignUp(!isSignUp); setLoginError(null); }}
                    style={{
                      background: "none", border: "none", color: "#3b82f6",
                      cursor: "pointer", textDecoration: "underline", fontSize: "13px"
                    }}>
                    {isSignUp ? t("btnLogIn") : t("btnSignUp")}
                  </button>
                </span>
              </div>

              {/* 정보 박스 */}
              <div style={{
                textAlign: "center", color: "#cbd5e1", fontSize: "12px",
                padding: "16px", background: "rgba(139,92,246,0.1)", borderRadius: "8px",
                border: "1px solid rgba(139,92,246,0.3)", lineHeight: "1.6"
              }}>
                <p style={{ marginBottom: "8px" }}><strong>{t("loginGetTitle")}</strong></p>
                <p style={{ marginBottom: "12px", color: "#a8d5ff", fontWeight: 500 }}>{t("aiFeature")}</p>
                <p>{t("loginFreeAttempts")}</p>
                <p style={{ marginTop: "12px", color: "#8b5cf6", fontWeight: "bold" }}>{t("loginUpgradeOffer")}</p>
              </div>

              <button onClick={() => { setShowLoginModal(false); setLoginError(null); }} style={{
                width: "100%", padding: "12px", background: "transparent", color: "#94a3b8",
                border: "none", cursor: "pointer", fontSize: "14px", marginTop: "20px"
              }}>
                {t("cancelBtn")}
              </button>
            </div>
          </div>
        )}

        {/* 인증 모달 */}
        {showAuthModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000
          }} onClick={() => setShowAuthModal(false)}>
            <div style={{
              background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
              padding: "32px", maxWidth: "500px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ color: "#fff", marginBottom: "16px", fontSize: "20px" }}>🚀 {t("labelQuotaFull") || "Quota Limited"}</h2>

              <div style={{ marginBottom: "24px", color: "#cbd5e1", lineHeight: "1.6", fontSize: "14px" }}>
                {userStatus === "guest" && (
                  <>
                    <p>📌 <strong>Guest (비로그인):</strong> 하루 2회 무료</p>
                    <p style={{ marginTop: "12px" }}>로그인하면 하루 <strong>2회 무료</strong>를 이용할 수 있으며, 결제 후에는 <strong>하루 20개 문제</strong>를 생성할 수 있습니다.</p>
                    <div style={{ marginTop: "16px", padding: "12px", background: "rgba(139,92,246,0.15)", borderRadius: "6px", border: "1px solid rgba(139,92,246,0.3)" }}>
                      <p style={{ margin: "0 0 8px 0", color: "#e0e7ff", fontWeight: "bold" }}>💎 {t("premiumPlan")}</p>
                      <p style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#8b5cf6", fontWeight: "bold" }}>{t("premiumPrice")}</p>
                      <p style={{ margin: "0", fontSize: "12px" }}>{t("premiumUnlimited")}<br />{t("premiumAllDifficulty")}<br />{t("premiumAdFree")}<br />{t("premiumCancelAnytime")}</p>
                    </div>
                  </>
                )}
                {userStatus === "loggedIn" && (
                  <>
                    <p>✨ <strong>로그인:</strong> 2회 무료 이용 완료</p>
                    <p style={{ marginTop: "12px" }}>결제하시면 <strong>하루 20개 문제</strong>를 생성하실 수 있습니다!</p>
                    <div style={{ marginTop: "16px", padding: "12px", background: "rgba(139,92,246,0.15)", borderRadius: "6px", border: "1px solid rgba(139,92,246,0.3)" }}>
                      <p style={{ margin: "0 0 8px 0", color: "#e0e7ff", fontWeight: "bold" }}>💎 {t("premiumPlan")}</p>
                      <p style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#8b5cf6", fontWeight: "bold" }}>{t("premiumPrice")}</p>
                      <p style={{ margin: "0", fontSize: "12px" }}>{t("premiumUnlimited")}<br />{t("premiumAllDifficulty")}<br />{t("premiumAdFree")}<br />{t("premiumCancelAnytime")}</p>
                    </div>
                  </>
                )}
                {userStatus === "paid" && (
                  <>
                    <p>💎 <strong>Premium (결제):</strong> 하루 20개 문제 이용 중</p>
                    <p style={{ marginTop: "12px" }}>내일 자정에 카운트가 초기화됩니다.</p>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                {userStatus === "guest" && (
                  <>
                    <button onClick={() => {
                      setUserStatus("loggedIn");
                      setUserStatusLocal("loggedIn");
                      setDailyCount(0);
                      localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
                      localStorage.setItem("problemCount", "0");
                      setShowAuthModal(false);
                    }} style={{
                      flex: 1, padding: "12px", background: "#3b82f6", color: "#fff",
                      border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                    }}>
                      📝 로그인
                    </button>
                    <button onClick={() => {
                      setUserStatus("paid");
                      setUserStatusLocal("paid");
                      setDailyCount(0);
                      localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
                      localStorage.setItem("problemCount", "0");
                      setShowAuthModal(false);
                    }} style={{
                      flex: 1, padding: "12px", background: "#8b5cf6", color: "#fff",
                      border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                    }}>
                      💳 프리미엄 업그레이드
                    </button>
                  </>
                )}
                {userStatus === "loggedIn" && (
                  <button onClick={() => {
                    setUserStatus("paid");
                    setUserStatusLocal("paid");
                    setDailyCount(0);
                    localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
                    localStorage.setItem("problemCount", "0");
                    setShowAuthModal(false);
                  }} style={{
                    flex: 1, padding: "12px", background: "#8b5cf6", color: "#fff",
                    border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                  }}>
                    💳 프리미엄 업그레이드
                  </button>
                )}
                <button onClick={() => setShowAuthModal(false)} style={{
                  flex: 1, padding: "12px", background: "rgba(255,255,255,0.1)", color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer"
                }}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal (Stripe) */}
        {showPaymentModal && (
          <PaymentModal
            onClose={() => setShowPaymentModal(false)}
            onSuccess={async () => {
              setUserStatusLocal("paid");
              setUserStatus("paid");
              setDailyCount(0);
              localStorage.setItem("userStatus", "paid");
              localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
              localStorage.setItem("problemCount", "0");

              // Firestore에 결제 상태 저장
              const user = getCurrentUser();
              if (user) {
                try {
                  await updateUserPaidStatus(user.uid, true);
                } catch (error) {
                  // 에러 무시
                }
              }

              setTimeout(() => setShowPaymentModal(false), 1000);
            }}
            userEmail={userEmail || ""}
          />
        )}

        {/* Write Post Modal */}
        {showPostForm && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "#0b0f1e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}>
              <h3 style={{ fontSize: "16px", color: "#e2e8f0", marginBottom: "16px" }}>
                📝 {t("postsWrite")}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Title */}
                <input
                  type="text"
                  placeholder={t("postsTitle")}
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  maxLength={100}
                  style={{
                    padding: "10px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "#cbd5e1",
                    fontSize: "13px"
                  }}
                />
                {/* Author Name */}
                <input
                  type="text"
                  placeholder={userEmail?.split("@")[0] || t("postsAuthor")}
                  value={userEmail?.split("@")[0] || ""}
                  disabled={true}
                  maxLength={50}
                  style={{
                    padding: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "#94a3b8",
                    fontSize: "13px",
                    cursor: "not-allowed"
                  }}
                />
                {/* Content */}
                <textarea
                  placeholder={t("postsContent")}
                  value={postFormData.content}
                  onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value.slice(0, 800) })}
                  maxLength={800}
                  style={{
                    padding: "10px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    color: "#cbd5e1",
                    fontSize: "13px",
                    minHeight: "150px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
                <div style={{ fontSize: "11px", color: "#64748b", textAlign: "right" }}>
                  {postFormData.content.length}/800
                </div>
                {/* Public/Private Toggle */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setPostFormData({ ...postFormData, isPublic: true, password: "" })}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: postFormData.isPublic ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                      border: postFormData.isPublic ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: postFormData.isPublic ? "#10b981" : "#94a3b8",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {t("postsPublic")}
                  </button>
                  <button
                    onClick={() => setPostFormData({ ...postFormData, isPublic: false })}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: !postFormData.isPublic ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
                      border: !postFormData.isPublic ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: !postFormData.isPublic ? "#ef4444" : "#94a3b8",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {t("postsSecret")}
                  </button>
                </div>
                {/* Password (if private) */}
                {!postFormData.isPublic && (
                  <input
                    type="password"
                    placeholder={t("postsPassword")}
                    value={postFormData.password}
                    onChange={(e) => setPostFormData({ ...postFormData, password: e.target.value.slice(0, 20) })}
                    maxLength={20}
                    autoComplete="new-password"
                    style={{
                      padding: "10px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "#cbd5e1",
                      fontSize: "13px"
                    }}
                  />
                )}
                {/* Buttons */}
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    onClick={async () => {
                      if (!postFormData.title.trim() || !postFormData.content.trim()) {
                        alert(locale === "en" ? "Please fill in all fields" : locale === "ja" ? "すべてのフィールドに入力してください" : "모든 항목을 입력하세요");
                        return;
                      }
                      if (!postFormData.isPublic && !postFormData.password.trim()) {
                        alert(t("postsPasswordRequired"));
                        return;
                      }
                      setPostFormLoading(true);
                      try {
                        const user = getCurrentUser();
                        await createPost(
                          postFormData.title,
                          postFormData.content,
                          userEmail?.split("@")[0] || "Guest",
                          user?.uid || "guest",
                          postFormData.isPublic,
                          postFormData.password || undefined
                        );
                        setShowPostForm(false);
                        setPostFormData({ title: "", content: "", authorName: "", password: "", isPublic: true });
                        setPostsPage(1);
                        const result = await getPosts(1, 20, postsSearch, postsFilterMine ? user?.uid : "", user?.uid || "");
                        setPosts(result.posts);
                        setPostsTotalCount(result.totalCount);
                      } catch (error: any) {
                        alert(error.message);
                      } finally {
                        setPostFormLoading(false);
                      }
                    }}
                    disabled={postFormLoading}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: postFormLoading ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.2)",
                      border: "1px solid rgba(139,92,246,0.4)",
                      borderRadius: "6px",
                      color: "#a78bfa",
                      cursor: postFormLoading ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: 600
                    }}
                  >
                    {postFormLoading ? "등록 중..." : t("postsSubmit")}
                  </button>
                  <button
                    onClick={() => setShowPostForm(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      color: "#94a3b8",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {t("postsCancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
