import { GoogleGenerativeAI } from "@google/generative-ai";

export class StartupAdvisorService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async getBusinessGuidance(idea: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Provide strategic startup advice for: "${idea}".
      Include:
      1. Suggested business model
      2. Potential monetization strategies
      3. Launch plan (GTM strategy)
      4. Key metrics to track for Product-Market Fit
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
