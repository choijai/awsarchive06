import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { NODES, LINKS, CAT, CONCEPTS_KO, CONCEPTS_JA } from "./data";
import { generateSAAProblem, Problem, translateConcept, Concept } from "./api";
import { useLocale } from "./LocaleContext";
import { trackVisitor, getTodayVisitorCount, getTotalVisitorCount, getTodayPurchaseCount, recordPaidPurchase, getDailyVisitors, getWeeklyVisitors, getMonthlyVisitors, getDailyVisitorsForMonth, getWeeklyVisitorsForMonth, getDailyVisitorsForWeek } from "./analytics";
import { signUp, signIn, signInWithGoogle, signOut as firebaseSignOut, updateStreakInFirebase, getAdminStats, ADMIN_UID } from "./firebase";
import "./styles.css";

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
  const startDate = localStorage.getItem("examStartDate");
  if (!startDate) return "-";

  const start = new Date(startDate);
  const now = new Date();
  const examDate = new Date(start);
  examDate.setDate(examDate.getDate() + 84); // 12주 = 84일

  const diff = examDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

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
  const [tab, setTab] = useState<"quiz" | "concept" | "status" | "admin">("quiz");
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [totalVisitorCount, setTotalVisitorCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [paidUsers, setPaidUsers] = useState(0);
  const [freeUsers, setFreeUsers] = useState(0);
  const [graphPeriod, setGraphPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [graphMonthOffset, setGraphMonthOffset] = useState(0);
  const [graphWeekIndex, setGraphWeekIndex] = useState(0);
  const [graphData, setGraphData] = useState<Array<{ label: string; count: number }>>([]);
  const [graphZoom, setGraphZoom] = useState(1);
  const [graphScroll, setGraphScroll] = useState(0);
  const [conceptCache, setConceptCache] = useState<Map<string, Concept>>(new Map());
  const [conceptTranslating, setConceptTranslating] = useState(false);

  // 사용자 상태 및 일일 제한
  const [userStatus, setUserStatusLocal] = useState<UserStatus>("guest");
  const [dailyCount, setDailyCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dday, setDday] = useState("-");
  const [showExamDateModal, setShowExamDateModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  // Track visitors and load purchase count on mount
  useEffect(() => {
    const count = trackVisitor();
    setVisitorCount(count);
    setTotalVisitorCount(getTotalVisitorCount());
    setPurchaseCount(getTodayPurchaseCount());

    // 사용자 상태 초기화
    setUserStatusLocal(getUserStatus());
    setDailyCount(getTodayProblemCount());

    // 저장된 이메일 불러오기
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

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

  // 로그인 후 streak 업데이트 (Firebase)
  useEffect(() => {
    if (userEmail) {
      (async () => {
        try {
          // Firebase Auth의 실제 uid를 사용하여 업데이트
          const firebaseStreak = await updateStreakInFirebase(userStatus);
          setStreak(firebaseStreak);
          // 로컬 저장소에도 백업
          localStorage.setItem("streak", firebaseStreak.toString());
        } catch (error) {
          console.error("Firebase streak 업데이트 실패, 로컬로 폴백:", error);
          // Firebase 실패 시 로컬 함수 사용
          setStreak(updateStreak());
        }
      })();
    }
  }, [userEmail]);

  // Admin 탭 통계 로드
  useEffect(() => {
    if (tab === "admin" && ADMIN_UID && userEmail) {
      (async () => {
        try {
          const stats = await getAdminStats();
          setPaidUsers(stats.paidUsers);
          setFreeUsers(stats.freeUsers);
        } catch (error) {
          console.error("관리자 통계 로드 실패:", error);
        }
      })();
    }
  }, [tab]);

  // 그래프 데이터 업데이트
  useEffect(() => {
    if (graphPeriod === "daily") {
      const data = getDailyVisitorsForMonth(graphMonthOffset);
      setGraphData(data.map(d => ({ label: d.date, count: d.count })));
    } else if (graphPeriod === "weekly") {
      const data = getWeeklyVisitorsForMonth(graphMonthOffset);
      setGraphData(data.map(d => ({ label: d.week, count: d.count })));
    } else if (graphPeriod === "monthly") {
      const data = getMonthlyVisitors();
      setGraphData(data.map(d => ({ label: d.month, count: d.count })));
    }
    setGraphZoom(1);
    setGraphScroll(0);
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
    setDifficulty(null);
    setProblem(null);
    setSelectedAnswer(null);
    setError(null);
  };

  const handleGenerateProblem = async () => {
    if (slots.length === 0) return;

    // 일일 제한 확인
    const limit = getDailyLimit();
    if (dailyCount >= limit) {
      setError(getQuotaMessage(userStatus, limit, dailyCount));
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedAnswer(null);

    try {
      const serviceNames = slots.map(id => {
        const node = NODES.find(n => n.id === id);
        return node?.name || id;
      });

      const diff = (difficulty || "medium") as "easy" | "medium" | "hard";
      const generatedProblem = await generateSAAProblem(serviceNames, diff, locale);
      setProblem(generatedProblem);

      // 카운트 증가
      incrementProblemCount();
      setDailyCount(getTodayProblemCount());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGenerate"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 할당량 메시지 생성
  function getQuotaMessage(status: UserStatus, limit: number, current: number): string {
    const remaining = Math.max(0, limit - current);
    if (status === "guest") {
      return `🔐 Daily limit reached (2/2). Please log in for 2 free attempts, or upgrade to unlimited.`;
    }
    if (status === "loggedIn") {
      return `✨ Your free 2 attempts are used. Please upgrade to generate unlimited problems today!`;
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

  useEffect(() => {
    if (tab === "concept" && selected) {
      getConceptForLocale().then(c => setConcept(c));
    }
  }, [tab, selected, locale]);

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null;

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
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div className="visitor-count">
            <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>{t("currentVisitors")}</div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>👥 {visitorCount}</div>
          </div>

          {/* 사용자 상태 및 일일 카운트 / 로그인 */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            fontSize: "10px", color: "#94a3b8", marginLeft: "16px", padding: "0 12px",
            borderLeft: "1px solid rgba(255,255,255,0.1)"
          }}>
            {userEmail ? (
              <>
                <div style={{ fontSize: "12px", color: "#cbd5e1", textAlign: "center", fontWeight: "bold" }}>
                  👤 {userEmail.split("@")[0]}
                </div>
                <button onClick={() => {
                  setUserEmail(null);
                  setUserStatusLocal("guest");
                  localStorage.removeItem("userEmail");
                }} style={{
                  fontSize: "10px", padding: "4px 8px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8",
                  borderRadius: "4px", cursor: "pointer", marginTop: "4px"
                }}>
                  {t("logoutBtn")}
                </button>
              </>
            ) : (
              <button onClick={() => setShowLoginModal(true)} style={{
                fontSize: "11px", padding: "8px 12px", background: "#3b82f6", color: "#fff",
                border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold",
                whiteSpace: "nowrap"
              }}>
                {t("btnLogin")}
              </button>
            )}
          </div>

          {/* D-day 배지 + 날짜 아이콘 통합 */}
          <span className="badge" style={{ cursor: userEmail ? "pointer" : "default" }}
            onClick={() => userEmail && setShowExamDateModal(true)}
            title={userEmail ? "시작일 변경" : "로그인 후 설정 가능"}>
            📅 {dday === "-" ? "-" : dday}
          </span>
          {userEmail && <span className="streak">🔥 {streak}{t("streakSuffix")}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "quiz" ? "active" : ""}`} onClick={() => setTab("quiz")}>&#127919; {t("tabQuiz")}</button>
        <button className={`tab ${tab === "concept" ? "active" : ""}`} onClick={() => setTab("concept")}>&#128218; {t("tabConcept")}</button>
        <button className={`tab ${tab === "status" ? "active" : ""}`} onClick={() => setTab("status")}>&#128202; {t("tabStatus")}</button>
        {/* 관리자에게만 Admin 탭 표시 */}
        {ADMIN_UID && userEmail && (
          <button className={`tab ${tab === "admin" ? "active" : ""}`} onClick={() => setTab("admin")}>⚙️ Admin</button>
        )}
      </div>

      <div className="main-area">
        {/* Left: Controls */}
        <div className="controls-panel">
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
                    {(["easy", "medium", "hard"] as const).map(d => (
                      <button key={d} className={`diff-btn ${difficulty === d ? "active" : ""}`}
                        onClick={() => setDifficulty(difficulty === d ? null : d)}>
                        {d === "easy" ? t("diffEasy") : d === "medium" ? t("diffMedium") : t("diffHard")}
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
                  disabled={slots.length === 0 || loading || dailyCount >= getDailyLimit()}
                  onClick={handleGenerateProblem}
                  title={dailyCount >= getDailyLimit() ? getQuotaMessage(userStatus, getDailyLimit(), dailyCount) : ""}>
                  {loading ? t("btnGenerating") : t("btnGenerate")} ({slots.length}{locale === "ja" ? "個" : ""})
                  <br />
                  <span style={{ fontSize: "11px", opacity: 0.7, display: "block", marginTop: "4px" }}>
                    {dailyCount}/{getDailyLimit()}
                  </span>
                </button>

                {/* 프리미엄 배너 (로그인하지 않았거나 일반 사용자일 때) */}
                {userStatus !== "paid" && !error && (
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
                    <button onClick={() => setShowAuthModal(true)} style={{
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
                        <label style={{ display: "block", color: "#cbd5e1", fontSize: "12px", marginBottom: "8px", fontWeight: "bold" }}>
                          SAA-C03 시험 날짜 (84일 후가 시험일입니다)
                        </label>
                        <input type="date"
                          defaultValue={new Date().toISOString().split("T")[0]}
                          id="examDateInput"
                          style={{
                            width: "100%", padding: "10px", background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px",
                            color: "#cbd5e1", fontSize: "14px", boxSizing: "border-box"
                          }} />

                        <div style={{
                          marginTop: "16px", padding: "12px", background: "rgba(59,130,246,0.1)",
                          border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6px", fontSize: "12px", color: "#cbd5e1"
                        }}>
                          ✨ <strong>팁:</strong> 시작일부터 84일 후가 시험 예정일입니다.
                          <br />📍 우측 상단에서 D-day를 확인할 수 있습니다!
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => {
                          setExamStartDate();
                          setDday(getExamDday());
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
                            setUserStatusLocal("loggedIn");
                            localStorage.setItem("userEmail", user.email || "");
                            localStorage.setItem("userStatus", "loggedIn");
                            setDailyCount(0);
                            localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
                            localStorage.setItem("problemCount", "0");
                            setShowLoginModal(false);
                            // 시험일정이 설정되지 않았을 때만 팝업 띄우기
                            const examDate = localStorage.getItem("examStartDate");
                            if (!examDate) {
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
                          fontSize: "14px", fontWeight: "bold", marginBottom: "16px", display: "flex",
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

                        const email = (document.getElementById("loginEmail") as HTMLInputElement).value;
                        const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

                        try {
                          if (isSignUp) {
                            await signUp(email, password);
                          } else {
                            await signIn(email, password);
                          }

                          // 성공 시 상태 업데이트
                          setUserEmail(email);
                          setUserStatusLocal("loggedIn");
                          localStorage.setItem("userEmail", email);
                          localStorage.setItem("userStatus", "loggedIn");
                          setDailyCount(0);
                          localStorage.setItem("problemCountDate", new Date().toISOString().split("T")[0]);
                          localStorage.setItem("problemCount", "0");
                          setShowLoginModal(false);

                          // 시험일정이 설정되지 않았을 때만 팝업 띄우기
                          const examDate = localStorage.getItem("examStartDate");
                          if (!examDate) {
                            setTimeout(() => setShowExamDateModal(true), 300);
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
                              <p style={{ margin: "0", fontSize: "12px" }}>{t("premiumUnlimited")}<br />{t("premiumAllDifficulty")}<br />{t("premiumAdFree")}</p>
                            </div>
                          </>
                        )}
                        {userStatus === "loggedIn" && (
                          <>
                            <p>✨ <strong>Logged In (로그인):</strong> 2회 무료 이용 완료</p>
                            <p style={{ marginTop: "12px" }}>결제하시면 <strong>하루 20개 문제</strong>를 무제한으로 생성하실 수 있습니다!</p>
                            <div style={{ marginTop: "16px", padding: "12px", background: "rgba(139,92,246,0.15)", borderRadius: "6px", border: "1px solid rgba(139,92,246,0.3)" }}>
                              <p style={{ margin: "0 0 8px 0", color: "#e0e7ff", fontWeight: "bold" }}>💎 {t("premiumPlan")}</p>
                              <p style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#8b5cf6", fontWeight: "bold" }}>{t("premiumPrice")}</p>
                              <p style={{ margin: "0", fontSize: "12px" }}>{t("premiumUnlimited")}<br />{t("premiumAllDifficulty")}<br />{t("premiumAdFree")}</p>
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
                            width: "100%", padding: "12px", background: "#8b5cf6", color: "#fff",
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

                {problem && (
                  <div className="problem-container" style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
                    <h3 style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "12px" }}>📝</h3>
                    <div className="problem-content">
                      <div className="problem-section" style={{ marginBottom: "16px" }}>
                        <p style={{ color: "#cbd5e1", lineHeight: "1.6", marginBottom: "8px" }}>{problem.question}</p>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                          <strong>{t("labelConstraints")}</strong> {problem.constraint.join(" + ")}
                        </div>
                      </div>

                      <div className="options" style={{ marginBottom: "16px" }}>
                        {(["A", "B", "C", "D"] as const).map(opt => (
                          <button
                            key={opt}
                            onClick={() => setSelectedAnswer(opt)}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "12px",
                              marginBottom: "8px",
                              background: selectedAnswer === opt
                                ? (opt === problem.answer ? "#10b981" : "#ef4444")
                                : "rgba(255,255,255,0.05)",
                              border: `1px solid ${selectedAnswer === opt ? (opt === problem.answer ? "#10b981" : "#ef4444") : "rgba(255,255,255,0.1)"}`,
                              borderRadius: "6px",
                              color: "#cbd5e1",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "13px",
                              transition: "all 0.2s",
                            }}
                          >
                            <strong>{opt}.</strong> {problem.options[opt]}
                          </button>
                        ))}
                      </div>

                      {selectedAnswer && (
                        <div className="explanation" style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "6px", marginTop: "12px" }}>
                          <div style={{ fontSize: "12px", color: selectedAnswer === problem.answer ? "#10b981" : "#ef4444", marginBottom: "8px", fontWeight: "bold" }}>
                            {selectedAnswer === problem.answer ? t("labelCorrect") : t("labelWrong")}
                          </div>
                          <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "8px" }}>
                            <strong>{t("labelAnswer")}</strong> {problem.answer}
                          </div>
                          <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6" }}>
                            <strong>{t("labelExplanation")}</strong>
                            <p style={{ marginTop: "6px" }}>{problem.explanation.correct}</p>
                            {selectedAnswer !== problem.answer && problem.explanation[`trap_${selectedAnswer}` as keyof typeof problem.explanation] && (
                              <p style={{ marginTop: "6px", color: "#ef4444" }}>
                                <strong>{t("labelTrapOption")}</strong> {problem.explanation[`trap_${selectedAnswer}` as keyof typeof problem.explanation]}
                              </p>
                            )}
                          </div>
                          {problem.patterns && (
                            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                              <strong style={{ fontSize: "12px" }}>{t("labelPatterns")}</strong>
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

          {tab === "status" && (
            <div className="status-panel">
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h2 style={{ fontSize: "18px", color: "#e2e8f0", marginBottom: "12px" }}>
                  {t("dashboardTitle")}
                </h2>

                {/* Login prompt if not logged in */}
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
                  <button style={{
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
                      0
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
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#e2e8f0", marginBottom: "8px" }}>
                      0%
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {t("correctRate")}
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

                {/* Weak Services */}
                <div>
                  <h3 style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
                    {t("weakServices")} {t("weakServicesDesc")}
                  </h3>
                  <div style={{ color: "#64748b", fontSize: "12px", textAlign: "center", padding: "20px" }}>
                    {t("noData")}
                  </div>
                </div>

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
              </div>
            </div>
          )}

          {/* Admin Panel - 관리자만 접근 가능 */}
          {tab === "admin" && ADMIN_UID && userEmail && (
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

              {/* Test Purchase Button */}
              <div style={{
                paddingTop: "12px"
              }}>
                <button
                  onClick={() => {
                    recordPaidPurchase();
                    setPurchaseCount(getTodayPurchaseCount());
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    fontSize: "12px",
                    background: "rgba(34,197,94,0.2)",
                    border: "1px solid rgba(34,197,94,0.4)",
                    borderRadius: "6px",
                    color: "#4ade80",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(34,197,94,0.3)";
                    e.currentTarget.style.borderColor = "rgba(34,197,94,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(34,197,94,0.2)";
                    e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)";
                  }}
                >
                  + Record Purchase (Dev)
                </button>
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
        </div>

        {/* Right: Graph or Admin Chart */}
        <div className="graph-panel">
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
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {graphPeriod !== "monthly" && (
                        <button
                          onClick={() => {
                            if (graphPeriod === "daily") {
                              setGraphPeriod("weekly");
                            } else if (graphPeriod === "weekly") {
                              setGraphPeriod("monthly");
                            }
                          }}
                          style={{
                            padding: "4px 8px",
                            background: "rgba(59,130,246,0.2)",
                            border: "1px solid rgba(59,130,246,0.3)",
                            borderRadius: "4px",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}>
                          ← {locale === "en" ? "Back" : locale === "ja" ? "戻る" : "뒤로"}
                        </button>
                      )}
                      <span style={{ fontWeight: "500" }}>
                        {graphPeriod === "monthly"
                          ? locale === "en" ? "Monthly Overview" : locale === "ja" ? "月別概要" : "월별 현황"
                          : graphPeriod === "weekly"
                          ? locale === "en" ? `Weekly - ${new Date(new Date().getFullYear(), new Date().getMonth() - graphMonthOffset, 1).toLocaleDateString(locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR", { month: "long", year: "numeric" })}` : "주별 현황"
                          : locale === "en" ? `Daily - ${new Date(new Date().getFullYear(), new Date().getMonth() - graphMonthOffset, 1).toLocaleDateString(locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR", { month: "long", year: "numeric" })}` : "일별 현황"}
                      </span>
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
                      overflow: "auto",
                      cursor: "grab"
                    }}
                      onWheel={(e) => {
                        e.preventDefault();
                        // 줌아웃 (아래 스크롤): 더 넓은 범위 보기
                        if (e.deltaY > 0) {
                          if (graphPeriod === "daily") {
                            setGraphPeriod("weekly");
                          } else if (graphPeriod === "weekly") {
                            setGraphPeriod("monthly");
                          }
                        }
                        // 줌인 (위로 스크롤): 더 상세하게 보기
                        else {
                          if (graphPeriod === "monthly") {
                            setGraphPeriod("weekly");
                          } else if (graphPeriod === "weekly") {
                            setGraphPeriod("daily");
                          }
                        }
                      }}
                      onMouseDown={(e) => {
                        const startX = e.clientX;
                        const startScroll = graphScroll;
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const delta = moveEvent.clientX - startX;
                          setGraphScroll(Math.max(0, startScroll - delta * 2));
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove);
                          document.removeEventListener("mouseup", handleMouseUp);
                        };
                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    >
                      <svg viewBox={`${graphScroll} 0 500 250`} style={{ width: `${graphZoom * 100}%`, height: "100%", minWidth: "100%" }}>
                        {/* X-axis */}
                        <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        {/* Y-axis */}
                        <line x1="40" y1="20" x2="40" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                        {/* Grid lines and labels (0-100 range) */}
                        {[0, 20, 40, 60, 80, 100].map((value) => (
                          <g key={`grid-${value}`}>
                            <line x1="35" y1={200 - (value / 100) * 180} x2="480" y2={200 - (value / 100) * 180} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            <text x="25" y={205 - (value / 100) * 180} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="end">
                              {value}
                            </text>
                          </g>
                        ))}

                        {/* Bars */}
                        {graphData.map((item, idx) => {
                          const barHeight = Math.min(item.count, 100) * 1.8; // Scale to 0-100 range
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
      </div>
    </div>
  );
}

export default App;
