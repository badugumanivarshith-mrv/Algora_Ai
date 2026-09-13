import React, { useState, useEffect } from "react";
import {
  MessageSquare, Users, GraduationCap, Flame, Plus, ThumbsUp, ThumbsDown,
  Eye, CheckCircle2, Search, Filter, Share2, Award, Clock, ArrowRight,
  Send, UserPlus, Lock, Globe, MessageCircle, AlertTriangle, X
} from "lucide-react";
import {
  CommunityService, DiscussionItem, DiscussionReply, StudyGroupItem,
  StudyGroupMember, StudyGroupMessage, StudyGroupGoal, MentorProfileItem
} from "../services/communityService";
import { RealtimeClient } from "../services/realtimeClient";

export default function Community() {
  const [activeTab, setActiveTab] = useState<"discussions" | "groups" | "mentorship">("discussions");

  // Discussions state
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionItem | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState<"trending" | "newest" | "top" | "unanswered">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyCode, setReplyCode] = useState("");

  // Study Groups state
  const [groups, setGroups] = useState<StudyGroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupItem | null>(null);
  const [groupMembers, setGroupMembers] = useState<StudyGroupMember[]>([]);
  const [groupMessages, setGroupMessages] = useState<StudyGroupMessage[]>([]);
  const [groupGoals, setGroupGoals] = useState<StudyGroupGoal[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupTopic, setNewGroupTopic] = useState("Dynamic Programming");
  const [newGroupGoal, setNewGroupGoal] = useState("");

  // Mentorship state
  const [mentors, setMentors] = useState<MentorProfileItem[]>([]);
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfileItem | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [targetRole, setTargetRole] = useState("Google SWE L5");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Moderation report modal
  const [reportTarget, setReportTarget] = useState<{ id: string; type: string; title: string } | null>(null);
  const [reportReason, setReportReason] = useState<"spam" | "harassment" | "cheating" | "inappropriate">("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Real-time online count
  const [onlineUsers, setOnlineUsers] = useState(RealtimeClient.getOnlineCount());

  useEffect(() => {
    RealtimeClient.connect("u-1", "Arjun Sharma");

    const unsubStatus = RealtimeClient.on("PRESENCE_UPDATE", (data) => {
      if (data?.onlineCount) setOnlineUsers(data.onlineCount);
    });

    const unsubNewDisc = RealtimeClient.on("NEW_DISCUSSION", (disc: DiscussionItem) => {
      setDiscussions((prev) => [disc, ...prev]);
    });

    return () => {
      unsubStatus();
      unsubNewDisc();
    };
  }, []);

  // Load Discussions
  useEffect(() => {
    if (activeTab === "discussions") {
      setLoading(true);
      CommunityService.listDiscussions({
        category: categoryFilter,
        sort: sortFilter,
        search: searchQuery,
      })
        .then((res) => setDiscussions(res.items))
        .finally(() => setLoading(false));
    } else if (activeTab === "groups") {
      setLoading(true);
      CommunityService.listStudyGroups()
        .then((res) => setGroups(res.groups))
        .finally(() => setLoading(false));
    } else if (activeTab === "mentorship") {
      setLoading(true);
      Promise.all([
        CommunityService.listMentors(),
        CommunityService.getMyMentorship("u-1"),
      ])
        .then(([mentorRes, myRes]) => {
          setMentors(mentorRes.mentors);
          setMySessions(myRes.sessions || []);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, categoryFilter, sortFilter, searchQuery]);

  // Load Discussion Detail
  const handleOpenDiscussion = (disc: DiscussionItem) => {
    setSelectedDiscussion(disc);
    RealtimeClient.subscribeRoom(`discussion:${disc.id}`);
    CommunityService.getDiscussion(disc.id).then((res) => {
      setReplies(res.replies);
    });
  };

  // Real-time listener for current discussion replies & votes
  useEffect(() => {
    if (!selectedDiscussion) return;

    const unsubReply = RealtimeClient.on("NEW_REPLY", (reply: DiscussionReply) => {
      setReplies((prev) => [...prev, reply]);
      setSelectedDiscussion((prev) => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
    });

    const unsubAccept = RealtimeClient.on("ANSWER_ACCEPTED", ({ replyId }) => {
      setReplies((prev) =>
        prev.map((r) => ({ ...r, isAcceptedAnswer: r.id === replyId }))
      );
      setSelectedDiscussion((prev) => prev ? { ...prev, acceptedReplyId: replyId } : null);
    });

    return () => {
      unsubReply();
      unsubAccept();
      RealtimeClient.unsubscribeRoom(`discussion:${selectedDiscussion.id}`);
    };
  }, [selectedDiscussion]);

  // Load Study Group Detail & Chat Room
  const handleOpenGroup = (grp: StudyGroupItem) => {
    setSelectedGroup(grp);
    RealtimeClient.subscribeRoom(`group:${grp.id}`);
    CommunityService.getStudyGroup(grp.id).then((res) => {
      setGroupMembers(res.members);
      setGroupMessages(res.messages);
      setGroupGoals(res.goals);
    });
  };

  // Real-time group chat listener
  useEffect(() => {
    if (!selectedGroup) return;

    const unsubMsg = RealtimeClient.on("GROUP_CHAT_MESSAGE", (msg: StudyGroupMessage) => {
      setGroupMessages((prev) => [...prev, msg]);
    });

    const unsubMember = RealtimeClient.on("MEMBER_JOINED", () => {
      CommunityService.getStudyGroup(selectedGroup.id).then((res) => {
        setGroupMembers(res.members);
      });
    });

    return () => {
      unsubMsg();
      unsubMember();
      RealtimeClient.unsubscribeRoom(`group:${selectedGroup.id}`);
    };
  }, [selectedGroup]);

  // Submit discussion
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArr = newTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const res = await CommunityService.createDiscussion({
      title: newTitle,
      category: newCategory,
      content: newContent,
      tags: tagsArr,
    });

    setShowCreateModal(false);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    handleOpenDiscussion(res.discussion);
  };

  // Vote discussion or reply
  const handleVote = async (targetId: string, targetType: "discussion" | "reply", type: "up" | "down") => {
    const res = await CommunityService.voteDiscussion(targetId, targetType, type);
    if (targetType === "discussion" && selectedDiscussion) {
      setSelectedDiscussion({ ...selectedDiscussion, upvotes: res.upvotes, downvotes: res.downvotes });
    } else {
      setReplies((prev) =>
        prev.map((r) => (r.id === targetId ? { ...r, upvotes: res.upvotes, downvotes: res.downvotes } : r))
      );
    }
  };

  // Post reply
  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !replyText.trim()) return;

    await CommunityService.createReply(selectedDiscussion.id, {
      content: replyText,
      codeSnippet: replyCode.trim() ? replyCode : undefined,
    });
    setReplyText("");
    setReplyCode("");
  };

  // Accept reply as answer
  const handleAcceptAnswer = async (replyId: string) => {
    if (!selectedDiscussion) return;
    await CommunityService.acceptAnswer(selectedDiscussion.id, replyId);
  };

  // Post group chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !chatInput.trim()) return;

    await CommunityService.sendGroupMessage(selectedGroup.id, {
      userId: "u-1",
      username: "Arjun Sharma",
      message: chatInput,
      messageType: "text",
    });
    setChatInput("");
  };

  // Create study group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDesc.trim()) return;

    const res = await CommunityService.createStudyGroup({
      name: newGroupName,
      description: newGroupDesc,
      targetTopic: newGroupTopic,
      targetGoal: newGroupGoal || "Solve 50 Hard problems together",
    });

    setShowCreateGroupModal(false);
    setNewGroupName("");
    setNewGroupDesc("");
    setNewGroupGoal("");
    handleOpenGroup(res.group);
  };

  // Join study group
  const handleJoinGroup = async (groupId: string) => {
    await CommunityService.joinStudyGroup(groupId, {
      userId: "u-1",
      username: "Arjun Sharma",
      fullName: "Arjun Sharma",
    });
    const updated = await CommunityService.getStudyGroup(groupId);
    setSelectedGroup(updated.group);
    setGroupMembers(updated.members);
  };

  // Request mentorship
  const handleSendMentorshipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !requestMessage.trim()) return;

    await CommunityService.requestMentorship({
      mentorId: selectedMentor.id,
      message: requestMessage,
      targetRoleCompany: targetRole,
    });

    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setSelectedMentor(null);
      setRequestMessage("");
    }, 2000);
  };

  // Submit report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;

    await CommunityService.createReport({
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      targetTitle: reportTarget.title,
      reason: reportReason,
      details: reportDetails,
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportTarget(null);
      setReportDetails("");
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-canvas)] overflow-hidden">
      {/* Top Header */}
      <header className="px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Algora Collaborative Learning Ecosystem
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Technical discussions, peer study groups, and 1-on-1 industry mentorship
          </p>
        </div>

        {/* Online presence badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{onlineUsers} Coders Online</span>
          </div>

          {activeTab === "discussions" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              New Discussion
            </button>
          )}

          {activeTab === "groups" && (
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Create Study Group
            </button>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-6 border-b border-[var(--border)] bg-[var(--bg-surface)] flex gap-6 text-sm font-semibold flex-shrink-0">
        <button
          onClick={() => { setActiveTab("discussions"); setSelectedDiscussion(null); }}
          className={`py-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === "discussions"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Technical Discussions
        </button>

        <button
          onClick={() => { setActiveTab("groups"); setSelectedGroup(null); }}
          className={`py-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === "groups"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Users className="w-4 h-4" />
          Peer Study Groups
        </button>

        <button
          onClick={() => setActiveTab("mentorship")}
          className={`py-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === "mentorship"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Industry Mentorship
        </button>
      </div>

      {/* Main Content View */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: DISCUSSIONS */}
        {activeTab === "discussions" && (
          <div>
            {!selectedDiscussion ? (
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Search & Category Filter bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
                    {[
                      { id: "all", label: "All Topics" },
                      { id: "problem", label: "Problem Discussions" },
                      { id: "algorithms", label: "DSA & Theory" },
                      { id: "contest", label: "Contest Solutions" },
                      { id: "interview", label: "Interview Strategy" },
                      { id: "career", label: "Career & Tech" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                          categoryFilter === cat.id
                            ? "bg-indigo-600 text-white"
                            : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search and Sort */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <select
                      value={sortFilter}
                      onChange={(e: any) => setSortFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                    >
                      <option value="trending">🔥 Trending</option>
                      <option value="newest">🕒 Newest</option>
                      <option value="top">⭐ Most Upvoted</option>
                      <option value="unanswered">❓ Unanswered</option>
                    </select>
                  </div>
                </div>

                {/* Discussions List */}
                {loading ? (
                  <div className="py-20 text-center text-sm text-[var(--text-muted)]">
                    Loading community discussions...
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="py-16 text-center bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-8">
                    <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">No discussions found</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Be the first to share an algorithmic breakdown or ask a question!
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    >
                      Create First Discussion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussions.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleOpenDiscussion(d)}
                        className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-indigo-500/50 cursor-pointer transition flex items-start justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {d.isPinned && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                PINNED
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 capitalize">
                              {d.category}
                            </span>
                            {d.problemSlug && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                                #{d.problemSlug}
                              </span>
                            )}
                            <span className="text-xs text-[var(--text-muted)]">
                              by {d.authorName} • {new Date(d.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="text-base font-semibold text-[var(--text-primary)] hover:text-indigo-400 transition">
                            {d.title}
                          </h3>

                          <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                            {d.content.replace(/[#*`]/g, "")}
                          </p>

                          {/* Tags */}
                          <div className="flex items-center gap-1.5 pt-1">
                            {d.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right Stats badge */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                            <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                              <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                              {d.upvotes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              {d.replyCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              {d.viewsCount}
                            </span>
                          </div>

                          {d.acceptedReplyId && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Solved
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* DISCUSSION DETAIL VIEW */
              <div className="max-w-4xl mx-auto space-y-6">
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold transition"
                >
                  ← Back to Discussions
                </button>

                {/* Main Post Card */}
                <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {selectedDiscussion.authorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {selectedDiscussion.authorName}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Posted on {new Date(selectedDiscussion.createdAt).toLocaleDateString()} in{" "}
                          <span className="text-indigo-400 capitalize">{selectedDiscussion.category}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setReportTarget({ id: selectedDiscussion.id, type: "discussion", title: selectedDiscussion.title })}
                      className="text-xs text-[var(--text-muted)] hover:text-red-400 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Report
                    </button>
                  </div>

                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {selectedDiscussion.title}
                  </h2>

                  <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                    {selectedDiscussion.content}
                  </div>

                  {/* Vote bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(selectedDiscussion.id, "discussion", "up")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-indigo-600/20 text-xs font-semibold text-[var(--text-primary)] transition"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{selectedDiscussion.upvotes}</span>
                      </button>

                      <button
                        onClick={() => handleVote(selectedDiscussion.id, "discussion", "down")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-red-600/20 text-xs font-semibold text-[var(--text-primary)] transition"
                      >
                        <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                        <span>{selectedDiscussion.downvotes}</span>
                      </button>
                    </div>

                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-4">
                      <span>{selectedDiscussion.viewsCount} views</span>
                      <span>{replies.length} replies</span>
                    </div>
                  </div>
                </div>

                {/* Replies Thread */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Replies ({replies.length})
                  </h3>

                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-5 rounded-xl border ${
                        reply.isAcceptedAnswer
                          ? "bg-emerald-950/10 border-emerald-500/40"
                          : "bg-[var(--bg-surface)] border-[var(--border)]"
                      } space-y-3`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                            {reply.authorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {reply.authorName}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] ml-2">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {reply.isAcceptedAnswer ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Answer
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcceptAnswer(reply.id)}
                            className="text-[11px] text-[var(--text-muted)] hover:text-emerald-400 font-semibold"
                          >
                            Mark as Answer
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>

                      {reply.codeSnippet && (
                        <pre className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-indigo-300 font-mono overflow-x-auto">
                          {reply.codeSnippet}
                        </pre>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleVote(reply.id, "reply", "up")}
                          className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-indigo-400 font-semibold"
                        >
                          <ThumbsUp className="w-3 h-3" /> {reply.upvotes}
                        </button>
                        <button
                          onClick={() => handleVote(reply.id, "reply", "down")}
                          className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-red-400 font-semibold"
                        >
                          <ThumbsDown className="w-3 h-3" /> {reply.downvotes}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Post Reply Form */}
                  <form
                    onSubmit={handlePostReply}
                    className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3"
                  >
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">Write a Reply</h4>
                    <textarea
                      rows={3}
                      placeholder="Share your insight or technical answer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                    />
                    <textarea
                      rows={2}
                      placeholder="Optional code snippet (C++, Python, Java)..."
                      value={replyCode}
                      onChange={(e) => setReplyCode(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                    >
                      Post Reply
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PEER STUDY GROUPS */}
        {activeTab === "groups" && (
          <div>
            {!selectedGroup ? (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {groups.map((grp) => (
                    <div
                      key={grp.id}
                      className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-indigo-500/50 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                            {grp.targetTopic}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {grp.memberCount} / {grp.maxMembers}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[var(--text-primary)]">
                          {grp.name}
                        </h3>

                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                          {grp.description}
                        </p>

                        <div className="p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="font-semibold truncate">Goal: {grp.targetGoal}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                        <button
                          onClick={() => handleOpenGroup(grp)}
                          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                        >
                          Enter Group Room
                        </button>
                        <button
                          onClick={() => handleJoinGroup(grp.id)}
                          className="px-3 py-2 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)]"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* STUDY GROUP ROOM (CHAT + GOALS + LEADERBOARD) */
              <div className="max-w-6xl mx-auto space-y-6">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold transition"
                >
                  ← Back to Study Groups
                </button>

                <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      {selectedGroup.name}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {selectedGroup.description} • Target: <span className="text-indigo-400">{selectedGroup.targetTopic}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)]">Invite Code</p>
                      <p className="text-xs font-mono font-bold text-amber-400">{selectedGroup.inviteCode}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedGroup.inviteCode)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] text-xs text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-canvas)] border border-[var(--border)]"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Live Group Chat */}
                  <div className="lg:col-span-2 p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col h-[520px]">
                    <div className="pb-3 border-b border-[var(--border)] flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        Live Group Chat (Real-time)
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-semibold">● Connected</span>
                    </div>

                    {/* Messages container */}
                    <div className="flex-1 overflow-y-auto py-3 space-y-3">
                      {groupMessages.length === 0 ? (
                        <p className="text-xs text-center text-[var(--text-muted)] py-12">
                          No messages yet. Say hello to your squad!
                        </p>
                      ) : (
                        groupMessages.map((msg) => (
                          <div key={msg.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-400">{msg.username}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)]">
                              {msg.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Chat input form */}
                    <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-[var(--border)] flex gap-2">
                      <input
                        type="text"
                        placeholder="Send message or problem snippet..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Shared Goals & Squad Leaderboard */}
                  <div className="space-y-6">
                    {/* Goals progress */}
                    <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
                      <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        Shared Group Milestones
                      </h3>

                      {groupGoals.map((goal) => {
                        const pct = Math.min(100, Math.round((goal.completedProblemsCount / goal.targetProblemsCount) * 100));
                        return (
                          <div key={goal.id} className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-[var(--text-primary)]">{goal.title}</span>
                              <span className="text-[var(--text-muted)] font-mono">{goal.completedProblemsCount}/{goal.targetProblemsCount} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Group Leaderboard */}
                    <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3">
                      <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-400" />
                        Squad Leaderboard
                      </h3>

                      <div className="space-y-2">
                        {groupMembers.map((mem, idx) => (
                          <div
                            key={mem.id}
                            className="p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 font-mono font-bold text-[var(--text-muted)]">#{idx + 1}</span>
                              <span className="font-semibold text-[var(--text-primary)]">{mem.fullName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[var(--text-muted)]">{mem.problemsSolvedInGroup} solved</span>
                              <span className="font-bold text-amber-400">{mem.contributionScore} XP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INDUSTRY MENTORSHIP */}
        {activeTab === "mentorship" && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Scheduled 1-on-1 Sessions */}
            {mySessions.length > 0 && (
              <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Your Active Mentorship Sessions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mySessions.map((s) => (
                    <div key={s.id} className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{s.title}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {new Date(s.scheduledAt).toLocaleString()} ({s.durationMinutes} mins)
                        </p>
                      </div>
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                      >
                        Join Room
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mentors.map((m) => (
                <div
                  key={m.id}
                  className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-indigo-500/50 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[var(--text-primary)]">{m.name}</h3>
                          <p className="text-xs font-semibold text-indigo-400">{m.company}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          ⭐ {m.rating}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]">{m.reviewCount} reviews</p>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {m.headline}
                    </p>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {m.bio}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5">
                      {m.specialties?.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold">
                      ● {m.maxActiveStudents - m.activeStudentsCount} spots available
                    </span>
                    <button
                      onClick={() => setSelectedMentor(m)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                    >
                      Request Mentorship
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CREATE DISCUSSION */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Create Technical Discussion</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[var(--text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Optimal Hash Map vs Two Pointers in Two Sum"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="problem">Problem Discussion</option>
                  <option value="algorithms">Algorithms & Theory</option>
                  <option value="contest">Contest Solutions</option>
                  <option value="interview">Interview Strategy</option>
                  <option value="career">Career & Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Content (Markdown)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Explain your approach, complexity analysis, or question in detail..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="hash-map, google, dp, time-complexity"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE STUDY GROUP */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Create Peer Study Group</h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-[var(--text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dynamic Programming Masters"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Topic Focus</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dynamic Programming & Graphs"
                  value={newGroupTopic}
                  onChange={(e) => setNewGroupTopic(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Primary Milestone / Goal</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Solve 50 Hard problems before Q4"
                  value={newGroupGoal}
                  onChange={(e) => setNewGroupGoal(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your study schedule, expectations, and pace..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MENTORSHIP REQUEST */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Request Mentorship: {selectedMentor.name}
              </h3>
              <button onClick={() => setSelectedMentor(null)} className="text-[var(--text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="py-8 text-center text-emerald-400 font-semibold space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p>Mentorship request sent successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSendMentorshipRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Target Company & Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Google SWE L5"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Introduction & Goals</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Introduce your current level, preparation timeline, and where you need guidance..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    Send Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REPORT CONTENT */}
      {reportTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Report Content
              </h3>
              <button onClick={() => setReportTarget(null)} className="text-[var(--text-muted)] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center text-emerald-400 font-semibold space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p>Report submitted to moderators. Thank you for keeping Algora safe!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e: any) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="spam">Spam / Promotional Bot</option>
                    <option value="cheating">Active Contest Cheating / Leak</option>
                    <option value="harassment">Harassment / Abusive Language</option>
                    <option value="inappropriate">Inappropriate / Off-Topic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Details (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional context for moderators..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
