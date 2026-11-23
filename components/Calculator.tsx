"use client";

import { useState, useEffect } from "react";
import { calculate, Property, Result, Role } from "@/lib/calc";

interface Addr { id: string; address: string; rating: string }
const gbp = (n: number) => "£" + n.toLocaleString("en-GB");
const ratingColour: Record<string, string> = {
  A: "bg-green-600", B: "bg-green-500", C: "bg-lime-500", D: "bg-yellow-500", E: "bg-orange-500", F: "bg-orange-600", G: "bg-red-600",
};

export default function Calculator({ stripeLink, affiliateLink }: { stripeLink: string; affiliateLink: string }) {
  const [step, setStep] = useState<1 | 2 | 4>(1);
  const [postcode, setPostcode] = useState("");
  const [role, setRole] = useState<Role>("homeowner");
  const [addresses, setAddresses] = useState<Array<Addr>>(new Array<Addr>());
  const [selected, setSelected] = useState<Addr | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("unlock") === "1") {
      setUnlocked(true);
    }
  });

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/epc?postcode=${encodeURIComponent(postcode)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed.");
      if (!data.addresses.length) throw new Error("No EPCs found for that postcode.");
      setAddresses(data.addresses);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function choose(a: Addr) {
    setError("");
    setLoading(true);
    setSelected(a);
    try {
      const res = await fetch(`/api/epc?certificate=${encodeURIComponent(a.id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load certificate.");
      const prop: Property = data.property;
      if (!prop.currentEnergyRating && a.rating) prop.currentEnergyRating = a.rating;
      setResult(calculate(prop, role));
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setAddresses(new Array<Addr>());
    setSelected(null);
    setResult(null);
    setError("");
  }

  const actionPlan = result
    ? [
        {
          title: "1. Immediate Tariff Switch (Zero Upfront Cost)",
          detail: `Switch from a standard variable tariff to a Time-of-Use tariff (e.g. Octopus Agile or Tracker) to cut up to ${gbp(Math.round(result.overpayment * 0.65))}/yr off your ${gbp(result.electricitySpend)} electricity bill by shifting high-load appliances off peak hours (4pm–7pm).`,
        },
        {
          title: result.bus > 0 ? `2. Claim ${gbp(result.bus)} Boiler Upgrade Scheme Grant` : "2. Heat Pump Readiness & Controls Check",
          detail:
            result.bus > 0
              ? `Your property qualifies for up to ${gbp(result.bus)} off an Air Source Heat Pump via an MCS-certified installer, bringing typical net installation costs down to £3,500–£5,500.`
              : "Optimise your boiler flow temperature to 55°C–60°C and add smart TRVs to save ~8–12% on heating spend immediately.",
        },
        {
          title: result.gbis > 0 ? `3. Apply for ${gbp(result.gbis)} Great British Insulation Grant` : "3. Fabric-First Heat Loss Reduction",
          detail:
            result.gbis > 0
              ? `With an EPC rating of ${result.rating}, check eligibility under GBIS for subsidised loft or cavity wall insulation before upgrading heating.`
              : `Your EPC ${result.rating} fabric already retains heat well; focus on draught-proofing and hot water cylinder insulation for rapid payback.`,
        },
        {
          title: "4. Solar PV + Home Battery Pairing",
          detail: `Adding a 4kWp solar array with a 5kWh battery can offset 50–70% of your ${gbp(result.electricitySpend)} electricity spend and earn ~15p/kWh via Smart Export Guarantee (SEG) payments.`,
        },
        {
          title: role === "landlord" ? "5. Landlord EPC Compliance & Tax Deductibility" : "5. Green Mortgage & 0% Finance Options",
          detail:
            role === "landlord"
              ? "Keep invoices for insulation and heating upgrades as allowable expenses against rental income while future-proofing your property for EPC C standards."
              : "Check if your mortgage lender offers green cashback (£250–£1,000) or preferential rates when improving your EPC rating.",
        },
      ]
    : new Array<{ title: string; detail: string }>();

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {step === 1 && (
        <form onSubmit={lookup} className="space-y-5">
          <div>
            <label htmlFor="pc" className="block text-sm font-medium">Your postcode</label>
            <input
              id="pc"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. HG5 0WJ"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">I am a…</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["homeowner", "landlord"] as Role).map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium capitalize ${
                    role === r ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300"
                  }`}
                >
                      <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div aria-hidden={!unlocked} className={`space-y-3 p-5 text-sm text-slate-700 ${unlocked ? "" : "select-none blur-sm"}`}>
              <h3 className="font-semibold text-slate-900">Step-by-Step Upgrade &amp; Tariff Action Plan</h3>
              <p><strong>1. Smart Tariff Switch:</strong> Move to a Time-of-Use tariff (e.g. Octopus Agile/Tracker) to save up to {gbp(Math.round(result.overpayment * 0.65))}/yr on electricity.</p>
              <p><strong>2. Heating Upgrade ({gbp(result.bus)} Grant):</strong> {result.bus > 0 ? `Eligible for up to ${gbp(result.bus)} via the Boiler Upgrade Scheme towards a heat pump.` : "Optimise boiler flow temperature to 55°C and fit smart TRVs."}</p>
              <p><strong>3. Insulation ({gbp(result.gbis)} Grant):</strong> {result.gbis > 0 ? `EPC ${result.rating} qualifies for indicative ${gbp(result.gbis)} GBIS insulation support.` : "Focus on draught-proofing and hot water cylinder lagging."}</p>
              <p><strong>4. Solar + Battery:</strong> A 4kWp solar + 5kWh battery setup offsets ~60% of your {gbp(result.electricitySpend)} electricity spend plus SEG export income.</p>
              <p><strong>5. Green Finance:</strong> Check green mortgage cashback (£250–£1,000) or 0% retrofit financing before booking.</p>
            </div>
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 px-4 text-center text-sm font-medium text-slate-800">
                Your personalised plan is locked
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3 print:hidden">
            {!unlocked ? (
              <>
                <a href={stripeLink} className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700">
                  Unlock Full Personalized PDF Roadmap (£4.99)
                </a>
                <button type="button" onClick={() => setUnlocked(true)} className="block w-full rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 hover:bg-amber-100">
                  Dev Mode: Preview Full PDF Free
                </button>
              </>
            ) : (
              <button type="button" onClick={() => window.print()} className="block w-full rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800">
                Download / Print PDF Roadmap
              </button>
            )}
            <a href={affiliateLink} target="_blank" rel="noopener noreferrer sponsored" className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50">
              Compare Fixed Heat Pump &amp; Solar Quotes
            </a>
          </div>
                <button
                  onClick={() => choose(a)}
                  disabled={loading}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  <span>{a.address}</span>
                  {selected?.id === a.id && loading && <span className="text-xs text-slate-500">Loading…</span>}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={reset} className="mt-4 text-sm text-slate-500 underline">
            Change postcode
          </button>
        </div>
      )}

      {step === 4 && result && selected && (
        <div>
          <p className="text-sm text-slate-500">{selected.address}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Current EPC</p>
              <span
                className={`mt-2 inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold text-white ${
                  ratingColour[result.rating]
                }`}
              >
                {result.rating}
              </span>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs uppercase text-red-700">Est. yearly overpayment</p>
              <p className="mt-2 text-2xl font-bold text-red-700">{gbp(result.overpayment)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs uppercase text-emerald-700">Grants available</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">{gbp(result.grantTotal)}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Estimated annual energy spend: <strong>{gbp(result.totalSpend)}</strong> ({gbp(result.heatingSpend)} heating,{" "}
            {gbp(result.electricitySpend)} electricity).
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {result.bus > 0 && <li>✔ Boiler Upgrade Scheme: up to {gbp(result.bus)} towards a heat pump</li>}
            {result.gbis > 0 && (
              <li>
                ✔ Great British Insulation Scheme: indicative {gbp(result.gbis)} (EPC {result.rating})
              </li>
            )}
            {result.eco4Possible && <li>✔ ECO4 may apply if you receive qualifying benefits (not included in total)</li>}
          </ul>

          <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div aria-hidden={!unlocked} className={`space-y-4 p-5 ${unlocked ? "" : "select-none blur-sm"}`}>
              <h3 className="font-semibold text-slate-900">Step-by-Step Upgrade &amp; Tariff Action Plan</h3>
