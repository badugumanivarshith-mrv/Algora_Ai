import { config } from "../config/env";
import { logger } from "../utils/logger";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static readonly MAX_RETRIES = 3;

  /**
   * Universal email dispatcher with built-in retry handling and exponential backoff
   */
  static async sendEmail(params: SendEmailParams): Promise<boolean> {
    const provider = config.emailProvider;
    let attempt = 1;
    let delayMs = 1000;

    while (attempt <= this.MAX_RETRIES) {
      try {
        if (provider === "resend" && config.resendApiKey) {
          return await this.sendViaResend(params);
        } else if (provider === "sendgrid" && config.sendgridApiKey) {
          return await this.sendViaSendGrid(params);
        } else {
          // Dev / Console fallback
          this.logToConsole(params);
          return true;
        }
      } catch (err: any) {
        logger.error(`[EmailService] Attempt ${attempt} failed to send email to ${params.to} using ${provider}: ${err.message}`);
        if (attempt === this.MAX_RETRIES) {
          logger.error(`[EmailService] CRITICAL: Email dispatch failed after ${this.MAX_RETRIES} attempts.`);
          return false;
        }
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }
    return false;
  }

  private static async sendViaResend(params: SendEmailParams): Promise<boolean> {
    logger.info(`[EmailService] Sending email to ${params.to} via Resend...`);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.emailFrom,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Resend API response error (${response.status}): ${errBody}`);
    }

    logger.info(`[EmailService] Email delivered successfully to ${params.to} via Resend.`);
    return true;
  }

  private static async sendViaSendGrid(params: SendEmailParams): Promise<boolean> {
    logger.info(`[EmailService] Sending email to ${params.to} via SendGrid...`);
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: config.emailFrom.match(/<([^>]+)>/)?.[1] || "noreply@algora.edu", name: "Algora AI" },
        subject: params.subject,
        content: [
          { type: "text/plain", value: params.text || "View the HTML version of this message." },
          { type: "text/html", value: params.html },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`SendGrid API response error (${response.status}): ${errBody}`);
    }

    logger.info(`[EmailService] Email delivered successfully to ${params.to} via SendGrid.`);
    return true;
  }

  private static logToConsole(params: SendEmailParams): void {
    logger.info(`
=========================================
[EmailService CLI / Console Output]
From: ${config.emailFrom}
To: ${params.to}
Subject: ${params.subject}
Message Body:
-----------------------------------------
${params.text || params.html.replace(/<[^>]*>/g, " ")}
=========================================
`);
  }

  // ==========================================
  // 6 Required Email Notification Flows
  // ==========================================

  /**
   * 1. Email Verification Email
   */
  static async sendVerificationEmail(email: string, username: string, verificationLink: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Verify your Algora AI account</h2>
        <p>Hello ${username},</p>
        <p>Thank you for signing up for Algora AI! Please verify your email address to unlock all interactive coding features, sandboxed assessments, and mentorship groups.</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #3b82f6; text-decoration: none; border-radius: 6px; margin: 15px 0;">Verify Email Address</a>
        <p>Or copy this link to your browser: <br/>${verificationLink}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">If you did not request this verification, please ignore this message.</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: "Verify your email address - Algora AI",
      html,
      text: `Hello ${username}, please verify your email address at: ${verificationLink}`,
    });
  }

  /**
   * 2. Password Reset Flow Email
   */
  static async sendPasswordResetEmail(email: string, username: string, resetLink: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Reset your Algora AI password</h2>
        <p>Hello ${username},</p>
        <p>We received a request to reset your password. Click the secure button below to choose a new password.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #ef4444; text-decoration: none; border-radius: 6px; margin: 15px 0;">Reset Password</a>
        <p>Or copy this link: <br/>${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">This secure link is valid for exactly 1 hour. If you didn't request a password reset, your credentials remain safe.</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: "Password Reset Request - Algora AI",
      html,
      text: `Hello ${username}, reset your password at: ${resetLink}`,
    });
  }

  /**
   * 3. Welcome / Onboarding Email
   */
  static async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to Algora AI, ${username}! 🚀</h2>
        <p>We're thrilled to have you join our elite engineering community.</p>
        <p>Algora AI integrates industry-leading AI tools, custom sandboxed environments, interactive mock interviews, and university placement boards directly in one elegant terminal interface.</p>
        <h3>Ready to get started?</h3>
        <ul>
          <li>Practice advanced DSA topics in the Code Playground.</li>
          <li>Enroll in upcoming competitive programming Hackathons.</li>
          <li>Find qualified student mentors or set up your study plans.</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">Algora AI Developer Relations Team</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: "Welcome to Algora AI! 🚀",
      html,
      text: `Welcome to Algora AI, ${username}! Explore our playground, challenges, and placement tracking systems today.`,
    });
  }

  /**
   * 4. Contest Registration Confirmation Email
   */
  static async sendContestConfirmationEmail(email: string, username: string, contestTitle: string, startTime: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Contest Registration Confirmed! 🏆</h2>
        <p>Hello ${username},</p>
        <p>Your registration for the upcoming competitive coding event <strong>${contestTitle}</strong> is confirmed!</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>Contest Title:</strong> ${contestTitle}<br/>
          <strong>Start Date/Time:</strong> ${new Date(startTime).toLocaleString()}
        </div>
        <p>Make sure your workspace is ready, code snippets are organized, and you're logged into the Algora sandbox terminal on time!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">Good luck with your submissions!</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Registration Confirmed: ${contestTitle} - Algora AI`,
      html,
      text: `Hello ${username}, you are registered for ${contestTitle} starting at ${startTime}`,
    });
  }

  /**
   * 5. Placement Notifications Email
   */
  static async sendPlacementNotification(email: string, username: string, driveName: string, roleTitle: string, status: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Placement Office Update 👔</h2>
        <p>Hello ${username},</p>
        <p>You have a new update regarding your recruitment application for the <strong>${driveName}</strong> drive.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>Job Role:</strong> ${roleTitle}<br/>
          <strong>Application Status:</strong> <span style="color: #2563eb; font-weight: bold;">${status}</span>
        </div>
        <p>Please log in to the Algora Placement dashboard to view details of upcoming pre-placement talks, technical tests, or personal panel schedules.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">Algora Placement Coordination Cell</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Application Status Update: ${driveName} - Algora AI`,
      html,
      text: `Hello ${username}, your application status for ${driveName} is now: ${status}`,
    });
  }

  /**
   * 6. Mentorship Session / Request Notifications Email
   */
  static async sendMentorshipNotification(email: string, username: string, title: string, details: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Mentorship Portal Alert 🎓</h2>
        <p>Hello ${username},</p>
        <p>You have a new update on your mentorship relationship status or session booking on Algora.</p>
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <strong>Subject:</strong> ${title}<br/>
          <strong>Message/Schedule:</strong> ${details}
        </div>
        <p>Log in to view complete details, complete feedback reports, or access the integrated high-fidelity WebRTC call panel.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;"/>
        <p style="font-size: 12px; color: #777;">Algora Mentorship Network</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: `Mentorship Alert: ${title} - Algora AI`,
      html,
      text: `Hello ${username}, mentorship update: ${title} - ${details}`,
    });
  }
}
