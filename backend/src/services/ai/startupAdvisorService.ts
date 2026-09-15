import { defaultAIProvider } from "./geminiProvider";

export class StartupAdvisorService {
  public static async getBusinessGuidance(idea: string) {
    const prompt = `
      Provide strategic startup advice for: "${idea}".
      Include:
      1. Suggested business model
      2. Potential monetization strategies
      3. Launch plan (GTM strategy)
      4. Key metrics to track for Product-Market Fit
    `;

    return await defaultAIProvider.generateRawText(prompt);
  }
}
