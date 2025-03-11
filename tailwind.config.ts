import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "ui-line": "#e5e7eb",
        "ui-line-dark": "#3c434c",
        "ui-area": "#f6f8fa",
        "ui-area-dark": "#0d1117",
        "ui-line-green": "#1f793a",
        "ui-area-green": "#1f883d",
      }
    },
  },
  plugins: [],
};
export default config;
