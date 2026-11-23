import { describe, it, expect } from "vitest";
import { calculate, Property } from "./calc";

const home = (over: Partial<Property> = {}): Property => ({
  totalFloorArea: 85,
  currentEnergyRating: "C",
  mainheatDescription: "Boiler and radiators, mains gas",
  wallsDescription: "Cavity wall, filled cavity",
  ...over,
});

describe("heating fuel detection", () => {
  it("does not mistake 'Boiler' for oil (regression)", () => {
    const r = calculate(home(), "homeowner");
    expect(r.grantTotal).toBe(7500);
  });
  it("gives the higher grant to oil and LPG homes", () => {
    expect(calculate(home({ mainheatDescription: "Boiler and radiators, oil" }), "homeowner").grantTotal).toBe(9000);
    expect(calculate(home({ mainheatDescription: "Boiler and radiators, LPG" }), "homeowner").grantTotal).toBe(9000);
  });
  it("offers no heat pump row and no grant if there is already a heat pump", () => {
    const r = calculate(home({ mainheatDescription: "Air source heat pump, radiators, electric" }), "homeowner");
    expect(r.grantTotal).toBe(0);
    expect(r.upgrades.some((u) => /heat pump/i.test(u.name))).toBe(false);
  });
});

describe("wall insulation", () => {
  it("offers cavity fill for unfilled cavities", () => {
    const r = calculate(home({ wallsDescription: "Cavity wall, as built, no insulation (assumed)" }), "homeowner");
    expect(r.upgrades.some((u) => /cavity/i.test(u.name))).toBe(true);
  });
  it("offers solid wall insulation for uninsulated solid brick", () => {
    const r = calculate(home({ wallsDescription: "Solid brick, as built, no insulation (assumed)" }), "homeowner");
    expect(r.upgrades.some((u) => /solid wall/i.test(u.name))).toBe(true);
  });
  it("offers neither when walls are already insulated", () => {
    const r = calculate(home(), "homeowner");
    expect(r.upgrades.some((u) => /wall/i.test(u.name))).toBe(false);
  });
});

describe("missing data", () => {
  it("records what it had to assume and still returns finite numbers", () => {
    const r = calculate({ totalFloorArea: 0, currentEnergyRating: "", mainheatDescription: "", wallsDescription: "" }, "homeowner");
    expect(r.usedFallbacks.length).toBeGreaterThanOrEqual(3);
    expect(Number.isFinite(r.totalSpend)).toBe(true);
  });
});

describe("sanity checks across many homes", () => {
  const ratings = ["A", "B", "C", "D", "E", "F", "G"];
  const heating = ["Boiler and radiators, mains gas", "Boiler and radiators, oil", "Electric storage heaters", "Air source heat pump, radiators, electric", "Community scheme"];
  const walls = ["Cavity wall, filled cavity", "Cavity wall, as built, no insulation (assumed)", "Solid brick, as built, no insulation (assumed)", "Granite or whinstone, as built, no insulation (assumed)", ""];
  for (const rating of ratings) for (const h of heating) for (const w of walls) {
    it(`${rating} | ${h} | ${w || "no wall data"}`, () => {
      const r = calculate({ totalFloorArea: 95, currentEnergyRating: rating, mainheatDescription: h, wallsDescription: w }, "homeowner");
      expect(Number.isFinite(r.totalSpend)).toBe(true);
      expect(r.combined.low).toBeLessThanOrEqual(r.combined.central);
      expect(r.combined.central).toBeLessThanOrEqual(r.combined.high);
      for (const u of r.upgrades) {
        expect(Number.isFinite(u.annualSaving)).toBe(true);
        expect(u.annualSavingLow).toBeLessThanOrEqual(u.annualSaving);
        expect(u.annualSaving).toBeLessThanOrEqual(u.annualSavingHigh);
        expect(u.netCost).toBeGreaterThanOrEqual(0);
        expect(u.netCost).toBeLessThanOrEqual(u.grossCost);
      }
    });
  }
  it("gives a typical EPC C gas home a bill near the Ofgem typical figure", () => {
    const r = calculate(home(), "homeowner");
    expect(r.totalSpend).toBeGreaterThan(1400);
    expect(r.totalSpend).toBeLessThan(2000);
  });
});

describe("bills override", () => {
  it("uses real gas and electricity use when supplied", () => {
    const base = calculate(home(), "homeowner");
    const more = calculate(home(), "homeowner", { annualGasKwh: 16000, annualElecKwh: 4500 });
    expect(more.heatingSpend).toBeGreaterThan(base.heatingSpend);
    expect(more.electricitySpend).toBeGreaterThan(base.electricitySpend);
  });
  it("ignores a gas figure for a home that isn't heated by gas", () => {
    const a = calculate(home({ mainheatDescription: "Boiler and radiators, oil" }), "homeowner");
    const b = calculate(home({ mainheatDescription: "Boiler and radiators, oil" }), "homeowner", { annualGasKwh: 30000 });
    expect(b.heatingSpend).toBe(a.heatingSpend);
  });
});

describe("long-life upgrades", () => {
  it("shows solar paying back over its lifetime even if not within 10 years", () => {
    const solar = calculate(home(), "homeowner").upgrades.find((u) => /solar/i.test(u.name))!;
    expect(solar.lifetimeNet).toBeGreaterThan(solar.tenYearNetProfit);
  });
});
