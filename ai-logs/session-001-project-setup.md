# Session 001 — Project Setup & Contest Brief Analysis

**Date:** 2026-05-03  
**Tool:** Gemini Antigravity (Claude Opus 4.6 Thinking)  
**Duration:** ~30 minutes  

---

## Context

Building a **stats.fm clone** for the 8x Engineer contest — a Spotify Listening Stats App.

**Contest URL:** https://www.8xengineer.com/contests/stats-fm-clone  
**Deadline:** May 22, 2026  
**Reference App:** [stats.fm](https://stats.fm)

---

## Step 1: Read Contest Brief

### Prompt
> "Read them very carefully" — attached 2 screenshots of the full 8x Engineer contest page.

### Analysis — Key Requirements Extracted

**What to Build:**
A web app that connects to Spotify (OAuth) and provides deep listening statistics:
- Top tracks / artists / genres by time period (4-week, 6-month, all-time)
- Listening time heatmap (hour of day × day of week)
- Genre diversity and mood score
- Shareable "music personality" card (image export)

**Reference App:** stats.fm — a music analytics app with a dedicated community.

**Scoring Focus:** Spotify API integration, data visualization quality, and shareable card design.

**Judging Criteria (priority order):**
1. Screenshots — first impression of UI, polished screens of all major flows
2. Loom walkthrough — end-to-end demo proving it works
3. AI logs — quality of prompts and iterations
4. Code quality — clean architecture, sensible decisions
5. Reflection — honest self-assessment

**Prizes:** 1st $50, 2nd $40, 3rd $30, 4th $20, 5th $10  
**Bonus:** Top 3 finalists may be considered for a role at 8x Social.

---

## Step 2: Read Submission Conditions

### Prompt
> User shared the full submission requirements text.

### Key Conditions:
1. **AI Logging (MANDATORY):** Set up `/ai-logs/` folder BEFORE writing any code. Logs checked on submission — missing = rejected. Cannot reconstruct retroactively.
2. **Public Repo:** Must be public GitHub URL. ZIP uploads not accepted.
3. **Star Template Repo:** For priority review grading.
4. **Required Submissions:**
   - Public GitHub URL with `/ai-logs/` folder
   - Loom walkthrough (quick intro + full demo)
   - Screenshots (up to 15)
   - Reflection (what was easy, difficult, learned)
5. **Optional:** Resume/CV

---

## Step 3: Clone Starter Template

### Action
```bash
git clone https://github.com/8xsocial/template-webapp.git .
```

### Template Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19 + Tailwind CSS v4 + Shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password)

### Template Features (pre-built)
- User authentication (sign up, sign in, sign out)
- Protected routes
- Subscription tiers (Free / Pro)
- Profile management
- Account deletion
- Responsive design + dark mode

### Template Structure
```
├── app/          # Next.js App Router pages
│   ├── api/      # API routes
│   ├── auth/     # Auth pages (login, signup)
│   ├── profile/  # User profile
│   └── upgrade/  # Subscription upgrade flow
├── components/   # Reusable UI components
├── contexts/     # React Context providers
├── lib/          # Utilities and Supabase clients
└── supabase/     # Database migrations
```

---

## Step 4: Set Up AI Logs Folder

### Action
Created `/ai-logs/` directory with:
- `README.md` — index of all sessions
- `session-001-project-setup.md` — this file

This was done **before any source code changes** per contest rules.

---

## Next Steps
1. Install dependencies (`pnpm install`)
2. Explore the existing codebase in detail
3. Set up Spotify Developer App for OAuth credentials
4. Create detailed implementation plan
5. Begin building — Spotify OAuth first, then data visualization
