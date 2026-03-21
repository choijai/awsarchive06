import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { NODES, LINKS, CAT, CONCEPTS, AWSNode } from './data';
import './styles.css';

// Graph Component
function AWSGraphViz({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const posRef = useRef<Record<string, { x: number; y: number }>>({});
  const [, setUpdate] = useState(0);

  useEffect(() => {
    const W = 900, H = 520;

    // Initialize positions
    const centers: Record<string, { x: number; y: number }> = {
      compute: { x: 160, y: 140 },
      storage: { x: 760, y: 140 },
      database: { x: 760, y: 420 },
      network: { x: 460, y: 90 },
      security: { x: 160, y: 420 },
      messaging: { x: 460, y: 500 },
      monitor: { x: 80, y: 300 },
    };

    NODES.forEach((node, idx) => {
      const center = centers[node.cat];
      const angle = (idx / 5) * 2 * Math.PI;
      const r = 65;
      posRef.current[node.id] = {
        x: center.x + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: center.y + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
      };
    });

    let frame = 0;
    const animate = () => {
      frame++;
      if (frame > 200) return;

      const pos = posRef.current;

      NODES.forEach((node) => {
        const p = pos[node.id];
        let fx = 0, fy = 0;

        // Repulsion
        NODES.forEach((other) => {
          if (other.id === node.id) return;
          const op = pos[other.id];
          const dx = p.x - op.x;
          const dy = p.y - op.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = 5500 / (d * d);
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        });

        // Attraction via links
        LINKS.forEach((link) => {
          const other = link.s === node.id ? link.t : link.t === node.id ? link.s : null;
          if (!other) return;
          const op = pos[other];
          const dx = op.x - p.x;
          const dy = op.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - 150) * 0.03;
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        });

        // Centering
        fx += (W / 2 - p.x) * 0.005;
        fy += (H / 2 - p.y) * 0.005;

        p.x = Math.max(40, Math.min(W - 40, p.x + fx * 0.01));
        p.y = Math.max(40, Math.min(H - 40, p.y + fy * 0.01));
      });

      setUpdate((v) => v + 1);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const R = 28;

  return (
    <svg ref={svgRef} viewBox="0 0 900 520" className="graph-svg">
      <defs>
        <filter id="glow1">
          <feGaussianBlur stdDeviation="5" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background dots */}
      {Array.from({ length: 70 }, (_, i) => (
        <circle
          key={`dot-${i}`}
          cx={(i * 179 + 53) % 900}
          cy={(i * 113 + 41) % 520}
          r={i % 6 === 0 ? 1.3 : 0.5}
          fill="white"
          opacity={0.06 + (i % 4) * 0.03}
        />
      ))}

      {/* Links */}
      {LINKS.map((link, idx) => {
        const sp = posRef.current[link.s];
        const tp = posRef.current[link.t];
        if (!sp || !tp) return null;
        const isActive =
          selectedId === link.s || selectedId === link.t;
        return (
          <line
            key={`link-${idx}`}
            x1={sp.x}
            y1={sp.y}
            x2={tp.x}
            y2={tp.y}
            stroke={isActive ? '#ff9800' : '#444'}
            strokeWidth={isActive ? 3 : 1}
            opacity={isActive ? 0.8 : 0.2}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map((node) => {
        const p = posRef.current[node.id];
        if (!p) return null;
        const cat = CAT[node.cat];
        const isSelected = node.id === selectedId;

        return (
          <g key={node.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isSelected ? R + 8 : R}
              fill={cat.color}
              opacity={isSelected ? 1 : 0.8}
              filter={isSelected ? 'url(#glow1)' : undefined}
              onClick={() => onSelect(node.id)}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="node-label"
            >
              {node.emoji}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Main App
function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const selected = selectedId ? NODES.find((n) => n.id === selectedId) : null;
  const concept = selected ? CONCEPTS[selected.id] : null;

  const filtered = useMemo(() => {
    return NODES.filter((node) => {
      const matchSearch =
        node.name.toLowerCase().includes(search.toLowerCase()) ||
        node.desc.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || node.cat === catFilter;
      return matchSearch && matchCat;
    });
  }, [search, catFilter]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="header-title">🎓 AWS SSA 시험 준비</h1>
        <p className="header-subtitle">AWS 서비스 관계도 - 서비스를 클릭해서 상세 정보를 확인하세요</p>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Search */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="서비스 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <button
              className={`cat-btn ${!catFilter ? 'active' : ''}`}
              onClick={() => setCatFilter(null)}
            >
              전체
            </button>
            {Object.entries(CAT).map(([key, value]) => (
              <button
                key={key}
                className={`cat-btn ${catFilter === key ? 'active' : ''}`}
                style={{
                  backgroundColor:
                    catFilter === key ? value.color : 'transparent',
                  color: catFilter === key ? 'white' : value.color,
                  borderColor: value.color,
                }}
                onClick={() =>
                  setCatFilter(catFilter === key ? null : key)
                }
              >
                {value.label}
              </button>
            ))}
          </div>

          {/* Graph */}
          <div className="graph-container">
            <AWSGraphViz selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          {/* Node List */}
          <div className="node-list">
            {filtered.map((node) => (
              <div
                key={node.id}
                className={`node-item ${node.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(node.id)}
              >
                <div
                  className="node-color-bar"
                  style={{ backgroundColor: CAT[node.cat].color }}
                />
                <div className="node-content">
                  <div className="node-name">
                    {node.emoji} {node.name}
                  </div>
                  <div className="node-desc">{node.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Detail */}
        <div className="right-panel">
          {concept && selected ? (
            <div className="detail-content">
              <div className="detail-header">
                <div className="detail-emoji">{selected.emoji}</div>
                <h2 className="detail-title">{concept.title}</h2>
                <p className="detail-subtitle">{concept.subtitle}</p>
              </div>

              {/* Easy Explanation */}
              <section className="detail-section">
                <h3 className="section-title">💡 쉽게 이해하기</h3>
                <p className="easy-text">{concept.easy}</p>
              </section>

              {/* Key Points */}
              <section className="detail-section">
                <h3 className="section-title">🎯 핵심 포인트</h3>
                {concept.points.map((point: any, idx: number) => (
                  <div key={idx} className="point-container">
                    <h4 className="point-label">{point.label}</h4>
                    <p className="point-text">{point.text}</p>
                    <p className="point-easy">{point.easy}</p>
                  </div>
                ))}
              </section>

              {/* Related Services */}
              <section className="detail-section">
                <h3 className="section-title">🔗 연관 서비스</h3>
                <div className="related-services">
                  {LINKS.filter(
                    (l) => l.s === selected.id || l.t === selected.id
                  ).map((link) => {
                    const relatedId = link.s === selected.id ? link.t : link.s;
                    const related = NODES.find((n) => n.id === relatedId);
                    return (
                      <button
                        key={relatedId}
                        className="related-btn"
                        onClick={() => setSelectedId(relatedId)}
                      >
                        {related?.emoji} {related?.name}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : (
            <div className="empty-state">
              <p>서비스를 선택하면 상세 정보가 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mount App
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
