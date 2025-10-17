import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn789t0cfcgadt5aq7yyv69ab17skn1r/design-tokens/tailwind.preset";

const config: Config = {
  presets: [tailwindPreset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/src/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
};

export default config;
