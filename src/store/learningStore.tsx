import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { LearningTrack, Topic, TopicProgress } from '../types/learn';
import { Problem, ProblemAttempt, UserProblemState } from '../types/problem';
import { Project, UserProjectProgress } from '../types/project';
import { Flashcard, RepetitionRating } from '../types/review';
import { CompanyTrack, MockInterviewSession } from '../types/career';
import { Badge, LeaderboardEntry } from '../types/gamification';
import { ChatMessage, MentorMode, SocraticStage } from '../types/mentor';
import {
  INITIAL_USER,
  INITIAL_TRACKS,
  INITIAL_PROBLEMS,
  INITIAL_PROJECTS,
  INITIAL_FLASHCARDS,
  INITIAL_COMPANIES,
  INITIAL_BADGES,
  INITIAL_LEADERBOARD
} from '../data/mockData';
import { calculateNextReview } from '../services/spacedRepetition';

interface LearningStoreContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  tracks: LearningTrack[];
  setTracks: React.Dispatch<React.SetStateAction<LearningTrack[]>>;
  problems: Problem[];
  setProblems: React.Dispatch<React.SetStateAction<Problem[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  companyTracks: CompanyTrack[];
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  
  // Progress states
  userProblemStates: Record<string, UserProblemState>;
  userProjectProgress: Record<string, UserProjectProgress>;
  userTopicProgress: Record<string, TopicProgress>;
  problemAttempts: ProblemAttempt[];
  interviewSessions: MockInterviewSession[];

  // AI Mentor Chat Drawer Global State
  isMentorDrawerOpen: boolean;
  setIsMentorDrawerOpen: (open: boolean) => void;
  mentorMode: MentorMode;
  setMentorMode: (mode: MentorMode) => void;
  mentorMessages: ChatMessage[];
  setMentorMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentSocraticStage: SocraticStage;
  setCurrentSocraticStage: (stage: SocraticStage) => void;
  mentorContext: {
    problemId?: string;
    problemDescription?: string;
    topicId?: string;
    projectId?: string;
    projectTitle?: string;
    projectMilestone?: string;
    code?: string;
    language?: string;
  };
  setMentorContext: React.Dispatch<React.SetStateAction<{
    problemId?: string;
    problemDescription?: string;
    topicId?: string;
    projectId?: string;
    projectTitle?: string;
    projectMilestone?: string;
    code?: string;
    language?: string;
  }>>;

  // Helper actions
  awardXp: (amount: number, reason: string) => void;
  recordProblemAttempt: (attempt: ProblemAttempt) => void;
  saveProblemCode: (problemId: string, language: string, code: string) => void;
  toggleTaskCompletion: (projectId: string, taskId: string) => void;
  updateProjectReflection: (projectId: string, reflection: string, githubUrl?: string) => void;
  reviewFlashcard: (cardId: string, rating: RepetitionRating) => void;
  completeTopicSection: (topicId: string, sectionKey: string) => void;
  addProblem: (problem: Problem) => void;
  updateProblem: (problem: Problem) => void;
  deleteProblem: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addTopic: (trackId: string, topic: Topic) => void;
  
  // Admin & Role
  toggleUserRole: () => void;
  
  // Celebration notification
  lastUnlockedBadge: Badge | null;
  clearLastUnlockedBadge: () => void;
}

const LearningStoreContext = createContext<LearningStoreContextType | null>(null);

const STORAGE_KEY = 'algora_app_state_v1';

export const LearningStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [tracks, setTracks] = useState<LearningTrack[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tracks`);
    return saved ? JSON.parse(saved) : INITIAL_TRACKS;
  });

  const [problems, setProblems] = useState<Problem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_problems`);
    return saved ? JSON.parse(saved) : INITIAL_PROBLEMS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_flashcards`);
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [companyTracks] = useState<CompanyTrack[]>(INITIAL_COMPANIES);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [leaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  const [userProblemStates, setUserProblemStates] = useState<Record<string, UserProblemState>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prob_states`);
    return saved ? JSON.parse(saved) : {
      'prob-two-sum': {
        problemId: 'prob-two-sum',
        status: 'solved',
        savedCode: {
          python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []`
        },
        bestRuntimeMs: 42,
        attemptsCount: 2,
        hintsViewed: 1,
        bookmarked: true
      },
      'prob-valid-anagram': {
        problemId: 'prob-valid-anagram',
        status: 'solved',
        savedCode: {},
        bestRuntimeMs: 38,
        attemptsCount: 1,
        hintsViewed: 0
      },
      'prob-max-water': {
        problemId: 'prob-max-water',
        status: 'attempted',
        savedCode: {},
        attemptsCount: 1,
        hintsViewed: 2
      }
    };
  });

  const [userProjectProgress, setUserProjectProgress] = useState<Record<string, UserProjectProgress>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_proj_prog`);
    return saved ? JSON.parse(saved) : {
      'proj-calc': {
        projectId: 'proj-calc',
        status: 'in_progress',
        completedTaskIds: ['t1-1', 't1-2'],
        reflectionNotes: 'Implementing the Tokenizer class was great. Learned about lookaheads for multi-digit decimal points.',
        githubUrl: 'https://github.com/example/scientific-calc'
      }
    };
  });

  const [userTopicProgress, setUserTopicProgress] = useState<Record<string, TopicProgress>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_topic_prog`);
    return saved ? JSON.parse(saved) : {
      'py-01': {
        topicId: 'py-01',
        status: 'mastered',
        completedSections: ['concept', 'syntax', 'examples', 'mistakes', 'practice', 'assignment', 'interview'],
        lastVisited: new Date().toISOString(),
        masteryScore: 95,
        decayRate: 0.1
      },
      'py-02': {
        topicId: 'py-02',
        status: 'completed',
        completedSections: ['concept', 'syntax', 'examples', 'mistakes'],
        lastVisited: new Date().toISOString(),
        masteryScore: 88,
        decayRate: 0.2
      }
    };
  });

  const [problemAttempts, setProblemAttempts] = useState<ProblemAttempt[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<MockInterviewSession[]>([]);

  // AI Mentor Global State
  const [isMentorDrawerOpen, setIsMentorDrawerOpen] = useState(false);
  const [mentorMode, setMentorMode] = useState<MentorMode>('learn');
  const [currentSocraticStage, setCurrentSocraticStage] = useState<SocraticStage>('hint');
  const [mentorContext, setMentorContext] = useState<{
    problemId?: string;
    topicId?: string;
    projectId?: string;
    code?: string;
    language?: string;
  }>({});
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      content: "👋 Hello! I am your **ALGORA AI Mentor**.\n\nI'm here to guide you through concepts, help you dissect tricky problems with Socratic hints, review your project architectures, and coach you through FAANG-tier mock interviews.\n\nHow can I support your coding journey right now?",
      timestamp: new Date().toISOString(),
      mode: 'learn',
      suggestedFollowUps: ['Explain Two Pointers pattern', 'Help me debug my code', 'Start a mock interview']
    }
  ]);

  const [lastUnlockedBadge, setLastUnlockedBadge] = useState<Badge | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tracks`, JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_problems`, JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_flashcards`, JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prob_states`, JSON.stringify(userProblemStates));
  }, [userProblemStates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_proj_prog`, JSON.stringify(userProjectProgress));
  }, [userProjectProgress]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_topic_prog`, JSON.stringify(userTopicProgress));
  }, [userTopicProgress]);

  const awardXp = (amount: number, reason: string) => {
    setUser((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 800) + 1;
      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  };

  const recordProblemAttempt = (attempt: ProblemAttempt) => {
    setProblemAttempts((prev) => [attempt, ...prev]);

    setUserProblemStates((prev) => {
      const existing = prev[attempt.problemId] || {
        problemId: attempt.problemId,
        status: 'attempted',
        savedCode: {},
        attemptsCount: 0,
        hintsViewed: 0
      };

      const isAccepted = attempt.status === 'Accepted';
      return {
        ...prev,
        [attempt.problemId]: {
          ...existing,
          status: isAccepted ? 'solved' : existing.status === 'solved' ? 'solved' : 'attempted',
          attemptsCount: existing.attemptsCount + 1,
          bestRuntimeMs: isAccepted
            ? Math.min(existing.bestRuntimeMs || 9999, attempt.runtimeMs)
            : existing.bestRuntimeMs,
          lastAttemptDate: attempt.timestamp,
          savedCode: {
            ...existing.savedCode,
            [attempt.language]: attempt.code
          }
        }
      };
    });

    if (attempt.status === 'Accepted') {
      const problem = problems.find((p) => p.id === attempt.problemId);
      awardXp(problem ? problem.xpReward : 50, `Solved ${problem?.title || 'problem'}`);
    }
  };

  const saveProblemCode = (problemId: string, language: string, code: string) => {
    setUserProblemStates((prev) => {
      const existing = prev[problemId] || {
        problemId,
        status: 'unsolved',
        savedCode: {},
        attemptsCount: 0,
        hintsViewed: 0
      };
      return {
        ...prev,
        [problemId]: {
          ...existing,
          savedCode: {
            ...existing.savedCode,
            [language]: code
          }
        }
      };
    });
  };

  const toggleTaskCompletion = (projectId: string, taskId: string) => {
    setUserProjectProgress((prev) => {
      const existing = prev[projectId] || {
        projectId,
        status: 'in_progress',
        completedTaskIds: [],
        reflectionNotes: ''
      };

      const isCompleted = existing.completedTaskIds.includes(taskId);
      const updatedTaskIds = isCompleted
        ? existing.completedTaskIds.filter((id) => id !== taskId)
        : [...existing.completedTaskIds, taskId];

      return {
        ...prev,
        [projectId]: {
          ...existing,
          completedTaskIds: updatedTaskIds,
          status: updatedTaskIds.length > 0 ? 'in_progress' : 'not_started'
        }
      };
    });
    awardXp(25, 'Completed project task');
  };

  const updateProjectReflection = (projectId: string, reflection: string, githubUrl?: string) => {
    setUserProjectProgress((prev) => {
      const existing = prev[projectId] || {
        projectId,
        status: 'in_progress',
        completedTaskIds: [],
        reflectionNotes: ''
      };
      return {
        ...prev,
        [projectId]: {
          ...existing,
          reflectionNotes: reflection,
          githubUrl: githubUrl !== undefined ? githubUrl : existing.githubUrl
        }
      };
    });
  };

  const reviewFlashcard = (cardId: string, rating: RepetitionRating) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const result = calculateNextReview(card, rating);
        return {
          ...card,
          intervalDays: result.intervalDays,
          repetitionCount: result.repetitionCount,
          easeFactor: result.easeFactor,
          dueDate: result.dueDate,
          decayScore: result.decayScore,
          lastReviewedDate: new Date().toISOString()
        };
      })
    );
    awardXp(15, 'Daily review flashcard completed');
  };

  const completeTopicSection = (topicId: string, sectionKey: string) => {
    setUserTopicProgress((prev) => {
      const existing = prev[topicId] || {
        topicId,
        status: 'in_progress',
        completedSections: [],
        lastVisited: new Date().toISOString(),
        masteryScore: 0,
        decayRate: 0.1
      };

      if (!existing.completedSections.includes(sectionKey)) {
        const updatedSections = [...existing.completedSections, sectionKey];
        const masteryScore = Math.min(100, Math.round((updatedSections.length / 7) * 100));
        return {
          ...prev,
          [topicId]: {
            ...existing,
            completedSections: updatedSections,
            masteryScore,
            status: masteryScore >= 80 ? 'mastered' : 'in_progress',
            lastVisited: new Date().toISOString()
          }
        };
      }
      return prev;
    });
    awardXp(20, `Completed section ${sectionKey}`);
  };

  const addProblem = (problem: Problem) => {
    setProblems((prev) => [problem, ...prev]);
  };

  const updateProblem = (problem: Problem) => {
    setProblems((prev) => prev.map((p) => (p.id === problem.id ? problem : p)));
  };

  const deleteProblem = (id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  const addProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const updateProject = (project: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addTopic = (trackId: string, topic: Topic) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            topics: [...t.topics, topic],
            totalTopics: t.totalTopics + 1
          };
        }
        return t;
      })
    );
  };

  const toggleUserRole = () => {
    setUser((prev) => ({
      ...prev,
      role: prev.role === 'student' ? 'admin' : 'student'
    }));
  };

  const clearLastUnlockedBadge = () => setLastUnlockedBadge(null);

  return (
    <LearningStoreContext.Provider
      value={{
        user,
        setUser,
        tracks,
        setTracks,
        problems,
        setProblems,
        projects,
        setProjects,
        flashcards,
        setFlashcards,
        companyTracks,
        badges,
        leaderboard,
        userProblemStates,
        userProjectProgress,
        userTopicProgress,
        problemAttempts,
        interviewSessions,
        isMentorDrawerOpen,
        setIsMentorDrawerOpen,
        mentorMode,
        setMentorMode,
        mentorMessages,
        setMentorMessages,
        currentSocraticStage,
        setCurrentSocraticStage,
        mentorContext,
        setMentorContext,
        awardXp,
        recordProblemAttempt,
        saveProblemCode,
        toggleTaskCompletion,
        updateProjectReflection,
        reviewFlashcard,
        completeTopicSection,
        addProblem,
        updateProblem,
        deleteProblem,
        addProject,
        updateProject,
        deleteProject,
        addTopic,
        toggleUserRole,
        lastUnlockedBadge,
        clearLastUnlockedBadge
      }}
    >
      {children}
    </LearningStoreContext.Provider>
  );
};

export const useLearningStore = () => {
  const context = useContext(LearningStoreContext);
  if (!context) {
    throw new Error('useLearningStore must be used within a LearningStoreProvider');
  }
  return context;
};
