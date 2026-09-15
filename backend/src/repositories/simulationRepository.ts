import { Database } from "../db/connection";
import { logger } from "../utils/logger";

export interface SimulationCompanyEntity {
  id: string;
  companyName: string;
  slug: string;
  tier: string;
  domain: string;
  engineeringCulture: string;
  teamStructure: any[];
  levels: any[];
  techStack: any[];
  interviewBar: Record<string, any>;
  metadata: Record<string, any>;
  createdAt?: string;
}

export interface SimulationSessionRecord {
  id: string;
  userId: string;
  companyId: string;
  simulationType: string;
  role: string;
  teamName: string;
  currentSprint: number;
  status: string;
  startDate: string;
  endDate?: string;
  progressMetrics: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationEventRecord {
  id: string;
  sessionId: string;
  eventType: string;
  title: string;
  description: string;
  severity: string;
  impactScope: string;
  payload: Record<string, any>;
  status: string;
  createdAt?: string;
}

export interface SimulationDecisionRecord {
  id: string;
  sessionId: string;
  eventId?: string;
  userId: string;
  decisionType: string;
  decisionText: string;
  reasoning?: string;
  tradeoffs?: string;
  evaluationScore: number;
  feedback?: string;
  timestamp?: string;
}

export interface SimulationFeedbackRecord {
  id: string;
  sessionId: string;
  reviewerRole: string;
  reviewerName: string;
  feedbackType: string;
  comments: string;
  rating: number;
  strengths: string[];
  weaknesses: string[];
  actionableItems: string[];
  createdAt?: string;
}

export interface SimulationScoreRecord {
  id: string;
  sessionId: string;
  userId: string;
  overallScore: number;
  engineeringScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  incidentManagementScore: number;
  architectureScore: number;
  breakdown: Record<string, any>;
  computedAt?: string;
}

export interface IncidentScenarioRecord {
  id: string;
  title: string;
  scenarioType: string;
  severity: string;
  companySlug: string;
  architectureDiagram?: string;
  initialLogs: string;
  rootCause: string;
  mitigationSteps: any[];
  expectedSlaMinutes: number;
  createdAt?: string;
}

export interface DesignReviewRecord {
  id: string;
  sessionId: string;
  title: string;
  problemStatement: string;
  constraints: string[];
  proposedArchitecture: string;
  tradeOffs: string[];
  scalingLimits: Record<string, any>;
  costEstimate: Record<string, any>;
  reviewerEvaluations: any[];
  status: string;
  createdAt?: string;
}

export interface StartupSimulationRecord {
  id: string;
  userId: string;
  startupName: string;
  marketVertical: string;
  stage: string;
  capitalRaised: number;
  runwayMonths: number;
  burnRate: number;
  mrr: number;
  productStatus: string;
  investorFeedback: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResearchSimulationRecord {
  id: string;
  userId: string;
  labName: string;
  researchTopic: string;
  currentPhase: string;
  conferenceTarget: string;
  draftPaperUrl?: string;
  peerReviews: any[];
  grantStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerSandboxRecord {
  id: string;
  userId: string;
  pathSlug: string;
  pathTitle: string;
  targetCompany: string;
  startingLevel: string;
  currentLevel: string;
  targetLevel: string;
  projectedTimelineMonths: number;
  projectedSalaryTrajectory: any[];
  milestoneProgress: any[];
  risks: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulationAchievementRecord {
  id: string;
  userId: string;
  achievementType: string;
  title: string;
  description: string;
  badgeIcon: string;
  xpAwarded: number;
  metadata: Record<string, any>;
  unlockedAt?: string;
}

// In-Memory Fallback stores
const inMemoryCompanies: Map<string, SimulationCompanyEntity> = new Map();
const inMemorySessions: Map<string, SimulationSessionRecord> = new Map();
const inMemoryEvents: Map<string, SimulationEventRecord> = new Map();
const inMemoryDecisions: Map<string, SimulationDecisionRecord> = new Map();
const inMemoryFeedback: Map<string, SimulationFeedbackRecord> = new Map();
const inMemoryScores: Map<string, SimulationScoreRecord> = new Map();
const inMemoryIncidents: Map<string, IncidentScenarioRecord> = new Map();
const inMemoryDesignReviews: Map<string, DesignReviewRecord> = new Map();
const inMemoryStartups: Map<string, StartupSimulationRecord> = new Map();
const inMemoryResearch: Map<string, ResearchSimulationRecord> = new Map();
const inMemorySandboxes: Map<string, CareerSandboxRecord> = new Map();
const inMemoryAchievements: Map<string, SimulationAchievementRecord> = new Map();

export class SimulationRepository {
  // --- Companies ---
  public static async upsertCompany(company: SimulationCompanyEntity): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemoryCompanies.set(company.id, company);
      return;
    }
    const query = `
      INSERT INTO simulation_companies (
        id, company_name, slug, tier, domain, engineering_culture, 
        team_structure, levels, tech_stack, interview_bar, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        slug = EXCLUDED.slug,
        tier = EXCLUDED.tier,
        domain = EXCLUDED.domain,
        engineering_culture = EXCLUDED.engineering_culture,
        team_structure = EXCLUDED.team_structure,
        levels = EXCLUDED.levels,
        tech_stack = EXCLUDED.tech_stack,
        interview_bar = EXCLUDED.interview_bar,
        metadata = EXCLUDED.metadata;
    `;
    await pool.query(query, [
      company.id,
      company.companyName,
      company.slug,
      company.tier,
      company.domain,
      company.engineeringCulture,
      JSON.stringify(company.teamStructure || []),
      JSON.stringify(company.levels || []),
      JSON.stringify(company.techStack || []),
      JSON.stringify(company.interviewBar || {}),
      JSON.stringify(company.metadata || {})
    ]);
  }

  public static async getCompanies(): Promise<SimulationCompanyEntity[]> {
    const pool = Database.getPool();
    if (!pool) {
      return Array.from(inMemoryCompanies.values());
    }
    const { rows } = await pool.query(`SELECT * FROM simulation_companies ORDER BY company_name ASC;`);
    return rows.map((r: any) => ({
      id: r.id,
      companyName: r.company_name,
      slug: r.slug,
      tier: r.tier,
      domain: r.domain,
      engineeringCulture: r.engineering_culture,
      teamStructure: r.team_structure,
      levels: r.levels,
      techStack: r.tech_stack,
      interviewBar: r.interview_bar,
      metadata: r.metadata,
      createdAt: r.created_at
    }));
  }

  public static async getCompanyBySlug(slug: string): Promise<SimulationCompanyEntity | null> {
    const pool = Database.getPool();
    if (!pool) {
      for (const comp of inMemoryCompanies.values()) {
        if (comp.slug === slug) return comp;
      }
      return null;
    }
    const { rows } = await pool.query(`SELECT * FROM simulation_companies WHERE slug = $1 LIMIT 1;`, [slug]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      companyName: r.company_name,
      slug: r.slug,
      tier: r.tier,
      domain: r.domain,
      engineeringCulture: r.engineering_culture,
      teamStructure: r.team_structure,
      levels: r.levels,
      techStack: r.tech_stack,
      interviewBar: r.interview_bar,
      metadata: r.metadata,
      createdAt: r.created_at
    };
  }

  // --- Sessions ---
  public static async createSession(session: SimulationSessionRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemorySessions.set(session.id, session);
      return;
    }
    const query = `
      INSERT INTO simulation_sessions (
        id, user_id, company_id, simulation_type, role, team_name,
        current_sprint, status, start_date, end_date, progress_metrics, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        team_name = EXCLUDED.team_name,
        current_sprint = EXCLUDED.current_sprint,
        status = EXCLUDED.status,
        progress_metrics = EXCLUDED.progress_metrics,
        updated_at = NOW();
    `;
    await pool.query(query, [
      session.id,
      session.userId,
      session.companyId,
      session.simulationType,
      session.role,
      session.teamName,
      session.currentSprint,
      session.status,
      session.startDate,
      session.endDate || null,
      JSON.stringify(session.progressMetrics || {})
    ]);
  }

  public static async getActiveSession(userId: string): Promise<SimulationSessionRecord | null> {
    const pool = Database.getPool();
    if (!pool) {
      for (const sess of inMemorySessions.values()) {
        if (sess.userId === userId && sess.status === 'Active') return sess;
      }
      return null;
    }
    const { rows } = await pool.query(
      `SELECT * FROM simulation_sessions WHERE user_id = $1 AND status = 'Active' ORDER BY created_at DESC LIMIT 1;`,
      [userId]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      companyId: r.company_id,
      simulationType: r.simulation_type,
      role: r.role,
      teamName: r.team_name,
      currentSprint: r.current_sprint,
      status: r.status,
      startDate: r.start_date,
      endDate: r.end_date,
      progressMetrics: r.progress_metrics,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  public static async getUserSessions(userId: string): Promise<SimulationSessionRecord[]> {
    const pool = Database.getPool();
    if (!pool) {
      return Array.from(inMemorySessions.values()).filter(s => s.userId === userId);
    }
    const { rows } = await pool.query(
      `SELECT * FROM simulation_sessions WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      companyId: r.company_id,
      simulationType: r.simulation_type,
      role: r.role,
      teamName: r.team_name,
      currentSprint: r.current_sprint,
      status: r.status,
      startDate: r.start_date,
      endDate: r.end_date,
      progressMetrics: r.progress_metrics,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  // --- Events ---
  public static async createEvent(event: SimulationEventRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemoryEvents.set(event.id, event);
      return;
    }
    const query = `
      INSERT INTO simulation_events (
        id, session_id, event_type, title, description, severity, impact_scope, payload, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());
    `;
    await pool.query(query, [
      event.id,
      event.sessionId,
      event.eventType,
      event.title,
      event.description,
      event.severity,
      event.impactScope,
      JSON.stringify(event.payload || {}),
      event.status
    ]);
  }

  public static async getSessionEvents(sessionId: string): Promise<SimulationEventRecord[]> {
    const pool = Database.getPool();
    if (!pool) {
      return Array.from(inMemoryEvents.values()).filter(e => e.sessionId === sessionId);
    }
    const { rows } = await pool.query(
      `SELECT * FROM simulation_events WHERE session_id = $1 ORDER BY created_at DESC;`,
      [sessionId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      eventType: r.event_type,
      title: r.title,
      description: r.description,
      severity: r.severity,
      impactScope: r.impact_scope,
      payload: r.payload,
      status: r.status,
      createdAt: r.created_at
    }));
  }

  // --- Decisions ---
  public static async recordDecision(dec: SimulationDecisionRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemoryDecisions.set(dec.id, dec);
      return;
    }
    const query = `
      INSERT INTO simulation_decisions (
        id, session_id, event_id, user_id, decision_type, decision_text, reasoning, tradeoffs, evaluation_score, feedback, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW());
    `;
    await pool.query(query, [
      dec.id,
      dec.sessionId,
      dec.eventId || null,
      dec.userId,
      dec.decisionType,
      dec.decisionText,
      dec.reasoning || "",
      dec.tradeoffs || "",
      dec.evaluationScore,
      dec.feedback || ""
    ]);
  }

  public static async getUserDecisions(userId: string): Promise<SimulationDecisionRecord[]> {
    const pool = Database.getPool();
    if (!pool) {
      return Array.from(inMemoryDecisions.values()).filter(d => d.userId === userId);
    }
    const { rows } = await pool.query(
      `SELECT * FROM simulation_decisions WHERE user_id = $1 ORDER BY timestamp DESC;`,
      [userId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      eventId: r.event_id,
      userId: r.user_id,
      decisionType: r.decision_type,
      decisionText: r.decision_text,
      reasoning: r.reasoning,
      tradeoffs: r.tradeoffs,
      evaluationScore: Number(r.evaluation_score),
      feedback: r.feedback,
      timestamp: r.timestamp
    }));
  }

  // --- Feedback ---
  public static async addFeedback(fb: SimulationFeedbackRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemoryFeedback.set(fb.id, fb);
      return;
    }
    const query = `
      INSERT INTO simulation_feedback (
        id, session_id, reviewer_role, reviewer_name, feedback_type, comments, rating, strengths, weaknesses, actionable_items, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW());
    `;
    await pool.query(query, [
      fb.id,
      fb.sessionId,
      fb.reviewerRole,
      fb.reviewerName,
      fb.feedbackType,
      fb.comments,
      fb.rating,
      JSON.stringify(fb.strengths || []),
      JSON.stringify(fb.weaknesses || []),
      JSON.stringify(fb.actionableItems || [])
    ]);
  }

  public static async getSessionFeedback(sessionId: string): Promise<SimulationFeedbackRecord[]> {
    const pool = Database.getPool();
    if (!pool) {
      return Array.from(inMemoryFeedback.values()).filter(f => f.sessionId === sessionId);
    }
    const { rows } = await pool.query(
      `SELECT * FROM simulation_feedback WHERE session_id = $1 ORDER BY created_at DESC;`,
      [sessionId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      reviewerRole: r.reviewer_role,
      reviewerName: r.reviewer_name,
      feedbackType: r.feedback_type,
      comments: r.comments,
      rating: Number(r.rating),
      strengths: r.strengths,
      weaknesses: r.weaknesses,
      actionableItems: r.actionable_items,
      createdAt: r.created_at
    }));
  }

  // --- Scores ---
  public static async saveScore(sc: SimulationScoreRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemoryScores.set(sc.id, sc);
      return;
    }
    const query = `
      INSERT INTO simulation_scores (
        id, session_id, user_id, overall_score, engineering_score, communication_score,
        problem_solving_score, incident_management_score, architecture_score, breakdown, computed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        engineering_score = EXCLUDED.engineering_score,
        communication_score = EXCLUDED.communication_score,
        problem_solving_score = EXCLUDED.problem_solving_score,
        incident_management_score = EXCLUDED.incident_management_score,
        architecture_score = EXCLUDED.architecture_score,
        breakdown = EXCLUDED.breakdown,
        computed_at = NOW();
    `;
    await pool.query(query, [
      sc.id,
      sc.sessionId,
      sc.userId,
      sc.overallScore,
      sc.engineeringScore,
      sc.communicationScore,
      sc.problemSolvingScore,
      sc.incidentManagementScore,
      sc.architectureScore,
      JSON.stringify(sc.breakdown || {})
    ]);
  }

  public static async getLatestScore(userId: string): Promise<SimulationScoreRecord | null> {
    const pool = Database.getPool();
    if (!pool) {
      const userScores = Array.from(inMemoryScores.values()).filter(s => s.userId === userId);
      return userScores.length > 0 ? userScores[userScores.length - 1] : null;
    }
    const { rows } = await pool.query(
      `SELECT * FROM simulation_scores WHERE user_id = $1 ORDER BY computed_at DESC LIMIT 1;`,
      [userId]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      sessionId: r.session_id,
      userId: r.user_id,
      overallScore: Number(r.overall_score),
      engineeringScore: Number(r.engineering_score),
      communicationScore: Number(r.communication_score),
      problemSolvingScore: Number(r.problem_solving_score),
      incidentManagementScore: Number(r.incident_management_score),
      architectureScore: Number(r.architecture_score),
      breakdown: r.breakdown,
      computedAt: r.computed_at
    };
  }

  // --- Startup Simulations ---
  public static async saveStartup(st: StartupSimulationRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemoryStartups.set(st.id, st);
      return;
    }
    const query = `
      INSERT INTO startup_simulations (
        id, user_id, startup_name, market_vertical, stage, capital_raised, runway_months, burn_rate, mrr, product_status, investor_feedback, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        stage = EXCLUDED.stage,
        capital_raised = EXCLUDED.capital_raised,
        runway_months = EXCLUDED.runway_months,
        burn_rate = EXCLUDED.burn_rate,
        mrr = EXCLUDED.mrr,
        product_status = EXCLUDED.product_status,
        investor_feedback = EXCLUDED.investor_feedback,
        updated_at = NOW();
    `;
    await pool.query(query, [
      st.id,
      st.userId,
      st.startupName,
      st.marketVertical,
      st.stage,
      st.capitalRaised,
      st.runwayMonths,
      st.burnRate,
      st.mrr,
      st.productStatus,
      JSON.stringify(st.investorFeedback || [])
    ]);
  }

  public static async getStartupByUserId(userId: string): Promise<StartupSimulationRecord | null> {
    const pool = Database.getPool();
    if (!pool) {
      for (const st of inMemoryStartups.values()) {
        if (st.userId === userId) return st;
      }
      return null;
    }
    const { rows } = await pool.query(
      `SELECT * FROM startup_simulations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1;`,
      [userId]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      startupName: r.startup_name,
      marketVertical: r.market_vertical,
      stage: r.stage,
      capitalRaised: Number(r.capital_raised),
      runwayMonths: r.runway_months,
      burnRate: Number(r.burn_rate),
      mrr: Number(r.mrr),
      productStatus: r.product_status,
      investorFeedback: r.investor_feedback,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  // --- Research Simulations ---
  public static async saveResearch(rs: ResearchSimulationRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemoryResearch.set(rs.id, rs);
      return;
    }
    const query = `
      INSERT INTO research_simulations (
        id, user_id, lab_name, research_topic, current_phase, conference_target, draft_paper_url, peer_reviews, grant_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        current_phase = EXCLUDED.current_phase,
        conference_target = EXCLUDED.conference_target,
        draft_paper_url = EXCLUDED.draft_paper_url,
        peer_reviews = EXCLUDED.peer_reviews,
        grant_status = EXCLUDED.grant_status,
        updated_at = NOW();
    `;
    await pool.query(query, [
      rs.id,
      rs.userId,
      rs.labName,
      rs.researchTopic,
      rs.currentPhase,
      rs.conferenceTarget,
      rs.draftPaperUrl || null,
      JSON.stringify(rs.peerReviews || []),
      rs.grantStatus
    ]);
  }

  public static async getResearchByUserId(userId: string): Promise<ResearchSimulationRecord | null> {
    const pool = Database.getPool();
    if (!pool) {
      for (const rs of inMemoryResearch.values()) {
        if (rs.userId === userId) return rs;
      }
      return null;
    }
    const { rows } = await pool.query(
      `SELECT * FROM research_simulations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1;`,
      [userId]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      labName: r.lab_name,
      researchTopic: r.research_topic,
      currentPhase: r.current_phase,
      conferenceTarget: r.conference_target,
      draftPaperUrl: r.draft_paper_url,
      peerReviews: r.peer_reviews,
      grantStatus: r.grant_status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  // --- Career Sandboxes ---
  public static async saveSandbox(sb: CareerSandboxRecord): Promise<void> {
    const pool = Database.getPool();
    if (!pool) {
      inMemorySandboxes.set(sb.id, sb);
      return;
    }
    const query = `
      INSERT INTO career_sandboxes (
        id, user_id, path_slug, path_title, target_company, starting_level, current_level,
        target_level, projected_timeline_months, projected_salary_trajectory, milestone_progress, risks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        current_level = EXCLUDED.current_level,
        projected_timeline_months = EXCLUDED.projected_timeline_months,
        projected_salary_trajectory = EXCLUDED.projected_salary_trajectory,
        milestone_progress = EXCLUDED.milestone_progress,
        risks = EXCLUDED.risks,
        updated_at = NOW();
    `;
    await pool.query(query, [
      sb.id,
      sb.userId,
      sb.pathSlug,
      sb.pathTitle,
      sb.targetCompany,
      sb.startingLevel,
      sb.currentLevel,
      sb.targetLevel,
      sb.projectedTimelineMonths,
      JSON.stringify(sb.projectedSalaryTrajectory || []),
      JSON.stringify(sb.milestoneProgress || []),
      JSON.stringify(sb.risks || [])
    ]);
  }

  public static async getSandboxesByUserId(userId: string): Promise<CareerSandboxRecord[]> {
    const pool = Database.getPool();
    if (!pool) {
      return Array.from(inMemorySandboxes.values()).filter(s => s.userId === userId);
    }
    const { rows } = await pool.query(
      `SELECT * FROM career_sandboxes WHERE user_id = $1 ORDER BY updated_at DESC;`,
      [userId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      pathSlug: r.path_slug,
      pathTitle: r.path_title,
      targetCompany: r.target_company,
      startingLevel: r.starting_level,
      currentLevel: r.current_level,
      targetLevel: r.target_level,
      projectedTimelineMonths: r.projected_timeline_months,
      projectedSalaryTrajectory: r.projected_salary_trajectory,
      milestoneProgress: r.milestone_progress,
      risks: r.risks,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }
}
