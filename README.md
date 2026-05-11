# YKS Study Tracker & Planner

Modern, multi-user YKS study tracking system.

## Features
- **Multi-User Authentication**: Secure login/register system.
- **Weekly Planner**: Interactive study timetable.
- **Subject & Topic Management**: Track TYT and AYT subjects.
- **Statistics**: Detailed analysis of study sessions and mock exams.
- **Responsive Design**: Access from desktop, tablet, or mobile.

## Tech Stack
- **Framework**: Next.js 15
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Auth.js v5)
- **UI**: Tailwind CSS + Shadcn UI

## Getting Started
1. Clone the repo
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Run migrations: `npx prisma db push`
5. Start dev server: `npm run dev`
