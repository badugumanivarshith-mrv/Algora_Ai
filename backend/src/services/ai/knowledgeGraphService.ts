import {
  LearningIntelligenceRepository,
  KnowledgeNodeEntity,
  KnowledgeEdgeEntity,
} from "../../repositories/learningIntelligenceRepository";
import { RedisManager } from "../../redis/redisClient";
import { logger } from "../../utils/logger";

export class KnowledgeGraphService {
  public static async getGraph(userId: string): Promise<{
    nodes: KnowledgeNodeEntity[];
    edges: KnowledgeEdgeEntity[];
  }> {
    const redisKey = `knowledge:graph:${userId}`;
    const cached = await RedisManager.get(redisKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to DB
      }
    }

    let nodes = await LearningIntelligenceRepository.getKnowledgeNodes();
    let edges = await LearningIntelligenceRepository.getKnowledgeEdges();

    if (nodes.length === 0) {
      nodes = await this.seedDefaultGraphNodes();
      edges = await this.seedDefaultGraphEdges();
    }

    const graph = { nodes, edges };
    await RedisManager.set(redisKey, JSON.stringify(graph), 3600);
    return graph;
  }

  public static async getSemesterCurriculumMapping(userId: string, semester: number = 5): Promise<any> {
    const graph = await this.getGraph(userId);
    return {
      userId,
      semester,
      subjectMastery: [
        { subject: "Advanced Data Structures & Algorithms", code: "CS-401", masteryScore: 92, status: "Mastered" },
        { subject: "Deep Neural Networks & LLMs", code: "AI-502", masteryScore: 88, status: "Proficient" },
        { subject: "Distributed Database Systems", code: "CS-405", masteryScore: 76, status: "Developing" },
      ],
      curriculumReadinessScore: 88.5,
      nodesCount: graph.nodes.length,
      edgesCount: graph.edges.length,
    };
  }

  private static async seedDefaultGraphNodes(): Promise<KnowledgeNodeEntity[]> {
    const defaultNodes = [
      { id: "kn_arr", topic: "Arrays", subtopic: "Basics & Traversals", category: "Data Structures", difficulty_level: "Easy", description: "Array fundamentals, iteration, and memory layout." },
      { id: "kn_sw", topic: "Arrays", subtopic: "Sliding Window", category: "Algorithms", difficulty_level: "Medium", description: "Fixed and variable size sliding window technique.", prerequisites: ["Arrays"] },
      { id: "kn_ps", topic: "Arrays", subtopic: "Prefix Sum", category: "Algorithms", difficulty_level: "Easy", description: "Cumulative sum arrays for range query optimization.", prerequisites: ["Arrays"] },
      { id: "kn_tp", topic: "Arrays", subtopic: "Two Pointers", category: "Algorithms", difficulty_level: "Medium", description: "Two-pointer technique for sorted search and partitioning.", prerequisites: ["Arrays"] },

      { id: "kn_tree", topic: "Trees", subtopic: "Binary Tree Basics", category: "Data Structures", difficulty_level: "Easy", description: "Tree traversals (Inorder, Preorder, Postorder, BFS)." },
      { id: "kn_bst", topic: "Trees", subtopic: "Binary Search Tree", category: "Data Structures", difficulty_level: "Medium", description: "BST insertion, deletion, and validation.", prerequisites: ["Binary Tree Basics"] },
      { id: "kn_avl", topic: "Trees", subtopic: "AVL Tree", category: "Advanced Data Structures", difficulty_level: "Hard", description: "Self-balancing binary search trees and rotations.", prerequisites: ["Binary Search Tree"] },
      { id: "kn_seg", topic: "Trees", subtopic: "Segment Tree", category: "Advanced Data Structures", difficulty_level: "Hard", description: "Range update and query segment tree.", prerequisites: ["Binary Tree Basics", "Prefix Sum"] },

      { id: "kn_graph", topic: "Graphs", subtopic: "Graph Representations", category: "Data Structures", difficulty_level: "Medium", description: "Adjacency matrix and adjacency list structures." },
      { id: "kn_bfs", topic: "Graphs", subtopic: "BFS Traversal", category: "Algorithms", difficulty_level: "Medium", description: "Breadth-first search for shortest path in unweighted graphs.", prerequisites: ["Graph Representations"] },
      { id: "kn_dfs", topic: "Graphs", subtopic: "DFS Traversal", category: "Algorithms", difficulty_level: "Medium", description: "Depth-first search and topological sorting.", prerequisites: ["Graph Representations"] },
      { id: "kn_dijk", topic: "Graphs", subtopic: "Dijkstra Algorithm", category: "Algorithms", difficulty_level: "Hard", description: "Single-source shortest path algorithm using Priority Queue.", prerequisites: ["BFS Traversal"] },
      { id: "kn_mst", topic: "Graphs", subtopic: "Minimum Spanning Tree", category: "Algorithms", difficulty_level: "Hard", description: "Kruskal's & Prim's MST algorithms.", prerequisites: ["DFS Traversal"] },
    ];

    const seeded: KnowledgeNodeEntity[] = [];
    for (const n of defaultNodes) {
      const saved = await LearningIntelligenceRepository.upsertKnowledgeNode(n);
      seeded.push(saved);
    }
    return seeded;
  }

  private static async seedDefaultGraphEdges(): Promise<KnowledgeEdgeEntity[]> {
    const defaultEdges = [
      { id: "ke_1", source_node_id: "kn_arr", target_node_id: "kn_sw", relationship_type: "prerequisite", weight: 1.0 },
      { id: "ke_2", source_node_id: "kn_arr", target_node_id: "kn_ps", relationship_type: "prerequisite", weight: 1.0 },
      { id: "ke_3", source_node_id: "kn_arr", target_node_id: "kn_tp", relationship_type: "prerequisite", weight: 1.0 },
      { id: "ke_4", source_node_id: "kn_tree", target_node_id: "kn_bst", relationship_type: "prerequisite", weight: 1.0 },
      { id: "ke_5", source_node_id: "kn_bst", target_node_id: "kn_avl", relationship_type: "prerequisite", weight: 1.5 },
      { id: "ke_6", source_node_id: "kn_tree", target_node_id: "kn_seg", relationship_type: "prerequisite", weight: 1.5 },
      { id: "ke_7", source_node_id: "kn_graph", target_node_id: "kn_bfs", relationship_type: "prerequisite", weight: 1.0 },
      { id: "ke_8", source_node_id: "kn_graph", target_node_id: "kn_dfs", relationship_type: "prerequisite", weight: 1.0 },
      { id: "ke_9", source_node_id: "kn_bfs", target_node_id: "kn_dijk", relationship_type: "prerequisite", weight: 1.5 },
      { id: "ke_10", source_node_id: "kn_dfs", target_node_id: "kn_mst", relationship_type: "prerequisite", weight: 1.5 },
    ];

    const seeded: KnowledgeEdgeEntity[] = [];
    for (const e of defaultEdges) {
      const saved = await LearningIntelligenceRepository.upsertKnowledgeEdge(e);
      seeded.push(saved);
    }
    return seeded;
  }
}
