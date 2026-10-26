import { Archivo, Fraunces, Kaushan_Script } from "next/font/google";

// Display: Fraunces 900 with the SOFT axis (rounded, Cooper-style)
const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT"],
  variable: "--font-display",
  display: "swap",
});

// UI / menu / body: Archivo with the width axis (font-stretch 62–125%)
const ui = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-ui",
  display: "swap",
});

// Wordmark only ("Benny's")
const script = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const fontVariables = `${display.variable} ${ui.variable} ${script.variable}`;
