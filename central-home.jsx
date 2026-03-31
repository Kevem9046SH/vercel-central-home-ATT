import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Hexagon, Circle, Square, Triangle, Folder, BookOpen, Heart, Briefcase, Home as HomeIcon, Pencil, Trash2, Plus, X, Moon, Sun, Bell, Settings, RefreshCw, ExternalLink, AlertCircle, LogOut, User, Calendar, Zap, Box, ChevronUp, ChevronDown, Wallet, DollarSign, Target, ShoppingBag, PieChart, Bot, Download, Upload, Search, Archive } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from "@react-oauth/google";


const IconMap = {
  "◈": Hexagon,
  "◉": Circle,
  "◆": Square,
  "◇": Square,
  "●": Circle,
  "○": Circle,
  "■": Square,
  "□": Square,
  "▲": Triangle,
  "Hexagon": Hexagon,
  "Circle": Circle,
  "Square": Square,
  "Triangle": Triangle,
  "Folder": Folder,
  "BookOpen": BookOpen,
  "Heart": Heart,
  "Briefcase": Briefcase,
  "Home": HomeIcon
};

function renderIcon(name, size = 20) {
  const IconCmp = IconMap[name] || Circle;
  return <IconCmp size={size} strokeWidth={2.5} />;
}

/* ─── palette & tokens ─────────────────────────────────────────────────────── */
const LIGHT_THEME = {
  bg: "#F9F8F5",
  surface: "#FFFFFF",
  border: "#E8E6E0",
  borderMid: "#D4D1C9",
  text: "#1A1916",
  muted: "#7A776E",
  faint: "#B0ADA6",
  accent: "#1A1916",
  teal: "#0F6E56",
  tealBg: "#E1F5EE",
  amber: "#854F0B",
  amberBg: "#FAEEDA",
  blue: "#185FA5",
  blueBg: "#E6F1FB",
  purple: "#534AB7",
  purpleBg: "#EEEDFE",
  coral: "#993C1D",
  coralBg: "#FAECE7",
};

const DARK_THEME = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  border: "#2D2D2D",
  borderMid: "#3A3A3A",
  text: "#E5E5E5",
  muted: "#A0A0A0",
  faint: "#707070",
  accent: "#E5E5E5",
  teal: "#4DB8A8",
  tealBg: "#1B3A34",
  amber: "#E8B856",
  amberBg: "#3A2F1A",
  blue: "#5B9FD8",
  blueBg: "#1F2F42",
  purple: "#9B8FD8",
  purpleBg: "#2D2540",
  coral: "#E07856",
  coralBg: "#3A241E",
};

/* ─── data ─────────────────────────────────────────────────────────────────── */
const INITIAL_PILLARS = [
  { id: "p_finance", icon: "Hexagon", label: "Finanças", sub: "Gastos · metas · orçamento", tag: "3 itens", tagColor: ["amber", "amberBg"], links: [] },
  { id: "p_health", icon: "Circle", label: "Saúde", sub: "Exames · treinos · receitas", tag: "Atualizado", tagColor: ["teal", "tealBg"], links: [] },
  { id: "p_career", icon: "Square", label: "Carreira / Estudos", sub: "Portfólio · certificados · cursos", tag: "2 cursos ativos", tagColor: ["blue", "blueBg"], links: [] },
  { id: "p_home", icon: "Home", label: "Casa", sub: "Inventário · contratos · desejos", tag: "Revisar", tagColor: ["coral", "coralBg"], links: [] },
];

const INITIAL_PROJECTS = [
  { id: "p1", icon: "Hexagon", iconBg: "tealBg", iconColor: "teal", name: "Clima Curioso", desc: "Flutter · Spring Boot · PostgreSQL", progress: 65, progressColor: "teal" },
  { id: "p2", icon: "Square", iconBg: "amberBg", iconColor: "amber", name: "Formatura IFTO", desc: "Coordenação · cerimônia · logística", progress: 40, progressColor: "amber" },
  { id: "p3", icon: "Circle", iconBg: "purpleBg", iconColor: "purple", name: "Monitoria IFTO", desc: "Processo seletivo · documentação", progress: 25, progressColor: "purple" },
];

const INITIAL_QUICK_LINKS = [
  { id: "ql1", label: "Agenda", dot: "amber", url: "" },
  { id: "ql2", label: "Compras", dot: "teal", url: "" },
  { id: "ql3", label: "Hábitos", dot: "blue", url: "" },
  { id: "ql4", label: "Leitura", dot: "purple", url: "" },
];

const INITIAL_VAULT_ITEMS = [
  { id: "v1", label: "Manuais", url: "" },
  { id: "v2", label: "Senhas", url: "" },
  { id: "v3", label: "Artigos salvos", url: "" },
  { id: "v4", label: "Referências visuais", url: "" },
  { id: "v5", label: "Docs legais", url: "" },
];

const INITIAL_SCHEDULE = {
  timeSlots: [
    { start: "7:30", end: "8:15" },
    { start: "8:15", end: "9:00" },
    { start: "9:15", end: "10:00" },
    { start: "10:00", end: "10:45" },
    { start: "11:00", end: "11:45" },
    { start: "12:00", end: "12:45" },
    { start: "14:00", end: "14:45" },
    { start: "14:45", end: "15:30" },
    { start: "16:00", end: "16:45" },
    { start: "16:45", end: "17:30" },
  ],
  classes: {
    monday: [
      { slot: 0, subject: "Matemática", room: "BL15 sala 8", professor: "Claudio Monteiro" },
      { slot: 2, subject: "Língua Portuguesa", room: "BL15 sala 8", professor: "Debora Maria" },
      { slot: 4, subject: "Espanhol", room: "BL15 sala 8", professor: "Maria Rilda" },
      { slot: 6, subject: "Educação Física", room: "BL15 sala 8", professor: "Marcelo Pereira Goncalves" },
      { slot: 8, subject: "Programação para Banco de Dados", room: "BL15 sala 8", professor: "Ricardo Loureiro" },
    ],
    tuesday: [
      { slot: 0, subject: "Filosofia", room: "BL15 sala 8", professor: "Claudir Vivian" },
      { slot: 2, subject: "Química", room: "BL15 sala 8", professor: "Vanessa Oster" },
      { slot: 4, subject: "Aplicativos Web", room: "BL15 sala 8", professor: "Maria Rilda" },
      { slot: 6, subject: "Unidades Diversificadas (Eletivas)", room: "BL15 sala 8", professor: "" },
      { slot: 8, subject: "Unidades Diversificadas (Eletivas)", room: "BL15 sala 8", professor: "" },
    ],
    wednesday: [
      { slot: 0, subject: "História", room: "BL15 sala 8", professor: "Fabrício Barroso" },
      { slot: 2, subject: "Sociologia", room: "BL15 sala 8", professor: "Mayara Scarselli" },
      { slot: 4, subject: "Técnicas e Projetos de Sistemas", room: "BL15 sala 8", professor: "Liliane Felix" },
    ],
    thursday: [
      { slot: 4, subject: "Língua Portuguesa", room: "BL15 sala 8", professor: "Debora Maria" },
      { slot: 6, subject: "Projeto Integrador", room: "BL15 sala 8", professor: "" },
    ],
    friday: [
      { slot: 0, subject: "Geografia", room: "BL15 sala 8", professor: "Andreia Lucini" },
      { slot: 2, subject: "Física", room: "BL15 sala 8", professor: "Nádia Vilela Pereira" },
      { slot: 4, subject: "Programação Dinâmica para Web", room: "BL15 sala 8", professor: "Mario Kleber" },
    ],
    saturday: [],
  }
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function today() {
  return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

/* ─── micro components ────────────────────────────────────────────────────── */
function Tag({ label, color, bg }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 500, color, background: bg, padding: "2px 8px", borderRadius: 20, display: "inline-block", letterSpacing: ".02em" }}>
      {label}
    </span>
  );
}

function ProgressBar({ value, color, T }) {
  return (
    <div style={{ height: 2, background: T.border, borderRadius: 1, overflow: "hidden", marginTop: 5 }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 1, transition: "width .4s ease" }} />
    </div>
  );
}

function Divider({ T }) {
  return <div style={{ height: 1, background: T.border, margin: "1.75rem 0" }} />;
}

function SectionLabel({ children, T }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 500, color: T.faint, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
      {children}
    </p>
  );
}

/* ─── Toast Notification ─────────────────────────────────────────────────── */
function Toast({ msg, T }) {
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: T.text, color: T.bg, padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.25)", pointerEvents: "none", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

/* ─── Edit Link Modal (Quick Links & Vault) ──────────────────────────────── */
function EditLinkModal({ item, onClose, onSave, T }) {
  const [label, setLabel] = useState(item.label);
  const [url, setUrl] = useState(item.url || "");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 380, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "1rem" }}>Editar Link</p>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Nome" style={{ width: "100%", padding: "8px 10px", marginBottom: 8, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (ex: https://...)" onKeyDown={e => e.key === "Enter" && label.trim() && (onSave({ ...item, label: label.trim(), url: url.trim() }), onClose())} style={{ width: "100%", padding: "8px 10px", marginBottom: 14, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => { onSave({ ...item, label: label.trim(), url: url.trim() }); onClose(); }} disabled={!label.trim()} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: label.trim() ? T.text : T.border, color: label.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: label.trim() ? "pointer" : "default" }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Project Modal ──────────────────────────────────────────────────── */
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

/* ─── Add Pillar Modal ────────────────────────────────────────────────────── */
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
          {icons.map(ic => <button key={ic} onClick={() => setIcon(ic)} style={{ padding: "8px 12px", borderRadius: 6, border: `2px solid ${icon === ic ? T.teal : T.border}`, background: T.bg, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center" }}>{renderIcon(ic, 18)}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => {onAdd({id: "p_" + Date.now(), icon, label, sub: "", tag: "Novo", tagColor: ["teal", "tealBg"], links: []}); onClose();}} disabled={!label.trim()} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: label.trim() ? T.text : T.border, color: label.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: label.trim() ? "pointer" : "default" }}>Criar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Pillar Modal ───────────────────────────────────────────────────── */
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
            <button onClick={() => {onSave(pillar.id, {label: label.trim(), sub: sub.trim()}); onClose();}} disabled={!label.trim()} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: label.trim() ? T.text : T.border, color: label.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: label.trim() ? "pointer" : "default" }}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Note Modal ──────────────────────────────────────────────────────────── */
function NoteModal({ onClose, onSave, T, editingNote = null }) {
  const [text, setText] = useState(editingNote?.text || "");
  const ta = useRef(null);
  useEffect(() => { ta.current?.focus(); }, []);

  function handleKey(e) {
    if (e.key === "Escape") onClose();
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { if (text.trim()) onSave(text.trim()); }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, transition: "background-color .3s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,.12)", transition: "all .3s ease" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".75rem" }}>{editingNote ? "Editar nota" : "Nova nota"}</p>
        <textarea
          ref={ta}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escreva aqui…"
          style={{ width: "100%", minHeight: 120, border: "none", outline: "none", resize: "none", fontSize: 15, fontFamily: "inherit", color: T.text, background: T.bg, lineHeight: 1.6, caretColor: T.text, padding: "8px 0", transition: "all .3s ease" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: ".75rem", borderTop: `1px solid ${T.border}`, transition: "border-color .3s ease" }}>
          <span style={{ fontSize: 11, color: T.faint }}>⌘ + Enter para salvar · Esc para fechar</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer", transition: "all .3s ease" }}>Cancelar</button>
            <button onClick={() => { if (text.trim()) onSave(text.trim()); }} disabled={!text.trim()} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: text.trim() ? T.text : T.border, color: text.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: text.trim() ? "pointer" : "default", transition: "all .3s ease" }}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pillar Detail ───────────────────────────────────────────────────────── */
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
              <button onClick={() => removeLink(i)} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = T.coral} onMouseLeave={e => e.currentTarget.style.color = T.faint}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <p style={{ fontSize: 10, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Adicionar Link</p>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título" style={{ width: "100%", padding: "7px 10px", marginBottom: 6, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL (ex: https://...)" onKeyDown={e => e.key === "Enter" && addLink()} style={{ width: "100%", padding: "7px 10px", marginBottom: 10, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          <button onClick={addLink} disabled={!newTitle.trim() || !newUrl.trim()} style={{ width: "100%", padding: "9px", borderRadius: 8, border: "none", background: (newTitle.trim() && newUrl.trim()) ? accentColor : T.border, color: "#fff", fontSize: 13, fontWeight: 600, cursor: (newTitle.trim() && newUrl.trim()) ? "pointer" : "default", fontFamily: "inherit" }}>+ Adicionar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Project Modal ───────────────────────────────────────────────────── */
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
    onAdd({ id: Date.now().toString(), icon: icons[ci % icons.length], iconBg: bgKeys[ci % bgKeys.length], iconColor: colorKeys[ci % colorKeys.length], name: name.trim(), desc: desc.trim(), progress, progressColor: colorKeys[ci % colorKeys.length] });
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, transition: "background-color .3s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,.12)", transition: "all .3s ease" }}>
        <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "1rem" }}>Novo projeto</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do projeto" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit", color: T.text, background: T.bg, marginBottom: 8, outline: "none", boxSizing: "border-box", transition: "all .3s ease" }} />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição curta" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit", color: T.text, background: T.bg, marginBottom: 12, outline: "none", boxSizing: "border-box", transition: "all .3s ease" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: T.muted }}>Cor</span>
          {colorKeys.map((c, i) => (
            <div key={i} onClick={() => setCi(i)} style={{ width: 18, height: 18, borderRadius: "50%", background: T[c], cursor: "pointer", outline: ci === i ? `2px solid ${T[c]}` : "none", outlineOffset: 2, transition: "all .2s" }} />
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
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer", transition: "all .3s ease" }}>Cancelar</button>
          <button onClick={submit} disabled={!name.trim()} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: name.trim() ? T.text : T.border, color: name.trim() ? (T.text === "#1A1916" ? "#fff" : "#000") : T.faint, fontSize: 13, fontWeight: 500, cursor: name.trim() ? "pointer" : "default", transition: "all .3s ease" }}>Adicionar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Weekly Schedule ─────────────────────────────────────────────────────── */
/* ─── Drag and Drop Components ────────────────────────────────────────────── */
function DraggableClass({ cls, day, slot, T }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `class-${day}-${slot}`,
    data: { cls, day, slot }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: "grab",
    textAlign: "center",
    zIndex: isDragging ? 20 : 1,
    padding: "10px",
    background: T.teal,
    color: "#fff",
    width: "100%",
    height: "100%",
    minHeight: "80px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "transform 0.1s ease",
    userSelect: "none"
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12 }}>{cls.subject}</div>
      <div style={{ fontSize: 11, opacity: 0.9 }}>{cls.room}</div>
      <div style={{ fontSize: 11, opacity: 0.8 }}>{cls.professor}</div>
    </div>
  );
}

function DroppableSlot({ day, slot, children, isToday, T, onEdit, cls }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${day}-${slot}`,
    data: { day, slot }
  });

  const style = {
    padding: 0,
    border: `1px solid ${T.border}`,
    background: isOver ? T.tealBg : (cls ? T.tealBg : T.surface),
    cursor: "pointer",
    color: cls ? T.teal : T.faint,
    fontSize: 13,
    lineHeight: 1.5,
    transition: "all .15s ease-out",
    height: 80,
    borderLeft: isToday ? `3px solid ${T.teal}` : `1px solid ${T.border}`,
    borderRight: isToday ? `3px solid ${T.teal}10` : `1px solid ${T.border}`,
    boxShadow: isOver ? `inset 0 0 0 2px ${T.teal}40` : "none",
    position: "relative",
    textAlign: "center",
    verticalAlign: "middle",
    zIndex: isOver ? 5 : 1
  };

  return (
    <td ref={setNodeRef} onClick={() => onEdit(day, slot)} style={style}>
      {children}
      {!cls && !isOver && (
        <div className="empty-plus" style={{ opacity: 0, transition: "opacity .2s", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", pointerEvents: "none", position: "absolute", top: 0, left: 0 }}>
          <Plus size={18} />
        </div>
      )}
    </td>
  );
}

function Schedule({ schedule, onEdit, onMoveClass, T }) {
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayLabels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const jsDayIdx = new Date().getDay();
  const todayColIdx = (jsDayIdx >= 1 && jsDayIdx <= 6) ? jsDayIdx - 1 : -1;

  const [activeId, setActiveId] = useState(null);
  const [activeData, setActiveData] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Previne drag acidental em cliques
    })
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
    setActiveData(event.active.data.current);
  }

  function handleDragEnd(event) {
    setActiveId(null);
    setActiveData(null);
    const { active, over } = event;

    if (over && active.data.current) {
      const source = active.data.current;
      const target = over.data.current;

      if (source.day !== target.day || source.slot !== target.slot) {
        onMoveClass(source.day, source.slot, target.day, target.slot, source.cls);
      }
    }
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <div className="schedule-container">
      <DndContext sensors={sensors} modifiers={[restrictToWindowEdges]} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: "1000px" }}>
          <thead>
            <tr>
              <th style={{ padding: "16px 12px", textAlign: "left", color: T.muted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", borderBottom: `2px solid ${T.border}` }}>Horário</th>
              {dayLabels.map((day, i) => (
                <th key={day} style={{ padding: "16px 12px", textAlign: "center", borderBottom: `2px solid ${i === todayColIdx ? T.teal : T.border}`, borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`, color: i === todayColIdx ? T.teal : T.muted, fontWeight: i === todayColIdx ? 700 : 600, fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", background: i === todayColIdx ? T.tealBg : "transparent" }}>{day}{i === todayColIdx ? " ·" : ""}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.timeSlots.map((slot, idx) => (
              <tr key={idx}>
                <td style={{ padding: "18px 12px", color: T.muted, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.border}` }}>{slot.start} - {slot.end}</td>
                {DAYS.map((day, di) => {
                  const cls = schedule.classes[day]?.find(c => c.slot === idx);
                  const isToday = di === todayColIdx;
                  return (
                    <DroppableSlot key={`${day}-${idx}`} day={day} slot={idx} isToday={isToday} T={T} onEdit={onEdit} cls={cls}>
                      {cls ? <DraggableClass cls={cls} day={day} slot={idx} T={T} /> : null}
                    </DroppableSlot>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <DragOverlay dropAnimation={dropAnimation} style={{ zIndex: 1000, pointerEvents: "none" }}>
          {activeId && activeData ? (
            <div style={{ 
              padding: "14px", 
              borderRadius: "12px", 
              background: T.teal, 
              color: "#fff", 
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)", 
              width: "160px", 
              cursor: "grabbing",
              border: "1px solid rgba(255,255,255,0.2)",
              transform: "scale(1.05)",
              transition: "transform 0.1s ease"
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13, textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>{activeData.cls.subject}</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>{activeData.cls.room}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4, fontStyle: "italic" }}>{activeData.cls.professor}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <button onClick={() => onEdit(null, null)} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, padding: "12px 20px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 14, color: T.text, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all .2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = T.text; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
      ><Pencil size={15} /> Editar Grade Completa</button>
    </div>
  );
}

function TimeSlotsEditor({ schedule, onSave, onClose, T }) {
  const [slots, setSlots] = useState(JSON.parse(JSON.stringify(schedule.timeSlots)));
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [error, setError] = useState("");

  function validateTime(t) { return /^\d{1,2}:\d{2}$/.test(t.trim()); }

  function addSlot() {
    if (!validateTime(newStart) || !validateTime(newEnd)) { setError("Use o formato HH:MM (ex: 8:15)"); return; }
    const updated = [...slots, { start: newStart.trim(), end: newEnd.trim() }];
    updated.sort((a, b) => a.start.localeCompare(b.start));
    setSlots(updated);
    setNewStart(""); setNewEnd(""); setError("");
  }

  function removeSlot(idx) {
    setSlots(slots.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  }

  function startEdit(idx) {
    setEditingIdx(idx);
    setEditStart(slots[idx].start);
    setEditEnd(slots[idx].end);
    setError("");
  }

  function saveEdit() {
    if (!validateTime(editStart) || !validateTime(editEnd)) { setError("Use o formato HH:MM (ex: 8:15)"); return; }
    const updated = slots.map((s, i) => i === editingIdx ? { start: editStart.trim(), end: editEnd.trim() } : s);
    updated.sort((a, b) => a.start.localeCompare(b.start));
    setSlots(updated);
    setEditingIdx(null); setError("");
  }

  function handleSave() {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    newSchedule.timeSlots = slots;
    // Remap class slots by matching old slot index to new
    onSave(newSchedule);
    onClose();
  }

  const inputStyle = { padding: "7px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit", width: "90px", boxSizing: "border-box" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, padding: "1.75rem", width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 12px 48px rgba(0,0,0,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>Gerenciar Horários</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, display: "flex", alignItems: "center" }}><X size={16} /></button>
        </div>

        {/* Existing slots */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1.25rem" }}>
          {slots.length === 0 && (
            <p style={{ fontSize: 12, color: T.faint, textAlign: "center", padding: "1rem", background: T.bg, borderRadius: 8 }}>Nenhum horário cadastrado</p>
          )}
          {slots.map((slot, idx) => (
            <div key={idx} style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg, padding: "10px 12px" }}>
              {editingIdx === idx ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <input value={editStart} onChange={e => setEditStart(e.target.value)} placeholder="Início" style={inputStyle} />
                  <span style={{ color: T.muted, fontSize: 12 }}>→</span>
                  <input value={editEnd} onChange={e => setEditEnd(e.target.value)} placeholder="Fim" style={inputStyle} onKeyDown={e => e.key === "Enter" && saveEdit()} />
                  <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                    <button onClick={saveEdit} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: T.teal, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>OK</button>
                    <button onClick={() => setEditingIdx(null)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontSize: 11, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>{slot.start} – {slot.end}</span>
                  <button onClick={() => startEdit(idx)} title="Editar" style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, display: "flex", alignItems: "center", padding: "2px" }}
                    onMouseEnter={e => e.currentTarget.style.color = T.text}
                    onMouseLeave={e => e.currentTarget.style.color = T.faint}
                  ><Pencil size={13} /></button>
                  <button onClick={() => removeSlot(idx)} title="Remover" style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, display: "flex", alignItems: "center", padding: "2px" }}
                    onMouseEnter={e => e.currentTarget.style.color = T.coral}
                    onMouseLeave={e => e.currentTarget.style.color = T.faint}
                  ><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new slot */}
        <div style={{ background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, padding: "12px 14px", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 10, color: T.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>Adicionar novo horário</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <input value={newStart} onChange={e => setNewStart(e.target.value)} placeholder="Início (7:30)" style={inputStyle} />
            <span style={{ color: T.muted, fontSize: 12 }}>→</span>
            <input value={newEnd} onChange={e => setNewEnd(e.target.value)} placeholder="Fim (8:15)" style={inputStyle} onKeyDown={e => e.key === "Enter" && addSlot()} />
            <button onClick={addSlot} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: "none", background: T.text, color: T.text === "#1A1916" ? "#fff" : "#000", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={13} /> Adicionar
            </button>
          </div>
          {error && <p style={{ fontSize: 11, color: T.coral, marginTop: 8 }}>{error}</p>}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={handleSave} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: T.text, color: T.text === "#1A1916" ? "#fff" : "#000", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function ScheduleEditor({ schedule, onSave, onClose, T, initialDay = null, initialSlot = null }) {
  const [edited, setEdited] = useState(JSON.parse(JSON.stringify(schedule)));
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayLabels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const [editingCell, setEditingCell] = useState(null);
  const [formData, setFormData] = useState({ subject: "", room: "", professor: "" });
  const [showSlotsEditor, setShowSlotsEditor] = useState(false);

  useEffect(() => {
    if (initialDay !== null && initialSlot !== null) {
      const cls = edited.classes[initialDay]?.find(c => c.slot === initialSlot);
      if (cls) {
        setFormData(cls);
      } else {
        setFormData({ subject: "", room: "", professor: "" });
      }
      setEditingCell({ day: initialDay, slot: initialSlot });
    }
  }, []);

  function handleCellClick(day, slot) {
    const cls = edited.classes[day]?.find(c => c.slot === slot);
    if (cls) {
      setFormData(cls);
    } else {
      setFormData({ subject: "", room: "", professor: "" });
    }
    setEditingCell({ day, slot });
  }

  function saveCell() {
    if (!formData.subject.trim()) return;
    const classIdx = edited.classes[editingCell.day].findIndex(c => c.slot === editingCell.slot);
    if (classIdx >= 0) {
      edited.classes[editingCell.day][classIdx] = { slot: editingCell.slot, ...formData };
    } else {
      edited.classes[editingCell.day].push({ slot: editingCell.slot, ...formData });
    }
    setEdited(JSON.parse(JSON.stringify(edited)));
    setEditingCell(null);
  }

  function deleteCell() {
    edited.classes[editingCell.day] = edited.classes[editingCell.day].filter(c => c.slot !== editingCell.slot);
    setEdited(JSON.parse(JSON.stringify(edited)));
    setEditingCell(null);
  }

  return (
    <>
      {showSlotsEditor && (
        <TimeSlotsEditor
          schedule={edited}
          onSave={updated => setEdited(JSON.parse(JSON.stringify(updated)))}
          onClose={() => setShowSlotsEditor(false)}
          T={T}
        />
      )}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, transition: "background-color .3s ease" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "1.5rem", width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,.12)", transition: "all .3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p style={{ fontSize: 11, color: T.faint, letterSpacing: ".08em", textTransform: "uppercase" }}>Editar Aulas</p>
            <button onClick={() => setShowSlotsEditor(true)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted, background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.muted; }}
            ><Pencil size={12} /> Gerenciar Horários ({edited.timeSlots.length})</button>
          </div>
          
          <div style={{ marginBottom: "1.5rem", maxHeight: 300, overflowY: "auto", borderRadius: 8, border: `1px solid ${T.border}`, padding: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px", textAlign: "left", borderBottom: `1px solid ${T.border}`, color: T.muted, fontWeight: 500 }}>Horário</th>
                  {dayLabels.map((label, i) => (
                    <th key={i} style={{ padding: "8px 4px", textAlign: "center", borderBottom: `1px solid ${T.border}`, color: T.muted, fontWeight: 500, fontSize: 10 }}>{label[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {edited.timeSlots.map((slot, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "8px", borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 10, whiteSpace: "nowrap" }}>{slot.start} – {slot.end}</td>
                    {DAYS.map(day => {
                      const cls = edited.classes[day]?.find(c => c.slot === idx);
                      const isEditing = editingCell?.day === day && editingCell?.slot === idx;
                      return (
                        <td key={day} onClick={() => handleCellClick(day, idx)} style={{ padding: "4px", borderBottom: `1px solid ${T.border}`, background: isEditing ? T.teal : (cls ? T.tealBg : T.bg), cursor: "pointer", borderRadius: 4, color: isEditing ? "#fff" : (cls ? T.teal : T.faint), fontSize: 9, textAlign: "center", transition: "all .2s" }}>
                          {cls ? "✓" : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingCell && (
            <div style={{ background: T.bg, borderRadius: 8, padding: 12, marginBottom: "1rem", border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 8 }}>{dayLabels[DAYS.indexOf(editingCell.day)]} · {edited.timeSlots[editingCell.slot].start}</p>
              <input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Matéria" style={{ width: "100%", padding: "8px", marginBottom: 6, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.surface, outline: "none" }} />
              <input value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} placeholder="Sala/Local" style={{ width: "100%", padding: "8px", marginBottom: 6, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.surface, outline: "none" }} />
              <input value={formData.professor} onChange={e => setFormData({...formData, professor: e.target.value})} placeholder="Professor" style={{ width: "100%", padding: "8px", marginBottom: 12, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, color: T.text, background: T.surface, outline: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveCell} disabled={!formData.subject.trim()} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: formData.subject.trim() ? T.teal : T.border, color: "#fff", fontSize: 12, fontWeight: 500, cursor: formData.subject.trim() ? "pointer" : "default" }}>Salvar</button>
                <button onClick={deleteCell} style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: "none", color: T.coral, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Remover</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
            <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer", transition: "all .3s ease" }}>Cancelar</button>
            <button onClick={() => { onSave(edited); onClose(); }} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: T.text, color: T.text === "#1A1916" ? "#fff" : "#000", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Salvar Horário</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Mock fallback data used when no real credentials are set ───────────────
const MOCK_ACTIVITIES = {
  moodle: [
    { id: "m1", subject: "Algoritmos", title: "Lista de Exercícios 03", dueDate: "30/03", createdAt: "20/03", dueDateRaw: new Date(2026, 2, 30) },
    { id: "m2", subject: "Cálculo I", title: "Trabalho prático: Limites", dueDate: "05/04", createdAt: "22/03", dueDateRaw: new Date(2026, 3, 5) }
  ],
  classroom: [
    { id: "c1", subject: "Português", title: "Resenha Crítica", dueDate: "01/04", createdAt: "24/03", dueDateRaw: new Date(2026, 3, 1) }
  ]
};

// ─── API Settings Modal ─────────────────────────────────────────────────────
function ApiSettingsModal({ onClose, T, onSave, config }) {
  const [moodleUrl, setMoodleUrl] = useState(config.moodleUrl || "");
  const [moodleToken, setMoodleToken] = useState(config.moodleToken || "");
  const [googleClientId, setGoogleClientId] = useState(config.googleClientId || "");
  const fieldStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.bg,
    fontSize: 13, color: T.text, outline: "none",
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", transition: "border-color .2s"
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, width: "100%", maxWidth: 440, boxShadow: "0 12px 48px rgba(0,0,0,.18)", overflow: "hidden" }}>
        <div style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 8 }}><Settings size={16}/> Vincular Plataformas</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={17}/></button>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* MOODLE */}
          <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f47a20", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>M</div>
              <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Moodle</span>
            </div>
            <label style={labelStyle}>URL da Instituição</label>
            <input value={moodleUrl} onChange={e => setMoodleUrl(e.target.value)}
              placeholder="https://moodle.suafacul.edu.br" style={{ ...fieldStyle, marginBottom: 10 }}
              onFocus={e => e.target.style.borderColor = "#f47a20"}
              onBlur={e => e.target.style.borderColor = T.border} />
            <label style={labelStyle}>Token de Acesso</label>
            <input value={moodleToken} onChange={e => setMoodleToken(e.target.value)}
              placeholder="Cole aqui seu token (Preferências > Chaves de Segurança)" type="password" style={fieldStyle}
              onFocus={e => e.target.style.borderColor = "#f47a20"}
              onBlur={e => e.target.style.borderColor = T.border} />
            <p style={{ fontSize: 11, color: T.faint, marginTop: 8 }}>No Moodle: Perfil → Preferências → Chaves de segurança → Criar chave</p>
          </div>
          {/* GOOGLE CLASSROOM */}
          <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#4285F4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>G</div>
              <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Google Classroom</span>
            </div>
            <label style={labelStyle}>Client ID (Google Cloud Console)</label>
            <input value={googleClientId} onChange={e => setGoogleClientId(e.target.value)}
              placeholder="xxxxxx.apps.googleusercontent.com" style={fieldStyle}
              onFocus={e => e.target.style.borderColor = "#4285F4"}
              onBlur={e => e.target.style.borderColor = T.border} />
            <p style={{ fontSize: 11, color: T.faint, marginTop: 8 }}>Crie em: console.cloud.google.com → APIs → Credenciais → OAuth 2.0</p>
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4285F4", textDecoration: "none", marginTop: 4 }}>
              <ExternalLink size={11}/> Abrir Google Cloud Console
            </a>
          </div>
        </div>
        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => { onSave({ moodleUrl: moodleUrl.trim(), moodleToken: moodleToken.trim(), googleClientId: googleClientId.trim() }); onClose(); }}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: T.text, color: T.bg === "#F8F7F3" ? "#fff" : "#000", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────
async function fetchMoodleActivities(url, token) {
  const base = url.replace(/\/$/, "");
  // Get enrolled courses first
  const coursesRes = await fetch(`${base}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json&userid=0`);
  if (!coursesRes.ok) throw new Error("Erro ao buscar cursos");
  const courses = await coursesRes.json();
  if (courses.exception) throw new Error(courses.message);

  // For each course, get assignments due
  const now = Math.floor(Date.now() / 1000);
  const allActivities = [];
  await Promise.all(courses.slice(0, 10).map(async (c) => {
    try {
      const r = await fetch(`${base}/webservice/rest/server.php?wstoken=${token}&wsfunction=mod_assign_get_assignments&moodlewsrestformat=json&courseids[0]=${c.id}`);
      const data = await r.json();
      if (data.courses) {
        data.courses.forEach(course => {
          course.assignments.forEach(a => {
            if (a.duedate > now) {
              const due = new Date(a.duedate * 1000);
              const created = new Date(a.timemodified * 1000);
              allActivities.push({
                id: "m" + a.id,
                subject: c.shortname || c.fullname,
                title: a.name,
                dueDate: due.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
                createdAt: created.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
                dueDateRaw: due
              });
            }
          });
        });
      }
    } catch (_) {}
  }));
  return allActivities.sort((a, b) => a.dueDateRaw - b.dueDateRaw);
}

async function fetchGoogleActivities(token) {
  // Get all courses
  const r = await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error("Erro ao acessar Google Classroom");
  const data = await r.json();
  const courses = data.courses || [];
  const now = Date.now();
  const allActivities = [];

  await Promise.all(courses.slice(0, 10).map(async (course) => {
    try {
      const cr = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cData = await cr.json();
      (cData.courseWork || []).forEach(work => {
        if (work.dueDate) {
          const dd = work.dueDate;
          const due = new Date(dd.year, dd.month - 1, dd.day);
          if (due.getTime() >= now) {
            const created = new Date(work.creationTime);
            allActivities.push({
              id: "g" + work.id,
              subject: course.name,
              title: work.title,
              dueDate: due.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
              createdAt: created.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
              dueDateRaw: due
            });
          }
        }
      });
    } catch (_) {}
  }));
  return allActivities.sort((a, b) => a.dueDateRaw - b.dueDateRaw);
}

// ─── Pending Activities Modal ─────────────────────────────────────────────────
function PendingActivitiesModal({ onClose, T, config, onOpenSettings, googleToken, setGoogleToken, userProfile, setUserProfile }) {
  const [activeTab, setActiveTab] = useState("moodle");
  const [moodleActs, setMoodleActs] = useState(null); // null = not loaded
  const [classroomActs, setClassroomActs] = useState(null);
  const [moodleError, setMoodleError] = useState(null);
  const [classroomError, setClassroomError] = useState(null);
  const [loadingMoodle, setLoadingMoodle] = useState(false);
  const [loadingClassroom, setLoadingClassroom] = useState(false);

  const hasMoodle = config.moodleUrl && config.moodleToken;
  const hasGoogle = config.googleClientId;

  // Load Moodle activities
  useEffect(() => {
    const cached = localStorage.getItem("ch_cached_moodle");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Fix dates back to Date objects
        parsed.forEach(a => { if (a.dueDateRaw) a.dueDateRaw = new Date(a.dueDateRaw); });
        setMoodleActs(parsed);
      } catch (e) { console.error("Cache error", e); }
    }

    if (!hasMoodle) { if (!cached) setMoodleActs(MOCK_ACTIVITIES.moodle); return; }
    
    setLoadingMoodle(true);
    setMoodleError(null);
    fetchMoodleActivities(config.moodleUrl, config.moodleToken)
      .then(data => {
        setMoodleActs(data);
        localStorage.setItem("ch_cached_moodle", JSON.stringify(data));
      })
      .catch(err => { 
        setMoodleError(err.message); 
        if (!cached) setMoodleActs(MOCK_ACTIVITIES.moodle); 
      })
      .finally(() => setLoadingMoodle(false));
  }, [config.moodleUrl, config.moodleToken, hasMoodle]);

  // Sync classroom activities when token changes
  useEffect(() => {
    if (googleToken && !classroomActs && !loadingClassroom) {
      setLoadingClassroom(true);
      fetchGoogleActivities(googleToken)
        .then(acts => {
          setClassroomActs(acts);
          localStorage.setItem("ch_cached_classroom", JSON.stringify(acts));
        })
        .catch(e => {
          setClassroomError(e.message);
          setClassroomActs(MOCK_ACTIVITIES.classroom);
        })
        .finally(() => setLoadingClassroom(false));
    }
  }, [googleToken]);

  // Load Classroom cache
  useEffect(() => {
    const cached = localStorage.getItem("ch_cached_classroom");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.forEach(a => { if (a.dueDateRaw) a.dueDateRaw = new Date(a.dueDateRaw); });
        setClassroomActs(parsed);
      } catch (e) { console.error("Cache error", e); }
    }
  }, []);

  // Classroom activities are now synced via googleToken from CentralHome

  const activities = activeTab === "moodle" ? (moodleActs ?? MOCK_ACTIVITIES.moodle) : (classroomActs ?? MOCK_ACTIVITIES.classroom);
  const total = (moodleActs ?? (localStorage.getItem("ch_cached_moodle") ? [] : MOCK_ACTIVITIES.moodle)).length + 
                (classroomActs ?? (localStorage.getItem("ch_cached_classroom") ? [] : MOCK_ACTIVITIES.classroom)).length;
  const isLoading = activeTab === "moodle" ? loadingMoodle : loadingClassroom;
  const error = activeTab === "moodle" ? moodleError : classroomError;
  const isUsingMock = activeTab === "moodle" ? !hasMoodle && !moodleActs : !classroomActs && !googleToken;

  const ActCard = ({ act }) => {
    const dueDate = act.dueDateRaw instanceof Date ? act.dueDateRaw : new Date(act.dueDateRaw);
    const diff = dueDate.getTime() - Date.now();
    const daysLeft = Math.ceil(diff / 86400000);
    const urgentColor = daysLeft <= 2 ? T.coral : daysLeft <= 7 ? "#f59e0b" : T.teal;
    return (
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, background: T.bg, borderLeft: `4px solid ${urgentColor}`, transition: "all .2s ease", position: "relative", overflow: "hidden" }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 16px rgba(0,0,0,.08)`; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: urgentColor, textTransform: "uppercase", letterSpacing: ".08em", background: urgentColor + "15", padding: "3px 8px", borderRadius: 5 }}>{act.subject}</span>
          <span style={{ fontSize: 11, color: urgentColor, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            {daysLeft <= 0 ? "🔥 Hoje!" : daysLeft === 1 ? "⚡ Amanhã" : `${daysLeft}d restantes`}
          </span>
        </div>
        <p style={{ margin: "0 0 8px 0", fontSize: 15, color: T.text, fontWeight: 600, lineHeight: 1.4 }}>{act.title}</p>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.faint, borderTop: `1px solid ${T.border}30`, paddingTop: 8 }}>
          <span>📅 {act.dueDate}</span>
          <span>Criado: {act.createdAt}</span>
        </div>
      </div>
    );
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, width: "100%", maxWidth: 500, boxShadow: "0 8px 48px rgba(0,0,0,.14)", display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={18} color={T.coral}/>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>Atividades Pendentes</h3>
              <p style={{ margin: 0, fontSize: 11, color: T.faint }}>{total} atividade{total !== 1 ? "s" : ""} no total</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={onOpenSettings} title="Configurar APIs"
              style={{ width: 34, height: 34, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.text; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}>
              <Settings size={15}/>
            </button>
            <button onClick={onClose} style={{ width: 34, height: 34, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15}/></button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
          {[{ id: "moodle", label: "Moodle", count: (moodleActs ?? MOCK_ACTIVITIES.moodle).length, color: "#f47a20", letter: "M" }, { id: "classroom", label: "Google Classroom", count: (classroomActs ?? MOCK_ACTIVITIES.classroom).length, color: "#4285F4", letter: "G" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : "2px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: tab.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{tab.letter}</div>
              <span style={{ fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500, color: activeTab === tab.id ? T.text : T.muted }}>{tab.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, background: activeTab === tab.id ? tab.color : T.border, color: activeTab === tab.id ? "#fff" : T.muted, padding: "1px 7px", borderRadius: 10 }}>{tab.count}</span>
            </button>
          ))}
        </div>
        {/* Body */}
        <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Mock warning */}
          {isUsingMock && !isLoading && (
            <div style={{ background: "#f59e0b18", border: "1px solid #f59e0b40", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }}/>
              <p style={{ margin: 0, fontSize: 11, color: T.muted, lineHeight: 1.4 }}>
                {activeTab === "moodle" ? "Configure o Token do Moodle" : "Faça login no Google Classroom"} para ver suas atividades reais. Exibindo dados de exemplo.
              </p>
            </div>
          )}
          {/* API error */}
          {error && (
            <div style={{ background: T.coral + "15", border: `1px solid ${T.coral}40`, borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8 }}>
              <AlertCircle size={14} color={T.coral} style={{ flexShrink: 0, marginTop: 1 }}/>
              <p style={{ margin: 0, fontSize: 11, color: T.coral }}>Erro: {error}. Mostrando dados de exemplo.</p>
            </div>
          )}
          {/* Loading */}
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", gap: 10, color: T.muted }}>
              <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }}/>
              <span style={{ fontSize: 13 }}>Carregando atividades...</span>
            </div>
          ) : activeTab === "classroom" && !classroomActs && !googleToken ? (
            /* Google login prompt */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "#4285F4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 }}>G</div>
              <p style={{ textAlign: "center", fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>Faça login com sua conta Google para sincronizar as atividades do Classroom</p>
              {hasGoogle ? (
                userProfile ? (
                  <button onClick={() => setGoogleToken(userProfile.access_token)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", border: "1px solid #4285F430", borderRadius: 10, background: "#4285F4", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = ".9"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    Sincronizar com {userProfile.given_name || "Google"}
                  </button>
                ) : (
                  <CustomGoogleLoginButton T={T} onLoginSuccess={(data) => {
                    if (setUserProfile) setUserProfile(data);
                    setGoogleToken(data.access_token);
                  }} />
                )
              ) : (
                <button onClick={onOpenSettings}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", border: `1px solid ${T.border}`, borderRadius: 10, background: T.surface, color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Settings size={14}/> Configurar Client ID primeiro
                </button>
              )}
              {MOCK_ACTIVITIES.classroom.map(act => <ActCard key={act.id} act={act}/>)}
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: T.muted }}>
              <p style={{ fontSize: 32, margin: "0 0 8px 0" }}>✅</p>
              <p style={{ fontSize: 14, margin: 0 }}>Nenhuma atividade pendente!</p>
            </div>
          ) : (
            activities.map(act => <ActCard key={act.id} act={act}/>)
          )}
        </div>
        {/* Footer */}
        <div style={{ padding: "0.875rem 1.5rem", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg, borderRadius: "0 0 16px 16px" }}>
          <span style={{ fontSize: 11, color: T.faint }}>{hasMoodle || googleToken ? "Dados sincronizados" : "Usando dados de exemplo"}</span>
          <button onClick={onOpenSettings}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 12, color: T.text, cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.text}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <Settings size={12}/> Configurar APIs
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Periods Componentry ───────────────────────────────────────────────────
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

      {/* Mini Visual Grid (Dots) */}
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
  const [months, setMonths] = useState(3); // can be "1w", "2w", or 1, 3, 6, 12
  
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

function CustomGoogleLoginButton({ T, onLoginSuccess }) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        // Incluímos o token no objeto de sucesso para ser usado no Classroom
        onLoginSuccess({ ...userInfo, access_token: tokenResponse.access_token });
      } catch (err) { console.error("Falha ao buscar perfil", err); }
    },
    onError: err => console.error("Falha ao logar", err),
    // Forçar a tela de escolha de conta
    prompt: 'select_account',
    // Adicionar escopos do Classroom para o login unificado
    scope: "https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.courses.readonly"
  });

  return (
    <button onClick={() => login()}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, fontSize: 13, fontWeight: 600, color: T.text, cursor: "pointer", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.background = T.bg; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
    >
      <User size={16} /> Fazer Login
    </button>
  );
}

function GoogleAuthArea({ T, userProfile, setUserProfile, apiConfig, setShowApiSettings, setGoogleToken }) {
  if (userProfile) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.border}`, padding: "4px 12px 4px 4px", borderRadius: 20 }}>
        <img src={userProfile.picture} alt="Profile" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        <span className="mobile-hide" style={{ fontSize: 13, fontWeight: 600, color: T.text, maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userProfile.given_name || userProfile.name}</span>
        <button onClick={() => { googleLogout(); setUserProfile(null); setGoogleToken(null); }}
          style={{ width: 28, height: 28, borderRadius: "50%", background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMid, transition: "all .2s", marginLeft: 8 }}
          onMouseEnter={e => { e.currentTarget.style.color = T.coral; e.currentTarget.style.borderColor = T.coral; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.textMid; e.currentTarget.style.borderColor = T.border; }}
          title="Sair"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  if (!apiConfig.googleClientId) {
    return (
      <button onClick={() => setShowApiSettings(true)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, fontSize: 13, fontWeight: 600, color: T.text, cursor: "pointer", transition: "all .2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
      >
        <Settings size={16} /> Setup Login
      </button>
    );
  }

  return (
    <CustomGoogleLoginButton T={T} onLoginSuccess={(data) => { 
      setUserProfile(data); 
      setGoogleToken(data.access_token); 
    }} />
  );
}

// ─── Toolbox Features ────────────────────────────────────────────────────────
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

function FinancesSection({ T, finances, setFinances, wishlist, setWishlist, showToast }) {
  const [tab, setTab] = useState("overview"); 
  const [editingBalance, setEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(finances.balance || 0);
  const [editingIncome, setEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(finances.income || 0);
  const [showAddWish, setShowAddWish] = useState(false);
  
  const balance = finances.balance || 0;
  const income = finances.income || 0;
  const totalWishes = wishlist.reduce((acc, w) => acc + Number(w.price || 0), 0);
  const remainingAfterWishes = balance - totalWishes;
  let remainingPerc = 100;
  if (balance > 0) {
    remainingPerc = Math.max(0, Math.round((remainingAfterWishes / balance) * 100));
  }

  const BRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  let agentMessage = "Adicione seu saldo e renda para o Agente começar a analisar.";
  let agentColor = T.muted;
  let agentBg = T.surface;

  if (balance > 0 || income > 0) {
    if (totalWishes === 0) {
      agentMessage = `Excelente! Sem desejos no momento. Que tal poupar ou investir uma parte da sua renda de ${BRL(income)}?`;
      agentColor = T.teal;
      agentBg = T.tealBg;
    } else if (totalWishes > balance) {
      agentMessage = `Cuidado! Seus desejos somam ${BRL(totalWishes)}, que é maior que seu saldo atual. Reavalie as prioridades.`;
      agentColor = T.coral;
      agentBg = T.coralBg;
    } else if (remainingAfterWishes < income * 0.2 && income > 0) {
      agentMessage = `Atenção! Comprar esses desejos deixará você com menos de 20% da sua renda como reserva. Tente guardar um fundo de segurança.`;
      agentColor = T.amber;
      agentBg = T.amberBg;
    } else if (totalWishes > income && income > 0) {
      agentMessage = `Dica: Seus desejos custam mais que sua renda mensal. É aconselhável planejar essas compras ao longo de vários meses.`;
      agentColor = T.blue;
      agentBg = T.blueBg;
    } else {
      agentMessage = `Suas finanças estão confortáveis! Seus desejos cabem no orçamento e a reserva está segura.`;
      agentColor = T.purple;
      agentBg = T.purpleBg;
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text, margin: 0 }}>Gestão Financeira</h2>
          <p style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>Controle de saldo livre e planejamento de compras inteligentes.</p>
        </div>
        <div style={{ display: "flex", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 4 }}>
          <button onClick={() => setTab("overview")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: tab === "overview" ? T.bg : "none", color: tab === "overview" ? T.text : T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>Visão Geral</button>
          <button onClick={() => setTab("wishlist")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: tab === "wishlist" ? T.bg : "none", color: tab === "wishlist" ? T.text : T.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>Lista de Desejos</button>
        </div>
      </div>

      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <div style={{ padding: "2rem", background: `linear-gradient(135deg, ${T.tealBg} 0%, ${T.surface} 100%)`, border: `1px solid ${T.border}`, borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.teal, textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 8px 0" }}>Saldo Total Disponível</p>
                {editingBalance ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 24, color: T.text, fontWeight: 600 }}>R$</span>
                    <input type="number" value={tempBalance} onChange={e => setTempBalance(e.target.value)} autoFocus
                      style={{ background: "none", border: `1px solid ${T.borderMid}`, borderBottom: `2px solid ${T.teal}`, fontSize: 36, fontWeight: 800, color: T.text, width: 140, padding: 4, outline: "none" }} />
                    <button onClick={() => { setFinances({ ...finances, balance: Number(tempBalance) }); setEditingBalance(false); showToast("✓ Saldo atualizado"); }} style={{ padding: "8px 16px", background: T.teal, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <h3 style={{ fontSize: 42, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-.02em" }}>{BRL(balance)}</h3>
                    <button onClick={() => { setTempBalance(balance); setEditingBalance(true); }} style={{ background: "none", border: "none", color: T.teal, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><Pencil size={18} /></button>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ padding: "2rem", background: `linear-gradient(135deg, ${T.blueBg} 0%, ${T.surface} 100%)`, border: `1px solid ${T.border}`, borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 8px 0" }}>Renda Mensal</p>
                {editingIncome ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 24, color: T.text, fontWeight: 600 }}>R$</span>
                    <input type="number" value={tempIncome} onChange={e => setTempIncome(e.target.value)} autoFocus
                      style={{ background: "none", border: `1px solid ${T.borderMid}`, borderBottom: `2px solid ${T.blue}`, fontSize: 36, fontWeight: 800, color: T.text, width: 140, padding: 4, outline: "none" }} />
                    <button onClick={() => { setFinances({ ...finances, income: Number(tempIncome) }); setEditingIncome(false); showToast("✓ Renda atualizada"); }} style={{ padding: "8px 16px", background: T.blue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <h3 style={{ fontSize: 42, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-.02em" }}>{BRL(income)}</h3>
                    <button onClick={() => { setTempIncome(income); setEditingIncome(true); }} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><Pencil size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ background: agentBg, border: `1px solid ${T.border}`, borderRadius: 20, padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "center", transition: "all .3s" }}>
            <div style={{ padding: "12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "50%", color: agentColor, flexShrink: 0 }}>
              <Bot size={24} />
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: 16, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>Agente Financeiro <Zap size={14} color={agentColor} /></h4>
              <p style={{ margin: 0, fontSize: 14, color: T.text, lineHeight: 1.4 }}>{agentMessage}</p>
            </div>
          </div>
          
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "2rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", fontSize: 16, color: T.text }}>Comprometimento com Desejos</h4>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: T.muted }}>Reservado para compras: <strong style={{ color: T.text }}>{BRL(totalWishes)}</strong></span>
              <span style={{ color: T.teal }}>Sobra: <strong style={{ color: finances.balance > 0 ? T.teal : T.muted }}>{BRL(remainingAfterWishes)}</strong> ({remainingPerc}%)</span>
            </div>
            <div style={{ height: 12, background: T.bg, borderRadius: 6, overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${Math.min(100, 100 - remainingPerc)}%`, background: T.amber, height: "100%", transition: "width .4s ease" }} title={`Comprometido: ${100 - remainingPerc}%`} />
              <div style={{ flex: 1, background: T.teal, height: "100%", transition: "flex .4s ease" }} title={`Sobra: ${remainingPerc}%`} />
            </div>
          </div>
        </div>
      )}

      {tab === "wishlist" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, fontSize: 18, color: T.text }}>Compras Mapeadas</h3>
            <button onClick={() => setShowAddWish(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, fontSize: 13, fontWeight: 600, color: T.text, cursor: "pointer", transition: "all .2s" }}><Plus size={16}/> Novo Desejo</button>
          </div>

          {wishlist.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", background: T.surface, border: `1px dashed ${T.border}`, borderRadius: 20 }}>
              <p style={{ fontSize: 15, color: T.faint }}>Nenhum desejo na sua lista ainda.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {wishlist.map((w, i) => {
                const itemPercent = finances.balance > 0 ? ((w.price / finances.balance) * 100).toFixed(1) : 0;
                return (
                  <div key={w.id || i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.25rem", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{w.name}</h4>
                      <button onClick={() => { setWishlist(wishlist.filter(x => x.id !== w.id)); showToast("Removido"); }} style={{ border: "none", background: "none", color: T.faint, cursor: "pointer", padding: 4 }}><Trash2 size={14}/></button>
                    </div>
                    {w.url && <a href={w.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.blue, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}><ExternalLink size={12}/> Abrir Link</a>}
                    
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 'auto' }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{BRL(w.price)}</span>
                    </div>
                    <div style={{ marginTop: 8, padding: "6px 10px", background: T.amberBg, borderRadius: 6, color: T.amber, fontSize: 11, fontWeight: 600 }}>
                      Tomará {itemPercent}% do saldo atual
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAddWish && (
        <EditWishModal 
          T={T} 
          onClose={() => setShowAddWish(false)} 
          onSave={(newItem) => { setWishlist([...wishlist, { ...newItem, id: "w_" + Date.now() }]); setShowAddWish(false); showToast("✓ Desejo adicionado"); }} 
        />
      )}
    </div>
  );
}

function EditWishModal({ T, onClose, onSave }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, width: "100%", maxWidth: 400, padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: 18, color: T.text, fontWeight: 700 }}>Novo Desejo</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 6 }}>O que você quer comprar?</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Novo Monitor" style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 6 }}>Preço Esperado (R$)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 6 }}>Link (opcional)</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => onSave({ name, url, price: Number(price) })} disabled={!name || !price} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: T.text, color: T.surface, fontSize: 14, fontWeight: 600, cursor: (name && price) ? "pointer" : "default", opacity: (name && price) ? 1 : 0.5 }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}


function ClockWidget({ T }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: T.faint }}>
      <Calendar size={14} />
      <span className="mobile-hide" style={{ textTransform: "capitalize" }}>{formatter.format(time).replace(',', ' -')}</span>
    </div>
  );
}

function SearchModal({ T, data, onClose, onSelect }) {
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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "10vh 16px" }}>
      <div onClick={e => e.stopPropagation()} className="animate-slide-up" style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, width: "100%", maxWidth: 600, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "1rem 1.5rem", borderBottom: `1px solid ${T.border}` }}>
          <Search size={20} color={T.muted} style={{ marginRight: 12 }} />
          <input 
            ref={inputRef}
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Buscar notas, projetos, pilares..." 
            style={{ flex: 1, background: "none", border: "none", color: T.text, fontSize: 16, outline: "none", fontFamily: "inherit" }} 
          />
          <div className="mobile-hide" style={{ padding: "4px 8px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 10, color: T.faint, fontWeight: 700 }}>ESC</div>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {results.length > 0 ? (
            results.map((r, idx) => (
              <div 
                key={idx} 
                onClick={() => onSelect(r)}
                style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: idx === results.length - 1 ? "none" : `1px solid ${T.border}44` }}
                onMouseEnter={e => e.currentTarget.style.background = T.bg}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                   <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}>
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

export default function CentralHome() {  const [isDarkMode, setIsDarkMode] = useLocalStorage("ch_darkMode", false);
  const T = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const [notes, setNotes] = useLocalStorage("ch_notes", []);
  const [projects, setProjects] = useLocalStorage("ch_projects", INITIAL_PROJECTS);
  const [pillars, setPillars] = useLocalStorage("ch_pillars", INITIAL_PILLARS);
  const [schedule, setSchedule] = useLocalStorage("ch_schedule", INITIAL_SCHEDULE);
  const [quickLinks, setQuickLinks] = useLocalStorage("ch_quickLinks", INITIAL_QUICK_LINKS);
  const [vaultItems, setVaultItems] = useLocalStorage("ch_vaultItems", INITIAL_VAULT_ITEMS);
  const [showNote, setShowNote] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddPillar, setShowAddPillar] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [showPendingActivities, setShowPendingActivities] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showArchivedProjects, setShowArchivedProjects] = useState(false);
  const [apiConfig, setApiConfig] = useLocalStorage("ch_apiConfig", { moodleUrl: "", moodleToken: "", googleClientId: "" });
  const [userProfile, setUserProfile] = useLocalStorage("ch_user_profile", null);
  const [googleToken, setGoogleToken] = useLocalStorage("ch_google_token", null);
  const [periods, setPeriods] = useLocalStorage("ch_periods", []);
  const [finances, setFinances] = useLocalStorage("ch_finances", { balance: 0, monthlyIncome: 0 });
  const [wishlist, setWishlist] = useLocalStorage("ch_wishlist", []);
  const [toolboxes, setToolboxes] = useLocalStorage("ch_toolboxes", []);
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [showAddToolbox, setShowAddToolbox] = useState(false);
  const [editingToolbox, setEditingToolbox] = useState(null);
  const pendingTotal = MOCK_ACTIVITIES.moodle.length + MOCK_ACTIVITIES.classroom.length; // will be dynamic once real data arrives
  const [editingNote, setEditingNote] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingPillar, setEditingPillar] = useState(null);
  const [openPillar, setOpenPillar] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [toast, setToast] = useState(null);
  const [editingLink, setEditingLink] = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  const handleExportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("ch_")) {
            data[key] = localStorage.getItem(key);
        }
    }
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `central_home_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast("✓ Backup exportado");
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                Object.keys(data).forEach(k => {
                    if (k.startsWith("ch_")) localStorage.setItem(k, data[k]);
                });
                showToast("✓ Backup importado! Recarregando...");
                setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
                showToast("❌ Erro ao ler backup");
            }
        };
        reader.readAsText(file);
    };
    input.click();
  };

  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setActiveSection("notes");
        setShowNote(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearchSelect = (result) => {
    setActiveSection(result.section);
    if (result.type === "Nota") {
        const note = notes.find(n => n.id === result.id);
        if (note) {
          setEditingNote(note);
          setShowNote(true);
        }
    }
    if (result.type === "Pilar") {
        const pillar = pillars.find(p => p.id === result.id);
        if (pillar) setOpenPillar(pillar);
    }
    if (result.type === "Projeto") {
        const proj = projects.find(p => p.id === result.id);
        if (proj) setEditingProject(proj);
    }
    setShowSearch(false);
  };

  const toggleProjectArchive = (id) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, archived: !p.archived } : p));
    showToast("✓ Status do projeto alterado");
  };

  // Inject Google Identity Services script if Client ID is configured
  useEffect(() => {
    if (!apiConfig.googleClientId) return;
    if (document.getElementById("google-gsi-script")) return;
    const s = document.createElement("script");
    s.id = "google-gsi-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }, [apiConfig.googleClientId]);

  function openScheduleEditor(day, slot) {
    setShowScheduleEditor({ day, slot });
  }

  function moveClass(sourceDay, sourceSlot, targetDay, targetSlot, cls) {
    setSchedule(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      // Remove da origem
      if (next.classes[sourceDay]) {
        next.classes[sourceDay] = next.classes[sourceDay].filter(c => c.slot !== sourceSlot);
      }
      // Garante que array de destino exista
      if (!next.classes[targetDay]) {
        next.classes[targetDay] = [];
      }
      // Substitui ou adiciona no destino
      const existingIdx = next.classes[targetDay].findIndex(c => c.slot === targetSlot);
      const newCls = { ...cls, slot: targetSlot };
      
      if (existingIdx !== -1) {
        next.classes[targetDay][existingIdx] = newCls;
      } else {
        next.classes[targetDay].push(newCls);
      }
      return next;
    });
    showToast("✓ Horário movido");
  }

  function saveNote(text) {
    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, text } : n));
      setEditingNote(null);
      showToast("✓ Nota atualizada");
    } else {
      setNotes(prev => [{ id: Date.now(), text, date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) }, ...prev]);
      showToast("✓ Nota salva");
    }
    setShowNote(false);
    if (activeSection !== "notes") setActiveSection("notes");
  }

  function deleteNote(id) { setNotes(prev => prev.filter(n => n.id !== id)); showToast("Nota removida"); }
  function deleteProject(id) { setProjects(prev => prev.filter(p => p.id !== id)); showToast("Projeto removido"); }
  function deletePillar(id) { setPillars(prev => prev.filter(p => p.id !== id)); }
  
  function addProject(p) { setProjects(prev => [...prev, p]); setShowAddProject(false); showToast("✓ Projeto criado"); }
  function updateProject(id, updated) { setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p)); setEditingProject(null); }
  
  function addPillar(p) { setPillars(prev => [...prev, p]); setShowAddPillar(false); showToast("✓ Pilar criado"); }
  function updatePillar(id, updated) { setPillars(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p)); setEditingPillar(null); }
  
  function updateProgress(id, value) { setProjects(prev => prev.map(p => p.id === id ? { ...p, progress: value } : p)); }

  function updatePillarLinks(id, links) { setPillars(prev => prev.map(p => p.id === id ? { ...p, links } : p)); }
  function updateQuickLink(updated) { setQuickLinks(prev => prev.map(q => q.id === updated.id ? updated : q)); }
  function updateVaultItem(updated) { setVaultItems(prev => prev.map(v => v.id === updated.id ? updated : v)); }
  function addVaultItem() { setVaultItems(prev => [...prev, { id: "v_" + Date.now(), label: "Novo item", url: "" }]); }
  function deleteVaultItem(id) { setVaultItems(prev => prev.filter(v => v.id !== id)); }

  const nav = [
    { id: "home", icon: <HomeIcon size={16} />, label: "Central" },
    { id: "notes", icon: <BookOpen size={16} />, label: `Notas${notes.length > 0 ? ` (${notes.length})` : ""}` },
    { id: "projects", icon: <Briefcase size={16} />, label: "Projetos" },
    { id: "periods", icon: <Calendar size={16} />, label: "Períodos" },
    { id: "toolbox", icon: <Box size={16} />, label: "Ferramentas" },
    { id: "finances", icon: <Wallet size={16} />, label: "Finanças" }
  ];

  const mainUI = (
    <div className="animate-fade-in" style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", display: "flex", flexDirection: "column", transition: "background-color .3s ease, color .3s ease" }}>

      {/* top nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: `${T.bg}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, padding: "0 2rem", transition: "all .3s ease" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: "'DM Serif Display', serif", letterSpacing: "-.01em" }}>Central Home</span>
            <div className="mobile-hide" style={{ width: 1, height: 24, background: T.border }}></div>
            <ClockWidget T={T} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <nav className="header-nav" style={{ display: "flex", gap: 6 }}>
              {nav.map(n => (
                <button key={n.id} onClick={() => setActiveSection(n.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: activeSection === n.id ? `2px solid ${T.text}` : "2px solid transparent", background: activeSection === n.id ? T.surface : "none", fontSize: 13, fontWeight: 500, color: activeSection === n.id ? T.text : T.muted, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                  {n.icon}
                  <span>{n.label}</span>
                </button>
              ))}
            </nav>
            <div style={{ width: 1, height: 24, background: T.border, margin: "0 8px" }}></div>
            <GoogleAuthArea T={T} userProfile={userProfile} setUserProfile={setUserProfile} apiConfig={apiConfig} setShowApiSettings={setShowApiSettings} setGoogleToken={setGoogleToken} />
            <button onClick={() => setShowPendingActivities(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, fontSize: 13, fontWeight: 600, color: T.coral, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.coral; e.currentTarget.style.background = T.coral + "1a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
            >
              <Bell size={16} />
              <span className="mobile-hide">{pendingTotal} Pendentes</span>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ width: 44, height: 44, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s", color: isDarkMode ? "#FFD700" : "#FFA500" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.background = T.bg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
              title={isDarkMode ? "Modo claro" : "Modo escuro"}
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div style={{ width: 1, height: 24, background: T.border, margin: "0 4px" }}></div>
            <button onClick={handleImportData}
              style={{ width: 44, height: 44, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s", color: T.blue }}
              title="Importar Backup"
            >
              <Upload size={18} />
            </button>
            <button onClick={handleExportData}
              style={{ width: 44, height: 44, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s", color: T.teal }}
              title="Exportar Backup"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </header>

      <main key={activeSection} className="animate-slide-up" style={{ flex: 1, maxWidth: 1600, width: "100%", margin: "0 auto", padding: "2rem", paddingBottom: "4rem" }}>

        {/* ── HOME ──────────────────────────────────────────────────────── */}
        {activeSection === "home" && (
          <div className="home-layout">
            {/* Left column */}
            <div>
              <div style={{ marginBottom: "3rem" }}>
                <p style={{ fontSize: 12, color: T.faint, letterSpacing: ".08em", marginBottom: ".5rem", textTransform: "uppercase" }}>{today()}</p>
                <h1 style={{ fontSize: 32, fontWeight: 300, color: T.text, fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
                  Bem-vindo,<br /><em style={{ fontStyle: "italic", color: T.accent }}>{userProfile ? (userProfile.given_name || userProfile.name) + "." : "Central Home."}</em>
                </h1>
              </div>

              {/* weekly schedule */}
              <SectionLabel T={T}>Horário da Semana</SectionLabel>
              <Schedule schedule={schedule} onEdit={openScheduleEditor} onMoveClass={moveClass} T={T} />

              {/* pillars - more prominent */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <SectionLabel T={T}>Pilares da Vida</SectionLabel>
                <button onClick={() => setShowAddPillar(true)}
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: T.muted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500, transition: "color .1s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.text}
                  onMouseLeave={e => e.currentTarget.style.color = T.muted}
                ><Plus size={14} strokeWidth={3} /> Novo Pilar</button>
              </div>
              <div className="pillars-grid" style={{ marginBottom: "2rem" }}>
                {pillars.map(p => (
                  <div key={p.id} onClick={() => setOpenPillar(p)}
                    style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.4rem", cursor: "pointer", transition: "borderColor .15s, transform .1s, boxShadow .1s", position: "relative", paddingRight: "3rem" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <span style={{ color: T[p.tagColor[0]] || p.tagColor[0], display: "block", marginBottom: 8 }}>{renderIcon(p.icon, 24)}</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{p.label}</p>
                    <p style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>{p.sub}</p>
                    <Tag label={p.tag} color={T[p.tagColor[0]] || p.tagColor[0]} bg={T[p.tagColor[1]] || p.tagColor[1]} />
                    <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4 }}>
                      <button onClick={e => { e.stopPropagation(); setEditingPillar(p); }} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color .1s", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => e.currentTarget.style.color = T.text}
                        onMouseLeave={e => e.currentTarget.style.color = T.faint}
                      ><Pencil size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* projects list */}
              <SectionLabel T={T} style={{ marginTop: "2rem" }}>Projetos Ativos</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {projects.slice(0, 4).map(p => (
                  <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.2rem", marginBottom: 10, transition: "border-color .1s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = T.borderMid}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: T[p.iconBg] || p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: T[p.iconColor] || p.iconColor, flexShrink: 0 }}>{renderIcon(p.icon, 20)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: T.muted }}>{p.desc}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T[p.progressColor] || p.progressColor, minWidth: 35, textAlign: "right" }}>{p.progress}%</span>
                    </div>
                    <ProgressBar value={p.progress} color={T[p.progressColor] || p.progressColor} T={T} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Quick actions */}
              <SectionLabel T={T}>Ações Rápidas</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "2rem" }}>
                <button onClick={() => setShowNote(true)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 12, border: `2px solid ${T.text}`, background: T.text, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.text; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <Plus size={18} /> Anotar Agora
                </button>
                {quickLinks.map((q) => (
                  <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => q.url ? window.open(q.url, "_blank") : setEditingLink({ item: q, type: "quick" })}
                      style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 13, fontWeight: 500, color: T.text, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.background = T.bg; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: T[q.dot] || q.dot, display: "inline-block", flexShrink: 0 }} />
                      {q.label}
                      {!q.url && <span style={{ fontSize: 10, color: T.faint, marginLeft: "auto" }}>configurar</span>}
                    </button>
                    <button onClick={() => setEditingLink({ item: q, type: "quick" })} title="Editar link" style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${T.border}`, background: "none", color: T.faint, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .1s" }} onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.borderMid; }} onMouseLeave={e => { e.currentTarget.style.color = T.faint; e.currentTarget.style.borderColor = T.border; }}><Pencil size={14} /></button>
                  </div>
                ))}
              </div>

              {/* Next Deliveries Widget */}
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <SectionLabel T={T} style={{ marginBottom: 0 }}>Próximas Entregas</SectionLabel>
                  <button onClick={() => setShowPendingActivities(true)} style={{ background: "none", border: "none", color: T.teal, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Ver tudo</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(() => {
                    let mActs = []; let cActs = [];
                    try { const m = localStorage.getItem("ch_cached_moodle"); if (m) mActs = JSON.parse(m); } catch (e) {}
                    try { const c = localStorage.getItem("ch_cached_classroom"); if (c) cActs = JSON.parse(c); } catch (e) {}
                    const allActs = [...mActs, ...cActs].sort((a, b) => new Date(a.dueDateRaw) - new Date(b.dueDateRaw)).slice(0, 3);
                    
                    if (allActs.length === 0) {
                      return (
                        <div style={{ padding: "1.5rem", textAlign: "center", background: T.bg, border: `1px dashed ${T.border}`, borderRadius: 12 }}>
                          <p style={{ fontSize: 12, color: T.faint, margin: 0 }}>Nenhuma entrega próxima ou contas não conectadas.</p>
                          <button onClick={() => setShowPendingActivities(true)} style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: T.teal, background: "none", border: "none", cursor: "pointer" }}>Configurar Acadêmico</button>
                        </div>
                      );
                    }
                    
                    return allActs.map((act, i) => {
                      const days = Math.ceil((new Date(act.dueDateRaw) - Date.now()) / 86400000);
                      return (
                        <div key={i} onClick={() => setShowPendingActivities(true)}
                          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "all .1s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = T.teal}
                          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: T.teal, textTransform: "uppercase" }}>{act.subject}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: days <= 2 ? T.coral : T.faint }}>{days <= 0 ? "HOJE" : days === 1 ? "AMANHÃ" : `${days}d`}</span>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{act.title}</p>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Stats Cards */}
              <SectionLabel T={T}>Resumo</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "2rem" }}>
                <div style={{ background: `linear-gradient(135deg, ${T.tealBg} 0%, ${T.surface} 100%)`, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.2rem" }}>
                  <p style={{ fontSize: 11, color: T.teal, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Total de Notas</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: T.teal }}>{notes.length}</p>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${T.amberBg} 0%, ${T.surface} 100%)`, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.2rem" }}>
                  <p style={{ fontSize: 11, color: T.amber, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Projetos Ativos</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: T.amber }}>{projects.length}</p>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${T.purpleBg} 0%, ${T.surface} 100%)`, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.2rem" }}>
                  <p style={{ fontSize: 11, color: T.purple, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Progresso Médio</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: T.purple }}>{projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%</p>
                </div>
              </div>

              {/* vault */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <p style={{ fontSize: 10, fontWeight: 500, color: T.faint, letterSpacing: ".1em", textTransform: "uppercase" }}>Cofre de Recursos</p>
                <button onClick={addVaultItem} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.muted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "color .1s" }} onMouseEnter={e => e.currentTarget.style.color = T.text} onMouseLeave={e => e.currentTarget.style.color = T.muted}><Plus size={14} strokeWidth={3} /> Novo</button>
              </div>
              <div className="vault-grid">
                {vaultItems.map((v) => (
                  <div key={v.id} style={{ position: "relative", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: "hidden", transition: "all .1s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.background = T.bg; }} onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}>
                    <button onClick={() => v.url ? window.open(v.url, "_blank") : setEditingLink({ item: v, type: "vault" })} style={{ width: "100%", padding: "10px 12px", background: "none", border: "none", fontSize: 12, fontWeight: 500, color: T.muted, cursor: "pointer", fontFamily: "inherit", textAlign: "center", display: "block" }}>
                      {v.label}
                      {!v.url && <span style={{ display: "block", fontSize: 9, color: T.faint, marginTop: 2 }}>sem link</span>}
                    </button>
                    <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 2 }}>
                      <button onClick={e => { e.stopPropagation(); setEditingLink({ item: v, type: "vault" }); }} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.color = T.text} onMouseLeave={e => e.currentTarget.style.color = T.faint}><Pencil size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); deleteVaultItem(v.id); }} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.color = T.coral} onMouseLeave={e => e.currentTarget.style.color = T.faint}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PERIODS ─────────────────────────────────────────────────── */}
        {activeSection === "periods" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text }}>Meus Períodos</h2>
              <button onClick={() => setShowAddPeriod(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.text; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.border; }}
              >
                <Plus size={16} /> Novo Período
              </button>
            </div>
            {periods.length === 0 ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <p style={{ fontSize: 16, color: T.faint }}>Nenhum período de acompanhamento criado</p>
                <button onClick={() => setShowAddPeriod(true)} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 10, border: `2px solid ${T.text}`, background: "none", color: T.text, fontWeight: 600, cursor: "pointer" }}>Começar a monitorar</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {periods.map(p => (
                  <PeriodCard key={p.id} period={p} onDelete={id => setPeriods(prev => prev.filter(x => x.id !== id))} T={T} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NOTES ─────────────────────────────────────────────────────── */}
        {activeSection === "notes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Serif Display', serif", color: T.text }}>Notas</h2>
              <button onClick={() => setShowNote(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.text; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.border; }}
              >
                <Plus size={16} /> Nova Nota
              </button>
            </div>
            {notes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <p style={{ fontSize: 16, color: T.faint, marginBottom: 20 }}>Nenhuma nota salva ainda</p>
                <button onClick={() => setShowNote(true)} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${T.border}`, background: "none", fontSize: 14, fontWeight: 600, color: T.text, cursor: "pointer", fontFamily: "inherit", transition: "all .1s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.text; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = T.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.border; }}
                >Criar Primeira Nota</button>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map(n => (
                  <div key={n.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.4rem", position: "relative", transition: "border-color .1s, boxShadow .1s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <p style={{ fontSize: 14, color: T.text, lineHeight: 1.6, marginBottom: "1rem", whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 80 }}>{n.text}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
                      <span style={{ fontSize: 11, color: T.faint }}>{n.date}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setEditingNote(n); setShowNote(true); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500, transition: "color .1s" }}
                          onMouseEnter={e => e.currentTarget.style.color = T.text}
                          onMouseLeave={e => e.currentTarget.style.color = T.faint}
                        ><Pencil size={12} /> editar</button>
                        <button onClick={() => deleteNote(n.id)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500, transition: "color .1s" }}
                          onMouseEnter={e => e.currentTarget.style.color = T.coral}
                          onMouseLeave={e => e.currentTarget.style.color = T.faint}
                        ><Trash2 size={12} /> apagar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROJECTS ──────────────────────────────────────────────────── */}
        {activeSection === "projects" && (
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
                onMouseEnter={e => { e.currentTarget.style.background = T.text; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.border; }}
              >
                <Plus size={16} /> Novo Projeto
              </button>
            </div>
            {projects.filter(p => !!p.archived === showArchivedProjects).length === 0 ? (
              <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <p style={{ fontSize: 16, color: T.faint }}>Nenhum projeto {showArchivedProjects ? "arquivado" : "ativo"}</p>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.filter(p => !!p.archived === showArchivedProjects).map(p => (
                  <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.5rem", transition: "border-color .1s, boxShadow .1s", opacity: p.archived ? 0.7 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: T[p.iconBg] || p.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: T[p.iconColor] || p.iconColor, flexShrink: 0 }}>{renderIcon(p.icon, 22)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 4 }}>{p.name}</p>
                        <p style={{ fontSize: 13, color: T.muted }}>{p.desc}</p>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => toggleProjectArchive(p.id)} title={p.archived ? "Desarquivar" : "Arquivar"} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color .1s" }} onMouseEnter={e => e.currentTarget.style.color = T.blue} onMouseLeave={e => e.currentTarget.style.color = T.faint}><Archive size={14} /></button>
                        <button onClick={() => setEditingProject(p)} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color .1s" }} onMouseEnter={e => e.currentTarget.style.color = T.text} onMouseLeave={e => e.currentTarget.style.color = T.faint}><Pencil size={14} /></button>
                        <button onClick={() => deleteProject(p.id)} style={{ color: T.faint, background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color .1s" }} onMouseEnter={e => e.currentTarget.style.color = T.coral} onMouseLeave={e => e.currentTarget.style.color = T.faint}><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Progresso</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T[p.progressColor] || p.progressColor }}>{p.progress}%</span>
                      </div>
                      <input type="range" min={0} max={100} value={p.progress} onChange={e => updateProgress(p.id, +e.target.value)} style={{ width: "100%", accentColor: T[p.progressColor] || p.progressColor, cursor: "pointer", height: 6, borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 1, background: T.border }}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TOOLBOX ───────────────────────────────────────────────────── */}
        {activeSection === "toolbox" && (
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
          </div>
        )}

        {/* ── FINANCES ──────────────────────────────────────────────────── */}
        {activeSection === "finances" && (
          <FinancesSection
            T={T}
            finances={finances}
            setFinances={setFinances}
            wishlist={wishlist}
            setWishlist={setWishlist}
            showToast={showToast}
          />
        )}
      </main>

      {/* modals */}
      {showPendingActivities && <PendingActivitiesModal onClose={() => setShowPendingActivities(false)} T={T} config={apiConfig} onOpenSettings={() => { setShowPendingActivities(false); setShowApiSettings(true); }} googleToken={googleToken} setGoogleToken={setGoogleToken} userProfile={userProfile} setUserProfile={setUserProfile} />}
      {showApiSettings && <ApiSettingsModal onClose={() => setShowApiSettings(false)} T={T} config={apiConfig} onSave={(cfg) => { setApiConfig(cfg); showToast("✓ Credenciais salvas!"); }} />}
      {showAddPeriod && <AddPeriodModal onClose={() => setShowAddPeriod(false)} onAdd={p => { setPeriods(prev => [...prev, p]); setShowAddPeriod(false); showToast("✓ Período criado"); }} T={T} />}
      {showNote && <NoteModal onClose={() => {setShowNote(false); setEditingNote(null);}} onSave={saveNote} T={T} editingNote={editingNote} />}
      {showAddProject && <AddProjectModal onClose={() => setShowAddProject(false)} onAdd={addProject} T={T} />}
      {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={updateProject} T={T} />}
      {showAddPillar && <AddPillarModal onClose={() => setShowAddPillar(false)} onAdd={addPillar} T={T} />}
      {editingPillar && <EditPillarModal pillar={editingPillar} onClose={() => setEditingPillar(null)} onSave={updatePillar} onDelete={deletePillar} T={T} />}
      {showScheduleEditor && <ScheduleEditor schedule={schedule} onSave={setSchedule} onClose={() => setShowScheduleEditor(false)} T={T} initialDay={showScheduleEditor.day} initialSlot={showScheduleEditor.slot} />}
      {openPillar && <PillarDetail pillar={openPillar} onClose={() => setOpenPillar(null)} onUpdateLinks={(id, links) => { updatePillarLinks(id, links); setOpenPillar(prev => prev ? { ...prev, links } : null); }} T={T} />}
      {editingLink && <EditLinkModal item={editingLink.item} onClose={() => setEditingLink(null)} onSave={updated => { if (editingLink.type === "quick") updateQuickLink(updated); else updateVaultItem(updated); }} T={T} />}
      {toast && <Toast msg={toast} T={T} />}
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
      {showSearch && (
        <SearchModal 
          T={T} 
          data={{ notes, projects, pillars, toolboxes }} 
          onClose={() => setShowSearch(false)} 
          onSelect={handleSearchSelect} 
        />
      )}
    </div>
  );

  if (apiConfig.googleClientId) {
    return (
      <GoogleOAuthProvider clientId={apiConfig.googleClientId}>
        {mainUI}
      </GoogleOAuthProvider>
    );
  }
  return mainUI;
}
