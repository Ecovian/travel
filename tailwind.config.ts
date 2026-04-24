import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        float: "0 28px 70px rgba(18, 42, 47, 0.14)",
      },
      colors: {
        sand: "#f4ede1",
        ink: "#17313c",
        tide: "#0f766e",
        ember: "#ff8647",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(255, 209, 163, 0.7), transparent 36%), radial-gradient(circle at top right, rgba(24, 120, 117, 0.18), transparent 28%)",
      },
    },
  },
  plugins: [],
};

export default config;
