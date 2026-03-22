import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { NODES, LINKS, CAT, CONCEPTS } from "./data";
import { generateSAAProblem, Problem, translateConcept, Concept } from "./api";
import { useLocale } from "./LocaleContext";
import "./styles.css";

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
  const [tab, setTab] = useState<"quiz" | "concept" | "status">("quiz");
  const [selected, setSelected] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [conceptCache, setConceptCache] = useState<Map<string, Concept>>(new Map());
  const [conceptTranslating, setConceptTranslating] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGenerate"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Concept translation logic
  const getConceptForLocale = async () => {
    if (!selected) return null;

    if (locale === "ko") {
      return CONCEPTS[selected] || null;
    }

    const cacheKey = `${locale}:${selected}`;
    if (conceptCache.has(cacheKey)) {
      return conceptCache.get(cacheKey)!;
    }

    // Fetch and translate
    const koConcept = CONCEPTS[selected];
    if (!koConcept) return null;

    setConceptTranslating(true);
    try {
      const translated = await translateConcept(koConcept, locale as "ja" | "en");
      const newCache = new Map(conceptCache);
      newCache.set(cacheKey, translated);
      setConceptCache(newCache);
      return translated;
    } catch (err) {
      console.error("Concept translation failed:", err);
      // Fallback to Korean
      return koConcept;
    } finally {
      setConceptTranslating(false);
    }
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
            {(["ko", "ja", "en"] as const).map(l => (
              <button
                key={l}
                className={`lang-btn ${locale === l ? "active" : ""}`}
                onClick={() => setLocale(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="badge">D-14</span>
          <span className="streak">&#128293; 1{t("streakSuffix")}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "quiz" ? "active" : ""}`} onClick={() => setTab("quiz")}>&#127919; {t("tabQuiz")}</button>
        <button className={`tab ${tab === "concept" ? "active" : ""}`} onClick={() => setTab("concept")}>&#128218; {t("tabConcept")}</button>
        <button className={`tab ${tab === "status" ? "active" : ""}`} onClick={() => setTab("status")}>&#128202; {t("tabStatus")}</button>
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

                <button className="generate-btn" disabled={slots.length === 0 || loading}
                  onClick={handleGenerateProblem}>
                  {loading ? t("btnGenerating") : t("btnGenerate")} ({slots.length}{locale === "ja" ? "個" : ""})
                </button>

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
        </div>

        {/* Right: Graph */}
        <div className="graph-panel">
          <div className="graph-label">{t("graphLabel")}</div>
          <div className="graph-box">
            <GraphSVG pos={pos} setPos={setPos} posRef={posRef} dragRef={dragRef}
              selected={selected} slots={slots} onNodeClick={onNodeClick} catFilter={catFilter} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
