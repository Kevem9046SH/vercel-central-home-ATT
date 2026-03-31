import React from "react";
import { Hexagon, Circle, Square, Triangle, Folder, BookOpen, Heart, Briefcase, Home as HomeIcon } from "lucide-react";

export const IconMap = {
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

export function renderIcon(name, size = 20) {
  const IconCmp = IconMap[name] || Circle;
  return <IconCmp size={size} strokeWidth={2.5} />;
}
