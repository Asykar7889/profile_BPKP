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
        bpkp: {
          blue: '#0000FE',        // Primary BPKP Swoosh Blue
          blueHover: '#1A1AFE',   // Interactive Hover Blue
          blueSoft: '#EDEDFF',    // Soft Blue Highlight / Active Menu Fill
          blueBorder: '#DCDCFF',  // Subtle Blue Border
          red: '#FF0000',         // Secondary BPKP Crescent Red
          redSoft: '#FFEAEA',     // Soft Red Accent Fill
          black: '#000000',       // BPKP Wordmark Black
          surface: '#F9F9F9',     // Light Neutral App Background
          border: '#EDEDED',      // Clean Divider Border
        },
        tier: {
          default: '#E2E8F0',
          terjaga: '#15803D',     // 80.00 - 100.00
          terawasi: '#4ADE80',    // 60.00 - 79.99
          waspada: '#FACC15',     // 40.00 - 59.99
          rawan: '#FB923C',       // 20.00 - 39.99
          rentan: '#EF4444',      // 0.00 - 19.99
        },
      },
    },
  },
  plugins: [],
};
export default config;
