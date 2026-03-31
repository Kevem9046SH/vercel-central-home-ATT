import React, { useState, useEffect } from "react";
import { Settings, X, ExternalLink, Bell, RefreshCw, AlertCircle, User, LogOut } from "lucide-react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";

// ─── Mock fallback data ─────────────────────────────────────────────────────
export const MOCK_ACTIVITIES = {
  moodle: [
    { id: "m1", subject: "Algoritmos", title: "Lista de Exercícios 03", dueDate: "30/03", createdAt: "20/03", dueDateRaw: new Date(2026, 2, 30) },
    { id: "m2", subject: "Cálculo I", title: "Trabalho prático: Limites", dueDate: "05/04", createdAt: "22/03", dueDateRaw: new Date(2026, 3, 5) }
  ],
  classroom: [
    { id: "c1", subject: "Português", title: "Resenha Crítica", dueDate: "01/04", createdAt: "24/03", dueDateRaw: new Date(2026, 3, 1) }
  ]
};

// ─── Componentes de Autenticação Google ───────────────────────────────────────
export function CustomGoogleLoginButton({ T, onLoginSuccess }) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        onLoginSuccess({ ...userInfo, access_token: tokenResponse.access_token });
      } catch (err) { console.error("Falha ao buscar perfil", err); }
    },
    onError: err => console.error("Falha ao logar", err),
    prompt: 'select_account',
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

export function GoogleAuthArea({ T, userProfile, setUserProfile, apiConfig, setShowApiSettings, setGoogleToken }) {
  if (userProfile) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surface, border: `1px solid ${T.border}`, padding: "4px 12px 4px 4px", borderRadius: 20 }}>
        <img src={userProfile.picture} alt="Profile" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        <span className="mobile-hide" style={{ fontSize: 13, fontWeight: 600, color: T.text, maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userProfile.given_name || userProfile.name}</span>
        <button onClick={() => { googleLogout(); setUserProfile(null); setGoogleToken(null); }}
          style={{ width: 28, height: 28, borderRadius: "50%", background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#666", transition: "all .2s", marginLeft: 8 }}
          onMouseEnter={e => { e.currentTarget.style.color = T.coral; e.currentTarget.style.borderColor = T.coral; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = T.border; }}
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

// ─── API Fetch Helpers ──────────────────────────────────────────────────────
export async function fetchMoodleActivities(url, token) {
  const base = url.replace(/\/$/, "");
  const coursesRes = await fetch(`${base}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json&userid=0`);
  if (!coursesRes.ok) throw new Error("Erro ao buscar cursos");
  const courses = await coursesRes.json();
  if (courses.exception) throw new Error(courses.message);

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
              allActivities.push({
                id: "m" + a.id,
                subject: c.shortname || c.fullname,
                title: a.name,
                dueDate: due.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
                createdAt: new Date(a.timemodified * 1000).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
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

export async function fetchGoogleActivities(token) {
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
            allActivities.push({
              id: "g" + work.id,
              subject: course.name,
              title: work.title,
              dueDate: due.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
              createdAt: new Date(work.creationTime).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
              dueDateRaw: due
            });
          }
        }
      });
    } catch (_) {}
  }));
  return allActivities.sort((a, b) => a.dueDateRaw - b.dueDateRaw);
}

// ─── Modals ──────────────────────────────────────────────────────────────────
export function ApiSettingsModal({ onClose, T, onSave, config }) {
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
          <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f47a20", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>M</div>
              <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Moodle</span>
            </div>
            <label style={labelStyle}>URL da Instituição</label>
            <input value={moodleUrl} onChange={e => setMoodleUrl(e.target.value)} placeholder="https://moodle.suafacul.edu.br" style={{ ...fieldStyle, marginBottom: 10 }} />
            <label style={labelStyle}>Token de Acesso</label>
            <input value={moodleToken} onChange={e => setMoodleToken(e.target.value)} placeholder="Token" type="password" style={fieldStyle} />
          </div>
          <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#4285F4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>G</div>
              <span style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Google Classroom</span>
            </div>
            <label style={labelStyle}>Client ID</label>
            <input value={googleClientId} onChange={e => setGoogleClientId(e.target.value)} placeholder="xxxxxx.apps.googleusercontent.com" style={fieldStyle} />
          </div>
        </div>
        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", fontSize: 13, color: T.muted, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => { onSave({ moodleUrl: moodleUrl.trim(), moodleToken: moodleToken.trim(), googleClientId: googleClientId.trim() }); onClose(); }}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: T.text, color: T.surface, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

export function PendingActivitiesModal({ onClose, T, config, onOpenSettings, googleToken, setGoogleToken, userProfile, setUserProfile }) {
  const [activeTab, setActiveTab] = useState("moodle");
  const [moodleActs, setMoodleActs] = useState(null);
  const [classroomActs, setClassroomActs] = useState(null);
  const [loadingMoodle, setLoadingMoodle] = useState(false);
  const [loadingClassroom, setLoadingClassroom] = useState(false);

  const hasMoodle = config.moodleUrl && config.moodleToken;
  const hasGoogle = !!config.googleClientId;

  useEffect(() => {
    if (hasMoodle && activeTab === "moodle" && !moodleActs) {
      setLoadingMoodle(true);
      fetchMoodleActivities(config.moodleUrl, config.moodleToken)
        .then(setMoodleActs)
        .catch(console.error)
        .finally(() => setLoadingMoodle(false));
    }
  }, [hasMoodle, activeTab]);

  useEffect(() => {
    if (googleToken && activeTab === "classroom" && !classroomActs) {
      setLoadingClassroom(true);
      fetchGoogleActivities(googleToken)
        .then(setClassroomActs)
        .catch(console.error)
        .finally(() => setLoadingClassroom(false));
    }
  }, [googleToken, activeTab]);

  const activities = activeTab === "moodle" ? (moodleActs || MOCK_ACTIVITIES.moodle) : (classroomActs || MOCK_ACTIVITIES.classroom);
  const isLoading = activeTab === "moodle" ? loadingMoodle : loadingClassroom;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, width: "100%", maxWidth: 500, boxShadow: "0 8px 48px rgba(0,0,0,.14)", display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>Atividades Pendentes</h3>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onOpenSettings} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, cursor: "pointer", color: T.muted }}><Settings size={15}/></button>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, cursor: "pointer", color: T.muted }}><X size={15}/></button>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
          {["moodle", "classroom"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "12px", background: "none", border: "none", borderBottom: activeTab === tab ? `2px solid ${T.teal}` : "none", cursor: "pointer", color: activeTab === tab ? T.text : T.muted, fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{tab}</button>
          ))}
        </div>
        <div style={{ padding: "1.25rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? <div style={{ textAlign: "center", padding: "2rem" }}><RefreshCw size={24} className="animate-spin" style={{ color: T.faint }} /></div> :
            activities.map(act => (
              <div key={act.id} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, background: T.bg }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.teal, textTransform: "uppercase" }}>{act.subject}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: T.text, fontWeight: 600 }}>{act.title}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.faint, marginTop: 8 }}>
                  <span>📅 {act.dueDate}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
