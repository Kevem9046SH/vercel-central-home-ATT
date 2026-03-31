import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export function PeriodsSection({ T, periods, setPeriods, showToast }) {
  const [showAddPeriod, setShowAddPeriod] = useState(false);

  const addPeriod = (p) => {
    setPeriods(prev => [...prev, p]);
    setShowAddPeriod(false);
    showToast("✓ Período criado");
  };

  const deletePeriod = (id) => {
    if (window.confirm("Remover este período?")) {
      setPeriods(prev => prev.filter(p => p.id !== id));
      showToast("Período removido");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text, margin: 0 }}>Períodos de Foco</h2>
          <p style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>Rastreador de metas temporais e marcos de vida.</p>
        </div>
        <button onClick={() => setShowAddPeriod(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Plus size={16} /> Novo Período
        </button>
      </div>

      {periods.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <p style={{ fontSize: 16, color: T.faint }}>Nenhum período de foco cadastrado.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {periods.map(p => (
            <PeriodCard key={p.id} period={p} onDelete={deletePeriod} T={T} />
          ))}
        </div>
      )}

      {showAddPeriod && <AddPeriodModal onClose={() => setShowAddPeriod(false)} onAdd={addPeriod} T={T} />}
    </div>
  );
}

function PeriodCard({ period, onDelete, T }) {
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const now = new Date();
  
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const daysPassed = Math.max(0, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, Math.round((daysPassed / totalDays) * 100));

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.5rem", transition: "all .2s ease", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>{period.title}</h4>
          <p style={{ margin: 0, fontSize: 12, color: T.muted }}>{start.toLocaleDateString()} — {end.toLocaleDateString()}</p>
        </div>
        <button onClick={() => onDelete(period.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint }} onMouseEnter={e => e.currentTarget.style.color = T.coral} onMouseLeave={e => e.currentTarget.style.color = T.faint}>
          <Trash2 size={14}/>
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: T.text }}>{daysLeft} <small style={{ fontSize: 12, fontWeight: 500, color: T.muted }}>dias restantes</small></span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.teal }}>{progress}%</span>
        </div>
        <div style={{ height: 8, background: T.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: T.teal, transition: "width 1s ease-out" }}/>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 12, opacity: 0.6 }}>
        {Array.from({ length: Math.min(100, totalDays) }).map((_, i) => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: 1, background: i < daysPassed ? T.teal : T.border }} />
        ))}
        {totalDays > 100 && <span style={{ fontSize: 10, color: T.faint }}>...</span>}
      </div>
    </div>
  );
}

function AddPeriodModal({ onClose, onAdd, T }) {
  const [title, setTitle] = useState("");
  const [months, setMonths] = useState(3);
  
  const handleAdd = () => {
    const start = new Date();
    const end = new Date();
    if (months === "1w") end.setDate(end.getDate() + 7);
    else if (months === "2w") end.setDate(end.getDate() + 14);
    else end.setMonth(end.getMonth() + parseInt(months));
    
    onAdd({
      id: "p_" + Date.now(),
      title,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, width: "100%", maxWidth: 400, padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: 18, color: T.text, fontWeight: 700 }}>Novo Período</h3>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Título do Período</label>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Melhorar vocabulário em Inglês" 
            style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Duração</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[ {v: "1w", l: "1 Sem"}, {v: "2w", l: "2 Sem"}, {v: 1, l: "1 Mês"}, {v: 3, l: "3 Meses"}, {v: 6, l: "6 Meses"}, {v: 12, l: "1 Ano"} ].map(item => (
              <button key={item.v} onClick={() => setMonths(item.v)} style={{ padding: "8px", borderRadius: 8, border: `1px solid ${months === item.v ? T.text : T.border}`, background: months === item.v ? T.text : "none", color: months === item.v ? T.surface : T.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{item.l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={handleAdd} disabled={!title} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: T.text, color: T.surface, fontSize: 14, fontWeight: 600, cursor: title ? "pointer" : "default", opacity: title ? 1 : 0.5 }}>Criar Período</button>
        </div>
      </div>
    </div>
  );
}
