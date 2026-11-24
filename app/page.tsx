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
            No account required · Adjustable calculations · UK-focused
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
        </div>
      </section>

      <section
        id="solar-ev"
        className="scroll-mt-6 bg-slate-50 py-10"
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

      <footer className="bg-slate-950 px-4 py-8 text-center text-sm text-slate-300">
        <p className="font-semibold text-white">
          UK Energy Checker
        </p>

        <p className="mt-2">
          Independent energy cost estimates and comparison tools.
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
