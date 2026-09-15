import axios from 'axios';

const API_BASE = '/api/research';

export interface ResearchProject {
  id: string;
  title: string;
  abstract: string;
  domain: string;
  status: string;
  visibility: string;
  created_at: string;
}

export const researchApi = {
  // Research
  getProjects: async () => {
    const { data } = await axios.get(`${API_BASE}/projects`);
    return data.data;
  },
  createProject: async (project: Partial<ResearchProject>) => {
    const { data } = await axios.post(`${API_BASE}/projects`, project);
    return data.data;
  },
  getProject: async (id: string) => {
    const { data } = await axios.get(`${API_BASE}/projects/${id}`);
    return data.data;
  },
  savePaper: async (paper: any) => {
    const { data } = await axios.post(`${API_BASE}/papers`, paper);
    return data.data;
  },
  createLiteratureReview: async (topic: string, papers: string[]) => {
    const { data } = await axios.post(`${API_BASE}/literature-review`, { topic, papers });
    return data.data;
  },
  getAnalytics: async () => {
    const { data } = await axios.get(`${API_BASE}/analytics`);
    return data.data;
  },

  // Open Source
  createOSSProject: async (project: any) => {
    const { data } = await axios.post(`${API_BASE}/opensource/project`, project);
    return data.data;
  },
  saveOSSContribution: async (contribution: any) => {
    const { data } = await axios.post(`${API_BASE}/opensource/contribution`, contribution);
    return data.data;
  },

  // Innovation
  evaluateIdea: async (idea: any) => {
    const { data } = await axios.post(`${API_BASE}/innovation/evaluate`, idea);
    return data.data;
  },
  createMvpRoadmap: async (idea: string) => {
    const { data } = await axios.post(`${API_BASE}/mvp`, { idea });
    return data.data;
  }
};
