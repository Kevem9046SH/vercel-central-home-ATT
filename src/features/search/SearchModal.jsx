import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronUp, BookOpen, Briefcase, Hexagon, Box } from "lucide-react";

export function SearchModal({ T, data, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const res = [];
    
    data.notes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        res.push({ type: "Nota", label: n.title, id: n.id, section: "notes" });
      }
    });
    
    data.projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        res.push({ type: "Projeto", label: p.name, id: p.id, section: "projects" });
      }
    });
    
    data.pillars.forEach(p => {
      if (p.label.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q)) {
        res.push({ type: "Pilar", label: p.label, id: p.id, section: "home" });
      }
    });

    data.toolboxes.forEach(t => {
      if (t.name.toLowerCase().includes(q)) {
        res.push({ type: "Ferramenta", label: t.name, id: t.id, section: "toolbox" });
      }
    });

    return res.slice(0, 8);
  }, [query, data]);

  return (
    <div onClick={onClose} style={{ 
      position: "fixed", 
      inset: 0, 
      background: "rgba(0,0,0,.6)", 
      backdropFilter: "blur(4px)", 
      display: "flex", 
      alignItems: "flex-start", 
      justifyContent: "center", 
      zIndex: 200, 
      padding: "10vh 16px" 
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-slide-up" style={{ 
        background: T.surface, 
        borderRadius: 20, 
        border: `1px solid ${T.border}`, 
        width: "100%", 
        maxWidth: 600, 
        overflow: "hidden", 
        boxShadow: "0 20px 40px rgba(0,0,0,.2)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", padding: "1rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
          <Search size={20} color={T.muted} style={{ marginRight: 12 }} />
          <input 
            ref={inputRef}
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Buscar notas, projetos, pilares..." 
            style={{ 
              flex: 1, 
              background: "none", 
              border: "none", 
              color: T.text, 
              fontSize: 16, 
              outline: "none", 
              fontFamily: "inherit" 
            }} 
          />
          <div className="mobile-hide" style={{ padding: "4px 8px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 10, color: T.faint, fontWeight: 700 }}>ESC</div>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {results.length > 0 ? (
            results.map((r, idx) => (
              <div 
                key={idx} 
                onClick={() => onSelect(r)}
                style={{ 
                  padding: "12px 20px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  cursor: "pointer", 
                  borderBottom: idx === results.length - 1 ? "none" : `1px solid ${T.border}44` 
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.bg}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                   <div style={{ 
                     width: 32, 
                     height: 32, 
                     borderRadius: 8, 
                     background: T.surface, 
                     border: `1px solid ${T.border}`, 
                     display: "flex", 
                     alignItems: "center", 
                     justifyContent: "center", 
                     color: T.muted 
                   }}>
                      {r.type === "Nota" && <BookOpen size={16} />}
                      {r.type === "Projeto" && <Briefcase size={16} />}
                      {r.type === "Pilar" && <Hexagon size={16} />}
                      {r.type === "Ferramenta" && <Box size={16} />}
                   </div>
                   <div>
                     <p style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>{r.label}</p>
                     <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{r.type}</p>
                   </div>
                </div>
                <ChevronUp size={14} style={{ transform: "rotate(90deg)", color: T.faint }} />
              </div>
            ))
          ) : query ? (
            <div style={{ padding: "40px", textAlign: "center", color: T.muted }}>Nenhum resultado para "{query}"</div>
          ) : (
            <div style={{ padding: "20px", color: T.faint, fontSize: 12, textAlign: "center" }}>Digite algo para pesquisar em toda a Central...</div>
          )}
        </div>
        <div style={{ padding: "12px 20px", background: T.bg, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Dica: Use <span style={{ fontWeight: 700 }}>Ctrl + K</span> para abrir a busca de qualquer lugar.</p>
        </div>
      </div>
    </div>
  );
}
