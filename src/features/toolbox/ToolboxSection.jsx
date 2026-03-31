import React, { useState } from "react";
import { Plus, Box, Pencil, Trash2, ChevronDown, ChevronUp, ExternalLink, X } from "lucide-react";

export function ToolboxSection({ T, toolboxes, setToolboxes, showToast }) {
  const [showAddToolbox, setShowAddToolbox] = useState(false);
  const [editingToolbox, setEditingToolbox] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text, margin: 0 }}>Caixa de Ferramentas</h2>
          <p style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>Organize seus recursos e links por temas.</p>
        </div>
        <button onClick={() => setShowAddToolbox(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, border: "none", background: T.text, fontSize: 14, fontWeight: 600, color: T.surface, cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          <Plus size={18} /> Nova Caixa
        </button>
      </div>

      {toolboxes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", background: T.surface, border: `1px dashed ${T.border}`, borderRadius: 20 }}>
          <Box size={48} color={T.faint} style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: T.faint, margin: 0 }}>Nenhuma ferramenta cadastrada ainda.</p>
          <button onClick={() => setShowAddToolbox(true)} style={{ marginTop: 12, background: "none", border: "none", color: T.accent, fontWeight: 600, cursor: "pointer" }}>Criar minha primeira ferramenta</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {toolboxes.map(tb => (
            <ToolboxCard key={tb.id} toolbox={tb} T={T} 
              onEdit={t => setEditingToolbox(t)} 
              onDelete={id => { setToolboxes(prev => prev.filter(x => x.id !== id)); showToast("Caixa removida"); }} />
          ))}
        </div>
      )}

      {(editingToolbox || showAddToolbox) && (
        <AddToolboxModal 
          toolboxToEdit={editingToolbox} 
          T={T} 
          onClose={() => { setShowAddToolbox(false); setEditingToolbox(null); }} 
          onAdd={tb => {
            if (editingToolbox) {
              setToolboxes(prev => prev.map(x => x.id === tb.id ? tb : x));
              showToast("✓ Caixa atualizada");
            } else {
              setToolboxes(prev => [...prev, tb]);
              showToast("✓ Caixa de ferramentas criada");
            }
            setShowAddToolbox(false);
            setEditingToolbox(null);
          }} 
        />
      )}
    </div>
  );
}

function ToolboxCard({ toolbox, T, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.25rem", transition: "all .2s ease", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.border}` }}>
            <Box size={20} color={T.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.text }}>{toolbox.name}</h4>
            <p style={{ margin: 0, fontSize: 12, color: T.muted }}>{toolbox.categories.length} categorias • {toolbox.categories.reduce((acc, c) => acc + c.links.length, 0)} links</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(toolbox)} style={{ border: "none", background: "none", cursor: "pointer", color: T.faint, padding: 4 }}><Pencil size={14}/></button>
          <button onClick={() => onDelete(toolbox.id)} style={{ border: "none", background: "none", cursor: "pointer", color: T.faint, padding: 4 }}><Trash2 size={14}/></button>
          {expanded ? <ChevronUp size={16} color={T.faint}/> : <ChevronDown size={16} color={T.faint}/>}
        </div>
      </div>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8, paddingLeft: 8, borderLeft: `2px solid ${T.border}` }}>
          {toolbox.categories.map((cat, i) => (
            <div key={i}>
              <h5 style={{ margin: "0 0 8px 0", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em" }}>{cat.name}</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cat.links.map((link, j) => (
                  <a key={j} href={link.url} target="_blank" rel="noreferrer" 
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: 13, background: T.bg, border: `1px solid ${T.border}`, padding: "6px 12px", borderRadius: 8, color: T.text, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.surface; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bg; }}
                  >
                    <ExternalLink size={12}/> {link.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddToolboxModal({ onClose, onAdd, toolboxToEdit, T }) {
  const [name, setName] = useState(toolboxToEdit?.name || "");
  const [categories, setCategories] = useState(toolboxToEdit?.categories || [{ name: "Geral", links: [{ name: "", url: "" }] }]);

  const addCategory = () => setCategories([...categories, { name: "", links: [{ name: "", url: "" }] }]);
  const addLink = (catIdx) => {
    const next = [...categories];
    next[catIdx].links.push({ name: "", url: "" });
    setCategories(next);
  };

  const updateCatName = (idx, val) => {
    const next = [...categories];
    next[idx].name = val;
    setCategories(next);
  };

  const updateLink = (catIdx, linkIdx, field, val) => {
    const next = [...categories];
    next[catIdx].links[linkIdx][field] = val;
    setCategories(next);
  };

  const removeLink = (catIdx, linkIdx) => {
    const next = [...categories];
    next[catIdx].links.splice(linkIdx, 1);
    setCategories(next);
  };

  const handleSave = () => {
    onAdd({
      id: toolboxToEdit?.id || "tb_" + Date.now(),
      name,
      categories: categories.map(c => ({
        ...c,
        links: c.links.filter(l => l.name && l.url)
      })).filter(c => c.name && c.links.length > 0)
    });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", maxHeight: "90vh", boxShadow: "0 12px 48px rgba(0,0,0,.18)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>{toolboxToEdit ? "Editar Caixa de Ferramentas" : "Nova Caixa de Ferramentas"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X/></button>
        </div>
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Nome da Caixa (Ex: Feature English)</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Estudos, Trabalho, Lazer..." 
              style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "10px 14px", borderRadius: 10, color: T.text, outline: "none", fontSize: 14, boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {categories.map((cat, catIdx) => (
              <div key={catIdx} style={{ padding: 16, border: `1px solid ${T.border}`, borderRadius: 12, background: T.bg + "40" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", borderBottom: `1px solid ${T.border}`, paddingBottom: 10, marginBottom: 12 }}>
                  <input value={cat.name} onChange={e => updateCatName(catIdx, e.target.value)} placeholder="Nome da Categoria (Ex: Vocabulário)" 
                    style={{ flex: 1, background: "none", border: "none", fontSize: 13, fontWeight: 700, color: T.text, outline: "none" }} />
                  {categories.length > 1 && (
                    <button onClick={() => { const n = [...categories]; n.splice(catIdx,1); setCategories(n); }} 
                      style={{ background: "none", border: "none", cursor: "pointer", color: T.coral, fontSize: 11, fontWeight: 600 }}>Remover</button>
                  )}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cat.links.map((link, linkIdx) => (
                    <div key={linkIdx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input value={link.name} onChange={e => updateLink(catIdx, linkIdx, "name", e.target.value)} placeholder="Título" 
                        style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, padding: "8px 10px", borderRadius: 8, fontSize: 12, color: T.text, boxSizing: "border-box" }} />
                      <input value={link.url} onChange={e => updateLink(catIdx, linkIdx, "url", e.target.value)} placeholder="URL (https://...)" 
                        style={{ flex: 2, background: T.surface, border: `1px solid ${T.border}`, padding: "8px 10px", borderRadius: 8, fontSize: 12, color: T.text, boxSizing: "border-box" }} />
                      <button onClick={() => removeLink(catIdx, linkIdx)} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint }}><Trash2 size={15}/></button>
                    </div>
                  ))}
                  <button onClick={() => addLink(catIdx)} 
                    style={{ background: "none", border: `1px dashed ${T.border}`, padding: "8px", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: T.muted, cursor: "pointer", marginTop: 4 }}>
                    <Plus size={14}/> Adicionar Link
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addCategory} 
              style={{ padding: "12px", borderRadius: 12, border: `1px solid ${T.accent}30`, background: T.accent + "05", color: T.accent, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Plus size={16}/> Nova Categoria
            </button>
          </div>
        </div>
        <div style={{ padding: "1.25rem 1.5rem", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancelar</button>
          <button onClick={handleSave} disabled={!name} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: T.text, color: T.surface, fontWeight: 600, fontSize: 14, cursor: name ? "pointer" : "default", opacity: name ? 1 : 0.5 }}>Salvar Caixa</button>
        </div>
      </div>
    </div>
  );
}
