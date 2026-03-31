import React from "react";

export function SectionLabel({ children, T }) {
  return (
    <p style={{ 
      fontSize: 10, 
      fontWeight: 500, 
      color: T.faint, 
      letterSpacing: ".1em", 
      textTransform: "uppercase", 
      marginBottom: "0.75rem" 
    }}>
      {children}
    </p>
  );
}
