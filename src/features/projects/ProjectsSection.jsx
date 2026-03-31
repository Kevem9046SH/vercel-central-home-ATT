import React, { useState } from "react";
import { Plus, Archive, Pencil, Trash2, X } from "lucide-react";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { renderIcon } from "../../constants/icons";

export function ProjectsSection({ T, projects, setProjects, showToast }) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showArchivedProjects, setShowArchivedProjects] = useState(false);

  const toggleProjectArchive = (id) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, archived: !p.archived } : p));
    showToast("✓ Status do projeto alterado");
  };

  const deleteProject = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast("Projeto removido");
    }
  };

  const addProject = (p) => {
    setProjects(prev => [...prev, p]);
    setShowAddProject(false);
    showToast("✓ Projeto criado");
  };

  const updateProject = (id, updated) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    setEditingProject(null);
    showToast("✓ Projeto atualizado");
  };

  const updateProgress = (id, value) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, progress: value } : p));
  };

  const filteredProjects = projects.filter(p => !!p.archived === showArchivedProjects);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text, marginBottom: 4 }}>Meus Projetos</h2>
          <button 
            onClick={() => setShowArchivedProjects(!showArchivedProjects)}
            style={{ background: "none", border: "none", color: T.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Archive size={12} /> {showArchivedProjects ? "Ver Ativos" : "Ver Arquivados"}
          </button>
        </div>
        <button onClick={() => setShowAddProject(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}
        >
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <p style={{ fontSize: 16, color: T.faint }}>Nenhum projeto {showArchivedProjects ? "arquivado" : "ativo"}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(p => (
            <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.5rem", transition: "border-color .1s, boxShadow .1s", opacity: p.archived ? 0.7 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: T[p.iconBg] || p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: T[p.iconColor] || p.iconColor, flexShrink: 0 }}>
                  {renderIcon(p.icon, 22)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 4 }}>{p.name}</p>
                  <p style={{ fontSize: 13, color: T.muted }}>{p.desc}</p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => toggleProjectArchive(p.id)} title={p.archived ? "Desarquivar" : "Arquivar"} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4 }}><Archive size={14} /></button>
                  <button onClick={() => setEditingProject(p)} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4 }}><Pencil size={14} /></button>
                  <button onClick={() => deleteProject(p.id)} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Progresso</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T[p.progressColor] || p.progressColor }}>{p.progress}%</span>
                </div>
                <input type="range" min={0} max={100} value={p.progress} onChange={e => updateProgress(p.id, +e.target.value)} style={{ width: "100%", accentColor: T[p.progressColor] || p.progressColor, cursor: "pointer", height: 6, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddProject && <AddProjectModal onClose={() => setShowAddProject(false)} onAdd={addProject} T={T} />}
      {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={updateProject} T={T} />}
    </div>
  );
}

function AddProjectModal({ onClose, onAdd, T }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [progress, setProgress] = useState(0);
  const colorKeys = ["teal", "amber", "purple", "blue", "coral"];
  const bgKeys = ["tealBg", "amberBg", "purpleBg", "blueBg", "coralBg"];
  const icons = ["Hexagon", "Circle", "Square", "Triangle", "Folder", "Briefcase"];
  const [ci, setCi] = useState(0);

  function submit() {
    if (!name.trim()) return;
    onAdd({ 
      id: Date.now().toString(), 
      icon: icons[ci % icons.length], 
      iconBg: bgKeys[ci % bgKeys.length], 
      iconColor: colorKeys[ci % colorKeys.length], 
      name: name.trim(), 
      desc: desc.trim(), 
      progress, 
      progressColor: colorKeys[ci % colorKeys.length],
      archived: false
    });
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "1rem" }}>Novo projeto</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do projeto" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, color: T.text, background: T.bg, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição curta" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, color: T.text, background: T.bg, marginBottom: 12, outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: T.muted }}>Cor</span>
          {colorKeys.map((c, i) => (
            <div key={i} onClick={() => setCi(i)} style={{ width: 18, height: 18, borderRadius: "50%", background: T[c], cursor: "pointer", outline: ci === i ? `2px solid ${T[c]}` : "none", outlineOffset: 2 }} />
          ))}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: T.muted }}>Progresso</span>
            <span style={{ fontSize: 11, color: T.muted }}>{progress}%</span>
          </div>
          <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(+e.target.value)} style={{ width: "100%", accentColor: T[colorKeys[ci]], cursor: "pointer" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={submit} disabled={!name.trim()} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: name.trim() ? T.text : T.border, color: name.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: name.trim() ? "pointer" : "default" }}>Adicionar</button>
        </div>
      </div>
    </div>
  );
}

function EditProjectModal({ project, onClose, onSave, T }) {
  const [name, setName] = useState(project.name);
  const [desc, setDesc] = useState(project.desc);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "1rem" }}>Editar Projeto</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" style={{ width: "100%", padding: "8px", marginBottom: 8, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none" }} />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição" style={{ width: "100%", padding: "8px", marginBottom: 12, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => {onSave(project.id, {name: name.trim(), desc: desc.trim()}); onClose();}} disabled={!name.trim()} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: name.trim() ? T.text : T.border, color: name.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: name.trim() ? "pointer" : "default" }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
