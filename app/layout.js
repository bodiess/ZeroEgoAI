import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const plus = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Zenith Decision",
  description: "Zero Ego - Tone & Bias Copilot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={plus.variable}>
      <body>{children}</body>
    </html>
  );
}
