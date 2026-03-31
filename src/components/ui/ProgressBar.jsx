import React from "react";

export function ProgressBar({ value, color, T }) {
  return (
    <div style={{ height: 2, background: T.border, borderRadius: 1, overflow: "hidden", marginTop: 5 }}>
      <div style={{ 
        height: "100%", 
        width: `${value}%`, 
        background: color, 
        borderRadius: 1, 
        transition: "width .4s ease" 
      }} />
    </div>
  );
}
