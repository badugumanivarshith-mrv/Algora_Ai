import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentRepository } from "../../repositories/agentRepository";

export class ResearchAssistantService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  public static async analyzePaper(paperText: string, task: 'summarize' | 'explain' | 'methodology' | 'prerequisites', userId?: string) {
    // V4.0 AI OS Integration: Log to Research Agent memory
    if (userId) {
      await AgentRepository.saveMemory("research-agent", userId, `paper_analysis_${Date.now()}`, `User analyzed a paper using task: ${task}`, 6);
    }

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let prompt = "";
    switch (task) {
      case 'summarize':
        prompt = `Summarize the following research paper text, highlighting key findings and contributions:\n\n${paperText}`;
        break;
      case 'explain':
        prompt = `Explain the core concepts of this research paper in simple terms for a student:\n\n${paperText}`;
        break;
      case 'methodology':
        prompt = `Analyze the research methodology used in this paper. Explain the approach, data, and validation techniques:\n\n${paperText}`;
        break;
      case 'prerequisites':
        prompt = `Identify the prerequisite knowledge (math, algorithms, theories) needed to fully understand this research paper:\n\n${paperText}`;
        break;
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  public static async suggestResearchDirections(topic: string, currentState: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on the research topic "${topic}" and its current state: "${currentState}", suggest 5 potential future research directions or gaps to explore.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
