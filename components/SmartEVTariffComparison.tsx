"use client";
import { useState } from "react";
const money = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
const Field = ({label,value,set,unit}: {label:string;value:number;set:(v:number)=>void;unit:string}) => <label className="block text-sm text-slate-700"><span className="mb-1 block font-medium">{label}</span><div className="flex items-center rounded-lg border border-slate-300"><input className="w-full min-w-0 rounded-lg p-3" type="number" min="0" step="any" value={value} onChange={e=>set(Math.max(0,Number(e.target.value)||0))}/><span className="pr-3 text-xs text-slate-500">{unit}</span></div></label>;
export default function SmartEVTariffComparison(){
 const [miles,setMiles]=useState(10000),[eff,setEff]=useState(3.5),[house,setHouse]=useState(2700),[homeNight,setHomeNight]=useState(15),[evNight,setEvNight]=useState(90),[loss,setLoss]=useState(10);
 const [standard,setStandard]=useState(26.32),[standardStanding,setStandardStanding]=useState(54.83),[day,setDay]=useState(29),[night,setNight]=useState(7),[evStanding,setEvStanding]=useState(50);
 const [homeShare,setHomeShare]=useState(100); const [install,setInstall]=useState(0);
 const chargeKwh=miles*homeShare/100/Math.max(eff,0.1)/(1-Math.min(loss,50)/100);
 const standardAnnual=(house+chargeKwh)*standard/100+365*standardStanding/100;
 const nightKwh=house*homeNight/100+chargeKwh*evNight/100;
 const dayKwh=house+chargeKwh-nightKwh;
 const evAnnual=nightKwh*night/100+dayKwh*day/100+365*evStanding/100;
 const saving=standardAnnual-evAnnual;
 return <section className="mt-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-lg sm:p-8">
  <h3 className="text-xl font-bold text-slate-900">Whole-household EV tariff comparison</h3>
  <p className="mt-2 text-sm text-slate-600">Compare the entire electricity bill, including daytime household use, overnight charging and standing charges. Enter the actual rates from your tariff offers.</p>
  <div className="mt-5 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 p-6 text-white shadow-lg" aria-live="polite"><p className="text-sm text-blue-100">{saving>=0?"Estimated annual electricity saving":"Estimated extra annual electricity cost"}</p><p className="mt-2 text-5xl font-extrabold tracking-tight">{money(Math.abs(saving))}<span className="text-lg font-normal"> / year</span></p><p className="mt-2 text-blue-100">{money(Math.abs(saving)/12)} per month · whole household including EV</p></div>
  <div className="mt-5 grid gap-4 sm:grid-cols-2">
   <Field label="Annual EV mileage" value={miles} set={setMiles} unit="miles"/><Field label="Household electricity excluding EV" value={house} set={setHouse} unit="kWh/year"/>
   <Field label="Standard unit rate" value={standard} set={setStandard} unit="p/kWh"/><Field label="EV tariff daytime rate" value={day} set={setDay} unit="p/kWh"/>
   <Field label="EV tariff night rate" value={night} set={setNight} unit="p/kWh"/></div><details className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-medium">Advanced settings</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Share of EV mileage charged at home" value={homeShare} set={v=>setHomeShare(Math.min(100,v))} unit="%"/><Field label="EV efficiency" value={eff} set={setEff} unit="miles/kWh"/><Field label="Standard standing charge" value={standardStanding} set={setStandardStanding} unit="p/day"/><Field label="EV tariff standing charge" value={evStanding} set={setEvStanding} unit="p/day"/><Field label="Charging losses" value={loss} set={setLoss} unit="%"/>
   <Field label="EV charging in night window" value={evNight} set={v=>setEvNight(Math.min(100,v))} unit="%"/><Field label="Other household use at night" value={homeNight} set={v=>setHomeNight(Math.min(100,v))} unit="%"/>
  </div></details>
  <div className="mt-5 grid gap-3 sm:grid-cols-3">
   <div className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-600">Standard annual bill</p><p className="text-2xl font-bold">{money(standardAnnual)}</p></div>
   <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs text-blue-800">EV tariff annual bill</p><p className="text-2xl font-bold">{money(evAnnual)}</p></div>
   <div className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-900">{saving>=0?"Estimated annual saving":"Estimated additional cost"}</p><p className="text-2xl font-bold text-slate-900">{money(Math.abs(saving))}</p></div>
  </div>
  <div className="mt-4"><Field label="Additional upfront charger or switching cost (enter quote; zero if none)" value={install} set={setInstall} unit="£"/></div><div className="mt-3 grid gap-3 sm:grid-cols-3">{[["Upfront cost",install],["5-year tariff savings",saving*5],["5-year net after cost",saving*5-install]].map(([label,value])=><div key={String(label)} className="rounded-xl bg-slate-100 p-4"><p className="text-sm">{label}</p><strong className="text-xl">{money(Number(value))}</strong></div>)}</div><a href="https://checkout.octopus.energy/" target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-xl bg-blue-800 p-3 text-center text-white font-bold">Get EV charger installation prices ↗</a><p className="mt-3 text-sm text-slate-700">Estimated electricity bought for EV charging: <strong>{Math.round(chargeKwh).toLocaleString("en-GB")} kWh/year</strong>. {saving>=0?"The EV tariff is cheaper under these assumptions.":"The standard tariff is cheaper under these assumptions."}</p>
  <p className="mt-2 text-xs text-slate-500">Example rates are illustrative, not live prices. Excludes public charging costs, assumed unchanged between tariffs. Assumes the stated share of home consumption fits the tariff's actual off-peak window. Some tariffs have eligibility, charger and vehicle restrictions; check supplier terms. Charging losses are capped at 50% for calculation safety.</p>
 </section>;
}

