import { useState, useEffect, useCallback, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════
   iOS DESIGN TOKENS
═══════════════════════════════════════════════════════ */
const iOS = {
  // System colors (iOS 17 dark mode)
  blue:        "#0A84FF",
  green:       "#30D158",
  red:         "#FF453A",
  orange:      "#FF9F0A",
  yellow:      "#FFD60A",
  teal:        "#40CBE0",
  indigo:      "#5E5CE6",
  purple:      "#BF5AF2",
  pink:        "#FF375F",
  // Backgrounds
  bg:          "#000000",
  bg2:         "#1C1C1E",
  bg3:         "#2C2C2E",
  bg4:         "#3A3A3C",
  // Labels
  label:       "#FFFFFF",
  label2:      "rgba(235,235,245,0.6)",
  label3:      "rgba(235,235,245,0.3)",
  label4:      "rgba(235,235,245,0.18)",
  // Fills
  fill:        "rgba(120,120,128,0.36)",
  fill2:       "rgba(120,120,128,0.32)",
  fill3:       "rgba(118,118,128,0.24)",
  fill4:       "rgba(116,116,128,0.18)",
  // Separator
  separator:   "rgba(84,84,88,0.65)",
  // Tab bar / nav
  tabBg:       "rgba(28,28,30,0.85)",
  navBg:       "rgba(28,28,30,0.85)",
  // Cards (grouped list style)
  cardBg:      "#1C1C1E",
  // Accent
  accent:      "#0A84FF",
};

const SYS_FONT = "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

/* ═══════════════════════════════════════════════════════
   DEVICE DIMENSIONS (points, ~3× scale on 15 Pro)
═══════════════════════════════════════════════════════ */
const DEVICES = {
  iphone: {
    label:        "iPhone 15 Pro",
    w:            393,
    h:            852,
    bezel:        12,
    cornerRadius: 48,
    notchType:    "dynamic-island",
    tabBarH:      83,
    statusH:      59,
    navH:         44,
  },
  ipad: {
    label:        "iPad Pro 11″",
    w:            834,
    h:            1194,
    bezel:        16,
    cornerRadius: 18,
    notchType:    "camera",
    tabBarH:      70,
    statusH:      24,
    navH:         50,
  },
};

/* ═══════════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════════ */
const USERS = [
  { id:"u1", email:"admin@reopt.com",  pass:"demo", role:"user",  name:"Marcus Webb",  av:"MW" },
  { id:"u2", email:"guest@reopt.com",  pass:"demo", role:"guest", name:"Sara Chen",    av:"SC" },
  { id:"u3", email:"broker@reopt.com", pass:"demo", role:"user",  name:"Jordan Ellis", av:"JE" },
];
const SITES_SEED = [
  { id:"s1", name:"Meridian Industrial", addr:"4200 Logistics Pkwy, Dallas TX", type:"Owned",  sqft:142000, ch:32, status:"Active",       last:"Jan 12, 2025" },
  { id:"s2", name:"Harbor Gate",          addr:"7 Harbor Gate Dr, Chicago IL",   type:"Leased", sqft:87500,  ch:28, status:"Active",       last:"Jan 8, 2025"  },
  { id:"s3", name:"SunBelt Distribution", addr:"990 Industrial Blvd, Memphis TN",type:"Owned",  sqft:220000, ch:36, status:"Under Review",  last:"Dec 20, 2024" },
];
const PROJECTS_SEED = [
  { id:"p1", name:"Project Atlas",   siteId:"s1", stage:"Letter of Intent", contacts:["Brett Hale","Monica Patel"], comps:["c1","c2"] },
  { id:"p2", name:"Project Titan",   siteId:"s2", stage:"Due Diligence",     contacts:["Derek Lim"],                comps:["c3"] },
  { id:"p3", name:"Project Horizon", siteId:"s3", stage:"Initial Outreach",  contacts:["Yolanda Cruz","Sam Park"],  comps:[] },
];
const COMPS_SEED = [
  { id:"c1", pid:"p1", name:"Garland Flex",   addr:"500 Flex Dr, Garland TX",      sqft:98000,  ch:30, rent:8.50,  scores:{ch:8,pc:7,hp:9,la:7,ur:8,tr:6} },
  { id:"c2", pid:"p1", name:"Mesquite Ind.",  addr:"1200 Trade Blvd, Mesquite TX", sqft:115000, ch:32, rent:9.25,  scores:{ch:9,pc:8,hp:7,la:6,ur:7,tr:8} },
  { id:"c3", pid:"p2", name:"Bridgeport",     addr:"33 Bridgeport Ln, Chicago IL", sqft:72000,  ch:26, rent:11.00, scores:{ch:6,pc:9,hp:8,la:8,ur:5,tr:7} },
];
const TOURS_SEED = [
  { id:"t1", pid:"p1", name:"Atlas Site Tour",   date:"Feb 14, 2025", status:"Scheduled",
    contacts:[{id:"tc1",name:"Brett Hale",email:"brett@co.com",role:"CFO"},{id:"tc2",name:"Monica Patel",email:"monica@co.com",role:"VP Ops"}],
    comps:["c1","c2"], times:{c1:"9:00 AM", c2:"11:30 AM"} },
  { id:"t2", pid:"p2", name:"Titan Walkthrough", date:"Feb 20, 2025", status:"In Progress",
    contacts:[{id:"tc3",name:"Derek Lim",email:"derek@co.com",role:"Director"}],
    comps:["c3"], times:{c3:"2:00 PM"} },
];
const TASKS_SEED = [
  { id:"tk1", priority:"High",   who:"Marcus Webb",   what:"Negotiate lease terms with Apex Distribution",
    notes:"Focus on rent escalation caps and TI allowance.",
    dueDate:"2025-03-01", startDate:"2025-02-10", status:"In Progress",
    siteId:"s1", projectId:"p1" },
  { id:"tk2", priority:"High",   who:"Brett Hale",    what:"Complete Phase I Environmental review",
    notes:"Vendor: EnviroCheck LLC. Report due by month-end.",
    dueDate:"2025-02-28", startDate:"2025-02-05", status:"In Progress",
    siteId:"s2", projectId:"p2" },
  { id:"tk3", priority:"Medium", who:"Monica Patel",  what:"Schedule structural inspection",
    notes:"Coordinate with building owner for access.",
    dueDate:"2025-03-15", startDate:"2025-02-20", status:"Not Started",
    siteId:"s1", projectId:"p1" },
  { id:"tk4", priority:"Low",    who:"Jordan Ellis",  what:"Update site utilization report",
    notes:"Pull latest throughput numbers from ops team.",
    dueDate:"2025-03-30", startDate:"2025-03-01", status:"Not Started",
    siteId:"s3", projectId:"p3" },
  { id:"tk5", priority:"Medium", who:"Derek Lim",     what:"Finalize LOI draft",
    notes:"Legal to review before submission.",
    dueDate:"2025-02-25", startDate:"2025-02-15", status:"Complete",
    siteId:"s2", projectId:"p2" },
];

const PRIORITY_COLOR = { High:iOS.red, Medium:iOS.orange, Low:iOS.green };
const TASK_STATUS    = ["Not Started","In Progress","Blocked","Complete"];

const KSD = [
  {id:"ch",label:"Clear Height",    icon:"ruler"   },
  {id:"pc",label:"Power Capacity",  icon:"bolt"    },
  {id:"hp",label:"Highway Prox.",   icon:"truck"   },
  {id:"la",label:"Labor Avail.",    icon:"people"  },
  {id:"ur",label:"Union Risk",      icon:"checklist"},
  {id:"tr",label:"Tax Rates",       icon:"doc"     },
];
const W = {ch:20,pc:20,hp:20,la:15,ur:15,tr:10};
const calcIPS = s => KSD.reduce((a,k) => a+((W[k.id]/100)*(s[k.id]??0)), 0);

const STAGE_COLOR = {
  "Letter of Intent": iOS.teal,
  "Due Diligence":    iOS.blue,
  "Initial Outreach": iOS.label3,
  "Negotiation":      iOS.orange,
  "Closed":           iOS.green,
};

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { background: #111; font-family: ${SYS_FONT}; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { display: none; }
  input, textarea, select, button { font-family: ${SYS_FONT}; }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 5px; border-radius: 2.5px; background: ${iOS.fill}; outline: none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; border-radius: 50%; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.35); cursor: pointer; }
  textarea { resize: none; }
  @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp   { from { transform:translateY(100%); } to { transform:translateY(0); } }
  @keyframes slideR    { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes popIn     { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
  @keyframes toastPop  { 0%{opacity:0;transform:translateY(12px) scale(.9)} 60%{transform:translateY(-3px) scale(1.02)} 100%{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin       { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  .pressable { transition: opacity .12s, transform .12s; cursor: pointer; }
  .pressable:active { opacity: .55; transform: scale(.97); }
`;

/* ═══════════════════════════════════════════════════════
   iOS PRIMITIVES
═══════════════════════════════════════════════════════ */

/* ── SVG Icon system ─────────────────────────────────── */
const ICONS = {
  house:      <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" strokeLinejoin="round"/><path d="M9 21V12h6v9"/></>,
  building:   <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></>,
  folder:     <><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></>,
  map:        <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
  person:     <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  people:     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
  gear:       <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  search:     <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  check:      <><polyline points="20 6 9 17 4 12"/></>,
  close:      <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  mail:       <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  camera:     <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>,
  video:      <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
  note:       <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  chart:      <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  cloud:      <><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></>,
  star:       <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  back:       <><polyline points="15 18 9 12 15 6"/></>,
  plus:       <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  key:        <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
  eye:        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  share:      <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  download:   <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  door:       <><path d="M3 21h18M9 21V5a2 2 0 012-2h2a2 2 0 012 2v16"/><path d="M9 7h6M9 11h6M9 15h2"/></>,
  car:        <><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="9" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>,
  fire:       <><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></>,
  bolt:       <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  truck:      <><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  grid:       <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  lift:       <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
  ruler:      <><path d="M21.3 8.7l-9-9a1 1 0 00-1.4 0l-9 9a1 1 0 000 1.4l9 9a1 1 0 001.4 0l9-9a1 1 0 000-1.4z"/><path d="M3.3 11L7 14.7M6.3 8L10 11.7M9.3 5L13 8.7"/></>,
  clock:      <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  doc:        <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  checklist:  <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
  blueprint:  <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></>,
  trending:   <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  speech:     <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
};

function Icon({name, size=20, color="currentColor", strokeWidth=1.7}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name] ?? <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
}

/* Icon in a rounded-rect pill — replaces emoji-in-div pattern */
function IconBox({name, size=20, color=iOS.blue, boxSize=36, radius=10}) {
  return (
    <div style={{
      width:boxSize, height:boxSize, borderRadius:radius,
      background:`${color}20`,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:0,
    }}>
      <Icon name={name} size={size} color={color}/>
    </div>
  );
}

/* iOS Label styles */
const T = {
  largeTitle:  { fontSize:34, fontWeight:700, color:iOS.label, letterSpacing:"-.5px", lineHeight:1.1 },
  title1:      { fontSize:28, fontWeight:700, color:iOS.label, letterSpacing:"-.3px" },
  title2:      { fontSize:22, fontWeight:700, color:iOS.label, letterSpacing:"-.2px" },
  title3:      { fontSize:20, fontWeight:600, color:iOS.label },
  headline:    { fontSize:17, fontWeight:600, color:iOS.label },
  body:        { fontSize:17, fontWeight:400, color:iOS.label },
  callout:     { fontSize:16, fontWeight:400, color:iOS.label },
  subhead:     { fontSize:15, fontWeight:400, color:iOS.label },
  footnote:    { fontSize:13, fontWeight:400, color:iOS.label2 },
  caption:     { fontSize:12, fontWeight:400, color:iOS.label2 },
  caption2:    { fontSize:11, fontWeight:400, color:iOS.label3 },
};

/* iOS Badge pill */
function Badge({label, color=iOS.blue}) {
  return (
    <span style={{
      background: `${color}22`, color, fontSize:12, fontWeight:600,
      padding:"3px 9px", borderRadius:99, whiteSpace:"nowrap",
    }}>{label}</span>
  );
}

/* iOS Button */
function IOSBtn({children, onPress, variant="filled", color=iOS.blue, full, size="md", disabled}) {
  const pad = {sm:"8px 16px", md:"13px 20px", lg:"16px 24px"};
  const fs  = {sm:15, md:17, lg:17};
  const styles = {
    filled:   { background:color, color:"#fff" },
    tinted:   { background:`${color}22`, color },
    plain:    { background:"transparent", color },
    gray:     { background:iOS.fill3, color:iOS.label },
    destructive: { background:`${iOS.red}22`, color:iOS.red },
  };
  return (
    <button onClick={disabled?undefined:onPress} className="pressable"
      style={{
        border:"none", borderRadius:14, fontWeight:600, letterSpacing:"-.1px",
        padding:pad[size], fontSize:fs[size],
        width:full?"100%":"auto",
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
        opacity:disabled?.4:1, cursor:disabled?"not-allowed":"pointer",
        ...styles[variant],
      }}>{children}</button>
  );
}

/* iOS Grouped Table Row */
function ListRow({left, title, subtitle, right, onPress, showChevron=true, last}) {
  return (
    <div onClick={onPress} className={onPress?"pressable":undefined}
      style={{
        display:"flex", alignItems:"center", gap:11,
        padding:"10px 14px", background:iOS.cardBg,
        borderBottom: last ? "none" : `0.5px solid ${iOS.separator}`,
        cursor:onPress?"pointer":"default",
      }}>
      {left && <div style={{flexShrink:0}}>{left}</div>}
      <div style={{flex:1, minWidth:0}}>
        <div style={{...T.body, lineHeight:1.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{title}</div>
        {subtitle && <div style={{...T.footnote, marginTop:2}}>{subtitle}</div>}
      </div>
      {right && <div style={{flexShrink:0}}>{right}</div>}
      {onPress && showChevron && <span style={{color:iOS.label3, fontSize:17, fontWeight:500, flexShrink:0}}>›</span>}
    </div>
  );
}

/* iOS Grouped Section */
function Section({header, footer, children, style}) {
  return (
    <div style={{marginBottom:20, ...style}}>
      {header && <div style={{fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".06em",
        padding:"0 4px 5px", color:iOS.label3}}>{header}</div>}
      <div style={{borderRadius:12, overflow:"hidden", background:iOS.cardBg}}>
        {children}
      </div>
      {footer && <div style={{...T.caption, padding:"5px 4px", color:iOS.label3}}>{footer}</div>}
    </div>
  );
}

/* iOS Avatar */
function Avatar({init, size=34, color=iOS.blue}) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:`linear-gradient(135deg,${color}55,${color}22)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*.36, fontWeight:700, color, flexShrink:0,
    }}>{init}</div>
  );
}

/* iOS Score badge */
function ScoreChip({score, large}) {
  const col = score>=7.5?iOS.green:score>=5?iOS.orange:iOS.red;
  return (
    <span style={{
      background:`${col}22`, color:col, fontWeight:700,
      fontSize:large?20:13, padding:large?"8px 18px":"3px 10px",
      borderRadius:99,
    }}>{score.toFixed(2)}</span>
  );
}

/* iOS Sheet (action sheet / form sheet) */
function Sheet({open, onClose, title, children, detent="medium"}) {
  if (!open) return null;
  const maxH = detent === "large" ? "92%" : detent === "medium" ? "72%" : "48%";
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:100, background:"rgba(0,0,0,.5)",
      display:"flex", alignItems:"flex-end", animation:"fadeIn .2s ease",
    }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{
        width:"100%", background:iOS.bg2, borderRadius:"12px 12px 0 0",
        maxHeight:maxH, display:"flex", flexDirection:"column",
        animation:"slideUp .3s cubic-bezier(.32,0,.67,0)",
      }}>
        <div style={{display:"flex", justifyContent:"center", padding:"10px 0 6px", flexShrink:0}}>
          <div style={{width:36, height:5, borderRadius:2.5, background:iOS.label4}}/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"4px 16px 12px", flexShrink:0}}>
          <div style={{width:60}}/>
          <div style={{...T.headline, textAlign:"center"}}>{title}</div>
          <button onClick={onClose} style={{background:iOS.fill3, border:"none", borderRadius:"50%",
            width:30, height:30, fontSize:15, color:iOS.label2, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center"}}>×</button>
        </div>
        <div style={{overflowY:"auto", padding:"0 14px 20px", flex:1}}>{children}</div>
      </div>
    </div>
  );
}

/* iOS Field */
function Field({label, value, onChange, type="text", placeholder}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <div style={{...T.footnote, textTransform:"uppercase", letterSpacing:".05em",
        padding:"0 0 6px", color:iOS.label2}}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", padding:"13px 16px",
          background:iOS.bg3, border:`1.5px solid ${focused?iOS.blue:iOS.separator}`,
          borderRadius:10, fontSize:17, color:iOS.label, outline:"none",
          transition:"border-color .18s",
        }}/>
    </div>
  );
}

/* iOS Select */
function IOSSelect({label, value, onChange, options}) {
  return (
    <div>
      {label && <div style={{...T.footnote, textTransform:"uppercase", letterSpacing:".05em",
        padding:"0 0 6px", color:iOS.label2}}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        width:"100%", padding:"13px 16px", background:iOS.bg3,
        border:`1.5px solid ${iOS.separator}`, borderRadius:10,
        fontSize:17, color:iOS.label, outline:"none", appearance:"none",
      }}>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    </div>
  );
}

/* Toast */
function Toast({msg, onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,2600);return()=>clearTimeout(t);},[]);
  return (
    <div style={{
      position:"absolute", top:80, left:"50%", transform:"translateX(-50%)",
      zIndex:200, background:iOS.bg3, color:iOS.label,
      borderRadius:14, padding:"12px 18px", fontSize:14, fontWeight:600,
      boxShadow:"0 8px 40px rgba(0,0,0,.6)", display:"flex", alignItems:"center", gap:8,
      whiteSpace:"nowrap", border:`1px solid ${iOS.fill}`,
      animation:"toastPop .4s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <Icon name="check" size={16} color={iOS.green}/>{msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   iOS STATUS BAR
═══════════════════════════════════════════════════════ */
function StatusBar({device}) {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true}).replace(" ","");
  const isPhone = device === "iphone";
  return (
    <div style={{
      height: isPhone ? 59 : 24, background:"transparent",
      display:"flex", alignItems:isPhone?"flex-end":"center",
      justifyContent:"space-between",
      padding: isPhone ? "0 28px 8px" : "0 20px",
      flexShrink:0, position:"relative", zIndex:10,
    }}>
      {/* Time */}
      <span style={{fontSize:isPhone?17:13, fontWeight:700, color:iOS.label, letterSpacing:"-.3px"}}>{time}</span>

      {/* Dynamic island or camera (center) */}
      {isPhone && (
        <div style={{
          position:"absolute", top:12, left:"50%", transform:"translateX(-50%)",
          width:120, height:34, background:"#000",
          borderRadius:20, border:"1px solid #1a1a1a",
        }}/>
      )}

      {/* Right indicators */}
      <div style={{display:"flex", alignItems:"center", gap:isPhone?6:5}}>
        {/* Signal bars */}
        <div style={{display:"flex", alignItems:"flex-end", gap:2}}>
          {[5,8,11,14].map((h,i)=>(
            <div key={i} style={{width:3, height:h, background:i<3?iOS.label:iOS.label3, borderRadius:1}}/>
          ))}
        </div>
        {/* WiFi */}
        <svg width={isPhone?17:13} height={isPhone?13:10} viewBox="0 0 17 13" fill="none">
          <path d="M8.5 10.5 C8.5 10.5 8.5 10.5 8.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5.5 7.5 Q8.5 5 11.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M2 4.5 Q8.5 0 15 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".6"/>
        </svg>
        {/* Battery */}
        <div style={{display:"flex", alignItems:"center", gap:1}}>
          <div style={{width:isPhone?26:20, height:isPhone?13:10, border:`1.5px solid ${iOS.label}`, borderRadius:3, position:"relative", padding:1.5}}>
            <div style={{width:"75%", height:"100%", background:iOS.label, borderRadius:1}}/>
          </div>
          <div style={{width:2, height:isPhone?6:5, background:iOS.label2, borderRadius:"0 1px 1px 0"}}/>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   iOS NAVIGATION BAR
═══════════════════════════════════════════════════════ */
function NavBar({title, large, leftItem, rightItem, onBack, backLabel="Back"}) {
  return (
    <div style={{
      background: `${iOS.navBg}`, backdropFilter:"blur(20px)",
      borderBottom:`0.5px solid ${iOS.separator}`, flexShrink:0,
    }}>
      {/* Standard nav row */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between",
        height:44, padding:"0 16px"}}>
        {/* Left */}
        <div style={{flex:1, display:"flex", alignItems:"center"}}>
          {onBack ? (
            <button onClick={onBack} className="pressable"
              style={{background:"none", border:"none", color:iOS.blue, fontSize:17,
                fontWeight:400, cursor:"pointer", display:"flex", alignItems:"center", gap:4, padding:0}}>
              <span style={{fontSize:22, lineHeight:1}}>‹</span> {backLabel}
            </button>
          ) : leftItem}
        </div>
        {/* Title (only if not large title) */}
        {!large && <div style={{...T.headline, textAlign:"center", flex:2}}>{title}</div>}
        {large && <div style={{flex:2}}/>}
        {/* Right */}
        <div style={{flex:1, display:"flex", justifyContent:"flex-end", alignItems:"center"}}>
          {rightItem}
        </div>
      </div>
      {/* Large title row */}
      {large && (
        <div style={{padding:"2px 16px 10px"}}>
          <div style={{...T.largeTitle}}>{title}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   iOS BOTTOM TAB BAR
═══════════════════════════════════════════════════════ */
function TabBar({tab, setTab, role, device}) {
  const isPhone = device === "iphone";
  const tabs = role === "user"
    ? [
        {id:"dashboard", icon:"house",    label:"Home"    },
        {id:"sites",     icon:"building", label:"Sites"   },
        {id:"projects",  icon:"folder",   label:"Projects"},
        {id:"tours",     icon:"map",      label:"Tours"   },
      ]
    : [{id:"tours", icon:"map", label:"My Tour"}];

  return (
    <div style={{
      height: isPhone ? 83 : 70,
      background:`${iOS.tabBg}`, backdropFilter:"blur(20px)",
      borderTop:`0.5px solid ${iOS.separator}`,
      display:"flex", alignItems:"flex-start", paddingTop:8,
      flexShrink:0,
    }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={()=>setTab(t.id)} className="pressable"
            style={{
              flex:1, background:"none", border:"none", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"0 4px",
            }}>
            <div style={{
              opacity:active?1:0.4,
              transition:"opacity .15s",
            }}>
              <Icon name={t.icon} size={isPhone?24:22} color={active?iOS.blue:iOS.label2}/>
            </div>
            <span style={{
              fontSize:isPhone?10:11, fontWeight:active?500:400,
              color:active?iOS.blue:iOS.label2, transition:"color .15s",
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SPLASH
═══════════════════════════════════════════════════════ */
function Splash({onGo}) {
  const [vis, setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),120);},[]);
  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", background:"#000", padding:32,
      opacity:vis?1:0, transition:"opacity .6s"}}>
      <div style={{
        width:90, height:90, borderRadius:22, marginBottom:28,
        background:"linear-gradient(145deg,#0A84FF,#40CBE0)",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 16px 48px rgba(10,132,255,.5)",
        animation:vis?"fadeUp .5s ease":"none",
      }}>
        <Icon name="building" size={44} color="#fff" strokeWidth={1.4}/>
      </div>
      <div style={{...T.largeTitle, textAlign:"center", marginBottom:10,
        animation:vis?"fadeUp .5s .1s ease both":"none"}}>REoptimizer</div>
      <div style={{...T.subhead, color:iOS.label2, textAlign:"center", marginBottom:8,
        animation:vis?"fadeUp .5s .15s ease both":"none"}}>
        Commercial Real Estate Intelligence
      </div>
      <div style={{...T.footnote, textAlign:"center", marginBottom:56,
        animation:vis?"fadeUp .5s .2s ease both":"none"}}>
        KSD Framework · Comp Scoring · Stakeholder Tours
      </div>
      <div style={{width:"100%", animation:vis?"fadeUp .5s .28s ease both":"none"}}>
        <IOSBtn onPress={onGo} full size="lg">Get Started</IOSBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════ */
function Login({onLogin}) {
  const [email,setEmail]=useState("admin@reopt.com");
  const [pass,setPass]=useState("demo");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [recovery,setRecovery]=useState(false);
  const [sent,setSent]=useState(false);

  const submit=()=>{
    setLoading(true); setErr("");
    setTimeout(()=>{
      const u=USERS.find(u=>u.email===email&&u.pass===pass);
      if(u)onLogin(u); else{setErr("Invalid email or password.");setLoading(false);}
    },700);
  };

  if(recovery) return (
    <div style={{flex:1, display:"flex", flexDirection:"column", padding:"32px 24px", background:"#000"}}>
      <div style={{textAlign:"center", marginBottom:40, marginTop:32}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{width:64,height:64,borderRadius:16,background:`${iOS.blue}22`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon name="key" size={30} color={iOS.blue}/>
          </div>
        </div>
        <div style={{...T.title2, marginBottom:8}}>Account Recovery</div>
        <div style={{...T.footnote, color:iOS.label2}}>{sent?"Reset link sent! Check your email.":"Enter your email to receive a reset link."}</div>
      </div>
      {!sent && <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="your@email.com"/>}
      <div style={{display:"flex", flexDirection:"column", gap:12, marginTop:20}}>
        {!sent && <IOSBtn onPress={()=>setSent(true)} full>Send Reset Link</IOSBtn>}
        {sent && <div style={{...T.body, color:iOS.green, textAlign:"center"}}>✓ Email sent</div>}
        <IOSBtn variant="plain" onPress={()=>{setRecovery(false);setSent(false);}}>‹ Back to Sign In</IOSBtn>
      </div>
    </div>
  );

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", padding:"0 24px 24px", background:"#000", overflowY:"auto"}}>
      <div style={{textAlign:"center", padding:"40px 0 32px"}}>
        <div style={{width:64, height:64, borderRadius:16, background:"linear-gradient(145deg,#0A84FF,#40CBE0)",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(10,132,255,.4)"}}>
          <Icon name="building" size={32} color="#fff" strokeWidth={1.5}/>
        </div>
        <div style={{...T.title1, marginBottom:6}}>Welcome Back</div>
        <div style={{...T.footnote, color:iOS.label2}}>Sign in to your REoptimizer workspace</div>
      </div>

      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="your@email.com"/>
        <Field label="Password" value={pass} onChange={setPass} type="password" placeholder="••••••••"/>
        {err && <div style={{background:`${iOS.red}18`, borderRadius:10, padding:"10px 14px",
          ...T.footnote, color:iOS.red}}>{err}</div>}
        <IOSBtn onPress={submit} full disabled={loading}>
          {loading?"Signing in…":"Sign In"}
        </IOSBtn>
        <button onClick={()=>setRecovery(true)} style={{background:"none", border:"none",
          color:iOS.blue, fontSize:16, cursor:"pointer", padding:"8px 0", textAlign:"center"}}>
          Forgot Password?
        </button>
      </div>

      {/* Demo accounts */}
      <div style={{marginTop:28}}>
        <div style={{...T.footnote, textTransform:"uppercase", letterSpacing:".05em",
          color:iOS.label2, padding:"0 4px 8px"}}>Demo Accounts — Tap to Fill</div>
        <div style={{borderRadius:12, overflow:"hidden"}}>
          {USERS.map((u,i)=>(
            <ListRow key={u.id} title={u.email} subtitle={`Role: ${u.role}`}
              right={<Badge label={u.role} color={u.role==="guest"?iOS.orange:iOS.teal}/>}
              onPress={()=>{setEmail(u.email);setPass(u.pass);}}
              showChevron={false} last={i===USERS.length-1}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */
function Dashboard({user, setTab, sites, projects, tours, comps}) {
  const stats=[
    {label:"Sites",    val:sites.length,    icon:"building", color:iOS.teal  },
    {label:"Projects", val:projects.length, icon:"folder",   color:iOS.blue  },
    {label:"Tours",    val:tours.length,    icon:"map",      color:iOS.orange},
    {label:"Comps",    val:comps.length,    icon:"chart",    color:iOS.indigo},
  ];
  return (
    <div style={{flex:1, overflowY:"auto", background:"#000"}}>
      <NavBar title="Dashboard" large
        rightItem={
          <Avatar init={user.av} size={32} color={iOS.blue}/>
        }/>
      <div style={{padding:"0 14px 20px"}}>
        {/* Greeting */}
        <div style={{padding:"12px 0 16px"}}>
          <div style={{...T.title3, color:iOS.label2, marginBottom:4}}>
            Good morning, {user.name.split(" ")[0]}
          </div>
          <div style={{...T.footnote, color:iOS.label3}}>Your portfolio at a glance</div>
        </div>

        {/* Stats 2×2 */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20}}>
          {stats.map(s=>(
            <div key={s.label} style={{background:iOS.bg2, borderRadius:14, padding:14}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <div>
                  <div style={{...T.caption2, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8}}>{s.label}</div>
                  <div style={{fontSize:36, fontWeight:700, color:iOS.label, letterSpacing:"-1px", lineHeight:1}}>{s.val}</div>
                </div>
                <div style={{width:42, height:42, borderRadius:12, background:`${s.color}20`,
                  display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <Icon name={s.icon} size={22} color={s.color}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sites */}
        <Section header="Recent Sites">
          {sites.slice(0,3).map((s,i)=>(
            <ListRow key={s.id}
              left={<IconBox name="building" color={iOS.teal}/>}
              title={s.name} subtitle={`${s.sqft.toLocaleString()} sqft · ${s.type}`}
              right={<Badge label={s.status} color={s.status==="Active"?iOS.green:iOS.orange}/>}
              onPress={()=>setTab("sites")} last={i===sites.length-1}/>
          ))}
        </Section>

        {/* Projects */}
        <Section header="Active Projects">
          {projects.map((p,i)=>{
            const site=sites.find(s=>s.id===p.siteId);
            return <ListRow key={p.id}
              left={<IconBox name="folder" color={iOS.blue}/>}
              title={p.name} subtitle={site?.name}
              right={<Badge label={p.stage} color={STAGE_COLOR[p.stage]??iOS.label3}/>}
              onPress={()=>setTab("projects")} last={i===projects.length-1}/>;
          })}
        </Section>

        {/* Tours */}
        <Section header="Upcoming Tours">
          {tours.map((t,i)=>{
            const proj=projects.find(p=>p.id===t.pid);
            const isLive=t.status==="In Progress";
            return <ListRow key={t.id}
              left={<IconBox name="map" color={isLive?iOS.orange:iOS.blue}/>}
              title={t.name} subtitle={`${proj?.name} · ${t.date}`}
              right={<Badge label={t.status} color={isLive?iOS.orange:iOS.blue}/>}
              onPress={()=>setTab("tours")} last={i===tours.length-1}/>;
          })}
        </Section>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DOC ACTIONS (View / Share / Download)
═══════════════════════════════════════════════════════ */
function DocActions({name, onToast}) {
  const btn = (iconEl, label, color, onPress) => (
    <button onClick={e=>{e.stopPropagation();onPress();}} className="pressable"
      style={{
        display:"flex",flexDirection:"column",alignItems:"center",gap:3,
        background:"none",border:"none",cursor:"pointer",padding:"0 2px",
      }}>
      <div style={{
        width:30,height:30,borderRadius:8,
        background:`${color}20`,
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>{iconEl}</div>
      <span style={{fontSize:9,fontWeight:600,color,letterSpacing:".01em"}}>{label}</span>
    </button>
  );
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      {btn(<Icon name="eye"      size={14} color={iOS.blue}  />, "View",  iOS.blue,   ()=>onToast(`Viewing ${name}`))}
      {btn(<Icon name="share"    size={14} color={iOS.indigo}/>, "Share", iOS.indigo, ()=>onToast(`Sharing ${name}`))}
      {btn(<Icon name="download" size={14} color={iOS.teal}  />, "Save",  iOS.teal,   ()=>onToast(`Downloading ${name}`))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TASKS PANEL  (reused in Sites + Projects)
═══════════════════════════════════════════════════════ */
const EMPTY_TASK = {
  priority:"Medium", who:"", what:"", notes:"",
  dueDate:"", startDate:"", status:"Not Started",
  siteId:"", projectId:"",
};

function TasksPanel({ tasks, setTasks, filterKey, filterId, sites_all=[], projects_all=[], toast, inline=false }) {
  const [sheet,  setSheet]  = useState(false);
  const [detail, setDetail] = useState(null); // task being viewed/edited
  const [form,   setForm]   = useState(EMPTY_TASK);
  const [editId, setEditId] = useState(null);

  // Filtered list for this context
  const visible = tasks.filter(t => t[filterKey] === filterId);

  const openAdd = () => {
    setForm({...EMPTY_TASK, [filterKey]: filterId});
    setEditId(null);
    setSheet(true);
  };
  const openEdit = t => {
    setForm({...t});
    setEditId(t.id);
    setDetail(null);
    setSheet(true);
  };
  const save = () => {
    if(!form.what.trim()) return;
    if(editId) {
      setTasks(prev => prev.map(t => t.id===editId ? {...form, id:editId} : t));
      toast("Task updated");
    } else {
      setTasks(prev => [...prev, {...form, id:"tk"+Date.now()}]);
      toast("Task added");
    }
    setSheet(false);
  };
  const remove = id => {
    setTasks(prev => prev.filter(t => t.id!==id));
    setDetail(null);
    toast("Task removed");
  };
  const cycleStatus = t => {
    const idx = TASK_STATUS.indexOf(t.status);
    const next = TASK_STATUS[(idx+1) % TASK_STATUS.length];
    setTasks(prev => prev.map(x => x.id===t.id ? {...x, status:next} : x));
  };

  const priCol  = p => PRIORITY_COLOR[p] ?? iOS.label3;
  const statCol = s => s==="Complete"?"#30D158":s==="In Progress"?iOS.blue:s==="Blocked"?iOS.red:iOS.label3;

  // ── Task detail sheet ──
  if(detail) {
    const t = tasks.find(x=>x.id===detail);
    if(!t) { setDetail(null); return null; }
    const site = sites_all.find(s=>s.id===t.siteId);
    const proj = projects_all.find(p=>p.id===t.projectId);
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#000",animation:"slideR .28s ease"}}>
        <NavBar title="Task Detail"
          onBack={()=>setDetail(null)} backLabel="Tasks"
          rightItem={
            <button onClick={()=>openEdit(t)} style={{background:"none",border:"none",
              color:iOS.blue,fontSize:15,fontWeight:600,cursor:"pointer"}}>Edit</button>
          }/>
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px 32px"}}>
          {/* Hero */}
          <div style={{background:iOS.bg2,borderRadius:14,padding:16,marginBottom:20,
            borderLeft:`3px solid ${priCol(t.priority)}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <Badge label={t.priority} color={priCol(t.priority)}/>
              <Badge label={t.status} color={statCol(t.status)}/>
            </div>
            <div style={{...T.headline,marginBottom:4,lineHeight:1.35}}>{t.what}</div>
            {t.who && <div style={{...T.footnote,color:iOS.label2,display:"flex",alignItems:"center",gap:5}}>
              <Icon name="person" size={12} color={iOS.label3}/>{t.who}
            </div>}
          </div>

          <Section header="Dates">
            {[
              {l:"Start Date", v:t.startDate||"—"},
              {l:"Due Date",   v:t.dueDate||"—"},
            ].map((d,i,arr)=>(
              <ListRow key={d.l} title={d.l}
                right={<span style={{...T.subhead,color:iOS.label2}}>{d.v}</span>}
                showChevron={false} last={i===arr.length-1}/>
            ))}
          </Section>

          {(site||proj) && (
            <Section header="Related">
              {site && <ListRow left={<IconBox name="building" color={iOS.teal} boxSize={32} radius={8}/>}
                title={site.name} subtitle="Property" showChevron={false} last={!proj}/>}
              {proj && <ListRow left={<IconBox name="folder" color={iOS.blue} boxSize={32} radius={8}/>}
                title={proj.name} subtitle="Project" showChevron={false} last/>}
            </Section>
          )}

          {t.notes && (
            <Section header="Notes">
              <div style={{padding:"12px 14px"}}>
                <div style={{...T.subhead,color:iOS.label2,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{t.notes}</div>
              </div>
            </Section>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
            <IOSBtn variant="tinted" color={iOS.blue} full onPress={()=>cycleStatus(t)}>
              Mark as: {TASK_STATUS[(TASK_STATUS.indexOf(t.status)+1)%TASK_STATUS.length]}
            </IOSBtn>
            <IOSBtn variant="destructive" full onPress={()=>remove(t.id)}>Delete Task</IOSBtn>
          </div>
        </div>
      </div>
    );
  }

  // ── Task list ──
  return (
    <div style={inline?{}:{flex:1,display:"flex",flexDirection:"column"}}>
      <div style={inline?{}:{flex:1,overflowY:"auto",padding:"12px 14px 28px"}}>

        {/* Priority summary strip */}
        {visible.length>0 && (()=>{
          const counts={High:0,Medium:0,Low:0};
          visible.forEach(t=>{if(counts[t.priority]!==undefined)counts[t.priority]++;});
          return (
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {Object.entries(counts).map(([p,n])=>(
                <div key={p} style={{
                  flex:1,background:iOS.bg2,borderRadius:12,padding:"10px 8px",
                  textAlign:"center",borderTop:`2px solid ${priCol(p)}`,
                }}>
                  <div style={{fontSize:22,fontWeight:700,color:priCol(p),letterSpacing:"-1px",lineHeight:1}}>{n}</div>
                  <div style={{fontSize:10,color:iOS.label3,marginTop:3,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{p}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Group by status */}
        {visible.length===0 ? (
          <div style={{background:iOS.bg2,borderRadius:14,padding:40,textAlign:"center",
            border:`1px dashed ${iOS.separator}`}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
              <Icon name="checklist" size={36} color={iOS.label3}/>
            </div>
            <div style={{...T.headline,marginBottom:6}}>No Tasks</div>
            <div style={{...T.footnote,color:iOS.label2}}>Tap + Add Task to get started</div>
          </div>
        ) : (
          TASK_STATUS.map(status=>{
            const group = visible.filter(t=>t.status===status);
            if(!group.length) return null;
            return (
              <Section key={status} header={`${status} · ${group.length}`}>
                {group.map((t,i)=>(
                  <ListRow key={t.id}
                    left={
                      <div style={{
                        width:36,height:36,borderRadius:10,
                        background:`${priCol(t.priority)}18`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        borderLeft:`3px solid ${priCol(t.priority)}`,
                      }}>
                        <Icon name="checklist" size={16} color={priCol(t.priority)}/>
                      </div>
                    }
                    title={t.what}
                    subtitle={[t.who, t.dueDate?"Due "+t.dueDate:null].filter(Boolean).join(" · ")}
                    right={<Badge label={t.priority} color={priCol(t.priority)}/>}
                    onPress={()=>inline ? openEdit(t) : setDetail(t.id)}
                    last={i===group.length-1}
                  />
                ))}
              </Section>
            );
          })
        )}

        <div style={{marginTop:visible.length>0?4:16}}>
          <IOSBtn variant="tinted" color={iOS.blue} full onPress={openAdd}>+ Add Task</IOSBtn>
        </div>
      </div>

      {/* Add / Edit sheet */}
      <Sheet open={sheet} onClose={()=>setSheet(false)}
        title={editId?"Edit Task":"New Task"} detent="large">
        <div style={{display:"flex",flexDirection:"column",gap:13,paddingBottom:32}}>

          <Field label="What" value={form.what} onChange={v=>setForm(f=>({...f,what:v}))}
            placeholder="Describe the task…"/>

          <Field label="Who" value={form.who} onChange={v=>setForm(f=>({...f,who:v}))}
            placeholder="Assigned to…"/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <IOSSelect label="Priority" value={form.priority}
              onChange={v=>setForm(f=>({...f,priority:v}))}
              options={["High","Medium","Low"]}/>
            <IOSSelect label="Status" value={form.status}
              onChange={v=>setForm(f=>({...f,status:v}))}
              options={TASK_STATUS}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Start Date" value={form.startDate} type="date"
              onChange={v=>setForm(f=>({...f,startDate:v}))}/>
            <Field label="Due Date" value={form.dueDate} type="date"
              onChange={v=>setForm(f=>({...f,dueDate:v}))}/>
          </div>

          {sites_all.length>0 && (
            <IOSSelect label="Related Property" value={form.siteId}
              onChange={v=>setForm(f=>({...f,siteId:v}))}
              options={[{value:"",label:"— None —"},...sites_all.map(s=>({value:s.id,label:s.name}))]}/>
          )}

          {projects_all.length>0 && (
            <IOSSelect label="Related Project" value={form.projectId}
              onChange={v=>setForm(f=>({...f,projectId:v}))}
              options={[{value:"",label:"— None —"},...projects_all.map(p=>({value:p.id,label:p.name}))]}/>
          )}

          <div style={{background:iOS.bg3,borderRadius:12,overflow:"hidden"}}>
            <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
              placeholder="Notes…"
              style={{
                width:"100%",minHeight:80,background:"transparent",border:"none",
                padding:"12px 14px",fontSize:15,color:iOS.label,outline:"none",
                lineHeight:1.6, fontFamily:"inherit",
              }}/>
          </div>

          <IOSBtn onPress={save} full disabled={!form.what.trim()}>
            {editId?"Save Changes":"Add Task"}
          </IOSBtn>
          {editId && (
            <IOSBtn variant="destructive" full onPress={()=>{
              remove(editId); setSheet(false);
            }}>Delete Task</IOSBtn>
          )}
        </div>
      </Sheet>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SITE SUB-NAV (segmented control)
═══════════════════════════════════════════════════════ */
function SiteSubNav({tab, setTab}) {
  const TABS = [
    {id:"photos",   icon:"camera",    label:"Photos"    },
    {id:"building", icon:"building",  label:"Building"  },
    {id:"leases",   icon:"doc",       label:"Leases"    },
    {id:"util",     icon:"trending",  label:"Utilization"},
    {id:"docs",     icon:"folder",    label:"Docs"      },
    {id:"tasks",    icon:"checklist", label:"Tasks"     },
  ];
  return (
    <div style={{
      flexShrink:0, padding:"5px 10px",
      background:iOS.bg2, borderBottom:`0.5px solid ${iOS.separator}`,
    }}>
      <div style={{
        display:"flex", background:iOS.bg3,
        borderRadius:10, padding:2, height:36, alignItems:"center",
      }}>
        {TABS.map(t=>{
          const active=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} className="pressable"
              style={{
                flex:1, height:"100%", border:"none", borderRadius:8,
                background:active?iOS.blue:"transparent",
                color:active?"#ffffff":iOS.label2,
                display:"flex", alignItems:"center", justifyContent:"center",
                flexDirection:"column", gap:1,
                fontSize:8, fontWeight:active?600:400,
                cursor:"pointer", transition:"background .18s, color .18s",
                padding:"0 1px",
              }}>
              <Icon name={t.icon} size={11} color={active?"#fff":iOS.label2}/>
              <span style={{whiteSpace:"nowrap",letterSpacing:"-.01em"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SITES
═══════════════════════════════════════════════════════ */
function Sites({sites, setSites, tasks, setTasks, sites_all, projects_all, toast}) {
  const [sel, setSel]=useState(null);
  const [sheet, setSheet]=useState(false);
  const [form, setForm]=useState({name:"",addr:"",type:"Owned",sqft:"",ch:"",status:"Active"});
  const [siteTab,setSiteTab]=useState("building");
  const [sitePhotos,setSitePhotos]=useState({}); // sitePhotos[siteId] = [{id,url,name}]
  const siteFileRef=useRef(null);
  const site=sites.find(s=>s.id===sel);
  useEffect(()=>{ setSiteTab("building"); },[sel]);

  const addSite=()=>{
    if(!form.name)return;
    setSites(prev=>[...prev,{id:"s"+Date.now(),name:form.name,addr:form.addr,
      type:form.type,sqft:parseInt(form.sqft)||0,ch:parseInt(form.ch)||0,
      status:form.status,last:"Today"}]);
    setSheet(false); setForm({name:"",addr:"",type:"Owned",sqft:"",ch:"",status:"Active"});
    toast("Site added");
  };

  if(site) {
    const photos=sitePhotos[site.id]??[];
    const handleSiteFiles=e=>{
      const files=Array.from(e.target.files);
      if(!files.length)return;
      const items=files.map(f=>({
        id:"sp"+Date.now()+Math.random().toString(36).slice(2),
        type:f.type.startsWith("video/")?"video":"image",
        url:URL.createObjectURL(f), name:f.name,
      }));
      setSitePhotos(prev=>({...prev,[site.id]:[...(prev[site.id]??[]),...items]}));
      e.target.value="";
    };
    const removeSitePhoto=id=>setSitePhotos(prev=>({
      ...prev,[site.id]:(prev[site.id]??[]).filter(p=>p.id!==id)
    }));

    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#000",animation:"slideR .28s ease"}}>
        <NavBar title={site.name} onBack={()=>setSel(null)} backLabel="Sites"
          rightItem={<Badge label={site.status} color={site.status==="Active"?iOS.green:iOS.orange}/>}/>

        {/* Pinned sub-nav */}
        <SiteSubNav tab={siteTab} setTab={setSiteTab}/>

        <div style={{flex:1,overflowY:"auto",padding:"12px 14px 28px"}}>

          {/* ══ PHOTOS ══ */}
          {siteTab==="photos" && (
            <div>
              <input ref={siteFileRef} type="file" accept="image/*,video/*"
                multiple style={{display:"none"}} onChange={handleSiteFiles}/>
              {photos.length>0 && (
                <div style={{
                  display:"grid",gridTemplateColumns:"repeat(3,1fr)",
                  gap:8,marginBottom:16,
                }}>
                  {photos.map(p=>(
                    <div key={p.id} style={{
                      position:"relative",aspectRatio:"1",
                      borderRadius:10,overflow:"hidden",background:iOS.bg3,
                    }}>
                      {p.type==="image"
                        ? <img src={p.url} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
                            justifyContent:"center",background:iOS.bg4}}>
                            <span style={{fontSize:24}}>▶</span>
                          </div>
                      }
                      <button onClick={()=>removeSitePhoto(p.id)} style={{
                        position:"absolute",top:4,right:4,width:22,height:22,
                        borderRadius:"50%",background:"rgba(0,0,0,0.72)",
                        border:"none",color:"#fff",fontSize:13,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>×</button>
                      {p.type==="video" && (
                        <div style={{position:"absolute",bottom:4,left:4,background:"rgba(0,0,0,0.62)",
                          borderRadius:4,padding:"2px 5px",fontSize:9,color:"#fff",fontWeight:700}}>VIDEO</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {photos.length===0 && (
                <div style={{
                  background:iOS.bg2,borderRadius:14,padding:40,
                  textAlign:"center",marginBottom:16,
                  border:`1px dashed ${iOS.separator}`,
                }}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                    <Icon name="camera" size={40} color={iOS.label3}/>
                  </div>
                  <div style={{...T.headline,marginBottom:6}}>No Photos Yet</div>
                  <div style={{...T.footnote,color:iOS.label2}}>Add photos and videos of this site</div>
                </div>
              )}
              <IOSBtn variant="tinted" color={iOS.teal} full onPress={()=>siteFileRef.current?.click()}>
                {photos.length>0?`${photos.length} file${photos.length>1?"s":""} · Add More`:"Add Photos & Videos"}
              </IOSBtn>
            </div>
          )}

          {/* ══ BUILDING INFO ══ */}
          {siteTab==="building" && (
            <div>
              <Section header="Overview">
                {[
                  {l:"Square Footage", v:site.sqft.toLocaleString()+" sqft"},
                  {l:"Clear Height",   v:site.ch+"'"},
                  {l:"Tenure",         v:site.type},
                  {l:"Last Visit",     v:site.last},
                  {l:"Status",         v:site.status},
                ].map((d,i,arr)=>(
                  <ListRow key={d.l} title={d.l}
                    right={<span style={{...T.subhead,color:iOS.label2}}>{d.v}</span>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Specifications">
                {[
                  {icon:"door",      label:"Dock Doors",       val:"24"},
                  {icon:"car",       label:"Drive-In Doors",    val:"4"},
                  {icon:"fire",      label:"Fire Suppression",  val:"ESFR"},
                  {icon:"bolt",      label:"Power",              val:"2,000A / 480V 3-Phase"},
                  {icon:"building",  label:"Office Area",        val:"4,200 sqft"},
                  {icon:"truck",     label:"Truck Court",        val:"185 ft"},
                  {icon:"grid",      label:"Column Spacing",     val:"52' × 50'"},
                  {icon:"lift",      label:"Sprinkler System",  val:"ESFR K-25"},
                ].map((d,i,arr)=>(
                  <ListRow key={d.label}
                    left={<div style={{width:32,height:32,borderRadius:8,background:iOS.bg3,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon name={d.icon} size={16} color={iOS.label2}/>
                    </div>}
                    title={d.label}
                    right={<span style={{...T.subhead,color:iOS.label2}}>{d.val}</span>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Address">
                <ListRow title={site.addr} showChevron={false} last/>
              </Section>
              <Section header="Zoning & Compliance">
                {[
                  {l:"Zoning",          v:"M-2 Heavy Industrial"},
                  {l:"ADA Compliant",   v:"Yes"},
                  {l:"LEED Certified",  v:"Silver"},
                  {l:"Year Built",      v:"2008"},
                  {l:"Last Inspected",  v:"Oct 2024"},
                ].map((d,i,arr)=>(
                  <ListRow key={d.l} title={d.l}
                    right={<span style={{...T.subhead,color:iOS.label2}}>{d.v}</span>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
            </div>
          )}

          {/* ══ LEASES ══ */}
          {siteTab==="leases" && (
            <div>
              <Section header="Active Leases">
                {[
                  {tenant:"Apex Distribution LLC", sqft:82000, rate:8.75, exp:"Dec 2026", status:"Active"},
                  {tenant:"NovaTech Logistics",    sqft:42000, rate:9.10, exp:"Mar 2025", status:"Expiring"},
                ].map((l,i,arr)=>(
                  <ListRow key={l.tenant}
                    left={<IconBox name="doc" color={l.status==="Active"?iOS.green:iOS.orange}/>}
                    title={l.tenant}
                    subtitle={`${l.sqft.toLocaleString()} sqft · $${l.rate}/sqft`}
                    right={<div style={{textAlign:"right"}}>
                      <div style={{...T.caption,color:iOS.label2,marginBottom:2}}>Exp {l.exp}</div>
                      <Badge label={l.status} color={l.status==="Active"?iOS.green:iOS.orange}/>
                    </div>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Lease Summary">
                {[
                  {l:"Total Leased",    v:"124,000 sqft"},
                  {l:"Vacant",          v:`${(site.sqft-124000).toLocaleString()} sqft`},
                  {l:"Occupancy Rate",  v:`${Math.round((124000/site.sqft)*100)}%`},
                  {l:"Avg Rent / sqft", v:"$8.93"},
                  {l:"Annual Rent",     v:"$1,087,200"},
                  {l:"Annual OC",       v:"$1,304,640"},
                  {l:"Total OC",        v:"$2,391,840"},
                ].map((d,i,arr)=>(
                  <ListRow key={d.l} title={d.l}
                    right={<span style={{...T.subhead,
                      color:d.l==="Occupancy Rate"?iOS.green:iOS.label2}}>{d.v}</span>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <div style={{marginTop:4}}>
                <IOSBtn variant="tinted" color={iOS.teal} full onPress={()=>toast("Opening lease editor…")}>
                  + Add Lease
                </IOSBtn>
              </div>
            </div>
          )}

          {/* ══ UTILIZATION ══ */}
          {siteTab==="util" && (
            <div>
              {/* Occupancy gauge */}
              <div style={{background:iOS.bg2,borderRadius:14,padding:20,marginBottom:16,textAlign:"center"}}>
                <div style={{...T.caption2,textTransform:"uppercase",letterSpacing:".1em",
                  color:iOS.label2,marginBottom:8}}>Current Occupancy</div>
                {(()=>{
                  const pct=Math.round((124000/site.sqft)*100);
                  const col=pct>=90?iOS.green:pct>=70?iOS.orange:iOS.red;
                  return (<>
                    <div style={{fontSize:56,fontWeight:700,color:col,letterSpacing:"-2px",lineHeight:1,marginBottom:4}}>
                      {pct}%
                    </div>
                    <div style={{...T.footnote,color:iOS.label2,marginBottom:16}}>
                      124,000 of {site.sqft.toLocaleString()} sqft occupied
                    </div>
                    {/* Progress bar */}
                    <div style={{height:8,borderRadius:4,background:iOS.bg4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:4,transition:"width .5s ease"}}/>
                    </div>
                  </>);
                })()}
              </div>
              <Section header="Space Breakdown">
                {[
                  {label:"Warehouse",  sqft:110000, color:iOS.blue},
                  {label:"Office",     sqft:4200,   color:iOS.indigo},
                  {label:"Mezzanine",  sqft:9800,   color:iOS.teal},
                  {label:"Vacant",     sqft:site.sqft-124000, color:iOS.fill},
                ].map((s,i,arr)=>{
                  const pct=Math.round((s.sqft/site.sqft)*100);
                  return (
                    <ListRow key={s.label}
                      left={<div style={{width:12,height:12,borderRadius:3,background:s.color,flexShrink:0}}/>}
                      title={s.label}
                      subtitle={`${s.sqft.toLocaleString()} sqft`}
                      right={<span style={{...T.subhead,color:iOS.label2}}>{pct}%</span>}
                      showChevron={false} last={i===arr.length-1}/>
                  );
                })}
              </Section>
              <Section header="Operational Metrics">
                {[
                  {l:"Avg Daily Throughput",  v:"4,200 pallets"},
                  {l:"Dock Utilization",      v:"78%"},
                  {l:"Peak Hours",            v:"6am – 2pm"},
                  {l:"Shifts",               v:"2 (Day / Night)"},
                  {l:"Headcount",            v:"142 FTE"},
                ].map((d,i,arr)=>(
                  <ListRow key={d.l} title={d.l}
                    right={<span style={{...T.subhead,color:iOS.label2}}>{d.v}</span>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
            </div>
          )}

          {/* ══ DOCUMENTS ══ */}
          {siteTab==="docs" && (
            <div>
              <Section header="Lease Documents">
                {[
                  "Master Lease Agreement.pdf",
                  "Apex Distribution Lease.pdf",
                  "NovaTech Lease Amendment.pdf",
                ].map((name,i,arr)=>(
                  <ListRow key={name}
                    left={<IconBox name="doc" color={iOS.orange}/>}
                    title={name} subtitle={["Jan 3, 2025 · 2.4 MB","Nov 12, 2024 · 1.8 MB","Sep 5, 2024 · 890 KB"][i]}
                    right={<DocActions name={name} onToast={toast}/>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Inspections & Compliance">
                {[
                  "Fire Inspection Report Q4 2024.pdf",
                  "OSHA Compliance Certificate.pdf",
                  "Environmental Assessment 2024.pdf",
                ].map((name,i,arr)=>(
                  <ListRow key={name}
                    left={<IconBox name="checklist" color={iOS.green}/>}
                    title={name} subtitle={["Oct 18, 2024 · 540 KB","Aug 2, 2024 · 320 KB","Jul 15, 2024 · 3.1 MB"][i]}
                    right={<DocActions name={name} onToast={toast}/>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Engineering & Plans">
                {[
                  "Floor Plan – As Built.dwg",
                  "Electrical Single-Line.pdf",
                  "Sprinkler Layout.pdf",
                ].map((name,i,arr)=>(
                  <ListRow key={name}
                    left={<IconBox name="blueprint" color={iOS.indigo}/>}
                    title={name} subtitle={["2022 · 18 MB","2022 · 6.2 MB","Mar 1, 2024 · 4.8 MB"][i]}
                    right={<DocActions name={name} onToast={toast}/>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <IOSBtn variant="tinted" color={iOS.teal} full onPress={()=>toast("Upload document…")}>
                + Upload Document
              </IOSBtn>
            </div>
          )}

          {/* ══ TASKS ══ */}
          {siteTab==="tasks" && (
            <TasksPanel
              tasks={tasks} setTasks={setTasks}
              filterKey="siteId" filterId={site.id}
              sites_all={sites_all??[]} projects_all={projects_all??[]}
              toast={toast}/>
          )}

        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", background:"#000", position:"relative"}}>
      <NavBar title="Sites" large
        rightItem={<button onClick={()=>setSheet(true)} style={{background:"none", border:"none",
          color:iOS.blue, fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", gap:4}}>
          <span style={{fontSize:22, fontWeight:300}}>+</span> Add
        </button>}/>
      <div style={{flex:1, overflowY:"auto", padding:"0 14px 20px"}}>
        <Section>
          {sites.map((s,i)=>(
            <ListRow key={s.id}
              left={<IconBox name="building" color={iOS.teal} boxSize={40} radius={12}/>}
              title={s.name} subtitle={`${s.sqft.toLocaleString()} sqft · ${s.type} · ${s.ch}' clear`}
              right={<Badge label={s.status} color={s.status==="Active"?iOS.green:iOS.orange}/>}
              onPress={()=>setSel(s.id)} last={i===sites.length-1}/>
          ))}
        </Section>
      </div>

      <Sheet open={sheet} onClose={()=>setSheet(false)} title="Add Site" detent="large">
        <div style={{display:"flex", flexDirection:"column", gap:16, paddingBottom:24}}>
          <Field label="Site Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Riverside Logistics"/>
          <Field label="Address" value={form.addr} onChange={v=>setForm(f=>({...f,addr:v}))} placeholder="123 Industrial Blvd, City ST"/>
          <IOSSelect label="Tenure Type" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} options={["Owned","Leased"]}/>
          <IOSSelect label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={["Active","Under Review","Inactive"]}/>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
            <Field label="Square Footage" value={form.sqft} onChange={v=>setForm(f=>({...f,sqft:v}))} placeholder="120000"/>
            <Field label="Clear Ht (ft)" value={form.ch} onChange={v=>setForm(f=>({...f,ch:v}))} placeholder="32"/>
          </div>
          <IOSBtn onPress={addSite} full>Add Site</IOSBtn>
        </div>
      </Sheet>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROJECTS
═══════════════════════════════════════════════════════ */
function Projects({projects, setProjects, sites, comps, setComps, tasks=[], setTasks=()=>{}, sites_all=[], toast}) {
  const [sel,setSel]=useState(null);
  const [sheet,setSheet]=useState(false);
  const [compSheet,setCompSheet]=useState(false);
  const [form,setForm]=useState({name:"",siteId:"",stage:"Initial Outreach"});
  const [cf,setCf]=useState({name:"",addr:"",sqft:"",rent:"",scores:{ch:5,pc:5,hp:5,la:5,ur:5,tr:5}});

  const proj=projects.find(p=>p.id===sel);
  const pComps=proj?comps.filter(c=>proj.comps.includes(c.id)):[];

  const addProject=()=>{
    if(!form.name||!form.siteId)return;
    setProjects(prev=>[...prev,{id:"p"+Date.now(),name:form.name,siteId:form.siteId,stage:form.stage,contacts:[],comps:[]}]);
    setSheet(false); setForm({name:"",siteId:"",stage:"Initial Outreach"}); toast("Project created");
  };

  const addComp=()=>{
    if(!cf.name||!proj)return;
    const nc={id:"c"+Date.now(),pid:proj.id,name:cf.name,addr:cf.addr,sqft:parseInt(cf.sqft)||0,ch:0,rent:parseFloat(cf.rent)||0,scores:{...cf.scores}};
    setComps(prev=>[...prev,nc]);
    setProjects(prev=>prev.map(p=>p.id===proj.id?{...p,comps:[...p.comps,nc.id]}:p));
    setCompSheet(false); setCf({name:"",addr:"",sqft:"",rent:"",scores:{ch:5,pc:5,hp:5,la:5,ur:5,tr:5}});
    toast("Comp added");
  };

  if(proj){
    const site=sites.find(s=>s.id===proj.siteId);
    const scored=pComps.map(c=>({...c,score:calcIPS(c.scores)})).sort((a,b)=>b.score-a.score);
    const barData=KSD.map(k=>({
      subject:k.label,
      ...scored.reduce((acc,c)=>({...acc,[c.name]:c.scores[k.id]??0}),{})
    }));
    const colors=[iOS.green,iOS.blue,iOS.orange];

    return (
      <div style={{flex:1, display:"flex", flexDirection:"column", background:"#000", position:"relative", animation:"slideR .28s ease"}}>
        <NavBar title={proj.name} onBack={()=>setSel(null)} backLabel="Projects"
          rightItem={<Badge label={proj.stage} color={STAGE_COLOR[proj.stage]??iOS.label3}/>}/>
        <div style={{flex:1, overflowY:"auto", padding:"12px 14px 28px"}}>
          {/* Site */}
          <Section header="Linked Site">
            <ListRow left={<IconBox name="building" color={iOS.teal}/>}
              title={site?.name??"No site"} subtitle={site?.addr} showChevron={false} last/>
          </Section>

          {/* Contacts */}
          <Section header={`Contacts (${proj.contacts.length})`}>
            {proj.contacts.length===0
              ? <ListRow title="No contacts yet" showChevron={false} last/>
              : proj.contacts.map((c,i)=>(
                <ListRow key={i}
                  left={<Avatar init={c.split(" ").map(n=>n[0]).join("")} size={34} color={iOS.blue}/>}
                  title={c} showChevron={false} last={i===proj.contacts.length-1}/>
              ))}
          </Section>

          {/* Comps */}
          <Section header={`Comparables (${pComps.length})`}
            footer="Ranked by Industrial Profitability Score™">
            {scored.length===0 && <ListRow title="No comps yet" showChevron={false} last/>}
            {scored.map((c,i)=>(
              <ListRow key={c.id}
                left={<span style={{width:28,height:28,borderRadius:8,background:i===0?iOS.green:iOS.blue,
                  color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</span>}
                title={c.name} subtitle={`$${c.rent}/sqft · ${c.sqft.toLocaleString()} sqft`}
                right={<ScoreChip score={c.score}/>} showChevron={false} last={i===scored.length-1}/>
            ))}
          </Section>
          <div style={{padding:"0 0 8px"}}>
            <IOSBtn onPress={()=>setCompSheet(true)} variant="tinted" full>+ Add Comparable</IOSBtn>
          </div>

          {/* KSD Horizontal Bar Comparison */}
          {scored.length>=1 && (
            <Section header="KSD Score Comparison">
              {/* Legend */}
              <div style={{
                padding:"10px 14px 4px",
                display:"flex", gap:12, flexWrap:"wrap",
                borderBottom:`0.5px solid ${iOS.separator}`,
              }}>
                {scored.map((c,i)=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:10,height:10,borderRadius:2,background:colors[i]??iOS.label3,flexShrink:0}}/>
                    <span style={{fontSize:11,color:iOS.label2,fontWeight:500}}>{c.name}</span>
                  </div>
                ))}
              </div>
              {/* Rows — one per KSD dimension */}
              {KSD.map((k,ki)=>(
                <div key={k.id} style={{
                  padding:"9px 14px",
                  borderBottom: ki<KSD.length-1 ? `0.5px solid ${iOS.separator}` : "none",
                }}>
                  {/* Dimension label */}
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:7}}>
                    <Icon name={k.icon} size={11} color={iOS.label3}/>
                    <span style={{fontSize:11,fontWeight:600,color:iOS.label2,textTransform:"uppercase",letterSpacing:".04em"}}>
                      {k.label}
                    </span>
                    <span style={{fontSize:10,color:iOS.label3,marginLeft:"auto"}}>Wt {W[k.id]}%</span>
                  </div>
                  {/* One bar per comp */}
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {scored.map((c,ci)=>{
                      const val=c.scores[k.id]??0;
                      const pct=(val/10)*100;
                      const col=colors[ci]??iOS.label3;
                      return (
                        <div key={c.id} style={{display:"flex",alignItems:"center",gap:8}}>
                          {/* Bar track */}
                          <div style={{flex:1,height:6,borderRadius:3,background:iOS.bg4,overflow:"hidden"}}>
                            <div style={{
                              height:"100%", width:`${pct}%`,
                              background:col, borderRadius:3,
                              transition:"width .4s ease",
                            }}/>
                          </div>
                          {/* Value */}
                          <span style={{
                            fontSize:11,fontWeight:700,color:col,
                            minWidth:16,textAlign:"right",
                          }}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* ══ TASKS ══ */}
          <div style={{marginTop:8}}>
            <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",
              padding:"0 4px 5px",color:iOS.label3}}>Tasks</div>
            <TasksPanel
              tasks={tasks} setTasks={setTasks}
              filterKey="projectId" filterId={proj.id}
              sites_all={sites_all} projects_all={projects}
              toast={toast} inline/>
          </div>

        </div>

        {/* Add comp sheet */}
        <Sheet open={compSheet} onClose={()=>setCompSheet(false)} title="Add Comparable" detent="large">
          <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
            <Field label="Name" value={cf.name} onChange={v=>setCf(f=>({...f,name:v}))} placeholder="Comp D – Location Name"/>
            <Field label="Address" value={cf.addr} onChange={v=>setCf(f=>({...f,addr:v}))} placeholder="123 Trade Blvd"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Sqft" value={cf.sqft} onChange={v=>setCf(f=>({...f,sqft:v}))} placeholder="90000"/>
              <Field label="Rent $/sqft" value={cf.rent} onChange={v=>setCf(f=>({...f,rent:v}))} placeholder="9.50"/>
            </div>
            <div style={{background:iOS.bg3,borderRadius:12,padding:16}}>
              <div style={{...T.caption,textTransform:"uppercase",letterSpacing:".06em",color:iOS.label2,marginBottom:14}}>KSD Scores (0–10)</div>
              {KSD.map(k=>(
                <div key={k.id} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{...T.subhead,display:"flex",alignItems:"center",gap:6}}>
                      <Icon name={k.icon} size={14} color={iOS.label2}/>{k.label}
                    </span>
                    <span style={{fontWeight:700,color:iOS.blue,fontSize:16}}>{cf.scores[k.id]}</span>
                  </div>
                  <input type="range" min={0} max={10} value={cf.scores[k.id]}
                    onChange={e=>setCf(f=>({...f,scores:{...f.scores,[k.id]:+e.target.value}}))}
                    style={{accentColor:iOS.blue}}/>
                </div>
              ))}
              <div style={{textAlign:"center",marginTop:8}}>
                <ScoreChip score={calcIPS(cf.scores)}/><span style={{...T.caption,marginLeft:8}}>Projected IPS™</span>
              </div>
            </div>
            <IOSBtn onPress={addComp} full>Add Comparable</IOSBtn>
          </div>
        </Sheet>
      </div>
    );
  }

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", background:"#000", position:"relative"}}>
      <NavBar title="Projects" large
        rightItem={<button onClick={()=>setSheet(true)} style={{background:"none",border:"none",
          color:iOS.blue,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:22,fontWeight:300}}>+</span> New
        </button>}/>
      <div style={{flex:1,overflowY:"auto",padding:"0 14px 20px"}}>
        <Section>
          {projects.map((p,i)=>{
            const site=sites.find(s=>s.id===p.siteId);
            const pc=comps.filter(c=>p.comps.includes(c.id));
            return <ListRow key={p.id}
              left={<IconBox name="folder" color={iOS.blue} boxSize={40} radius={12}/>}
              title={p.name} subtitle={`${site?.name??""} · ${pc.length} comps`}
              right={<Badge label={p.stage} color={STAGE_COLOR[p.stage]??iOS.label3}/>}
              onPress={()=>setSel(p.id)} last={i===projects.length-1}/>;
          })}
        </Section>
      </div>

      <Sheet open={sheet} onClose={()=>setSheet(false)} title="New Project" detent="medium">
        <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
          <Field label="Project Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Project Apex"/>
          <IOSSelect label="Linked Site" value={form.siteId} onChange={v=>setForm(f=>({...f,siteId:v}))}
            options={[{value:"",label:"— Select a site —"},...sites.map(s=>({value:s.id,label:s.name}))]}/>
          <IOSSelect label="Stage" value={form.stage} onChange={v=>setForm(f=>({...f,stage:v}))}
            options={["Initial Outreach","Letter of Intent","Due Diligence","Negotiation","Closed"]}/>
          <IOSBtn onPress={addProject} full>Create Project</IOSBtn>
        </div>
      </Sheet>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MEDIA SECTION
═══════════════════════════════════════════════════════ */
function MediaSection({ tourId, compId, items, onAdd, onRemove }) {
  const fileInputRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map(f => ({
      id: "m" + Date.now() + Math.random().toString(36).slice(2),
      type: f.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
    }));
    onAdd(tourId, compId, newItems);
    e.target.value = "";
  };

  useEffect(() => {
    const captured = items;
    return () => {
      captured.forEach(item => { try { URL.revokeObjectURL(item.url); } catch {} });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ marginBottom: 16 }}>
      <Section header="Site Photos & Videos">
        <div style={{ padding: "12px 16px" }}>
          {items.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8, marginBottom: 12,
            }}>
              {items.map(item => (
                <div key={item.id} style={{
                  position: "relative", aspectRatio: "1",
                  borderRadius: 10, overflow: "hidden", background: iOS.bg3,
                }}>
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: iOS.bg4,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(255,255,255,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14,
                      }}>▶</div>
                    </div>
                  )}
                  {/* Remove button */}
                  <button onClick={() => onRemove(tourId, compId, item.id)}
                    style={{
                      position: "absolute", top: 4, right: 4,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "rgba(0,0,0,0.72)", border: "none",
                      color: "#fff", fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>×</button>
                  {item.type === "video" && (
                    <div style={{
                      position: "absolute", bottom: 4, left: 4,
                      background: "rgba(0,0,0,0.62)", borderRadius: 4,
                      padding: "2px 5px", fontSize: 9, color: "#fff", fontWeight: 700,
                      letterSpacing: ".05em",
                    }}>VIDEO</div>
                  )}
                </div>
              ))}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*,video/*"
            multiple style={{ display: "none" }} onChange={handleFiles}/>
          <IOSBtn variant="tinted" full onPress={() => fileInputRef.current?.click()}>
            {items.length > 0
              ? `${items.length} file${items.length > 1 ? "s" : ""} · Add More`
              : "Add Site Photos & Videos"}
          </IOSBtn>
        </div>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMP (PROPERTY) SUB-NAV
═══════════════════════════════════════════════════════ */
function CompSubNav({tab, setTab}) {
  const TABS = [
    {id:"photos",   icon:"camera",   label:"Photos"  },
    {id:"building", icon:"building", label:"Building"},
    {id:"docs",     icon:"folder",   label:"Docs"    },
    {id:"scoring",  icon:"chart",    label:"Scoring" },
  ];
  return (
    <div style={{
      flexShrink:0, padding:"6px 16px",
      background:iOS.bg2, borderBottom:`0.5px solid ${iOS.separator}`,
    }}>
      <div style={{
        display:"flex", background:iOS.bg3,
        borderRadius:10, padding:3, height:40, alignItems:"center",
      }}>
        {TABS.map(t=>{
          const active=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} className="pressable"
              style={{
                flex:1, height:"100%", border:"none", borderRadius:8,
                background:active?iOS.blue:"transparent",
                color:active?"#ffffff":iOS.label2,
                display:"flex", alignItems:"center", justifyContent:"center",
                gap:5, fontSize:12, fontWeight:active?600:400,
                cursor:"pointer", transition:"background .18s, color .18s", padding:"0 4px",
              }}>
              <Icon name={t.icon} size={13} color={active?"#fff":iOS.label2}/>
              <span style={{whiteSpace:"nowrap"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOUR SUB-NAV (segmented control)
═══════════════════════════════════════════════════════ */
function TourSubNav({tab, setTab}) {
  const TABS = [
    {id:"map",        icon:"map",      label:"Map"       },
    {id:"properties", icon:"building", label:"Properties"},
    {id:"people",     icon:"people",   label:"People"    },
    {id:"scores",     icon:"chart",    label:"Scores"    },
  ];
  return (
    <div style={{
      flexShrink:0, padding:"6px 16px",
      background:iOS.bg2, borderBottom:`0.5px solid ${iOS.separator}`,
    }}>
      <div style={{
        display:"flex", background:iOS.bg3,
        borderRadius:10, padding:3, height:40, alignItems:"center",
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} className="pressable"
              style={{
                flex:1, height:"100%", border:"none", borderRadius:8,
                background:active ? iOS.blue : "transparent",
                color:active ? "#ffffff" : iOS.label2,
                display:"flex", alignItems:"center", justifyContent:"center",
                gap:5, fontSize:12, fontWeight:active?600:400,
                cursor:"pointer", transition:"background .18s, color .18s",
                padding:"0 4px",
              }}>
              <Icon name={t.icon} size={13} color={active?"#fff":iOS.label2}/>
              <span style={{whiteSpace:"nowrap"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOURS
═══════════════════════════════════════════════════════ */
function Tours({user, tours, setTours, projects, comps, toast}) {
  const [activeTour,setActiveTour]=useState(user.role==="guest"?tours[0]?.id:null);
  const [activeComp,setActiveComp]=useState(null);
  const [inviteSheet,setInviteSheet]=useState(false);
  const [newSheet,setNewSheet]=useState(false);
  const [invEmail,setInvEmail]=useState("");
  const [invRole,setInvRole]=useState("");
  const [ntForm,setNtForm]=useState({name:"",pid:"",date:"",comps:[],times:{}});
  const [scores,setScores]=useState(()=>{
    const init={};
    tours.forEach(t=>{
      init[t.id]={};
      t.contacts.forEach(tc=>{
        init[t.id][tc.id]={};
        comps.filter(c=>t.comps.includes(c.id)).forEach(c=>{init[t.id][tc.id][c.id]={...c.scores};});
      });
    });
    return init;
  });
  // notes[tourId][compId] = "text"
  const [notes,setNotes]=useState({});
  // media[tourId][compId] = [{id,type,url,name,size}]
  const [media,setMedia]=useState({});
  const [syncing,setSyncing]=useState(false);
  // Sub-nav tab for tour detail view ("map"|"properties"|"people"|"scores")
  const [tourTab,setTourTab]=useState("properties");
  // Sub-nav tab for individual comp/property view
  const [compTab,setCompTab]=useState("scoring");
  // Quick-capture file inputs (comment sheet + photo + video)
  const [commentSheet,setCommentSheet]=useState(false);
  const [commentText,setCommentText]=useState("");
  const quickPhotoRef=useRef(null);
  const quickVideoRef=useRef(null);
  // Reset tabs when navigating
  useEffect(()=>{ setTourTab("properties"); },[activeTour]);
  useEffect(()=>{ setCompTab("scoring"); },[activeComp]);

  /* ── Note helpers ── */
  const getNote=(tourId,compId)=>notes[tourId]?.[compId]??"";
  const setNote=(tourId,compId,text)=>setNotes(prev=>({
    ...prev,[tourId]:{...(prev[tourId]??{}),[compId]:text}
  }));

  /* ── Media helpers ── */
  const getMedia=(tourId,compId)=>media[tourId]?.[compId]??[];
  const addMedia=(tourId,compId,items)=>setMedia(prev=>({
    ...prev,[tourId]:{
      ...(prev[tourId]??{}),
      [compId]:[...(prev[tourId]?.[compId]??[]),...items]
    }
  }));
  const removeMedia=(tourId,compId,itemId)=>setMedia(prev=>({
    ...prev,[tourId]:{
      ...(prev[tourId]??{}),
      [compId]:(prev[tourId]?.[compId]??[]).filter(m=>m.id!==itemId)
    }
  }));

  /* ── Mock sync ── */
  const doSync=()=>{
    setSyncing(true);
    const payload={
      syncedAt:new Date().toISOString(),
      tours:tours.map(t=>({
        id:t.id, name:t.name,
        scores:scores[t.id]??{},
        notes:notes[t.id]??{},
        media:Object.fromEntries(
          Object.entries(media[t.id]??{}).map(([compId,items])=>[
            compId,
            items.map(({id,type,name,size})=>({id,type,name,size}))
          ])
        ),
      })),
    };
    console.log("[REopt] Sync payload:",payload);
    setTimeout(()=>{setSyncing(false);toast("Synced to web ✓");},2000);
  };

  const setScore=(tid,cid,cmpId,kid,val)=>{
    setScores(p=>({...p,[tid]:{...p[tid],[cid]:{...(p[tid]?.[cid]??{}),[cmpId]:{...(p[tid]?.[cid]?.[cmpId]??{}),[kid]:val}}}}));
  };
  const getAvg=(tid,cmpId)=>{
    const t=tours.find(t=>t.id===tid); if(!t)return 0;
    const allS=t.contacts.map(tc=>scores[tid]?.[tc.id]?.[cmpId]??{});
    const avg={};
    KSD.forEach(k=>{const vs=allS.map(s=>s[k.id]??0);avg[k.id]=vs.reduce((a,b)=>a+b,0)/vs.length;});
    return calcIPS(avg);
  };
  const doInvite=()=>{
    if(!invEmail||!activeTour)return;
    const nc={id:"tc"+Date.now(),name:invEmail.split("@")[0],email:invEmail,role:invRole||"Stakeholder"};
    setTours(prev=>prev.map(t=>t.id===activeTour?{...t,contacts:[...t.contacts,nc]}:t));
    setInvEmail(""); setInvRole(""); setInviteSheet(false); toast("Invite sent");
  };
  const addTour=()=>{
    if(!ntForm.name||!ntForm.pid)return;
    setTours(prev=>[...prev,{id:"t"+Date.now(),pid:ntForm.pid,name:ntForm.name,date:ntForm.date||"TBD",status:"Scheduled",contacts:[],comps:ntForm.comps,times:ntForm.times}]);
    setNewSheet(false); setNtForm({name:"",pid:"",date:"",comps:[],times:{}}); toast("Tour created");
  };

  const tour=tours.find(t=>t.id===activeTour);
  const comp=tour?comps.find(c=>c.id===activeComp):null;

  /* ── Property detail view (inside a tour) ── */
  if(comp&&tour){
    const myTC=tour.contacts[0];
    const myS=myTC?(scores[tour.id]?.[myTC.id]?.[comp.id]??{}):{};
    const live=calcIPS(myS);
    const col=live>=7.5?iOS.green:live>=5?iOS.orange:iOS.red;
    const compMedia=getMedia(tour.id,comp.id);
    const apptTime=tour.times?.[comp.id];

    const handleQuickPhoto=e=>{
      const files=Array.from(e.target.files);
      if(!files.length)return;
      addMedia(tour.id,comp.id,files.map(f=>({
        id:"m"+Date.now()+Math.random().toString(36).slice(2),
        type:f.type.startsWith("video/")?"video":"image",
        url:URL.createObjectURL(f),name:f.name,size:f.size,
      })));
      e.target.value="";
      setCompTab("photos");
      toast("Photo added");
    };
    const handleQuickVideo=e=>{
      const files=Array.from(e.target.files);
      if(!files.length)return;
      addMedia(tour.id,comp.id,files.map(f=>({
        id:"m"+Date.now()+Math.random().toString(36).slice(2),
        type:"video",
        url:URL.createObjectURL(f),name:f.name,size:f.size,
      })));
      e.target.value="";
      setCompTab("photos");
      toast("Video added");
    };
    const submitComment=()=>{
      if(!commentText.trim())return;
      setNote(tour.id,comp.id,
        (getNote(tour.id,comp.id)?getNote(tour.id,comp.id)+"\n\n":"")
        +"— "+new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})
        +"\n"+commentText.trim()
      );
      setCommentText("");
      setCommentSheet(false);
      toast("Comment added");
    };

    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#000",animation:"slideR .28s ease",position:"relative"}}>
        {/* Hidden file inputs for quick capture */}
        <input ref={quickPhotoRef} type="file" accept="image/*" multiple
          style={{display:"none"}} onChange={handleQuickPhoto}/>
        <input ref={quickVideoRef} type="file" accept="video/*" multiple
          style={{display:"none"}} onChange={handleQuickVideo}/>

        {/* NavBar */}
        <NavBar title={comp.name} onBack={()=>setActiveComp(null)} backLabel="Properties"
          rightItem={
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {apptTime&&<Badge label={apptTime} color={iOS.teal}/>}
              <ScoreChip score={live}/>
            </div>
          }/>

        {/* Comp sub-nav */}
        <CompSubNav tab={compTab} setTab={setCompTab}/>

        {/* Scrollable content — paddingBottom leaves room for sticky bar */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px 96px"}}>

          {/* ══ PHOTOS ══ */}
          {compTab==="photos" && (
            <div>
              {compMedia.length>0 ? (
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
                  {compMedia.map(item=>(
                    <div key={item.id} style={{position:"relative",aspectRatio:"1",borderRadius:10,overflow:"hidden",background:iOS.bg3}}>
                      {item.type==="image"
                        ?<img src={item.url} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
                            justifyContent:"center",background:iOS.bg4}}>
                            <span style={{fontSize:24,opacity:.8}}>▶</span>
                          </div>
                      }
                      <button onClick={()=>removeMedia(tour.id,comp.id,item.id)}
                        style={{position:"absolute",top:4,right:4,width:22,height:22,borderRadius:"50%",
                          background:"rgba(0,0,0,0.72)",border:"none",color:"#fff",fontSize:13,
                          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                      {item.type==="video"&&(
                        <div style={{position:"absolute",bottom:4,left:4,background:"rgba(0,0,0,0.62)",
                          borderRadius:4,padding:"2px 5px",fontSize:9,color:"#fff",fontWeight:700}}>VIDEO</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{background:iOS.bg2,borderRadius:14,padding:48,textAlign:"center",
                  marginBottom:16,border:`1px dashed ${iOS.separator}`}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                    <Icon name="camera" size={40} color={iOS.label3}/>
                  </div>
                  <div style={{...T.headline,marginBottom:6}}>No Photos Yet</div>
                  <div style={{...T.footnote,color:iOS.label2}}>
                    Use the buttons below to add photos or video
                  </div>
                </div>
              )}
              <IOSBtn variant="tinted" color={iOS.teal} full onPress={()=>quickPhotoRef.current?.click()}>
                {compMedia.length>0?`${compMedia.length} file${compMedia.length>1?"s":""} · Add More`:"Add Photos & Videos"}
              </IOSBtn>
            </div>
          )}

          {/* ══ BUILDING INFO ══ */}
          {compTab==="building" && (
            <div>
              <Section header="Overview">
                {[
                  {l:"Address",        v:comp.addr},
                  {l:"Square Footage", v:comp.sqft.toLocaleString()+" sqft"},
                  {l:"Clear Height",   v:comp.ch+"'"},
                  {l:"Asking Rent",    v:`$${comp.rent}/sqft`},
                ].map((d,i,arr)=>(
                  <ListRow key={d.l} title={d.l}
                    right={<span style={{...T.subhead,color:iOS.label2,maxWidth:160,textAlign:"right",
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.v}</span>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Specifications">
                {[
                  {icon:"door",    label:"Dock Doors",      val:"18"},
                  {icon:"car",     label:"Drive-In Doors",   val:"2"},
                  {icon:"bolt",    label:"Power",             val:"1,200A / 480V"},
                  {icon:"fire",    label:"Fire Suppression",  val:"ESFR"},
                  {icon:"truck",   label:"Truck Court",       val:"130 ft"},
                  {icon:"grid",    label:"Column Spacing",    val:"50' × 48'"},
                ].map((d,i,arr)=>(
                  <ListRow key={d.label}
                    left={<div style={{width:32,height:32,borderRadius:8,background:iOS.bg3,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon name={d.icon} size={16} color={iOS.label2}/>
                    </div>}
                    title={d.label}
                    right={<span style={{...T.subhead,color:iOS.label2}}>{d.val}</span>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Location">
                <ListRow title="Open in Maps" subtitle={comp.addr}
                  onPress={()=>window.open(`https://maps.google.com/?q=${encodeURIComponent(comp.addr)}`,"_blank")}
                  left={<IconBox name="map" color={iOS.blue}/>}
                  last/>
              </Section>
            </div>
          )}

          {/* ══ DOCUMENTS ══ */}
          {compTab==="docs" && (
            <div>
              <Section header="Property Documents">
                {[
                  {name:"Property Brochure.pdf",    sub:"Jan 2025 · 3.2 MB"},
                  {name:"Offering Memorandum.pdf",  sub:"Dec 2024 · 8.1 MB"},
                  {name:"Lease Abstract.pdf",        sub:"Nov 2024 · 1.4 MB"},
                ].map((d,i,arr)=>(
                  <ListRow key={d.name}
                    left={<IconBox name="doc" color={iOS.orange}/>}
                    title={d.name} subtitle={d.sub}
                    right={<DocActions name={d.name} onToast={toast}/>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <Section header="Due Diligence">
                {[
                  {name:"Phase I Environmental.pdf",     sub:"Oct 2024 · 5.4 MB"},
                  {name:"Property Condition Report.pdf", sub:"Sep 2024 · 2.9 MB"},
                  {name:"Survey & Legal Description.pdf",sub:"Aug 2024 · 1.1 MB"},
                ].map((d,i,arr)=>(
                  <ListRow key={d.name}
                    left={<IconBox name="checklist" color={iOS.green}/>}
                    title={d.name} subtitle={d.sub}
                    right={<DocActions name={d.name} onToast={toast}/>}
                    showChevron={false} last={i===arr.length-1}/>
                ))}
              </Section>
              <IOSBtn variant="tinted" color={iOS.teal} full onPress={()=>toast("Upload document…")}>
                + Upload Document
              </IOSBtn>
            </div>
          )}

          {/* ══ SCORING ══ */}
          {compTab==="scoring" && (
            <div>
              {/* Hero score */}
              <div style={{background:iOS.bg2,borderRadius:16,padding:20,textAlign:"center",
                marginBottom:20,border:`1px solid ${col}33`}}>
                <div style={{...T.caption2,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>IPS™ SCORE</div>
                <div style={{fontSize:72,fontWeight:700,color:col,letterSpacing:"-3px",lineHeight:1,marginBottom:8}}>
                  {live.toFixed(2)}
                </div>
                <div style={{...T.footnote,color:iOS.label3,marginBottom:12}}>
                  {comp.sqft.toLocaleString()} sqft · ${comp.rent}/sqft
                </div>
                {/* Mini progress bar */}
                <div style={{height:6,borderRadius:3,background:iOS.bg4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(live/10)*100}%`,background:col,borderRadius:3,transition:"width .4s ease"}}/>
                </div>
              </div>

              {/* KSD Sliders */}
              <Section header="KSD Ratings">
                <div style={{padding:"8px 16px"}}>
                  {KSD.map((k,i)=>{
                    const val=myS[k.id]??0;
                    const c=val>=7?iOS.green:val>=4?iOS.orange:iOS.red;
                    return (
                      <div key={k.id} style={{marginBottom:i<KSD.length-1?20:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <span style={{...T.subhead,display:"flex",alignItems:"center",gap:6}}>
                            <Icon name={k.icon} size={14} color={iOS.label2}/>{k.label}
                          </span>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{...T.caption,color:iOS.label3}}>Wt:{W[k.id]}%</span>
                            <span style={{fontSize:18,fontWeight:700,color:c,minWidth:24,textAlign:"right"}}>{val}</span>
                          </div>
                        </div>
                        <input type="range" value={val} min={0} max={10}
                          onChange={e=>myTC&&setScore(tour.id,myTC.id,comp.id,k.id,+e.target.value)}
                          style={{accentColor:c}}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                          <span style={{...T.caption2}}>Low</span>
                          <span style={{...T.caption2}}>Contribution: {((W[k.id]/100)*val).toFixed(2)}</span>
                          <span style={{...T.caption2}}>High</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Tour notes / comments */}
              {getNote(tour.id,comp.id) && (
                <Section header="Comments & Notes">
                  <div style={{padding:"12px 16px"}}>
                    <div style={{...T.subhead,color:iOS.label2,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                      {getNote(tour.id,comp.id)}
                    </div>
                  </div>
                </Section>
              )}

              {/* Save & Sync */}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
                <IOSBtn onPress={()=>{setActiveComp(null);toast("Scores saved");}} full>
                  Save & Return
                </IOSBtn>
                <IOSBtn variant="tinted" color={iOS.green} full disabled={syncing} onPress={doSync}>
                  {syncing
                    ? <><span style={{display:"inline-block",width:14,height:14,borderRadius:"50%",
                        border:"2px solid rgba(48,209,88,0.3)",borderTopColor:iOS.green,
                        animation:"spin 0.7s linear infinite",marginRight:6}}/> Syncing…</>
                    : "Sync to Web"}
                </IOSBtn>
              </div>
            </div>
          )}

        </div>{/* end scroll container */}

        {/* ── Sticky action bar ── */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          background:`${iOS.bg2}f0`, backdropFilter:"blur(20px)",
          borderTop:`0.5px solid ${iOS.separator}`,
          padding:"10px 16px 16px",
          display:"flex", gap:10,
        }}>
          {[
            {label:"Comment", icon:"speech", color:iOS.blue,   onClick:()=>{setCommentText("");setCommentSheet(true);}},
            {label:"Photo",   icon:"camera", color:iOS.teal,   onClick:()=>quickPhotoRef.current?.click()},
            {label:"Video",   icon:"video",  color:iOS.indigo, onClick:()=>quickVideoRef.current?.click()},
          ].map(b=>(
            <button key={b.label} className="pressable" onClick={b.onClick}
              style={{
                flex:1, padding:"10px 8px", border:"none", borderRadius:12,
                background:iOS.bg3, color:iOS.label, fontSize:12, fontWeight:600,
                cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", gap:5,
              }}>
              <div style={{width:32,height:32,borderRadius:10,background:`${b.color}20`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon name={b.icon} size={16} color={b.color}/>
              </div>
              <span style={{color:iOS.label2}}>{b.label}</span>
            </button>
          ))}
        </div>

        {/* Comment sheet */}
        <Sheet open={commentSheet} onClose={()=>setCommentSheet(false)} title="Add Comment" detent="medium">
          <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
            <div style={{background:iOS.bg3,borderRadius:12,padding:"12px 16px"}}>
              <textarea value={commentText} onChange={e=>setCommentText(e.target.value)}
                placeholder="Observations, red flags, highlights…"
                autoFocus
                style={{width:"100%",minHeight:120,background:"transparent",border:"none",
                  fontSize:16,color:iOS.label,outline:"none",lineHeight:1.6}}/>
            </div>
            <IOSBtn onPress={submitComment} full disabled={!commentText.trim()}>
              Add Comment
            </IOSBtn>
          </div>
        </Sheet>

      </div>
    );
  }

  /* ── Tour detail ── */
  if(tour){
    const tComps=comps.filter(c=>tour.comps.includes(c.id));
    const barData=tComps.map(c=>({name:c.name,avg:parseFloat(getAvg(tour.id,c.id).toFixed(2))})).sort((a,b)=>b.avg-a.avg);
    const radarColors=[iOS.green,iOS.blue,iOS.orange];
    const radarData=KSD.map(k=>{
      const entry={subject:k.label};
      tComps.forEach(c=>{
        const allS=tour.contacts.map(tc=>scores[tour.id]?.[tc.id]?.[c.id]??{});
        const vals=allS.map(s=>s[k.id]??0);
        entry[c.name]=vals.length>0 ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
      });
      return entry;
    });

    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#000",position:"relative",animation:"slideR .28s ease"}}>
        <NavBar title={tour.name} onBack={user.role!=="guest"?()=>setActiveTour(null):null} backLabel="Tours"
          rightItem={<Badge label={tour.status} color={tour.status==="In Progress"?iOS.orange:iOS.blue}/>}/>

        {/* Segmented sub-nav — pinned, never scrolls */}
        <TourSubNav tab={tourTab} setTab={setTourTab}/>

        {/* Scrollable tab content */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px 28px"}}>

          {/* ══ MAP ══ */}
          {tourTab==="map" && (
            <div>
              {tComps.length===0 ? (
                <div style={{textAlign:"center",padding:"48px 24px",color:iOS.label3,fontSize:15}}>
                  No properties assigned to this tour.
                </div>
              ) : (
                <>
                  {/* Single map showing all properties */}
                  <div style={{
                    borderRadius:14, overflow:"hidden",
                    border:`0.5px solid ${iOS.separator}`, marginBottom:16,
                  }}>
                    <iframe
                      title="Tour properties map"
                      width="100%"
                      height="260"
                      style={{display:"block",border:"none"}}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(tComps.map(c=>c.addr).join(" | "))}&output=embed`}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  {/* Property list below the map */}
                  <Section header={`${tComps.length} Propert${tComps.length===1?"y":"ies"} on This Tour`}>
                    {tComps.map((c,i)=>(
                      <ListRow key={c.id}
                        left={
                          <div style={{
                            width:32,height:32,borderRadius:8,
                            background:([`${iOS.green}22`,`${iOS.blue}22`,`${iOS.orange}22`][i]??`${iOS.indigo}22`),
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:16,fontWeight:700,
                            color:[iOS.green,iOS.blue,iOS.orange][i]??iOS.indigo,
                          }}>{i+1}</div>
                        }
                        title={c.name}
                        subtitle={c.addr}
                        right={
                          <button className="pressable"
                            onClick={e=>{
                              e.stopPropagation();
                              window.open(`https://maps.google.com/?q=${encodeURIComponent(c.addr)}`,"_blank");
                            }}
                            style={{
                              background:`${iOS.blue}22`,border:"none",borderRadius:8,
                              color:iOS.blue,fontSize:12,fontWeight:600,
                              padding:"5px 10px",cursor:"pointer",whiteSpace:"nowrap",
                            }}>
                            Directions
                          </button>
                        }
                        showChevron={false}
                        last={i===tComps.length-1}
                      />
                    ))}
                  </Section>
                </>
              )}
            </div>
          )}

          {/* ══ PROPERTIES ══ */}
          {tourTab==="properties" && (
            <div>
              {/* Tour date header */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"0 4px 12px",
              }}>
                <div style={{...T.title3}}>{tour.date}</div>
                <Badge label={tour.status} color={tour.status==="In Progress"?iOS.orange:iOS.blue}/>
              </div>

              {tComps.length===0
                ? <Section><ListRow title="No properties assigned" showChevron={false} last/></Section>
                : tComps.map((c,i)=>{
                    const avg=getAvg(tour.id,c.id);
                    const apptTime=tour.times?.[c.id];
                    const colors=[iOS.green,iOS.blue,iOS.orange,iOS.indigo,iOS.teal];
                    const numColor=colors[i]??iOS.label3;
                    const isLast=i===tComps.length-1;
                    return (
                      <div key={c.id} style={{marginBottom:isLast?0:12}}>
                        {/* Time label */}
                        {apptTime && (
                          <div style={{
                            display:"flex", alignItems:"center", gap:8,
                            padding:"0 4px 6px",
                          }}>
                            <Icon name="clock" size={12} color={iOS.label3}/>
                            <span style={{...T.footnote, color:iOS.label2, fontWeight:600}}>
                              {apptTime}
                            </span>
                            <div style={{flex:1, height:"0.5px", background:iOS.separator}}/>
                          </div>
                        )}
                        {/* Property card */}
                        <div style={{
                          background:iOS.bg2, borderRadius:14,
                          overflow:"hidden", border:`0.5px solid ${iOS.separator}`,
                        }}
                          onClick={()=>setActiveComp(c.id)}
                          className="pressable"
                        >
                          <div style={{display:"flex", alignItems:"center", gap:12, padding:"14px 16px"}}>
                            {/* Number badge */}
                            <div style={{
                              width:36, height:36, borderRadius:10, flexShrink:0,
                              background:`${numColor}22`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:18, fontWeight:700, color:numColor,
                            }}>{i+1}</div>
                            {/* Text */}
                            <div style={{flex:1, minWidth:0}}>
                              <div style={{...T.headline, marginBottom:2,
                                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                                {c.name}
                              </div>
                              <div style={{...T.footnote, color:iOS.label2,
                                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                                {c.addr}
                              </div>
                              <div style={{display:"flex", gap:6, marginTop:6}}>
                                <Badge label={`${c.sqft.toLocaleString()} sqft`} color={iOS.blue}/>
                                <Badge label={`$${c.rent}/sqft`} color={iOS.orange}/>
                              </div>
                            </div>
                            {/* Score or CTA */}
                            <div style={{flexShrink:0, display:"flex", flexDirection:"column",
                              alignItems:"flex-end", gap:6}}>
                              {avg>0
                                ? <ScoreChip score={avg}/>
                                : <Badge label="Score →" color={iOS.blue}/>}
                              <span style={{color:iOS.label3, fontSize:17, fontWeight:500}}>›</span>
                            </div>
                          </div>
                          {/* Progress strip */}
                          <div style={{height:3, background:iOS.bg4}}>
                            <div style={{
                              height:"100%",
                              width:avg>0?`${(avg/10)*100}%`:"0%",
                              background:avg>=7.5?iOS.green:avg>=5?iOS.orange:iOS.red,
                              transition:"width .4s ease",
                            }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* ══ PEOPLE ══ */}
          {tourTab==="people" && (
            <div>
              <Section header={`Stakeholders (${tour.contacts.length})`}>
                {tour.contacts.length===0&&<ListRow title="No contacts yet" showChevron={false} last/>}
                {tour.contacts.map((tc,i)=>{
                  const sc=tComps.some(c=>Object.keys(scores[tour.id]?.[tc.id]?.[c.id]??{}).length>0);
                  return <ListRow key={tc.id}
                    left={<Avatar init={tc.name.split(" ").map(n=>n[0]).join("")} size={36} color={sc?iOS.green:iOS.label3}/>}
                    title={tc.name} subtitle={`${tc.role} · ${tc.email}`}
                    right={<Badge label={sc?"Scored":"Pending"} color={sc?iOS.green:iOS.label3}/>}
                    showChevron={false} last={i===tour.contacts.length-1}/>;
                })}
              </Section>
              {user.role!=="guest"&&(
                <div style={{marginBottom:12}}>
                  <IOSBtn variant="tinted" full onPress={()=>setInviteSheet(true)}>Invite Stakeholder</IOSBtn>
                </div>
              )}
              <div style={{marginBottom:20}}>
                <IOSBtn variant={syncing?"gray":"filled"} color={iOS.green} full disabled={syncing} onPress={doSync}>
                  {syncing
                    ? <><span style={{display:"inline-block",width:14,height:14,borderRadius:"50%",
                        border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",
                        animation:"spin 0.7s linear infinite",marginRight:6}}/> Syncing…</>
                    : "Sync to Web"}
                </IOSBtn>
              </div>
            </div>
          )}

          {/* ══ SCORES ══ */}
          {tourTab==="scores" && (
            <div>
              {/* Score cards — one per comp */}
              {tComps.length>0 && (
                <div style={{marginBottom:24}}>
                  <div style={{...T.footnote,textTransform:"uppercase",letterSpacing:".04em",
                    padding:"0 0 6px",color:iOS.label2}}>Comp Score Cards</div>
                  {tComps.map(c=>{
                    const avg=getAvg(tour.id,c.id);
                    const col=avg>=7.5?iOS.green:avg>=5?iOS.orange:iOS.red;
                    const allS=tour.contacts.map(tc=>scores[tour.id]?.[tc.id]?.[c.id]??{});
                    const dimAvg={};
                    KSD.forEach(k=>{
                      const vs=allS.map(s=>s[k.id]??0);
                      dimAvg[k.id]=vs.length>0?vs.reduce((a,b)=>a+b,0)/vs.length:0;
                    });
                    return (
                      <div key={c.id} style={{
                        background:iOS.bg2,borderRadius:14,padding:16,marginBottom:12,
                        border:`0.5px solid ${col}33`,
                      }}>
                        {/* Header */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <div>
                            <div style={{...T.headline}}>{c.name}</div>
                            <div style={{...T.caption,color:iOS.label2,marginTop:2}}>{c.addr}</div>
                          </div>
                          <ScoreChip score={avg} large/>
                        </div>
                        {/* KSD mini bars — 2-col grid */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px"}}>
                          {KSD.map(k=>{
                            const val=dimAvg[k.id];
                            const contribution=(W[k.id]/100)*val;
                            const barCol=val>=7?iOS.green:val>=4?iOS.orange:iOS.red;
                            return (
                              <div key={k.id}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                                  <span style={{...T.caption2,color:iOS.label2,display:"flex",alignItems:"center",gap:3}}>
                                  <Icon name={k.icon} size={10} color={iOS.label2}/>{k.label}
                                </span>
                                  <span style={{...T.caption2,color:barCol,fontWeight:600}}>{contribution.toFixed(2)}</span>
                                </div>
                                <div style={{height:4,borderRadius:2,background:iOS.bg4,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${(val/10)*100}%`,background:barCol,borderRadius:2,transition:"width .3s ease"}}/>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bar chart — Group Consensus */}
              {barData.some(d=>d.avg>0) && (
                <Section header="Group Consensus · Avg IPS™">
                  <div style={{padding:"16px 8px"}}>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={barData} barSize={36}>
                        <CartesianGrid strokeDasharray="3 3" stroke={iOS.separator}/>
                        <XAxis dataKey="name" tick={{fontSize:10,fill:iOS.label2}}/>
                        <YAxis domain={[0,10]} tick={{fontSize:10,fill:iOS.label2}} width={20}/>
                        <Tooltip formatter={v=>[v.toFixed(2),"Avg IPS™"]}
                          contentStyle={{background:iOS.bg3,border:`1px solid ${iOS.separator}`,borderRadius:10}}
                          labelStyle={{color:iOS.label}} itemStyle={{color:iOS.label2}}/>
                        <Bar dataKey="avg" radius={[6,6,0,0]}>
                          {barData.map((_,i)=><Cell key={i} fill={[iOS.green,iOS.blue,iOS.orange][i]??iOS.label3}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {/* Radar chart — KSD comparison (2+ comps only) */}
              {tComps.length>=2 && (
                <Section header="KSD Radar · All Comps">
                  <div style={{padding:"16px 8px"}}>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={iOS.separator}/>
                        <PolarAngleAxis dataKey="subject" tick={{fontSize:9,fill:iOS.label2}}/>
                        <PolarRadiusAxis domain={[0,10]} tick={false} axisLine={false}/>
                        {tComps.map((c,i)=>(
                          <Radar key={c.id} name={c.name} dataKey={c.name}
                            stroke={radarColors[i]??iOS.label3} fill={radarColors[i]??iOS.label3}
                            fillOpacity={0.18} strokeWidth={2}/>
                        ))}
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,color:iOS.label2}}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {/* Empty state */}
              {!barData.some(d=>d.avg>0) && (
                <div style={{textAlign:"center",padding:"48px 24px",color:iOS.label3,fontSize:15}}>
                  No scores yet. Tap a property in the Properties tab to start scoring.
                </div>
              )}
            </div>
          )}

        </div>{/* end scroll container */}

        {/* Invite sheet — outside scroll, position:absolute via Sheet */}
        <Sheet open={inviteSheet} onClose={()=>setInviteSheet(false)} title="Invite Stakeholder">
          <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
            <Field label="Email" value={invEmail} onChange={setInvEmail} type="email" placeholder="name@company.com"/>
            <Field label="Role / Title" value={invRole} onChange={setInvRole} placeholder="e.g. CFO, VP Operations"/>
            <IOSBtn onPress={doInvite} full>Send Invite</IOSBtn>
          </div>
        </Sheet>
      </div>
    );
  }

  /* ── Tour list ── */
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#000",position:"relative"}}>
      <NavBar title="Tours" large
        rightItem={user.role!=="guest"?<button onClick={()=>setNewSheet(true)} style={{background:"none",border:"none",
          color:iOS.blue,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:22,fontWeight:300}}>+</span> New
        </button>:null}/>
      <div style={{flex:1,overflowY:"auto",padding:"0 14px 20px"}}>
        <Section>
          {tours.map((t,i)=>{
            const proj=projects.find(p=>p.id===t.pid);
            const isLive=t.status==="In Progress";
            return <ListRow key={t.id}
              left={<IconBox name="map" color={isLive?iOS.orange:iOS.blue} boxSize={40} radius={12}/>}
              title={t.name} subtitle={`${proj?.name} · ${t.date}`}
              right={<Badge label={t.status} color={isLive?iOS.orange:iOS.blue}/>}
              onPress={()=>setActiveTour(t.id)} last={i===tours.length-1}/>;
          })}
        </Section>
      </div>

      <Sheet open={newSheet} onClose={()=>setNewSheet(false)} title="New Tour" detent="large">
        <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
          <Field label="Tour Name" value={ntForm.name} onChange={v=>setNtForm(f=>({...f,name:v}))} placeholder="e.g. Atlas Site Tour"/>
          <IOSSelect label="Linked Project" value={ntForm.pid} onChange={v=>setNtForm(f=>({...f,pid:v}))}
            options={[{value:"",label:"— Select project —"},...projects.map(p=>({value:p.id,label:p.name}))]}/>
          <Field label="Date" value={ntForm.date} onChange={v=>setNtForm(f=>({...f,date:v}))} placeholder="e.g. Feb 28, 2025"/>
          {ntForm.pid&&(()=>{
            const avail=comps.filter(c=>projects.find(p=>p.id===ntForm.pid)?.comps.includes(c.id));
            return avail.length>0?(
              <div style={{background:iOS.bg3,borderRadius:12,padding:"8px 16px"}}>
                <div style={{...T.caption,textTransform:"uppercase",letterSpacing:".06em",color:iOS.label2,padding:"8px 0 12px"}}>
                  Properties &amp; Appointment Times
                </div>
                {avail.map((c,i)=>{
                  const checked=ntForm.comps.includes(c.id);
                  return (
                    <div key={c.id} style={{
                      paddingBottom:8, marginBottom:8,
                      borderBottom:i<avail.length-1?`0.5px solid ${iOS.separator}`:"none",
                    }}>
                      <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:checked?8:0}}>
                        <input type="checkbox" checked={checked}
                          onChange={e=>setNtForm(f=>({
                            ...f,
                            comps:e.target.checked?[...f.comps,c.id]:f.comps.filter(x=>x!==c.id),
                            times:e.target.checked?f.times:{...f.times,[c.id]:undefined},
                          }))}
                          style={{accentColor:iOS.blue,width:20,height:20,flexShrink:0}}/>
                        <span style={{...T.body}}>{c.name}</span>
                      </label>
                      {checked && (
                        <div style={{display:"flex",alignItems:"center",gap:8,paddingLeft:30}}>
                          <Icon name="clock" size={14} color={iOS.label3}/>
                          <input
                            type="time"
                            value={ntForm.times[c.id]??""}
                            onChange={e=>{
                              const raw=e.target.value;
                              if(!raw){setNtForm(f=>({...f,times:{...f.times,[c.id]:""}}));return;}
                              const [h,m]=raw.split(":");
                              const hr=parseInt(h);
                              const ampm=hr>=12?"PM":"AM";
                              const hr12=hr%12||12;
                              const label=`${hr12}:${m} ${ampm}`;
                              setNtForm(f=>({...f,times:{...f.times,[c.id]:label}}));
                            }}
                            style={{
                              flex:1,padding:"7px 10px",background:iOS.bg4,
                              border:`1px solid ${iOS.separator}`,borderRadius:8,
                              fontSize:14,color:iOS.label,outline:"none",
                            }}
                          />
                          {ntForm.times[c.id] && (
                            <span style={{...T.footnote,color:iOS.blue,fontWeight:600,whiteSpace:"nowrap"}}>
                              {ntForm.times[c.id]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ):<div style={{...T.footnote,color:iOS.label3}}>No comps in this project yet.</div>;
          })()}
          <IOSBtn onPress={addTour} full>Create Tour</IOSBtn>
        </div>
      </Sheet>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DEVICE FRAME WRAPPER
═══════════════════════════════════════════════════════ */
function DeviceFrame({device, children}) {
  const d = DEVICES[device];
  const scale = device === "iphone"
    ? Math.min(1, (window.innerHeight - 80) / (d.h + d.bezel * 2))
    : Math.min(0.75, (window.innerHeight - 80) / (d.h + d.bezel * 2),
               (window.innerWidth - 80) / (d.w + d.bezel * 2));

  return (
    <div style={{
      width: d.w + d.bezel * 2,
      height: d.h + d.bezel * 2,
      background: "#1A1A1C",
      borderRadius: d.cornerRadius + d.bezel,
      boxShadow: [
        "0 0 0 1px #333",
        "0 0 0 2px #111",
        "0 30px 80px rgba(0,0,0,.7)",
        "0 10px 30px rgba(0,0,0,.5)",
        "inset 0 0 0 0.5px rgba(255,255,255,.08)",
      ].join(","),
      padding: d.bezel,
      flexShrink: 0,
      transform: `scale(${scale})`,
      transformOrigin: "top center",
    }}>
      {/* Inner screen */}
      <div style={{
        width: "100%", height: "100%",
        borderRadius: d.cornerRadius - 2,
        background: "#000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}>
        {/* Side buttons */}
        {device === "iphone" && <>
          {/* Volume up */}
          <div style={{position:"absolute",left:-d.bezel-2,top:120,width:d.bezel-2,height:32,
            background:"#2A2A2C",borderRadius:"2px 0 0 2px",zIndex:1000}}/>
          <div style={{position:"absolute",left:-d.bezel-2,top:162,width:d.bezel-2,height:32,
            background:"#2A2A2C",borderRadius:"2px 0 0 2px",zIndex:1000}}/>
          {/* Power */}
          <div style={{position:"absolute",right:-d.bezel-2,top:140,width:d.bezel-2,height:64,
            background:"#2A2A2C",borderRadius:"0 2px 2px 0",zIndex:1000}}/>
        </>}
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════════════════ */
function AppShell({user, onLogout, device}) {
  const [tab, setTab] = useState(user.role==="guest"?"tours":"dashboard");
  const [toastMsg, setToastMsg] = useState("");
  const [sites, setSites] = useState(SITES_SEED);
  const [projects, setProjects] = useState(PROJECTS_SEED);
  const [comps, setComps] = useState(COMPS_SEED);
  const [tours, setTours] = useState(TOURS_SEED);
  const [tasks, setTasks] = useState(TASKS_SEED);
  const toast = useCallback(msg=>setToastMsg(msg), []);

  const screens = {
    dashboard: <Dashboard user={user} setTab={setTab} sites={sites} projects={projects} tours={tours} comps={comps}/>,
    sites:     <Sites sites={sites} setSites={setSites} tasks={tasks} setTasks={setTasks} sites_all={sites} projects_all={projects} toast={toast}/>,
    projects:  <Projects projects={projects} setProjects={setProjects} sites={sites} comps={comps} setComps={setComps} tasks={tasks} setTasks={setTasks} sites_all={sites} toast={toast}/>,
    tours:     <Tours user={user} tours={tours} setTours={setTours} projects={projects} comps={comps} toast={toast}/>,
  };

  return (
    <>
      <StatusBar device={device}/>
      <div style={{flex:1, overflow:"hidden", display:"flex", flexDirection:"column", position:"relative"}}>
        {screens[tab]}
        {toastMsg && <Toast msg={toastMsg} onDone={()=>setToastMsg("")}/>}
      </div>
      <TabBar tab={tab} setTab={setTab} role={user.role} device={device}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export default function App() {
  const [phase, setPhase] = useState("splash");
  const [user, setUser] = useState(null);
  const [device, setDevice] = useState("iphone");
  const [windowSize, setWindowSize] = useState({w:window.innerWidth, h:window.innerHeight});

  useEffect(()=>{
    const h=()=>setWindowSize({w:window.innerWidth,h:window.innerHeight});
    window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h);
  },[]);

  const login  = u => { setUser(u); setPhase("app"); };
  const logout = () => { setUser(null); setPhase("login"); };

  const d = DEVICES[device];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {/* Desktop canvas */}
      <div style={{
        height:"100vh", overflow:"hidden", background:"#0D0D0F",
        backgroundImage:"radial-gradient(ellipse at 50% 0%, rgba(10,132,255,.08) 0%, transparent 60%)",
        display:"flex", flexDirection:"column", alignItems:"center",
        fontFamily:SYS_FONT,
      }}>
        {/* Device switcher */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          width:"100%", maxWidth:1200, padding:"20px 32px 0", flexShrink:0,
        }}>
          {/* Logo */}
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#0A84FF,#40CBE0)",
              display:"flex", alignItems:"center", justifyContent:"center"}}>
              <Icon name="building" size={18} color="#fff" strokeWidth={1.5}/>
            </div>
            <span style={{color:"rgba(255,255,255,.7)", fontWeight:700, fontSize:14, letterSpacing:"-.01em"}}>REoptimizer</span>
          </div>
          {/* Device toggle */}
          <div style={{display:"flex", gap:4, background:"rgba(255,255,255,.06)",
            borderRadius:10, padding:4, border:"1px solid rgba(255,255,255,.08)"}}>
            {[
              {id:"iphone", label:"iPhone 15 Pro"},
              {id:"ipad",   label:"iPad Pro 11″"},
            ].map(opt=>(
              <button key={opt.id} onClick={()=>setDevice(opt.id)} style={{
                padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
                background: device===opt.id ? "rgba(255,255,255,.12)" : "transparent",
                color: device===opt.id ? "#fff" : "rgba(255,255,255,.4)",
                transition:"all .18s",
              }}>{opt.label}</button>
            ))}
          </div>
          {/* Spacer */}
          <div style={{width:160}}/>
        </div>

        {/* Device frame */}
        <div style={{
          flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center",
          padding:"24px 24px 40px",
          width:"100%",
        }}>
          <DeviceFrame device={device}>
            {/* App content */}
            <div style={{
              flex:1, display:"flex", flexDirection:"column",
              background:"#000", width:"100%", height:"100%",
            }}>
              {phase==="splash" && (
                <>
                  <StatusBar device={device}/>
                  <Splash onGo={()=>setPhase("login")}/>
                </>
              )}
              {phase==="login" && (
                <>
                  <StatusBar device={device}/>
                  <Login onLogin={login}/>
                  <div style={{padding:"0 24px 24px"}}>
                    <IOSBtn variant="plain" onPress={logout} full>← Back</IOSBtn>
                  </div>
                </>
              )}
              {phase==="app" && user && (
                <AppShell user={user} onLogout={logout} device={device}/>
              )}
            </div>
          </DeviceFrame>
        </div>

        {/* Footer hint */}
        <div style={{
          padding:"0 0 20px", fontSize:12, color:"rgba(255,255,255,.2)",
          letterSpacing:".04em", fontWeight:500, flexShrink:0,
        }}>
          {d.label} · {d.w}×{d.h}pt · iOS 17
        </div>
      </div>
    </>
  );
}
