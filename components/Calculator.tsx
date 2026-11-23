"use client";

import { useState } from "react";
import { calculate, Property, Result, Role } from "@/lib/calc";
import RoadmapView from "@/components/RoadmapView";

interface Addr { id: string; address: string; rating: string }

export default function Calculator({ stripeLink, affiliateLink }: { stripeLink: string; affiliateLink: string }) {
  const [step, setStep] = useState<1 | 2 | 4>(1);
  const [postcode, setPostcode] = useState("");
  const [role, setRole] = useState<Role>("homeowner");
  const [addresses, setAddresses] = useState<Array<Addr>>(new Array<Addr>());
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
    setStep(1);
    setAddresses(new Array<Addr>());
    setSelected(null);
    setResult(null);
    setError("");
  }

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
        <RoadmapView address={selected.address} role={role} result={result} stripeLink={stripeLink} affiliateLink={affiliateLink} onReset={reset} />
      )}
    </section>
  );
}
