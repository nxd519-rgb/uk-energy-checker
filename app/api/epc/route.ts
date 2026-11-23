 import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const norm = (k: string) => k.toLowerCase().replace(/[-_\s]/g, "");

function pick(o: Record<string, unknown>, ...names: string[]): string {
  const map: Record<string, unknown> = {};
  for (const k of Object.keys(o)) map[norm(k)] = o[k];
  for (const n of names) {
    const v = map[norm(n)];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return "";
}

function rows(json: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(json)) return json as Array<Record<string, unknown>>;
  const j = json as Record<string, unknown>;
  for (const k of ["data", "rows", "results", "certificates"]) {
    const v = j?.[k];
    if (Array.isArray(v)) return v as Array<Record<string, unknown>>;
    if (v && typeof v === "object") return [v as Record<string, unknown>];
  }
  return j && typeof j === "object" ? [j] : new Array<Record<string, unknown>>();
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
  const base = process.env.EPC_API_BASE_URL || "https://communities.gov.uk";
  const url = new URL(base + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) return new Array<Record<string, unknown>>();
  if (!res.ok) throw new Error(`EPC service responded with ${res.status}`);
  return rows(await res.json());
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    const certificate = sp.get("certificate");
    if (certificate) {
      if (!/^[A-Za-z0-9-]{5,80}$/.test(certificate)) {
        return NextResponse.json({ error: "Invalid certificate reference." }, { status: 400 });
      }
      const path = process.env.EPC_CERTIFICATE_PATH || "/api/certificate";
      let list = await epcFetch(path, { certificateNumber: certificate });
      if (!list.length) list = await epcFetch(path, { certificate_number: certificate });
      const c = list[0];
      if (!c) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
      return NextResponse.json({
        property: {
          totalFloorArea:
            parseFloat(pick(c, "totalFloorArea", "total-floor-area", "total_floor_area", "floorArea")) || 0,
          currentEnergyRating: pick(
            c,
            "currentEnergyEfficiencyBand",
            "currentEnergyRating",
            "current-energy-rating",
            "current_energy_band",
            "energy_band"
          )
            .toUpperCase()
            .slice(0, 1),
          mainheatDescription: pick(
            c,
            "mainheatDescription",
            "mainHeatingDescription",
            "mainheat-description",
            "main_heating_description",
            "mainheat_description"
          ),
          wallsDescription: pick(
            c,
            "wallsDescription",
            "wallDescription",
            "walls-description",
            "walls_description",
            "wall_description"
          ),
        },
      });
    }

    const postcode = (sp.get("postcode") || "").trim().toUpperCase();
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(postcode)) {
      return NextResponse.json({ error: "Please enter a valid UK postcode." }, { status: 400 });
    }
    const path = process.env.EPC_SEARCH_PATH || "/api/domestic/search";
    const list = await epcFetch(path, { postcode });
    const seen = new Set<string>();
    const addresses = list
      .map((r) => {
        const id = pick(r, "certificateNumber", "certificate_number", "lmk-key", "lmk_key");
        const address =
          pick(r, "address") ||
          [
            pick(r, "addressLine1", "address1", "address-1"),
            pick(r, "addressLine2", "address2", "address-2"),
            pick(r, "addressLine3", "address3", "address-3"),
          ]
            .filter(Boolean)
            .join(", ");
        const rating = pick(
          r,
          "currentEnergyEfficiencyBand",
          "currentEnergyRating",
          "current-energy-rating",
          "current_energy_band",
          "energy_band"
        )
          .toUpperCase()
          .slice(0, 1);
        return { id, address, rating };
      })
      .filter((a) => a.id && a.address && !seen.has(a.address) && seen.add(a.address))
      .sort((a, b) => a.address.localeCompare(b.address, "en", { numeric: true }));
    return NextResponse.json({ addresses });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lookup failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
