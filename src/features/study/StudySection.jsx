import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, Star, Calendar, AlertCircle, Save, X, ChevronUp, ChevronDown } from 'lucide-react';

export function StudySection({ T, subjects, setSubjects, metrics, setMetrics, showToast }) {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showMetricsEditor, setShowMetricsEditor] = useState(false);

  // Calculate score for a subject
  const calculateScore = (subject) => {
    let totals = 0;
    metrics.forEach(m => {
      const val = subject.scores[m.id];
      if (val === undefined || val === null) return;

      let score = 0;
      if (m.type === 'range') {
        // inversed = true means 1 is high priority (5pts), 5 is low (1pt)
        score = m.inversed ? (6 - val) : val;
      } else if (m.type === 'date-urgency') {
        // Date urgency (exam date): closer = higher priority
        const days = Math.ceil((new Date(val) - Date.now()) / (1000 * 60 * 60 * 24));
        score = Math.max(0, 15 - days); // Max 15 pts if exam is today/past
      } else if (m.type === 'date-delay') {
        // Date delay (last review): longer = higher priority
        const days = Math.ceil((Date.now() - new Date(val)) / (1000 * 60 * 60 * 24));
        score = Math.min(10, days / 2); // Max 10 pts
      }
      
      totals += (score * (m.weight || 1));
    });
    return Math.round(totals * 10) / 10;
  };

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => calculateScore(b) - calculateScore(a));
  }, [subjects, metrics]);

  const removeSubject = (id) => {
    if (window.confirm("Remover esta matéria?")) {
      setSubjects(prev => prev.filter(s => s.id !== id));
      showToast("Matéria removida");
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text, margin: 0 }}>Foco de Estudos</h2>
          <p style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>Ranking inteligente baseado no peso das suas necessidades.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowMetricsEditor(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 13, fontWeight: 600, color: T.muted, cursor: "pointer", transition: "all .2s" }}>
            Configurar Métricas
          </button>
          <button onClick={() => setShowAddSubject(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "none", background: T.text, fontSize: 13, fontWeight: 600, color: T.surface, cursor: "pointer", transition: "all .2s" }}>
            <Plus size={16} /> Nova Matéria
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", background: T.surface, border: `1px dashed ${T.border}`, borderRadius: 20 }}>
          <AlertCircle size={40} color={T.faint} style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: T.faint, margin: 0 }}>Nenhuma matéria cadastrada.</p>
          <button onClick={() => setShowAddSubject(true)} style={{ marginTop: 12, background: "none", border: "none", color: T.accent, fontWeight: 600, cursor: "pointer" }}>Adicionar primeira matéria</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedSubjects.map((s, idx) => {
            const score = calculateScore(s);
            const priorityColor = score > 15 ? T.coral : score > 10 ? T.amber : T.teal;
            const priorityBg = score > 15 ? T.coralBg : score > 10 ? T.amberBg : T.tealBg;

            return (
              <div key={s.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.25rem", display: "flex", alignItems: "center", gap: 20, transition: "all .2s" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: priorityBg, color: priorityColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>{s.name}</h4>
                  <div style={{ display: "flex", gap: 15, marginTop: 6 }}>
                    {metrics.map(m => {
                      const val = s.scores[m.id];
                      if (val === undefined || val === null) return null;
                      return (
                        <div key={m.id} style={{ fontSize: 11, color: T.muted, display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em" }}>{m.label.substring(0, 3)}:</span>
                          <span style={{ color: T.text }}>{m.type === 'range' ? val : new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ textAlign: "right", paddingRight: 20 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: T.faint, textTransform: "uppercase" }}>Prioridade</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: priorityColor }}>{score}</p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditingSubject(s)} style={{ padding: 8, borderRadius: 10, border: "none", background: T.bg, color: T.muted, cursor: "pointer" }}><Pencil size={14}/></button>
                  <button onClick={() => removeSubject(s.id)} style={{ padding: 8, borderRadius: 10, border: "none", background: T.bg, color: T.faint, cursor: "pointer" }}><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showAddSubject || editingSubject) && (
        <SubjectModal 
          T={T} 
          metrics={metrics}
          subject={editingSubject}
          onClose={() => { setShowAddSubject(false); setEditingSubject(null); }}
          onSave={(data) => {
            if (editingSubject) {
              setSubjects(prev => prev.map(x => x.id === editingSubject.id ? { ...editingSubject, ...data } : x));
            } else {
              setSubjects(prev => [...prev, { id: "s_" + Date.now(), ...data }]);
            }
            setShowAddSubject(false);
            setEditingSubject(null);
            showToast("✓ Salvo com sucesso");
          }}
        />
      )}

      {showMetricsEditor && (
        <MetricsModal 
          T={T}
          metrics={metrics}
          setMetrics={setMetrics}
          onClose={() => setShowMetricsEditor(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function SubjectModal({ T, metrics, subject, onClose, onSave }) {
  const [name, setName] = useState(subject?.name || "");
  const [scores, setScores] = useState(subject?.scores || {});

  const handleScoreChange = (metricId, val) => {
    setScores(prev => ({ ...prev, [metricId]: val }));
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 130, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, width: "100%", maxWidth: 450, padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: 22, color: T.text, fontWeight: 700 }}>{subject ? "Editar Matéria" : "Nova Matéria"}</h3>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Nome da Matéria</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Matemática Discreta" style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 12, color: T.text, fontSize: 16, boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {metrics.map(m => (
            <div key={m.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.label}</label>
                {m.type === 'range' && <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{scores[m.id] || 3} / 5</span>}
              </div>
              
              {m.type === 'range' ? (
                <input type="range" min={1} max={5} value={scores[m.id] || 3} onChange={e => handleScoreChange(m.id, parseInt(e.target.value))} 
                  style={{ width: "100%", accentColor: T.text, height: 6, cursor: "pointer" }} />
              ) : (
                <input type="date" value={scores[m.id] || ""} onChange={e => handleScoreChange(m.id, e.target.value)}
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "10px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box" }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => onSave({ name, scores })} disabled={!name} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: T.text, color: T.surface, fontSize: 15, fontWeight: 600, cursor: name ? "pointer" : "default", opacity: name ? 1 : 0.5 }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function MetricsModal({ T, metrics, setMetrics, onClose, showToast }) {
  const [localMetrics, setLocalMetrics] = useState([...metrics]);

  const addMetric = () => {
    const fresh = { id: "m_" + Date.now(), label: "Nova Métrica", type: "range", weight: 1, inversed: false, default: false };
    setLocalMetrics([...localMetrics, fresh]);
  };

  const updateMetric = (id, field, val) => {
    setLocalMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const removeMetric = (id) => {
    if (localMetrics.length <= 1) return alert("Mínimo de uma métrica necessária.");
    setLocalMetrics(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = () => {
    setMetrics(localMetrics);
    onClose();
    showToast("✓ Métricas atualizadas");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 140, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, width: "100%", maxWidth: 500, padding: "2rem", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: 22, color: T.text, fontWeight: 700 }}>Configurar Métricas</h3>
        <p style={{ fontSize: 14, color: T.muted, marginBottom: 20 }}>Defina como cada matéria será pesada no ranking.</p>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 10 }}>
          {localMetrics.map(m => (
            <div key={m.id} style={{ padding: "1rem", background: T.bg, borderRadius: 14, border: `1px solid ${T.border}`, position: "relative" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <input value={m.label} onChange={e => updateMetric(m.id, 'label', e.target.value)} placeholder="Nome (Ex: Urgência)" 
                  style={{ flex: 2, background: "none", border: "none", borderBottom: `1px solid ${T.borderMid}`, fontSize: 14, fontWeight: 600, color: T.text, outline: "none", padding: "4px 0" }} />
                <button onClick={() => removeMetric(m.id)} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer" }}><Trash2 size={16}/></button>
              </div>

              <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: T.faint, display: "block", marginBottom: 4, textTransform: "uppercase" }}>Tipo</label>
                  <select value={m.type} onChange={e => updateMetric(m.id, 'type', e.target.value)} disabled={m.default} 
                    style={{ width: "100%", background: "none", border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "6px", fontSize: 12, color: T.text }}>
                    <option value="range">Escala 1-5</option>
                    <option value="date-urgency">Data (Urgente)</option>
                    <option value="date-delay">Data (Atraso)</option>
                  </select>
                </div>
                <div style={{ width: 80 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: T.faint, display: "block", marginBottom: 4, textTransform: "uppercase" }}>Peso (x{m.weight})</label>
                  <input type="number" step="0.5" value={m.weight} onChange={e => updateMetric(m.id, 'weight', parseFloat(e.target.value))} 
                    style={{ width: "100%", background: "none", border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: "6px", fontSize: 12, color: T.text }} />
                </div>
                {m.type === 'range' && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.faint, display: "block", marginBottom: 4, textTransform: "uppercase" }}>Inverter</label>
                    <button onClick={() => updateMetric(m.id, 'inversed', !m.inversed)} 
                      style={{ width: "100%", background: m.inversed ? T.text : "none", border: `1px solid ${T.borderMid}`, padding: "6px", borderRadius: 8, color: m.inversed ? T.surface : T.text, fontSize: 11, cursor: "pointer" }}>
                      {m.inversed ? "Sim (1=Max)" : "Não (5=Max)"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <button onClick={addMetric} style={{ padding: "12px", borderRadius: 12, border: `1px dashed ${T.borderMid}`, background: "none", color: T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Plus size={16}/> Adicionar Métrica Personalizada
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: T.text, color: T.surface, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Salvar Tudo</button>
        </div>
      </div>
    </div>
  );
}
