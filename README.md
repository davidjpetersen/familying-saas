# Familying.org

```Parenting made playful, evidence-based, and connected```

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)  
2. ⚙️ [Tech Stack](#tech-stack)  
3. 🔋 [Features](#features)  
4. 🤸 [Quick Start](#quick-start)  
5. 🔗 [Assets](#assets)  
6. 🚀 [Roadmap](#roadmap)  
7. 🛠️ [Development Notes](#development-notes)  
8. 🤝 [Contributing](#contributing)  

---

## 🤖 Introduction

Welcome to **Familying.org**, a nurturing platform crafted for parents who want to empower their families with trusted, research-backed tools. Our mission is to support your parenting journey by providing personalized recommendations, engaging micro-services, and meaningful resources that make family life easier and more joyful.

From bedtime stories tailored to your child, to meal plans that fit your family's needs, Familying.org combines technology with empathy to help you connect, grow, and thrive together.

---

## ⚙️ Tech Stack

- **[Clerk](https://clerk.com/)** – Authentication, user management, and subscriptions.  
- **[Next.js](https://nextjs.org/)** – Modern React framework for full-stack web apps.  
- **[shadcn/ui](https://ui.shadcn.com/)** – Accessible, customizable UI components.  
- **[Supabase](https://supabase.com/)** – Database, storage, and real-time subscriptions.  
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first styling framework.  
- **[TypeScript](https://www.typescriptlang.org/)** – Type-safe code for scalability.  
- **[Zod](https://zod.dev/)** – Schema validation for data integrity.  

---

## 🔋 Features

**Core Platform**  

- Multi-profile support: Manage individual profiles for each child.  
- Secure authentication: Sign up and sign in with Clerk and social logins.  
- Billing & subscriptions: Free tier available with premium upgrades.

**Micro-services**  

- Book summaries: Concise, parent-focused summaries of popular children's books.  
- Bedtime stories: AI-generated, personalized bedtime stories for every child.  
- Meal plans: Customizable weekly meal plans and recipes for busy families.  
- Conversation starters: Age-appropriate prompts to spark meaningful family conversations.  
- Calm kits: Evidence-based calming activities and mindfulness tools for kids.  
- Soundscapes: Relaxing audio environments to help children focus, relax, or sleep.

**Experience**  

- Responsive UI: Seamless experience across all devices.  
- Database integration: Supabase powers storage, profiles, and analytics.  
- Scalable stack: Production-ready with Next.js and TypeScript.

---

## 📦 Services Directory

All core family micro-services are implemented as modular packages within the `/packages/services/` directory. Each service includes both API endpoints and UI components, allowing independent development, testing, and scaling:

- **book-summaries**: Provides book summary generation and retrieval, including curated and AI-generated summaries for children's books.  
- **bedtime-stories**: Generates personalized bedtime stories based on user input, child profiles, and preferences.  
- **meal-plans**: Creates weekly meal plans and recipes tailored to dietary needs and family size.  
- **conversation-starters**: Supplies conversation prompts and questions suitable for various ages and family dynamics.  
- **calm-kits**: Offers calming exercises, mindfulness activities, and routines designed for children.  
- **soundscapes**: Delivers relaxing and focus-enhancing audio soundscapes for sleep, relaxation, or study.

---

## 🤸 Quick Start

### Prerequisites

- [Git](https://git-scm.com/)  
- [Node.js](https://nodejs.org/en)  
- [npm](https://www.npmjs.com/)  

### Clone Repository

```bash
git clone https://github.com/familying/familying.org.git
cd familying.org
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Add your Clerk and Supabase keys accordingly.

### Run Development Server

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 🔗 Assets

- Example database schema is included in `/schema`.  
- Design references are available in `/public/readme/`.  

---

## 🚀 Roadmap

Familying.org is evolving into a comprehensive SaaS hub for parents. Upcoming features include:

- Personalized onboarding quiz with adaptive logic.  
- Netflix-style content library for book summaries and stories.  
- Lifecycle email sequences and analytics instrumentation.  

---

## 🛠️ Development Notes

### Running the Project

- Start development server: `pnpm dev`  
- Build production assets: `pnpm build`  
- Start production server: `pnpm start`  

### Database Migrations

- Run migrations with: `pnpm db:migrate`  
- Note: Requires `DATABASE_URL` to be set in `.env.local`

### Environment Validation

- Environment variables are validated at boot via `lib/env.ts` to ensure configuration integrity.

---

## 🤝 Contributing

We welcome contributions from developers passionate about building supportive tools for families. Whether you want to fix bugs, add features, improve documentation, or suggest new ideas, your help is invaluable.

To get started:

1. Fork the repository.  
2. Create a feature branch.  
3. Submit a pull request with clear descriptions.  

Join us in making parenting more playful, evidence-based, and connected!
