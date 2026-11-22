export type Role = "homeowner" | "landlord";
export interface Property {
  totalFloorArea: number;
  currentEnergyRating: string;
  mainheatDescription: string;
  wallsDescription: string;
}
export interface Result {
  rating: string;
  heatingKwh: number;
  heatingSpend: number;
  electricitySpend: number;
  totalSpend: number;
  overpayment: number;
  insulationSaving: number;
  tariffSaving: number;
  heatPumpSaving: number;
  bus: number;
  gbis: number;
  eco4Possible: boolean;
  grantTotal: number;
  fuel: "gas" | "oil" | "lpg" | "electric" | "heatpump";
  uninsulatedWalls: boolean;
  notes: string[];
}

// Assumptions (unit rates in £/kWh)
export const RATES = { electricity: 0.245, gas: 0.062, oil: 0.075, lpg: 0.085, offPeak: 0.15 };
const INTENSITY: Record<string, number> = { A: 50, B: 75, C: 110, D: 150, E: 200, F: 260, G: 330 }; // kWh/m2/yr heating + hot water (fuel input)
const BOILER_EFF = 0.85;
const HP_SCOP = 3.0;
const BUS_GRANT = 7500;
const GBIS_INDICATIVE = 1500;
const round = (n: number) => Math.round(n / 10) * 10;

export function calculate(p: Property, role: Role): Result {
  const rating = INTENSITY[p.currentEnergyRating] ? p.currentEnergyRating : "D";
  const area = p.totalFloorArea > 0 ? p.totalFloorArea : 85;
  const heat = p.mainheatDescription.toLowerCase();
  const walls = p.wallsDescription.toLowerCase();

  let fuel: Result["fuel"] = "gas";
  if (/heat pump/.test(heat)) fuel = "heatpump";
  else if (/oil/.test(heat)) fuel = "oil";
  else if (/lpg|bottled|liquid petroleum/.test(heat)) fuel = "lpg";
  else if (/electric|storage heater|underfloor electric/.test(heat) && !/gas/.test(heat)) fuel = "electric";

  const uninsulatedWalls =
    /as built|no insulation/.test(walls) || (/solid brick|sandstone|granite|cavity/.test(walls) && !/insulated|filled/.test(walls));
  const wallFactor = uninsulatedWalls ? 1.15 : 1;

  const heatingKwh = area * INTENSITY[rating] * wallFactor;
  const fuelRate = fuel === "gas" ? RATES.gas : fuel === "oil" ? RATES.oil : fuel === "lpg" ? RATES.lpg : fuel === "heatpump" ? (RATES.electricity * 1) / HP_SCOP : RATES.electricity;
  const heatingSpend = heatingKwh * fuelRate;
  const electricityKwh = 1500 + 18 * area; // lights, appliances, cooking
  const electricitySpend = electricityKwh * RATES.electricity;
  const totalSpend = heatingSpend + electricitySpend;

  // 1) Insulation / fabric upgrades: 18% of heating if walls uninsulated, otherwise 6% (loft/draught-proofing)
  const insulationSaving = heatingSpend * (uninsulatedWalls ? 0.18 : 0.06);
  const heatingAfterFabric = heatingSpend - insulationSaving;

  // 2) Smart time-of-use tariff: shift 35% of non-heating electricity (and heat pump/electric heating if present) to off-peak
  const electricHeating = fuel === "electric" || fuel === "heatpump";
  const shiftable = electricitySpend / RATES.electricity * 0.35 + (electricHeating ? (heatingAfterFabric / RATES.electricity) * (fuel === "heatpump" ? 1 : 0.5) * 0.4 : 0);
  const tariffSaving = shiftable * (RATES.electricity - RATES.offPeak);

  // 3) Heat pump swap (only for gas/oil/LPG/direct electric), paired with the smart tariff
  let heatPumpSaving = 0;
  if (fuel !== "heatpump") {
    const deliveredHeat = (fuel === "electric" ? heatingKwh : heatingKwh * BOILER_EFF) * (1 - (uninsulatedWalls ? 0.18 : 0.06));
    const hpCost = (deliveredHeat / HP_SCOP) * RATES.offPeak * 0.6 + (deliveredHeat / HP_SCOP) * RATES.electricity * 0.4;
    heatPumpSaving = Math.max(0, heatingAfterFabric - hpCost);
  }

  const overpayment = insulationSaving + tariffSaving + heatPumpSaving;

  const bus = fuel === "heatpump" ? 0 : BUS_GRANT;
  const dToG = ["D", "E", "F", "G"].includes(rating);
  const gbis = dToG ? GBIS_INDICATIVE : 0;
  const eco4Possible = dToG;

  const notes: string[] = [
    "Estimates use modelled demand from your EPC, not your actual bills. Unit rates: 24.5p/kWh electricity, 6.2p/kWh gas.",
    "Grants are indicative. Scheme rules, funding and availability change; confirm before you commit.",
  ];
  if (fuel === "heatpump") notes.push("You already have a heat pump, so the Boiler Upgrade Scheme does not apply.");
  if (role === "landlord") notes.push("Landlords: check Minimum Energy Efficiency Standards for rented homes and that tenant consent/eligibility rules are met for grants.");

  return {
    rating,
    heatingKwh: Math.round(heatingKwh),
    heatingSpend: round(heatingSpend),
    electricitySpend: round(electricitySpend),
    totalSpend: round(totalSpend),
    overpayment: round(overpayment),
    insulationSaving: round(insulationSaving),
    tariffSaving: round(tariffSaving),
    heatPumpSaving: round(heatPumpSaving),
    bus,
    gbis,
    eco4Possible,
    grantTotal: bus + gbis,
    fuel,
    uninsulatedWalls,
    notes,
  };
}
