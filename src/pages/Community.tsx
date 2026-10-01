/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Real-Time Collaboration & Community Dashboard Page
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Users, MessageSquare, Award, Trophy, Send, Plus, Search,
  Code, Clock, Sparkles, ThumbsUp, CheckCircle2, ChevronRight, Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import confetti from "canvas-confetti";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  createdBy: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  message: string;
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  referenceId?: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  upvotes: number;
  createdAt: string;
  comments?: ForumComment[];
}

interface ForumComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  createdAt: string;
}

interface SolutionReview {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
}

export default function Community() {
  const { user, isGuest } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Active Tab: 'groups', 'forum', 'peer-review', 'reputation'
  const [activeTab, setActiveTab] = useState<"groups" | "forum" | "peer-review" | "reputation">("groups");

  // State Variables
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [chatMessages, setChats] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [newCommentText, setNewCommentText] = useState("");

  const [reviews, setReviews] = useState<SolutionReview[]>([]);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewDesc, setNewReviewDesc] = useState("");
  const [newReviewCode, setNewReviewCode] = useState("");
  const [newReviewLang, setNewReviewLang] = useState("python");
  const [newReviewProb, setNewReviewProb] = useState("two-sum");

  const [presenceCount, setPresenceCount] = useState(37);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupCat, setNewGroupCat] = useState("Algorithms");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Initial Core Community Data
  useEffect(() => {
    fetchStudyGroups();
    fetchForumPosts();
    fetchSolutionReviews();
    fetchPresence();

    const interval = setInterval(fetchPresence, 10000);
    return () => clearInterval(interval);
  }, []);

  // Establish SSE Event Stream Listener for Live Sync
  useEffect(() => {
    if (!user) return;

    const sse = new EventSource(`/api/realtime/stream?userId=${user.id}`);

    sse.addEventListener("group:chat", (e: any) => {
      try {
        const { groupId, chatMsg } = JSON.parse(e.data);
        if (selectedGroup && selectedGroup.id === groupId) {
          setChats((prev) => [...prev, chatMsg]);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      } catch (err) {
        console.error("SSE parse error on group chat:", err);
      }
    });

    sse.addEventListener("forum:post", (e: any) => {
      try {
        const { post } = JSON.parse(e.data);
        setForumPosts((prev) => [post, ...prev]);
      } catch (err) {
        console.error("SSE parse error on forum post:", err);
      }
    });

    sse.addEventListener("review:comment", (e: any) => {
      try {
        // Trigger celebratory active review notification confetti
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.8 } });
      } catch (err) {
        console.error("SSE review comment error:", err);
      }
    });

    return () => {
      sse.close();
    };
  }, [user, selectedGroup]);

  // Scroll to bottom of chat helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // API Fetches
  const fetchPresence = async () => {
    try {
      const res = await fetch("/api/community/presence");
      const data = await res.json();
      if (data.presenceCount) setPresenceCount(data.presenceCount);
    } catch {}
  };

  const fetchStudyGroups = async () => {
    try {
      const res = await fetch("/api/community/groups");
      const data = await res.json();
      setStudyGroups(data);
    } catch {}
  };

  const fetchForumPosts = async () => {
    try {
      const res = await fetch("/api/community/forum");
      const data = await res.json();
      setForumPosts(data);
    } catch {}
  };

  const fetchSolutionReviews = async () => {
    try {
      const res = await fetch("/api/community/reviews");
      const data = await res.json();
      setReviews(data);
    } catch {}
  };

  // Actions
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newGroupName || !newGroupDesc) return;

    try {
      const res = await fetch("/api/community/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc, category: newGroupCat })
      });
      if (res.ok) {
        setNewGroupName("");
        setNewGroupDesc("");
        setShowCreateGroup(false);
        fetchStudyGroups();
        confetti({ particleCount: 50 });
      }
    } catch {}
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch(`/api/community/groups/${groupId}/join`, { method: "POST" });
      if (res.ok) {
        const group = studyGroups.find((g) => g.id === groupId);
        if (group) {
          setSelectedGroup(group);
          // Load chats
          const chatsRes = await fetch(`/api/community/groups/${groupId}/chats`);
          const chatsData = await chatsRes.json();
          setChats(chatsData);
        }
      }
    } catch {}
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newMsg || !selectedGroup) return;

    try {
      const res = await fetch(`/api/community/groups/${selectedGroup.id}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMsg })
      });
      if (res.ok) {
        setNewMsg("");
      }
    } catch {}
  };

  const handleSelectPost = async (post: ForumPost) => {
    try {
      const res = await fetch(`/api/community/forum/${post.id}`);
      const data = await res.json();
      setSelectedPost(data);
    } catch {}
  };

  const handleCreateForumPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newPostTitle || !newPostContent) return;

    try {
      const res = await fetch("/api/community/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newPostTitle, content: newPostContent, category: newPostCategory })
      });
      if (res.ok) {
        setNewPostTitle("");
        setNewPostContent("");
        fetchForumPosts();
        confetti({ particleCount: 40 });
      }
    } catch {}
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newCommentText || !selectedPost) return;

    try {
      const res = await fetch(`/api/community/forum/${selectedPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentText })
      });
      if (res.ok) {
        setNewCommentText("");
        handleSelectPost(selectedPost);
      }
    } catch {}
  };

  const handleCreateSolutionReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newReviewTitle || !newReviewDesc || !newReviewCode) return;

    try {
      const res = await fetch("/api/community/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: newReviewProb,
          code: newReviewCode,
          language: newReviewLang,
          title: newReviewTitle,
          description: newReviewDesc
        })
      });
      if (res.ok) {
        setNewReviewTitle("");
        setNewReviewDesc("");
        setNewReviewCode("");
        fetchSolutionReviews();
        confetti({ particleCount: 40 });
      }
    } catch {}
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Real-time Workspace & Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Algora Peer Learning Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build study groups, ask questions in problem discussions, and request socratic code reviews.
          </p>
        </div>

        {/* Live Presence indicator */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold self-start md:self-auto">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>{presenceCount} Peers Online in Shared Rooms</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px overflow-x-auto">
        {[
          { id: "groups", label: "👥 Study Groups", icon: Users },
          { id: "forum", label: "💬 Discussion Forum", icon: MessageSquare },
          { id: "peer-review", label: "🔬 Peer Solution Reviews", icon: Code },
          { id: "reputation", label: "🏆 Reputation & Badges", icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs sm:text-sm transition shrink-0 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}

      {/* 1. STUDY GROUPS */}
      {activeTab === "groups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Active Rooms</h2>
              <button
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Group</span>
              </button>
            </div>

            {showCreateGroup && (
              <form onSubmit={handleCreateGroup} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Sliding Window Invariants"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Describe study targets..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none h-16"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newGroupCat}
                    onChange={(e) => setNewGroupCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Algorithms">Algorithms & DSA</option>
                    <option value="System Design">System Design (LLD/HLD)</option>
                    <option value="Placement Tracks">FAANG Prep Tracks</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition">
                  Establish Room
                </button>
              </form>
            )}

            <div className="space-y-3">
              {studyGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleJoinGroup(group.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    selectedGroup?.id === group.id
                      ? "bg-indigo-500/10 border-indigo-500"
                      : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-200 text-sm">{group.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[9px] uppercase font-bold shrink-0">
                        {group.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{group.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span>Active Study Session</span>
                    <span className="text-indigo-400 font-semibold flex items-center gap-1">
                      <span>Enter Chat</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedGroup ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{selectedGroup.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Study Room Live Chat Stream</p>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                      <span>No messages in this study group yet. Say hello!</span>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-300 text-xs uppercase shrink-0">
                          {msg.userName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-xs text-slate-200">{msg.userName}</span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 bg-slate-950/60 border border-slate-900/80 px-3 py-2 rounded-xl rounded-tl-none inline-block max-w-md">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Sender form */}
                <form onSubmit={handleSendChat} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Collaborate, ask approach hints..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                    required
                  />
                  <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl h-[520px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Users className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
                <h3 className="text-white font-bold text-sm">No Active Study Room Selected</h3>
                <p className="text-xs mt-1 max-w-sm">Select any study group room from the sidebar panel to enter the live chat discussion stream.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DISCUSSION FORUM */}
      {activeTab === "forum" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-white">Share a Post</h2>
            <form onSubmit={handleCreateForumPost} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Post Title</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g. Sliding window counts overflow"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Describe your question or discovery..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none h-24"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic Category</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="general">General Chat</option>
                  <option value="topic">Topic Concepts</option>
                  <option value="problem">DSA Problems</option>
                  <option value="project">Real-world Projects</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition">
                Post Discussion (+10 Rep)
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white">Discussions Feed</h2>
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className={`p-5 bg-slate-900 border rounded-xl transition cursor-pointer ${
                    selectedPost?.id === post.id ? "border-indigo-500" : "border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[9px] uppercase font-bold">
                        {post.category}
                      </span>
                      <h3 className="font-extrabold text-slate-200 text-sm mt-1">{post.title}</h3>
                    </div>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition text-[10px] font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{post.upvotes}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-3">{post.content}</p>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span className="font-bold text-slate-400">{post.userName}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Render comments if expanded */}
                  {selectedPost?.id === post.id && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4" onClick={(e) => e.stopPropagation()}>
                      <h4 className="font-bold text-xs text-white">Comments</h4>
                      <div className="space-y-3">
                        {selectedPost.comments?.map((comment) => (
                          <div key={comment.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-900">
                            <p className="text-xs text-slate-300">{comment.content}</p>
                            <span className="block text-[9px] text-slate-500 mt-1">{comment.userName} • {new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleCreateComment} className="flex gap-2">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Contribute to discussion..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                          required
                        />
                        <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition">
                          Comment
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. PEER SOLUTION REVIEW */}
      {activeTab === "peer-review" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-white">Request Code Review</h2>
            <form onSubmit={handleCreateSolutionReview} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Problem ID</label>
                <select
                  value={newReviewProb}
                  onChange={(e) => setNewReviewProb(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="two-sum">Two Sum</option>
                  <option value="valid-parentheses">Valid Parentheses</option>
                  <option value="best-time-to-buy-and-sell-stock">Best Time to Buy and Sell Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Code Language</label>
                <select
                  value={newReviewLang}
                  onChange={(e) => setNewReviewLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Request Title</label>
                <input
                  type="text"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Subarray Sum Equals K O(N) HashMap bug"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Approach Description</label>
                <textarea
                  value={newReviewDesc}
                  onChange={(e) => setNewReviewDesc(e.target.value)}
                  placeholder="Explain your approach, bottlenecks..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none h-20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Source Code</label>
                <textarea
                  value={newReviewCode}
                  onChange={(e) => setNewReviewCode(e.target.value)}
                  placeholder="Paste your code..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono h-32"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition">
                Publish Code Review Request
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white">Review Requests</h2>
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded text-[9px] font-bold uppercase">
                        {rev.language}
                      </span>
                      <h3 className="font-extrabold text-white text-sm mt-1">{rev.title}</h3>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{rev.description}</p>

                  <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs border border-slate-900 overflow-x-auto text-cyan-300">
                    <pre>{rev.code}</pre>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Problem ID: <strong className="text-slate-300">{rev.problemId}</strong></span>
                    <button className="text-indigo-400 font-semibold hover:underline">
                      Review solution (+20 Contrib)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. REPUTATION SYSTEM */}
      {activeTab === "reputation" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white text-2xl font-bold">
                Level {user?.level || 1}
              </div>
            </div>
            <h3 className="text-white font-extrabold text-base">{user?.name || "Student SDE"}</h3>
            <p className="text-xs text-indigo-400 font-semibold mt-1">Algora Scholar Tier</p>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/60">
              <div className="text-center">
                <span className="block text-slate-500 text-[10px] uppercase font-bold">Contribution Score</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{(user as any)?.contributionScore || 50}</span>
              </div>
              <div className="text-center">
                <span className="block text-slate-500 text-[10px] uppercase font-bold">Reputation Level</span>
                <span className="text-xl font-extrabold text-indigo-400 mt-1 block">{(user as any)?.reputationScore || 100}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Community Badges & Milestone Rewards</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Top Reviewer", desc: "Peer reviewed 5+ student solutions with perfect approach hints.", color: "border-blue-500 bg-blue-950/20 text-blue-400", active: true },
                { title: "Socratic Mind", desc: "Helped peers navigate code loops without handing solutions.", color: "border-violet-500 bg-violet-950/20 text-violet-400", active: true },
                { title: "Community Catalyst", desc: "Created 3+ active algorithm/system design study groups.", color: "border-slate-800 bg-slate-900/30 text-slate-500", active: false },
                { title: "Code Guru", desc: "Earned over 200+ contribution score points.", color: "border-slate-800 bg-slate-900/30 text-slate-500", active: false }
              ].map((badge, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${badge.color}`}>
                  <div className="p-2 bg-slate-950 rounded-lg shrink-0 mt-0.5">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs">{badge.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-1">{badge.desc}</p>
                    <span className="block mt-2 text-[10px] font-bold">
                      {badge.active ? "✓ UNLOCKED" : "🔒 LOCKED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal fallback trigger */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
