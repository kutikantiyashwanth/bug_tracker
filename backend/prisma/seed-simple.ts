import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

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

  console.log('✅ Created users:', { admin: admin.email, developer: developer.email, tester: tester.email });

  // Create a test project
  const project = await prisma.project.create({
    data: {
      name: 'Student Bug Tracker',
      description: 'A project management and bug tracking platform for students',
      ownerId: admin.id,
    },
  });

  console.log('✅ Created project:', project.name);

  // Add members to project
  await prisma.projectMember.create({
    data: {
      userId: developer.id,
      projectId: project.id,
      role: 'DEVELOPER',
    },
  });

  await prisma.projectMember.create({
    data: {
      userId: tester.id,
      projectId: project.id,
      role: 'TESTER',
    },
  });

  console.log('✅ Added project members');

  // Create some tasks
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

  const task2 = await prisma.task.create({
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

  console.log('✅ Created tasks');

  // Create some bugs
  const bug1 = await prisma.bug.create({
    data: {
      title: 'Login button not working',
      description: 'The login button does not respond when clicked',
      stepsToReproduce: '1. Go to login page\n2. Enter credentials\n3. Click login button\n4. Nothing happens',
      severity: 'CRITICAL',
      status: 'OPEN',
      projectId: project.id,
      reporterId: tester.id,
      assigneeId: developer.id,
    },
  });

  const bug2 = await prisma.bug.create({
    data: {
      title: 'Typo in welcome message',
      description: 'The welcome message has a spelling error',
      severity: 'MINOR',
      status: 'OPEN',
      projectId: project.id,
      reporterId: tester.id,
    },
  });

  console.log('✅ Created bugs');

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      action: 'created',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `Created project "${project.name}"`,
      projectId: project.id,
      userId: admin.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'created',
      entityType: 'TASK',
      entityId: task1.id,
      details: `Created task "${task1.title}"`,
      projectId: project.id,
      userId: admin.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: 'reported',
      entityType: 'BUG',
      entityId: bug1.id,
      details: `Reported bug "${bug1.title}"`,
      projectId: project.id,
      userId: tester.id,
    },
  });

  console.log('✅ Created activity logs');

  // Create notifications
  await prisma.notification.create({
    data: {
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      message: `You have been assigned to "${task1.title}"`,
      link: `/tasks/${task1.id}`,
      userId: developer.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'BUG_ASSIGNED',
      title: 'New Bug Assigned',
      message: `You have been assigned to fix "${bug1.title}"`,
      link: `/bugs/${bug1.id}`,
      userId: developer.id,
    },
  });

  console.log('✅ Created notifications');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('   Admin:     admin@test.com / password123');
  console.log('   Developer: dev@test.com / password123');
  console.log('   Tester:    tester@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
