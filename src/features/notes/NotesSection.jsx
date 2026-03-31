import React, { useState, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export function NotesSection({ T, notes, setNotes, showToast }) {
  const [showNote, setShowNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const saveNote = (text) => {
    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, text } : n));
      setEditingNote(null);
      showToast("✓ Nota atualizada");
    } else {
      setNotes(prev => [{ 
        id: Date.now(), 
        text, 
        date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) 
      }, ...prev]);
      showToast("✓ Nota salva");
    }
    setShowNote(false);
  };

  const deleteNote = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta nota?")) {
      setNotes(prev => prev.filter(n => n.id !== id));
      showToast("Nota removida");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text }}>Notas</h2>
        <button onClick={() => setShowNote(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}
        >
          <Plus size={16} /> Nova Nota
        </button>
      </div>

      {notes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <p style={{ fontSize: 16, color: T.faint, marginBottom: 20 }}>Nenhuma nota salva ainda</p>
          <button onClick={() => setShowNote(true)} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${T.border}`, background: "none", fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}>Criar Primeira Nota</button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(n => (
            <div key={n.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.4rem", position: "relative", transition: "border-color .1s, boxShadow .1s" }}>
              <p style={{ fontSize: 14, color: T.text, lineHeight: 1.6, marginBottom: "1rem", whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 80 }}>{n.text}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 11, color: T.faint }}>{n.date}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setEditingNote(n); setShowNote(true); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 0 }}><Pencil size={12} /> editar</button>
                  <button onClick={() => deleteNote(n.id)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 0 }}><Trash2 size={12} /> apagar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNote && (
        <NoteModal 
          onClose={() => { setShowNote(false); setEditingNote(null); }} 
          onSave={saveNote} 
          T={T} 
          editingNote={editingNote} 
        />
      )}
    </div>
  );
}

function NoteModal({ onClose, onSave, T, editingNote = null }) {
  const [text, setText] = useState(editingNote?.text || "");
  const ta = useRef(null);
  
  useEffect(() => { 
    ta.current?.focus(); 
  }, []);

  function handleKey(e) {
    if (e.key === "Escape") onClose();
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { 
      if (text.trim()) onSave(text.trim()); 
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".75rem" }}>{editingNote ? "Editar nota" : "Nova nota"}</p>
        <textarea
          ref={ta}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escreva aqui…"
          style={{ width: "100%", minHeight: 120, border: "none", outline: "none", resize: "none", fontSize: 15, fontFamily: "inherit", color: T.text, background: T.bg, lineHeight: 1.6, caretColor: T.text, padding: "8px 0" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: ".75rem", borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, color: T.faint }}>⌘ + Enter para salvar · Esc para fechar</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { if (text.trim()) onSave(text.trim()); }} disabled={!text.trim()} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: text.trim() ? T.text : T.border, color: text.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: text.trim() ? "pointer" : "default" }}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
