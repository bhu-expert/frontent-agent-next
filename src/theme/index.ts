import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: "#8a2ce2" },
        accent: { value: "#fbcfe8" },
        brandDark: { value: "#111827" },
        brandSoft: { value: "#fdf2f8" },
      },
      radii: {
        "xl-custom": { value: "12px" },
        "2xl-custom": { value: "24px" },
        "3xl-custom": { value: "48px" },
      },
      fonts: {
        heading: { value: "Space Grotesk, sans-serif" },
        body: { value: "Space Grotesk, sans-serif" },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: "{colors.brandSoft}" },
        text: { value: "{colors.brandDark}" }
      }
    }
  },
})

export const system = createSystem(defaultConfig, customConfig)
