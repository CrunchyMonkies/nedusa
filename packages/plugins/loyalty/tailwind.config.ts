import preset from "@nedusa/ui-preset"
import { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/admin/**/*.{ts,tsx}"],
  presets: [preset],
}

export default config
