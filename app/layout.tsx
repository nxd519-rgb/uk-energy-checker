import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Home Energy, EPC & Grant Savings Calculator",
  description: "Estimate your energy overpayment and the UK grants you may qualify for.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
