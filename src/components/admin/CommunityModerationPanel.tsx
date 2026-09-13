import React, { useState, useEffect } from "react";
import {
  ShieldAlert, CheckCircle2, XCircle, AlertTriangle, UserX,
  Clock, Filter, ShieldCheck, RefreshCw
} from "lucide-react";
import { CommunityService } from "../../services/communityService";

export default function CommunityModerationPanel() {
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState<"banned" | "muted" | "warning">("warning");
  const [banSuccess, setBanSuccess] = useState(false);

  const loadReports = () => {
    setLoading(true);
    CommunityService.listReports(statusFilter)
      .then((res) => setReports(res.reports))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const handleResolve = async (id: string, status: "resolved" | "dismissed") => {
    await CommunityService.resolveReport(id, `Moderator action: ${status}`, status);
    loadReports();
  };

  const handleModerateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banUserId.trim() || !banReason.trim()) return;

    await CommunityService.moderateUser({
      userId: banUserId,
      username: banUserId,
      restrictionType: banType,
      reason: banReason,
    });

    setBanSuccess(true);
    setBanUserId("");
    setBanReason("");
    setTimeout(() => setBanSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Community Content & User Moderation Queue
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Audit flagged discussions, replies, and apply penalties for cheating or harassment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
          >
            <option value="pending">⏳ Pending Review</option>
            <option value="resolved">✅ Resolved</option>
            <option value="dismissed">🚫 Dismissed</option>
            <option value="all">All Reports</option>
          </select>

          <button
            onClick={loadReports}
            className="p-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-[var(--text-muted)]">Loading reports queue...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)]">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">Clean Queue</p>
            <p className="text-[11px] text-[var(--text-muted)]">No reported content pending moderation review.</p>
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 uppercase">
                    {r.reason}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Reported by <strong className="text-[var(--text-primary)]">{r.reporterUsername}</strong> • {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[var(--text-primary)]">{r.targetTitle}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Target: {r.targetType} ({r.targetId}) {r.details && `• "${r.details}"`}
                </p>
              </div>

              {r.status === "pending" && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleResolve(r.id, "resolved")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enforce & Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(r.id, "dismissed")}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] text-xs font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Manual User Moderation Action Card */}
      <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border)] space-y-4">
        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
          <UserX className="w-4 h-4 text-amber-400" />
          Apply User Sanction / Restriction
        </h3>

        {banSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> User restriction applied successfully.
          </div>
        )}

        <form onSubmit={handleModerateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="User ID or Username"
            value={banUserId}
            onChange={(e) => setBanUserId(e.target.value)}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
          />

          <select
            value={banType}
            onChange={(e: any) => setBanType(e.target.value)}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
          >
            <option value="warning">Official Warning</option>
            <option value="muted">Chat / Discussion Mute (7 Days)</option>
            <option value="banned">Full Account Contest Ban</option>
          </select>

          <input
            type="text"
            required
            placeholder="Sanction Reason (e.g. Plagiarism)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
          >
            Apply Sanction
          </button>
        </form>
      </div>
    </div>
  );
}
