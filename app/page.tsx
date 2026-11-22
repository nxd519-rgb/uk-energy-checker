import Calculator from "@/components/Calculator";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Home Energy, EPC &amp; Grant Savings</h1>
      <p className="mt-2 text-slate-600">
        Find out what you may be overpaying and which UK grants could apply, in under a minute.
      </p>
      <Calculator
        stripeLink={process.env.STRIPE_PAYMENT_LINK || "#"}
        affiliateLink={process.env.AFFILIATE_LINK || "#"}
      />
    </main>
  );
}
