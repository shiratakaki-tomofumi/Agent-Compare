import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#e2e8f0",
        foam: "#f8fafc",
        sand: "#f6efe7",
        ember: "#d97706",
        pine: "#14532d",
        coral: "#b91c1c",
        ocean: "#0f766e"
      },
      boxShadow: {
        panel: "0 20px 50px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "dashboard-grid":
          "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
