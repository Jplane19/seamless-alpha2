# Seamless Alpha

A project management web application for DeHyl Construction built with Next.js and Supabase.

## Project Overview

Seamless Alpha provides DeHyl Construction's coordinators and key remote clients with a single, reliable source of truth for active project status and essential information. The application eliminates communication friction caused by dispersed updates and provides clients with clear, timely visibility into their projects.

### Key Features (MVP - V1)

- Secure login for Coordinators and designated Clients
- Client Dashboard with high-level overview of active projects
- Coordinator Dashboard for project management and updates
- Basic project setup and management
- Role-based access control (Coordinator, Client)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Supabase account (for authentication and database)

### Setup

1. Clone the repository

```bash
git clone <repository-url>
cd seamless-alpha2
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Supabase Setup

1. Create a new Supabase project
2. Enable Email/Password authentication
3. Create the necessary database tables (see Database Schema below)
4. Copy your Supabase URL and anon key to the `.env.local` file

### Database Schema

The application requires the following tables in your Supabase database:

#### Users

Authentication is handled by Supabase Auth.

#### Projects

- id: uuid (primary key)
- name: text
- address: text
- client_id: uuid (foreign key to auth.users)
- status: text
- start_date: date
- end_date: date
- last_update: text
- last_update_date: date
- created_at: timestamp

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
