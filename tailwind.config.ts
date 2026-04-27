import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#06070a",
        },
      },
      boxShadow: {
        halo: "0 18px 70px rgba(0, 0, 0, 0.45)",
      },
      letterSpacing: {
        tesla: "0.28em",
      },
    },
  },
  plugins: [],
};

export default config;

