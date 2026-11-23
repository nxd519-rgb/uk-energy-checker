"use client";

import { useState } from "react";
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

  const totalSavings = result ? result.upgrades.reduce((s, u) => s + u.annualSaving, 0) : 0;
  const totalCo2 = result ? result.upgrades.reduce((s, u) => s + u.co2SavedTonnes, 0).toFixed(1) : "0";

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {step === 1 && (
        <form onSubmit={lookup} className="space-y-5">
          <div>
            <label htmlFor="pc" className="block text-sm font-medium">Your postcode</label>
            <input id="pc" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. HG5 0WJ" required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">I am a…</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["homeowner", "landlord"] as Array<Role>).map((r) => (
                <label key={r} className={`cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-medium capitalize ${role === r ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-300"}`}>
                  <input type="radio" name="role" className="sr-only" checked={role === r} onChange={() => setRole(r)} />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>
          <button disabled={loading} className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {loading ? "Searching…" : "Find my home"}
          </button>
        </form>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold">Select your address</h2>
          <ul className="mt-3 max-h-96 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {addresses.map((a) => (
              <li key={a.id}>
                <button onClick={() => choose(a)} disabled={loading} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-60">
                  <span>{a.address}</span>
                  {selected?.id === a.id && loading && <span className="text-xs text-slate-500">Loading…</span>}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={reset} className="mt-4 text-sm text-slate-500 underline">Change postcode</button>
        </div>
      )}

      {step === 4 && result && selected && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Property Retrofit &amp; Tariff Assessment</p>
              <h2 className="text-base font-semibold text-slate-900">{selected.address}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">{role} Profile</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Current EPC</p>
              <span className={`mt-2 inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold text-white ${ratingColour[result.rating]}`}>{result.rating}</span>
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

          <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">Your EPC Certificate Profile</p>
            <p><strong>Floor Area:</strong> {result.floorArea} m² | <strong>Est. Annual Bill:</strong> {gbp(result.totalSpend)} ({gbp(result.heatingSpend)} heat / {gbp(result.electricitySpend)} elec)</p>
            <p><strong>Current Heating:</strong> {result.heatingType}</p>
            <p><strong>Wall Construction:</strong> {result.wallType}</p>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div aria-hidden={!unlocked} className={`space-y-3 p-5 ${unlocked ? "" : "select-none blur-sm"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">Financial ROI &amp; Upgrade Roadmap</h3>
                <span className="text-xs font-semibold text-emerald-700">Total Potential: +{gbp(totalSavings)}/yr ({totalCo2}t CO₂/yr)</span>
              </div>

              <div className="space-y-2.5">
                {result.upgrades.map((u, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{idx + 1}. {u.name}</span>
                      <span className="font-bold text-emerald-700">+{gbp(u.annualSaving)}/yr</span>
                    </div>
                    <p className="mt-1 text-slate-600">
                      Est. Cost: {gbp(u.grossCost)} | Grant: {u.grant > 0 ? `-${gbp(u.grant)}` : "£0"} | <strong>Net Cost: {gbp(u.netCost)}</strong> | Payback: <strong>{u.paybackYears === 0 ? "Instant" : `${u.paybackYears} yrs`}</strong> | 10-Yr Net: <strong className="text-emerald-700">{u.tenYearNetProfit >= 0 ? `+${gbp(u.tenYearNetProfit)}` : gbp(u.tenYearNetProfit)}</strong>
                    </p>
                  </div>
                ))}
              </div>

              <p className="pt-1 text-xs text-slate-600">
                <strong>Recommended Order:</strong> Start with Step 1 (Smart Tariff switch) for immediate zero-cost savings, then insulate before sizing a heat pump. Always request 3 MCS-certified quotes so the £7,500 BUS grant is deducted upfront.
              </p>
            </div>
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 px-4 text-center text-sm font-medium text-slate-800">
                Your personalised ROI breakdown &amp; PDF roadmap is locked
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3 print:hidden">
            {!unlocked ? (
              <div className="space-y-2">
                <button type="button" onClick={() => { window.location.href = stripeLink; }} className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700">
                  Unlock Full Personalized PDF Roadmap (£4.99)
                </button>
