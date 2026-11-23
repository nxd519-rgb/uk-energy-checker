"use client";

import { useRef, useState } from "react";
import { calculate, Bills, Property, Result, Role } from "@/lib/calc";
import RoadmapView from "@/components/RoadmapView";
import BillsForm from "@/components/BillsForm";

interface Addr { id: string; address: string; rating: string }
type Step = "search" | "pick" | "result";

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

export default function Calculator({ stripeLink, affiliateLink }: { stripeLink: string; affiliateLink: string }) {
  const [step, setStep] = useState<Step>("search");
  const [postcode, setPostcode] = useState("");
  const [role, setRole] = useState<Role>("homeowner");
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Addr | null>(null);
  const [prop, setProp] = useState<Property | null>(null);
  const [bills, setBills] = useState<Bills>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0); // ignores out-of-date responses

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const pc = postcode.trim().toUpperCase().replace(/\s+/g, " ");
    if (!POSTCODE_RE.test(pc)) {
      setError("Please enter a valid UK postcode, e.g. HG5 0WJ.");
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/epc?postcode=${encodeURIComponent(pc)}`);
      const data = await res.json().catch(() => ({}));
      if (id !== requestId.current) return;
      if (!res.ok) throw new Error(data.error || "Lookup failed.");
      const list: Addr[] = Array.isArray(data.addresses) ? data.addresses : [];
      if (!list.length) throw new Error("No EPCs found for that postcode. Our data covers England and Wales only.");
      list.sort((a, b) => a.address.localeCompare(b.address, "en-GB", { numeric: true }));
      setPostcode(pc);
      setAddresses(list);
      setFilter("");
      setStep("pick");
    } catch (err) {
      if (id === requestId.current) setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  async function choose(a: Addr) {
    setError("");
    const id = ++requestId.current;
    setLoading(true);
    setSelected(a);
    try {
      const res = await fetch(`/api/epc?certificate=${encodeURIComponent(a.id)}`);
      const data = await res.json().catch(() => ({}));
      if (id !== requestId.current) return;
      if (!res.ok || !data.property) throw new Error(data.error || "Could not load certificate.");
      const p: Property = { ...data.property };
      if (!p.currentEnergyRating && a.rating) p.currentEnergyRating = a.rating;
      setProp(p);
      setBills({});
      setResult(calculate(p, role));
      setStep("result");
    } catch (err) {
      if (id === requestId.current) setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  function applyBills(b: Bills) {
    if (!prop) return;
    setBills(b);
    setResult(calculate(prop, role, b));
  }

  function backToSearch() {
    requestId.current++; // cancel anything in flight
    setStep("search");
    setAddresses([]);
    setFilter("");
    setSelected(null);
    setProp(null);
    setBills({});
    setResult(null);
    setError("");
    setLoading(false);
  }

  const usingBills = bills.annualGasKwh !== undefined || bills.annualElecKwh !== undefined;
  const visible = addresses.filter((a) => a.address.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {step === "search" && (
        <form onSubmit={lookup} className="space-y-5">
          <div>
            <label htmlFor="pc" className="block text-sm font-medium">Your postcode</label>
            <input id="pc" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. HG5 0WJ" required
              autoComplete="postal-code"
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
          <p className="text-xs text-slate-500">
            Estimates use public EPC register data (England and Wales). Not financial advice.
          </p>
        </form>
      )}

      {step === "pick" && (
        <div>
          <h2 className="text-lg font-semibold">Select your address</h2>
          {addresses.length > 12 && (
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Type to filter, e.g. 12 or Flat 3"
              aria-label="Filter addresses"
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
          )}
          <ul className="mt-3 max-h-96 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {visible.map((a) => (
              <li key={a.id}>
                <button onClick={() => choose(a)} disabled={loading} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-60">
                  <span>{a.address}</span>
                  {selected?.id === a.id && loading && <span className="text-xs text-slate-500">Loading…</span>}
                </button>
              </li>
            ))}
            {!visible.length && <li className="px-4 py-3 text-sm text-slate-500">No matches. Try a different search.</li>}
          </ul>
          <button onClick={backToSearch} className="mt-4 text-sm text-slate-500 underline">Change postcode</button>
        </div>
      )}

      {step === "result" && result && selected && (
        <>
          <BillsForm onApply={applyBills} active={usingBills} />
          <RoadmapView address={selected.address} role={role} result={result} stripeLink={stripeLink} affiliateLink={affiliateLink} onReset={backToSearch} usingBills={usingBills} />
        </>
      )}
    </section>
  );
}
