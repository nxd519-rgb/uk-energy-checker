import Calculator from "@/components/Calculator";
import HeatPumpCalculator from "@/components/HeatPumpCalculator";
import SmartEVTariffComparison from "@/components/SmartEVTariffComparison";
import SolarEVCalculator from "@/components/SolarEVCalculator";

export const dynamic = "force-dynamic";

const tools = [
  {
    number: "01",
    title: "Home Energy & EPC",
    description:
      "Check your property's energy efficiency, estimated bills, grants and potential improvements.",
    href: "#epc",
    icon: "🏠",
    style: "border-teal-200 bg-gradient-to-br from-white to-teal-50 hover:border-teal-500", accent: "text-teal-800", tile: "bg-teal-100",
  },
  {
    number: "02",
    title: "Heat Pump Calculator",
    description:
      "Explore installation costs, possible grants, running-cost savings and investment payback.",
    href: "#heat-pumps",
    icon: "🌡️",
    style: "border-orange-200 bg-gradient-to-br from-white to-orange-50 hover:border-orange-500", accent: "text-orange-800", tile: "bg-orange-100",
  },
  {
    number: "03",
    title: "EV Tariff Comparison",
    description:
      "Compare standard and EV electricity tariffs, including household usage and overnight charging.",
    href: "#ev-tariffs",
    icon: "🚗",
    style: "border-blue-200 bg-gradient-to-br from-white to-blue-50 hover:border-blue-500", accent: "text-blue-800", tile: "bg-blue-100",
  },
  {
    number: "04",
    title: "Solar + EV Savings",
    description:
      "Estimate the financial benefit of using solar generation to charge your electric vehicle.",
    href: "#solar-ev",
    icon: "☀️",
    style: "border-amber-200 bg-gradient-to-br from-white to-amber-50 hover:border-amber-500", accent: "text-amber-900", tile: "bg-amber-100",
  },
];

const quoteProviders = {
  home: [{name:"TrustMark",url:"https://www.trustmark.org.uk/",price:"Request a quote",scope:"Find registered home improvement installers"}],
  heat: [{name:"British Gas",url:"https://www.britishgas.co.uk/heating/air-source-heat-pumps.html",price:"Online estimate",scope:"Final quote after technical survey"},{name:"BOXT",url:"https://www.boxt.co.uk/",price:"Request a quote",scope:"Advertised heat pump installation; check grant assumptions and scope"},{name:"Universal Energy",url:"https://universal-energy.co.uk/",price:"Request a quote",scope:"Check postcode coverage and grant treatment"}],
  ev: [{name:"BOXT",url:"https://www.boxt.co.uk/",price:"Request a quote",scope:"EV charger installation"},{name:"Universal Energy",url:"https://universal-energy.co.uk/",price:"Request a quote",scope:"EV charger installation; check postcode coverage"},{name:"ECONEXIS",url:"https://econexis.co.uk/pricing",price:"Request a quote",scope:"7 kW charger, standard installation; check coverage"}],
  solar: [{name:"Octopus Energy",url:"https://octopus.energy/order/solar/",price:"Request a quote",scope:"Solar installation; confirm panel count and battery options"},{name:"ECONEXIS",url:"https://econexis.co.uk/pricing",price:"Request a quote",scope:"4.7 kWp, 10 panels, no battery; check coverage"},{name:"Newpower",url:"https://www.newpoweruk.co.uk/",price:"Request a quote",scope:"Solar plus battery; check specification and coverage"}]
};
function InstallationQuotes({sector}:{sector:keyof typeof quoteProviders}) {
 return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
 <h3 className="text-xl font-bold">Find installation quotes</h3>
 <p className="mt-2 text-sm text-slate-600">Request current prices directly from providers. We do not receive live quotes or rank providers by price. Packages are not necessarily comparable. Confirm equipment, installation scope, grants, VAT and availability directly with each provider.</p>
 <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{quoteProviders[sector].map(p=><article key={p.name} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4"><h4 className="font-bold">{p.name}</h4><p className="mt-2 text-2xl font-extrabold text-blue-900">{p.price}</p><p className="mt-2 text-sm text-slate-600">{p.scope}</p><a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 font-semibold text-blue-800 underline">Get current quote ↗</a></article>)}</div>
 <p className="mt-4 text-sm"><a href="#methodology" className="underline">Sources and limitations</a> · <a href="#tools" className="underline">Back to calculators</a></p><p className="mt-4 text-xs text-slate-400">These are selected providers, not a whole-market comparison or endorsement. No customer information is sent automatically. Check installer credentials and obtain written quotes before committing.</p></section>;
}

export default function Page() {
  const affiliateLink = process.env.AFFILIATE_LINK || "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-700 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <a href="#" className="text-lg font-extrabold tracking-tight">
            <span className="text-cyan-300">⚡ UK Energy</span>{" "}
            Checker
          </a>

        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-teal-800 px-4 py-16 md:py-24 text-white">
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-200">
            Free UK household energy tools
          </p>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Smarter energy. <span className="block text-cyan-300">Lower bills.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            Understand your energy bills, explore home improvements,
            compare EV electricity tariffs and calculate solar
            charging savings — all in one place.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#tools"
              className="rounded-xl bg-cyan-300 px-6 py-3 font-bold text-slate-950 shadow-lg hover:bg-cyan-200"
            >
              Explore free calculators
            </a>


          </div>

          <p className="mt-6 text-sm text-slate-200">
            Free to use · No account required · Estimates, not guarantees
          </p>
        </div>
      </section>

      <section
        id="tools"
        className="mx-auto max-w-6xl scroll-mt-8 px-4 py-10"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">
            Choose what you want to save on
          </h2>
          <p className="mt-3 text-slate-600">
            Select a calculator to jump straight to it.
            Only the EPC assessment requires a property search.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <a
              key={tool.number}
              href={tool.href}
              className={`group flex flex-col rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${tool.style}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${tool.tile}`}>{tool.icon}</span>
                <span className="text-xs font-semibold text-slate-400">
                  {tool.number}
                </span>
              </div>

              <h3 className="text-xl font-bold">
                {tool.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {tool.description}
              </p>

              <p className={`mt-auto pt-5 text-sm font-bold ${tool.accent}`}>
                See my savings →
              </p>
            </a>
          ))}
        </div>
      </section>

      <section id="epc" className="scroll-mt-6 border-t border-teal-100 bg-gradient-to-br from-teal-50 to-white py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Property assessment
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Home Energy & EPC Savings
            </h2>

            <p className="mt-3 text-slate-600">
              Enter your property details to explore estimated
              energy costs, possible grants and recommended
              improvements based on available EPC information.
            </p>
          </div>

          <Calculator
            stripeLink={process.env.STRIPE_PAYMENT_LINK || "#"}
            affiliateLink={affiliateLink}
          />
          <InstallationQuotes sector="home" />
        </div>
      </section>

      <section
        id="heat-pumps"
        className="scroll-mt-6 border-t border-orange-100 bg-gradient-to-br from-orange-50 to-white py-14"
      >
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold">
            Is a Heat Pump Worth Installing?
          </h2>

          <p className="mt-3 text-slate-600">
            Explore the cost of installing a heat pump,
            possible grant support and estimated financial
            payback. You can use this tool without an EPC.
          </p>

          <HeatPumpCalculator affiliateLink={affiliateLink} />
          <InstallationQuotes sector="heat" />
        </div>
      </section>

      <section
        id="ev-tariffs"
        className="scroll-mt-6 border-t border-blue-100 bg-gradient-to-br from-blue-50 to-white py-14"
      >
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold">
            Could an EV Tariff Lower Your Electricity Bill?
          </h2>

          <p className="mt-3 text-slate-600">
            Compare the total cost of household electricity
            on standard and EV-specific tariffs, including
            the effect of cheaper overnight charging.
          </p>

          <SmartEVTariffComparison />
          <InstallationQuotes sector="ev" />
        </div>
      </section>

      <section
        id="solar-ev"
        className="scroll-mt-6 border-t border-amber-100 bg-gradient-to-br from-amber-50 to-white py-14"
      >
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold">
            Solar Panels & EV Charging Savings
          </h2>

          <p className="mt-3 text-slate-600">
            Estimate whether using surplus solar electricity
            to charge your EV could reduce costs compared
            with importing electricity or exporting your
            solar generation.
          </p>

          <SolarEVCalculator />
          <InstallationQuotes sector="solar" />
        </div>
      </section>

      <section className="bg-blue-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold">
            How reliable are these estimates?
          </h2>

          <p className="mt-4 leading-7 text-emerald-100">
            UK Energy Checker provides illustrative financial
            estimates, not guaranteed savings or installation
            quotations. Actual results depend on your energy
            usage, tariff, property, installation costs and
            eligibility for grants.
          </p>

          <p className="mt-4 leading-7 text-emerald-100">
            Where available, the EPC assessment uses public
            property information. Other calculators use
            adjustable assumptions. Always check current
            tariffs, grant conditions and installer quotations
            before making financial decisions.
          </p>
        </div>
      </section>

      <section id="methodology" className="mx-auto max-w-4xl px-4 py-10"><h2 className="text-2xl font-bold">Sources and limitations</h2><p className="mt-3 text-sm leading-6 text-slate-600">EPC-based estimates cover England and Wales and use simplified assumptions, not a property survey. Default tariff and installation assumptions may differ from your actual costs. Savings across calculators can overlap and should not be added together. Grants are conditional, not confirmed awards.</p><div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-blue-800"><a className="underline" href="https://www.ofgem.gov.uk/energy-price-cap">Ofgem price cap</a><a className="underline" href="https://www.gov.uk/find-energy-certificate">Official EPC register</a><a className="underline" href="https://www.gov.uk/apply-boiler-upgrade-scheme">Boiler Upgrade Scheme</a><a className="underline" href="https://mcscertified.com/">MCS installer information</a></div></section>
      <footer className="bg-slate-950 px-4 py-8 text-center text-sm text-slate-300">
        <p className="font-semibold text-white">
          UK Energy Checker
        </p>

        <p className="mt-2">
          Energy cost estimates and selected installer links.
        </p>

        <p className="mt-3 text-xs text-slate-400">
          Some links may be commercial referrals. Where an
          affiliate partnership applies, we may earn a
          commission at no additional cost to you.
        </p>

        <p className="mt-4 text-xs text-slate-500">
          © {new Date().getFullYear()} UK Energy Checker
        </p>
      </footer> 

    </main>
  );
}
