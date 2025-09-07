import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  githubToken: process.env.GITHUB_TOKEN,
  targetRepo: process.env.TARGET_REPO || "facebook/react",
  prLimit: 50,
  outputDir: "out",
  thanksKeywords: [
    "thank you",
    "thanks",
    "\\btks\\b",
    "obrigad[oa]",
    "valeu",
    "\\bobg\\b",
    "\\bvlw\\b"
  ]
} as const;

export function validateConfig(): void {
  if (!config.githubToken) {
    console.error("Defina a variável de ambiente GITHUB_TOKEN com um token válido do GitHub.");
    process.exit(1);
  }
}
