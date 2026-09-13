import { problemCmsRepository } from "./problemCmsRepository";
import { topicCmsRepository } from "./topicCmsRepository";
import { ContestRepository } from "./contestRepository";
import { DiscussionRepository } from "./discussionRepository";
import { MentorshipRepository } from "./mentorshipRepository";
import { StudyGroupRepository } from "./studyGroupRepository";
import { institutionRepo } from "./institutionRepository";

export interface SearchResultItem {
  id: string;
  category: "problem" | "topic" | "discussion" | "contest" | "mentor" | "group" | "classroom";
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
  score: number;
}

export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  resultsByCategory: {
    problems: SearchResultItem[];
    topics: SearchResultItem[];
    discussions: SearchResultItem[];
    contests: SearchResultItem[];
    mentors: SearchResultItem[];
    groups: SearchResultItem[];
    classrooms: SearchResultItem[];
  };
  topResults: SearchResultItem[];
}

class SearchRepository {
  async search(query: string, categoryFilter?: string): Promise<GlobalSearchResponse> {
    const q = (query || "").trim().toLowerCase();

    const problems: SearchResultItem[] = [];
    const topics: SearchResultItem[] = [];
    const discussions: SearchResultItem[] = [];
    const contests: SearchResultItem[] = [];
    const mentors: SearchResultItem[] = [];
    const groups: SearchResultItem[] = [];
    const classrooms: SearchResultItem[] = [];

    if (!q) {
      return {
        query: "",
        totalResults: 0,
        resultsByCategory: { problems: [], topics: [], discussions: [], contests: [], mentors: [], groups: [], classrooms: [] },
        topResults: [],
      };
    }

    // 1. Problems
    try {
      const allProblems = await problemCmsRepository.getAll({ search: q });
      for (const p of allProblems) {
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchTag = p.tags?.some((t: string) => t.toLowerCase().includes(q));
        const matchTopic = p.topic?.toLowerCase().includes(q);
        if (matchTitle || matchTag || matchTopic) {
          problems.push({
            id: String(p.id),
            category: "problem",
            title: p.title,
            subtitle: `${p.difficulty} · ${p.topic || "Algorithms"} · Acceptance: ${p.acceptance || "68%"}`,
            badge: p.difficulty,
            url: `/workspace?problem=${p.slug || p.id}`,
            score: matchTitle ? 10 : 5,
          });
        }
      }
    } catch {
      // fallback
    }

    // 2. Topics / Curriculum
    try {
      const allTopics = await topicCmsRepository.getAll();
      for (const t of allTopics) {
        if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
          topics.push({
            id: t.id,
            category: "topic",
            title: t.title,
            subtitle: `${t.problemCount || 12} Challenges · ${(t as any).difficulty || "All Levels"}`,
            badge: "Curriculum",
            url: `/learning?topic=${t.slug || t.id}`,
            score: 8,
          });
        }
      }
    } catch {
      // fallback
    }

    // 3. Discussions
    try {
      const { items: allDiscussions } = await DiscussionRepository.list({ search: q, limit: 20 });
      for (const d of allDiscussions) {
        if (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || d.tags?.some((t) => t.toLowerCase().includes(q))) {
          discussions.push({
            id: d.id,
            category: "discussion",
            title: d.title,
            subtitle: `By ${d.authorName} · ${d.category} · ${d.upvotes} Upvotes · ${d.replyCount} Replies`,
            badge: d.category,
            url: `/community?thread=${d.id}`,
            score: 7,
          });
        }
      }
    } catch {
      // fallback
    }

    // 4. Contests
    try {
      const allContests = await ContestRepository.findAll();
      for (const c of allContests) {
        if (c.title.toLowerCase().includes(q) || c.contestType?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)) {
          contests.push({
            id: c.id,
            category: "contest",
            title: c.title,
            subtitle: `${c.contestType} · ${c.durationMinutes} mins · ${c.participantCount || 0} Registered`,
            badge: c.status?.toUpperCase() || "CONTEST",
            url: `/contests?id=${c.id}`,
            score: 8,
          });
        }
      }
    } catch {
      // fallback
    }

    // 5. Mentors
    try {
      const allMentors = await MentorshipRepository.listMentors(undefined, q);
      for (const m of allMentors) {
        if (m.name.toLowerCase().includes(q) || m.company.toLowerCase().includes(q) || m.specialties?.some((e) => e.toLowerCase().includes(q))) {
          mentors.push({
            id: m.id,
            category: "mentor",
            title: `${m.name} (${m.company})`,
            subtitle: `${m.headline} · ${m.yearsExperience} yrs exp · ${m.specialties?.slice(0, 3).join(", ") || ""}`,
            badge: `⭐ ${m.rating}`,
            url: `/community?tab=mentorship&mentor=${m.id}`,
            score: 7,
          });
        }
      }
    } catch {
      // fallback
    }

    // 6. Study Groups
    try {
      const allGroups = await StudyGroupRepository.list(q);
      for (const g of allGroups) {
        if (g.name.toLowerCase().includes(q) || g.targetTopic?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) {
          groups.push({
            id: g.id,
            category: "group",
            title: g.name,
            subtitle: `${g.targetTopic} · ${g.memberCount}/${g.maxMembers} Members · ${g.isPrivate ? "Private" : "Public"}`,
            badge: "Study Group",
            url: `/community?tab=groups&group=${g.id}`,
            score: 6,
          });
        }
      }
    } catch {
      // fallback
    }

    // 7. Classrooms
    try {
      const allClassrooms = institutionRepo.listClassrooms();
      for (const cls of allClassrooms) {
        if (cls.name.toLowerCase().includes(q) || cls.code.toLowerCase().includes(q) || cls.facultyName?.toLowerCase().includes(q)) {
          classrooms.push({
            id: cls.id,
            category: "classroom",
            title: `${cls.code}: ${cls.name}`,
            subtitle: `${cls.facultyName} · ${cls.department} · ${cls.studentCount} Students · Code: ${cls.joinCode}`,
            badge: "Classroom",
            url: `/faculty?classroom=${cls.id}`,
            score: 9,
          });
        }
      }
    } catch {
      // fallback
    }

    const allMatched = [
      ...problems,
      ...topics,
      ...discussions,
      ...contests,
      ...mentors,
      ...groups,
      ...classrooms,
    ].sort((a, b) => b.score - a.score);

    return {
      query,
      totalResults: allMatched.length,
      resultsByCategory: {
        problems,
        topics,
        discussions,
        contests,
        mentors,
        groups,
        classrooms,
      },
      topResults: allMatched.slice(0, 15),
    };
  }
}

export const searchRepo = new SearchRepository();
