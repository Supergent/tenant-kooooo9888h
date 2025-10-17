import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn789t0cfcgadt5aq7yyv69ab17skn1r/design-tokens/tailwind.preset";

const config: Config = {
  darkMode: ["class"],
  presets: [tailwindPreset],
  content: ["./src/**/*.{{ts,tsx}}"],
  plugins: [],
};

export default config;
