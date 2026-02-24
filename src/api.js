/**
 * REoptimizer Mobile API Client
 * Base URL: https://stage.reoptimizer.ai/api/mobile
 * Auth: Sanctum Bearer token
 */

// In dev the Vite proxy rewrites /api/mobile/* → https://stage.reoptimizer.ai/api/mobile/*
// so CORS is bypassed (server-to-server). In production use the full URL from env.
const BASE = import.meta.env.DEV
  ? "/api/mobile"
  : (import.meta.env.VITE_API_URL || "https://stage.reoptimizer.ai/api/mobile");
const DEVICE_NAME = "REoptimizer Mobile Web";

/* ── Token storage (in-memory + localStorage fallback) ── */
let _token = localStorage.getItem("reopt_token") || null;

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem("reopt_token", t);
  else localStorage.removeItem("reopt_token");
}

export function getToken() { return _token; }

/* ── Core fetch wrapper ── */
async function req(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(opts.headers || {}),
  };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  let json;
  try { json = await res.json(); } catch { json = {}; }

  if (!res.ok) {
    const msg = json.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

/* ═══════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════ */

/**
 * Broker login (email + password)
 * POST /auth/login
 * Returns: { user, token, user_type }
 */
export async function loginBroker(email, password) {
  const json = await req("/auth/login", {
    method: "POST",
    body: { email, password, device_name: DEVICE_NAME },
  });
  const { token, user, user_type } = json.data;
  setToken(token);
  return { user, token, user_type };
}

/**
 * Attendee OTP step 1 — request OTP
 * POST /auth/attendee/request-otp
 */
export async function requestOtp(email) {
  return req("/auth/attendee/request-otp", {
    method: "POST",
    body: { email },
  });
}

/**
 * Attendee OTP step 2 — verify OTP and get token
 * POST /auth/attendee/verify-otp
 * Returns: { user, token, user_type, attendee }
 */
export async function verifyOtp(email, otp) {
  const json = await req("/auth/attendee/verify-otp", {
    method: "POST",
    body: { email, otp, device_name: DEVICE_NAME },
  });
  const { token, user, user_type, attendee } = json.data;
  setToken(token);
  return { user, token, user_type, attendee };
}

/**
 * Logout — revoke token
 * POST /auth/logout
 */
export async function logout() {
  try {
    await req("/auth/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

/**
 * Get current authenticated user
 * GET /auth/user
 */
export async function getAuthUser() {
  const json = await req("/auth/user");
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */

/**
 * GET /dashboard
 * Returns: { user, stats, recent_tours, active_projects, sites }
 */
export async function getDashboard() {
  const json = await req("/dashboard");
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   SITES
═══════════════════════════════════════════════════════ */

/**
 * GET /sites
 * Returns: array of site objects
 */
export async function getSites() {
  const json = await req("/sites");
  return json.data || [];
}

/**
 * GET /sites/{id}
 */
export async function getSite(id) {
  const json = await req(`/sites/${id}`);
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   PROJECTS
═══════════════════════════════════════════════════════ */

/**
 * GET /projects
 * Returns: array of project objects
 */
export async function getProjects() {
  const json = await req("/projects");
  return json.data || [];
}

/**
 * GET /projects/{id}
 */
export async function getProject(id) {
  const json = await req(`/projects/${id}`);
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   BUILDINGS
═══════════════════════════════════════════════════════ */

/**
 * GET /buildings
 */
export async function getBuildings() {
  const json = await req("/buildings");
  return json.data || [];
}

/**
 * GET /buildings/{id}
 */
export async function getBuilding(id) {
  const json = await req(`/buildings/${id}`);
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   COMPS
═══════════════════════════════════════════════════════ */

/**
 * GET /comps
 * Returns: array of comp objects
 */
export async function getComps() {
  const json = await req("/comps");
  return json.data || [];
}

/**
 * GET /comps/{id}
 */
export async function getComp(id) {
  const json = await req(`/comps/${id}`);
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   CONTACTS
═══════════════════════════════════════════════════════ */

/**
 * GET /contacts
 * Optional query: { type, search, per_page }
 */
export async function getContacts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const json = await req(`/contacts${qs ? "?" + qs : ""}`);
  return json.data || [];
}

/**
 * GET /{entityType}/{entityId}/contacts
 * entityType: "buildings" | "sites" | "projects" | "comps"
 */
export async function getEntityContacts(entityType, entityId) {
  const json = await req(`/${entityType}/${entityId}/contacts`);
  return json.data || [];
}

/* ═══════════════════════════════════════════════════════
   TOURS
═══════════════════════════════════════════════════════ */

/**
 * GET /tours
 * Returns: array of tour objects
 */
export async function getTours() {
  const json = await req("/tours");
  return json.data || [];
}

/**
 * GET /tours/{id}
 */
export async function getTour(id) {
  const json = await req(`/tours/${id}`);
  return json.data;
}

/**
 * POST /tours/{tour}/respond
 * response: "accepted" | "declined"
 */
export async function respondToTour(tourId, response) {
  const json = await req(`/tours/${tourId}/respond`, {
    method: "POST",
    body: { response },
  });
  return json.data;
}

/**
 * GET /tours/{tour}/invitation-status
 */
export async function getTourInvitationStatus(tourId) {
  const json = await req(`/tours/${tourId}/invitation-status`);
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   TOUR SCORING (attendees only)
═══════════════════════════════════════════════════════ */

/**
 * GET /tours/{tour}/ksds
 * Returns: array of KSD objects { id, driver, description, category, default_weight }
 */
export async function getTourKSDs(tourId) {
  const json = await req(`/tours/${tourId}/ksds`);
  return json.data || [];
}

/**
 * GET /tours/{tour}/weights
 */
export async function getTourWeights(tourId) {
  const json = await req(`/tours/${tourId}/weights`);
  return json.data || [];
}

/**
 * PUT /tours/{tour}/weights
 * weights: [{ ksd_id, weight }]
 */
export async function updateTourWeights(tourId, weights) {
  const json = await req(`/tours/${tourId}/weights`, {
    method: "PUT",
    body: { weights },
  });
  return json.data;
}

/**
 * POST /tours/{tour}/comps/{comp}/score
 * scores: [{ ksd_id, score }], notes?: string
 */
export async function submitCompScores(tourId, compId, scores, notes = "") {
  const json = await req(`/tours/${tourId}/comps/${compId}/score`, {
    method: "POST",
    body: { scores, notes },
  });
  return json.data;
}

/**
 * GET /tours/{tour}/comps/{comp}/scores
 */
export async function getCompScores(tourId, compId) {
  const json = await req(`/tours/${tourId}/comps/${compId}/scores`);
  return json.data || [];
}

/* ═══════════════════════════════════════════════════════
   GEOFENCES
═══════════════════════════════════════════════════════ */

/**
 * GET /geofences
 */
export async function getGeofences(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const json = await req(`/geofences${qs ? "?" + qs : ""}`);
  return json.data || [];
}

/**
 * POST /geofences/events
 * body: { geofence_id, event_type, latitude, longitude, tour_id?, device_id?, accuracy_meters?, metadata? }
 */
export async function logGeofenceEvent(payload) {
  const json = await req("/geofences/events", {
    method: "POST",
    body: payload,
  });
  return json.data;
}

/* ═══════════════════════════════════════════════════════
   DATA NORMALIZERS
   Map API response shapes → app's internal shape
═══════════════════════════════════════════════════════ */

/**
 * Normalize API site → app site format
 * API: { id, building: { id, building_name, address, city, state, latitude, longitude } }
 * App: { id, name, addr, type, sqft, ch, status, last }
 */
export function normalizeSite(apiSite) {
  const b = apiSite.building || {};
  const addrParts = [b.address, b.city, b.state].filter(Boolean);
  return {
    id: String(apiSite.id),
    _apiId: apiSite.id,
    name: b.building_name || `Site ${apiSite.id}`,
    addr: addrParts.join(", ") || "—",
    type: apiSite.type || "Owned",
    sqft: apiSite.sqft || b.total_square_footage || 0,
    ch: apiSite.clear_height || 0,
    status: apiSite.status || "Active",
    last: apiSite.updated_at ? new Date(apiSite.updated_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—",
    lat: b.latitude,
    lng: b.longitude,
    _raw: apiSite,
  };
}

/**
 * Normalize API project → app project format
 * API: { id, name, description, status, project_type, sites_count, comps_count }
 * App: { id, name, siteId, stage, contacts, comps }
 */
export function normalizeProject(apiProject) {
  return {
    id: String(apiProject.id),
    _apiId: apiProject.id,
    name: apiProject.name || `Project ${apiProject.id}`,
    siteId: String(apiProject.site_id || ""),
    stage: apiProject.status || "Initial Outreach",
    contacts: (apiProject.contacts || []).map(c => c.name || c.email || ""),
    comps: (apiProject.comps || []).map(c => String(c.id ?? c)),
    _raw: apiProject,
  };
}

/**
 * Normalize API comp → app comp format
 * API: { id, building_name, address, city, state, total_square_footage, year_built }
 * App: { id, pid, name, addr, sqft, ch, rent, scores }
 */
export function normalizeComp(apiComp) {
  const addrParts = [apiComp.address, apiComp.city, apiComp.state].filter(Boolean);
  return {
    id: String(apiComp.id),
    _apiId: apiComp.id,
    pid: String(apiComp.project_id || ""),
    name: apiComp.building_name || `Comp ${apiComp.id}`,
    addr: addrParts.join(", ") || "—",
    sqft: apiComp.total_square_footage || 0,
    ch: apiComp.clear_height || 0,
    rent: apiComp.rent || 0,
    scores: apiComp.scores || { ch: 0, pc: 0, hp: 0, la: 0, ur: 0, tr: 0 },
    lat: apiComp.latitude,
    lng: apiComp.longitude,
    _raw: apiComp,
  };
}

/**
 * Normalize API tour → app tour format
 * API: { id, name, description, date, status, comps_count, schedule, attendees, project }
 * App: { id, pid, name, date, status, contacts, comps, times }
 */
export function normalizeTour(apiTour) {
  // Build comps list from schedule (slot_type != "break" or "lunch")
  const schedule = apiTour.schedule || [];
  const compBuildings = schedule
    .filter(s => s.building)
    .map(s => ({
      id: String(s.id),
      buildingId: String(s.building.id),
      name: s.building.name,
      addr: s.building.address,
      lat: s.building.latitude,
      lng: s.building.longitude,
      startTime: s.start_date_time,
      endTime: s.end_date_time,
      seqOrder: s.sequence_order,
      slotType: s.slot_type,
      driveMins: s.drive_time_minutes,
      distMiles: s.distance_miles,
      geofence: s.geofence,
    }));

  // Build contacts from project.contacts + attendees
  const projContacts = (apiTour.project?.contacts || []).map(c => ({
    id: String(c.id),
    name: c.name,
    email: c.email,
    role: c.type || c.title || "Contact",
    cell: c.cell,
    phone: c.phone,
    company: c.company_name || c.company?.name,
  }));
  const attendees = (apiTour.attendees || []).map(a => ({
    id: String(a.id),
    name: a.name,
    email: a.email,
    role: a.role || "Attendee",
  }));

  // Times map: compId → formatted time
  const times = {};
  compBuildings.forEach(b => {
    if (b.startTime) {
      times[b.buildingId] = new Date(b.startTime).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true,
      });
    }
  });

  return {
    id: String(apiTour.id),
    _apiId: apiTour.id,
    pid: String(apiTour.project?.id || ""),
    name: apiTour.name || `Tour ${apiTour.id}`,
    date: apiTour.date || "TBD",
    status: apiTour.status || "Scheduled",
    contacts: [...projContacts, ...attendees],
    comps: compBuildings.map(b => b.buildingId),
    times,
    schedule: compBuildings,
    site: apiTour.site,
    creator: apiTour.creator,
    _raw: apiTour,
  };
}

/**
 * Normalize API user → app user format
 */
export function normalizeUser(apiUser, userType, attendeeInfo) {
  const initials = (apiUser.name || "?")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return {
    id: String(apiUser.id),
    _apiId: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    av: initials,
    role: userType === "attendee" ? "guest" : "user",
    user_type: userType,
    attendee: attendeeInfo || null,
    token: _token,
  };
}
