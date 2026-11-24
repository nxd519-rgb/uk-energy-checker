"use client";

import { useState } from "react";
import type { Bills } from "@/lib/calc";

const parse = (s: string): number | undefined => {
  const t = s.replace(/,/g, "").trim();
  return t === "" ? undefined : Number(t);
};

export default function BillsForm({ onApply, active }: { onApply: (b: Bills) => void; active: boolean }) {
  const [gas, setGas] = useState("");
  const [elec, setElec] = useState("");
  const [rates,setRates]=useState<string[]>(["","","",""]);
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const g = parse(gas);
    const el = parse(elec);
    if (g === undefined && el === undefined && rates.every(x=>x.trim()==="")) {
      setErr("Enter at least one figure, or leave this blank to keep the estimates.");
      return;
    }
    if (g !== undefined && (!Number.isFinite(g) || g < 500 || g > 60000)) {
      setErr("That gas figure looks off. Enter your yearly kWh (most homes use roughly 5,000 to 25,000).");
      return;
    }
    if (el !== undefined && (!Number.isFinite(el) || el < 500 || el > 20000)) {
      setErr("That electricity figure looks off. Enter your yearly kWh (most homes use roughly 1,500 to 6,000).");
      return;
    }
    const values=rates.map(parse);
    if(values.some(v=>v!==undefined && (!Number.isFinite(v)||v<0||v>1000))){setErr("Enter valid non-negative rates in pence.");return;}
    setErr("");
    onApply({ annualGasKwh: g, annualElecKwh: el, gasRate:values[0],elecRate:values[1],gasStanding:values[2],elecStanding:values[3] });
  }

  function clear() {
    setRates(["","","",""]);
    setGas("");
    setElec("");
    setErr("");
    onApply({});
  }

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200";

  return (
    <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 print:hidden">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">
        Make this more accurate with your own usage {active && <span className="ml-1 text-emerald-700">(in use)</span>}
      </summary>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <p className="text-xs text-slate-600">
          Find your yearly kWh on your annual statement or in your supplier&apos;s app. Both boxes are optional. The gas figure only applies if your home is heated by mains gas.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="gas" className="block text-xs font-medium text-slate-700">Gas, kWh per year</label>
            <input id="gas" inputMode="numeric" value={gas} onChange={(e) => setGas(e.target.value)} placeholder="e.g. 11,000" className={input} />
          </div>
          <div>
            <label htmlFor="elec" className="block text-xs font-medium text-slate-700">Electricity, kWh per year</label>
            <input id="elec" inputMode="numeric" value={elec} onChange={(e) => setElec(e.target.value)} placeholder="e.g. 2,800" className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">{["Gas p/kWh","Electricity p/kWh","Gas standing p/day","Electricity standing p/day"].map((label,i)=><label key={label} className="text-xs">{label}<input className={input} type="number" min="0" step="any" value={rates[i]} placeholder={["7.97","26.32","29.68","54.83"][i]} onChange={e=>setRates(prev=>prev.map((v,j)=>i===j?e.target.value:v))}/></label>)}</div><p className="text-xs text-slate-600">Leave rates blank to use the dated GB average. Enter your own VAT-inclusive bill rates for a regional or fixed tariff.</p>{err && <p role="alert" className="text-xs text-red-700">{err}</p>}
        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Recalculate</button>
          {active && <button type="button" onClick={clear} className="text-xs text-slate-500 underline">Go back to estimates</button>}
        </div>
      </form>
    </details>
  );
}
