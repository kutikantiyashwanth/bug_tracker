import nodemailer from "nodemailer";

// ─── Create transporter ───
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "BugTracker <noreply@bugtracker.dev>";
const APP_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Check if email is configured ───
export const isEmailConfigured = () =>
  !!(process.env.SMTP_USER && process.env.SMTP_PASS &&
     process.env.SMTP_USER !== "your-gmail@gmail.com");

// ─── Base HTML template ───
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6c5ce7 0%, #2dd4bf 100%); padding: 28px 32px; }
    .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 700; }
    .header p  { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .body p { color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 12px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .badge-red    { background: #fee2e2; color: #dc2626; }
    .badge-amber  { background: #fef3c7; color: #d97706; }
    .badge-green  { background: #d1fae5; color: #059669; }
    .badge-purple { background: #ede9fe; color: #7c3aed; }
    .badge-blue   { background: #dbeafe; color: #2563eb; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .card h3 { margin: 0 0 6px; font-size: 15px; color: #111827; }
    .card p  { margin: 0; font-size: 13px; color: #6b7280; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6c5ce7, #2dd4bf); color: white !important; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 8px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐛 Student Bug Tracker</h1>
      <p>Project Management & Bug Tracking</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>You received this because you're a member of a Bug Tracker project.</p>
      <p style="margin-top:4px"><a href="${APP_URL}" style="color:#6c5ce7">Open Bug Tracker</a></p>
    </div>
  </div>
</body>
</html>
`;

// ─── Send email helper ───
async function sendEmail(to: string, subject: string, html: string) {
  if (!isEmailConfigured()) {
    console.log(`[Email] Not configured — would send to ${to}: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err);
  }
}

// ─── Email templates ───

export async function sendBugAssignedEmail(to: string, data: {
  assigneeName: string;
  bugTitle: string;
  severity: string;
  reporterName: string;
  projectName: string;
  description?: string;
}) {
  const severityBadge = data.severity === "critical" ? "badge-red" :
                        data.severity === "major"    ? "badge-amber" : "badge-blue";
  const html = baseTemplate(`
    <p>Hi <strong>${data.assigneeName}</strong>,</p>
    <p>A bug has been assigned to you in <strong>${data.projectName}</strong>.</p>
    <div class="card">
      <h3>${data.bugTitle}</h3>
      <p>${data.description || "No description provided."}</p>
      <p style="margin-top:10px">
        <span class="badge ${severityBadge}">${data.severity.toUpperCase()}</span>
        &nbsp; Reported by <strong>${data.reporterName}</strong>
      </p>
    </div>
    <a href="${APP_URL}/dashboard/bugs" class="btn">View Bug →</a>
  `);
  await sendEmail(to, `🐛 Bug Assigned: ${data.bugTitle}`, html);
}

export async function sendBugResolvedEmail(to: string, data: {
  recipientName: string;
  bugTitle: string;
  resolverName: string;
  projectName: string;
}) {
  const html = baseTemplate(`
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    <p><strong>${data.resolverName}</strong> has marked a bug as <span class="badge badge-green">RESOLVED</span> in <strong>${data.projectName}</strong>.</p>
    <div class="card">
      <h3>✅ ${data.bugTitle}</h3>
      <p>Please review and close this bug if everything looks good.</p>
    </div>
    <a href="${APP_URL}/dashboard/bugs" class="btn">Review Bug →</a>
  `);
  await sendEmail(to, `✅ Bug Resolved: ${data.bugTitle}`, html);
}

export async function sendTaskAssignedEmail(to: string, data: {
  assigneeName: string;
  taskTitle: string;
  priority: string;
  projectName: string;
  description?: string;
}) {
  const priorityBadge = data.priority === "critical" ? "badge-red" :
                        data.priority === "high"     ? "badge-amber" :
                        data.priority === "medium"   ? "badge-purple" : "badge-blue";
  const html = baseTemplate(`
    <p>Hi <strong>${data.assigneeName}</strong>,</p>
    <p>A new task has been assigned to you in <strong>${data.projectName}</strong>.</p>
    <div class="card">
      <h3>${data.taskTitle}</h3>
      <p>${data.description || "No description provided."}</p>
      <p style="margin-top:10px">
        <span class="badge ${priorityBadge}">${data.priority.toUpperCase()} PRIORITY</span>
      </p>
    </div>
    <a href="${APP_URL}/dashboard/kanban" class="btn">View Task →</a>
  `);
  await sendEmail(to, `📋 Task Assigned: ${data.taskTitle}`, html);
}

export async function sendCommentEmail(to: string, data: {
  recipientName: string;
  commenterName: string;
  bugTitle: string;
  comment: string;
  projectName: string;
}) {
  const html = baseTemplate(`
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    <p><strong>${data.commenterName}</strong> left a comment on a bug in <strong>${data.projectName}</strong>.</p>
    <div class="card">
      <h3>💬 ${data.bugTitle}</h3>
      <p style="font-style:italic; color:#374151">"${data.comment}"</p>
    </div>
    <a href="${APP_URL}/dashboard/bugs" class="btn">Reply →</a>
  `);
  await sendEmail(to, `💬 New comment on: ${data.bugTitle}`, html);
}

export async function sendProjectInviteEmail(to: string, data: {
  recipientName: string;
  inviterName: string;
  projectName: string;
  inviteCode: string;
}) {
  const html = baseTemplate(`
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.projectName}</strong> on Bug Tracker.</p>
    <div class="card">
      <h3>Your Invite Code</h3>
      <p style="font-family:monospace; font-size:16px; letter-spacing:2px; color:#6c5ce7; font-weight:700">${data.inviteCode}</p>
    </div>
    <p>Use this code when you sign in to join the project.</p>
    <a href="${APP_URL}/login" class="btn">Join Project →</a>
  `);
  await sendEmail(to, `🎉 You're invited to ${data.projectName}`, html);
}

export async function sendDeadlineReminderEmail(to: string, data: {
  recipientName: string;
  taskTitle: string;
  dueDate: string;
  daysLeft: number;
  projectName: string;
}) {
  const urgency = data.daysLeft <= 1 ? "🚨 URGENT" : data.daysLeft <= 3 ? "⚠️ Soon" : "📅 Reminder";
  const html = baseTemplate(`
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    <p>A task deadline is approaching in <strong>${data.projectName}</strong>.</p>
    <div class="card">
      <h3>${urgency}: ${data.taskTitle}</h3>
      <p>Due: <strong>${data.dueDate}</strong> — <strong>${data.daysLeft} day${data.daysLeft !== 1 ? "s" : ""} left</strong></p>
    </div>
    <a href="${APP_URL}/dashboard/kanban" class="btn">View Task →</a>
  `);
  await sendEmail(to, `${urgency}: "${data.taskTitle}" due in ${data.daysLeft} day(s)`, html);
}
