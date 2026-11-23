
"use client";

import { useState } from "react";

export default function EVSavingsCalculator() {
  const [miles, setMiles] = useState(10000);
  const [efficiency, setEfficiency] = useState(3.5);
  const [chargingLoss, setChargingLoss] = useState(10);
  const [evRate, setEvRate] = useState(8);
  const [standardRate, setStandardRate] = useState(25);
  const [dayRate, setDayRate] = useState(29);
  const [householdKwh, setHouseholdKwh] = useState(3000);
  const [petrolPrice, setPetrolPrice] = useState(145);
  const [petrolMpg, setPetrolMpg] = useState(45);

  const safeEfficiency = Math.max(efficiency, 0.1);
  const evKwh =
    (miles / safeEfficiency) * (1 + chargingLoss / 100);

  const standardCost = evKwh * standardRate / 100;
  const evCost = evKwh * evRate / 100;

  const standardHouseCost =
    householdKwh * standardRate / 100;

  const evHouseCost =
    householdKwh * dayRate / 100;

  const totalStandard = standardCost + standardHouseCost;
  const totalEvTariff = evCost + evHouseCost;

  const tariffSavings = totalStandard - totalEvTariff;

  const petrolLitres =
    (miles / petrolMpg) * 4.54609;

  const petrolCost =
    petrolLitres * petrolPrice / 100;

  const money = (value: number) =>
    value.toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    });

  const fields = [
    ["Annual EV mileage", miles, setMiles],
    ["EV efficiency (miles/kWh)", efficiency, setEfficiency],
    ["Charging losses (%)", chargingLoss, setChargingLoss],
    ["EV overnight rate (p/kWh)", evRate, setEvRate],
    ["Standard electricity rate (p/kWh)", standardRate, setStandardRate],
    ["EV tariff daytime rate (p/kWh)", dayRate, setDayRate],
    ["Household annual electricity (kWh)", householdKwh, setHouseholdKwh],
    ["Petrol price (p/litre)", petrolPrice, setPetrolPrice],
    ["Petrol car efficiency (UK mpg)", petrolMpg, setPetrolMpg],
  ] as const;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="text-3xl font-bold text-slate-900">
        EV Charging Cost Calculator UK
      </h2>

      <p className="mt-3 text-slate-600">
        Compare electric vehicle charging costs, petrol
        costs and the effect of EV tariffs on your
        entire household electricity bill.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {fields.map(([label, value, setter]) => (
          <label
            key={label}
            className="rounded-xl border bg-white p-4"
          >
            <span className="block text-sm font-medium">
              {label}
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(e) =>
                setter(Number(e.target.value))
              }
              className="mt-2 w-full rounded-lg border p-2"
            />
          </label>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Result
          title="Annual EV charging"
          value={money(evCost)}
        />
        <Result
          title="Equivalent petrol cost"
          value={money(petrolCost)}
        />
        <Result
          title="EV fuel saving vs petrol"
          value={money(petrolCost - evCost)}
        />
      </div>

      <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white">
        <h3 className="text-xl font-bold">
          Whole-household tariff comparison
        </h3>

        <p className="mt-3">
          Standard tariff total: {money(totalStandard)}
        </p>

        <p className="mt-2">
          EV tariff total: {money(totalEvTariff)}
        </p>

        <p className="mt-5 text-2xl font-bold text-emerald-300">
          {tariffSavings >= 0
            ? `EV tariff saves ${money(tariffSavings)} per year`
            : `EV tariff costs ${money(-tariffSavings)} more per year`}
        </p>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Illustrative estimates only. Assumes all EV
        charging uses the selected rate, household
        consumption uses the daytime rate, and standing
        charges are identical. Actual results depend on
        charging schedules, tariff terms and vehicle
        efficiency. Default prices are examples, not
        live tariffs.
      </p>
    </section>
  );
}

function Result({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
