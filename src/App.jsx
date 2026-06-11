import { useEffect, useMemo, useState } from "react";
import { loadPMData, areaLegend } from "./pmDataLoader";

const rowSections = [
  {
    key: "junior",
    title: "Junior PM",
    subtitle: "Core behaviors",
    startRow: 2
  },
  {
    key: "mid",
    title: "Mid-Level PM",
    subtitle: "Building expertise",
    startRow: 5
  },
  {
    key: "senior",
    title: "Senior PM",
    subtitle: "Strategic mastery",
    startRow: 8
  }
];

const lifecycleAbbrev = {
  discovery: "DISC",
  strategy: "STRAT",
  planning: "PLAN",
  execution: "EXEC",
  growth: "GROW",
  maturity: "MAT",
  all: "ALL"
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeArea, setActiveArea] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [aiFilter, setAiFilter] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setLoadError("");
        const elements = await loadPMData();
        setData(elements);
      } catch (err) {
        setLoadError(err.message || "Fehler beim Laden der CSV");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const isMatch = (item) => {
    if (activeArea && item.area !== activeArea) return false;
    if (activeLevel && item.level !== activeLevel) return false;
    if (aiFilter && !item.isAI) return false;
    return true;
  };

  const anyFilterActive = Boolean(activeArea || activeLevel || aiFilter);

  const positionedTiles = useMemo(() => {
    return data.map((item, idx) => {
      const gridRow = Number(item.row) + 1; // +1 because header row is row 1
      const gridColumn = Number(item.col) + 1; // +1 because label column is col 1
      const dimmed = anyFilterActive && !isMatch(item);
      const isAI = item.hierarchy === "ai" || item.type === "AI"

      return (
        <button
          key={item.id}
          type="button"
          className={`ptpm-tile ${item.area} ${item.isAI ? "ptpm-ai-skill" : ""} ${
            dimmed ? "ptpm-dimmed" : ""
          }`}
          style={{
            gridRow,
            gridColumn
          }}
          onClick={() => setSelectedItem(item)}
        >
          <span className="ptpm-tile-index">{idx + 1}</span>


        <span className={`ptpm-tile-badge ${isAI ? "ai" : ""}`}>
          {isAI ? "AI" : item.type?.startsWith("B") ? "B" : "T"}
        </span>


          <span className="ptpm-tile-symbol">{item.symbol}</span>
          <span className="ptpm-tile-name">{item.name}</span>

          <span className="ptpm-tile-footer">
            {lifecycleAbbrev[item.lifecycle] || "ALL"}
          </span>
        </button>
      );
    });
  }, [data, activeArea, activeLevel, aiFilter, anyFilterActive]);

  if (loading) {
    return (
      <div className="ptpm-app">
        <div className="ptpm-container">
          <header className="ptpm-hero">
            <h1>Periodic Table of Product Management</h1>
            <p className="ptpm-subtitle">CSV wird geladen ...</p>
          </header>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="ptpm-app">
        <div className="ptpm-container">
          <header className="ptpm-hero">
            <h1>Periodic Table of Product Management</h1>
            <p className="ptpm-subtitle">
              AI-Native Skills & Behaviors · Cross-Platform Chapter
            </p>
          </header>

          <div className="ptpm-error-box">
            <strong>Fehler beim Laden der CSV:</strong>
            <div className="ptpm-error-detail">{loadError}</div>
            <div className="ptpm-error-hint">
              Bitte prüfe, ob die Datei{" "}
              <code>public/periodic_table_structure.csv</code> existiert und die
              Spalten korrekt benannt sind.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ptpm-app">
      <div className="ptpm-container">
        <header className="ptpm-hero">
          <h1>Periodic Table of Product Management</h1>
          <p className="ptpm-subtitle">
            Skills & Behaviors <br></br> Regulatory Compliance Platform · Product Management Chapter
          </p>
        </header>

        {/* Legend */}
        <div className="ptpm-legend-panel">
          <div className="ptpm-legend-block">
            <div className="ptpm-legend-title">Functional Areas</div>

            <div className="ptpm-legend-list">
              {areaLegend.map((area) => (
                <button
                  key={area.key}
                  type="button"
                  className={`ptpm-legend-item ${
                    activeArea === area.key ? "active" : ""
                  }`}
                  onClick={() =>
                    setActiveArea(activeArea === area.key ? null : area.key)
                  }
                >
                  <span className={`ptpm-legend-swatch ${area.key}`}></span>
                  <span>{area.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ptpm-legend-block ptpm-ai-legend-block">
            <div className="ptpm-legend-title">AI Skills</div>
            <div className="ptpm-ai-row">
              <span className="ptpm-ai-badge">AI</span>
              <span>AI-specific skill (glowing border)</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ptpm-filter-row">
          <button
            type="button"
            className={`ptpm-filter-btn ptpm-filter-ai ${aiFilter ? "active" : ""}`}
            onClick={() => setAiFilter(!aiFilter)}
          >
            ⚡ AI Skills
          </button>

          <span className="ptpm-filter-divider">|</span>

          <button
            type="button"
            className={`ptpm-filter-btn ${
              activeLevel === "junior" ? "active" : ""
            }`}
            onClick={() =>
              setActiveLevel(activeLevel === "junior" ? null : "junior")
            }
          >
            Junior PM
          </button>

          <button
            type="button"
            className={`ptpm-filter-btn ${activeLevel === "mid" ? "active" : ""}`}
            onClick={() =>
              setActiveLevel(activeLevel === "mid" ? null : "mid")
            }
          >
            Mid-Level PM
          </button>

          <button
            type="button"
            className={`ptpm-filter-btn ${
              activeLevel === "senior" ? "active" : ""
            }`}
            onClick={() =>
              setActiveLevel(activeLevel === "senior" ? null : "senior")
            }
          >
            Senior PM
          </button>
        </div>

        {/* Stable table grid */}
        <div className="ptpm-table-wrap">
          <div className="ptpm-table-grid">
            {/* corner spacer */}
            <div className="ptpm-corner-spacer" />

            {/* column headers */}
            {areaLegend.map((area, idx) => (
              <div
                key={`header-${area.key}`}
                className={`ptpm-column-header ${area.key}`}
                style={{
                  gridRow: 1,
                  gridColumn: `${2 + idx * 2} / span 2`
                }}
              >
                {area.label.toUpperCase()}
              </div>
            ))}

            {/* row background bands */}
            {rowSections.map((section) => (
              <div
                key={`band-${section.key}`}
                className={`ptpm-row-band ${section.key}`}
                style={{
                  gridColumn: "2 / 18",
                  gridRow: `${section.startRow} / span 3`
                }}
              />
            ))}

            {/* row header cards */}
            {rowSections.map((section) => (
              <div
                key={section.key}
                className={`ptpm-row-header-card ${section.key}`}
                style={{
                  gridColumn: 1,
                  gridRow: `${section.startRow} / span 3`
                }}
              >
                <div className="ptpm-row-header-card-inner">
                  <div className="ptpm-row-header-title-vertical">{section.title}</div>
                  <div className="ptpm-row-header-subtitle-vertical">
                    {section.subtitle}
                  </div>
                </div>
              </div>
            ))}

            {/* tiles */}
            {positionedTiles}
          
          </div>
        </div>

        <div className="ptpm-reading-guide">
          <strong>How to read:</strong> Rows progress from Junior PM to Senior PM.
          Cells with a glowing cyan border are AI-specific skills. Click any cell for details.
        </div>

        {/* Modal */}
        {selectedItem && (
          <div
            className="ptpm-modal-overlay active"
            onClick={() => setSelectedItem(null)}
          >
            <div className="ptpm-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="ptpm-modal-close"
                type="button"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>

              <div className="ptpm-modal-header">
                <div className="ptpm-modal-symbol">{selectedItem.symbol}</div>

                <div className="ptpm-modal-title-area">
                  <h2>{selectedItem.name}</h2>

                  <div className="ptpm-modal-badges">
                    {selectedItem.level && (
                      <span className="ptpm-modal-badge ptpm-foundation">
                        {selectedItem.level}
                      </span>
                    )}

                    {selectedItem.isAI && (
                      <span className="ptpm-modal-badge ptpm-ai-badge-modal">
                        AI
                      </span>
                    )}

                    {selectedItem.skillType && (
                      <span className="ptpm-modal-badge ptpm-skilltype">
                        {selectedItem.skillType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ptpm-modal-category">{selectedItem.areaLabel}</div>
              <div className="ptpm-modal-description">
               {selectedItem.long_description || selectedItem.description || "No description available"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
  );
}