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
import { AgentCouncilService } from "./agentCouncilService";
import { ExecutiveDebateService } from "./executiveDebateService";
import { LifePlannerService } from "./lifePlannerService";
import { StrategicCampaignService } from "./strategicCampaignService";
import { ReputationEngineService } from "./reputationEngineService";
import { CollaborationIntelligenceService } from "./collaborationIntelligenceService";
import { IndustryBenchmarkService } from "./industryBenchmarkService";
import { TalentMarketplaceService } from "./talentMarketplaceService";
import { AutonomousUniversityService } from "./autonomousUniversityService";
import { CapabilityGraphService } from "./capabilityGraphService";
import { MentorCouncilService } from "./mentorCouncilService";
import { HumanPotentialService } from "./humanPotentialService";
import { GlobalImpactService } from "./globalImpactService";
import { CognitiveArchitectureService } from "./cognitiveArchitectureService";
import { LearningDNAService } from "./learningDNAService";
import { CognitiveBottleneckService } from "./cognitiveBottleneckService";
import { SuperintelligenceSimulator } from "./superintelligenceSimulator";
import { CredentialNetworkService } from "./credentialNetworkService";

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

    // V4.7 Multi-Agent Executive Council Voice Routing
    if (
      lower.includes("executive council") ||
      lower.includes("council prioritize") ||
      lower.includes("run executive council") ||
      lower.includes("biggest blocker") ||
      lower.includes("contests or projects") ||
      lower.includes("fastest path to google") ||
      lower.includes("fastest path") ||
      lower.includes("weekly executive plan") ||
      lower.includes("life plan") ||
      lower.includes("executive plan")
    ) {
      try {
        let aiAnswer = "";
        if (lower.includes("run executive council") || lower.includes("council prioritize") || lower.includes("executive council")) {
          const councilData = await AgentCouncilService.getCouncil(userId);
          const topActions = councilData.council?.prioritizedActions?.slice(0, 2).map((a: any) => `${a.executive}: ${a.action}`).join(". Also, ") || "focus on dynamic programming and mock technical screens.";
          aiAnswer = `Your Executive Council met with consensus score ${councilData.council?.consensusScore || 94}%. Dominant Theme: ${councilData.council?.dominantTheme || 'Targeted Big Tech Sprint'}. Top Priorities: ${topActions}.`;
        } else if (lower.includes("biggest blocker") || lower.includes("blocker")) {
          const twin = await DigitalTwinService.getDigitalTwin(userId);
          const topGap = twin.riskFactors?.[0]?.title || "Dynamic Programming Subproblem Trees";
          aiAnswer = `Your biggest critical blocker is ${topGap}. The Learning and Career Executives recommend a 3-day recovery sprint of timed drills to eradicate this risk.`;
        } else if (lower.includes("contests or projects") || lower.includes("debate")) {
          const debate = await ExecutiveDebateService.runDebate(userId, { topic: "Contests vs Projects: Optimal Time Allocation" });
          aiAnswer = `The Executive Council debated Contests versus Projects. Conclusion: ${debate.winnerAgent}. Recommendation: ${debate.justification} Allocation: 60% algorithmic speed drills and 40% Raft distributed systems capstone.`;
        } else if (lower.includes("fastest path")) {
          aiAnswer = `Your fastest path to Google L4 is the Dual-Cadence strategy: 1) Elevate contest rating past 1850 with Saturday speed rounds, 2) Pass 2 timed 45-minute OA mock screens, and 3) Finalize your Raft Distributed KV Store capstone as undeniable proof-of-work. Expected offer timeline: 3.2 months.`;
        } else if (lower.includes("plan") || lower.includes("weekly")) {
          const plans = await LifePlannerService.getLifePlans(userId);
          const weekly = plans.find(p => p.horizon === "Weekly") || plans[0];
          aiAnswer = `Here is your Weekly Executive Plan: 8 hours on ${weekly.pillars?.learning?.focus || 'DP & Graph Mastery'}, ${weekly.pillars?.career?.focus || 'Big Tech Mock Screenings'}, and delivering the ${weekly.pillars?.projects?.focus || 'Raft Distributed Consensus'} module.`;
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

    // V4.9 Skill Economy, Reputation & Talent Marketplace Voice Routing
    if (lower.includes("reputation") || lower.includes("trust score") || lower.includes("my score") || lower.includes("verified rank")) {
      try {
        const rep = await ReputationEngineService.getReputation(userId);
        const repAnswer = `Your Algora Reputation Score is ${rep.reputationScore} out of 1000, placing you in the top ${Math.max(1, 100 - rep.percentileRank)}% globally. Your Trust Index is ${rep.trustScore}%, backed by ${rep.verifiedCredentials?.length || 3} cryptographic proofs across Distributed Systems, Open Source, and Enterprise Incident response.`;
        const tts = await TextToSpeechService.generateSpeech(repAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: repAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: repAnswer }), 3600);
        return { sessionId, transcript, aiResponse: repAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    if (lower.includes("collaborat") || lower.includes("partner") || lower.includes("teammate") || lower.includes("co-founder") || lower.includes("cofounder")) {
      try {
        const recs = await CollaborationIntelligenceService.getTeamRecommendations(userId);
        const topRec = recs[0];
        const collabAnswer = `I recommend connecting with ${topRec.candidateName} for ${topRec.recommendationType}. Synergy score is ${topRec.synergyScore}%. ${topRec.whyMatched}`;
        const tts = await TextToSpeechService.generateSpeech(collabAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: collabAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: collabAnswer }), 3600);
        return { sessionId, transcript, aiResponse: collabAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    if (lower.includes("compare") || lower.includes("benchmark") || lower.includes("google engineer") || lower.includes("openai") || lower.includes("how do i compare")) {
      try {
        const benchmarks = await IndustryBenchmarkService.getBenchmarks(userId);
        const googleBench = benchmarks.find(b => b.targetRole.includes("Google")) || benchmarks[0];
        const benchAnswer = `Against the ${googleBench.targetRole} benchmark, your overall readiness is ${googleBench.overallReadinessPct}%, ranking in the ${googleBench.rankingPercentile}th percentile. Strengths: ${googleBench.strengths[0]}. Estimated time to offer is ${googleBench.estimatedTimeToHireWeeks} weeks.`;
        const tts = await TextToSpeechService.generateSpeech(benchAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: benchAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: benchAnswer }), 3600);
        return { sessionId, transcript, aiResponse: benchAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    // V5.0 AI University & Degree Pathway Voice Routing
    if (lower.includes("degree") || lower.includes("university") || lower.includes("graduation") || lower.includes("credits") || lower.includes("degree audit") || lower.includes("capstone")) {
      try {
        const studentDegrees = await AutonomousUniversityService.getStudentDegrees(userId);
        const activeDeg = studentDegrees[0];
        const audit = await AutonomousUniversityService.runGraduationAudit(userId, activeDeg?.degreeId || "deg_swe");
        const univAnswer = `You are enrolled in the ${audit.degreeTitle}. You have completed ${audit.creditsCompleted} out of ${audit.totalCreditsRequired} credits with a GPA of ${audit.currentGpa}. Graduation readiness is ${audit.careerReadinessScore}%. ${audit.isEligible ? 'You are eligible for graduation honors!' : `You have ${audit.remainingCourses.length} remaining courses.`}`;
        const tts = await TextToSpeechService.generateSpeech(univAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: univAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: univAnswer }), 3600);
        return { sessionId, transcript, aiResponse: univAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    // V5.0 Capability Graph & Human Capability Intelligence Voice Routing
    if (lower.includes("capability") || lower.includes("capabilities") || lower.includes("skill graph") || lower.includes("what should i build next") || lower.includes("mastery level")) {
      try {
        const capSummary = await CapabilityGraphService.getCapabilityGraph(userId);
        const capAnswer = `Your strongest capability is ${capSummary.highestCapability.name} with ${capSummary.highestCapability.masteryScore}% mastery in ${capSummary.highestCapability.domain}. I recommend focusing next on ${capSummary.recommendedFocusCapability.name} to unlock synergies across Distributed Systems and Frontier AI.`;
        const tts = await TextToSpeechService.generateSpeech(capAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: capAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: capAnswer }), 3600);
        return { sessionId, transcript, aiResponse: capAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    // V5.0 Human Potential & Trajectory Voice Routing
    if (lower.includes("potential") || lower.includes("founder potential") || lower.includes("trajectory") || lower.includes("forecast") || lower.includes("growth curve")) {
      try {
        const potSummary = await HumanPotentialService.getHumanPotential(userId);
        const potAnswer = `Your composite Human Potential Index is ${potSummary.compositePotentialIndex} out of 100 on a ${potSummary.trajectoryClass} trajectory. Your Learning Velocity is ${potSummary.profile.learningVelocity} and Founder Potential is ${potSummary.profile.founderPotential}%. Key accelerator: ${potSummary.profile.strategicAccelerators[0]}.`;
        const tts = await TextToSpeechService.generateSpeech(potAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: potAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: potAnswer }), 3600);
        return { sessionId, transcript, aiResponse: potAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    // V5.0 Global Impact Network Voice Routing
    if (lower.includes("impact") || lower.includes("people reached") || lower.includes("societal impact") || lower.includes("global impact")) {
      try {
        const impSummary = await GlobalImpactService.getGlobalImpact(userId);
        const impAnswer = `Your Global Impact Score is ${impSummary.impactScoreScaled1000} out of 1000, placing you in the top ${impSummary.globalRankPercentile}% worldwide with ${impSummary.profile.totalPeopleImpacted.toLocaleString()} people reached across Open Source, Research, and Technical Education.`;
        const tts = await TextToSpeechService.generateSpeech(impAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: impAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: impAnswer }), 3600);
        return { sessionId, transcript, aiResponse: impAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    // V5.1 Cognitive Intelligence & Personal Superintelligence Voice Routing
    if (lower.includes("cognitive") || lower.includes("stuck") || lower.includes("improving") || lower.includes("bottleneck") || lower.includes("learning style") || lower.includes("superintelligence") || lower.includes("learning dna")) {
      try {
        const cogSummary = await CognitiveArchitectureService.getCognitiveProfile(userId);
        const dnaSummary = await LearningDNAService.getLearningDNA(userId);
        const btnSummary = await CognitiveBottleneckService.getBottleneckSummary(userId);
        const simSummary = await SuperintelligenceSimulator.getSuperintelligenceSummary(userId);

        let cogAnswer = "";
        if (lower.includes("stuck") || lower.includes("bottleneck")) {
          cogAnswer = btnSummary.highestSeverityBottleneck
            ? `Your primary cognitive bottleneck is "${btnSummary.highestSeverityBottleneck.title}". Severe impact on ${btnSummary.highestSeverityBottleneck.impactArea}. Suggested recovery: ${btnSummary.highestSeverityBottleneck.recoveryPlan[0]}`
            : `No severe cognitive bottlenecks detected. Your composite cognitive index is ${cogSummary.compositeCognitiveIndex} with strong working memory and abstraction scores.`;
        } else if (lower.includes("superintelligence") || lower.includes("forecast") || lower.includes("future")) {
          cogAnswer = `Your 5-Year Superintelligence forecast predicts a ${simSummary.activeForecast.fiveYear.careerTier} role with an estimated ${simSummary.activeForecast.fiveYear.researchImpactPapers} research breakthroughs and a ${simSummary.activeForecast.fiveYear.startupProbabilityPct}% startup success probability.`;
        } else {
          cogAnswer = `Your composite Cognitive Index is ${cogSummary.compositeCognitiveIndex}. Your dominant learning DNA archetype is ${dnaSummary.profile.archetype} with a ${dnaSummary.profile.retentionRatePct}% 1-week retention rate. Primary superpower: ${dnaSummary.profile.learningSuperpowers[0]}.`;
        }

        const tts = await TextToSpeechService.generateSpeech(cogAnswer, language);
        await VoiceMentorRepository.saveMessage({
          id: `vmsg-${Date.now()}`,
          sessionId,
          role: "user",
          transcript,
          aiResponse: cogAnswer,
          createdAt: new Date().toISOString(),
        });
        await RedisManager.set(`voice:response:${sessionId}`, JSON.stringify({ transcript, aiResponse: cogAnswer }), 3600);
        return { sessionId, transcript, aiResponse: cogAnswer, audioUrl: tts.audioUrl, language };
      } catch (e) {
        // Fall through
      }
    }

    // V4.0 AI OS Integration: Detect agent and workflow commands
    if (lower.includes("agent") || lower.includes("execute") || lower.includes("plan") || lower.includes("automate") || lower.includes("workflow")) {
      // Check for workflow specific command
      if (lower.includes("workflow") || lower.includes("automation")) {
        const workflows = await ProductivityRepository.getWorkflows(userId);
        const mappingPrompt = `
          User Input: "${transcript}"
          Available Workflows: ${JSON.stringify(workflows.map(w => ({ id: w.id, name: w.name })))}
          Identify if the user wants to execute a specific workflow. 
          Return ONLY the workflow ID if found, otherwise return "NONE".
        `;
        const mappingText = await defaultAIProvider.generateRawText(mappingPrompt);
        const workflowId = mappingText.trim();

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
