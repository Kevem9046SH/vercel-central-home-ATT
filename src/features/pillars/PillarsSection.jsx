import React, { useState } from "react";
import { Plus, Pencil, Trash2, X, Hexagon, Circle, Square, Triangle, Folder, BookOpen, Heart, Briefcase, Home as HomeIcon } from "lucide-react";
import { Tag } from "../../components/ui/Tag";
import { renderIcon } from "../../constants/icons";

export function PillarsSection({ T, pillars, setPillars, showToast }) {
  const [showAddPillar, setShowAddPillar] = useState(false);
  const [editingPillar, setEditingPillar] = useState(null);
  const [openPillar, setOpenPillar] = useState(null);

  const addPillar = (p) => {
    setPillars(prev => [...prev, p]);
    setShowAddPillar(false);
    showToast("✓ Pilar criado");
  };

  const updatePillar = (id, updated) => {
    setPillars(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    setEditingPillar(null);
    showToast("✓ Pilar atualizado");
  };

  const deletePillar = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este pilar?")) {
      setPillars(prev => prev.filter(p => p.id !== id));
      showToast("Pilar removido");
    }
  };

  const updatePillarLinks = (id, links) => {
    setPillars(prev => prev.map(p => p.id === id ? { ...p, links } : p));
    if (openPillar?.id === id) {
      setOpenPillar(prev => ({ ...prev, links }));
    }
  };

  return (
    <div>
      <div className="pillars-grid" style={{ marginBottom: "2rem" }}>
        {pillars.map(p => (
          <div key={p.id} onClick={() => setOpenPillar(p)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.4rem", cursor: "pointer", transition: "all .2s", position: "relative", paddingRight: "3rem" }}
          >
            <span style={{ color: T[p.tagColor[0]] || p.tagColor[0], display: "block", marginBottom: 8 }}>{renderIcon(p.icon, 24)}</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{p.label}</p>
            <p style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>{p.sub}</p>
            <Tag label={p.tag} color={T[p.tagColor[0]] || p.tagColor[0]} bg={T[p.tagColor[1]] || p.tagColor[1]} />
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4 }}>
              <button onClick={e => { e.stopPropagation(); setEditingPillar(p); }} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4 }}><Pencil size={14} /></button>
            </div>
          </div>
        ))}
        <button onClick={() => setShowAddPillar(true)} 
          style={{ background: "none", border: `2px dashed ${T.border}`, borderRadius: 14, padding: "1.4rem", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: T.faint, transition: "all .2s" }}
        >
          <Plus size={24} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Novo Pilar</span>
        </button>
      </div>

      {showAddPillar && <AddPillarModal onClose={() => setShowAddPillar(false)} onAdd={addPillar} T={T} />}
      {editingPillar && <EditPillarModal pillar={editingPillar} onClose={() => setEditingPillar(null)} onSave={updatePillar} onDelete={deletePillar} T={T} />}
      {openPillar && <PillarDetail pillar={openPillar} onClose={() => setOpenPillar(null)} onUpdateLinks={updatePillarLinks} T={T} />}
    </div>
  );
}

function AddPillarModal({ onClose, onAdd, T }) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("Hexagon");
  const icons = ["Hexagon", "Circle", "Square", "Triangle", "Folder", "BookOpen", "Heart", "Briefcase", "Home"];
  
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "1rem" }}>Novo Pilar</p>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Nome do pilar" style={{ width: "100%", padding: "8px", marginBottom: 8, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none" }} />
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {icons.map(ic => <button key={ic} onClick={() => setIcon(ic)} style={{ padding: "8px 12px", borderRadius: 6, border: `2px solid ${icon === ic ? T.teal : T.border}`, background: T.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{renderIcon(ic, 18)}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => {onAdd({id: "p_" + Date.now(), icon, label, sub: "", tag: "Novo", tagColor: ["teal", "tealBg"], links: []}); onClose();}} disabled={!label.trim()} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: label.trim() ? T.text : T.border, color: label.trim() ? "#fff" : T.faint, fontSize: 13, fontWeight: 500, cursor: label.trim() ? "pointer" : "default" }}>Criar</button>
        </div>
      </div>
    </div>
  );
}

function EditPillarModal({ pillar, onClose, onSave, onDelete, T }) {
  const [label, setLabel] = useState(pillar.label);
  const [sub, setSub] = useState(pillar.sub || "");
  
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "1rem" }}>Editar Pilar</p>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Nome" style={{ width: "100%", padding: "8px", marginBottom: 8, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none" }} />
        <input value={sub} onChange={e => setSub(e.target.value)} placeholder="Descrição" style={{ width: "100%", padding: "8px", marginBottom: 12, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          <button onClick={() => {onDelete(pillar.id); onClose();}} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.coral}`, background: "none", fontSize: 13, color: T.coral, cursor: "pointer" }}>Remover</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => {onSave(pillar.id, {label: label.trim(), sub: sub.trim()}); onClose();}} disabled={!label.trim()} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: label.trim() ? T.text : T.border, color: label.trim() ? "#fff" : T.faint, fontSize: 13, fontWeight: 500, cursor: label.trim() ? "pointer" : "default" }}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PillarDetail({ pillar, onClose, onUpdateLinks, T }) {
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const links = pillar.links || [];
  const accentColor = T[pillar.tagColor[0]] || T.teal;

  function addLink() {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const url = newUrl.trim().startsWith("http") ? newUrl.trim() : "https://" + newUrl.trim();
    onUpdateLinks(pillar.id, [...links, { title: newTitle.trim(), url }]);
    setNewTitle(""); setNewUrl("");
  }

  function removeLink(i) { onUpdateLinks(pillar.id, links.filter((_, idx) => idx !== i)); }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: accentColor, display: "flex", alignItems: "center" }}>{renderIcon(pillar.icon, 24)}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{pillar.label}</span>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", color: T.faint, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, maxHeight: 220, overflowY: "auto" }}>
          {links.length === 0 && <p style={{ fontSize: 12, color: T.faint, textAlign: "center", padding: "1rem 0" }}>Nenhum link ainda. Adicione abaixo.</p>}
          {links.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg }}>
              <a href={l.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 13, color: accentColor, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>→ {l.title}</a>
              <button onClick={() => removeLink(i)} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <p style={{ fontSize: 10, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Adicionar Link</p>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título" style={{ width: "100%", padding: "7px 10px", marginBottom: 6, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box" }} />
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL (ex: https://...)" onKeyDown={e => e.key === "Enter" && addLink()} style={{ width: "100%", padding: "7px 10px", marginBottom: 10, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box" }} />
          <button onClick={addLink} disabled={!newTitle.trim() || !newUrl.trim()} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: (newTitle.trim() && newUrl.trim()) ? accentColor : T.border, color: "#fff", fontSize: 13, fontWeight: 600, cursor: (newTitle.trim() && newUrl.trim()) ? "pointer" : "default" }}>+ Adicionar</button>
        </div>
      </div>
    </div>
  );
}
