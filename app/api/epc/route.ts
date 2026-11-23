import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const norm = (k: string) => k.toLowerCase().replace(/[-_\s]/g, "");

/** Top-level lookup (used for the postcode search results). */
function pick(o: Record<string, unknown>, ...names: string[]): string {
  const map: Record<string, unknown> = {};
  for (const k of Object.keys(o)) map[norm(k)] = o[k];
  for (const n of names) {
    const v = map[norm(n)];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return "";
}

/** Turns strings, numbers, {description} objects and lists of them into text. */
function describeValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(describeValue).filter(Boolean).join("; ");
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const k of ["description", "text", "value", "name"]) {
      if (o[k] !== undefined && o[k] !== null) return describeValue(o[k]);
    }
  }
  return "";
}

/** Searches the whole response (nested objects and arrays), shallowest match first. */
function deepPick(root: unknown, names: string[], textOnly = false): string {
  const wanted = names.map(norm);
  const queue: unknown[] = [root];
  for (let i = 0; i < queue.length && i < 5000; i++) {
    const cur = queue[i];
    if (Array.isArray(cur)) { queue.push(...cur); continue; }
    if (!cur || typeof cur !== "object") continue;
    const o = cur as Record<string, unknown>;
    const map: Record<string, unknown> = {};
    for (const k of Object.keys(o)) map[norm(k)] = o[k];
    for (const w of wanted) {
      if (!(w in map)) continue;
      const s = describeValue(map[w]);
      if (s && (!textOnly || /[A-Za-z]/.test(s))) return s;
    }
    queue.push(...Object.values(o));
  }
  return "";
}

/** For debugging: lists the shape of a response, hiding anything personal. */
const REDACT = /address|postcode|uprn|lmk|certificate|latitude|longitude|name|email|phone/i;
function outline(v: unknown, path = "", depth = 0, out: string[] = []): string[] {
  if (out.length > 400 || depth > 6) return out;
  if (Array.isArray(v)) {
    out.push(`${path || "(root)"}: array(${v.length})`);
    if (v.length) outline(v[0], path + "[0]", depth + 1, out);
  } else if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      outline(val, path ? `${path}.${k}` : k, depth + 1, out);
    }
  } else {
    const shown = REDACT.test(path) ? "(hidden)" : JSON.stringify(v)?.slice(0, 60);
    out.push(`${path}: ${typeof v} = ${shown}`);
  }
  return out;
}

function rows(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  const j = json as Record<string, unknown>;
  for (const k of ["data", "rows", "results", "certificates"]) {
    const v = j?.[k];
    if (Array.isArray(v)) return v as Record<string, unknown>[];
    if (v && typeof v === "object") return [v as Record<string, unknown>];
  }
  return j && typeof j === "object" ? [j] : [];
}

function authHeader(): string | null {
  const token = process.env.EPC_API_TOKEN;
  if (token) return `Bearer ${token}`;
  const { EPC_EMAIL, EPC_API_KEY } = process.env;
  if (EPC_EMAIL && EPC_API_KEY) {
    return `Basic ${Buffer.from(`${EPC_EMAIL}:${EPC_API_KEY}`).toString("base64")}`;
  }
  return null;
}

async function epcFetch(path: string, params: Record<string, string>) {
  const auth = authHeader();
  if (!auth) throw new Error("EPC credentials are not configured on the server.");
  const base = process.env.EPC_API_BASE_URL || "https://api.get-energy-performance-data.communities.gov.uk";
  const url = new URL(base + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`EPC service responded with ${res.status}`);
  return rows(await res.json());
}

const RATING_KEYS = [
  "currentEnergyEfficiencyBand", "currentEnergyRating", "current-energy-rating",
  "current_energy_band", "currentEnergyBand", "energy_band",
];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    const certificate = sp.get("certificate");
    if (certificate) {
      if (!/^[A-Za-z0-9-]{5,80}$/.test(certificate)) {
        return NextResponse.json({ error: "Invalid certificate reference." }, { status: 400 });
      }
      const path = process.env.EPC_CERTIFICATE_PATH || "/api/certificate";
      const list = await epcFetch(path, { certificate_number: certificate });
      const c = list[0];
      if (!c) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });

      // Debug mode: only works while the EPC_DEBUG=1 environment variable is set.
      if (sp.get("debug") === "1" && process.env.EPC_DEBUG === "1") {
        return NextResponse.json({ outline: outline(list.length > 1 ? list : c) });
      }

      return NextResponse.json({
        property: {
          totalFloorArea:
            parseFloat(deepPick(c, ["totalFloorArea", "total-floor-area", "total_floor_area", "floorArea"])) || 0,
          currentEnergyRating: deepPick(c, RATING_KEYS).toUpperCase().slice(0, 1),
          mainheatDescription: deepPick(
            c,
            ["mainheatDescription", "mainHeatingDescription", "mainheat-description", "main_heating_description",
             "mainheat_description", "mainHeating", "main_heating"],
            true,
          ),
          wallsDescription: deepPick(
            c,
            ["wallsDescription", "wallDescription", "walls-description", "walls_description", "wall_description", "walls"],
            true,
          ),
        },
      });
    }

    const postcode =      
