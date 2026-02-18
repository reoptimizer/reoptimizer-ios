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
    contacts:[{id:"tc1",name:"Brett Hale",email:"brett@co.com",role:"CFO"},{id:"tc2",name:"Monica Patel",email:"monica@co.com",role:"VP Ops"}], comps:["c1","c2"] },
  { id:"t2", pid:"p2", name:"Titan Walkthrough", date:"Feb 20, 2025", status:"In Progress",
    contacts:[{id:"tc3",name:"Derek Lim",email:"derek@co.com",role:"Director"}], comps:["c3"] },
];
const KSD = [
  {id:"ch",label:"Clear Height",    icon:"📐"},
  {id:"pc",label:"Power Capacity",  icon:"⚡"},
  {id:"hp",label:"Highway Prox.",   icon:"🛣️"},
  {id:"la",label:"Labor Avail.",    icon:"👷"},
  {id:"ur",label:"Union Risk",      icon:"⚖️"},
  {id:"tr",label:"Tax Rates",       icon:"🏛️"},
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

/* SF Symbol-style icon label */
function SFIcon({name, size=22, color=iOS.blue, bg, label}) {
  const icons = {
    house:"⊞", building:"🏭", folder:"📋", map:"🗺️", person:"👤",
    plus:"+", back:"‹", gear:"⚙️", search:"🔍", star:"★", check:"✓",
    close:"×", invite:"✉️", photo:"📷", note:"📝", chart:"📊",
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
      <div style={{
        width:size+10, height:size+10, borderRadius:(size+10)*0.23,
        background: bg ?? `${color}22`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:size*.9,
      }}>{icons[name] ?? name}</div>
      {label && <span style={{ fontSize:10, fontWeight:500, color:iOS.label2 }}>{label}</span>}
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
        display:"flex", alignItems:"center", gap:12,
        padding:"11px 16px", background:iOS.cardBg,
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
    <div style={{marginBottom:32, ...style}}>
      {header && <div style={{...T.footnote, textTransform:"uppercase", letterSpacing:".04em",
        padding:"0 16px 6px", color:iOS.label2}}>{header}</div>}
      <div style={{borderRadius:10, overflow:"hidden", background:iOS.cardBg}}>
        {children}
      </div>
      {footer && <div style={{...T.caption, padding:"6px 16px", color:iOS.label2}}>{footer}</div>}
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
        <div style={{overflowY:"auto", padding:"0 16px 24px", flex:1}}>{children}</div>
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
      <span style={{color:iOS.green, fontSize:17}}>✓</span>{msg}
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
        <div style={{padding:"4px 16px 14px"}}>
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
        {id:"dashboard", icon:"⊞",  sf:"house.fill",    label:"Home"    },
        {id:"sites",     icon:"🏭",  sf:"building.fill", label:"Sites"   },
        {id:"projects",  icon:"📋",  sf:"folder.fill",   label:"Projects"},
        {id:"tours",     icon:"🗺️",  sf:"map.fill",      label:"Tours"   },
      ]
    : [{id:"tours", icon:"🗺️", sf:"map.fill", label:"My Tour"}];

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
              fontSize:isPhone?24:22,
              filter:active?"none":"grayscale(1) opacity(0.45)",
              transition:"filter .15s",
            }}>{t.icon}</div>
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
        fontSize:44, boxShadow:"0 16px 48px rgba(10,132,255,.5)",
        animation:vis?"fadeUp .5s ease":"none",
      }}>⬡</div>
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
        <div style={{fontSize:52, marginBottom:16}}>🔑</div>
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
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:32,
          margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(10,132,255,.4)"}}>⬡</div>
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
    {label:"Sites",    val:sites.length,    icon:"🏭", color:iOS.teal  },
    {label:"Projects", val:projects.length, icon:"📋", color:iOS.blue  },
    {label:"Tours",    val:tours.length,    icon:"🗺️", color:iOS.orange},
    {label:"Comps",    val:comps.length,    icon:"📊", color:iOS.indigo},
  ];
  return (
    <div style={{flex:1, overflowY:"auto", background:"#000"}}>
      <NavBar title="Dashboard" large
        rightItem={
          <Avatar init={user.av} size={32} color={iOS.blue}/>
        }/>
      <div style={{padding:"0 16px 24px"}}>
        {/* Greeting */}
        <div style={{padding:"16px 0 20px"}}>
          <div style={{...T.title3, color:iOS.label2, marginBottom:4}}>
            Good morning, {user.name.split(" ")[0]} 👋
          </div>
          <div style={{...T.footnote, color:iOS.label3}}>Your portfolio at a glance</div>
        </div>

        {/* Stats 2×2 */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28}}>
          {stats.map(s=>(
            <div key={s.label} style={{background:iOS.bg2, borderRadius:14, padding:16}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <div>
                  <div style={{...T.caption2, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8}}>{s.label}</div>
                  <div style={{fontSize:36, fontWeight:700, color:iOS.label, letterSpacing:"-1px", lineHeight:1}}>{s.val}</div>
                </div>
                <div style={{width:42, height:42, borderRadius:12, background:`${s.color}22`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:22}}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sites */}
        <Section header="Recent Sites">
          {sites.slice(0,3).map((s,i)=>(
            <ListRow key={s.id}
              left={<div style={{width:36, height:36, borderRadius:10, background:`${iOS.teal}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18}}>🏭</div>}
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
              left={<div style={{width:36, height:36, borderRadius:10, background:`${iOS.blue}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18}}>📋</div>}
              title={p.name} subtitle={site?.name}
              right={<Badge label={p.stage} color={STAGE_COLOR[p.stage]??iOS.label3}/>}
              onPress={()=>setTab("projects")} last={i===projects.length-1}/>;
          })}
        </Section>

        {/* Tours */}
        <Section header="Upcoming Tours">
          {tours.map((t,i)=>{
            const proj=projects.find(p=>p.id===t.pid);
            return <ListRow key={t.id}
              left={<div style={{width:36, height:36, borderRadius:10,
                background:`${t.status==="In Progress"?iOS.orange:iOS.blue}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18}}>🗺️</div>}
              title={t.name} subtitle={`${proj?.name} · ${t.date}`}
              right={<Badge label={t.status} color={t.status==="In Progress"?iOS.orange:iOS.blue}/>}
              onPress={()=>setTab("tours")} last={i===tours.length-1}/>;
          })}
        </Section>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SITES
═══════════════════════════════════════════════════════ */
function Sites({sites, setSites, toast}) {
  const [sel, setSel]=useState(null);
  const [sheet, setSheet]=useState(false);
  const [form, setForm]=useState({name:"",addr:"",type:"Owned",sqft:"",ch:"",status:"Active"});
  const site=sites.find(s=>s.id===sel);

  const addSite=()=>{
    if(!form.name)return;
    setSites(prev=>[...prev,{id:"s"+Date.now(),name:form.name,addr:form.addr,
      type:form.type,sqft:parseInt(form.sqft)||0,ch:parseInt(form.ch)||0,
      status:form.status,last:"Today"}]);
    setSheet(false); setForm({name:"",addr:"",type:"Owned",sqft:"",ch:"",status:"Active"});
    toast("Site added");
  };

  if(site) return (
    <div style={{flex:1, display:"flex", flexDirection:"column", background:"#000", animation:"slideR .28s ease"}}>
      <NavBar title={site.name} onBack={()=>setSel(null)} backLabel="Sites"/>
      <div style={{flex:1, overflowY:"auto", padding:"16px 16px 32px"}}>
        <Section header="Overview">
          {[
            {l:"Square Footage", v:site.sqft.toLocaleString()+" sqft"},
            {l:"Clear Height",   v:site.ch+"'"},
            {l:"Tenure",         v:site.type},
            {l:"Last Visit",     v:site.last},
            {l:"Status",         v:site.status},
          ].map((d,i,arr)=>(
            <ListRow key={d.l} title={d.l} right={<span style={{...T.subhead, color:iOS.label2}}>{d.v}</span>}
              showChevron={false} last={i===arr.length-1}/>
          ))}
        </Section>
        <Section header="Building Info">
          {["Dock Doors: 24","Drive-In Doors: 4","Fire Suppression: ESFR","Power: 2,000A / 480V 3-Phase",
            "Office Area: 4,200 sqft","Truck Court: 185 ft"].map((d,i,arr)=>(
            <ListRow key={d} title={d} showChevron={false} last={i===arr.length-1}
              left={<span style={{color:iOS.green}}>✓</span>}/>
          ))}
        </Section>
        <Section header="Address">
          <ListRow title={site.addr} showChevron={false} last/>
        </Section>
      </div>
    </div>
  );

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", background:"#000", position:"relative"}}>
      <NavBar title="Sites" large
        rightItem={<button onClick={()=>setSheet(true)} style={{background:"none", border:"none",
          color:iOS.blue, fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", gap:4}}>
          <span style={{fontSize:22, fontWeight:300}}>+</span> Add
        </button>}/>
      <div style={{flex:1, overflowY:"auto", padding:"0 16px 24px"}}>
        <Section>
          {sites.map((s,i)=>(
            <ListRow key={s.id}
              left={<div style={{width:40, height:40, borderRadius:12, background:`${iOS.teal}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20}}>🏭</div>}
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
function Projects({projects, setProjects, sites, comps, setComps, toast}) {
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
    const radarData=KSD.map(k=>({
      subject:k.label,
      ...scored.reduce((acc,c)=>({...acc,[c.name]:c.scores[k.id]??0}),{})
    }));
    const colors=[iOS.green,iOS.blue,iOS.orange];

    return (
      <div style={{flex:1, display:"flex", flexDirection:"column", background:"#000", position:"relative", animation:"slideR .28s ease"}}>
        <NavBar title={proj.name} onBack={()=>setSel(null)} backLabel="Projects"
          rightItem={<Badge label={proj.stage} color={STAGE_COLOR[proj.stage]??iOS.label3}/>}/>
        <div style={{flex:1, overflowY:"auto", padding:"16px 16px 32px"}}>
          {/* Site */}
          <Section header="Linked Site">
            <ListRow left={<div style={{width:36,height:36,borderRadius:10,background:`${iOS.teal}22`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏭</div>}
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

          {/* Radar */}
          {scored.length>=2 && (
            <Section header="KSD Head-to-Head Radar">
              <div style={{padding:"16px 8px"}}>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={`${iOS.separator}`}/>
                    <PolarAngleAxis dataKey="subject" tick={{fontSize:9,fill:iOS.label2}}/>
                    <PolarRadiusAxis domain={[0,10]} tick={false} axisLine={false}/>
                    {scored.map((c,i)=>(
                      <Radar key={c.id} name={c.name} dataKey={c.name}
                        stroke={colors[i]} fill={colors[i]} fillOpacity={0.18} strokeWidth={2}/>
                    ))}
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,color:iOS.label2}}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}
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
                    <span style={{...T.subhead}}>{k.icon} {k.label}</span>
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
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 24px"}}>
        <Section>
          {projects.map((p,i)=>{
            const site=sites.find(s=>s.id===p.siteId);
            const pc=comps.filter(c=>p.comps.includes(c.id));
            return <ListRow key={p.id}
              left={<div style={{width:40,height:40,borderRadius:12,background:`${iOS.blue}22`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📋</div>}
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
            📷 {items.length > 0
              ? `${items.length} file${items.length > 1 ? "s" : ""} · Add More`
              : "Add Site Photos & Videos"}
          </IOSBtn>
        </div>
      </Section>
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
  const [ntForm,setNtForm]=useState({name:"",pid:"",date:"",comps:[]});
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
    setTours(prev=>[...prev,{id:"t"+Date.now(),pid:ntForm.pid,name:ntForm.name,date:ntForm.date||"TBD",status:"Scheduled",contacts:[],comps:ntForm.comps}]);
    setNewSheet(false); setNtForm({name:"",pid:"",date:"",comps:[]}); toast("Tour created");
  };

  const tour=tours.find(t=>t.id===activeTour);
  const comp=tour?comps.find(c=>c.id===activeComp):null;

  /* ── Scoring view ── */
  if(comp&&tour){
    const myTC=tour.contacts[0];
    const myS=myTC?(scores[tour.id]?.[myTC.id]?.[comp.id]??{}):{}; 
    const live=calcIPS(myS);
    const col=live>=7.5?iOS.green:live>=5?iOS.orange:iOS.red;
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#000",animation:"slideR .28s ease"}}>
        <NavBar title="Score Property" onBack={()=>setActiveComp(null)} backLabel="Tour"/>
        <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px"}}>
          {/* Hero */}
          <div style={{background:iOS.bg2,borderRadius:16,padding:20,textAlign:"center",marginBottom:20,border:`1px solid ${col}33`}}>
            <div style={{...T.caption2,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>IPS™ SCORE</div>
            <div style={{fontSize:72,fontWeight:700,color:col,letterSpacing:"-3px",lineHeight:1,marginBottom:8}}>{live.toFixed(2)}</div>
            <div style={{...T.subhead,color:iOS.label2,marginBottom:12}}>{comp.name}</div>
            <div style={{...T.footnote,color:iOS.label3,marginBottom:16}}>{comp.addr}</div>
            <div style={{display:"flex",justifyContent:"center",gap:8}}>
              <Badge label={`${comp.sqft.toLocaleString()} sqft`} color={iOS.blue}/>
              <Badge label={`$${comp.rent}/sqft`} color={iOS.orange}/>
            </div>
          </div>

          {/* Sliders */}
          <Section header="KSD Ratings">
            <div style={{padding:"8px 16px"}}>
              {KSD.map((k,i)=>{
                const val=myS[k.id]??0;
                const c=val>=7?iOS.green:val>=4?iOS.orange:iOS.red;
                return (
                  <div key={k.id} style={{marginBottom:i<KSD.length-1?20:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{...T.subhead}}>{k.icon} {k.label}</span>
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

          {/* Media */}
          <MediaSection
            tourId={tour.id} compId={comp.id}
            items={getMedia(tour.id, comp.id)}
            onAdd={addMedia} onRemove={removeMedia}/>

          {/* Notes */}
          <div style={{marginBottom:16}}>
            <Section header="Tour Notes">
              <div style={{padding:"8px 16px 12px"}}>
                <textarea value={getNote(tour.id,comp.id)}
                  onChange={e=>setNote(tour.id,comp.id,e.target.value)}
                  placeholder="Observations, red flags, highlights…"
                  style={{width:"100%",minHeight:100,background:"transparent",border:"none",
                    fontSize:16,color:iOS.label,outline:"none",lineHeight:1.5}}/>
              </div>
            </Section>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <IOSBtn onPress={()=>{setActiveComp(null);toast("Scores saved");}} full>
              Save & Return
            </IOSBtn>
            <IOSBtn variant="tinted" color={iOS.green} full disabled={syncing} onPress={doSync}>
              {syncing
                ? <><span style={{display:"inline-block",width:14,height:14,borderRadius:"50%",
                    border:"2px solid rgba(48,209,88,0.3)",borderTopColor:iOS.green,
                    animation:"spin 0.7s linear infinite",marginRight:6}}/> Syncing…</>
                : "☁️ Sync to Web"}
            </IOSBtn>
          </div>
        </div>
      </div>
    );
  }

  /* ── Tour detail ── */
  if(tour){
    const tComps=comps.filter(c=>tour.comps.includes(c.id));
    const barData=tComps.map(c=>({name:c.name,avg:parseFloat(getAvg(tour.id,c.id).toFixed(2))})).sort((a,b)=>b.avg-a.avg);
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#000",position:"relative",animation:"slideR .28s ease"}}>
        <NavBar title={tour.name} onBack={user.role!=="guest"?()=>setActiveTour(null):null} backLabel="Tours"
          rightItem={<Badge label={tour.status} color={tour.status==="In Progress"?iOS.orange:iOS.blue}/>}/>
        <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px"}}>
          {/* Properties */}
          <Section header={`Properties to Visit (${tComps.length})`}>
            {tComps.length===0&&<ListRow title="No properties assigned" showChevron={false} last/>}
            {tComps.map((c,i)=>{
              const avg=getAvg(tour.id,c.id);
              return <ListRow key={c.id}
                left={<div style={{width:40,height:40,borderRadius:12,background:`${iOS.blue}22`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏢</div>}
                title={c.name} subtitle={c.addr}
                right={avg>0?<ScoreChip score={avg}/>:<Badge label="Score →" color={iOS.blue}/>}
                onPress={()=>setActiveComp(c.id)} last={i===tComps.length-1}/>;
            })}
          </Section>

          {/* Stakeholders */}
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
              <IOSBtn variant="tinted" full onPress={()=>setInviteSheet(true)}>✉️ Invite Stakeholder</IOSBtn>
            </div>
          )}

          {/* Sync to Web */}
          <div style={{marginBottom:20}}>
            <IOSBtn variant={syncing?"gray":"filled"} color={iOS.green} full disabled={syncing} onPress={doSync}>
              {syncing
                ? <><span style={{display:"inline-block",width:14,height:14,borderRadius:"50%",
                    border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",
                    animation:"spin 0.7s linear infinite",marginRight:6}}/> Syncing…</>
                : "☁️ Sync to Web"}
            </IOSBtn>
          </div>

          {/* Bar chart */}
          {barData.some(d=>d.avg>0)&&(
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
        </div>

        {/* Invite sheet */}
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
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 24px"}}>
        <Section>
          {tours.map((t,i)=>{
            const proj=projects.find(p=>p.id===t.pid);
            const isLive=t.status==="In Progress";
            return <ListRow key={t.id}
              left={<div style={{width:40,height:40,borderRadius:12,
                background:`${isLive?iOS.orange:iOS.blue}22`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🗺️</div>}
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
                <div style={{...T.caption,textTransform:"uppercase",letterSpacing:".06em",color:iOS.label2,padding:"8px 0 12px"}}>Include Comps</div>
                {avail.map((c,i)=>(
                  <label key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",
                    borderBottom:i<avail.length-1?`0.5px solid ${iOS.separator}`:"none",cursor:"pointer"}}>
                    <input type="checkbox" checked={ntForm.comps.includes(c.id)}
                      onChange={e=>setNtForm(f=>({...f,comps:e.target.checked?[...f.comps,c.id]:f.comps.filter(x=>x!==c.id)}))}
                      style={{accentColor:iOS.blue,width:20,height:20}}/>
                    <span style={{...T.body}}>{c.name}</span>
                  </label>
                ))}
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
  const toast = useCallback(msg=>setToastMsg(msg), []);

  const screens = {
    dashboard: <Dashboard user={user} setTab={setTab} sites={sites} projects={projects} tours={tours} comps={comps}/>,
    sites:     <Sites sites={sites} setSites={setSites} toast={toast}/>,
    projects:  <Projects projects={projects} setProjects={setProjects} sites={sites} comps={comps} setComps={setComps} toast={toast}/>,
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
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:16}}>⬡</div>
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
