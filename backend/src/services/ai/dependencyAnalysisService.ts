import {
  LearningIntelligenceRepository,
  TopicDependencyEntity,
} from "../../repositories/learningIntelligenceRepository";

export class DependencyAnalysisService {
  public static async getDependencies(): Promise<TopicDependencyEntity[]> {
    let deps = await LearningIntelligenceRepository.getTopicDependencies();
    if (deps.length === 0) {
      deps = await this.seedDefaultDependencies();
    }
    return deps;
  }

  public static async analyzeBlockers(userId: string): Promise<{
    blockerTopics: string[];
    prerequisiteChain: { topic: string; prerequisites: string[] }[];
  }> {
    const deps = await this.getDependencies();
    const masteryScores = await LearningIntelligenceRepository.getMasteryScores(userId);

    const weakTopics = masteryScores.filter((m) => Number(m.mastery_rating) < 60).map((m) => m.subtopic || m.topic);

    const blockerTopics = Array.from(new Set(deps.filter((d) => weakTopics.includes(d.topic)).map((d) => d.parent_topic)));

    const chainMap: Record<string, string[]> = {};
    for (const d of deps) {
      if (!chainMap[d.topic]) chainMap[d.topic] = [];
      chainMap[d.topic].push(d.parent_topic);
    }

    const prerequisiteChain = Object.entries(chainMap).map(([topic, prerequisites]) => ({
      topic,
      prerequisites,
    }));

    return {
      blockerTopics: blockerTopics.length > 0 ? blockerTopics : ["Priority Queue / Min-Heap", "Recursion & Backtracking"],
      prerequisiteChain,
    };
  }

  private static async seedDefaultDependencies(): Promise<TopicDependencyEntity[]> {
    const defaultDeps = [
      { id: "td_1", topic: "Sliding Window", parentTopic: "Arrays", dependencyType: "hard_prerequisite", importanceRating: 5.0 },
      { id: "td_2", topic: "Prefix Sum", parentTopic: "Arrays", dependencyType: "hard_prerequisite", importanceRating: 4.5 },
      { id: "td_3", topic: "Binary Search Tree", parentTopic: "Binary Tree Basics", dependencyType: "hard_prerequisite", importanceRating: 5.0 },
      { id: "td_4", topic: "AVL Tree", parentTopic: "Binary Search Tree", dependencyType: "hard_prerequisite", importanceRating: 4.0 },
      { id: "td_5", topic: "Segment Tree", parentTopic: "Binary Tree Basics", dependencyType: "hard_prerequisite", importanceRating: 4.5 },
      { id: "td_6", topic: "BFS Traversal", parentTopic: "Graph Representations", dependencyType: "hard_prerequisite", importanceRating: 5.0 },
      { id: "td_7", topic: "Dijkstra Algorithm", parentTopic: "BFS Traversal", dependencyType: "hard_prerequisite", importanceRating: 5.0 },
      { id: "td_8", topic: "Dijkstra Algorithm", parentTopic: "Priority Queue", dependencyType: "hard_prerequisite", importanceRating: 5.0 },
      { id: "td_9", topic: "Minimum Spanning Tree", parentTopic: "DFS Traversal", dependencyType: "hard_prerequisite", importanceRating: 4.5 },
    ];

    const seeded: TopicDependencyEntity[] = [];
    for (const d of defaultDeps) {
      const saved = await LearningIntelligenceRepository.upsertDependency(d);
      seeded.push(saved);
    }
    return seeded;
  }
}
