import React, { useState, useEffect } from "react";
import {
  Award, CheckCircle2, ShieldCheck, Download, Share2, Search,
  ExternalLink, Sparkles, FileText, Calendar, User, Hash, QrCode
} from "lucide-react";
import { EnterpriseService, CertificateData } from "../services/enterpriseService";

export default function Certifications() {
  const [certs, setCerts] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; message: string; cert?: CertificateData } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const res = await EnterpriseService.listCertificates();
      setCerts(res.certificates);
      if (res.certificates.length > 0) {
        setSelectedCert(res.certificates[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifying(true);
    try {
      const res = await EnterpriseService.verifyCertificate(verifyCode.trim());
      setVerifyResult(res);
      if (res.cert) {
        setSelectedCert(res.cert);
      }
    } catch (err: any) {
      setVerifyResult({ verified: false, message: err.message || "Failed to verify certificate" });
    } finally {
      setVerifying(false);
    }
  };

  const filteredCerts = certs.filter(
    (c) => filterType === "all" || c.type === filterType
  );

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Algora Cryptographic Certifications
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background: "color-mix(in srgb, var(--green) 15%, transparent)",
                color: "var(--green)",
                border: "1px solid color-mix(in srgb, var(--green) 30%, transparent)",
              }}
            >
              Public Verifiable
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Tamper-proof verifiable credentials for Algorithmic Mastery, Contest Podiums, and Enterprise Readiness.
          </p>
        </div>

        {/* Instant Verification Input */}
        <form onSubmit={handleVerify} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Hash size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Verify Hash (e.g. CERT-ALG-DP-9042)"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              style={{
                padding: "7px 12px 7px 30px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--text-primary)",
                width: 260,
              }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" disabled={verifying}>
            {verifying ? "Checking..." : "Verify Credential"}
          </button>
        </form>
      </div>

      {/* Verification Result Banner */}
      {verifyResult && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: verifyResult.verified ? "color-mix(in srgb, var(--green) 12%, transparent)" : "color-mix(in srgb, var(--red) 12%, transparent)",
            border: `1px solid ${verifyResult.verified ? "color-mix(in srgb, var(--green) 30%, transparent)" : "color-mix(in srgb, var(--red) 30%, transparent)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {verifyResult.verified ? (
              <ShieldCheck size={18} style={{ color: "var(--green)" }} />
            ) : (
              <Award size={18} style={{ color: "var(--red)" }} />
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: verifyResult.verified ? "var(--green)" : "var(--red)" }}>
                {verifyResult.verified ? "Cryptographic Authenticity Confirmed" : "Verification Failed"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{verifyResult.message}</div>
            </div>
          </div>
          <button
            onClick={() => setVerifyResult(null)}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 11 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Roster, Right Certificate Preview */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
        {/* Certificate List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
            {[
              { id: "all", label: "All" },
              { id: "course", label: "Courses" },
              { id: "skill", label: "Skills" },
              { id: "contest", label: "Contests" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                style={{
                  flex: 1,
                  padding: "5px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  fontSize: 11,
                  fontWeight: filterType === t.id ? 700 : 500,
                  background: filterType === t.id ? "var(--bg-surface)" : "transparent",
                  color: filterType === t.id ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredCerts.map((cert) => {
              const isSelected = selectedCert?.id === cert.id;
              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className="surface-card"
                  style={{
                    padding: 14,
                    cursor: "pointer",
                    border: isSelected ? "1px solid var(--brand)" : "1px solid var(--border)",
                    background: isSelected ? "color-mix(in srgb, var(--brand) 6%, transparent)" : "var(--bg-surface)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{cert.title}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                      }}
                    >
                      {cert.type}
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                    Issued to <strong>{cert.recipientName}</strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                    <span>{cert.issueDate}</span>
                    <span style={{ fontFamily: "monospace", color: "var(--brand)" }}>{cert.verificationHash}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Display Viewer */}
        {selectedCert && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Visual Certificate Paper */}
            <div
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                border: "2px solid #334155",
                borderRadius: "var(--radius-lg)",
                padding: "36px 40px",
                color: "#f8fafc",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.6)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Certificate Watermark Graphic */}
              <div
                style={{
                  position: "absolute",
                  right: -30,
                  bottom: -30,
                  opacity: 0.05,
                  pointerEvents: "none",
                }}
              >
                <Award size={240} />
              </div>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: 20, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff" }}>
                    A
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.05em", color: "#fff" }}>ALGORA ACADEMY</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Cryptographic Credential System</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", padding: "4px 10px", borderRadius: 999, color: "#34d399", fontSize: 11, fontWeight: 700 }}>
                  <ShieldCheck size={14} /> Cryptographically Signed
                </div>
              </div>

              {/* Body */}
              <div style={{ textAlign: "center", padding: "10px 0 24px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "#94a3b8", marginBottom: 8 }}>
                  This is to officially certify that
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>
                  {selectedCert.recipientName}
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", maxWidth: 460, margin: "0 auto 16px", lineHeight: 1.6 }}>
                  has successfully demonstrated mastery and achieved completion of
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--brand)", marginBottom: 12 }}>
                  {selectedCert.title}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {selectedCert.description}
                </div>
              </div>

              {/* Skills / Badges */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                {selectedCert.skillsCovered.map((skill, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0" }}>
                    {skill}
                  </span>
                ))}
              </div>

              {/* Signatures & Hash Footer */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, borderTop: "1px solid #334155", paddingTop: 20, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Issued By</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{selectedCert.issuer}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{selectedCert.issueDate}</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Verification Hash</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "var(--brand)" }}>
                    {selectedCert.verificationHash}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Credential ID</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#e2e8f0" }}>
                    {selectedCert.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                <QrCode size={16} />
                <span>Verification Link: <strong style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>algora.io/verify/{selectedCert.verificationHash}</strong></span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://algora.io/verify/${selectedCert.verificationHash}`);
                    alert("Verification link copied to clipboard!");
                  }}
                  style={{ gap: 4 }}
                >
                  <Share2 size={13} /> Share Credential
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                  style={{ gap: 4 }}
                >
                  <Download size={13} /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
