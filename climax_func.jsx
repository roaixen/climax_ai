import { useState, useEffect, useRef, useMemo } from "react";
import {
  Home, FileText, Map as MapIcon, Building2, Leaf, BarChart3, User,
  MapPin, Camera, AlertTriangle, Trash2, HardHat, Wind, Droplets,
  Thermometer, Gauge, Award, TrendingUp, Search, Filter, MessageSquare,
  Phone, Shield, Sun, Cloud, CloudRain, Snowflake, Zap, Navigation,
  CheckCircle2, Star, ChevronRight, X, Loader2, Info, Sparkles, Send,
  Mountain, Lock, Mail, LogOut, UserPlus, ShieldCheck,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ---------------------------------- Meta / constants ---------------------------------- */

const CATEGORY_META = {
  garbage: { label: "Waste / Garbage", icon: Trash2, color: "#b45309", bg: "bg-amber-100", text: "text-amber-800" },
  pothole: { label: "Pothole / Road", icon: AlertTriangle, color: "#c2410c", bg: "bg-orange-100", text: "text-orange-800" },
  construction: { label: "Construction Site", icon: HardHat, color: "#334155", bg: "bg-slate-200", text: "text-slate-800" },
  environment: { label: "Environmental Hazard", icon: Leaf, color: "#15803d", bg: "bg-emerald-100", text: "text-emerald-800" },
  other: { label: "Other", icon: Info, color: "#475569", bg: "bg-slate-100", text: "text-slate-700" },
};

const STATUS_META = {
  reported: { label: "Reported", bg: "bg-amber-100", text: "text-amber-800" },
  in_progress: { label: "In Progress", bg: "bg-sky-100", text: "text-sky-800" },
  resolved: { label: "Resolved", bg: "bg-emerald-100", text: "text-emerald-800" },
};

const SEVERITY_META = {
  low: { label: "Low", bg: "bg-slate-100", text: "text-slate-700" },
  medium: { label: "Medium", bg: "bg-amber-100", text: "text-amber-800" },
  high: { label: "High", bg: "bg-red-100", text: "text-red-800" },
};

const PROJECT_TYPE_META = {
  road: { label: "Roads & Transport", icon: Navigation },
  housing: { label: "Housing & Allotment", icon: Building2 },
  water: { label: "Water & Sanitation", icon: Droplets },
  park: { label: "Parks & Public Land", icon: Leaf },
  sanitation: { label: "Waste Management", icon: Trash2 },
  other: { label: "Other", icon: Info },
};

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "report", label: "Report", icon: Camera },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "directory", label: "Directory", icon: Building2 },
  { id: "environment", label: "Environment", icon: Leaf },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: User },
];

const SEED_BUILDERS = [
  { id: "b1", name: "Metro Roadways Corp.", type: "government", category: "Roads & Transport", rating: 3.8, contact: "Add your local contact info" },
  { id: "b2", name: "GreenPath Infrastructure Pvt. Ltd.", type: "private", category: "General Contractor", rating: 4.2, contact: "Add your local contact info" },
  { id: "b3", name: "Sunrise Housing Development Authority", type: "government", category: "Housing & Allotments", rating: 3.5, contact: "Add your local contact info" },
  { id: "b4", name: "Clearwater Sanitation Co.", type: "private", category: "Water & Sanitation", rating: 4.0, contact: "Add your local contact info" },
  { id: "b5", name: "Union Parks & Recreation Board", type: "government", category: "Parks & Public Land", rating: 4.4, contact: "Add your local contact info" },
  { id: "b6", name: "Bedrock Builders Ltd.", type: "private", category: "General Contractor", rating: 3.1, contact: "Add your local contact info" },
];

const PROJECT_SEED_OFFSETS = [
  [0.012, -0.007], [-0.009, 0.014], [0.006, 0.018], [-0.015, -0.004],
  [0.003, 0.009], [0.02, 0.002], [-0.011, 0.006], [0.008, -0.016],
];

const SEED_PROJECTS_BASE = [
  { id: "p1", name: "Ring Road Widening – Phase 2", type: "road", status: "ongoing", builderId: "b1", scheme: "National Road Expansion Scheme", desc: "Widening of the ring road to four lanes with upgraded drainage." },
  { id: "p2", name: "Riverside Allotment Block C", type: "housing", status: "planned", builderId: "b3", scheme: "Affordable Housing Allotment Scheme", desc: "New residential allotment plots pending infrastructure approval." },
  { id: "p3", name: "Central Sewage Treatment Upgrade", type: "water", status: "delayed", builderId: "b4", scheme: "Clean Water Mission", desc: "Capacity upgrade for the sewage treatment plant, delayed pending permits." },
  { id: "p4", name: "Greenfield Community Park", type: "park", status: "ongoing", builderId: "b5", scheme: "Urban Green Spaces Initiative", desc: "New public park with walking trails and native landscaping." },
  { id: "p5", name: "Elm Street Repair Contract", type: "road", status: "ongoing", builderId: "b6", scheme: "Rapid Road Repair Program", desc: "Contracted pothole patching and resurfacing along the Elm Street corridor." },
  { id: "p6", name: "North Ward Waste Transfer Station", type: "sanitation", status: "planned", builderId: "b2", scheme: "Solid Waste Management Plan", desc: "Proposed waste transfer and sorting facility for the north ward." },
  { id: "p7", name: "Hillcrest Storm Drain Project", type: "water", status: "completed", builderId: "b1", scheme: "Flood Mitigation Program", desc: "Storm drain installation to reduce seasonal flooding. Completed last quarter." },
  { id: "p8", name: "Lakeview Allotment Garden Plots", type: "housing", status: "ongoing", builderId: "b3", scheme: "Community Allotment Scheme", desc: "Small allotment garden plots for community cultivation." },
];

const REPORT_SEED_OFFSETS = [
  [0.004, 0.003], [-0.006, 0.008], [0.009, -0.005], [-0.013, -0.009],
  [0.015, 0.011], [0.002, -0.012], [-0.004, 0.015], [0.011, 0.007],
];

const SEED_REPORTS_BASE = [
  { id: "r1", category: "pothole", severity: "high", description: "Large pothole causing traffic to swerve near the main junction.", status: "in_progress", reporterName: "Aiden K.", daysAgo: 2 },
  { id: "r2", category: "garbage", severity: "medium", description: "Overflowing public bin left uncollected for several days now.", status: "reported", reporterName: "Priya S.", daysAgo: 1 },
  { id: "r3", category: "construction", severity: "medium", description: "Unmarked construction debris left on the sidewalk overnight.", status: "reported", reporterName: "Miguel R.", daysAgo: 4 },
  { id: "r4", category: "environment", severity: "high", description: "Strong burning smell reported repeatedly near the industrial lot.", status: "in_progress", reporterName: "Sana T.", daysAgo: 3 },
  { id: "r5", category: "pothole", severity: "low", description: "Small pothole has started forming after last week's heavy rain.", status: "resolved", reporterName: "Aiden K.", daysAgo: 6 },
  { id: "r6", category: "garbage", severity: "high", description: "Illegal dumping site is steadily growing near the creek bank.", status: "reported", reporterName: "Dana W.", daysAgo: 2 },
  { id: "r7", category: "construction", severity: "low", description: "Missing safety barrier found around an open utility trench.", status: "in_progress", reporterName: "Priya S.", daysAgo: 1 },
  { id: "r8", category: "environment", severity: "medium", description: "Visible foam and discoloration spotted in the stream water.", status: "reported", reporterName: "Miguel R.", daysAgo: 5 },
];

/* ---------------------------------- Utilities ---------------------------------- */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function reportPoints(r) {
  let pts = 10;
  if (r.description && r.description.length >= 40) pts += 5;
  if (r.severity === "medium") pts += 2;
  if (r.severity === "high") pts += 5;
  if (r.hadPhotoAnalysis) pts += 5;
  return pts;
}

function tierForPoints(pts) {
  if (pts >= 300) return { label: "Platinum", text: "text-indigo-700", bg: "bg-indigo-100" };
  if (pts >= 150) return { label: "Gold", text: "text-amber-700", bg: "bg-amber-100" };
  if (pts >= 50) return { label: "Silver", text: "text-slate-600", bg: "bg-slate-200" };
  return { label: "Bronze", text: "text-orange-800", bg: "bg-orange-100" };
}

function aqiInfo(aqi) {
  if (aqi == null) return { label: "Unknown", color: "#94a3b8" };
  if (aqi <= 50) return { label: "Good", color: "#16a34a" };
  if (aqi <= 100) return { label: "Moderate", color: "#ca8a04" };
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "#ea580c" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#dc2626" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#9333ea" };
  return { label: "Hazardous", color: "#7f1d1d" };
}

function weatherInfo(code) {
  const map = {
    0: { label: "Clear sky", icon: Sun }, 1: { label: "Mainly clear", icon: Sun },
    2: { label: "Partly cloudy", icon: Cloud }, 3: { label: "Overcast", icon: Cloud },
    45: { label: "Fog", icon: Cloud }, 48: { label: "Fog", icon: Cloud },
    51: { label: "Light drizzle", icon: CloudRain }, 53: { label: "Drizzle", icon: CloudRain },
    55: { label: "Dense drizzle", icon: CloudRain }, 61: { label: "Light rain", icon: CloudRain },
    63: { label: "Rain", icon: CloudRain }, 65: { label: "Heavy rain", icon: CloudRain },
    71: { label: "Light snow", icon: Snowflake }, 73: { label: "Snow", icon: Snowflake },
    75: { label: "Heavy snow", icon: Snowflake }, 80: { label: "Rain showers", icon: CloudRain },
    81: { label: "Rain showers", icon: CloudRain }, 82: { label: "Violent showers", icon: CloudRain },
    95: { label: "Thunderstorm", icon: Zap }, 96: { label: "Thunderstorm", icon: Zap },
    99: { label: "Severe thunderstorm", icon: Zap },
  };
  return map[code] || { label: "—", icon: Cloud };
}

function estimateIndex(lat, lng, salt) {
  const s = Math.sin(lat * 12.9898 + lng * 78.233 + salt * 37.719) * 43758.5453;
  const frac = s - Math.floor(s);
  return Math.round(40 + frac * 55);
}

function safeParseJson(text) {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try { return JSON.parse(cleaned); } catch (e) { /* fall through */ }
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (e) { /* give up */ } }
  return null;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("no geo")); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------- Storage helpers ---------------------------------- */

async function storageGet(key, shared, fallback) {
  try {
    const res = await window.storage.get(key, shared);
    return res && res.value ? JSON.parse(res.value) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function storageSet(key, value, shared) {
  try {
    await window.storage.set(key, JSON.stringify(value), shared);
    return true;
  } catch (e) {
    console.error("storage set failed", e);
    return false;
  }
}

/* ---------------------------------- Claude API helpers ---------------------------------- */

async function callClaude(content) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

async function analyzePhotoWithAI(base64, mediaType) {
  const content = [
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
    {
      type: "text",
      text:
        "You are helping classify a citizen-submitted civic issue photo for a local reporting app. Reply with ONLY raw JSON, no markdown fences, no extra words, in exactly this shape: " +
        '{"category":"garbage"|"pothole"|"construction"|"environment"|"other","severity":"low"|"medium"|"high","description":"one short factual sentence describing what is visible","relevant":true|false}. ' +
        "Set relevant to false if the photo does not show a civic or environmental issue such as waste, road damage, a construction site, or pollution.",
    },
  ];
  const text = await callClaude(content);
  return safeParseJson(text);
}

async function generateInsightsWithAI(reports) {
  const compact = reports.slice(0, 40).map((r) => ({
    category: r.category, severity: r.severity, status: r.status, when: r.timestamp,
  }));
  const content = [
    {
      type: "text",
      text: `You are a civic-data analyst summarizing local issue reports for a neighborhood dashboard. Here is the report data as JSON: ${JSON.stringify(
        compact
      )}. Write a clear plain-language summary of roughly 100-150 words covering: the most common issue types, any patterns worth flagging, and two or three practical recommendations for the local authority. Plain prose in short paragraphs, no markdown headers, no bullet symbols.`,
    },
  ];
  return callClaude(content);
}

/* ---------------------------------- Small UI atoms ---------------------------------- */

function Pill({ bg, text, children }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${bg} ${text}`}>{children}</span>;
}
function StatusPill({ status }) {
  const m = STATUS_META[status] || { bg: "bg-slate-100", text: "text-slate-700", label: status };
  return <Pill bg={m.bg} text={m.text}>{m.label}</Pill>;
}
function SeverityPill({ severity, suffix }) {
  const m = SEVERITY_META[severity] || { bg: "bg-slate-100", text: "text-slate-700", label: severity };
  return <Pill bg={m.bg} text={m.text}>{m.label}{suffix ? ` ${suffix}` : ""}</Pill>;
}
function TypePill({ type }) {
  return (
    <Pill bg={type === "government" ? "bg-sky-100" : "bg-violet-100"} text={type === "government" ? "text-sky-800" : "text-violet-800"}>
      {type === "government" ? "Government" : "Private"}
    </Pill>
  );
}

function Spinner({ className = "" }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col gap-1">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-2xl font-semibold text-slate-800">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400 gap-2">
      <Icon className="w-8 h-8" />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {subtitle && <p className="text-xs">{subtitle}</p>}
    </div>
  );
}

function IconCircle({ Icon, bg, text }) {
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${bg} ${text}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

function Modal({ onClose, children, title }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function CommentList({ list }) {
  if (!list.length) return <p className="text-xs text-slate-400 mb-3">No comments yet.</p>;
  return (
    <div className="mb-3 space-y-2 max-h-40 overflow-y-auto">
      {list.map((c, i) => (
        <div key={i} className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-slate-700">
            {c.author} <span className="text-slate-400 font-normal">• {timeAgo(c.ts)}</span>
          </p>
          <p className="text-sm text-slate-600">{c.text}</p>
        </div>
      ))}
    </div>
  );
}

function CommentForm({ value, onChange, onSubmit }) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a comment…"
        className="flex-1 border border-stone-200 rounded-full px-3 py-2 text-sm"
      />
      <button
        onClick={() => value.trim() && onSubmit()}
        className="bg-emerald-600 text-white rounded-full p-2 flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ---------------------------------- Detail modal ---------------------------------- */

function DetailModal({ item, onClose, comments, onAddComment, builderById, allReports, projects }) {
  const [commentText, setCommentText] = useState("");
  const key = `${item.type}:${item.data.id}`;
  const list = comments[key] || [];

  function submitComment() {
    onAddComment(key, commentText);
    setCommentText("");
  }

  if (item.type === "report") {
    const r = item.data;
    const meta = CATEGORY_META[r.category] || CATEGORY_META.other;
    const nearby = projects.filter((p) => haversineKm(p.lat, p.lng, r.lat, r.lng) <= 2);
    return (
      <Modal title="Report details" onClose={onClose}>
        <div className="flex items-center gap-3 mb-3">
          <IconCircle Icon={meta.icon} bg={meta.bg} text={meta.text} />
          <div>
            <p className="font-medium text-slate-800">{meta.label}</p>
            <p className="text-xs text-slate-500">{timeAgo(r.timestamp)} • by {r.reporterName || "Guest"}</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 mb-3">{r.description}</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          <StatusPill status={r.status} />
          <SeverityPill severity={r.severity} suffix="severity" />
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
          <MapPin className="w-3.5 h-3.5" /> {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
        </div>
        {nearby.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">Nearby ongoing projects</p>
            {nearby.map((p) => (
              <div key={p.id} className="text-sm text-slate-700 py-1 border-b border-stone-100 last:border-0">
                {p.name} — {(builderById[p.builderId] || {}).name}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" /> Comments
        </p>
        <CommentList list={list} />
        <CommentForm value={commentText} onChange={setCommentText} onSubmit={submitComment} />
      </Modal>
    );
  }

  if (item.type === "project") {
    const p = item.data;
    const builder = builderById[p.builderId];
    const typeMeta = PROJECT_TYPE_META[p.type] || PROJECT_TYPE_META.other;
    const nearbyReports = allReports
      .filter((r) => haversineKm(p.lat, p.lng, r.lat, r.lng) <= 2)
      .slice(0, 5);
    return (
      <Modal title="Project details" onClose={onClose}>
        <div className="flex items-center gap-3 mb-3">
          <IconCircle Icon={typeMeta.icon} bg="bg-slate-100" text="text-slate-700" />
          <div>
            <p className="font-medium text-slate-800">{p.name}</p>
            <p className="text-xs text-slate-500">{typeMeta.label} • {p.scheme}</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 mb-3">{p.desc}</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          <StatusPill status={p.status} />
          {builder && <TypePill type={builder.type} />}
        </div>
        {builder && (
          <p className="text-sm text-slate-600 mb-3">
            Builder/Contractor: <span className="font-medium text-slate-800">{builder.name}</span>
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
          <MapPin className="w-3.5 h-3.5" /> {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
        </div>
        {nearbyReports.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">Nearby citizen reports</p>
            {nearbyReports.map((r) => (
              <div key={r.id} className="text-sm text-slate-700 py-1 border-b border-stone-100 last:border-0">
                {(CATEGORY_META[r.category] || {}).label}: {r.description.slice(0, 60)}
                {r.description.length > 60 ? "…" : ""}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" /> Comments
        </p>
        <CommentList list={list} />
        <CommentForm value={commentText} onChange={setCommentText} onSubmit={submitComment} />
      </Modal>
    );
  }

  if (item.type === "builder") {
    const b = item.data;
    const theirProjects = projects.filter((p) => p.builderId === b.id);
    return (
      <Modal title="Builder / Contractor" onClose={onClose}>
        <div className="mb-3">
          <p className="font-semibold text-slate-800 text-lg">{b.name}</p>
          <p className="text-xs text-slate-500">{b.category} • {b.type === "government" ? "Government body" : "Private contractor"}</p>
        </div>
        <div className="flex items-center gap-1 mb-3 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4" fill={i < Math.round(b.rating) ? "currentColor" : "none"} />
          ))}
          <span className="text-xs text-slate-500 ml-1">{b.rating.toFixed(1)} (sample rating)</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">{b.contact}</p>
        <p className="text-xs font-semibold text-slate-500 mb-1">Projects ({theirProjects.length})</p>
        {theirProjects.map((p) => (
          <div key={p.id} className="text-sm text-slate-700 py-1.5 border-b border-stone-100 last:border-0 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate">{p.name}</span>
            <StatusPill status={p.status} />
          </div>
        ))}
      </Modal>
    );
  }

  return null;
}

/* ---------------------------------- Home tab ---------------------------------- */

function HomeTab({ profile, allReports, projects, onOpenDetail, onNavigate }) {
  const active = allReports.filter((r) => r.status !== "resolved").length;
  const resolved = allReports.filter((r) => r.status === "resolved").length;
  const myPoints = allReports
    .filter((r) => r.reporterName === profile.displayName && profile.displayName)
    .reduce((s, r) => s + reportPoints(r), 0);
  const recent = allReports.slice(0, 5);
  const nearbyProjects = projects.slice(0, 3);

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hi{profile.displayName ? `, ${profile.displayName}` : ""}</h2>
        <p className="text-sm text-slate-500">Here's what's happening around you.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total reports" value={allReports.length} accent="bg-emerald-100 text-emerald-700" />
        <StatCard icon={AlertTriangle} label="Active issues" value={active} accent="bg-amber-100 text-amber-700" />
        <StatCard icon={CheckCircle2} label="Resolved" value={resolved} accent="bg-sky-100 text-sky-700" />
        <StatCard icon={Award} label="Your points" value={myPoints} accent="bg-violet-100 text-violet-700" />
      </div>

      <button
        onClick={() => onNavigate("report")}
        className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 font-medium flex items-center justify-center gap-2 shadow-sm"
      >
        <Camera className="w-5 h-5" /> Report an issue
      </button>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800">Recent activity</h3>
          <button onClick={() => onNavigate("map")} className="text-xs text-emerald-700 flex items-center gap-0.5">
            View map <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={FileText} title="No reports yet" subtitle="Be the first to report an issue nearby." />
        ) : (
          <div className="space-y-2">
            {recent.map((r) => {
              const meta = CATEGORY_META[r.category] || CATEGORY_META.other;
              return (
                <button
                  key={r.id}
                  onClick={() => onOpenDetail("report", r)}
                  className="w-full bg-white rounded-xl p-3 border border-stone-100 flex items-center gap-3 text-left"
                >
                  <IconCircle Icon={meta.icon} bg={meta.bg} text={meta.text} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.description}</p>
                    <p className="text-xs text-slate-400">{timeAgo(r.timestamp)}</p>
                  </div>
                  <StatusPill status={r.status} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800">Ongoing nearby projects</h3>
          <button onClick={() => onNavigate("directory")} className="text-xs text-emerald-700 flex items-center gap-0.5">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {nearbyProjects.map((p) => {
            const typeMeta = PROJECT_TYPE_META[p.type] || PROJECT_TYPE_META.other;
            return (
              <button
                key={p.id}
                onClick={() => onOpenDetail("project", p)}
                className="w-full bg-white rounded-xl p-3 border border-stone-100 flex items-center gap-3 text-left"
              >
                <IconCircle Icon={typeMeta.icon} bg="bg-slate-100" text="text-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 truncate">{p.scheme}</p>
                </div>
                <StatusPill status={p.status} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Report tab ---------------------------------- */

function ReportTab({ profile, onAddReport, onUpdateProfile, showToast }) {
  const [category, setCategory] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locating, setLocating] = useState(false);
  const [name, setName] = useState(profile.displayName || "");
  const [submitting, setSubmitting] = useState(false);

  function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setAiResult(null);
  }

  async function handleAnalyze() {
    if (!photoFile) return;
    setAnalyzing(true);
    try {
      const base64 = await readFileAsBase64(photoFile);
      const result = await analyzePhotoWithAI(base64, photoFile.type || "image/jpeg");
      if (result) {
        setAiResult(result);
        if (result.category) setCategory(result.category);
        if (result.severity) setSeverity(result.severity);
        if (result.description) setDescription(result.description);
      } else {
        showToast("Couldn't read the AI response — fill details in manually");
      }
    } catch (e) {
      showToast("AI analysis unavailable right now");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleUseLocation() {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setLat(pos.lat);
      setLng(pos.lng);
    } catch (e) {
      showToast("Couldn't access location — enter it manually below");
    } finally {
      setLocating(false);
    }
  }

  function resetForm() {
    setCategory("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setAiResult(null);
    setDescription("");
    setSeverity("medium");
    setLat(null);
    setLng(null);
    setLocationLabel("");
  }

  async function handleSubmit() {
    if (!category || !description.trim() || lat == null || lng == null) {
      showToast("Please add a category, description, and location");
      return;
    }
    setSubmitting(true);
    if (name !== profile.displayName) await onUpdateProfile({ displayName: name });
    await onAddReport({
      category,
      description: description.trim(),
      severity,
      lat,
      lng,
      locationLabel: locationLabel.trim(),
      reporterName: name.trim() || "Guest",
      status: "reported",
      hadPhotoAnalysis: !!aiResult,
    });
    setSubmitting(false);
    resetForm();
  }

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Report an issue</h2>
        <p className="text-sm text-slate-500">Snap a photo — AI helps fill in the details.</p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Category</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(CATEGORY_META).map(([k, meta]) => {
            const Icon = meta.icon;
            const selected = category === k;
            return (
              <button
                key={k}
                onClick={() => setCategory(k)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium ${
                  selected ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-200 bg-white text-slate-600"
                }`}
              >
                <Icon className="w-5 h-5" /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Photo (optional, helps AI fill in details)</p>
        {photoPreview ? (
          <div className="relative">
            <img src={photoPreview} alt="Uploaded issue" className="w-full h-48 object-cover rounded-xl" />
            <button
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); setAiResult(null); }}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-xl py-8 text-slate-400 cursor-pointer">
            <Camera className="w-6 h-6" />
            <span className="text-xs">Tap to take or upload a photo</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
          </label>
        )}
        {photoPreview && !aiResult && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="mt-2 w-full bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            {analyzing ? (<><Spinner className="w-4 h-4" /> Analyzing…</>) : (<><Sparkles className="w-4 h-4" /> Analyze with AI</>)}
          </button>
        )}
        {aiResult && (
          <div className={`mt-2 rounded-xl px-3 py-2 text-xs ${aiResult.relevant === false ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
            {aiResult.relevant === false
              ? "AI didn't recognize a civic issue in this photo — you can still fill in the details manually."
              : "AI suggested a category, severity, and description below. Feel free to edit them."}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Severity</p>
        <div className="flex gap-2">
          {Object.entries(SEVERITY_META).map(([k, meta]) => (
            <button
              key={k}
              onClick={() => setSeverity(k)}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium ${
                severity === k ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-200 bg-white text-slate-600"
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's the issue?"
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Location</p>
        <button
          onClick={handleUseLocation}
          disabled={locating}
          className="w-full bg-white border border-stone-200 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 mb-2"
        >
          {locating ? (<><Spinner className="w-4 h-4" /> Locating…</>) : (<><Navigation className="w-4 h-4" /> Use my current location</>)}
        </button>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="number" step="any" placeholder="Latitude" value={lat ?? ""}
            onChange={(e) => setLat(e.target.value === "" ? null : parseFloat(e.target.value))}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <input
            type="number" step="any" placeholder="Longitude" value={lng ?? ""}
            onChange={(e) => setLng(e.target.value === "" ? null : parseFloat(e.target.value))}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <input
          value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)}
          placeholder="Landmark or address (optional)"
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
        />
        {lat != null && lng != null && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Your name (for the leaderboard)</p>
        <input
          value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ryann"
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 font-medium flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
      >
        {submitting ? (<><Spinner className="w-4 h-4" /> Submitting…</>) : (<><Send className="w-4 h-4" /> Submit report</>)}
      </button>
    </div>
  );
}

/* ---------------------------------- Map tab ---------------------------------- */

function MapTab({ allReports, projects, onOpenDetail, baseLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [leafletState, setLeafletState] = useState("loading");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProjects, setShowProjects] = useState(true);
  const [nearMe, setNearMe] = useState(false);

  useEffect(() => {
    if (window.L) { setLeafletState("ready"); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.async = true;
    script.onload = () => setLeafletState("ready");
    script.onerror = () => setLeafletState("failed");
    document.body.appendChild(script);
    const t = setTimeout(() => setLeafletState((s) => (s === "loading" ? "failed" : s)), 6000);
    return () => clearTimeout(t);
  }, []);

  const filteredReports = useMemo(
    () =>
      allReports.filter((r) => {
        if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        return true;
      }),
    [allReports, categoryFilter, statusFilter]
  );

  const sortedForList = useMemo(() => {
    if (!nearMe) return filteredReports;
    return [...filteredReports].sort(
      (a, b) =>
        haversineKm(baseLocation.lat, baseLocation.lng, a.lat, a.lng) -
        haversineKm(baseLocation.lat, baseLocation.lng, b.lat, b.lng)
    );
  }, [filteredReports, nearMe, baseLocation]);

  useEffect(() => {
    if (leafletState !== "ready" || !containerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = window.L.map(containerRef.current).setView([baseLocation.lat, baseLocation.lng], 13);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapRef.current);
    }
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    filteredReports.forEach((r) => {
      const meta = CATEGORY_META[r.category] || CATEGORY_META.other;
      const marker = window.L.circleMarker([r.lat, r.lng], {
        radius: 8, color: meta.color, fillColor: meta.color, fillOpacity: 0.85, weight: 2,
      }).addTo(mapRef.current);
      marker.bindPopup(`<b>${meta.label}</b><br/>${r.description.slice(0, 80)}`);
      marker.on("click", () => onOpenDetail("report", r));
      markersRef.current.push(marker);
    });

    if (showProjects) {
      projects.forEach((p) => {
        const marker = window.L.marker([p.lat, p.lng], {
          icon: window.L.divIcon({
            className: "",
            html: '<div style="background:#1e293b;width:14px;height:14px;border-radius:4px;border:2px solid white;"></div>',
          }),
        }).addTo(mapRef.current);
        marker.bindPopup(`<b>${p.name}</b><br/>${p.scheme}`);
        marker.on("click", () => onOpenDetail("project", p));
        markersRef.current.push(marker);
      });
    }
  }, [leafletState, filteredReports, showProjects, projects, baseLocation]);

  useEffect(
    () => () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    },
    []
  );

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Map explorer</h2>
        <p className="text-sm text-slate-500">Reports and ongoing projects near you.</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-stone-200 rounded-full px-3 py-1.5 text-xs flex-shrink-0 bg-white">
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_META).map(([k, m]) => (
            <option key={k} value={k}>{m.label}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-stone-200 rounded-full px-3 py-1.5 text-xs flex-shrink-0 bg-white">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_META).map(([k, m]) => (
            <option key={k} value={k}>{m.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowProjects((s) => !s)}
          className={`px-3 py-1.5 rounded-full text-xs flex-shrink-0 border ${showProjects ? "bg-slate-800 text-white border-slate-800" : "bg-white border-stone-200 text-slate-600"}`}
        >
          Projects
        </button>
        <button
          onClick={() => setNearMe((s) => !s)}
          className={`px-3 py-1.5 rounded-full text-xs flex-shrink-0 border flex items-center gap-1 ${nearMe ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-stone-200 text-slate-600"}`}
        >
          <Navigation className="w-3 h-3" /> Near me
        </button>
      </div>

      {leafletState === "ready" && <div ref={containerRef} className="w-full h-72 rounded-2xl overflow-hidden border border-stone-200" />}
      {leafletState === "loading" && (
        <div className="w-full h-72 rounded-2xl border border-stone-200 flex items-center justify-center text-slate-400 gap-2">
          <Spinner className="w-5 h-5" /> Loading map…
        </div>
      )}
      {leafletState === "failed" && (
        <div className="w-full rounded-2xl border border-dashed border-stone-300 p-4 text-xs text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" /> Map tiles unavailable right now — showing a list view instead, which also works offline.
        </div>
      )}

      <div className="space-y-2">
        {sortedForList.length === 0 ? (
          <EmptyState icon={MapIcon} title="No matching reports" subtitle="Try adjusting your filters." />
        ) : (
          sortedForList.map((r) => {
            const meta = CATEGORY_META[r.category] || CATEGORY_META.other;
            const dist = haversineKm(baseLocation.lat, baseLocation.lng, r.lat, r.lng);
            return (
              <button key={r.id} onClick={() => onOpenDetail("report", r)} className="w-full bg-white rounded-xl p-3 border border-stone-100 flex items-center gap-3 text-left">
                <IconCircle Icon={meta.icon} bg={meta.bg} text={meta.text} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.description}</p>
                  <p className="text-xs text-slate-400">{dist.toFixed(1)} km away • {timeAgo(r.timestamp)}</p>
                </div>
                <StatusPill status={r.status} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Directory tab ---------------------------------- */

function DirectoryTab({ projects, builders, onOpenDetail }) {
  const [sub, setSub] = useState("projects");
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.scheme.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBuilders = builders.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Directory</h2>
        <p className="text-sm text-slate-500">Builders, contractors, projects & schemes.</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSub("projects")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${sub === "projects" ? "bg-slate-900 text-white" : "bg-white border border-stone-200 text-slate-600"}`}
        >
          Projects & Schemes
        </button>
        <button
          onClick={() => setSub("builders")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${sub === "builders" ? "bg-slate-900 text-white" : "bg-white border border-stone-200 text-slate-600"}`}
        >
          Builders & Contractors
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={sub === "projects" ? "Search projects or schemes…" : "Search builders…"}
          className="w-full border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {sub === "projects" ? (
        <div className="space-y-2">
          {filteredProjects.map((p) => {
            const typeMeta = PROJECT_TYPE_META[p.type] || PROJECT_TYPE_META.other;
            const builder = builders.find((b) => b.id === p.builderId);
            return (
              <button key={p.id} onClick={() => onOpenDetail("project", p)} className="w-full bg-white rounded-xl p-3 border border-stone-100 flex items-center gap-3 text-left">
                <IconCircle Icon={typeMeta.icon} bg="bg-slate-100" text="text-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 truncate">{p.scheme} • {builder?.name}</p>
                </div>
                <StatusPill status={p.status} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredBuilders.map((b) => (
            <button key={b.id} onClick={() => onOpenDetail("builder", b)} className="bg-white rounded-xl p-3 border border-stone-100 text-left">
              <div className="flex items-center justify-between mb-1 gap-2">
                <p className="text-sm font-medium text-slate-800 min-w-0 truncate">{b.name}</p>
                <TypePill type={b.type} />
              </div>
              <p className="text-xs text-slate-400">{b.category}</p>
              <div className="flex items-center gap-1 mt-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3" fill={i < Math.round(b.rating) ? "currentColor" : "none"} />
                ))}
                <span className="text-xs text-slate-400 ml-1">{b.rating.toFixed(1)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-400 pt-2">
        Directory entries are sample data for this prototype — connect your local open-data feed for verified builder and project records.
      </p>
    </div>
  );
}

/* ---------------------------------- Environment tab ---------------------------------- */

function EnvironmentTab({ baseLocation, projects }) {
  const [target, setTarget] = useState("me");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeCoords = useMemo(() => {
    if (target === "me") return { lat: baseLocation.lat, lng: baseLocation.lng };
    const proj = projects.find((p) => p.id === target);
    return proj ? { lat: proj.lat, lng: proj.lng } : { lat: baseLocation.lat, lng: baseLocation.lng };
  }, [target, projects, baseLocation]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      const { lat, lng } = activeCoords;
      try {
        const [weatherRes, airRes, elevRes] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code&hourly=temperature_2m&forecast_days=1&timezone=auto`
          ).then((r) => (r.ok ? r.json() : Promise.reject(new Error("weather")))),
          fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5,pm10,ozone,nitrogen_dioxide,us_aqi&hourly=us_aqi&forecast_days=1&timezone=auto`
          ).then((r) => (r.ok ? r.json() : Promise.reject(new Error("air")))),
          fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`).then((r) =>
            r.ok ? r.json() : Promise.reject(new Error("elev"))
          ),
        ]);
        if (cancelled) return;
        setData({
          weather: weatherRes.current,
          hourlyTemp: weatherRes.hourly,
          air: airRes.current,
          hourlyAqi: airRes.hourly,
          elevation: elevRes.elevation ? elevRes.elevation[0] : null,
          soil: estimateIndex(lat, lng, 1),
          water: estimateIndex(lat, lng, 2),
        });
      } catch (e) {
        if (!cancelled) setError("Live environmental data is unavailable right now — try again in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [activeCoords.lat, activeCoords.lng]);

  const chartData = useMemo(() => {
    if (!data || !data.hourlyTemp) return [];
    return data.hourlyTemp.time.slice(0, 24).map((t, i) => ({
      hour: t.slice(11, 13) + "h",
      temp: data.hourlyTemp.temperature_2m[i],
      aqi: data.hourlyAqi ? data.hourlyAqi.us_aqi[i] : null,
    }));
  }, [data]);

  const wInfo = data ? weatherInfo(data.weather.weather_code) : null;
  const aInfo = data && data.air ? aqiInfo(data.air.us_aqi) : null;

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Environment monitor</h2>
        <p className="text-sm text-slate-500">Live weather & air quality for any location.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTarget("me")}
          className={`px-3 py-1.5 rounded-full text-xs flex-shrink-0 border ${target === "me" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-stone-200 text-slate-600"}`}
        >
          My location
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setTarget(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs flex-shrink-0 border ${target === p.id ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-stone-200 text-slate-600"}`}
          >
            {p.name.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Spinner className="w-5 h-5" /> Fetching live data…
        </div>
      )}
      {error && (
        <div className="bg-amber-50 text-amber-800 text-xs rounded-xl px-3 py-2 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs"><Thermometer className="w-4 h-4" /> Temperature</div>
              <p className="text-2xl font-semibold text-slate-800">{data.weather.temperature_2m}°C</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                {wInfo && wInfo.icon && <wInfo.icon className="w-3.5 h-3.5" />} {wInfo?.label}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs"><Gauge className="w-4 h-4" /> Pressure</div>
              <p className="text-2xl font-semibold text-slate-800">{data.weather.pressure_msl} hPa</p>
              <p className="text-xs text-slate-400 mt-1">Wind {data.weather.wind_speed_10m} km/h • {data.weather.relative_humidity_2m}% humidity</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs"><Wind className="w-4 h-4" /> Air quality (US AQI)</div>
              <p className="text-2xl font-semibold" style={{ color: aInfo?.color }}>{data.air.us_aqi ?? "—"}</p>
              <p className="text-xs mt-1" style={{ color: aInfo?.color }}>{aInfo?.label}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs"><Mountain className="w-4 h-4" /> Altitude</div>
              <p className="text-2xl font-semibold text-slate-800">{data.elevation != null ? `${Math.round(data.elevation)} m` : "—"}</p>
              <p className="text-xs text-slate-400 mt-1">{activeCoords.lat.toFixed(3)}, {activeCoords.lng.toFixed(3)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-dashed border-stone-300">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs"><Leaf className="w-4 h-4" /> Soil health (estimated)</div>
              <p className="text-2xl font-semibold text-slate-700">{data.soil}/100</p>
              <p className="text-xs text-slate-400 mt-1">Placeholder model — connect a soil sensor feed for verified data.</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-dashed border-stone-300">
              <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs"><Droplets className="w-4 h-4" /> Water quality (estimated)</div>
              <p className="text-2xl font-semibold text-slate-700">{data.water}/100</p>
              <p className="text-xs text-slate-400 mt-1">Placeholder model — connect a water-testing feed for verified data.</p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-stone-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Today's hourly trend</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="#16a34a" strokeWidth={2} dot={false} name="Temp °C" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------- Insights tab ---------------------------------- */

function InsightsTab({ allReports }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const byCategory = useMemo(() => {
    const counts = {};
    allReports.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({
      name: (CATEGORY_META[k] || {}).label || k,
      value: v,
      color: (CATEGORY_META[k] || {}).color || "#94a3b8",
    }));
  }, [allReports]);

  const byStatus = useMemo(() => {
    const counts = {};
    allReports.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: (STATUS_META[k] || {}).label || k, value: v }));
  }, [allReports]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const text = await generateInsightsWithAI(allReports);
      setSummary(text);
    } catch (e) {
      setError("AI summary is unavailable right now — please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Insights</h2>
        <p className="text-sm text-slate-500">AI-generated analysis and trend summaries.</p>
      </div>

      <button onClick={handleGenerate} disabled={loading} className="w-full bg-slate-900 text-white rounded-2xl py-3 font-medium flex items-center justify-center gap-2">
        {loading ? (<><Spinner className="w-4 h-4" /> Analyzing reports…</>) : (<><Sparkles className="w-4 h-4" /> Generate AI summary</>)}
      </button>

      {error && <div className="bg-amber-50 text-amber-800 text-xs rounded-xl px-3 py-2">{error}</div>}
      {summary && <div className="bg-white rounded-2xl p-4 border border-stone-100 text-sm text-slate-700 leading-relaxed">{summary}</div>}

      <div className="bg-white rounded-2xl p-4 border border-stone-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">Reports by category</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
              {byCategory.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">Reports by status</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------------------------- Profile tab ---------------------------------- */

function ProfileTab({ profile, allReports, onUpdateProfile, onDeleteReport, showToast, authState, onLogout }) {
  const [nameDraft, setNameDraft] = useState(profile.displayName || "");
  const [emergencyNote, setEmergencyNote] = useState(profile.emergencyNote || "");

  const leaderboard = useMemo(() => {
    const totals = {};
    allReports.forEach((r) => {
      const key = r.reporterName || "Guest";
      totals[key] = (totals[key] || 0) + reportPoints(r);
    });
    return Object.entries(totals)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  }, [allReports]);

  const myReports = allReports.filter((r) => (profile.myReportIds || []).includes(r.id));
  const myPoints = myReports.reduce((s, r) => s + reportPoints(r), 0);
  const tier = tierForPoints(myPoints);

  async function saveName() {
    await onUpdateProfile({ displayName: nameDraft.trim() });
    showToast("Name updated");
  }

  async function saveEmergencyNote() {
    await onUpdateProfile({ emergencyNote: emergencyNote.trim() });
    showToast("Saved");
  }

  async function resetProfile() {
    await onUpdateProfile({ displayName: "", myReportIds: [], emergencyNote: "" });
    setNameDraft("");
    setEmergencyNote("");
    showToast("Your profile data was reset");
  }

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-500">Your score, reports, and safety info.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-100 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${tier.bg}`}>
          <Award className={`w-7 h-7 ${tier.text}`} />
        </div>
        <div>
          <p className={`text-sm font-semibold ${tier.text}`}>{tier.label} tier</p>
          <p className="text-2xl font-bold text-slate-800">{myPoints} pts</p>
          <p className="text-xs text-slate-400">{myReports.length} reports submitted</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800">Account</p>
          <p className="text-xs text-slate-400 truncate">
            Signed in via {{ google: "Google", digilocker: "DigiLocker", apple: "Apple", facebook: "Facebook", phone: "Phone", email: "Email", guest: "Guest access" }[authState?.method] || "Guest access"}
          </p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full flex-shrink-0">
          <LogOut className="w-3.5 h-3.5" /> Log out
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Display name</p>
        <div className="flex gap-2">
          <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm" />
          <button onClick={saveName} className="bg-slate-900 text-white px-4 rounded-xl text-sm flex-shrink-0">Save</button>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Leaderboard</p>
        <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-100">
          {leaderboard.map((row, i) => (
            <div key={row.name} className={`flex items-center gap-3 px-4 py-2.5 ${row.name === profile.displayName ? "bg-emerald-50" : ""}`}>
              <span className="w-5 text-sm font-semibold text-slate-400">{i + 1}</span>
              <span className="flex-1 text-sm text-slate-700 truncate">{row.name}</span>
              <span className="text-sm font-semibold text-slate-800">{row.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      {myReports.length > 0 && (
        <div>
          <p className="font-semibold text-slate-800 mb-2">My reports</p>
          <div className="space-y-2">
            {myReports.map((r) => {
              const meta = CATEGORY_META[r.category] || CATEGORY_META.other;
              return (
                <div key={r.id} className="bg-white rounded-xl p-3 border border-stone-100 flex items-center gap-3">
                  <IconCircle Icon={meta.icon} bg={meta.bg} text={meta.text} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.description}</p>
                    <p className="text-xs text-slate-400">{timeAgo(r.timestamp)}</p>
                  </div>
                  <button onClick={() => onDeleteReport(r.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Safety tips for reporting</p>
        <ul className="bg-white rounded-2xl border border-stone-100 p-4 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
          <li>Keep a safe distance from traffic, machinery, and unstable structures.</li>
          <li>Never enter a barricaded or actively worked construction site.</li>
          <li>Use your camera's zoom instead of walking closer to a hazard.</li>
          <li>Be visible — wear light or reflective clothing when reporting at night.</li>
          <li>Don't attempt to move debris, hazards, or waste yourself — just report it.</li>
        </ul>
      </div>

      <div>
        <p className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Phone className="w-4 h-4" /> Emergency contacts</p>
        <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-2">
          <p className="text-xs text-slate-500">For immediate danger, use your local emergency number (e.g. 911, 112, or 999 depending on your country).</p>
          <textarea
            value={emergencyNote}
            onChange={(e) => setEmergencyNote(e.target.value)}
            rows={2}
            placeholder="Add your local municipal helpline, utility, or emergency numbers here…"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
          />
          <button onClick={saveEmergencyNote} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-full">Save</button>
        </div>
      </div>

      <button onClick={resetProfile} className="w-full border border-red-200 text-red-600 rounded-2xl py-2.5 text-sm font-medium">
        Reset my profile data
      </button>
    </div>
  );
}

/* ---------------------------------- Auth gate (login / sign up) ---------------------------------- */

function GoogleGIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.42 3.58v3h3.91c2.29-2.11 3.53-5.22 3.53-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.91-3c-1.08.72-2.45 1.16-4.02 1.16-3.1 0-5.72-2.09-6.66-4.9H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.34 14.36c-.24-.72-.38-1.49-.38-2.36s.14-1.64.38-2.36V6.55H1.3A11.98 11.98 0 000 12c0 1.93.46 3.76 1.3 5.45l4.04-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.55l4.04 3.09c.94-2.81 3.56-4.89 6.66-4.89z" />
    </svg>
  );
}

function AuthGate({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(null);

  function finish(method, displayName) {
    onAuthenticated({ method, name: displayName || "Guest" });
  }

  function handleConnector(methodId) {
    if (connecting) return;
    setConnecting(methodId);
    const fallback = { google: "Google User", digilocker: "DigiLocker User", apple: "Apple User", facebook: "Facebook User", phone: "Phone User" }[methodId];
    setTimeout(() => {
      setConnecting(null);
      finish(methodId, name.trim() || fallback);
    }, 800);
  }

  function handleEmailSubmit() {
    if (connecting) return;
    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) return;
    setConnecting("email");
    setTimeout(() => {
      setConnecting(null);
      finish("email", name.trim() || email.split("@")[0]);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mb-3">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-xl text-slate-900">CLIMAX</h1>
          <p className="text-xs text-slate-500">Environmental & civic intelligence</p>
        </div>

        <div className="flex bg-stone-100 rounded-full p-1 mb-5">
          <button onClick={() => setMode("login")} className={`flex-1 py-1.5 rounded-full text-sm font-medium ${mode === "login" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>
            Log In
          </button>
          <button onClick={() => setMode("signup")} className={`flex-1 py-1.5 rounded-full text-sm font-medium ${mode === "signup" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>
            Sign Up
          </button>
        </div>

        {mode === "signup" && (
          <input
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm mb-2"
          />
        )}

        <div className="space-y-2 mb-4">
          <button onClick={() => handleConnector("google")} disabled={!!connecting} className="w-full flex items-center justify-center gap-2 bg-white border border-stone-300 rounded-xl py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60">
            {connecting === "google" ? <Spinner className="w-4 h-4" /> : <GoogleGIcon className="w-4 h-4" />}
            Continue with Google
          </button>
          <button onClick={() => handleConnector("digilocker")} disabled={!!connecting} className="w-full flex items-center justify-center gap-2 bg-blue-700 rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-60">
            {connecting === "digilocker" ? <Spinner className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            Continue with DigiLocker
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleConnector("apple")} disabled={!!connecting} className="flex items-center justify-center gap-1.5 bg-slate-900 rounded-xl py-2.5 text-xs font-medium text-white disabled:opacity-60">
              {connecting === "apple" && <Spinner className="w-3.5 h-3.5" />} Apple
            </button>
            <button onClick={() => handleConnector("facebook")} disabled={!!connecting} className="flex items-center justify-center gap-1.5 bg-blue-600 rounded-xl py-2.5 text-xs font-medium text-white disabled:opacity-60">
              {connecting === "facebook" && <Spinner className="w-3.5 h-3.5" />} Facebook
            </button>
          </div>
          <button onClick={() => handleConnector("phone")} disabled={!!connecting} className="w-full flex items-center justify-center gap-2 bg-white border border-stone-300 rounded-xl py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60">
            {connecting === "phone" ? <Spinner className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            Continue with Phone
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-slate-400">or use email</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm" />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm" />
          </div>
        </div>

        <button onClick={handleEmailSubmit} disabled={!!connecting} className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 mb-3 disabled:opacity-60">
          {connecting === "email" ? <Spinner className="w-4 h-4" /> : mode === "signup" ? <UserPlus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {mode === "signup" ? "Create account" : "Log in"}
        </button>

        <button onClick={() => finish("guest", name.trim() || "Guest")} className="w-full text-center text-xs text-slate-400 underline">
          Continue as guest
        </button>

        <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
          Demo sign-in — these buttons simulate a login for this prototype and aren't connected to real Google or DigiLocker accounts.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------- Root App ---------------------------------- */

export default function App() {
  const [reports, setReports] = useState([]);
  const [comments, setComments] = useState({});
  const [profile, setProfile] = useState({ displayName: "", myReportIds: [], emergencyNote: "" });
  const [activeTab, setActiveTab] = useState("home");
  const [detailItem, setDetailItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [baseLocation, setBaseLocation] = useState({ lat: 40.7128, lng: -74.006, accurate: false });
  const [loadingInit, setLoadingInit] = useState(true);
  const [authState, setAuthState] = useState({ loggedIn: false });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    (async () => {
      const [storedReports, storedComments, storedProfile, storedAuth] = await Promise.all([
        storageGet("climax-reports", true, []),
        storageGet("climax-comments", true, {}),
        storageGet("climax-profile", false, { displayName: "", myReportIds: [], emergencyNote: "" }),
        storageGet("climax-auth", false, { loggedIn: false }),
      ]);
      setReports(storedReports || []);
      setComments(storedComments || {});
      setProfile(storedProfile || { displayName: "", myReportIds: [], emergencyNote: "" });
      setAuthState(storedAuth || { loggedIn: false });
      try {
        const pos = await getCurrentPosition();
        setBaseLocation({ lat: pos.lat, lng: pos.lng, accurate: true });
      } catch (e) {
        setBaseLocation({ lat: 40.7128, lng: -74.006, accurate: false });
      }
      setLoadingInit(false);
    })();
  }, []);

  async function retryLocation() {
    try {
      const pos = await getCurrentPosition();
      setBaseLocation({ lat: pos.lat, lng: pos.lng, accurate: true });
      showToast("Location updated");
    } catch (e) {
      showToast("Couldn't access location — check browser permissions");
    }
  }

  const projects = useMemo(
    () =>
      SEED_PROJECTS_BASE.map((p, i) => ({
        ...p,
        lat: baseLocation.lat + PROJECT_SEED_OFFSETS[i][0],
        lng: baseLocation.lng + PROJECT_SEED_OFFSETS[i][1],
      })),
    [baseLocation]
  );

  const builderById = useMemo(() => {
    const map = {};
    SEED_BUILDERS.forEach((b) => { map[b.id] = b; });
    return map;
  }, []);

  const seedReportsPositioned = useMemo(
    () =>
      SEED_REPORTS_BASE.map((r, i) => ({
        ...r,
        lat: baseLocation.lat + REPORT_SEED_OFFSETS[i][0],
        lng: baseLocation.lng + REPORT_SEED_OFFSETS[i][1],
        timestamp: new Date(Date.now() - r.daysAgo * 86400000).toISOString(),
        upvotes: 0,
      })),
    [baseLocation]
  );

  const allReports = useMemo(
    () => [...reports, ...seedReportsPositioned].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [reports, seedReportsPositioned]
  );

  async function handleAddReport(draft) {
    const newReport = { ...draft, id: uid(), timestamp: new Date().toISOString(), upvotes: 0 };
    const nextReports = [newReport, ...reports];
    setReports(nextReports);
    await storageSet("climax-reports", nextReports, true);
    const nextProfile = { ...profile, myReportIds: [...(profile.myReportIds || []), newReport.id] };
    setProfile(nextProfile);
    await storageSet("climax-profile", nextProfile, false);
    showToast(`Report submitted — +${reportPoints(newReport)} points!`);
    setActiveTab("home");
  }

  async function handleDeleteReport(id) {
    const nextReports = reports.filter((r) => r.id !== id);
    setReports(nextReports);
    await storageSet("climax-reports", nextReports, true);
    const nextProfile = { ...profile, myReportIds: (profile.myReportIds || []).filter((x) => x !== id) };
    setProfile(nextProfile);
    await storageSet("climax-profile", nextProfile, false);
    showToast("Report removed");
  }

  async function handleAddComment(key, text) {
    const entry = { author: profile.displayName || "Guest", text, ts: new Date().toISOString() };
    const next = { ...comments, [key]: [...(comments[key] || []), entry] };
    setComments(next);
    await storageSet("climax-comments", next, true);
  }

  async function handleUpdateProfile(partial) {
    const next = { ...profile, ...partial };
    setProfile(next);
    await storageSet("climax-profile", next, false);
  }

  function openDetail(type, data) {
    setDetailItem({ type, data });
  }

  async function handleAuthenticated(payload) {
    const nextAuth = { loggedIn: true, method: payload.method, name: payload.name, ts: new Date().toISOString() };
    setAuthState(nextAuth);
    await storageSet("climax-auth", nextAuth, false);
    if (payload.name && payload.name !== profile.displayName) {
      const nextProfile = { ...profile, displayName: payload.name };
      setProfile(nextProfile);
      await storageSet("climax-profile", nextProfile, false);
    }
    showToast(`Welcome, ${payload.name}!`);
  }

  async function handleLogout() {
    const nextAuth = { loggedIn: false };
    setAuthState(nextAuth);
    await storageSet("climax-auth", nextAuth, false);
    showToast("Logged out");
  }

  if (!loadingInit && !authState.loggedIn) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-800 pb-8">
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200">
        <div className="max-w-md md:max-w-4xl mx-auto px-4 pt-4 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-900">CLIMAX</h1>
            <p className="text-xs text-slate-500 leading-tight">Environmental & civic intelligence</p>
          </div>
        </div>
        <nav className="max-w-md md:max-w-4xl mx-auto px-3 flex gap-1.5 overflow-x-auto pb-2">
          {TABS.map((t) => {
            const TabIcon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex-shrink-0 ${
                  isActive ? "bg-emerald-600 text-white" : "bg-stone-100 text-slate-600"
                }`}
              >
                <TabIcon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {!baseLocation.accurate && !loadingInit && (
        <div className="max-w-md md:max-w-4xl mx-auto px-4 mt-3">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2 flex items-center justify-between gap-2">
            <span>Using a default location for sample data. Enable location for results near you.</span>
            <button onClick={retryLocation} className="underline flex-shrink-0">Retry</button>
          </div>
        </div>
      )}

      <main className="max-w-md md:max-w-4xl mx-auto px-4 mt-4">
        {loadingInit ? (
          <div className="flex flex-col items-center py-24 gap-3 text-slate-400">
            <Spinner className="w-6 h-6" />
            <p className="text-sm">Loading CLIMAX…</p>
          </div>
        ) : (
          <>
            {activeTab === "home" && (
              <HomeTab profile={profile} allReports={allReports} projects={projects} onOpenDetail={openDetail} onNavigate={setActiveTab} />
            )}
            {activeTab === "report" && (
              <ReportTab profile={profile} onAddReport={handleAddReport} onUpdateProfile={handleUpdateProfile} showToast={showToast} />
            )}
            {activeTab === "map" && (
              <MapTab allReports={allReports} projects={projects} onOpenDetail={openDetail} baseLocation={baseLocation} />
            )}
            {activeTab === "directory" && <DirectoryTab projects={projects} builders={SEED_BUILDERS} onOpenDetail={openDetail} />}
            {activeTab === "environment" && <EnvironmentTab baseLocation={baseLocation} projects={projects} />}
            {activeTab === "insights" && <InsightsTab allReports={allReports} />}
            {activeTab === "profile" && (
              <ProfileTab profile={profile} allReports={allReports} onUpdateProfile={handleUpdateProfile} onDeleteReport={handleDeleteReport} showToast={showToast} authState={authState} onLogout={handleLogout} />
            )}
          </>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}

      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          comments={comments}
          onAddComment={handleAddComment}
          builderById={builderById}
          allReports={allReports}
          projects={projects}
        />
      )}
    </div>
  );
}
