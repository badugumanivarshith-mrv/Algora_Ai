import { Database } from "../db/connection";

export interface ContestTeamEntity {
  id: string;
  contestId: string;
  teamName: string;
  teamCode: string;
  captainId: string;
  captainUsername: string;
  memberCount: number;
  maxMembers: number;
  totalScore: number;
  totalPenaltySeconds: number;
  rank?: number;
  createdAt: string;
}

export interface ContestTeamMemberEntity {
  id: string;
  teamId: string;
  contestId: string;
  userId: string;
  username: string;
  role: "captain" | "member";
  individualScore: number;
  penaltySeconds: number;
  status: "accepted" | "invited";
  joinedAt: string;
}

const memoryTeams = new Map<string, ContestTeamEntity>();
const memoryTeamMembers = new Map<string, ContestTeamMemberEntity[]>();

// Seed default contest teams
const initialTeams: ContestTeamEntity[] = [
  {
    id: "team-1",
    contestId: "contest-1",
    teamName: "ByteForce Alpha",
    teamCode: "BYTEA",
    captainId: "u-1",
    captainUsername: "Arjun Sharma",
    memberCount: 3,
    maxMembers: 3,
    totalScore: 1800,
    totalPenaltySeconds: 4200,
    rank: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "team-2",
    contestId: "contest-1",
    teamName: "NullPointer Prodigies",
    teamCode: "NULLP",
    captainId: "u-2",
    captainUsername: "Priya Patel",
    memberCount: 3,
    maxMembers: 3,
    totalScore: 1650,
    totalPenaltySeconds: 5100,
    rank: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "team-3",
    contestId: "contest-1",
    teamName: "Quantum Bitwise",
    teamCode: "QBIT",
    captainId: "u-3",
    captainUsername: "Rohan Verma",
    memberCount: 2,
    maxMembers: 3,
    totalScore: 1200,
    totalPenaltySeconds: 3800,
    rank: 3,
    createdAt: new Date().toISOString(),
  },
];

initialTeams.forEach((t) => {
  memoryTeams.set(t.id, t);
  memoryTeamMembers.set(t.id, [
    {
      id: `tm-${t.id}-1`,
      teamId: t.id,
      contestId: t.contestId,
      userId: t.captainId,
      username: t.captainUsername,
      role: "captain",
      individualScore: Math.floor(t.totalScore * 0.6),
      penaltySeconds: Math.floor(t.totalPenaltySeconds * 0.5),
      status: "accepted",
      joinedAt: t.createdAt,
    },
    {
      id: `tm-${t.id}-2`,
      teamId: t.id,
      contestId: t.contestId,
      userId: "u-4",
      username: "Ananya Iyer",
      role: "member",
      individualScore: Math.floor(t.totalScore * 0.4),
      penaltySeconds: Math.floor(t.totalPenaltySeconds * 0.5),
      status: "accepted",
      joinedAt: t.createdAt,
    },
  ]);
});

export class ContestTeamRepository {
  public static async createTeam(data: {
    contestId: string;
    teamName: string;
    captainId: string;
    captainUsername: string;
    maxMembers?: number;
  }): Promise<ContestTeamEntity> {
    const id = `team-${Date.now()}`;
    const teamCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const now = new Date().toISOString();

    const team: ContestTeamEntity = {
      id,
      contestId: data.contestId,
      teamName: data.teamName,
      teamCode,
      captainId: data.captainId,
      captainUsername: data.captainUsername,
      memberCount: 1,
      maxMembers: data.maxMembers || 3,
      totalScore: 0,
      totalPenaltySeconds: 0,
      rank: undefined,
      createdAt: now,
    };

    memoryTeams.set(id, team);
    memoryTeamMembers.set(id, [
      {
        id: `tm-${id}-1`,
        teamId: id,
        contestId: data.contestId,
        userId: data.captainId,
        username: data.captainUsername,
        role: "captain",
        individualScore: 0,
        penaltySeconds: 0,
        status: "accepted",
        joinedAt: now,
      },
    ]);

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO contest_teams (id, contest_id, team_name, team_code, captain_id, captain_username, member_count, max_members, total_score, total_penalty_seconds, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 1, $7, 0, 0, $8)`,
        [team.id, team.contestId, team.teamName, team.teamCode, team.captainId, team.captainUsername, team.maxMembers, now]
      );
      await Database.query(
        `INSERT INTO contest_team_members (id, team_id, contest_id, user_id, username, role, individual_score, penalty_seconds, status, joined_at)
         VALUES ($1, $2, $3, $4, $5, 'captain', 0, 0, 'accepted', $6)`,
        [`tm-${id}-1`, id, data.contestId, data.captainId, data.captainUsername, now]
      );
    }
    return team;
  }

  public static async joinTeamByCode(contestId: string, teamCode: string, user: { id: string; username: string }): Promise<ContestTeamEntity | null> {
    const team = Array.from(memoryTeams.values()).find((t) => t.contestId === contestId && t.teamCode.toUpperCase() === teamCode.toUpperCase());
    if (!team) return null;

    const members = memoryTeamMembers.get(team.id) || [];
    if (members.some((m) => m.userId === user.id)) return team; // already in
    if (members.length >= team.maxMembers) return null; // full

    const now = new Date().toISOString();
    const newMember: ContestTeamMemberEntity = {
      id: `tm-${team.id}-${Date.now()}`,
      teamId: team.id,
      contestId,
      userId: user.id,
      username: user.username,
      role: "member",
      individualScore: 0,
      penaltySeconds: 0,
      status: "accepted",
      joinedAt: now,
    };

    members.push(newMember);
    memoryTeamMembers.set(team.id, members);
    team.memberCount = members.length;

    const pool = Database.getPool();
    if (pool) {
      await Database.query(
        `INSERT INTO contest_team_members (id, team_id, contest_id, user_id, username, role, individual_score, penalty_seconds, status, joined_at)
         VALUES ($1, $2, $3, $4, $5, 'member', 0, 0, 'accepted', $6)
         ON CONFLICT (contest_id, user_id) DO NOTHING`,
        [newMember.id, team.id, contestId, user.id, user.username, now]
      );
      await Database.query("UPDATE contest_teams SET member_count = member_count + 1 WHERE id = $1", [team.id]);
    }
    return team;
  }

  public static async getContestTeams(contestId: string): Promise<ContestTeamEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<any>("SELECT * FROM contest_teams WHERE contest_id = $1 ORDER BY total_score DESC, total_penalty_seconds ASC", [contestId]);
      return res.rows.map((r, idx) => ({
        id: r.id,
        contestId: r.contest_id,
        teamName: r.team_name,
        teamCode: r.team_code,
        captainId: r.captain_id,
        captainUsername: r.captain_username,
        memberCount: Number(r.member_count),
        maxMembers: Number(r.max_members),
        totalScore: Number(r.total_score),
        totalPenaltySeconds: Number(r.total_penalty_seconds),
        rank: idx + 1,
        createdAt: r.created_at,
      }));
    }

    const arr = Array.from(memoryTeams.values()).filter((t) => t.contestId === contestId);
    arr.sort((a, b) => b.totalScore - a.totalScore || a.totalPenaltySeconds - b.totalPenaltySeconds);
    arr.forEach((t, i) => (t.rank = i + 1));
    return arr;
  }

  public static async getTeamMembers(teamId: string): Promise<ContestTeamMemberEntity[]> {
    const pool = Database.getPool();
    if (pool) {
      const res = await Database.query<any>("SELECT * FROM contest_team_members WHERE team_id = $1 ORDER BY individual_score DESC", [teamId]);
      return res.rows.map((r) => ({
        id: r.id,
        teamId: r.team_id,
        contestId: r.contest_id,
        userId: r.user_id,
        username: r.username,
        role: r.role,
        individualScore: Number(r.individual_score),
        penaltySeconds: Number(r.penalty_seconds),
        status: r.status,
        joinedAt: r.joined_at,
      }));
    }
    return memoryTeamMembers.get(teamId) || [];
  }
}
