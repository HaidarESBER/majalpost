# Roadmap: Majal Post

## Overview

Build a Lebanese digital media platform from the ground up: starting with project infrastructure and authentication, then building the content management system with media handling, followed by the public-facing Arabic RTL frontend, and finishing with search functionality and analytics. Each phase delivers a working, testable increment.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Project setup with Next.js, Express, MongoDB
- [ ] **Phase 2: Authentication** - User system with role-based access
- [ ] **Phase 3: Content System** - Articles, categories, tags, rich text editor
- [ ] **Phase 4: Media Management** - Image uploads, video embeds, local storage
- [ ] **Phase 5: Public Frontend** - RTL layout, homepage, category & article pages
- [ ] **Phase 6: Static Pages & Contact** - About, Contact form with email notifications
- [ ] **Phase 7: Search & Analytics** - Full-text search and analytics dashboard

## Phase Details

### Phase 1: Foundation
**Goal**: Initialize Next.js frontend, Express backend, MongoDB connection, and project structure
**Depends on**: Nothing (first phase)
**Research**: Unlikely (standard project setup with established patterns)
**Plans**: 3 plans

Plans:
- [x] 01-01: Initialize Next.js frontend with RTL support and Arabic typography
- [x] 01-02: Initialize Express backend with MongoDB connection
- [ ] 01-03: Create shared types and API client setup

### Phase 2: Authentication
**Goal**: User registration, login, and role-based access control (Admin, Editor, Contributor)
**Depends on**: Phase 1
**Research**: Likely (new authentication system)
**Research topics**: JWT vs session strategy for Express, role-based middleware patterns, secure password handling
**Plans**: 3 plans

Plans:
- [ ] 02-01: User model and registration/login API endpoints
- [ ] 02-02: JWT authentication middleware and protected routes
- [ ] 02-03: Role-based access control and admin user seeding

### Phase 3: Content System
**Goal**: Full article management with categories, tags, and Arabic rich text editor
**Depends on**: Phase 2
**Research**: Unlikely (MongoDB CRUD operations, established patterns)
**Plans**: 4 plans

Plans:
- [ ] 03-01: Category and tag models with CRUD APIs
- [ ] 03-02: Article model with full CRUD operations
- [ ] 03-03: Rich text editor integration for Arabic content
- [ ] 03-04: Related articles logic (automatic by tags + manual selection)

### Phase 4: Media Management
**Goal**: Image uploads, video embeds (YouTube/Vimeo), and self-hosted video support
**Depends on**: Phase 3
**Research**: Likely (file upload handling patterns)
**Research topics**: Multer configuration for large files, video embed sanitization, thumbnail generation
**Plans**: 3 plans

Plans:
- [ ] 04-01: Image upload API with local storage and thumbnail generation
- [ ] 04-02: Media library with browsing and selection
- [ ] 04-03: Video management (embed URLs + self-hosted uploads)

### Phase 5: Public Frontend
**Goal**: Complete public-facing website with RTL Arabic layout, homepage, and article pages
**Depends on**: Phase 4
**Research**: Unlikely (Next.js patterns, internal frontend work)
**Plans**: 5 plans

Plans:
- [ ] 05-01: Layout components (sticky header, footer, navigation)
- [ ] 05-02: Homepage with featured articles and video posts section
- [ ] 05-03: Category pages with color-coded themes
- [ ] 05-04: Article pages with tags, social sharing, related articles
- [ ] 05-05: SEO optimization with meta tags for Arabic content

### Phase 6: Static Pages & Contact
**Goal**: About Us page, Contact form with file attachments and email notifications
**Depends on**: Phase 5
**Research**: Likely (email service integration)
**Research topics**: Nodemailer configuration, email templates, file attachment handling in forms
**Plans**: 3 plans

Plans:
- [ ] 06-01: About Us page with vision/mission content
- [ ] 06-02: Contact form with file attachment capability
- [ ] 06-03: Email notification service and admin submission viewer

### Phase 7: Search & Analytics
**Goal**: Full-text search across articles and analytics dashboard for editors
**Depends on**: Phase 6
**Research**: Likely (search implementation)
**Research topics**: MongoDB text search vs Atlas Search, view counting strategies, analytics aggregation
**Plans**: 3 plans

Plans:
- [ ] 07-01: Full-text search API and frontend search interface
- [ ] 07-02: Article view tracking and popular content metrics
- [ ] 07-03: Analytics dashboard in admin panel

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/3 | In progress | - |
| 2. Authentication | 0/3 | Not started | - |
| 3. Content System | 0/4 | Not started | - |
| 4. Media Management | 0/3 | Not started | - |
| 5. Public Frontend | 0/5 | Not started | - |
| 6. Static Pages & Contact | 0/3 | Not started | - |
| 7. Search & Analytics | 0/3 | Not started | - |
