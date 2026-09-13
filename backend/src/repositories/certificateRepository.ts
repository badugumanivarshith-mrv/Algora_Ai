export interface CertificateEntity {
  id: string;
  certificateCode: string;
  recipientId: string;
  recipientName: string;
  title: string;
  type: "course" | "contest" | "skill";
  category: string;
  issueDate: string;
  scoreOrRank: string;
  verificationHash: string;
  status: "verified" | "revoked";
  skillsCovered: string[];
  instructorOrIssuer: string;
  description: string;
}

class CertificateRepository {
  private certificates: CertificateEntity[] = [
    {
      id: "cert-01",
      certificateCode: "ALG-DP-94821",
      recipientId: "u_arjun_01",
      recipientName: "Arjun Sharma",
      title: "Mastery in Dynamic Programming & Combinatorial Optimization",
      type: "course",
      category: "Algorithms",
      issueDate: "2026-08-14T10:00:00.000Z",
      scoreOrRank: "Score: 98.4% (Top 1% Distinction)",
      verificationHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      status: "verified",
      skillsCovered: ["Memoization", "Tabulation", "Bitmask DP", "Digit DP", "Matrix Exponentiation"],
      instructorOrIssuer: "Algora Algorithmic Review Board",
      description: "Demonstrated mastery in formulating optimal substructure solutions, state compression, and asymptotic complexity proofs across 60+ algorithmic challenges.",
    },
    {
      id: "cert-02",
      certificateCode: "ALG-CONTEST-88120",
      recipientId: "u_arjun_01",
      recipientName: "Arjun Sharma",
      title: "Algora Global Cup 2026 — Division 1 Master Finalist",
      type: "contest",
      category: "Competitive Programming",
      issueDate: "2026-09-01T18:00:00.000Z",
      scoreOrRank: "Global Rank: #14 / 8,420 Competitors",
      verificationHash: "sha256:9c1a5b823e41d8b139048a11394f6c77bb320d912ae50438cf348c3b7a1f28e4",
      status: "verified",
      skillsCovered: ["Real-time Speed Coding", "Segment Trees", "Topological Sort", "Zero Penalty Solves"],
      instructorOrIssuer: "Algora Competitive Programming Council",
      description: "Achieved top 0.2% finish in the international timed championship, solving all 5 contest problems in under 42 minutes.",
    },
    {
      id: "cert-03",
      certificateCode: "ALG-SKILL-73419",
      recipientId: "u_arjun_01",
      recipientName: "Arjun Sharma",
      title: "Verified Graph Theory & Shortest Path Specialist",
      type: "skill",
      category: "Data Structures",
      issueDate: "2026-07-28T14:30:00.000Z",
      scoreOrRank: "Proficiency: Level 5 (Mastery)",
      verificationHash: "sha256:3e45b8109d77421acba12f84b901a1c90034ee78912cba9081234567890abcdef",
      status: "verified",
      skillsCovered: ["Dijkstra's Algorithm", "Tarjan's Strongly Connected Components", "Bellman-Ford", "Min-Cost Max-Flow"],
      instructorOrIssuer: "Algora Technical Accreditation Authority",
      description: "Passed rigorous multi-stage automated proctored benchmarks validating optimal implementations and complexity derivations in Graph Algorithms.",
    },
  ];

  listCertificates(userId?: string): CertificateEntity[] {
    return this.certificates;
  }

  getCertificateByCode(code: string): CertificateEntity | undefined {
    const clean = code.trim().toUpperCase();
    return this.certificates.find(
      (c) => c.certificateCode.toUpperCase() === clean || c.id.toUpperCase() === clean || c.verificationHash.toLowerCase().includes(code.toLowerCase())
    );
  }

  issueCertificate(data: {
    recipientName: string;
    title: string;
    type: "course" | "contest" | "skill";
    category: string;
    scoreOrRank: string;
    skillsCovered: string[];
    description: string;
  }): CertificateEntity {
    const randomCodeNum = Math.floor(10000 + Math.random() * 90000);
    const certCode = `ALG-${data.type.toUpperCase()}-${randomCodeNum}`;
    const hash = `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const newCert: CertificateEntity = {
      id: `cert-${Date.now()}`,
      certificateCode: certCode,
      recipientId: "u_arjun_01",
      recipientName: data.recipientName,
      title: data.title,
      type: data.type,
      category: data.category,
      issueDate: new Date().toISOString(),
      scoreOrRank: data.scoreOrRank,
      verificationHash: hash,
      status: "verified",
      skillsCovered: data.skillsCovered,
      instructorOrIssuer: "Algora Technical Accreditation Authority",
      description: data.description,
    };

    this.certificates.unshift(newCert);
    return newCert;
  }
}

export const certificateRepo = new CertificateRepository();
