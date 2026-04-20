import { PrismaClient, Role, BugStatus, BugPriority, BugSeverity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bugtracker.dev' },
    update: {},
    create: {
      email: 'admin@bugtracker.dev',
      name: 'Admin User',
      username: 'admin',
      passwordHash,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@bugtracker.dev' },
    update: {},
    create: {
      email: 'mentor@bugtracker.dev',
      name: 'Jane Mentor',
      username: 'janementor',
      passwordHash,
      role: Role.MENTOR,
      emailVerified: true,
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'alice@student.dev' },
    update: {},
    create: {
      email: 'alice@student.dev',
      name: 'Alice Johnson',
      username: 'alicejohnson',
      passwordHash,
      role: Role.STUDENT,
      emailVerified: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'bob@student.dev' },
    update: {},
    create: {
      email: 'bob@student.dev',
      name: 'Bob Smith',
      username: 'bobsmith',
      passwordHash,
      role: Role.STUDENT,
      emailVerified: true,
    },
  });

  // Create project
  const project = await prisma.project.upsert({
    where: { slug: 'web-dev-101' },
    update: {},
    create: {
      name: 'Web Dev 101',
      slug: 'web-dev-101',
      description: 'Introduction to web development course project',
      isPublic: true,
      ownerId: mentor.id,
    },
  });

  // Add members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: student1.id } },
    update: {},
    create: { projectId: project.id, userId: student1.id, role: Role.STUDENT },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: student2.id } },
    update: {},
    create: { projectId: project.id, userId: student2.id, role: Role.STUDENT },
  });

  // Create labels
  const bugLabel = await prisma.label.upsert({
    where: { name_projectId: { name: 'bug', projectId: project.id } },
    update: {},
    create: { name: 'bug', color: '#ef4444', projectId: project.id },
  });

  const featureLabel = await prisma.label.upsert({
    where: { name_projectId: { name: 'feature', projectId: project.id } },
    update: {},
    create: { name: 'feature', color: '#22c55e', projectId: project.id },
  });

  // Create sample bugs
  const bug1 = await prisma.bug.create({
    data: {
      title: 'Login form does not validate email format',
      description: 'The login form accepts invalid email addresses like "test@" without showing an error.',
      status: BugStatus.OPEN,
      priority: BugPriority.HIGH,
      severity: BugSeverity.MAJOR,
      projectId: project.id,
      reporterId: student1.id,
      assigneeId: student2.id,
      stepsToRepro: '1. Go to /login\n2. Enter "test@" as email\n3. Click submit\n4. No validation error shown',
      environment: 'Chrome 120, Windows 11',
      version: '1.0.0',
    },
  });

  await prisma.bugLabel.create({
    data: { bugId: bug1.id, labelId: bugLabel.id },
  });

  const bug2 = await prisma.bug.create({
    data: {
      title: 'Dashboard loading spinner never stops',
      description: 'After navigating to the dashboard, the loading spinner continues indefinitely.',
      status: BugStatus.IN_PROGRESS,
      priority: BugPriority.CRITICAL,
      severity: BugSeverity.BLOCKER,
      projectId: project.id,
      reporterId: student2.id,
      assigneeId: student1.id,
      stepsToRepro: '1. Log in\n2. Navigate to /dashboard\n3. Observe infinite spinner',
      environment: 'Firefox 123, macOS',
      version: '1.0.1',
    },
  });

  // Add comments
  await prisma.comment.create({
    data: {
      content: 'I can reproduce this on Safari too. Seems like an API timeout issue.',
      bugId: bug2.id,
      authorId: mentor.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Looking into it now. The issue is in the useEffect cleanup.',
      bugId: bug2.id,
      authorId: student1.id,
    },
  });

  console.log('✅ Seed complete!');
  console.log('📧 Test accounts:');
  console.log('   admin@bugtracker.dev / password123');
  console.log('   mentor@bugtracker.dev / password123');
  console.log('   alice@student.dev / password123');
  console.log('   bob@student.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
