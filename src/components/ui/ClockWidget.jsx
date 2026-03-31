import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export function ClockWidget({ T }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit'
  });

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: 6, 
      fontSize: 13, 
      fontWeight: 500, 
      color: T.faint 
    }}>
      <Calendar size={14} />
      <span className="mobile-hide" style={{ textTransform: "capitalize" }}>
        {formatter.format(time).replace(',', ' -')}
      </span>
    </div>
  );
}
