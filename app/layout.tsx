
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  verification: {
    google: "jaauyXS92lAX-DtbuyceS5sXkczGSE6bP3pKk9mpktY",
  },

  metadataBase: new URL(
    "https://uk-energy-checker.vercel.app"
  ),

  title: {
    default:
      "UK Energy Checker | Free Home Energy Savings Calculators",
    template: "%s | UK Energy Checker",
  },

  description:
    "Free UK energy calculators. Compare heat pump installation costs, EV electricity tariffs, solar panel savings and home EPC improvements.",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "UK Energy Checker | Reduce Your Energy Costs",
    description:
      "Free UK calculators for heat pumps, solar panels, EV charging and home energy efficiency.",
    url: "https://uk-energy-checker.vercel.app",
    siteName: "UK Energy Checker",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

