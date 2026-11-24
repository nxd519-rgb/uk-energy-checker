"use client";
import { useState } from "react";
const gbp=(v:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(v);
function NumberField({label,value,onChange,unit}:{label:string;value:number;onChange:(v:number)=>void;unit:string}){return <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-1 flex items-center rounded-lg border border-slate-300"><input type="number" min="0" step="any" className="w-full min-w-0 rounded-lg p-3" value={value} onChange={e=>onChange(Math.max(0,Number(e.target.value)||0))}/><span className="pr-3 text-xs text-slate-500">{unit}</span></div></label>}
export default function SolarEVCalculator(){
 const [kwp,setKwp]=useState(4),[yieldPerKwp,setYield]=useState(850),[otherUse,setOtherUse]=useState(1600),[availableShare,setAvailableShare]=useState(40),[miles,setMiles]=useState(10000),[eff,setEff]=useState(3.5),[loss,setLoss]=useState(10),[importP,setImport]=useState(26.32),[exportP,setExport]=useState(12),[cost,setCost]=useState(6500);
 const generation=kwp*yieldPerKwp;
 const excess=Math.max(0,generation-Math.min(generation,otherUse));
 const evDemand=miles/Math.max(0.1,eff)/(1-Math.min(50,loss)/100);
 const solarToEV=Math.min(excess* Math.min(100,availableShare)/100,evDemand);
 const avoided=solarToEV*importP/100, forgone=solarToEV*exportP/100, net=avoided-forgone;
 return <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-lg sm:p-8">
 <h3 className="text-xl font-bold text-slate-900">Solar panels + EV charging savings</h3>
 <p className="mt-2 text-sm text-slate-600">Estimate the financial benefit of using surplus solar generation to charge your EV instead of exporting it. Use the rate you would otherwise pay to charge, including an overnight rate if applicable. The result depends on whether your car is at home while panels generate power.</p>
 <div className="mt-5 rounded-2xl bg-gradient-to-br from-amber-950 via-amber-800 to-orange-700 p-6 text-white shadow-lg" aria-live="polite"><p className="text-sm text-amber-100">{net>=0?"Estimated saving from solar EV charging":"Estimated extra cost vs exporting"}</p><p className="mt-2 text-5xl font-extrabold">{gbp(Math.abs(net))}<span className="text-lg font-normal"> / year</span></p><p className="mt-2 text-amber-100">{gbp(Math.abs(net)/12)} per month · compared with exporting surplus solar</p></div>
 <div className="mt-5 grid gap-4 sm:grid-cols-2">
 <NumberField label="Solar panel system" value={kwp} onChange={setKwp} unit="kWp"/>
 <NumberField label="Surplus solar available when EV is home" value={availableShare} onChange={v=>setAvailableShare(Math.min(100,v))} unit="%"/><NumberField label="EV mileage" value={miles} onChange={setMiles} unit="miles/year"/>
 <NumberField label="Alternative EV charging rate" value={importP} onChange={setImport} unit="p/kWh"/><NumberField label="Export payment" value={exportP} onChange={setExport} unit="p/kWh"/></div><details className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-medium">Advanced settings</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField label="Annual solar yield (measured or site-specific)" value={yieldPerKwp} onChange={setYield} unit="kWh/kWp"/><NumberField label="Solar used elsewhere in home" value={otherUse} onChange={setOtherUse} unit="kWh/year"/><NumberField label="EV efficiency" value={eff} onChange={setEff} unit="miles/kWh"/><NumberField label="Charging losses" value={loss} onChange={setLoss} unit="%"/><NumberField label="Solar installation cost (optional)" value={cost} onChange={setCost} unit="£"/>
 </div></details>
 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 <div className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-600">Annual solar generation</p><p className="text-2xl font-bold">{Math.round(generation).toLocaleString("en-GB")} kWh</p></div>
 <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs text-blue-800">Solar used for EV</p><p className="text-2xl font-bold">{Math.round(solarToEV).toLocaleString("en-GB")} kWh</p></div>
 <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs text-emerald-800">Net benefit vs exporting</p><p className="text-2xl font-bold text-emerald-800">{gbp(net)}/yr</p></div>
 </div>
 <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><p>Grid electricity avoided: <strong>{gbp(avoided)}/year</strong></p><p>Export payments given up: <strong>{gbp(forgone)}/year</strong></p><p className="mt-2 font-semibold">Net difference: {gbp(net)}/year {net<0?"(exporting is more valuable under these assumptions)":"(charging is more valuable under these assumptions)"}</p></div>
 <p className="mt-3 text-xs text-slate-500">This is the incremental benefit of redirecting surplus solar from export to EV charging, not the total return on a solar installation. The installation cost entered ({gbp(cost)}) is shown for context only: it is not used to claim a solar payback because that would also require total household self-consumption, export revenue, maintenance and system lifetime. The availability percentage is a user estimate, not an hourly solar forecast. Use measured annual generation divided by installed kWp, or a site-specific PVGIS estimate: https://re.jrc.ec.europa.eu/pvg_tools/en/.</p>
 </section>;
}

