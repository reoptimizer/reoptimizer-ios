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
   Map real API response shapes → app's internal shape
   Based on live API responses from stage.reoptimizer.ai
═══════════════════════════════════════════════════════ */

/**
 * Normalize API site → app site format
 *
 * Real API shape (GET /sites list):
 *   { id, client_id, building: { id, address, city, state, zip,
 *     latitude, longitude, total_square_footage, building_type, image_url },
 *     created_at }
 *
 * Real API shape (GET /sites/{id} detail):
 *   { id, building: { id, address, city, state, zip, country,
 *     latitude, longitude, total_square_footage, year_built,
 *     building_type, description, image_url },
 *     units_count, leases_count, expenses_count,
 *     contacts: [{ id, name, email, phone, company }],
 *     created_at, updated_at }
 */
export function normalizeSite(apiSite) {
  const b = apiSite.building || {};
  const addrParts = [b.address, b.city, b.state].filter(Boolean);
  const fullAddr = [b.address, b.city, b.state, b.zip].filter(Boolean).join(", ");

  return {
    id: String(apiSite.id),
    _apiId: apiSite.id,
    // Sites have no standalone name — use address as name
    name: b.address ? `${b.address}, ${b.city || ""} ${b.state || ""}`.trim() : `Site ${apiSite.id}`,
    addr: fullAddr || "—",
    type: b.building_type || "Office",
    sqft: b.total_square_footage || 0,
    yearBuilt: b.year_built || null,
    status: "Active", // API doesn't return a status field on sites list
    last: apiSite.updated_at
      ? new Date(apiSite.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : apiSite.created_at
        ? new Date(apiSite.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—",
    lat: b.latitude || null,
    lng: b.longitude || null,
    imageUrl: b.image_url || null,
    // Detail-only fields (populated when fetching /sites/{id})
    unitsCount: apiSite.units_count || 0,
    leasesCount: apiSite.leases_count || 0,
    expensesCount: apiSite.expenses_count || 0,
    contacts: (apiSite.contacts || []).map(c => ({
      id: String(c.id),
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company?.name || null,
    })),
    _raw: apiSite,
  };
}

/**
 * Normalize API project → app project format
 *
 * Real API shape (GET /projects list):
 *   { id, name, description, status, project_type, client_id,
 *     created_at, sites_count, comps_count }
 *
 * Real API shape (GET /projects/{id} detail):
 *   { id, name, description, status, project_type, property_usage,
 *     square_footage, budget, created_at, updated_at,
 *     sites: [{ id, building: { id, name, address, city, state, lat, lng } }],
 *     comps: [{ id, building: { id, name, address, city, state } }],
 *     contacts: [], tasks: [] }
 */
export function normalizeProject(apiProject) {
  // From list endpoint: sites_count / comps_count (integers)
  // From detail endpoint: sites[] / comps[] (arrays)
  const sites = apiProject.sites || [];
  const comps = apiProject.comps || [];

  // siteId: first associated site (projects can have multiple but app shows one)
  const primarySite = sites[0];

  return {
    id: String(apiProject.id),
    _apiId: apiProject.id,
    name: apiProject.name || `Project ${apiProject.id}`,
    description: apiProject.description || "",
    // Map API status → app stage label
    stage: apiProject.status || "Active",
    projectType: apiProject.project_type || "",       // "New Location" | "Renewal"
    propertyUsage: apiProject.property_usage || "",   // "Operations" etc.
    siteId: primarySite ? String(primarySite.id) : "",
    // Contact names array (for display in project header)
    contacts: (apiProject.contacts || []).map(c => c.name || c.email || ""),
    // Comp IDs array (strings, matching comp.id format)
    comps: comps.map(c => String(c.id)),
    // Counts (from list endpoint)
    compsCount: apiProject.comps_count ?? comps.length,
    sitesCount: apiProject.sites_count ?? sites.length,
    // Raw detail arrays for full data access
    sitesDetail: sites.map(s => ({
      id: String(s.id),
      name: s.building?.address || `Site ${s.id}`,
      addr: [s.building?.address, s.building?.city, s.building?.state].filter(Boolean).join(", "),
      lat: s.building?.latitude,
      lng: s.building?.longitude,
    })),
    compsDetail: comps.map(c => ({
      id: String(c.id),
      name: c.building?.name || c.building?.address || `Comp ${c.id}`,
      addr: [c.building?.address, c.building?.city, c.building?.state].filter(Boolean).join(", "),
    })),
    tasks: apiProject.tasks || [],
    created_at: apiProject.created_at,
    _raw: apiProject,
  };
}

/**
 * Normalize API comp → app comp format
 *
 * Real API shape (GET /comps list):
 *   { id, project: { id, name }, building: { id, building_name,
 *     address, address_line_2, city, state, zip, latitude, longitude,
 *     building_type, image_url }, notes, score, created_at }
 *
 * Real API shape (GET /comps/{id} detail):
 *   { id, project, building (full), notes, score,
 *     units: [{ id, suite, floor, size, divisible, ti_allowance,
 *               status, is_renewal_space, comment }],
 *     units_count, created_at, updated_at }
 */
export function normalizeComp(apiComp) {
  const b = apiComp.building || {};
  // building_name is a long string like "Building Name, Address" — split on first comma
  const rawName = b.building_name || b.name || "";
  // Use address as fallback display name if building_name is just the address
  const displayName = rawName
    ? rawName.split(",")[0].trim()
    : b.address
      ? `${b.address}, ${b.city || ""}`.trim()
      : `Comp ${apiComp.id}`;

  const addrParts = [b.address, b.city, b.state].filter(Boolean);

  return {
    id: String(apiComp.id),
    _apiId: apiComp.id,
    pid: String(apiComp.project?.id || ""),
    projectName: apiComp.project?.name || "",
    name: displayName,
    fullBuildingName: rawName,           // full untruncated name
    addr: addrParts.join(", ") || "—",
    city: b.city || "",
    state: b.state || "",
    zip: b.zip || "",
    lat: b.latitude || null,
    lng: b.longitude || null,
    sqft: b.total_square_footage || 0,
    yearBuilt: b.year_built || null,
    buildingType: b.building_type || "",
    imageUrl: b.image_url || null,
    score: apiComp.score || 0,           // overall score from API
    notes: apiComp.notes || "",
    // KSD scores — API returns a flat `score` number, not per-KSD breakdown
    // Local scoring state fills the per-KSD detail
    scores: { ch: 0, pc: 0, hp: 0, la: 0, ur: 0, tr: 0 },
    // Units (detail only)
    units: (apiComp.units || []).map(u => ({
      id: String(u.id),
      suite: u.suite || "",
      floor: u.floor,
      size: u.size || 0,
      status: u.status || "Available",
      tiAllowance: u.ti_allowance,
      comment: u.comment || "",
      isRenewal: !!u.is_renewal_space,
    })),
    unitsCount: apiComp.units_count || 0,
    created_at: apiComp.created_at,
    _raw: apiComp,
  };
}

/**
 * Normalize API tour → app tour format
 *
 * Real API shape (GET /tours list):
 *   { id, name, description, date, status, project: { id, name },
 *     creator: { id, name }, comps_count }
 *
 * Real API shape (GET /tours/{id} detail):
 *   { id, name, description, date, status,
 *     project: { id, name, contacts: [] },
 *     site: null,
 *     creator: { id, name },
 *     attendees: [{ id, name, email, role }],
 *     schedule: [{
 *       id, sequence_order, slot_type ("comp"|"lunch"|"drive"),
 *       start_date_time, end_date_time, duration_minutes,
 *       drive_time_minutes (null), distance_miles (null),
 *       building: { id, name, address, latitude, longitude } | null,
 *       geofence: null
 *     }] }
 */
export function normalizeTour(apiTour) {
  const schedule = apiTour.schedule || [];

  // Filter schedule to comp slots only (slot_type === "comp") with a building
  const compSlots = schedule
    .filter(s => s.slot_type === "comp" && s.building)
    .sort((a, b) => a.sequence_order - b.sequence_order);

  // All schedule slots (for display in tour detail / map)
  const allSlots = schedule
    .sort((a, b) => a.sequence_order - b.sequence_order)
    .map(s => ({
      id: String(s.id),
      seqOrder: s.sequence_order,
      slotType: s.slot_type,           // "comp" | "lunch" | "drive"
      startTime: s.start_date_time,
      endTime: s.end_date_time,
      durationMins: s.duration_minutes,
      driveMins: s.drive_time_minutes,
      distMiles: s.distance_miles,
      building: s.building ? {
        id: String(s.building.id),
        name: s.building.name || s.building.address || `Building ${s.building.id}`,
        addr: s.building.address || "",
        lat: s.building.latitude,
        lng: s.building.longitude,
      } : null,
      geofence: s.geofence,
    }));

  // Contacts: project contacts + attendees
  const projContacts = (apiTour.project?.contacts || []).map(c => ({
    id: String(c.id),
    name: c.name,
    email: c.email,
    role: c.type || c.title || "Contact",
    cell: c.cell || null,
    phone: c.phone || null,
    company: c.company_name || c.company?.name || null,
  }));
  const attendees = (apiTour.attendees || []).map(a => ({
    id: String(a.id),
    name: a.name,
    email: a.email,
    role: a.role || "Attendee",
  }));

  // Times map: building.id (string) → formatted time string
  const times = {};
  compSlots.forEach(s => {
    if (s.start_date_time && s.building) {
      try {
        times[String(s.building.id)] = new Date(s.start_date_time).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", hour12: true,
        });
      } catch { /* invalid date — skip */ }
    }
  });

  // Format tour date for display
  let dateDisplay = "TBD";
  if (apiTour.date) {
    try {
      dateDisplay = new Date(apiTour.date).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      });
    } catch { dateDisplay = apiTour.date; }
  }

  return {
    id: String(apiTour.id),
    _apiId: apiTour.id,
    pid: String(apiTour.project?.id || ""),
    projectName: apiTour.project?.name || "",
    name: apiTour.name || `Tour ${apiTour.id}`,
    description: apiTour.description || "",
    date: dateDisplay,
    dateRaw: apiTour.date,
    status: apiTour.status || "Scheduled",
    // comps: array of building IDs (strings) that are comp-type schedule slots
    comps: compSlots.map(s => String(s.building.id)),
    times,
    // All attendees (project contacts + tour attendees)
    contacts: [...projContacts, ...attendees],
    // Full schedule for Map / timeline display
    schedule: allSlots,
    site: apiTour.site || null,
    creator: apiTour.creator || null,
    compsCount: apiTour.comps_count || compSlots.length,
    _raw: apiTour,
  };
}

/**
 * Normalize API user → app user format
 *
 * Broker login response data:
 *   { user: { id, name, email, role }, token, user_type: "broker" }
 *
 * Attendee OTP response data:
 *   { user: { id, name, email, role }, token, user_type: "attendee",
 *     attendee: { id, tour_id, tour_name, can_score, can_add_media } }
 */
export function normalizeUser(apiUser, userType, attendeeInfo) {
  const initials = (apiUser.name || "?")
    .split(" ")
    .filter(Boolean)
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";
  return {
    id: String(apiUser.id),
    _apiId: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    av: initials,
    // Map API user_type → app role: "broker" → "user", "attendee" → "guest"
    role: userType === "attendee" ? "guest" : "user",
    user_type: userType,
    attendee: attendeeInfo || null,
    token: _token,
  };
}

/**
 * Normalize dashboard data
 *
 * Real API: { user, stats: { total_projects, active_projects, total_sites, upcoming_tours },
 *   recent_tours: [{ id, name, date, status, project_name, comps_count }],
 *   active_projects: [{ id, name, status, sites_count, comps_count }],
 *   sites: [{ id, name, address, city, state }] }
 */
export function normalizeDashboard(apiDash) {
  return {
    user: apiDash.user || {},
    stats: {
      totalProjects: apiDash.stats?.total_projects || 0,
      activeProjects: apiDash.stats?.active_projects || 0,
      totalSites: apiDash.stats?.total_sites || 0,
      upcomingTours: apiDash.stats?.upcoming_tours || 0,
    },
    recentTours: (apiDash.recent_tours || []).map(t => ({
      id: String(t.id),
      name: t.name,
      date: t.date ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD",
      status: t.status,
      projectName: t.project_name,
      compsCount: t.comps_count || 0,
    })),
    activeProjects: (apiDash.active_projects || []).map(p => ({
      id: String(p.id),
      name: p.name,
      status: p.status,
      sitesCount: p.sites_count || 0,
      compsCount: p.comps_count || 0,
    })),
    sites: (apiDash.sites || []).map(s => ({
      id: String(s.id),
      name: s.name || s.address || `Site ${s.id}`,
      addr: [s.address, s.city, s.state].filter(Boolean).join(", "),
    })),
  };
}
