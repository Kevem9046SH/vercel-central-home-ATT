import React, { useState } from "react";
import { Pencil, Plus, Bot, Zap, Trash2, ExternalLink, X } from "lucide-react";

export function FinancesSection({ T, finances, setFinances, wishlist, setWishlist, showToast }) {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: T.text, fontWeight: 700 }}>Novo Desejo</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.faint, cursor: "pointer" }}><X size={20}/></button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 6 }}>O que você quer comprar?</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Novo Monitor" style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 6 }}>Preço Esperado (R$)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, display: "block", marginBottom: 6 }}>Link (opcional)</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, padding: "12px", borderRadius: 10, color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${T.border}`, background: "none", color: T.muted, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button 
            disabled={!name || !price}
            onClick={() => onSave({ name, price: Number(price), url })} 
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: (!name || !price) ? T.border : T.text, color: (!name || !price) ? T.faint : T.surface, fontWeight: 600, cursor: (!name || !price) ? "default" : "pointer" }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
