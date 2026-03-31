import React from "react";

export function Toast({ msg, T }) {
  return (
    <div style={{ 
      position: "fixed", 
      bottom: 28, 
      left: "50%", 
      transform: "translateX(-50%)", 
      background: T.text, 
      color: T.bg, 
      padding: "10px 24px", 
      borderRadius: 12, 
      fontSize: 13, 
      fontWeight: 500, 
      zIndex: 9999, 
      boxShadow: "0 4px 20px rgba(0,0,0,.25)", 
      pointerEvents: "none", 
      whiteSpace: "nowrap" 
    }}>
      {msg}
    </div>
  );
}
