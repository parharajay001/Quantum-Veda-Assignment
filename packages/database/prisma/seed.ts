import {
  PrismaClient,
  Role,
  TaskStatus,
  TaskPriority,
  type Prisma,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Shared password for every seeded account (local development only).
const SEED_PASSWORD = "password123";

const USERS = [
  { email: "admin@taskly.dev", name: "Admin", role: Role.ADMIN },
  { email: "priya@taskly.dev", name: "Priya Patel", role: Role.MEMBER },
  { email: "rohan@taskly.dev", name: "Rohan Gupta", role: Role.MEMBER },
  { email: "ananya@taskly.dev", name: "Ananya Iyer", role: Role.MEMBER },
  { email: "vikram@taskly.dev", name: "Vikram Reddy", role: Role.MEMBER },
] as const;

type Email = (typeof USERS)[number]["email"];

// Tasks reference users by email; ids are resolved after the users are created.
type TaskSeed = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: Email;
  assignedTo?: Email;
  assignedBy?: Email;
  dueInDays?: number;
  position: number;
  archived?: boolean;
};

const TASKS: TaskSeed[] = [
  {
    title: "Draft Q3 product roadmap",
    description: "Outline themes and milestones for the next quarter.",
    status: TaskStatus.DRAFT,
    priority: TaskPriority.MEDIUM,
    createdBy: "admin@taskly.dev",
    position: 0,
  },
  {
    title: "Collect onboarding feedback",
    description: "Summarize survey responses from the last cohort.",
    status: TaskStatus.DRAFT,
    priority: TaskPriority.LOW,
    createdBy: "rohan@taskly.dev",
    assignedTo: "rohan@taskly.dev",
    assignedBy: "admin@taskly.dev",
    position: 1,
  },
  {
    title: "Define board column rules",
    description: "Decide how tasks move between statuses.",
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    createdBy: "admin@taskly.dev",
    assignedTo: "priya@taskly.dev",
    assignedBy: "admin@taskly.dev",
    dueInDays: 5,
    position: 0,
  },
  {
    title: "Prepare sprint review deck",
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    createdBy: "priya@taskly.dev",
    assignedTo: "ananya@taskly.dev",
    assignedBy: "priya@taskly.dev",
    dueInDays: 3,
    position: 1,
  },
  {
    title: "Wire up authentication cookies",
    description: "httpOnly cookie session for login and registration.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.URGENT,
    createdBy: "admin@taskly.dev",
    assignedTo: "priya@taskly.dev",
    assignedBy: "admin@taskly.dev",
    dueInDays: 2,
    position: 0,
  },
  {
    title: "Design the task detail drawer",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    createdBy: "rohan@taskly.dev",
    assignedTo: "vikram@taskly.dev",
    assignedBy: "rohan@taskly.dev",
    dueInDays: 4,
    position: 1,
  },
  {
    title: "Triage incoming bug reports",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    createdBy: "ananya@taskly.dev",
    assignedTo: "ananya@taskly.dev",
    assignedBy: "admin@taskly.dev",
    position: 2,
  },
  {
    title: "Set up the Postgres schema",
    description: "Users and tasks with assignment relations.",
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    createdBy: "admin@taskly.dev",
    assignedTo: "admin@taskly.dev",
    assignedBy: "admin@taskly.dev",
    position: 0,
  },
  {
    title: "Add shared logging infrastructure",
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    createdBy: "priya@taskly.dev",
    assignedTo: "priya@taskly.dev",
    assignedBy: "priya@taskly.dev",
    position: 1,
  },
  {
    title: "Configure CI pipeline",
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    createdBy: "admin@taskly.dev",
    assignedTo: "vikram@taskly.dev",
    assignedBy: "admin@taskly.dev",
    position: 2,
  },
  {
    title: "Archive deprecated landing copy",
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    createdBy: "rohan@taskly.dev",
    position: 3,
    archived: true,
  },
  {
    title: "Investigate flaky test on Windows",
    description: "Prisma engine file lock during generate.",
    status: TaskStatus.PENDING,
    priority: TaskPriority.URGENT,
    createdBy: "vikram@taskly.dev",
    assignedTo: "admin@taskly.dev",
    assignedBy: "vikram@taskly.dev",
    dueInDays: 1,
    position: 2,
  },
];

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  // Upsert users so re-running the seed is idempotent.
  const usersByEmail = new Map<string, { id: string }>();
  for (const user of USERS) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
      },
    });
    usersByEmail.set(user.email, record);
  }

  const userId = (email: Email) => usersByEmail.get(email)!.id;

  // Reset tasks for a clean, repeatable dataset.
  await prisma.task.deleteMany();

  const taskData: Prisma.TaskCreateManyInput[] = TASKS.map((task) => ({
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    position: task.position,
    archived: task.archived ?? false,
    dueDate: task.dueInDays != null ? daysFromNow(task.dueInDays) : null,
    completedAt: task.status === TaskStatus.COMPLETED ? daysFromNow(-2) : null,
    createdById: userId(task.createdBy),
    assignedToId: task.assignedTo ? userId(task.assignedTo) : null,
    assignedById: task.assignedBy ? userId(task.assignedBy) : null,
  }));

  await prisma.task.createMany({ data: taskData });

  console.log(
    `Seeded ${USERS.length} users and ${taskData.length} tasks. ` +
      `All users share the password "${SEED_PASSWORD}".`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
