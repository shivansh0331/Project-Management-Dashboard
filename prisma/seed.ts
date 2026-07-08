import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const projectsData = [
  {
    id: 1,
    title: "E‑Commerce Website Redesign",
    description: "Complete redesign of an online store with modern UI and improved checkout flow.",
    status: "Active",
    deadline: "2026-08-15"
  },
  {
    id: 2,
    title: "Mobile App for Fitness Tracking",
    description: "Cross‑platform mobile app to track workouts, nutrition, and progress.",
    status: "Active",
    deadline: "2026-09-01"
  },
  {
    id: 3,
    title: "Brand Identity for Startup",
    description: "Develop a complete brand identity including logo, colour palette, and typography.",
    status: "Completed",
    deadline: "2026-06-30"
  },
  {
    id: 4,
    title: "Marketing Campaign Landing Page",
    description: "Design and build a high‑conversion landing page for a new product launch.",
    status: "Active",
    deadline: "2026-07-20"
  },
  {
    id: 5,
    title: "Internal Dashboard for HR",
    description: "A dashboard to manage employee leave, attendance, and performance reviews.",
    status: "On Hold",
    deadline: "2026-08-30"
  },
  {
    id: 6,
    title: "API Integration for Payment Gateway",
    description: "Integrate a payment gateway into an existing e‑commerce platform.",
    status: "Active",
    deadline: "2026-07-10"
  },
  {
    id: 7,
    title: "Portfolio Website for a Photographer",
    description: "A minimal, visually rich portfolio site with gallery and contact form.",
    status: "Completed",
    deadline: "2026-05-15"
  },
  {
    id: 8,
    title: "Real‑time Chat Application",
    description: "A simple chat app with private and group messaging capabilities.",
    status: "Active",
    deadline: "2026-08-25"
  },
  {
    id: 9,
    title: "Social Media Scheduler",
    description: "A tool to schedule and publish posts across multiple social media platforms.",
    status: "Active",
    deadline: "2026-09-10"
  },
  {
    id: 10,
    title: "Inventory Management System",
    description: "A web‑based system to manage stock levels, orders, and supplier information.",
    status: "On Hold",
    deadline: "2026-10-01"
  }
];

const tasksData = [
  {
    id: 101,
    projectId: 1,
    title: "Design homepage mockup",
    description: "Create high‑fidelity Figma design for the new homepage.",
    status: "Completed"
  },
  {
    id: 102,
    projectId: 1,
    title: "Implement checkout flow",
    description: "Build the checkout process with cart, payment, and confirmation.",
    status: "In Progress"
  },
  {
    id: 103,
    projectId: 1,
    title: "Set up product categories",
    description: "Organise products into categories and sub‑categories.",
    status: "Pending"
  },
  {
    id: 104,
    projectId: 2,
    title: "Design workout tracking UI",
    description: "Design the screens for logging workouts and viewing progress.",
    status: "Pending"
  },
  {
    id: 105,
    projectId: 2,
    title: "Build nutrition logging feature",
    description: "Allow users to log food intake and track calories.",
    status: "In Progress"
  },
  {
    id: 106,
    projectId: 2,
    title: "Implement push notifications",
    description: "Send reminders and progress updates via push notifications.",
    status: "Pending"
  },
  {
    id: 107,
    projectId: 3,
    title: "Create logo variations",
    description: "Design multiple logo concepts based on client brief.",
    status: "Completed"
  },
  {
    id: 108,
    projectId: 3,
    title: "Develop brand guidelines document",
    description: "Compile a PDF guide with colours, fonts, and usage rules.",
    status: "Completed"
  },
  {
    id: 109,
    projectId: 4,
    title: "Copywriting for landing page",
    description: "Write headlines, subheadings, and call‑to‑action text.",
    status: "Completed"
  },
  {
    id: 110,
    projectId: 4,
    title: "Build lead capture form",
    description: "Create a form to collect visitor emails and integrate with CRM.",
    status: "In Progress"
  },
  {
    id: 111,
    projectId: 5,
    title: "Set up employee leave tracking",
    description: "Implement leave request and approval workflow.",
    status: "Pending"
  },
  {
    id: 112,
    projectId: 5,
    title: "Design performance review module",
    description: "Create a section for managers to review team performance.",
    status: "Pending"
  },
  {
    id: 113,
    projectId: 6,
    title: "Integrate Stripe payment gateway",
    description: "Add Stripe checkout and subscription features.",
    status: "In Progress"
  },
  {
    id: 114,
    projectId: 6,
    title: "Test payment webhooks",
    description: "Verify webhook responses for successful and failed payments.",
    status: "Pending"
  },
  {
    id: 115,
    projectId: 7,
    title: "Design responsive gallery",
    description: "Create a grid layout for the photographer's portfolio images.",
    status: "Completed"
  },
  {
    id: 116,
    projectId: 8,
    title: "Build user authentication",
    description: "Implement sign‑up, login, and JWT authentication for chat users.",
    status: "Completed"
  },
  {
    id: 117,
    projectId: 8,
    title: "Implement real‑time messaging",
    description: "Set up WebSocket connection for instant messaging.",
    status: "In Progress"
  },
  {
    id: 118,
    projectId: 9,
    title: "Integrate social media APIs",
    description: "Connect to platforms like Twitter, LinkedIn, and Facebook for scheduling.",
    status: "Pending"
  },
  {
    id: 119,
    projectId: 10,
    title: "Design inventory dashboard",
    description: "Create a dashboard showing stock levels, low‑stock alerts, and orders.",
    status: "Pending"
  },
  {
    id: 120,
    projectId: 10,
    title: "Implement supplier management",
    description: "Build a module to manage supplier details and order history.",
    status: "Pending"
  }
];

function mapProjectStatus(status: string): "Active" | "Completed" | "OnHold" {
  switch (status) {
    case "Active":
      return "Active";
    case "Completed":
      return "Completed";
    case "On Hold":
      return "OnHold";
    default:
      return "Active";
  }
}

function mapTaskStatus(status: string): "Pending" | "InProgress" | "Completed" {
  switch (status) {
    case "Pending":
      return "Pending";
    case "In Progress":
      return "InProgress";
    case "Completed":
      return "Completed";
    default:
      return "Pending";
  }
}

async function main() {
  console.log("Cleaning database...");
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});

  console.log("Seeding projects...");
  for (const project of projectsData) {
    await prisma.project.create({
      data: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: mapProjectStatus(project.status),
        deadline: new Date(project.deadline),
      },
    });
  }

  console.log("Seeding tasks...");
  for (const task of tasksData) {
    await prisma.task.create({
      data: {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: mapTaskStatus(task.status),
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
