/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@nedusa/ui-preset")],
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: ["class", '[data-mode="dark"]'],
}
