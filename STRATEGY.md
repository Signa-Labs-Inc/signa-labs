# Signa Labs - Complete Strategy & Execution Playbook

> **"Describe a skill. Build it. Learn it."**

This document serves as the complete source of truth for Signa Labs' strategy, vision, and execution plan. It captures every strategic decision, insight, and framework developed during the initial planning phase.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Philosophy](#product-vision--philosophy)
3. [Problem Statement & Market Analysis](#problem-statement--market-analysis)
4. [Value Proposition Deep Dive](#value-proposition-deep-dive)
5. [Target Market & Customer Segments](#target-market--customer-segments)
6. [Competitive Landscape Analysis](#competitive-landscape-analysis)
7. [Business Model & Pricing Strategy](#business-model--pricing-strategy)
8. [Revenue Projections & Financial Model](#revenue-projections--financial-model)
9. [Go-to-Market Strategy](#go-to-market-strategy)
10. [Retention Strategy & The Duolingo Playbook](#retention-strategy--the-duolingo-playbook)
11. [Technology Architecture](#technology-architecture)
12. [MVP Specification & Roadmap](#mvp-specification--roadmap)
13. [AI Strategy & Prompt Engineering](#ai-strategy--prompt-engineering)
14. [B2B Sales Playbook](#b2b-sales-playbook)
15. [Fundraising Strategy](#fundraising-strategy)
16. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
17. [Metrics, KPIs & Decision Framework](#metrics-kpis--decision-framework)
18. [Team & Hiring Plan](#team--hiring-plan)
19. [Content & Marketing Strategy](#content--marketing-strategy)
20. [Operations & Infrastructure](#operations--infrastructure)
21. [Founder Advantages & Assets](#founder-advantages--assets)
22. [Decision Log](#decision-log)
23. [Open Questions & Future Exploration](#open-questions--future-exploration)
24. [Appendices](#appendices)

---

# Executive Summary

## What We're Building

Signa Labs is an AI-powered platform where software engineers learn new skills by building, not watching. Users describe what they want to learn, AI generates a hands-on coding exercise, and they build real code in a browser-based IDE. AI evaluates their work and provides feedback.

## The One-Liner

**"The Duolingo of AI development."**

## Core Value Proposition

**"Describe a skill. Build it. Learn it."**

## Primary Niche

Applied AI fullstack development: React, Next.js, OpenAI API, Anthropic API, Vercel AI SDK, RAG, embeddings, agents, and related technologies.

## Business Model

- **Free tier:** 5 single-file exercises/month
- **Pro tier:** $29/month - Unlimited single-file + 20 multi-file projects
- **Team tier:** $49/seat/month - Unlimited everything + admin features

## Revenue Goals

- **6 months:** $20-30K MRR
- **12 months:** $50-100K MRR
- **Primary path:** B2C foundation → B2B acceleration

## Fundraising Goals

- **Pre-seed (optional):** $750K-$1.5M
- **Seed:** $2-5M

## Founding Team

- Two former YC founders (siblings)
- Technical + domain expertise
- Strong founder-market fit (would use the product)

## Key Advantages

1. Former YC founders with network access
2. Warm investor relationship (Niko Bonatsos, General Catalyst)
3. Clear, differentiated value proposition
4. Hot niche (AI development)
5. Capped downside (useful tool even if business doesn't scale)

---

# Product Vision & Philosophy

## The Vision Statement

> "Every software engineer should be able to learn any skill, instantly, by building it. No long courses. No stale content. No passive watching. Just describe what you want to learn, build it, and ship faster."

## Core Philosophy

### 1. Learning by Doing

The most effective way to learn software development is by writing code. Passive consumption (videos, reading) has low retention. Active practice (building) has high retention.

**Research supports this:**

- Retention rates: Reading (10%), Watching (20%), Practicing (75%)
- The "generation effect": Information is better remembered when generated rather than read
- Deliberate practice is the key to skill acquisition

### 2. Just-in-Time Learning

Engineers don't need comprehensive courses. They need specific skills at specific moments:

- "I need to add auth to my app this week"
- "My team wants to integrate AI features"
- "I'm interviewing at a company that uses X"

**Traditional courses fail this:** 20-hour courses when you need a 30-minute skill.

### 3. Personalization at Scale

Every engineer's learning needs are different. AI enables true personalization:

- Describe exactly what you want to learn
- Get exactly the exercise you need
- No generic curriculum

### 4. Evergreen Relevance

Technology changes faster than courses can update. AI-generated content is:

- Always current (generates based on latest knowledge)
- Infinitely varied (no fixed curriculum)
- Adaptable to new frameworks/tools

### 5. Tangible Output

Unlike language learning or theory courses, every completed skill produces:

- Working code
- Demonstrable capability
- Portfolio-ready examples

## The User Journey Vision

### Today (Without Signa Labs)

```
Engineer needs to learn RAG
        ↓
Searches YouTube, finds 4-hour tutorial
        ↓
Watches passively, takes notes
        ↓
Tries to implement, gets stuck
        ↓
Searches Stack Overflow, ChatGPT
        ↓
Cobbles together something that works
        ↓
Total time: 6-10 hours
Retention: Low
Confidence: Low
```

### Tomorrow (With Signa Labs)

```
Engineer needs to learn RAG
        ↓
Types: "Build a RAG chatbot with Pinecone"
        ↓
AI generates hands-on exercise (30 seconds)
        ↓
Builds working code in browser IDE
        ↓
AI evaluates and provides feedback
        ↓
Total time: 45 minutes
Retention: High
Confidence: High
```

## Product Principles

### 1. Speed Over Comprehensiveness

- 30-minute skills, not 30-hour courses
- Learn what you need, not everything
- Ship faster, learn as you go

### 2. Practice Over Theory

- Build real code, not toy examples
- Practical applications, not academic exercises
- Transferable to real work immediately

### 3. Instant Value

- First skill completed in 15 minutes
- No setup required
- Value from minute one

### 4. Judgment-Free Learning

- AI doesn't judge you
- Try, fail, retry without embarrassment
- Private practice space

### 5. Career-Aligned

- Skills that matter for jobs
- Portfolio-worthy output
- Visible progress for advancement

---

# Problem Statement & Market Analysis

## The Core Problem

### Problem Statement

> Software engineers need to constantly learn new skills in an ever-evolving technology landscape. Current learning solutions are too slow, too generic, too passive, and too stale. There's no fast, personalized, hands-on way to learn exactly what you need, when you need it.

### The Pain Points (Detailed)

#### 1. Time Scarcity

**The reality:** Engineers are busy. They have deadlines, meetings, and existing responsibilities.

**The data:**

- Average engineer has < 5 hours/week for learning
- Most courses require 10-40 hours to complete
- 67% of started courses are never finished

**The consequence:** Engineers don't have time for traditional courses, so they either:

- Don't learn new skills (career stagnation)
- Learn ad-hoc from fragmented sources (inefficient)
- Wait until forced to learn at work (stressful)

#### 2. Rapid Technology Change

**The reality:** The AI landscape changes monthly. New models, new frameworks, new best practices.

**The data:**

- GPT-4 to GPT-4o to GPT-4o-mini in < 18 months
- Vercel AI SDK, LangChain, LlamaIndex all evolving rapidly
- Best practices for RAG, agents, etc. still emerging

**The consequence:** Courses created 6 months ago may already be outdated. Engineers learn techniques that are no longer best practice.

#### 3. Passive Learning Doesn't Stick

**The reality:** Watching videos feels productive but has low retention.

**The data:**

- Video watching retention: ~20%
- Hands-on practice retention: ~75%
- Most course completers can't implement what they "learned"

**The consequence:** Engineers watch courses, feel like they learned something, then can't apply it. Time wasted.

#### 4. Generic Curriculum

**The reality:** Every engineer's needs are different.

**Examples:**

- "I already know React, I just need to learn the AI parts"
- "I need to learn auth, but specifically with Clerk, not Auth0"
- "I want to learn RAG with Supabase, not Pinecone"

**The consequence:** Engineers sit through content they already know or that doesn't match their stack.

#### 5. Setup Friction

**The reality:** Before you can practice, you need an environment.

**The friction:**

- Install dependencies
- Set up API keys
- Configure environment
- Create project structure
- Debug setup issues

**The consequence:** 30 minutes of setup before any learning. Many give up before starting.

### Who Experiences This Pain

| Persona                           | Pain Intensity | Frequency |
| --------------------------------- | -------------- | --------- |
| Senior engineers learning AI      | High           | Weekly    |
| Engineers changing jobs           | High           | Monthly   |
| Engineers at fast-moving startups | High           | Weekly    |
| Bootcamp grads upskilling         | High           | Daily     |
| Agency developers                 | Medium         | Weekly    |
| Enterprise engineers              | Medium         | Monthly   |

## Market Analysis

### Total Addressable Market (TAM)

**Global developer population:** ~27 million (and growing)

**Developer education market:** $30B+ globally

- Corporate training: $15B+
- Individual learning: $10B+
- Bootcamps: $5B+

### Serviceable Addressable Market (SAM)

**Engineers actively learning AI/modern web development:** ~5-10 million

- AI skills specifically: 2-3 million actively learning
- Next.js/React ecosystem: 3-5 million

### Serviceable Obtainable Market (SOM)

**Realistic year 1-2 target:** 10,000-50,000 paying users

- At $29/month average: $290K - $1.45M MRR potential
- At $35/month average (with B2B): $350K - $1.75M MRR potential

### Market Trends Supporting This

#### 1. AI Skills Demand Explosion

- Every company wants AI features
- Job postings requiring AI skills up 300%+ YoY
- Premium salaries for AI-capable engineers

#### 2. Shift to Just-in-Time Learning

- Traditional education losing market share
- Micro-learning growing 15%+ annually
- Engineers prefer targeted skills over comprehensive courses

#### 3. AI-Enabled Education

- AI tutoring now possible (wasn't 2 years ago)
- Personalization at scale achievable
- Quality of AI-generated content improving rapidly

#### 4. Remote Work Normalization

- Self-directed learning more common
- Company-sponsored learning budgets increasing
- Geographic barriers to learning removed

### Market Timing

**Why now?**

| Factor                         | 2 Years Ago | Now                   |
| ------------------------------ | ----------- | --------------------- |
| AI generation quality          | Poor        | Good enough           |
| AI skills demand               | Growing     | Explosive             |
| Code execution in browser      | Limited     | WebContainers, Fly.io |
| Engineer comfort with AI tools | Low         | High                  |
| Corporate AI training budgets  | Small       | Large and growing     |

**The window:** AI-powered learning tools are now possible but not yet dominant. First-mover advantage available.

---

# Value Proposition Deep Dive

## The Core Value Proposition

**"Describe a skill. Build it. Learn it."**

This captures three key differentiators:

### 1. "Describe a skill" (Personalized)

- **What it means:** You tell us exactly what you want to learn
- **Why it matters:** No generic curriculum, no wasted time
- **How it's different:** Courses force their structure; we adapt to you

### 2. "Build it" (Hands-On)

- **What it means:** You write real code in a real IDE
- **Why it matters:** Building creates retention; watching doesn't
- **How it's different:** Videos are passive; we're active

### 3. "Learn it" (Outcome-Focused)

- **What it means:** AI evaluates your work, confirms you learned
- **Why it matters:** Confidence that you actually acquired the skill
- **How it's different:** Courses end with a video; we end with proof

## Value Proposition by Stakeholder

### For Individual Engineers

**Primary value:** Learn faster, stay relevant

| Value                       | How We Deliver                  |
| --------------------------- | ------------------------------- |
| Save time                   | 30 min vs. 4+ hours             |
| Learn exactly what you need | Describe your goal, we generate |
| Actually retain skills      | Hands-on practice               |
| Stay current                | AI generates with latest info   |
| Build portfolio             | Working code output             |

**Emotional value:**

- Confidence ("I know how to do this")
- Security ("I'm keeping my skills current")
- Pride ("I built this")

### For Engineering Managers

**Primary value:** Faster, measurable team upskilling

| Value                       | How We Deliver                   |
| --------------------------- | -------------------------------- |
| Upskill team on AI          | Targeted exercises               |
| Reduce time-to-productivity | Learn in hours, not weeks        |
| Track progress              | Dashboard, completion metrics    |
| Standardize skills          | Everyone learns the same way     |
| Reduce training costs       | Cheaper than courses/consultants |

**Emotional value:**

- Control ("I can see what my team is learning")
- Efficiency ("No wasted training budget")
- Competitiveness ("My team has latest skills")

### For Companies

**Primary value:** Competitive advantage through skilled workforce

| Value                      | How We Deliver                              |
| -------------------------- | ------------------------------------------- |
| AI-capable workforce       | AI-focused curriculum                       |
| Faster feature development | Engineers learn what they need for projects |
| Retention                  | Employees value learning opportunities      |
| Scalable training          | Works for 5 or 500 engineers                |
| ROI                        | Measurable skill acquisition                |

## The Duolingo Comparison

### Why Duolingo Succeeds Against Free Alternatives

Free language learning exists (YouTube, podcasts, apps). Duolingo charges $7-14/month and has:

- 500M+ downloads
- ~$500M ARR
- 90%+ gross margin

**How they win:**
| Duolingo Mechanic | Why It Beats Free |
|-------------------|-------------------|
| Gamification | Makes learning addictive |
| Streaks | Creates habit, fear of loss |
| Structured progression | Clear path vs. chaos |
| Bite-sized lessons | Low commitment per session |
| Mobile-first | Learning anywhere |
| Social features | Competition, accountability |

### How We Apply This (With Our Advantages)

| Duolingo               | Signa Labs                       | Our Advantage   |
| ---------------------- | -------------------------------- | --------------- |
| Flashcards, quizzes    | Build real code                  | Tangible output |
| Generic curriculum     | Personalized exercises           | Relevance       |
| Hobby for most         | Career advancement               | Higher stakes   |
| Intangible progress    | Working code portfolio           | Proof           |
| Low completion urgency | Project deadlines drive learning | Motivation      |

**Our thesis:** We can replicate Duolingo's engagement mechanics while offering a fundamentally superior learning experience (hands-on, personalized, career-relevant).

## Value Proposition vs. Alternatives

### vs. Video Courses (Udemy, Coursera)

| Factor           | Video Courses    | Signa Labs       |
| ---------------- | ---------------- | ---------------- |
| Time to complete | 10-40 hours      | 30 min per skill |
| Learning style   | Passive          | Active           |
| Personalization  | None             | Complete         |
| Currency         | Stale            | Always current   |
| Output           | Certificate      | Working code     |
| Price            | $10-200 one-time | $29/month        |

**We win when:** Time is valuable, specific skills needed, hands-on learning preferred

### vs. YouTube

| Factor      | YouTube                     | Signa Labs   |
| ----------- | --------------------------- | ------------ |
| Price       | Free                        | $29/month    |
| Quality     | Varies                      | Consistent   |
| Structure   | Fragmented                  | Organized    |
| Practice    | None included               | Built-in IDE |
| Evaluation  | None                        | AI feedback  |
| Search cost | High (finding good content) | Zero         |

**We win when:** Quality and time savings worth $29, hands-on practice needed

### vs. ChatGPT/Claude for Learning

| Factor                | ChatGPT        | Signa Labs     |
| --------------------- | -------------- | -------------- |
| Price                 | $20/month      | $29/month      |
| Practice environment  | None           | Full IDE       |
| Structure             | Conversational | Exercise-based |
| Evaluation            | Manual         | Automated      |
| Progress tracking     | None           | Built-in       |
| Designed for learning | No             | Yes            |

**We win when:** Structured practice needed, not just Q&A

### vs. Bootcamps

| Factor      | Bootcamps            | Signa Labs   |
| ----------- | -------------------- | ------------ |
| Price       | $10-20K              | $29/month    |
| Time        | 3-6 months full-time | 30 min/skill |
| Flexibility | Fixed schedule       | Any time     |
| Scope       | Comprehensive        | Targeted     |
| Output      | Certificate          | Working code |

**We win when:** Already employed, need specific skills, can't commit full-time

---

# Target Market & Customer Segments

## Primary Niche Definition

### The Niche: Applied AI Fullstack Development

**Why this niche:**

1. **Highest demand:** Every company wants AI features
2. **Fast-changing:** New models/techniques constantly → courses can't keep up
3. **High willingness to pay:** Career-critical skills command premium
4. **Our expertise:** Building an AI product ourselves
5. **Clear content scope:** Defined stack, clear skills

### Technologies Covered

**Frontend:**

- React (core)
- Next.js (primary framework)
- TypeScript
- Tailwind CSS

**AI/LLM:**

- OpenAI API (GPT-4, GPT-4o, embeddings)
- Anthropic API (Claude)
- Vercel AI SDK
- LangChain (optional)

**AI Patterns:**

- Chat interfaces
- Streaming responses
- RAG (Retrieval Augmented Generation)
- Embeddings and semantic search
- AI agents and tool calling
- Function calling
- Prompt engineering

**Databases:**

- Vector databases (Pinecone, Supabase pgvector)
- Traditional databases (Postgres)

**Infrastructure:**

- Vercel deployment
- API routes and server actions

## Customer Segments (Detailed)

### Segment 1: Senior Engineers Learning AI (Primary B2C)

**Profile:**

- 5+ years experience
- Strong fundamentals, new to AI
- At companies adding AI features
- Time-poor, money-comfortable
- Learn best by doing

**Demographics:**

- Age: 28-45
- Income: $120K-250K
- Location: Global, English-speaking
- Company size: Startup to enterprise

**Psychographics:**

- Values efficiency over comprehensiveness
- Prefers practice over theory
- Career-ambitious
- Stays current out of professional pride
- Recommends tools they find useful

**Jobs to be Done:**

- "Help me add AI features to my product"
- "Help me stay relevant as AI changes everything"
- "Help me learn this quickly so I can ship"

**Willingness to Pay:** High ($29/month is trivial vs. salary)

**Acquisition Channels:**

- Twitter/X
- LinkedIn
- Hacker News
- Word of mouth
- Company Slack/Discord

**Estimated Segment Size:** 1-2 million globally

### Segment 2: Career Transitioners (Secondary B2C)

**Profile:**

- Experienced engineers pivoting to AI
- Bootcamp grads upskilling
- Backend devs learning fullstack
- Strong motivation, time available

**Demographics:**

- Age: 24-40
- Income: $60K-150K (or between jobs)
- Location: Global
- Employment: Employed or actively searching

**Psychographics:**

- Urgency around career advancement
- Investment mindset for skills
- Research-oriented before buying
- Price-conscious but willing to pay for value
- Active in learning communities

**Jobs to be Done:**

- "Help me qualify for AI engineering roles"
- "Help me add AI skills to my resume"
- "Help me compete in the job market"

**Willingness to Pay:** Medium-High (invest in career)

**Acquisition Channels:**

- LinkedIn
- Reddit (r/learnprogramming, r/cscareerquestions)
- Bootcamp alumni networks
- Job search communities

**Estimated Segment Size:** 500K-1 million globally

### Segment 3: Company-Sponsored Learners (B2C via B2B)

**Profile:**

- Engineers with learning budgets
- Company pays for education
- Less price-sensitive
- Often mandated to upskill

**Demographics:**

- All experience levels
- Income: Varies
- Location: US, Europe, Global tech hubs
- Company: Startups to enterprises

**Jobs to be Done:**

- "My company wants me to learn AI"
- "I have a learning budget to spend"
- "I need to upskill for my project"

**Willingness to Pay:** Very High (company pays)

**Acquisition Channels:**

- Direct company purchase
- Expensed by individual
- L&D team recommendations

**Estimated Segment Size:** 2-5 million globally

### Segment 4: Startup Engineering Teams (Primary B2B)

**Profile:**

- 5-50 person engineering teams
- Building AI features
- Need to upskill quickly
- Budget-conscious but value ROI

**Company Profile:**

- Stage: Seed to Series B
- Size: 5-50 engineers
- Industry: Tech, SaaS, AI
- Location: US, Global

**Decision Maker:** Engineering Manager, VP Eng, CTO

**Jobs to be Done:**

- "Help my team build AI features faster"
- "Get my team up to speed on our new AI stack"
- "Standardize AI skills across the team"

**Willingness to Pay:** High ($49/seat × 10-30 seats = $490-1,470/month)

**Acquisition Channels:**

- Direct outreach to eng managers
- LinkedIn
- YC network
- Referrals from engineers

**Estimated Segment Size:** 50,000-100,000 companies globally

### Segment 5: Agencies (Secondary B2B)

**Profile:**

- Digital agencies adding AI services
- Building AI features for clients
- Need team to learn quickly
- Project-driven timelines

**Company Profile:**

- Size: 10-200 people
- Services: Web development, consulting
- Clients: Various industries

**Decision Maker:** Tech Lead, Agency Owner

**Jobs to be Done:**

- "Our clients want AI features, we need to deliver"
- "Upskill team for upcoming AI projects"
- "Differentiate from competitors with AI capabilities"

**Willingness to Pay:** High (passes cost to clients)

**Acquisition Channels:**

- Agency networks
- Clutch, Agency directories
- LinkedIn outreach

**Estimated Segment Size:** 10,000-50,000 agencies globally

### Segment 6: Enterprise L&D (Future B2B)

**Profile:**

- Large company training departments
- Formal procurement process
- Compliance requirements
- Large seat counts

**Company Profile:**

- Size: 500+ engineers
- Industry: Tech, Finance, Healthcare
- Budget: Established L&D budget

**Decision Maker:** L&D Director, VP Engineering

**Jobs to be Done:**

- "Upskill our engineering org on AI"
- "Provide structured AI training at scale"
- "Track and report on skill development"

**Willingness to Pay:** Very High (100+ seats, custom pricing)

**Requirements:**

- SSO/SAML
- Admin controls
- Reporting/analytics
- Custom content
- Security review

**Timeline:** Not MVP focus, but future opportunity

## Segment Prioritization

### Phase 1 (Months 1-3): B2C Focus

| Segment              | Priority | Why                        |
| -------------------- | -------- | -------------------------- |
| Senior Engineers     | High     | Fast to acquire, high WTP  |
| Career Transitioners | Medium   | Good volume, moderate WTP  |
| Company-Sponsored    | Medium   | High WTP, harder to target |

### Phase 2 (Months 4-6): Add B2B

| Segment       | Priority | Why                       |
| ------------- | -------- | ------------------------- |
| Startup Teams | High     | Good fit, can close fast  |
| Agencies      | Medium   | Higher volume, clear need |

### Phase 3 (Months 7-12): Expand B2B

| Segment            | Priority | Why                                 |
| ------------------ | -------- | ----------------------------------- |
| Mid-size Companies | High     | Larger contracts                    |
| Enterprise         | Low      | Long sales cycles, wait for inbound |

## Customer Persona Cards

### Persona 1: "Senior Sarah"

**Quote:** "I've been building web apps for 8 years, but I've barely touched AI. I need to catch up fast or I'll be left behind."

**Background:**

- Age: 34
- Role: Senior Software Engineer
- Company: Series B startup
- Experience: 8 years
- Location: Austin, TX

**Goals:**

- Add AI features to her team's product
- Stay relevant in her career
- Learn efficiently (she's busy)

**Frustrations:**

- Courses are too long
- YouTube is hit or miss
- No time to set up practice environments
- Not sure what to learn first

**How Signa Helps:**

- Targeted 30-min exercises on exactly what she needs
- No setup required
- Clear progression through AI skills
- Fits into her busy schedule

**Quote after using Signa:**
"I learned RAG in 45 minutes and shipped a feature that afternoon. This is how I should have been learning all along."

### Persona 2: "Manager Mike"

**Quote:** "My team needs to build AI features but half of them have never called an LLM API. I need them productive in weeks, not months."

**Background:**

- Age: 38
- Role: Engineering Manager
- Company: 40-person startup
- Team size: 8 engineers
- Location: San Francisco

**Goals:**

- Get team AI-capable quickly
- Deliver AI features to meet roadmap
- Don't blow training budget

**Frustrations:**

- Courses are expensive and slow
- Hard to track what people learned
- Can't force everyone through same course
- Results vary by individual

**How Signa Helps:**

- Team dashboard shows progress
- Engineers learn at their own pace
- Specific skills mapped to project needs
- Predictable cost ($49/seat)

**Quote after using Signa:**
"We got the whole team through the AI fundamentals in two weeks. The feature shipped on time."

---

# Competitive Landscape Analysis

## Competitive Overview

### Direct Competitors

#### Codecademy

**What they do:** Interactive coding courses (web, data, AI)

**Strengths:**

- Brand recognition
- Broad curriculum
- Free tier drives adoption
- Interactive exercises

**Weaknesses:**

- Generic, not personalized
- Courses are static, can get stale
- Not specifically AI-focused
- Passive "fill in the blank" exercises

**Pricing:** Free tier, Pro $35/month

**Our differentiation:**

- Fully personalized (they're curriculum-based)
- Truly hands-on (they're guided exercises)
- AI-focused (they're general programming)
- Always current (they're static courses)

#### Educative.io

**What they do:** Text-based interactive courses with in-browser coding

**Strengths:**

- No video (text is searchable)
- In-browser coding
- Good technical depth
- Paths for different goals

**Weaknesses:**

- Static curriculum
- Not personalized
- Completion-based (not skill-based)
- Can't learn "just this one thing"

**Pricing:** $59/month (individuals), Enterprise pricing

**Our differentiation:**

- Personalized exercises vs. fixed courses
- AI-generated vs. human-authored
- Skill-based vs. course-based

#### Scrimba

**What they do:** Interactive video with live coding

**Strengths:**

- Innovative format (pause video, edit code)
- Good engagement
- Growing AI content

**Weaknesses:**

- Still course-based
- Not personalized
- Video-centric (some don't prefer)

**Pricing:** $25/month (Pro)

**Our differentiation:**

- No video (pure hands-on)
- Personalized exercises
- AI-generated content

#### DeepLearning.AI

**What they do:** AI/ML courses (more theoretical/research-focused)

**Strengths:**

- Andrew Ng brand
- Rigorous content
- Industry recognition

**Weaknesses:**

- More ML theory, less applied
- Long courses (not just-in-time)
- Not fullstack focused
- Passive video format

**Pricing:** Varies (Coursera platform)

**Our differentiation:**

- Applied fullstack, not theory
- Just-in-time, not comprehensive
- Hands-on, not video

### Indirect Competitors (Free Alternatives)

#### YouTube

**Threat level:** Medium

**Strengths:**

- Free
- Vast content library
- Some excellent creators

**Weaknesses:**

- Quality varies wildly
- No structure
- No practice environment
- No evaluation

**Our response:**

- Curated quality
- Structured progression
- Built-in practice
- 10x faster for specific skills

#### ChatGPT/Claude for Learning

**Threat level:** Medium-High

**Strengths:**

- Personalized
- Instant answers
- Can explain concepts well

**Weaknesses:**

- No practice environment
- No structure/progression
- No evaluation
- Conversational, not exercise-based

**Our response:**

- Built-in IDE and execution
- Structured exercises
- Automated evaluation
- Progress tracking

#### Documentation (Official Docs)

**Threat level:** Low

**Strengths:**

- Accurate and up-to-date
- Free
- Authoritative

**Weaknesses:**

- Reference, not learning
- No exercises
- No progression
- Assumes context

**Our response:**

- Learning-focused, not reference
- Hands-on exercises
- Guided progression

### Competitive Matrix

| Factor       | Signa Labs | Codecademy | Educative | YouTube | ChatGPT |
| ------------ | ---------- | ---------- | --------- | ------- | ------- |
| Personalized | ★★★★★      | ★★☆☆☆      | ★★☆☆☆     | ★☆☆☆☆   | ★★★★☆   |
| Hands-On     | ★★★★★      | ★★★☆☆      | ★★★★☆     | ★☆☆☆☆   | ★☆☆☆☆   |
| AI-Focused   | ★★★★★      | ★★☆☆☆      | ★★★☆☆     | ★★★☆☆   | N/A     |
| Speed        | ★★★★★      | ★★☆☆☆      | ★★☆☆☆     | ★★★☆☆   | ★★★★☆   |
| Evaluation   | ★★★★★      | ★★★☆☆      | ★★★☆☆     | ☆☆☆☆☆   | ★★☆☆☆   |
| Price        | $29/mo     | $35/mo     | $59/mo    | Free    | $20/mo  |

### Moat Analysis

**Current moats (weak but buildable):**

1. **Speed:** First to market with AI-generated, personalized exercises
2. **Focus:** Deep on AI fullstack (vs. broad)
3. **Experience:** Hands-on in a way others aren't

**Moats to build:**

1. **Brand:** "The place to learn AI development"
2. **Data:** Usage data improves generation quality
3. **Community:** Network of learners
4. **B2B relationships:** Sticky contracts
5. **Content library:** Generated exercises become assets

### Competitive Responses to Anticipate

| If This Happens                    | Impact | Our Response                     |
| ---------------------------------- | ------ | -------------------------------- |
| Codecademy adds AI personalization | Medium | We're AI-native, not bolted on   |
| ChatGPT adds code sandbox          | High   | We're learning-focused, not chat |
| Big player acquires competitor     | Medium | Move fast, build brand           |
| YouTube channel dominates niche    | Low    | We're hands-on, they're passive  |
| Free clone emerges                 | Low    | Quality + brand + B2B            |

---

# Business Model & Pricing Strategy

## Pricing Philosophy

### Core Principles

1. **Value-based, not cost-based:** Price based on value to user (career advancement), not our costs
2. **Simple and transparent:** Easy to understand, no hidden fees
3. **Free tier as funnel:** Low friction to try, clear value before paying
4. **B2B premium:** Companies pay more for admin features, not core product

### Pricing Psychology

**Why $29/month works:**

- Below "needs approval" threshold for most engineers
- "Coffee per week" framing ($1/day)
- High enough to signal quality
- Low enough for impulse decision
- Annual: $348 < cost of one Udemy course bundle

**Why free tier matters:**

- Lowers trial friction to zero
- Builds word of mouth
- 5 exercises/month = enough to hook, not satisfy
- Converts via value demonstration, not marketing

## Pricing Tiers (Final)

### Free Tier

**Price:** $0

**Includes:**

- 5 single-file exercises per month
- AI-generated skills
- AI code evaluation
- Basic progress tracking

**Limitations:**

- No multi-file projects
- No saved progress history
- No streak features
- No certificates

**Purpose:** Funnel to Pro, word of mouth

### Pro Tier

**Price:** $29/month ($290/year = 2 months free)

**Includes:**

- Unlimited single-file exercises
- 20 multi-file projects per month
- Full progress history
- Streak tracking
- Certificates/badges
- All languages and frameworks
- Priority AI generation

**Purpose:** Primary B2C revenue

### Team Tier

**Price:** $49/seat/month (minimum 5 seats)

**Includes:**

- Everything in Pro
- Unlimited multi-file projects
- Team admin dashboard
- Progress analytics
- Bulk user management
- Priority support
- Custom skill paths (future)

**Purpose:** B2B revenue, larger contracts

### Enterprise Tier (Future)

**Price:** Custom ($100+/seat/month)

**Includes:**

- Everything in Team
- SSO/SAML
- Custom content creation
- API access
- Dedicated support
- SLA guarantees
- Security review
- Custom integrations

**Purpose:** Large company contracts

## Revenue Model Mechanics

### B2C Economics

| Metric                | Target                  |
| --------------------- | ----------------------- |
| Free → Pro conversion | 10-15%                  |
| Monthly churn         | 5-7% (65-75% retention) |
| Average LTV           | $175-350 (6-12 months)  |
| CAC target            | < $50                   |
| LTV:CAC               | > 3:1                   |

### B2B Economics

| Metric                | Target                                     |
| --------------------- | ------------------------------------------ |
| Average contract size | $2,500-5,000/year                          |
| Seats per company     | 10-20                                      |
| Annual churn          | < 20%                                      |
| Expansion revenue     | 20%+ (add seats)                           |
| Sales cycle           | 2-4 weeks (startup), 1-3 months (mid-size) |

### Revenue Mix Target

| Timeframe | B2C | B2B |
| --------- | --- | --- |
| Month 6   | 70% | 30% |
| Month 12  | 50% | 50% |
| Month 24  | 40% | 60% |

## Cost Structure

### Variable Costs (Per User)

| Cost                             | Estimated             | Notes                    |
| -------------------------------- | --------------------- | ------------------------ |
| AI API (generation + evaluation) | $0.50-2.00/user/month | Depends on usage         |
| Code execution (Fly.io)          | $0.50-3.00/user/month | Depends on exercise type |
| Payment processing               | 2.9% + $0.30          | Stripe                   |

**Target gross margin:** 70-80%

### Fixed Costs (Monthly)

| Cost             | Estimated | Notes                 |
| ---------------- | --------- | --------------------- |
| Vercel hosting   | $20-500   | Scales with traffic   |
| Database         | $25-200   | Supabase/Neon         |
| Monitoring/tools | $50-200   | Sentry, PostHog, etc. |
| Domains/misc     | $20-50    |                       |

**Early stage fixed costs:** ~$200-500/month

### Founder Costs

| Cost                  | Recommended               |
| --------------------- | ------------------------- |
| Founder salary (each) | $80-100K/year (post-seed) |
| Total founder cost    | $160-200K/year            |

---

# Revenue Projections & Financial Model

## Assumptions

### User Growth

- Launch month: 100-200 signups
- Month 3: 500-1,000 total users
- Month 6: 2,000-4,000 total users
- Month 12: 5,000-10,000 total users

### Conversion Rates

- Free → Pro: 10-15%
- Trial → Paid: 20-30%
- B2C → B2B referral: 5% of users work at companies that buy

### Retention

- Monthly retention: 70% (conservative), 80% (optimistic)
- Annual retention: 30% (conservative), 40% (optimistic)

## Monthly Projections (Conservative)

| Month | New Users | Total Users | Paying Users | B2C MRR | B2B Seats | B2B MRR | Total MRR |
| ----- | --------- | ----------- | ------------ | ------- | --------- | ------- | --------- |
| 1     | 0         | 0           | 0            | $0      | 0         | $0      | $0        |
| 2     | 200       | 200         | 25           | $725    | 0         | $0      | $725      |
| 3     | 300       | 450         | 55           | $1,595  | 0         | $0      | $1,595    |
| 4     | 400       | 750         | 95           | $2,755  | 10        | $490    | $3,245    |
| 5     | 500       | 1,100       | 140          | $4,060  | 25        | $1,225  | $5,285    |
| 6     | 600       | 1,500       | 190          | $5,510  | 50        | $2,450  | $7,960    |
| 7     | 700       | 1,950       | 250          | $7,250  | 80        | $3,920  | $11,170   |
| 8     | 800       | 2,450       | 320          | $9,280  | 120       | $5,880  | $15,160   |
| 9     | 900       | 3,000       | 400          | $11,600 | 170       | $8,330  | $19,930   |
| 10    | 1,000     | 3,600       | 490          | $14,210 | 220       | $10,780 | $24,990   |
| 11    | 1,100     | 4,250       | 590          | $17,110 | 280       | $13,720 | $30,830   |
| 12    | 1,200     | 5,000       | 700          | $20,300 | 350       | $17,150 | $37,450   |

**Conservative Year 1:** ~$37K MRR

## Monthly Projections (Optimistic)

| Month | Total MRR | Notes            |
| ----- | --------- | ---------------- |
| 2     | $1,500    | Strong launch    |
| 3     | $3,500    | Word of mouth    |
| 4     | $6,000    | Early B2B        |
| 5     | $10,000   | Growing          |
| 6     | $18,000   | B2B accelerating |
| 7     | $25,000   |                  |
| 8     | $35,000   |                  |
| 9     | $45,000   |                  |
| 10    | $58,000   |                  |
| 11    | $72,000   |                  |
| 12    | $90,000   |                  |

**Optimistic Year 1:** ~$90K MRR

## Break-Even Analysis

### Costs at $10K MRR

| Cost                    | Amount       |
| ----------------------- | ------------ |
| AI/Execution (variable) | $1,500-2,500 |
| Infrastructure (fixed)  | $500         |
| Tools/services          | $200         |
| **Total costs**         | $2,200-3,200 |
| **Gross profit**        | $6,800-7,800 |
| **Gross margin**        | 68-78%       |

### Costs at $50K MRR

| Cost                    | Amount               |
| ----------------------- | -------------------- |
| AI/Execution (variable) | $7,500-12,500        |
| Infrastructure (fixed)  | $1,500               |
| Tools/services          | $500                 |
| Founder salaries        | $13,300 ($160K/year) |
| **Total costs**         | $22,800-27,800       |
| **Net profit**          | $22,200-27,200       |
| **Net margin**          | 44-54%               |

### Path to Profitability

- **Without salaries:** Profitable at ~$3K MRR
- **With modest salaries:** Profitable at ~$25K MRR
- **With market salaries:** Profitable at ~$40K MRR

---

# Go-to-Market Strategy

## Launch Strategy (Months 1-2)

### Pre-Launch (Week -2 to 0)

**Build waitlist:**

- Landing page with value prop
- Email capture
- "Founding member" positioning

**Seed content:**

- Build in public on Twitter
- LinkedIn posts about the problem
- Teaser screenshots/videos

**Line up distribution:**

- YC Bookface post draft
- LinkedIn post draft
- HN Show HN draft
- Warm contacts for day-1 amplification

### Launch Week

**Day 1: Soft launch**

- Post on YC Bookface
- Personal LinkedIn post
- Email waitlist
- Goal: 50-100 signups

**Day 2-3: Expand**

- Twitter thread
- Respond to comments/feedback
- Fix critical issues

**Day 4-5: Hacker News**

- Show HN post
- Be active in comments
- Goal: Front page

**Day 6-7: Iterate**

- Analyze first-week data
- Fix top issues
- Start user interviews

### Launch Goals

| Metric         | Target     |
| -------------- | ---------- |
| Week 1 signups | 200-500    |
| Week 1 paying  | 20-50      |
| Week 1 MRR     | $500-1,500 |

## Growth Channels (Months 2-6)

### Channel 1: Content Marketing / SEO

**Strategy:** Rank for "how to build X with AI" searches

**Content types:**
| Type | Example | Goal |
|------|---------|------|
| Tutorial posts | "How to Build a RAG Chatbot with Next.js" | SEO traffic |
| Comparison posts | "Vercel AI SDK vs LangChain" | Search intent |
| Listicles | "10 AI Features to Add to Your App" | Social shares |
| Deep dives | "Complete Guide to AI Embeddings" | Authority |

**Publishing cadence:** 2-3 posts/week initially

**SEO targets:**

- "learn AI development"
- "build chatbot openai"
- "RAG tutorial"
- "AI agent tutorial"
- "vercel ai sdk tutorial"

### Channel 2: Build in Public

**Platforms:** Twitter/X, LinkedIn

**Content:**
| Day | Content |
|-----|---------|
| Mon | Progress update (metrics) |
| Tue | Technical insight |
| Wed | User story/testimonial |
| Thu | Behind-the-scenes |
| Fri | Week recap + learnings |

**Goals:**

- Build founder brand
- Attract early adopters
- Create FOMO
- Investor visibility

### Channel 3: Referral Program

**Mechanic:** "Give a month, get a month"

**Flow:**

```
User shares referral link
        ↓
Friend signs up and subscribes
        ↓
Both get 1 month free
```

**Target:** 20% of new users from referrals by month 6

### Channel 4: Community

**Discord server:**

- #general: Chat
- #show-and-tell: Share completed skills
- #help: Get help
- #feature-requests: Product feedback
- #jobs: Career opportunities

**Goals:**

- Reduce churn (community = stickiness)
- Product feedback loop
- User-generated content
- Word of mouth

### Channel 5: Partnerships

**Potential partners:**
| Partner Type | Value Exchange |
|--------------|----------------|
| Bootcamps | We provide AI curriculum, they drive users |
| Newsletters | Sponsored content, affiliate |
| Influencers | Free access for promotion |
| Companies | Bulk discount for promotion |

## B2B Go-to-Market (Months 4-9)

### Identifying Targets

**Ideal B2B customer:**

- 10-50 engineers
- Building AI features
- Series A-C startup
- US or Europe
- English-speaking team

**Finding them:**

- LinkedIn Sales Navigator
- YC company directory
- AngelList
- Crunchbase
- Twitter (follow AI announcements)

### Outreach Strategy

**Warm outreach (preferred):**

- Referral from existing user
- YC network connection
- LinkedIn mutual connection

**Cold outreach (supplement):**

- Email to engineering manager
- LinkedIn DM
- Twitter DM

**Email template:**

```
Subject: Upskill your team on AI (fast)

Hi [Name],

Saw that [Company] is building AI features. How is your team ramping up on the AI stack?

We built Signa Labs to solve this. Engineers describe what they want to learn, we generate hands-on exercises, they build real code. Most teams get everyone AI-capable in 2-3 weeks.

Would you be open to a 15-min chat to see if it's a fit?

[Signature]
```

### Sales Process

| Stage         | Activities                          | Timeline  |
| ------------- | ----------------------------------- | --------- |
| Qualification | Understand team size, needs, budget | Day 1-3   |
| Demo          | Show product, discuss use case      | Day 3-7   |
| Trial         | Team pilot (5-10 users, 2 weeks)    | Day 7-21  |
| Negotiation   | Pricing, contract terms             | Day 21-28 |
| Close         | Sign contract, onboard              | Day 28-35 |

### B2B Pricing Discussion

**Starting point:** $49/seat/month

**Discounts:**

- Annual prepay: 20% discount
- 50+ seats: 15% discount
- 100+ seats: Custom pricing

**Never discount more than 30%** — preserves value perception

---

# Retention Strategy & The Duolingo Playbook

## The Retention Challenge

### Why Learning Products Have Low Retention

1. **Goal completion:** "I learned what I needed" → cancel
2. **Motivation fluctuation:** Life gets busy
3. **Perceived completion:** "I've learned enough"
4. **No switching cost:** Easy to cancel, easy to return
5. **Sporadic need:** Learning isn't daily like Slack

### Baseline Expectations

| Product Category  | Typical Monthly Retention |
| ----------------- | ------------------------- |
| Daily SaaS tools  | 95%+                      |
| Entertainment     | 90%+                      |
| Fitness apps      | 60-70%                    |
| Learning products | 50-65%                    |

**Our target:** 65-75% monthly (top quartile for learning)

## The Duolingo Playbook (Adapted)

### Mechanic 1: Streaks

**Implementation:**

```
🔥 14 day streak!
Complete 1 skill to keep it going.
Streak resets at midnight.
```

**Why it works:**

- Loss aversion (don't want to lose streak)
- Habit formation (daily trigger)
- Identity ("I'm someone who learns every day")

**Enhancements:**

- Streak freeze (1 free per week, then paid)
- Streak milestones (7, 30, 100 days)
- Streak recovery ($2.99 to restore)

### Mechanic 2: XP and Levels

**Implementation:**

```
+50 XP - Skill completed!
+10 XP - Streak maintained
+25 XP - Challenge completed

Level 12 → Level 13: 200 XP remaining
```

**Level titles:**
| Level | Title |
|-------|-------|
| 1-5 | Beginner |
| 6-10 | Apprentice |
| 11-15 | Practitioner |
| 16-20 | Expert |
| 21+ | Master |

### Mechanic 3: Leaderboards

**Implementation:**

```
This Week's Top Learners:
1. @sarah_codes    1,250 XP 🥇
2. @mike_dev       980 XP  🥈
3. @you            750 XP  🥉
4. @alex_js        720 XP
5. @dev_jones      680 XP
```

**Types:**

- Weekly (resets Sunday)
- Friends only (if connected)
- Company (for teams)
- All-time (for bragging rights)

### Mechanic 4: Badges and Achievements

**Skill badges:**

- "RAG Expert" - Complete all RAG skills
- "Agent Builder" - Complete all agent skills
- "Embedding Master" - Complete all embedding skills

**Activity badges:**

- "Early Adopter" - Joined in first month
- "Streak Champion" - 30 day streak
- "Prolific Learner" - 50 skills completed

**Display:** Profile page, shareable to LinkedIn

### Mechanic 5: Daily/Weekly Challenges

**Implementation:**

```
Today's Challenge:
Complete any skill in under 20 minutes
Reward: +100 XP bonus

Weekly Challenge:
Complete 5 skills this week
Reward: "Weekly Warrior" badge
```

### Mechanic 6: Email/Push Triggers

| Trigger                    | Email                                                   |
| -------------------------- | ------------------------------------------------------- |
| 24h before streak breaks   | "Don't lose your 14-day streak!"                        |
| New skill in interest area | "New: Build with GPT-4o Vision"                         |
| 3 days inactive            | "We added 5 new skills. Come check them out."           |
| 7 days inactive            | "Your progress is waiting. Pick up where you left off." |
| 14 days inactive           | "We miss you! Here's 1 week free to come back."         |
| Completed skill            | "Nice work! Ready for your next challenge?"             |
| Level up                   | "You hit Level 15! You're now an Expert."               |

**Email frequency cap:** Max 3 emails/week to avoid fatigue

## Retention by Segment

### B2C Retention Strategy

- Streaks (primary)
- Gamification
- New content regularly
- Email re-engagement

### B2B Retention Strategy

- Contracts (structural retention)
- Team progress dashboards
- Regular check-ins with admin
- Success metrics reporting
- Expansion conversations

**B2B retention is higher because:**

- Contracts create commitment
- Companies don't churn impulsively
- Multiple users = more engagement
- Admin has vested interest

## Content as Retention

### Always New Skills

**Cadence:** 3-5 new skills per week

**Content calendar:**
| Week | New Skills |
|------|------------|
| 1 | GPT-4o Vision, Structured Outputs, New Model X |
| 2 | Multi-modal RAG, Agent Memory, Tool Chaining |
| 3 | Streaming UI Patterns, Error Handling, Testing AI |
| 4 | Performance Optimization, Cost Reduction, Evaluation |

**Why this retains:**

- "There's always something new to learn"
- AI moves fast (content matches reality)
- Inbox notification drives return

### Personalized Recommendations

**Based on:**

- Skills completed
- Skills started but not finished
- Declared interests
- Company/role (if B2B)

**Implementation:**

```
Recommended for you:
Based on your interest in RAG, try:
→ "Multi-modal RAG with Images"
→ "RAG Evaluation and Testing"
→ "Production RAG Patterns"
```

## Measuring Retention

### Key Metrics

| Metric                | Definition                   | Target |
| --------------------- | ---------------------------- | ------ |
| D1 Retention          | % who return next day        | 40%+   |
| D7 Retention          | % who return within 7 days   | 50%+   |
| D30 Retention         | % who return within 30 days  | 40%+   |
| Monthly Retention     | % paid users retained        | 70%+   |
| Net Revenue Retention | Revenue retained + expansion | 95%+   |

### Cohort Analysis

Track retention by:

- Signup month (cohort)
- Acquisition channel
- Segment (B2C vs B2B)
- Geography
- Engagement level

---

# Technology Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Monaco    │  │  File Tree  │  │  Terminal   │  │    UI      │ │
│  │   Editor    │  │  Component  │  │  (xterm)    │  │ Components │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js Application                            │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    App Router                                   ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ ││
│  │  │   Pages     │  │    API      │  │    Server Actions       │ ││
│  │  │  (RSC)      │  │   Routes    │  │  (mutations)            │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Integrations                                 ││
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   ││
│  │  │ Clerk  │  │Drizzle │  │ Stripe │  │ AI SDK │  │Fly.io  │   ││
│  │  │ Auth   │  │  ORM   │  │Payments│  │ (LLM)  │  │  API   │   ││
│  │  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │  PostgreSQL │ │   Fly.io    │ │  Anthropic/ │
            │  (Supabase) │ │  Machines   │ │   OpenAI    │
            └─────────────┘ └─────────────┘ └─────────────┘
```

## Technology Decisions

### Frontend Stack

| Technology     | Purpose     | Why This Choice                    |
| -------------- | ----------- | ---------------------------------- |
| Next.js 16     | Framework   | Already set up, App Router, RSC    |
| React 19       | UI Library  | Latest features, already installed |
| TypeScript     | Language    | Type safety, DX                    |
| Tailwind CSS   | Styling     | Already set up, fast iteration     |
| shadcn/ui      | Components  | Already installed, customizable    |
| Monaco Editor  | Code editor | VS Code experience, full-featured  |
| react-arborist | File tree   | Flexible tree component            |
| xterm.js       | Terminal    | Standard terminal emulator         |

### Backend Stack

| Technology         | Purpose         | Why This Choice                  |
| ------------------ | --------------- | -------------------------------- |
| Next.js API Routes | HTTP endpoints  | Streaming, webhooks              |
| Server Actions     | Mutations       | Simple, type-safe                |
| Drizzle ORM        | Database access | Already set up, type-safe        |
| PostgreSQL         | Database        | Already configured (via Doppler) |
| Clerk              | Authentication  | Already installed, teams support |
| Stripe             | Payments        | Industry standard                |

### AI Stack

| Technology         | Purpose               | Why This Choice                      |
| ------------------ | --------------------- | ------------------------------------ |
| Vercel AI SDK      | LLM abstraction       | Streaming, providers, Next.js native |
| Anthropic (Claude) | Skill generation      | Best for code generation             |
| OpenAI (GPT-4)     | Backup/specific tasks | Alternative provider                 |

### Infrastructure Stack

| Technology    | Purpose            | Why This Choice              |
| ------------- | ------------------ | ---------------------------- |
| Vercel        | Hosting (frontend) | Zero config, already set up  |
| Fly.io        | Code execution     | Multi-language, fast spin-up |
| Supabase/Neon | Database hosting   | Generous free tier, Postgres |
| Doppler       | Secrets            | Already configured           |
| Sentry        | Error tracking     | Already set up               |
| PostHog       | Analytics          | Already set up               |

## Database Schema

### Core Tables

```sql
-- Users (synced from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'team'
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,

  -- Stats
  total_skills_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,

  -- Timestamps
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Teams (for B2B)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,

  -- Subscription
  subscription_tier TEXT DEFAULT 'team',
  subscription_status TEXT DEFAULT 'active',
  stripe_subscription_id TEXT,
  seat_count INTEGER DEFAULT 5,

  -- Settings
  admin_user_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team memberships
CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member'

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(team_id, user_id)
);

-- Generated skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- NULL if public/template

  -- Content
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  estimated_minutes INTEGER,

  -- Original prompt
  user_prompt TEXT NOT NULL,

  -- Generated content
  instructions TEXT NOT NULL, -- Markdown
  starter_code JSONB NOT NULL, -- { "filename": "content", ... }
  solution_code JSONB, -- { "filename": "content", ... }
  evaluation_criteria JSONB, -- ["criterion 1", "criterion 2", ...]
  hints JSONB, -- ["hint 1", "hint 2", ...]

  -- Configuration
  sandbox_template TEXT, -- 'react', 'nextjs', 'node', 'python', etc.
  dependencies JSONB, -- { "package": "version", ... }

  -- Metadata
  category TEXT, -- 'ai', 'frontend', 'backend', etc.
  tags TEXT[], -- ['rag', 'openai', 'nextjs']

  -- Status
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Stats
  times_started INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  avg_completion_time INTEGER, -- minutes

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User skill attempts
CREATE TABLE skill_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,

  -- User's code
  code JSONB NOT NULL, -- { "filename": "content", ... }

  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress',
  -- 'in_progress', 'submitted', 'passed', 'failed'

  -- Evaluation
  evaluation JSONB, -- { passed: boolean, feedback: string, criteria_results: [...] }
  score INTEGER, -- 0-100

  -- Timing
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER,

  -- Attempts
  attempt_number INTEGER DEFAULT 1,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User streaks (detailed tracking)
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  last_activity_date DATE,
  streak_start_date DATE,

  -- Streak freezes
  freezes_available INTEGER DEFAULT 1,
  freezes_used_this_week INTEGER DEFAULT 0,

  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking (for limits)
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  single_file_exercises INTEGER DEFAULT 0,
  multi_file_projects INTEGER DEFAULT 0,

  UNIQUE(user_id, period_start)
);

-- Badges/achievements
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  badge_type TEXT NOT NULL, -- 'skill', 'streak', 'achievement'
  badge_id TEXT NOT NULL, -- e.g., 'rag_expert', 'streak_30', 'early_adopter'

  earned_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, badge_id)
);

-- Leaderboard snapshots (weekly)
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  week_start DATE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  xp_earned INTEGER NOT NULL,
  rank INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(week_start, user_id)
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_skills_user ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_tags ON skills USING GIN(tags);
CREATE INDEX idx_skill_attempts_user ON skill_attempts(user_id);
CREATE INDEX idx_skill_attempts_status ON skill_attempts(status);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(user_id, period_start);
```

## API Design

### Server Actions

```typescript
// Skill generation
generateSkill(prompt: string): Promise<Skill>
saveSkillProgress(skillId: string, code: Record<string, string>): Promise<void>
submitSkillForEvaluation(skillId: string): Promise<Evaluation>

// User progress
getUserProgress(): Promise<UserProgress>
updateStreak(): Promise<Streak>
getLeaderboard(type: 'weekly' | 'alltime'): Promise<LeaderboardEntry[]>

// Teams (B2B)
createTeam(name: string): Promise<Team>
inviteToTeam(teamId: string, email: string): Promise<void>
getTeamProgress(teamId: string): Promise<TeamProgress>
```

### API Routes

```typescript
// Code execution
POST /api/execute
  Body: { code: Record<string, string>, language: string }
  Response: { output: string, error?: string }

// AI streaming
POST /api/ai/generate
  Body: { prompt: string }
  Response: StreamingTextResponse

POST /api/ai/evaluate
  Body: { skillId: string, code: Record<string, string> }
  Response: StreamingTextResponse

// Webhooks
POST /api/webhooks/stripe
POST /api/webhooks/clerk
```

## Fly.io Code Execution Architecture

### How It Works

```
User clicks "Run"
        ↓
Request to /api/execute
        ↓
API creates Fly Machine with:
  - Language-specific Docker image
  - User's code mounted
  - Execution timeout
        ↓
Machine executes code
        ↓
Output streamed back via SSE
        ↓
Machine destroyed (or kept warm for multi-file)
```

### Docker Images (Pre-built)

| Language | Image               | Includes                          |
| -------- | ------------------- | --------------------------------- |
| Node.js  | `signa/node:20`     | Node 20, npm, common packages     |
| Python   | `signa/python:3.12` | Python 3.12, pip, common packages |
| Go       | `signa/go:1.22`     | Go 1.22                           |
| Rust     | `signa/rust:1.75`   | Rust + Cargo                      |

### Execution Flow

```typescript
async function executeCode(files: Record<string, string>, language: string, entryPoint: string) {
  // 1. Create Fly Machine
  const machine = await fly.machines.create({
    config: {
      image: `registry.fly.io/signa-${language}`,
      guest: { cpus: 1, memory_mb: 512 },
      auto_destroy: true,
    },
  });

  // 2. Upload files
  await machine.upload(files);

  // 3. Execute
  const output = await machine.exec(getRunCommand(language, entryPoint));

  // 4. Return output
  return output;
}
```

### Security Considerations

| Risk              | Mitigation              |
| ----------------- | ----------------------- |
| Infinite loops    | Execution timeout (30s) |
| Memory exhaustion | Memory limit (512MB)    |
| Network abuse     | Network isolation       |
| File system abuse | Read-only except /tmp   |
| Fork bombs        | Process limits          |

---

# MVP Specification & Roadmap

## MVP Definition

### What MVP Includes

- [ ] User authentication (Clerk)
- [ ] Skill generation from prompt (AI)
- [ ] Code editor (Monaco)
- [ ] File tree (for multi-file)
- [ ] Code execution (Fly.io)
- [ ] AI evaluation
- [ ] Basic progress tracking
- [ ] Streak tracking
- [ ] Usage limits (free tier)
- [ ] Payment (Stripe, Pro tier)

### What MVP Excludes

- [ ] Team features (Phase 2)
- [ ] Leaderboards (Phase 2)
- [ ] Certificates (Phase 2)
- [ ] Custom skill paths (Phase 2)
- [ ] Community features (Phase 2)
- [ ] Enterprise features (Phase 3)

## Week-by-Week Roadmap

### Week 1: Foundation + Editor

**Goals:**

- Set up project structure
- Monaco editor working
- File tree component
- Basic layout

**Tasks:**
| Task | Priority | Estimate |
|------|----------|----------|
| Install dependencies (Monaco, AI SDK, etc.) | High | 1h |
| Create app layout (sidebar, main, terminal) | High | 4h |
| Implement Monaco editor component | High | 4h |
| Implement file tree component | High | 4h |
| Implement tab system | Medium | 2h |
| Create skill generation form | High | 3h |
| Set up database schema | High | 2h |

**Deliverable:** Can open editor, see files, edit code

### Week 2: Code Execution

**Goals:**

- Fly.io integration working
- Execute code and see output
- Terminal component

**Tasks:**
| Task | Priority | Estimate |
|------|----------|----------|
| Set up Fly.io account and API access | High | 2h |
| Create Docker images for Node.js/Python | High | 4h |
| Implement execution API route | High | 4h |
| Create terminal component (xterm) | High | 4h |
| Wire up "Run" button to execution | High | 2h |
| Handle execution errors gracefully | Medium | 2h |
| Add loading states | Medium | 1h |

**Deliverable:** Can write code, run it, see output

### Week 3: AI Generation + Evaluation

**Goals:**

- Generate skills from prompts
- Evaluate user code

**Tasks:**
| Task | Priority | Estimate |
|------|----------|----------|
| Implement skill generation prompt | High | 4h |
| Create generation API route (streaming) | High | 3h |
| Display generated instructions | High | 2h |
| Load starter code into editor | High | 2h |
| Implement evaluation prompt | High | 4h |
| Create evaluation API route | High | 3h |
| Display evaluation results | High | 2h |
| Handle hints system | Medium | 2h |

**Deliverable:** Full flow: prompt → generate → build → evaluate

### Week 4: Auth + Payments + Polish

**Goals:**

- User accounts working
- Payments working
- Basic progress tracking

**Tasks:**
| Task | Priority | Estimate |
|------|----------|----------|
| Integrate Clerk auth | High | 3h |
| Protect routes (middleware) | High | 1h |
| Sync users to database | High | 2h |
| Implement usage tracking | High | 3h |
| Set up Stripe products | High | 2h |
| Implement checkout flow | High | 4h |
| Implement webhook handling | High | 3h |
| Add streak tracking | Medium | 2h |
| Basic dashboard/progress page | Medium | 3h |
| Bug fixes and polish | High | 4h |

**Deliverable:** Full MVP ready for beta users

## Launch Checklist

### Pre-Launch

- [ ] All core features working
- [ ] 10+ test skills generated and verified
- [ ] Payments tested (Stripe test mode)
- [ ] Error tracking confirmed (Sentry)
- [ ] Analytics confirmed (PostHog)
- [ ] Security review (auth, execution)
- [ ] Performance baseline established
- [ ] Landing page ready
- [ ] Terms of Service / Privacy Policy
- [ ] Support email set up

### Launch Day

- [ ] Switch Stripe to live mode
- [ ] Monitor errors closely
- [ ] Respond to feedback quickly
- [ ] Post to distribution channels
- [ ] Track signups and conversions

### Post-Launch (Week 1)

- [ ] Daily check: errors, feedback, metrics
- [ ] Prioritize critical fixes
- [ ] Start user interviews
- [ ] Iterate based on feedback

---

# AI Strategy & Prompt Engineering

## Overview

AI is used for two critical functions:

1. **Skill Generation:** Turn user prompt into structured exercise
2. **Code Evaluation:** Assess user's code against criteria

Quality of these determines product quality.

## Skill Generation

### System Prompt

```markdown
You are an expert software engineering instructor who creates hands-on coding exercises.

Your goal is to generate a practical, focused exercise that teaches a specific skill through building.

Guidelines:

- Exercises should take 15-45 minutes to complete
- Focus on ONE concept/skill, not multiple
- Starter code should compile/run (no syntax errors)
- Use modern best practices and up-to-date syntax
- Be specific to the user's requested stack (Next.js, Python, etc.)
- Include clear success criteria
- Provide helpful hints without giving away the solution

Output format:
{
"title": "Clear, specific title",
"description": "1-2 sentence description of what they'll build",
"difficulty": "beginner|intermediate|advanced",
"estimatedMinutes": 20,
"instructions": "Markdown instructions...",
"starterCode": {
"filename.ts": "code content"
},
"solutionCode": {
"filename.ts": "complete solution"
},
"evaluationCriteria": [
"Specific, testable criterion 1",
"Specific, testable criterion 2"
],
"hints": [
"First hint (vague)",
"Second hint (more specific)",
"Third hint (almost gives it away)"
],
"dependencies": {
"package": "version"
},
"tags": ["relevant", "tags"]
}
```

### User Prompt Template

```markdown
Generate a hands-on coding exercise for:

"{user_input}"

Context:

- Preferred stack: {stack_preference or "any"}
- Difficulty preference: {difficulty or "intermediate"}
- Time available: {time or "30 minutes"}

Generate a practical exercise where the learner builds something real.
```

### Quality Checks

Before sending to user, verify:

1. Starter code parses without errors
2. Instructions reference correct file names
3. Evaluation criteria are specific and testable
4. Estimated time is realistic
5. Solution code actually works

## Code Evaluation

### System Prompt

```markdown
You are an expert code reviewer evaluating a student's solution to a coding exercise.

Exercise: {title}
Instructions: {instructions}
Evaluation Criteria: {criteria}

Student's Code:
{code}

Your task:

1. Check each evaluation criterion
2. Determine if the overall solution passes
3. Provide constructive feedback

Be encouraging but honest. Point out both what they did well and what could improve.

Output format:
{
"passed": true|false,
"score": 0-100,
"criteriaResults": [
{
"criterion": "The criterion text",
"passed": true|false,
"feedback": "Specific feedback for this criterion"
}
],
"overallFeedback": "2-3 sentences of encouragement and next steps",
"suggestions": [
"Optional suggestion for improvement"
]
}
```

### Evaluation Quality

| Challenge                         | Solution                                  |
| --------------------------------- | ----------------------------------------- |
| False positives (passes bad code) | Multiple criteria, specific checks        |
| False negatives (fails good code) | Flexible matching, alternative approaches |
| Vague feedback                    | Required specific feedback per criterion  |
| Harsh tone                        | Explicit instruction to be encouraging    |

## Prompt Iteration Process

### Version Control

Track prompt versions in database:

```sql
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL, -- 'generation', 'evaluation'
  version INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  success_rate DECIMAL, -- tracked over time
  created_at TIMESTAMP DEFAULT NOW()
);
```

### A/B Testing

For significant changes:

1. Create new prompt version
2. Route 10% of traffic to new version
3. Measure: generation quality, user completion rate, satisfaction
4. Promote winner to 100%

### Feedback Loop

Collect signals:

- User ratings on exercises
- Completion rates
- Support tickets about bad exercises
- Manual quality reviews

Use to iterate prompts.

---

# B2B Sales Playbook

## B2B Sales Strategy

### Target Profile

**Ideal Customer:**

- 10-50 engineers
- Building AI features
- Series A-C startup
- Technical decision maker accessible
- US or Europe

**Red Flags:**

- Very long sales cycles (enterprise DNA)
- Heavy procurement process
- No AI initiatives
- Price-focused only

### Finding Targets

**Sources:**
| Source | How to Use |
|--------|------------|
| YC directory | Filter by batch, sector |
| LinkedIn | Search for "VP Engineering" at AI startups |
| AngelList | Filter by stage, sector |
| Crunchbase | Recent funding, tech sector |
| Twitter | Follow AI startup announcements |
| Existing users | "Does your company need this?" |

### Outreach Templates

**Cold Email (Engineering Manager):**

```
Subject: Quick question about AI upskilling at {Company}

Hi {Name},

I noticed {Company} is building AI features. How is your team ramping up on the AI stack?

We built Signa Labs because traditional courses are too slow. Engineers describe what they want to learn, we generate hands-on exercises, they build real code.

Most teams get everyone productive in 2-3 weeks, not months.

Worth a 15-min call to see if it's a fit?

Best,
{Your name}
```

**LinkedIn Connection:**

```
Hi {Name}, I see you're leading engineering at {Company}. We help teams upskill on AI development fast — engineers learn by building, not watching videos. Would love to connect in case it's ever relevant.
```

**Follow-up (3 days later):**

```
Hi {Name}, wanted to follow up on my note about AI upskilling. Happy to share how {Similar Company} got their team productive in 2 weeks. Worth a quick chat?
```

### Sales Process

| Stage             | Goal           | Actions            |
| ----------------- | -------------- | ------------------ |
| **Prospecting**   | Build pipeline | Research, outreach |
| **Qualification** | Understand fit | Discovery call     |
| **Demo**          | Show value     | Product demo       |
| **Trial**         | Prove value    | 2-week pilot       |
| **Negotiation**   | Agree terms    | Proposal, contract |
| **Close**         | Get signed     | Contract execution |
| **Onboarding**    | Ensure success | Setup, training    |

### Discovery Questions

**Understanding Their Situation:**

- "What AI features are you building?"
- "How is your team currently learning AI development?"
- "What's worked well? What hasn't?"
- "How long does it typically take to ramp someone up?"

**Identifying Pain:**

- "What happens when you need to ship an AI feature but the team doesn't have the skills?"
- "How do you feel about the ROI on current training spend?"
- "What would it mean if you could get the team productive in weeks instead of months?"

**Qualification:**

- "Who else would be involved in this decision?"
- "What's your timeline for improving this?"
- "Do you have budget allocated for training/upskilling?"

### Demo Script

**Opening (2 min):**

- Confirm their goals for the call
- Brief overview of what you'll show

**Problem (3 min):**

- "You mentioned your team needs to learn X"
- "Traditional courses take Y weeks"
- "Our approach is different"

**Demo (10 min):**

1. Show the prompt interface
2. Generate a skill live
3. Show the IDE experience
4. Show code execution
5. Show evaluation
6. Show team dashboard (if relevant)

**ROI Discussion (5 min):**

- "If each engineer saves 10 hours per skill..."
- "At their hourly rate, that's $X saved per person"
- "For a team of 15, that's $Y per month"

**Next Steps (5 min):**

- Offer trial: "Would a 2-week pilot with 5-10 engineers make sense?"
- Agree on timeline
- Schedule follow-up

### Trial Process

**Setup:**

- Create team account
- Add 5-10 pilot users
- Assign relevant skills
- Set success criteria

**During Trial (2 weeks):**

- Check in at day 3
- Check in at day 7
- Gather feedback
- Track completion

**Post-Trial:**

- Review results vs. criteria
- Present ROI calculation
- Propose full rollout

### Pricing Negotiation

**Standard Pricing:**

- $49/seat/month
- Annual: $470/seat/year (20% discount)

**Approved Discounts:**
| Condition | Max Discount |
|-----------|--------------|
| Annual prepay | 20% |
| 50+ seats | 15% |
| 100+ seats | 25% |
| Case study participation | 10% |
| Combined max | 30% |

**Never negotiate on:**

- Pricing below 30% discount
- Custom features (roadmap, not contract)
- SLAs (not ready for this)

### Objection Handling

**"It's too expensive"**

> "I understand budget is a concern. Let's look at the ROI: if each engineer saves just 10 hours learning AI skills, at their loaded cost of $75/hour, that's $750 in savings. The tool costs $49/month. That's a 15x return."

**"We can use free resources"**

> "You absolutely could. The question is: what's the cost of your engineers' time spent searching YouTube, setting up environments, and learning inefficiently? Most teams find structured, instant exercises save 80% of the time."

**"We need to run it by [other stakeholder]"**

> "Of course. Would it help if I put together a one-pager they can review? And would it make sense for me to join a call with them to answer questions directly?"

**"We're not ready right now"**

> "Understood. What would need to happen for this to become a priority? And is it okay if I check back in [timeframe]?"

### CRM and Pipeline

Track in a simple CRM (Notion, Attio, or HubSpot free):

| Field       | Purpose           |
| ----------- | ----------------- |
| Company     | Who               |
| Contact     | Decision maker    |
| Stage       | Where in pipeline |
| Deal size   | Seats × price     |
| Next action | What to do        |
| Close date  | Expected timing   |
| Notes       | Context           |

---

# Fundraising Strategy

## Fundraising Overview

### Goals

- **Pre-seed (Optional):** $750K-$1.5M
- **Seed:** $2-5M

### Timeline Options

**Path A: Bootstrap → Seed**

```
Month 1-3:  Bootstrap to $5-10K MRR
Month 4-6:  Apply to YC with traction
Month 6-9:  Raise $2-5M seed
```

**Path B: Pre-seed → Seed**

```
Month 1:    Raise $750K-$1M pre-seed
Month 2-5:  Build, launch, get to $10K MRR
Month 6-8:  Raise $3-5M seed
```

### Recommended: Path A (Bootstrap First)

**Why:**

- Proves model before raising
- Better terms with traction
- Less dilution
- Maintains optionality

## Investor Targeting

### Tier 1: Warm Connections

| Contact            | Relationship                              | Action                  |
| ------------------ | ----------------------------------------- | ----------------------- |
| Niko Bonatsos      | $1.2M previous investment, new fund, warm | Reconnect email         |
| YC Group Partners  | Former batch                              | Ask for investor intros |
| Previous investors | From first startup                        | Update email            |
| YC alumni angels   | Network                                   | Bookface post           |

### Tier 2: Pre-Seed Funds

| Fund               | Check Size | Notes                  |
| ------------------ | ---------- | ---------------------- |
| Precursor Ventures | $500K-1.5M | Can lead               |
| Hustle Fund        | $25K-500K  | Fast, founder-friendly |
| Chapter One        | $500K-2M   | Can lead               |
| Afore Capital      | $500K-1M   | Pre-seed focused       |
| Weekend Fund       | $100K-300K | Quick decisions        |

### Tier 3: Seed Funds

| Fund             | Check Size | Notes                    |
| ---------------- | ---------- | ------------------------ |
| First Round      | $1-4M      | Brand name               |
| Initialized      | $1-3M      | YC-friendly              |
| Boldstart        | $1-3M      | Dev tools focus          |
| Craft Ventures   | $1-3M      | Likes productivity tools |
| General Catalyst | $2-5M      | Via Niko                 |

### Tier 4: Angels

| Type              | How to Find          |
| ----------------- | -------------------- |
| YC alumni         | Bookface, direct ask |
| Dev tool founders | Twitter, LinkedIn    |
| EdTech operators  | Network              |
| AI folks          | Twitter              |

## Pitch Materials

### Deck Structure (12 slides)

1. **Title:** Signa Labs - Learn AI development by building
2. **Problem:** Engineers need to learn fast; courses are slow and stale
3. **Solution:** Describe a skill, build it, learn it
4. **Demo:** Screenshots or video embed
5. **How it works:** Generation → IDE → Evaluation
6. **Market:** $30B developer education, AI skills exploding
7. **Traction:** $XK MRR, X users, X% retention
8. **Business model:** Pricing, unit economics
9. **Competition:** Why we win
10. **Team:** Two former YC founders, founder-market fit
11. **Ask:** $XM for 18-24 months
12. **Vision:** The default platform for AI skill development

### One-Pager

```
SIGNA LABS
"The Duolingo of AI development"

PROBLEM
• Engineers need to learn AI skills fast
• Courses take 20+ hours and go stale
• Passive learning doesn't stick

SOLUTION
• Describe what you want to learn
• AI generates hands-on exercises
• Build real code, get AI feedback
• Learn in 30 minutes, not 30 hours

TRACTION
• $XK MRR (X% MoM growth)
• X paying users
• X% monthly retention

BUSINESS MODEL
• B2C: $29/month (Pro)
• B2B: $49/seat/month (Team)
• Target: 80% gross margin

MARKET
• $30B developer education
• AI skills: fastest growing segment
• 5M+ engineers actively learning AI

TEAM
• [Founder 1] - Former YC, [background]
• [Founder 2] - Former YC, [background]

ASK
$XM seed for 18-24 months
• Scale product and team
• Grow to $XK MRR
• Expand B2B
```

### Key Investor Questions & Answers

**"How is this different from Codecademy?"**

> "Three key differences: First, fully personalized — you describe what you want to learn, not pick from a fixed curriculum. Second, truly hands-on — you build real code in a real IDE, not fill-in-the-blank exercises. Third, always current — AI generates with the latest info, not courses recorded a year ago."

**"What stops someone from copying this?"**

> "We're building several moats: First, quality — generating good exercises is hard and we're iterating constantly on prompts. Second, brand — we want to be the default for AI skills. Third, data — as we get usage, we improve recommendations and quality. Fourth, B2B relationships — sticky contracts and switching costs."

**"Why will people pay when YouTube is free?"**

> "Same reason people pay for Duolingo when free language resources exist. We're 10x faster — learn in 30 minutes what takes 4 hours to find and cobble together. We're hands-on — you build and get feedback, not just watch. And we're structured — clear progression, not chaos."

**"Can you reach $100M revenue?"**

> "Developer education is a $30B market. If we capture 1% of engineers learning AI skills, that's 50,000+ paying users. At $35 average revenue (B2C + B2B blend), that's $21M ARR. With B2B expansion, enterprise, and adjacent skills, $100M+ is achievable."

**"What's your unfair advantage?"**

> "Three things: First, timing — AI generation just became good enough to do this well. Second, founder-market fit — we're building what we wish existed for ourselves. Third, distribution — two former YC founders with network access and investor relationships."

## Raise Process

### Timeline (4-6 weeks)

**Week -1: Preparation**

- Finalize deck
- Build investor list (50+)
- Line up warm intros
- Prepare data room

**Week 1-2: Launch**

- Send all outreach simultaneously
- Book 15-20 first meetings
- Create urgency ("closing in 4 weeks")

**Week 3: Meetings**

- First meetings (partner or principal)
- Iterate pitch based on feedback
- Identify most interested

**Week 4: Partner Meetings**

- Partner meetings with interested funds
- Handle objections
- Request term sheets

**Week 5-6: Close**

- Negotiate terms
- Choose lead investor
- Fill round with follow-on
- Sign and wire

### Negotiation

**Standard terms for seed:**

- $2-5M raise
- $10-15M post-money cap (SAFE) or $10-15M pre-money (priced)
- Pro-rata rights for leads
- Standard YC SAFE or Series Seed docs

**What to negotiate:**

- Valuation (within reason)
- Board seat (resist if possible at seed)
- Information rights (standard is fine)

**What not to negotiate:**

- Weird control provisions
- Anti-dilution beyond standard
- Overly complex terms

---

# Risk Assessment & Mitigation

## Risk Matrix

| Risk                                | Likelihood | Impact | Mitigation                     |
| ----------------------------------- | ---------- | ------ | ------------------------------ |
| Free alternatives good enough       | Medium     | High   | 10x faster, hands-on, B2B      |
| AI generation quality poor          | Medium     | High   | Iterate prompts, human review  |
| Low retention                       | Medium     | Medium | Gamification, content, B2B     |
| Competition copies                  | Medium     | Medium | Move fast, brand, B2B          |
| Fly.io costs too high               | Low        | Medium | Optimize, cache, limits        |
| Key provider changes (OpenAI, etc.) | Low        | Medium | Multi-provider strategy        |
| Founders burn out                   | Low        | High   | Co-founder support, milestones |

## Detailed Risk Analysis

### Risk 1: Free Alternatives Are Good Enough

**The risk:** Engineers decide YouTube + ChatGPT + docs is sufficient and won't pay $29/month.

**Likelihood:** Medium (30-40%)

**Signals to watch:**

- Low conversion from free trial
- Churn interviews cite "can learn free elsewhere"
- Low engagement with paid features

**Mitigation strategies:**

1. **10x better experience:** Make time savings undeniable
2. **Hands-on differentiation:** Emphasize building vs. watching
3. **B2B hedge:** Companies pay for structure and tracking
4. **Social proof:** Testimonials showing before/after time savings

### Risk 2: AI Generation Quality

**The risk:** Generated exercises are buggy, confusing, or not useful.

**Likelihood:** Medium (40-50% in early days)

**Signals to watch:**

- Low completion rates
- Support tickets about broken exercises
- Low ratings on generated content

**Mitigation strategies:**

1. **Prompt iteration:** Constant improvement based on feedback
2. **Quality checks:** Automated validation before serving
3. **User ratings:** Flag and review low-rated content
4. **Fallback library:** Pre-tested exercises for common topics

### Risk 3: Low Retention

**The risk:** Users learn what they need and churn quickly.

**Likelihood:** Medium-High (50-60%)

**Signals to watch:**

- Monthly retention below 60%
- Short average subscription length
- Low repeat usage

**Mitigation strategies:**

1. **Gamification:** Streaks, XP, badges
2. **New content:** Constant stream of new skills
3. **Community:** Discord, forums
4. **B2B contracts:** Structural retention
5. **Habit design:** Daily practice nudges

### Risk 4: Competition Copies

**The risk:** Well-funded competitor launches similar product.

**Likelihood:** Medium (30-40%)

**Signals to watch:**

- Codecademy/Educative announce AI features
- New startup with funding in space
- Big tech (Google, Microsoft) enters

**Mitigation strategies:**

1. **Move fast:** Establish position before competition
2. **Build brand:** Become synonymous with AI skill learning
3. **B2B stickiness:** Long-term contracts
4. **Community moat:** Network of learners
5. **Quality edge:** Best exercises through iteration

### Risk 5: Technical/Cost Issues

**The risk:** Fly.io costs spiral, or technical issues with execution.

**Likelihood:** Low (20%)

**Signals to watch:**

- Unit economics getting worse
- Frequent execution failures
- User complaints about speed

**Mitigation strategies:**

1. **Cost monitoring:** Track per-execution costs closely
2. **Caching:** Cache common executions
3. **Limits:** Usage limits per tier
4. **Alternative providers:** Keep options open (AWS, GCP)

## Scenario Planning

### Scenario A: Everything Goes Well (20% probability)

- Launch successful, strong word of mouth
- $20K+ MRR by month 4
- B2B interest inbound
- Easy fundraise

**Response:** Pour fuel on fire, raise quickly, hire

### Scenario B: Moderate Success (50% probability)

- Launch okay, some traction
- $5-10K MRR by month 4
- Need to hustle for B2B
- Fundable with effort

**Response:** Focus on what's working, iterate, be patient

### Scenario C: Struggling (25% probability)

- Launch weak, low conversion
- $1-3K MRR by month 4
- Can't figure out what's wrong
- Fundraising will be hard

**Response:** Deep user research, consider pivots, extend runway

### Scenario D: Failure (5% probability)

- Product doesn't work
- No one pays
- Clear signal market doesn't exist

**Response:** Pivot significantly or shut down

---

# Metrics, KPIs & Decision Framework

## North Star Metric

**Weekly Active Learners (WAL)**

Definition: Users who complete at least one skill exercise in a given week

Why this metric:

- Measures actual value delivery (completion, not just signup)
- Weekly frequency matches learning behavior
- Leading indicator of retention and revenue

## Primary KPIs

### Growth Metrics

| Metric                 | Definition                                     | Target           |
| ---------------------- | ---------------------------------------------- | ---------------- |
| WAL                    | Weekly active learners                         | Growing 10%+ WoW |
| New signups            | New registrations per week                     | Growing          |
| Activation rate        | % signups who complete 1 skill in first 7 days | 40%+             |
| Free → Paid conversion | % free users who become paid                   | 10-15%           |

### Engagement Metrics

| Metric                    | Definition                 | Target   |
| ------------------------- | -------------------------- | -------- |
| Skills completed per user | Average completions        | 3+/month |
| Session duration          | Time in app per session    | 20+ min  |
| Return rate               | % who return within 7 days | 50%+     |
| Streak length             | Average active streak      | 7+ days  |

### Revenue Metrics

| Metric  | Definition                | Target           |
| ------- | ------------------------- | ---------------- |
| MRR     | Monthly recurring revenue | Growing 15%+ MoM |
| ARPU    | Average revenue per user  | $25-35           |
| LTV     | Lifetime value            | $150+            |
| CAC     | Customer acquisition cost | <$50             |
| LTV:CAC | Ratio                     | >3:1             |

### Retention Metrics

| Metric            | Definition                              | Target |
| ----------------- | --------------------------------------- | ------ |
| D1 retention      | % return day after signup               | 40%+   |
| D7 retention      | % return within 7 days                  | 50%+   |
| D30 retention     | % return within 30 days                 | 40%+   |
| Monthly retention | % paid users retained                   | 70%+   |
| NRR               | Net revenue retention (incl. expansion) | 95%+   |

### Quality Metrics

| Metric                   | Definition                      | Target   |
| ------------------------ | ------------------------------- | -------- |
| Exercise completion rate | % started exercises completed   | 70%+     |
| Evaluation accuracy      | % evaluations correct (sampled) | 90%+     |
| User satisfaction        | Post-exercise rating            | 4.0+/5.0 |
| NPS                      | Net promoter score              | 40+      |

## Decision Framework

### When to Double Down

Invest more resources when:

- Monthly retention > 75%
- Free → Paid conversion > 15%
- NPS > 50
- Strong qualitative feedback
- Organic growth visible

### When to Iterate

Change approach when:

- Monthly retention 50-70%
- Conversion 5-15%
- NPS 20-40
- Mixed feedback
- Growth stalling

### When to Pivot

Consider major change when:

- Monthly retention < 50%
- Conversion < 5%
- NPS < 20
- Consistent negative feedback
- No growth for 2+ months

### Product vs. Market Signals

**Product problem signals:**

- Users try it but don't complete
- Specific complaints about features
- Power users exist but are rare
- "Would use if you fixed X"

**Market problem signals:**

- Users don't engage at all
- Vague feedback ("nice but...")
- No word of mouth
- "I wouldn't pay for this"

---

# Team & Hiring Plan

## Founding Team

### Founder 1: [Name]

- Role: CEO / Technical
- Background: Former YC founder, software engineer
- Responsibilities: Product, engineering, fundraising

### Founder 2: [Sister's Name]

- Role: COO / Growth
- Background: Former YC founder, marketing/growth
- Responsibilities: Marketing, sales, operations

### Founder-Market Fit

Both founders are the target customer. They've experienced the pain of learning new tech skills quickly and would use this product themselves.

## Hiring Plan

### Phase 1: Just Founders (Months 1-4)

| Role            | Who       | Notes               |
| --------------- | --------- | ------------------- |
| Product/Eng     | Founder 1 | Build MVP           |
| Marketing/Sales | Founder 2 | Launch, early sales |

### Phase 2: First Hires (Months 5-8, post-seed)

| Role                | When    | Priority                  |
| ------------------- | ------- | ------------------------- |
| Full-stack engineer | Month 5 | High — ship faster        |
| Content/Curriculum  | Month 6 | Medium — exercise quality |

### Phase 3: Scale Team (Months 9-12)

| Role             | When     | Priority             |
| ---------------- | -------- | -------------------- |
| Second engineer  | Month 9  | High — more capacity |
| Sales (B2B)      | Month 9  | High — B2B growth    |
| Designer         | Month 10 | Medium — polish      |
| Customer success | Month 11 | Medium — retention   |

### Hiring Principles

1. **Stay small:** Only hire when painful not to
2. **Generalists first:** Specialists later
3. **Culture fit:** Builders who move fast
4. **Remote-friendly:** Access to global talent
5. **Equity-heavy:** Conserve cash early

## Compensation Philosophy

### Pre-Seed / Seed Stage

| Level                 | Cash        | Equity     |
| --------------------- | ----------- | ---------- |
| Early engineer (#1-2) | $100-140K   | 0.5-1.5%   |
| Early hire (non-eng)  | $80-120K    | 0.25-0.75% |
| Contractors           | Market rate | None       |

### Founder Compensation

Pre-seed: Minimal or none
Post-seed: $80-100K (below market, sustainable)

---

# Content & Marketing Strategy

## Content Strategy

### Content Pillars

1. **Tutorial content:** "How to build X with AI"
2. **Comparison content:** "X vs Y for AI development"
3. **Thought leadership:** "The future of AI development"
4. **Product content:** "How to learn X with Signa Labs"

### Content Calendar (Weekly)

| Day | Content                      | Channel           |
| --- | ---------------------------- | ----------------- |
| Mon | Tutorial blog post           | Blog, Twitter     |
| Tue | Build in public update       | Twitter, LinkedIn |
| Wed | Short-form tip               | Twitter           |
| Thu | Product update or user story | LinkedIn          |
| Fri | Week recap                   | Newsletter        |

### SEO Targets

**Primary keywords:**

- "learn AI development"
- "AI coding tutorial"
- "RAG tutorial"
- "OpenAI API tutorial"
- "build AI app"

**Long-tail keywords:**

- "how to build chatbot with OpenAI"
- "RAG implementation Next.js"
- "AI agent tutorial Python"
- "Vercel AI SDK guide"

### Content Distribution

| Channel     | Content Type           | Frequency        |
| ----------- | ---------------------- | ---------------- |
| Blog        | Long-form tutorials    | 2-3/week         |
| Twitter     | Tips, updates, threads | Daily            |
| LinkedIn    | Professional content   | 2-3/week         |
| YouTube     | Tutorial videos        | 1-2/week (later) |
| Newsletter  | Curated weekly digest  | Weekly           |
| Hacker News | Major announcements    | As needed        |

## Marketing Channels

### Organic Channels

| Channel       | Strategy             | Timeline |
| ------------- | -------------------- | -------- |
| SEO/Blog      | Content marketing    | Ongoing  |
| Twitter       | Build in public      | Ongoing  |
| LinkedIn      | Professional network | Ongoing  |
| YouTube       | Tutorial videos      | Month 3+ |
| Word of mouth | Referral program     | Month 2+ |
| Community     | Discord, forums      | Month 2+ |

### Paid Channels (Later)

| Channel      | When      | Budget                |
| ------------ | --------- | --------------------- |
| Google Ads   | After PMF | Test with $1K         |
| Twitter Ads  | After PMF | Test with $500        |
| LinkedIn Ads | For B2B   | Test with $1K         |
| Sponsorships | After PMF | Newsletters, podcasts |

---

# Operations & Infrastructure

## Operational Processes

### Daily

- Monitor error rates (Sentry)
- Check key metrics (PostHog)
- Respond to support requests
- Deploy fixes if needed

### Weekly

- Review metrics dashboard
- User feedback synthesis
- Planning for next week
- Content publishing

### Monthly

- Investor update (if raised)
- Financial review
- Strategy review
- Metrics deep dive

## Support

### Support Channels

- Email: support@signalabs.dev
- Discord: #help channel
- In-app: Chat widget (later)

### Response Time Targets

| Channel       | Target                     |
| ------------- | -------------------------- |
| Email         | < 24 hours                 |
| Discord       | < 4 hours (business hours) |
| Critical bugs | < 2 hours                  |

### Common Issues Playbook

| Issue                 | Response                 |
| --------------------- | ------------------------ |
| Exercise doesn't work | Regenerate or manual fix |
| Payment issue         | Stripe dashboard         |
| Account access        | Clerk dashboard          |
| Execution failure     | Check Fly.io logs        |

## Infrastructure Monitoring

### Monitoring Stack

- **Errors:** Sentry (already set up)
- **Analytics:** PostHog (already set up)
- **Uptime:** Better Uptime or similar
- **Logs:** Vercel logs, Fly.io logs

### Alerts

| Condition                    | Action       |
| ---------------------------- | ------------ |
| Error rate > 5%              | Page on-call |
| Execution failure rate > 10% | Alert Slack  |
| Payment webhook failures     | Alert email  |

---

# Founder Advantages & Assets

## Team Strengths

### Former YC Founders

- Credibility with investors
- Access to YC network
- Experience building startups
- Fundraising knowledge

### Siblings as Co-founders

- High trust relationship
- Complementary skills
- Long-term commitment
- Efficient communication

### Founder-Market Fit

- Would use the product themselves
- Understand the pain deeply
- Credibility with users

## Network Assets

| Asset                 | Value                   | How to Use                 |
| --------------------- | ----------------------- | -------------------------- |
| Niko Bonatsos         | Warm investor, new fund | Reconnect, seek investment |
| YC Bookface           | Distribution channel    | Launch, intros             |
| Black at YC           | Community support       | Intros, advice             |
| NYC YC founders       | Local network           | Meetups, intros            |
| Contract work clients | Seen execution          | References, users          |

## Distribution Advantages

| Channel     | Access            |
| ----------- | ----------------- |
| YC Bookface | Direct posting    |
| LinkedIn    | Personal networks |
| Twitter     | Growing presence  |
| Hacker News | YC credibility    |

---

# Decision Log

Track key decisions for future reference.

| Date     | Decision                           | Rationale                                 | Outcome |
| -------- | ---------------------------------- | ----------------------------------------- | ------- |
| Feb 2026 | Niche: AI fullstack development    | Hot market, clear demand, our expertise   | TBD     |
| Feb 2026 | Pricing: $29/mo Pro, $49/seat Team | Balance value and accessibility           | TBD     |
| Feb 2026 | Tech: Fly.io for all execution     | One system vs. Judge0 + Fly.io complexity | TBD     |
| Feb 2026 | Strategy: Bootstrap to seed        | Prove model before raising                | TBD     |
| Feb 2026 | Retention: Duolingo playbook       | Proven model for learning retention       | TBD     |

---

# Open Questions & Future Exploration

## Product Questions

- What's the right balance of AI-generated vs. curated exercises?
- How do we handle exercises that need external APIs (OpenAI keys)?
- Should we support collaborative learning?
- How do we handle mobile users?

## Market Questions

- What's the actual conversion rate from free to paid?
- How price-sensitive is the market?
- What features do B2B customers actually need?
- Which adjacent niches (backend, DevOps) should we expand to?

## Technical Questions

- Can we reduce execution costs with caching?
- How do we handle very long-running exercises?
- What's the scaling limit of the current architecture?

## Strategic Questions

- Should we pursue YC or raise independently?
- When should we hire first employee?
- Should we expand internationally?
- What partnerships should we pursue?

---

# Appendices

## Appendix A: Competitor Deep Dives

[Detailed analysis of each major competitor]

## Appendix B: User Interview Script

**Opening:**

- Tell me about your current role
- What technologies do you work with?

**Learning behavior:**

- How do you typically learn new skills?
- When was the last time you needed to learn something new?
- How long did it take? How did it go?

**Pain points:**

- What's frustrating about learning new tech skills?
- What have you tried that didn't work?
- What do you wish existed?

**Solution validation:**

- [Describe product] — what's your reaction?
- Would you use something like this?
- Would you pay for it? How much?
- What would make you not use it?

**Closing:**

- Anything else I should know?
- Can I follow up with you later?

## Appendix C: Technical Specifications

[Detailed technical specs for each component]

## Appendix D: Legal Considerations

- Terms of Service requirements
- Privacy Policy requirements
- GDPR considerations
- Code execution liability

## Appendix E: Key Metrics Dashboard

[Template for metrics tracking]

---

_Document Version: 1.0_
_Created: February 2026_
_Last Updated: February 2026_

---

**"Describe a skill. Build it. Learn it."**
