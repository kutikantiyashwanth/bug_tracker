// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Upsert users (safe to run multiple times)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'ADMIN',
      skills: ['Project Management', 'Leadership'],
    },
  });

  const developer = await prisma.user.upsert({
    where: { email: 'dev@test.com' },
    update: {},
    create: {
      name: 'Developer User',
      email: 'dev@test.com',
      password: hashedPassword,
      role: 'DEVELOPER',
      skills: ['JavaScript', 'React', 'Node.js'],
    },
  });

  const tester = await prisma.user.upsert({
    where: { email: 'tester@test.com' },
    update: {},
    create: {
      name: 'Tester User',
      email: 'tester@test.com',
      password: hashedPassword,
      role: 'TESTER',
      skills: ['QA', 'Testing', 'Bug Reporting'],
    },
  });

  console.log('✅ Users ready:', admin.email, developer.email, tester.email);

  // Only create project if it doesn't exist yet
  let project = await prisma.project.findFirst({
    where: { name: 'Student Bug Tracker Demo', ownerId: admin.id },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Student Bug Tracker Demo',
        description: 'A project management and bug tracking platform for students',
        ownerId: admin.id,
      },
    });
    console.log('✅ Created project:', project.name);

    // Add members
    await prisma.projectMember.createMany({
      data: [
        { userId: admin.id,      projectId: project.id, role: 'ADMIN' },
        { userId: developer.id,  projectId: project.id, role: 'DEVELOPER' },
        { userId: tester.id,     projectId: project.id, role: 'TESTER' },
      ],
      skipDuplicates: true,
    });

    // Create tasks
    const task1 = await prisma.task.create({
      data: {
        title: 'Setup authentication',
        description: 'Implement JWT authentication for the API',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project.id,
        createdById: admin.id,
        assigneeId: developer.id,
        tags: ['backend', 'security'],
      },
    });

    await prisma.task.create({
      data: {
        title: 'Design dashboard UI',
        description: 'Create mockups for the main dashboard',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project.id,
        createdById: admin.id,
        tags: ['frontend', 'design'],
      },
    });

    // Create bugs
    const bug1 = await prisma.bug.create({
      data: {
        title: 'Login button not working',
        description: 'The login button does not respond when clicked',
        stepsToReproduce: '1. Go to login page\n2. Enter credentials\n3. Click login\n4. Nothing happens',
        severity: 'CRITICAL',
        status: 'OPEN',
        projectId: project.id,
        reporterId: tester.id,
        assigneeId: developer.id,
      },
    });

    await prisma.bug.create({
      data: {
        title: 'Typo in welcome message',
        description: 'The welcome message has a spelling error',
        severity: 'MINOR',
        status: 'OPEN',
        projectId: project.id,
        reporterId: tester.id,
      },
    });

    // Activity logs
    await prisma.activityLog.createMany({
      data: [
        { action: 'created', entityType: 'PROJECT', entityId: project.id, details: `Created project "${project.name}"`, projectId: project.id, userId: admin.id },
        { action: 'created', entityType: 'TASK',    entityId: task1.id,   details: `Created task "${task1.title}"`,     projectId: project.id, userId: admin.id },
        { action: 'reported', entityType: 'BUG',    entityId: bug1.id,    details: `Reported bug "${bug1.title}"`,      projectId: project.id, userId: tester.id },
      ],
    });

    // Notifications
    await prisma.notification.createMany({
      data: [
        { type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: `You have been assigned to "${task1.title}"`, userId: developer.id },
        { type: 'BUG_ASSIGNED',  title: 'New Bug Assigned',  message: `You have been assigned to fix "${bug1.title}"`, userId: developer.id },
      ],
    });

    console.log('✅ Created tasks, bugs, activities, notifications');
  } else {
    console.log('ℹ️  Project already exists, skipping seed data');
  }

  console.log('\n🎉 Database ready!');
  console.log('   Admin:     admin@test.com / password123');
  console.log('   Developer: dev@test.com / password123');
  console.log('   Tester:    tester@test.com / password123');
  console.log('   Invite:   ', project.inviteCode);
}

main()
  .catch((e) => {
    console.error('Seed error (non-fatal):', e.message);
    // Don't exit with error — let the server start anyway
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
