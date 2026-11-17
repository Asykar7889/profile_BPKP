import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tier: {
          default: '#E2E8F0',
          terjaga: '#15803D',
          terawasi: '#4ADE80',
          waspada: '#FACC15',
          rawan: '#FB923C',
          rentan: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
export default config;
