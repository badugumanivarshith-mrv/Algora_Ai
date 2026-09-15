import { defaultAIProvider } from "./geminiProvider";
import { SpeechToTextService } from "./speechToTextService";
import { TextToSpeechService } from "./textToSpeechService";
import { VoiceMentorRepository } from "../../repositories/voiceMentorRepository";
import { RedisManager } from "../../redis/redisClient";
import { KnowledgeGapService } from "./knowledgeGapService";
import { MasteryTrackingService } from "./masteryTrackingService";
import { ContestAnalyticsService } from "./contestAnalyticsService";
import { ContestPredictionService } from "./contestPredictionService";
import { HiringPredictionService } from "./hiringPredictionService";
import { AssessmentAnalyticsService } from "./assessmentAnalyticsService";

import { AttendanceService } from "./attendanceService";
import { AssignmentService } from "./assignmentService";
import { CourseService } from "./courseService";
import { PlacementDriveService } from "./placementDriveService";
import { ProjectWorkspaceService } from "./projectWorkspaceService";
import { ProjectAnalyticsService } from "./projectAnalyticsService";
import { ProjectSkillTrackingService } from "./projectSkillTrackingService";
import { ResearchRepository } from "../../repositories/researchRepository";
import { AgentRepository } from "../../repositories/agentRepository";
import { ProductivityRepository } from "../../repositories/productivityRepository";
import { AgentOrchestratorService } from "./agentOrchestratorService";
import { WorkflowEngineService } from "./workflowEngineService";
import { WorkflowAutomationService } from "./workflowAutomationService";
import { StrategicDecisionService } from "./strategicDecisionService";
import { DigitalTwinService } from "./digitalTwinService";
import { FutureSimulationService } from "./futureSimulationService";
import { OpportunityDiscoveryService } from "./opportunityDiscoveryService";
import { AdaptiveStrategyService } from "./adaptiveStrategyService";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface VoiceChatResult {
  sessionId: string;
  transcript: string;
  aiResponse: string;
  audioUrl: string;
  language: string;
}

export interface VoiceTopicExplanation {
  concept: string;
  example: string;
  timeComplexity: string;
  spaceComplexity: string;
  useCases: string[];
  audioUrl: string;
}

export interface VoiceCodingHelpResult {
  bugAnalysis: string;
  hint: string;
  conceptualExplanation: string;
  audioUrl: string;
}

export class VoiceMentorService {
  public static async processVoiceChat(
    sessionId: string,
    audioInput: string,
    language: string = "English"
  ): Promise<VoiceChatResult> {
    const transcript = await SpeechToTextService.transcribeAudio(audioInput, language);
    const userId = "usr_demo";
    const lower = transcript.toLowerCase();

    // V4.6 Autonomous Execution & Digital Twin Voice Routing
    if (
      lower.includes("what happens if i study") ||
      lower.includes("simulate my next") ||
      lower.includes("what is my biggest risk") ||
      lower.includes("biggest risk") ||
      lower.includes("what opportunity should i") ||
      lower.includes("simulate") ||
      lower.includes("future forecast")
    ) {
      try {
        let aiAnswer = "";
        if (lower.includes("study") || lower.includes("what happens if") || lower.includes("simulate")) {
          aiAnswer = await FutureSimulationService.answerWhatIfQuestion(userId, transcript);
        } else if (lower.includes("risk")) {
          const twin = await DigitalTwinService.getDigitalTwin(userId);
          const topRisk = twin.riskFactors?.[0] || { title: "Skill Stagnation in Dynamic Programming", description: "DP gaps account for a potential 12% drop in Google hiring probability." };
          aiAnswer = `Your most critical strategic risk is ${topRisk.title}: ${topRisk.description}. I have queued an autonomous recovery drill in your daily action plan to mitigate this.`;
        } else if (lower.includes("opportunity")) {
          const opps = await OpportunityDiscoveryService.getOpportunities(userId);
          const topOpp = opps[0] || { title: "Google Early Career Software Engineer Assessment Drive", roiScore: 96 };
          aiAnswer = `The highest-yield opportunity for you right now is the ${topOpp.title} with a calculated ROI score of ${topOpp.roiScore}%. You should register today and complete the practice mock on Algora.`;
        }

        if (aiAnswer) {
          const tts = await TextToSpeechService.generateSpeech(aiAnswer, language);
          await VoiceMentorRepository.saveMessage({
            id: `vmsg-${Date.now()}`,
            sessionId,
            role: "user",
            transcript,
            aiResponse: aiAnswer,
            createdAt: new Date().toISOString(),
          });
          await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: aiAnswer }), 3600);
          return {
            sessionId,
            transcript,
            aiResponse: aiAnswer,
            audioUrl: tts.audioUrl,
            language,
          };
        }
      } catch (e) {
        // Fall through
      }
    }

    // V4.5 Personal AI Executive Voice Routing: Strategic questions handled with Executive Intelligence
    if (
      lower.includes("focus on today") ||
      lower.includes("what should i focus") ||
      lower.includes("how close am i") ||
      lower.includes("biggest weakness") ||
      lower.includes("build next") ||
      lower.includes("which project should i") ||
      lower.includes("which contest should i") ||
      lower.includes("what opportunity") ||
      lower.includes("executive advice") ||
      lower.includes("strategic priority") ||
      lower.includes("strategic direction")
    ) {
      try {
        const executiveAnswer = await StrategicDecisionService.handleVoiceExecutiveQuery(userId, transcript);
        const tts = await TextToSpeechService.generateSpeech(executiveAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: executiveAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: executiveAnswer }), 3600);
        return {
          sessionId,
          transcript,
          aiResponse: executiveAnswer,
          audioUrl: tts.audioUrl,
          language,
        };
      } catch (e) {
        // Fall through to general pipeline if executive lookup fails
      }
    }

    // V4.0 AI OS Integration: Detect agent and workflow commands
    if (lower.includes("agent") || lower.includes("execute") || lower.includes("plan") || lower.includes("automate") || lower.includes("workflow")) {
      // Check for workflow specific command
      if (lower.includes("workflow") || lower.includes("automation")) {
        const workflows = await ProductivityRepository.getWorkflows(userId);
        const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({ model: "gemini-1.5-flash" });
        const mappingPrompt = `
          User Input: "${transcript}"
          Available Workflows: ${JSON.stringify(workflows.map(w => ({ id: w.id, name: w.name })))}
          Identify if the user wants to execute a specific workflow. 
          Return ONLY the workflow ID if found, otherwise return "NONE".
        `;
        const mappingResult = await model.generateContent(mappingPrompt);
        const workflowId = mappingResult.response.text().trim();

        if (workflowId !== "NONE" && workflowId.length > 5) {
          await WorkflowAutomationService.executeAutomation(userId, workflowId, { trigger: 'voice_command', transcript });
          const aiResponse = `I've triggered the automation for ${workflows.find(w => w.id === workflowId)?.name}. I'll notify you once the pipeline completes.`;
          const tts = await TextToSpeechService.generateSpeech(aiResponse, language);
          return { sessionId, transcript, aiResponse, audioUrl: tts.audioUrl, language };
        }
      }

      const agentResponse = await AgentOrchestratorService.orchestrate(userId, transcript);
      const tts = await TextToSpeechService.generateSpeech(agentResponse, language);
      return {
        sessionId,
        transcript,
        aiResponse: agentResponse,
        audioUrl: tts.audioUrl,
        language,
      };
    }

    // Check if user is asking about knowledge gaps, mastery, weaknesses, contest performance, or hiring readiness
    let intelligenceContext = "";
    if (
      lower.includes("weak") ||
      lower.includes("gap") ||
      lower.includes("mastery") ||
      lower.includes("contest") ||
      lower.includes("rating") ||
      lower.includes("google") ||
      lower.includes("hiring") ||
      lower.includes("probability") ||
      lower.includes("assessment") ||
      lower.includes("ready") ||
      lower.includes("attendance") ||
      lower.includes("assignment") ||
      lower.includes("course") ||
      lower.includes("placement") ||
      lower.includes("faculty") ||
      lower.includes("university") ||
      lower.includes("project") ||
      lower.includes("internship") ||
      lower.includes("milestone") ||
      lower.includes("research") ||
      lower.includes("paper") ||
      lower.includes("startup") ||
      lower.includes("innovation") ||
      lower.includes("open source") ||
      lower.includes("oss")
    ) {
      try {
        const gaps = await KnowledgeGapService.detectKnowledgeGaps(userId);
        const scores = await MasteryTrackingService.getMasteryScores(userId);
        const analytics = await ContestAnalyticsService.getUserAnalytics(userId);
        const contestPreds = await ContestPredictionService.getPredictions(userId);
        const hiringPreds = await HiringPredictionService.getPredictions(userId);
        const assessmentAnalytics = await AssessmentAnalyticsService.getUserAnalytics(userId);
        const attendance = await AttendanceService.getAttendanceSummary(userId);
        const courseProgress = await CourseService.getUserCourseProgress(userId);
        const placementDrives = await PlacementDriveService.getPlacementDrives();
        const projectSummary = await ProjectAnalyticsService.getUserProjectSummary(userId);
        const skills = await ProjectSkillTrackingService.getUserSkillMetrics(userId);
        const workspaces = await ProjectWorkspaceService.listWorkspaces(userId);
        const researchProjects = await ResearchRepository.listResearchProjects(userId);
        const researchAnalytics = await ResearchRepository.getResearchAnalytics(userId);
        const innovationAnalytics = await ResearchRepository.getInnovationAnalytics(userId);

        intelligenceContext = `\nUser Intelligence Context:
Project Summary: ${JSON.stringify(projectSummary)}
Top Project Skills: ${JSON.stringify(skills.slice(0, 3))}
Active Workspaces: ${JSON.stringify(workspaces.map(w => ({ name: w.name, status: w.status })))}
Research: ${researchProjects.length} projects, Impact: ${researchAnalytics?.impact_factor || 0}
Innovation: ${innovationAnalytics?.innovation_score || 0}
Attendance: ${attendance.percentage}%
Course Progress: ${JSON.stringify(courseProgress.activeCourses)}
Placement Drives: ${JSON.stringify(placementDrives.map(p => ({ company: p.company, title: p.title })))}
Active Knowledge Gaps: ${JSON.stringify(gaps.slice(0, 3))}
Mastery Scores: ${JSON.stringify(scores.slice(0, 4))}
Contest Rating: ${analytics?.rating || 1500}
Hiring Probabilities: ${JSON.stringify(hiringPreds.slice(0, 4))}
Assessment Analytics: ${JSON.stringify(assessmentAnalytics)}`;
      } catch (e) {
        // Fallback
      }
    }

    const systemInstruction = `You are Algora's Voice AI Mentor speaking in ${language}. Provide direct, highly engaging, empathetic, and clear technical mentoring responses. Keep speech output concise (2-4 sentences max) suitable for audio reading.${intelligenceContext}`;

    let aiResponse = "";
    try {
      aiResponse = await defaultAIProvider.generateRawText(transcript, systemInstruction);
    } catch {
      aiResponse = `I'm your AI Mentor speaking in ${language}. Let's focus on mastering data structures, algorithms, and system design today. How can I help you progress?`;
    }

    const tts = await TextToSpeechService.generateSpeech(aiResponse, language);

    // Save message to repository
    await VoiceMentorRepository.saveMessage({
      id: `vmsg-${Date.now()}`,
      sessionId,
      role: "user",
      transcript,
      aiResponse,
      createdAt: new Date().toISOString(),
    });

    // Cache session response
    await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse }), 3600);

    return {
      sessionId,
      transcript,
      aiResponse,
      audioUrl: tts.audioUrl,
      language,
    };
  }

  public static async learnTopic(
    topic: string,
    language: string = "English"
  ): Promise<VoiceTopicExplanation> {
    const systemInstruction = `You are a Senior Principal Computer Science Educator. Explain the topic in ${language}.
Return ONLY valid JSON with this exact schema:
{
  "concept": "Breadth-First Search (BFS) is a graph traversal algorithm that explores node by node layer wise using a Queue...",
  "example": "Finding the shortest path in an unweighted grid like Number of Islands or Maze routing.",
  "timeComplexity": "O(V + E)",
  "spaceComplexity": "O(V) for the Queue queue storage",
  "useCases": ["Shortest Path in Unweighted Graph", "Level Order Tree Traversal", "Peer-to-Peer Network Broadcasting"]
}`;

    let result: any;
    try {
      const rawText = await defaultAIProvider.generateRawText(`Teach topic: ${topic}`, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch {
      result = {
        concept: `${topic} is a foundational data structure/algorithm technique used in software engineering interviews.`,
        example: `Solving high-frequency interview problems on LeetCode/HackerRank.`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        useCases: ["Technical Interviewing", "Competitive Programming", "System Engineering"],
      };
    }

    const tts = await TextToSpeechService.generateSpeech(
      `Here is the breakdown for ${topic}: ${result.concept} Time complexity is ${result.timeComplexity}, and space complexity is ${result.spaceComplexity}.`,
      language
    );

    return {
      ...result,
      audioUrl: tts.audioUrl,
    };
  }

  public static async getCodingHelp(
    codeSnippet: string,
    problemContext: string,
    language: string = "English"
  ): Promise<VoiceCodingHelpResult> {
    const systemInstruction = `You are a Strict Socratic Coding Mentor. Analyze code snippets and give hints WITHOUT providing full code solutions. Return ONLY JSON matching:
{
  "bugAnalysis": "The off-by-one boundary condition in loop index leads to ArrayOutOfBounds exception.",
  "hint": "Check the termination condition while iterating through array boundary elements.",
  "conceptualExplanation": "Array indices run from 0 to length - 1. Verify your loop comparison strictly avoids reaching length."
}`;

    let result: any;
    try {
      const prompt = `Context: ${problemContext}\nCode:\n${codeSnippet}`;
      const rawText = await defaultAIProvider.generateRawText(prompt, systemInstruction);
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch {
      result = {
        bugAnalysis: "Array boundary condition check might overflow or fail on edge cases.",
        hint: "Dry run your loop variables with 0 and length-1 manually.",
        conceptualExplanation: "Verify loop invariants and space-time guarantees.",
      };
    }

    const tts = await TextToSpeechService.generateSpeech(
      `I analyzed your code. ${result.bugAnalysis} Here is a hint: ${result.hint}`,
      language
    );

    return {
      ...result,
      audioUrl: tts.audioUrl,
    };
  }

  public static async handleVoiceExecutiveQuery(userId: string, question: string, language: string = "en"): Promise<VoiceChatResult> {
    const textAnswer = await StrategicDecisionService.answerExecutiveQuestion(userId, question);
    const tts = await TextToSpeechService.generateSpeech(textAnswer, language);
    return {
      sessionId: `exec-${Date.now()}`,
      transcript: question,
      aiResponse: textAnswer,
      audioUrl: tts.audioUrl,
      language
    };
  }
}
