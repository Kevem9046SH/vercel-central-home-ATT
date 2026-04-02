import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Maximize2, Calendar, Share2, FolderPlus, UserPlus, Bell, Check, Trash2 as Trash, Edit2 } from "lucide-react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, serverTimestamp, getDocs, arrayUnion, or } from "firebase/firestore";
import { db, isConfigured } from "../../config/firebase";

export function NotesSection({ T, notes, setNotes, showToast, folders, setFolders, activeFolderId, setActiveFolderId, userProfile }) {
  const [showNote, setShowNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewNote, setViewNote] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingFolder, setSharingFolder] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [notifications, setNotifications] = useState([]); // Array of { id, senderName, folderName, code }

  const activeFolder = (folders && folders.find(f => f.id === activeFolderId)) || (folders && folders[0]) || { name: "Geral", id: "f_general" };
  const filteredNotes = notes ? notes.filter(n => n.folderId === (activeFolder?.id || activeFolderId)) : [];

  // Sincronização em tempo real com o Firestore (Pastas)
  useEffect(() => {
    if (!isConfigured || !userProfile?.sub) return;

    // Escutar pastas do usuário e pastas compartilhadas
    const qFolders = query(
      collection(db, "folders"), 
      or(
        where("ownerId", "==", userProfile.sub),
        where("allowedUsers", "array-contains", userProfile.sub)
      )
    );
    
    const unsubFolders = onSnapshot(qFolders, (snapshot) => {
      const fbFolders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (fbFolders.length === 0) {
        setFolders([{ id: "f_general", name: "Geral", icon: "Folder", color: "teal", ownerId: userProfile.sub }]);
      } else {
        setFolders(fbFolders);
      }
    });

    return () => unsubFolders();
  }, [userProfile?.sub]);

  // Sincronização em tempo real com o Firestore (Notas da Pasta Ativa)
  useEffect(() => {
    if (!isConfigured || !userProfile?.sub) return;
    
    const targetFolderId = activeFolder?.id || activeFolderId || "f_general";
    const qNotes = query(collection(db, "notes"), where("folderId", "==", targetFolderId));
    
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      const activeFbNotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotes(prev => {
        const otherNotes = prev.filter(n => n.folderId !== targetFolderId);
        return [...otherNotes, ...activeFbNotes];
      });
    });

    return () => unsubNotes();
  }, [userProfile?.sub, activeFolder?.id, activeFolderId]);

  // Escutar notificações (convites onde alguém inseriu nosso código ou requests)
  useEffect(() => {
    if (!isConfigured || !userProfile?.sub) return;
    const qInvites = query(collection(db, "invites"), where("targetUserId", "==", userProfile.sub), where("status", "==", "pending"));
    const unsubInvites = onSnapshot(qInvites, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubInvites();
  }, [userProfile?.sub]);

  const saveNote = async (text) => {
    const isOnline = isConfigured && userProfile?.sub;
    
    if (editingNote) {
      if (isOnline && !editingNote.id.toString().startsWith("temp_")) {
        await updateDoc(doc(db, "notes", editingNote.id), { text });
      } else {
        setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, text } : n));
      }
      setEditingNote(null);
      showToast("✓ Nota atualizada");
    } else {
      const newNote = {
        text,
        folderId: activeFolderId,
        date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
        ownerId: userProfile?.sub || "local",
        createdAt: serverTimestamp()
      };
      
      if (isOnline) {
        await addDoc(collection(db, "notes"), newNote);
      } else {
        setNotes(prev => [{ id: "temp_" + Date.now(), ...newNote }, ...prev]);
      }
      showToast("✓ Nota salva");
    }
    setShowNote(false);
  };

  const deleteNote = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta nota?")) {
      const isOnline = isConfigured && userProfile?.sub && !id.toString().startsWith("temp_");
      if (isOnline) {
        await deleteDoc(doc(db, "notes", id));
      } else {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
      showToast("Nota removida");
      if (viewNote?.id === id) setViewNote(null);
    }
  };

  const createFolder = async () => {
    if (!folderName.trim()) return;
    const newFolder = {
      name: folderName.trim(),
      ownerId: userProfile?.sub || "local",
      shared: false
    };
    
    if (isConfigured && userProfile?.sub) {
      await addDoc(collection(db, "folders"), newFolder);
    } else {
      setFolders([...folders, { id: "f_" + Date.now(), ...newFolder }]);
    }
    
    setFolderName("");
    setShowFolderModal(false);
    showToast("✓ Pasta criada");
  };

  const generateCode = async (folder) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setShareCode(code);
    setSharingFolder(folder);
    setShowShareModal(true);
    
    if (isConfigured && userProfile?.sub) {
      await addDoc(collection(db, "invites"), {
        code,
        folderId: folder.id,
        folderName: folder.name,
        senderName: userProfile.name || "Usuário",
        senderId: userProfile.sub,
        createdAt: serverTimestamp(),
        status: "active"
      });
    }
  };

  const handleJoin = async () => {
    if (inputCode.length !== 6) return;
    
    // Buscar se existe convite com esse código
    const invitesRef = collection(db, "invites");
    const q = query(invitesRef, where("code", "==", inputCode), where("status", "==", "active"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      showToast("⚠️ Código inválido ou expirado.");
      return;
    }
    
    const inviteDoc = snapshot.docs[0];
    const inviteData = inviteDoc.data();
    
    if (inviteData.senderId === userProfile.sub) {
      showToast("⚠️ Você não pode usar seu próprio código.");
      return;
    }

    showToast("✓ Código enviado! Aguardando o dono aceitar...");
    setShowJoinModal(false);
    setInputCode("");
    
    // Atualizar o convite para pendente, notificando o dono
    await updateDoc(doc(db, "invites", inviteDoc.id), {
      status: "pending",
      targetUserId: inviteData.senderId, // O dono recebe a notificação
      requesterId: userProfile.sub,
      requesterName: userProfile.given_name || userProfile.name || "Usuário"
    });
  };

  const acceptShare = async (notif) => {
    // Ao aceitar, atualizamos a pasta para incluir o ID deste usuário
    if (isConfigured && userProfile?.sub) {
      await updateDoc(doc(db, "folders", notif.folderId), {
        shared: true,
        allowedUsers: arrayUnion(notif.requesterId)
      });
      await updateDoc(doc(db, "invites", notif.id), { status: "accepted" });
    }
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    showToast(`✓ Acesso concedido a ${notif.requesterName || "usuário"}!`);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", minHeight: "60vh" }}>
      {/* Sidebar de Pastas */}
      <div style={{ borderRight: `1px solid ${T.border}`, paddingRight: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", margin: 0 }}>Pastas</h3>
          <button onClick={() => setShowFolderModal(true)} style={{ border: "none", background: "none", cursor: "pointer", color: T.accent, display: "flex", padding: 4 }} title="Nova Pasta">
            <FolderPlus size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {folders.map(f => (
            <div 
              key={f.id} 
              onClick={() => setActiveFolderId(f.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "10px 14px", 
                borderRadius: 12, 
                background: activeFolderId === f.id ? T.bg : "none", 
                color: activeFolderId === f.id ? T.text : T.muted,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeFolderId === f.id ? 600 : 500,
                transition: "all .2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                <Maximize2 size={16} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
              </div>
              {f.ownerId === (userProfile?.sub || "local") && f.id !== "f_general" && (
                <button onClick={(e) => { e.stopPropagation(); generateCode(f); }} style={{ border: "none", background: "none", cursor: "pointer", color: T.faint, display: "flex", padding: 4 }} title="Compartilhar">
                  <Share2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={() => setShowJoinModal(true)}
          style={{ width: "100%", marginTop: "1rem", display: "flex", alignItems: "center", gap: 8, padding: "10px", borderRadius: 10, border: `1px dashed ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer", fontWeight: 600 }}
        >
          <UserPlus size={16} /> Entrar em Pasta
        </button>

        {/* Notificações de Compartilhamento */}
        {notifications.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Bell size={12} /> Notificações
            </h4>
            {notifications.map(n => (
              <div key={n.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px", marginBottom: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: 12, color: T.text, lineHeight: 1.4 }}>
                  <b>{n.senderName}</b> quer compartilhar a pasta <b>{n.folderName}</b> com você.
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => acceptShare(n)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "none", background: T.text, color: T.surface, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Aceitar</button>
                  <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} style={{ flex: 1, padding: "6px", borderRadius: 6, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Recusar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo da Pasta */}
      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text, margin: 0 }}>{activeFolder.name}</h2>
            <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{filteredNotes.length} notas nesta pasta</p>
          </div>
          <button onClick={() => setShowNote(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "none", background: T.text, fontSize: 14, fontWeight: 600, color: T.surface, cursor: "pointer", transition: "all .2s" }}
          >
            <Plus size={16} /> Nova Nota
          </button>
        </div>

        {filteredNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: T.surface, border: `1px dashed ${T.border}`, borderRadius: 20 }}>
            <p style={{ fontSize: 16, color: T.faint, marginBottom: 20 }}>Nenhuma nota nesta pasta.</p>
            <button onClick={() => setShowNote(true)} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${T.text}`, background: "none", fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer" }}>Criar Nota</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {filteredNotes.map(n => (
              <div 
                key={n.id} 
                onClick={() => setViewNote(n)}
                style={{ 
                  aspectRatio: "1/1",
                  background: T.surface, 
                  border: `1px solid ${T.border}`, 
                  borderRadius: 20, 
                  padding: "1.5rem", 
                  position: "relative", 
                  cursor: "pointer",
                  transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = T.borderMid;
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
                }}
              >
                <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", wordBreak: "break-word" }}>
                  {n.text}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: ".75rem", borderTop: `1px solid ${T.border}44` }}>
                  <span style={{ fontSize: 10, color: T.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{n.date.split(',')[0]}</span>
                  <Maximize2 size={14} color={T.faint} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais Antigos e Novos */}
      {showNote && <NoteModal onClose={() => { setShowNote(false); setEditingNote(null); }} onSave={saveNote} T={T} editingNote={editingNote} />}
      {viewNote && <NoteViewModal note={viewNote} onClose={() => setViewNote(null)} onEdit={(n) => { setViewNote(null); setEditingNote(n); setShowNote(true); }} onDelete={(id) => deleteNote(id)} T={T} />}

      {/* Modal Nova Pasta */}
      {showFolderModal && (
        <div onClick={() => setShowFolderModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 400, boxShadow: "0 20px 40px rgba(0,0,0,.2)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: T.text }}>Nova Pasta</h3>
            <input autoFocus value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Nome da pasta"
              style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, marginBottom: "1.5rem", fontSize: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowFolderModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", color: T.muted, cursor: "pointer" }}>Cancelar</button>
              <button onClick={createFolder} disabled={!folderName.trim()} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: T.text, color: T.surface, cursor: "pointer", opacity: folderName.trim() ? 1 : 0.5 }}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Compartilhar */}
      {showShareModal && (
        <div onClick={() => setShowShareModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 24, padding: "2.5rem", width: "100%", maxWidth: 450, textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,.25)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.tealBg, color: T.teal, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <Share2 size={32} />
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: T.text }}>Compartilhar Pasta</h3>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: "2rem" }}>Envie este código para seu amigo para ele acessar a pasta <b>{sharingFolder?.name}</b></p>
            
            <div style={{ background: T.bg, padding: "1.5rem", borderRadius: 16, border: `2px dashed ${T.border}`, marginBottom: "2rem" }}>
              <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: ".2em", color: T.text, fontFamily: "monospace" }}>{shareCode}</span>
            </div>

            <button onClick={() => setShowShareModal(false)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: T.text, color: T.surface, fontWeight: 600, cursor: "pointer" }}>Pronto</button>
          </div>
        </div>
      )}

      {/* Modal Entrar em Pasta */}
      {showJoinModal && (
        <div onClick={() => setShowJoinModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 400, boxShadow: "0 20px 40px rgba(0,0,0,.2)" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: T.text }}>Entrar em Pasta</h3>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: "1.5rem" }}>Insira o código de 6 dígitos que seu amigo enviou.</p>
            <input 
              autoFocus 
              maxLength={6}
              value={inputCode} 
              onChange={e => setInputCode(e.target.value.replace(/\D/g, ""))} 
              placeholder="000000"
              style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "14px", borderRadius: 12, color: T.text, marginBottom: "1.5rem", fontSize: 24, textAlign: "center", letterSpacing: ".5em", fontWeight: 700 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowJoinModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", color: T.muted, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleJoin} disabled={inputCode.length !== 6} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: T.text, color: T.surface, cursor: "pointer", opacity: inputCode.length === 6 ? 1 : 0.5 }}>Entrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteModal({ onClose, onSave, T, editingNote = null }) {
  const [text, setText] = useState(editingNote?.text || "");
  const ta = useRef(null);
  
  useEffect(() => { ta.current?.focus(); }, []);

  function handleKey(e) {
    if (e.key === "Escape") onClose();
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { 
      if (text.trim()) onSave(text.trim()); 
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, padding: "2rem", width: "100%", maxWidth: 550, boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>{editingNote ? "Editar nota" : "Nova nota"}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint }}><X size={20}/></button>
        </div>
        <textarea
          ref={ta}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Comece a escrever aqui…"
          style={{ width: "100%", minHeight: 250, border: "none", outline: "none", resize: "none", fontSize: 16, fontFamily: "inherit", color: T.text, background: "none", lineHeight: 1.7, caretColor: T.text }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, color: T.faint }}>⌘ + Enter para salvar</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", fontSize: 14, color: T.muted, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => { if (text.trim()) onSave(text.trim()); }} disabled={!text.trim()} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: T.text, color: T.surface, fontSize: 14, fontWeight: 600, cursor: text.trim() ? "pointer" : "default", opacity: text.trim() ? 1 : 0.5 }}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteViewModal({ note, onClose, onEdit, onDelete, T }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 145, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`, padding: "2.5rem", width: "100%", maxWidth: 700, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 30px 90px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.faint, fontSize: 12, fontWeight: 600 }}>
            <Calendar size={14} /> {note.date}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => onEdit(note)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><Edit2 size={16}/> Editar</button>
            <button onClick={() => onDelete(note.id)} style={{ background: "none", border: "none", color: T.coral, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><Trash size={16}/> Excluir</button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, marginLeft: 8 }}><X size={24}/></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", fontSize: 17, color: T.text, lineHeight: 1.8, whiteSpace: "pre-wrap", paddingBottom: "1rem" }}>
          {note.text}
        </div>
      </div>
    </div>
  );
}
