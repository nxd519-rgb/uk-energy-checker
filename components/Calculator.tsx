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
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [selected, setSelected] = useState<Addr | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setStep(1); setAddresses([]); setSelected(null); setResult(null); setError("");
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {step === 1 && (
        <form onSubmit={lookup} className="space-y-5">
          <div>
            <label htmlFor="pc" className="block text-sm font-medium">Your postcode</label>
            <input id="pc" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. GU1 3AA" required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">I am a…</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["homeowner", "landlord"] as Role[]).map((r) => (
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
          <p className="text-sm text-slate-500">{selected.address}</p>
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

          <p className="mt-4 text-sm text-slate-600">
            Estimated annual energy spend: <strong>{gbp(result.totalSpend)}</strong> ({gbp(result.heatingSpend)} heating, {gbp(result.electricitySpend)} electricity).
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {result.bus > 0 && <li>✔ Boiler Upgrade Scheme: up to {gbp(result.bus)} towards a heat pump</li>}
            {result.gbis > 0 && <li>✔ Great British Insulation Scheme: indicative {gbp(result.gbis)} (EPC {result.rating})</li>}
            {result.eco4Possible && <li>✔ ECO4 may apply if you receive qualifying benefits (not included in total)</li>}
          </ul>

          <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div aria-hidden className="select-none space-y-3 p-5 blur-sm">
              <h3 className="font-semibold">Step-by-Step Upgrade &amp; Tariff Action Plan</h3>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-emerald-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-2/3 rounded bg-slate-300" />
                    <div className="h-3 w-full rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 px-4 text-center text-sm font-medium text-slate-800">
              Your personalised plan is locked
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <a href={stripeLink} className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700">
              Unlock Full Personalized PDF Roadmap (£4.99)
            </a>
            <a href={affiliateLink} target="_blank" rel="noopener noreferrer sponsored" className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50">
              Compare Fixed Heat Pump &amp; Solar Quotes
            </a>
          </div>

          <details className="mt-5 text-xs text-slate-500">
            <summary className="cursor-pointer">How this was calculated</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.notes.map((n) => <li key={n}>{n}</li>)}
              <li>Heating demand = floor area × band intensity (kWh/m²), +15% for uninsulated walls. Fuel inferred from the EPC heating description ({result.fuel}).</li>
              <li>Overpayment = fabric upgrades + smart time-of-use tariff (15p off-peak) + heat pump (SCOP 3.0) where applicable.</li>
            </ul>
          </details>
          <button onClick={reset} className="mt-4 text-sm text-slate-500 underline">Start again</button>
        </div>
      )}
    </section>
  );
}
