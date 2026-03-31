export const INITIAL_PILLARS = [
  { id: "p_finance", icon: "Hexagon", label: "Finanças", sub: "Gastos · metas · orçamento", tag: "3 itens", tagColor: ["amber", "amberBg"], links: [] },
  { id: "p_health", icon: "Circle", label: "Saúde", sub: "Exames · treinos · receitas", tag: "Atualizado", tagColor: ["teal", "tealBg"], links: [] },
  { id: "p_career", icon: "Square", label: "Carreira / Estudos", sub: "Portfólio · certificados · cursos", tag: "2 cursos ativos", tagColor: ["blue", "blueBg"], links: [] },
  { id: "p_home", icon: "Home", label: "Casa", sub: "Inventário · contratos · desejos", tag: "Revisar", tagColor: ["coral", "coralBg"], links: [] },
];

export const INITIAL_PROJECTS = [
  { id: "p1", icon: "Hexagon", iconBg: "tealBg", iconColor: "teal", name: "Clima Curioso", desc: "Flutter · Spring Boot · PostgreSQL", progress: 65, progressColor: "teal" },
  { id: "p2", icon: "Square", iconBg: "amberBg", iconColor: "amber", name: "Formatura IFTO", desc: "Coordenação · cerimônia · logística", progress: 40, progressColor: "amber" },
  { id: "p3", icon: "Circle", iconBg: "purpleBg", iconColor: "purple", name: "Monitoria IFTO", desc: "Processo seletivo · documentação", progress: 25, progressColor: "purple" },
];

export const INITIAL_QUICK_LINKS = [
  { id: "ql1", label: "Agenda", dot: "amber", url: "" },
  { id: "ql2", label: "Compras", dot: "teal", url: "" },
  { id: "ql3", label: "Hábitos", dot: "blue", url: "" },
  { id: "ql4", label: "Leitura", dot: "purple", url: "" },
];

export const INITIAL_VAULT_ITEMS = [
  { id: "v1", label: "Manuais", url: "" },
  { id: "v2", label: "Senhas", url: "" },
  { id: "v3", label: "Artigos salvos", url: "" },
  { id: "v4", label: "Referências visuais", url: "" },
  { id: "v5", label: "Docs legais", url: "" },
];

export const INITIAL_SCHEDULE = {
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
