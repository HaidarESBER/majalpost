# Majal Post (مجال بوست)

## What This Is

A Lebanese digital media platform focusing on environmental, social, and economic issues through a serious yet modern lens. An independent Arabic news website with a custom admin panel for a team of editors to publish articles, videos, and multimedia content — targeting Lebanese citizens who want quality journalism beyond political noise.

## Core Value

Environment-focused journalism with a beautiful RTL reading experience that makes complex issues accessible to Lebanese readers.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Public Website (Next.js Frontend)**
- [ ] RTL Arabic layout with professional typography (Almarai/IBM Plex Sans Arabic)
- [ ] Responsive design optimized for mobile (social media traffic)
- [ ] Homepage with visual-first layout: large featured images, video posts section
- [ ] Category pages with color-coded themes:
  - البيئة والمناخ (Environment) — Emerald Green — with sub-categories: ثروة طبيعية, زراعة وأرض, طاقة واستدامة
  - شؤون الناس (Society) — Violet
  - اقتصاد ومعيشة (Economy) — Navy Blue
  - تربية وتعليم (Education) — Sky Blue
  - تكنولوجيا وابتكار (Tech) — Teal
  - صحة وحياة (Health) — Coral/Soft Red
- [ ] Article pages with:
  - Dynamic tag system (#بيروت, #استدامة, etc.)
  - Social sharing buttons (WhatsApp, X, Facebook)
  - Related articles (automatic by tags + manual editor selection)
- [ ] Full-text search across articles
- [ ] About Us page (عن مجال بوست) with vision/mission
- [ ] Contact Us page (تواصل معنا) with form:
  - Full name, email, message type (inquiry/suggestion/collaboration)
  - Message body with file attachment capability
  - Submissions stored in admin + email notifications sent
- [ ] Sticky header with navigation
- [ ] Footer with social links (Facebook, Instagram) and "Contribute with Us" button
- [ ] SEO optimization for Arabic/Lebanese search results

**Admin Panel (Custom Dashboard)**
- [ ] Authentication system with role-based access (Admin, Editor, Contributor)
- [ ] Article management: create, edit, publish, unpublish, delete
- [ ] Rich text editor for Arabic content
- [ ] Media library for images (local server storage)
- [ ] Video management: YouTube/Vimeo embeds + self-hosted video uploads
- [ ] Category and tag management
- [ ] Contact form submissions viewer
- [ ] Analytics dashboard: article views, popular content, visitor stats

**Backend (Node/Express)**
- [ ] RESTful API for all frontend operations
- [ ] MongoDB database for articles, users, categories, tags, media
- [ ] File upload handling for media and contact form attachments
- [ ] Email service integration for contact form notifications
- [ ] Google Analytics integration

### Out of Scope

- User comments/discussion system — focus on content publishing first
- Newsletter/email subscription system — can add in v2
- Monetization features (ads, paywalls, donations) — not needed initially
- Multi-language support — Arabic only for now
- Mobile apps — web-only, responsive design sufficient

## Context

**Target Audience**: Lebanese citizens seeking independent journalism on environmental, social, and economic issues — away from political noise.

**Primary Focus**: Environment and climate (البيئة والمناخ) is the platform's flagship category and should have prominent placement.

**Traffic Source**: Primarily social media (Facebook, Instagram, WhatsApp shares) — mobile optimization is critical.

**Team**: Multiple editors with different roles will manage content.

**Visual Identity**:
- Circular pixelated logo (placeholder for now, will be provided later)
- Color palette: Neutral whites/light grays background, category colors from logo (Purple, Red, Green, Blue)
- Typography: Professional Arabic Sans-serif fonts

**Social Presence**:
- Facebook: https://www.facebook.com/share/1CC9zdNJCc/?mibextid=wwXIfr
- Instagram: https://www.instagram.com/majalpost?igsh=MThkN3RlMDA0eWt1cg==

**Contact Emails**:
- General: info@majalpost.com
- Contributions: contribute@majalpost.com
- Feedback: feedback@majalpost.com

## Constraints

- **Tech Stack**: Next.js (frontend) + Node/Express (backend) + MongoDB (database)
- **Language**: Arabic (RTL) with English admin interface acceptable
- **Media Storage**: Local server storage (no cloud services)
- **Hosting**: No specific provider requirement

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom admin panel over CMS | Full control over editor workflow and Arabic content handling | — Pending |
| MongoDB over relational DB | Flexible schema for varied content types and tags | — Pending |
| Local media storage | Simplicity and cost control for initial launch | — Pending |
| Role-based access | Team of editors with different permission levels | — Pending |

---
*Last updated: 2026-01-17 after initialization*
