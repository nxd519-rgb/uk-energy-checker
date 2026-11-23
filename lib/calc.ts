export type Role = "homeowner" | "landlord";

export interface Property {
  totalFloorArea: number;
  currentEnergyRating: string;
  mainheatDescription: string;
  wallsDescription: string;
}

export interface UpgradeOption {
  name: string;
  grossCost: number;
  grant: number;
  netCost: number;
  annualSaving: number;
  paybackYears: number;
  tenYearNetProfit: number;
  co2SavedTonnes: number;
}

export interface Result {
  rating: string;
  floorArea: number;
  heatingType: string;
  wallType: string;
  totalSpend: number;
  heatingSpend: number;
  electricitySpend: number;
  overpayment: number;
  bus: number;
  gbis: number;
  grantTotal: number;
  eco4Possible: boolean;
  upgrades: Array<UpgradeOption>;
}

export function calculate(prop: Property, role: Role): Result {
  const area = prop.totalFloorArea > 20 ? Math.round(prop.totalFloorArea) : 85;
  const rating = (prop.currentEnergyRating || "D").toUpperCase();
  const heatDesc = prop.mainheatDescription || "Gas boiler and radiators";
  const wallDesc = prop.wallsDescription || "Standard cavity or solid wall";

  const ratingFactor: Record<string, number> = {
    A: 0.55, B: 0.7, C: 0.85, D: 1.0, E: 1.25, F: 1.5, G: 1.8,
  };
  const factor = ratingFactor[rating] || 1.0;

  // Modelled annual baseline spend (UK Ofgem-aligned unit rates)
  const heatingSpend = Math.round(area * 7.2 * factor);
  const electricitySpend = Math.round(580 + area * 1.9);
  const totalSpend = heatingSpend + electricitySpend;

  // Estimated tariff + efficiency overpayment
  const overpayment = Math.round(electricitySpend * 0.19 + heatingSpend * 0.14);

  // UK Grant Eligibility
  const isFossilOrElectric = !/heat pump|district|community/i.test(heatDesc);
  const bus = isFossilOrElectric ? 7500 : 0;
  const isUninsulated = /no insulation|as built|solid brick|stone/i.test(wallDesc);
  const gbis = ["D", "E", "F", "G"].includes(rating) && isUninsulated ? 1500 : 0;
  const grantTotal = bus + gbis;
  const eco4Possible = ["D", "E", "F", "G"].includes(rating);

  // 1. Smart Time-of-Use Tariff Optimisation
  const tariffSaving = Math.round(electricitySpend * 0.22);

  // 2. Air Source Heat Pump (sized by floor area)
  const hpGross = Math.round(9200 + area * 28);
  const hpNet = Math.max(1500, hpGross - bus);
  const hpSaving = Math.round(heatingSpend * 0.24 + 95);
  const hpPayback = Number((hpNet / Math.max(1, hpSaving)).toFixed(1));
  const hpTenYear = Math.round(hpSaving * 10 - hpNet);

  // 3. Solar PV (4kWp) + 5kWh Home Battery
  const solarGross = 7400;
  const solarNet = 7400;
  const solarSaving = Math.round(electricitySpend * 0.52 + 240); // Self-use + SEG export
  const solarPayback = Number((solarNet / Math.max(1, solarSaving)).toFixed(1));
  const solarTenYear = Math.round(solarSaving * 10 - solarNet);

  // 4. Fabric Insulation (Loft / Cavity / Draught Proofing)
  const insGross = isUninsulated ? Math.round(1400 + area * 12) : 650;
  const insNet = Math.max(0, insGross - gbis);
  const insSaving = Math.round(heatingSpend * (isUninsulated ? 0.18 : 0.08));
  const insPayback = insNet === 0 ? 0.1 : Number((insNet / Math.max(1, insSaving)).toFixed(1));
  const insTenYear = Math.round(insSaving * 10 - insNet);

  const upgrades: Array<UpgradeOption> = [
    {
      name: "Smart Time-of-Use Tariff Switch (e.g. Octopus Agile / Tracker)",
      grossCost: 0,
      grant: 0,
      netCost: 0,
      annualSaving: tariffSaving,
      paybackYears: 0,
      tenYearNetProfit: tariffSaving * 10,
      co2SavedTonnes: 0.2,
    },
    {
      name: isUninsulated ? "Cavity / Loft Insulation Upgrade" : "Draught-Proofing & Cylinder Insulation",
      grossCost: insGross,
      grant: Math.min(insGross, gbis),
      netCost: insNet,
      annualSaving: insSaving,
      paybackYears: insPayback,
      tenYearNetProfit: insTenYear,
      co2SavedTonnes: isUninsulated ? 0.6 : 0.2,
    },
    {
      name: "4kWp Solar PV + 5kWh Battery Storage (inc. SEG Export)",
      grossCost: solarGross,
      grant: 0,
      netCost: solarNet,
      annualSaving: solarSaving,
      paybackYears: solarPayback,
      tenYearNetProfit: solarTenYear,
      co2SavedTonnes: 0.9,
    },
    {
      name: "Air Source Heat Pump (MCS-Certified Installation)",
      grossCost: hpGross,
      grant: bus,
      netCost: hpNet,
      annualSaving: hpSaving,
      paybackYears: hpPayback,
      tenYearNetProfit: hpTenYear,
      co2SavedTonnes: 1.4,
    },
  ];

  // Role-specific adjustment (Landlord EPC C compliance focus)
  if (role === "landlord" && ["D", "E", "F", "G"].includes(rating)) {
    upgrades.sort((a, b) => a.netCost - b.netCost);
  }

  return {
    rating,
    floorArea: area,
    heatingType: heatDesc,
    wallType: wallDesc,
    totalSpend,
    heatingSpend,
    electricitySpend,
    overpayment,
    bus,
    gbis,
    grantTotal,
    eco4Possible,
    upgrades,
  };
}
