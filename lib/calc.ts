export type Role = "homeowner" | "landlord";

export interface Property {
  totalFloorArea: number;
  currentEnergyRating: string;
  mainheatDescription: string;
  wallsDescription: string;
}

/** Optional: real usage from the person's bills (for a future "enter your bills" box). */
export interface Bills {
  annualGasKwh?: number;
  annualElecKwh?: number;
}

export interface UpgradeOption {
  name: string;
  grossCost: number;
  grant: number;
  netCost: number;
  annualSaving: number; // central estimate
  annualSavingLow: number;
  annualSavingHigh: number;
  paybackYears: number | null; // 0 = no cost, null = no payback on bills alone
  tenYearNetProfit: number;
  lifespanYears: number;
  lifetimeNet: number;
  co2SavedTonnes: number;
  notes: string[];
}

export interface Range {
  low: number;
  central: number;
  high: number;
}

export interface Result {
  rating: string;
  floorArea: number;
  heatingType: string;
  wallType: string;
  totalSpend: number;
  heatingSpend: number;
  electricitySpend: number;
  /** Savings available from low/no-cost changes (tariff + quick wins). Relabel the card to match. */
  overpayment: number;
  bus: number;
  gbis: number; // no longer a fixed amount: eligibility depends on the household. Kept at 0.
  grantTotal: number;
  eco4Possible: boolean;
  upgrades: UpgradeOption[];
  combined: Range; // all upgrades together, with overlaps handled
  usedFallbacks: string[]; // things we could not read from the EPC
  notes: string[];
}

/* ------------------------------------------------------------------ */
/* ASSUMPTIONS: update these when Ofgem announces a new price cap.     */
/* Next announcement is due on or before 25 Nov 2026 (applies 1 Jan). */
/* Items marked VERIFY are my estimates, check them before launch.     */
/* ------------------------------------------------------------------ */
export const ASSUMPTIONS = {
  lastUpdated: "23 Nov 2026",
  priceSource: "Ofgem price cap, 1 Oct to 31 Dec 2026 (Direct Debit, GB average)",
  gasPerKwh: 0.0797,
  gasStandingPerYear: 0.2968 * 365,
  elecPerKwh: 0.2632,
  elecStandingPerYear: 0.5483 * 365,
  oilLpgPerKwh: 0.09, // VERIFY
  boilerEfficiency: 0.87,
  heatPumpScop: "2.7 to 3.5 (central 3.0)",
  solarKwp: 4,
  solarKwhPerKwp: 850, // VERIFY for North Yorkshire; depends on roof direction and shade
  gasKgCo2PerKwh: 0.183, // VERIFY
  gridKgCo2PerKwh: 0.14, // VERIFY
  busAirToWater: 7500,
  busOilLpg: 9000, // temporary uplift, 21 Jul 2026 to 31 Mar 2027
};

const A = ASSUMPTIONS;
const SOLAR_COST = 6500; // VERIFY: 4kWp, no battery. Check recent MCS quotes.
const SOLAR_INVERTER_REPLACEMENT = 900; // VERIFY
const QUICK_WINS_COST = 150; // VERIFY
const CAVITY_FILL_COST = 1200; // VERIFY
const SOLID_WALL_COST = 10000; // VERIFY
const HP_COST_BASE = 9200;
const HP_COST_PER_M2 = 28;

// Gas used for heating and hot water, kWh per m2 per year, by EPC band (rough averages).
const BAND_KWH_PER_M2: Record<string, number> = { A: 40, B: 70, C: 105, D: 140, E: 180, F: 230, G: 290 };

type CaseName = "low" | "central" | "high";
interface CaseParams {
  scop: number;
  hpDiscount: number; // cheaper electricity on a heat pump tariff
  tariffPct: number; // saving on electricity from a time-of-use tariff
  solarSelf: number; // share of solar output used in the home
  segRate: number; // export payment per kWh
  quickPct: number; // quick wins, share of heating energy
  cavityPct: number;
  solidPct: number;
  disconnectGas: boolean; // saves the gas standing charge
}
const CASES: Record<CaseName, CaseParams> = {
  low: { scop: 2.7, hpDiscount: 0, tariffPct: 0, solarSelf: 0.35, segRate: 0.04, quickPct: 0.02, cavityPct: 0.1, solidPct: 0.15, disconnectGas: false },
  central: { scop: 3.0, hpDiscount: 0, tariffPct: 0.05, solarSelf: 0.45, segRate: 0.08, quickPct: 0.04, cavityPct: 0.15, solidPct: 0.25, disconnectGas: false },
  high: { scop: 3.5, hpDiscount: 0.2, tariffPct: 0.12, solarSelf: 0.6, segRate: 0.14, quickPct: 0.06, cavityPct: 0.2, solidPct: 0.3, disconnectGas: true },
};

type Fuel = "gas" | "electric" | "oil_lpg" | "heatpump" | "other";
type WallKind = "cavity" | "solid" | "insulated" | "unknown";

function detectFuel(desc: string): Fuel {
  if (/heat pump/i.test(desc)) return "heatpump";
  if (/district|community/i.test(desc)) return "other";
  if (/\boil\b|\blpg\b|bottled|\bbulk\b/i.test(desc)) return "oil_lpg"; // \b so "Boiler" doesn't match "oil"
  if (/mains gas/i.test(desc)) return "gas";
  if (/electric/i.test(desc)) return "electric";
  if (/gas/i.test(desc)) return "gas";
  return "other";
}

function detectWall(desc: string): WallKind {
  if (!desc) return "unknown";
  if (/cavity/i.test(desc) && /as built/i.test(desc) && /no insulation|partial insulation/i.test(desc)) return "cavity";
  if (/solid brick|sandstone|granite|whinstone|stone/i.test(desc) && /no insulation|as built/i.test(desc) && !/insulated|internal|external/i.test(desc)) return "solid";
  return "insulated";
}

const r = (n: number) => Math.round(n);

function solarValue(elecKwh: number, selfFrac: number, seg: number) {
  const gen = A.solarKwp * A.solarKwhPerKwp;
  const self = Math.min(gen * selfFrac, elecKwh * 0.7);
  return self * A.elecPerKwh + (gen - self) * seg;
}

function build(
  name: string, gross: number, grant: number, central: number, low: number, high: number,
  years: number, co2: number, opts: { degradation?: number; extraCost?: number; notes?: string[] } = {},
): UpgradeOption {
  const net = gross; // Exclude unconfirmed grants from payback.
  const s = r(central);
  const deg = opts.degradation ?? 0;
  const sum = (n: number) => { let t = 0; for (let y = 0; y < n; y++) t += s * Math.pow(1 - deg, y); return t; };
  return {
    name, grossCost: gross, grant, netCost: net,
    annualSaving: s, annualSavingLow: r(Math.min(low,central,high)), annualSavingHigh: r(Math.max(low,central,high)),
    paybackYears: net === 0 ? 0 : s > 0 ? Number((net / s).toFixed(1)) : null,
    tenYearNetProfit: r(sum(10) - net),
    lifespanYears: years,
    lifetimeNet: r(sum(years) - net - (opts.extraCost ?? 0)),
    co2SavedTonnes: Number(Math.max(0, co2).toFixed(1)),
    notes: opts.notes ?? [],
  };
}

export function calculate(prop: Property, role: Role, bills: Bills = {}): Result {
  const usedFallbacks: string[] = [];
  const notes: string[] = [];

  let area = prop.totalFloorArea;
  if (!(area > 20)) { area = 85; usedFallbacks.push("floor area (we assumed 85 m²)"); }
  area = Math.round(area);

  let rating = (prop.currentEnergyRating || "").toUpperCase();
  if (!BAND_KWH_PER_M2[rating]) { rating = "D"; usedFallbacks.push("EPC rating (we assumed D)"); }

  let heatDesc = prop.mainheatDescription;
  if (!heatDesc) { heatDesc = "Not stated on your EPC (we assumed a gas boiler)"; usedFallbacks.push("heating system"); }
  const fuel: Fuel = heatDesc.startsWith("Not stated") ? "gas" : detectFuel(heatDesc);
  if (fuel === "other") usedFallbacks.push("heating fuel (priced like gas)");

  const wallDesc = prop.wallsDescription || "";
  const wall = detectWall(wallDesc);
  if (wall === "unknown") usedFallbacks.push("wall type");

  /* ---- baseline energy use ---- */
  const refEff = A.boilerEfficiency;
  const gasKwh = bills.annualGasKwh && fuel === "gas" ? bills.annualGasKwh : BAND_KWH_PER_M2[rating] * area;
  const usefulHeat = gasKwh * refEff;
  const fuelEff = fuel === "electric" ? 1 : fuel === "heatpump" ? 3 : fuel === "oil_lpg" ? 0.85 : refEff;
  const heatInput = usefulHeat / fuelEff;
  const fuelPrice = fuel === "electric" || fuel === "heatpump" ? A.elecPerKwh : fuel === "oil_lpg" ? A.oilLpgPerKwh : A.gasPerKwh;
  const heatEnergyCost = heatInput * fuelPrice;
  const gasStanding = fuel === "gas" || fuel === "other" ? A.gasStandingPerYear : 0;
  const elecKwh = bills.annualElecKwh ?? 1800 + area * 8;

  const heatingSpend = r(heatEnergyCost + gasStanding);
  const electricitySpend = r(elecKwh * A.elecPerKwh + A.elecStandingPerYear);
  const totalSpend = heatingSpend + electricitySpend;
  const baselineCost = heatEnergyCost + gasStanding + elecKwh * A.elecPerKwh + A.elecStandingPerYear;

  const canHeatPump = fuel !== "heatpump";
  const bus = fuel === "gas" ? A.busAirToWater : fuel === "oil_lpg" ? A.busOilLpg : 0;
  const eco4Possible = ["D", "E", "F", "G"].includes(rating);

  /* ---- run low / central / high ---- */
  const run = (c: CaseParams) => {
    const wallPct = wall === "cavity" ? c.cavityPct : wall === "solid" ? c.solidPct : 0;
    const tariff = 0; // No tariff saving without actual comparison.
    const quick = heatEnergyCost * c.quickPct;
    const wallSaving = heatEnergyCost * wallPct;
    const solar = solarValue(elecKwh, c.solarSelf, c.segRate);
    const hpElec = usefulHeat / c.scop;
    const hp = canHeatPump
      ? heatEnergyCost - hpElec * A.elecPerKwh * (1 - c.hpDiscount) + (c.disconnectGas && fuel === "gas" ? gasStanding : 0)
      : 0;

    // everything together, with overlaps handled
    const reduction = 1 - (1 - c.quickPct) * (1 - wallPct);
    const heatAfter = usefulHeat * (1 - reduction);
    const extraElec = canHeatPump ? heatAfter / c.scop : 0;
    const heatCostAfter = canHeatPump ? 0 : heatEnergyCost * (1 - reduction);
    const elecTotal = elecKwh + extraElec;
    const gen = A.solarKwp * A.solarKwhPerKwp;
    const self = Math.min(gen * (c.solarSelf + (canHeatPump ? 0.1 : 0)), elecTotal * 0.7);
    const imports = Math.max(0, elecTotal - self);
    const after =
      heatCostAfter + (canHeatPump && c.disconnectGas ? 0 : gasStanding) +
      imports * A.elecPerKwh + A.elecStandingPerYear - (gen - self) * c.segRate;
    return { tariff, quick, wallSaving, solar, hp, combined: baselineCost - after };
  };
  const lo = run(CASES.low), ce = run(CASES.central), hi = run(CASES.high);

  /* ---- upgrades ---- */
  const co2Gas = (frac: number) => (gasKwh * frac * A.gasKgCo2PerKwh) / 1000;
  const upgrades: UpgradeOption[] = [];

  upgrades.push(build(
    "Time-of-Use Tariff Switch (several suppliers offer these)", 0, 0, ce.tariff, lo.tariff, hi.tariff, 10, 0,
    { notes: ["Only saves money if you can move use to cheap periods, and can cost more if you can't. Compare it with a fixed tariff."] },
  ));

  upgrades.push(build(
    "Quick wins: draught-proofing & cylinder jacket", QUICK_WINS_COST, 0, ce.quick, lo.quick, hi.quick, 10, co2Gas(CASES.central.quickPct),
    { notes: ["Mostly DIY. Skip the cylinder jacket if you have no hot water tank."] },
  ));

  if (wall === "cavity") {
    upgrades.push(build(
      "Cavity wall insulation", CAVITY_FILL_COST, 0, ce.wallSaving, lo.wallSaving, hi.wallSaving, 25, co2Gas(CASES.central.cavityPct),
      { notes: ["Needs a survey to confirm the cavity is suitable. Use an installer with a CIGA guarantee. You may qualify for ECO4 or GBIS funding."] },
    ));
  } else if (wall === "solid") {
    upgrades.push(build(
      "Solid wall insulation (internal or external)", SOLID_WALL_COST, 0, ce.wallSaving, lo.wallSaving, hi.wallSaving, 30, co2Gas(CASES.central.solidPct),
      { notes: ["Rarely pays back on bills alone. Best done alongside other building work. Funding may be available, so check ECO4 and GBIS."] },
    ));
  }

  upgrades.push(build(
    "4kWp Solar PV (battery not included)", SOLAR_COST, 0, ce.solar, lo.solar, hi.solar, 25,
    (A.solarKwp * A.solarKwhPerKwp * A.gridKgCo2PerKwh) / 1000,
    { degradation: 0.005, extraCost: SOLAR_INVERTER_REPLACEMENT, notes: ["Depends on roof direction, shade and export payments. A battery adds cost and usually lengthens the payback."] },
  ));

  if (canHeatPump) {
    const gross = r(HP_COST_BASE + area * HP_COST_PER_M2);
    const hpNotes = [
      "Running costs depend on the heat pump's efficiency and your electricity price. At current prices many gas-heated homes save little on bills.",
      "Ask for a room-by-room heat loss calculation and check your radiators are suitable.",
    ];
    if (fuel === "oil_lpg") hpNotes.push("The higher £9,000 grant for oil and LPG homes runs until 31 March 2027.");
    if (fuel === "electric") hpNotes.push("Check Boiler Upgrade Scheme eligibility for electric heating with an installer.");
    upgrades.push(build(
      "Air Source Heat Pump (MCS-certified installation)", gross, bus, ce.hp, lo.hp, hi.hp, 18,
      (gasKwh * A.gasKgCo2PerKwh - (usefulHeat / CASES.central.scop) * A.gridKgCo2PerKwh) / 1000,
      { notes: [...hpNotes, "Payback and net cost exclude unconfirmed grants."] },
    ));
  }

  if (role === "landlord" && ["D", "E", "F", "G"].includes(rating)) {
    upgrades.sort((a, b) => a.netCost - b.netCost);
    notes.push("As a landlord, check the current minimum EPC rules for rented homes.");
  }

  if (usedFallbacks.length) notes.push("We could not read some details from your EPC, so typical values were used. Results are less reliable for this home.");

  return {
    rating, floorArea: area, heatingType: heatDesc, wallType: wallDesc || "Not stated on your EPC",
    totalSpend, heatingSpend, electricitySpend,
    overpayment: r(ce.tariff + ce.quick),
    bus, gbis: 0, grantTotal: bus, eco4Possible,
    upgrades,
    combined: { low: r(Math.min(lo.combined, ce.combined, hi.combined)), central: r(ce.combined), high: r(Math.max(lo.combined, ce.combined, hi.combined)) },
    usedFallbacks, notes,
  };
}
