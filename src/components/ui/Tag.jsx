import React from "react";

export function Tag({ label, color, bg }) {
  return (
    <span style={{ 
      fontSize: 10, 
      fontWeight: 500, 
      color, 
      background: bg, 
      padding: "2px 8px", 
      borderRadius: 20, 
      display: "inline-block", 
      letterSpacing: ".02em" 
    }}>
      {label}
    </span>
  );
}
