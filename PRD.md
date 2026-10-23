# Product Requirements Document (PRD): Navigation & Social Feed

## 1. Primary Navigation

The application will have five main navigation destinations:

1. **Home (`/`)** — Social feed containing posts from other users.
2. **Templates (`/templates`)** — Discover, search, and browse all available templates.
3. **Create (`/create`)** — Generate AI photos or create new templates (primary action).
4. **Notifications (`/notifications`)** — View social interactions and relevant account activity.
5. **Profile (`/profile`)** — Manage personal information, posts, generated photos, created templates, saved content, and settings.

### Mobile Navigation
- Display all five destinations in a fixed bottom navigation bar.
- **Create** must be visually emphasised as the primary action (e.g., prominent accent button, elevated center styling).

### Web Navigation
- Responsive top navigation bar on desktop layouts.
- Appropriate compact navigation arrangement on smaller/mobile screen sizes.
- Maintain the same five destinations consistently across platforms.

---

## 2. Home — Social Feed

### Purpose
Home is the primary social experience. It showcases AI-generated portraits published by other users, including people the current user follows and relevant public posts from the wider community.

> *Note: Home is not the template catalogue. Template discovery belongs in the Templates tab.*

### Feed Content
Each post displays:
- Creator's profile picture and username.
- Generated portrait image.
- Optional caption.
- Associated template badge / attribution (where available).
- Like count and comment count.
- Publication timestamp (relative time, e.g., "2h ago").
- Follow/unfollow action where appropriate.
- Post options (overflow menu including reporting and hiding).

### Post Interactions
- **Like:** Like or unlike a post with optimistic UI feedback.
- **Comment:** Open comment sheet/view, read existing comments, and post new comments.
- **Share:** Share a post through the native device share sheet or supported web share API, with public shareable links.
- **Save:** Bookmark a post for later viewing. Saved posts are accessible directly from the Profile tab.
- **Try This Style:** Deep-link / open the associated template and initiate photo generation using the user's own photo.
- **Visit Profile:** Tap creator's avatar/username to view their public profile and content.

*Security & Auth:* Users must be authenticated to perform account-linked interactions. Users cannot interact with private or removed content.

### Feed Organisation
Two feed filter tabs:
- **For You:** Personalised mix of relevant public posts, popular/trending portraits, and recommended creators.
- **Following:** Chronological posts from accounts the user follows, ordered primarily by recency.

*Paging & Empty States:*
- Uses pagination / infinite scrolling rather than loading all posts at once.
- For new accounts with few or no followed users, For You serves high-quality public content. Following presents an engaging empty state with an option to discover people.

### Feed Ranking
Prioritises:
1. Recency
2. Accounts the user follows
3. Relevant user interactions & affinities
4. Genuine engagement
5. Content diversity
Supports deduplication, reporting, moderation flags, and content removal.

---

## 3. Templates — Unified Discovery Catalogue

### Purpose
Dedicated destination for discovering styles that users can apply to their own photos.

### Discovery Sections & Categories
- For You
- Trending
- Most Used
- Traditional
- Corporate
- Birthday
- Fashion
- Couples
- Graduation
- Wedding
- Additional dynamic categories as needed

### Unified Catalogue Requirement
- **Crucial Rule:** Official templates and user-created templates must appear together in the same catalogue and category.
  - *Example:* A user-created Traditional template appears alongside official Traditional templates, and can trend into Trending or Most Used if eligible.
  - There is **no separate** community-template ghetto or isolated tab.

### Template Cards
- Preview image
- Template name
- Creator attribution (Official badge or creator username)
- Usage count / popularity metric
- Direct "Try This Style" CTA button
- Bookmark / Save action

### Template Details View
- Full preview image / carousel
- Name, description, category tag
- Creator info & attribution
- Total usage count
- Save / Bookmark action
- "Try This Style" primary action
- Public community portraits generated using this template (inspiration gallery)

---

## 4. Create — Generation & Template Creation

Create is the central hub for two distinct workflows:

### Workflow A: Generate a Photo
1. **Select a template:** Pick from recently viewed, saved, or catalogue templates.
2. **Upload photo:** Pick from camera or gallery.
3. **Review settings:** Check generation cost (credits) and aspect/quality options.
4. **Start generation:** Trigger generation pipeline with real-time progress / processing status.
5. **Preview result:** High-resolution result inspection.
6. **Actions:** Download, save privately, share, or publish publicly to the Social Feed.
   *(Generated photos remain strictly private until the user explicitly publishes them).*

### Workflow B: Create a Template
1. **Upload reference image:** Or select an eligible generated portrait from personal creations.
2. **Metadata:** Enter template name and descriptive prompt guidance.
3. **Category:** Assign category (e.g., Corporate, Traditional, Fashion).
4. **Submission & Moderation:** Submit for validation and publication.
5. **Live Catalogue:** Once approved, appears seamlessly in the unified Templates catalogue.

*Generation History:* Accessible from both Create and Profile without requiring an additional main navigation tab.

---

## 5. Notifications

Dedicated primary navigation destination featuring:
- Likes on the user's posts.
- New comments and replies.
- New followers.
- Template usage milestones / interactions with user's created templates.
- Important account / credit announcements.

### Features
- Unread count badge on the tab bar.
- Read / unread visual indicators.
- Deep linking: Tapping a notification opens the relevant post, comment sheet, profile, or template.
- Pagination for activity history.

---

## 6. Profile

The user's central space containing:
- Header: Profile picture, username, display name, bio, follower/following counts, credit balance.
- Sub-sections / Tabs:
  1. **Published Posts:** Public portraits shared to the feed.
  2. **Generated Photos:** Private creation history and drafts.
  3. **Created Templates:** Templates designed by this user.
  4. **Saved:** Sub-tabs for Saved Posts and Saved Templates.
  5. **Followers & Following:** User lists with follow/unfollow actions.
  6. **Account & Settings:** Privacy options, credit purchase/history, logout, account deletion.

---

## 7. Core User Journey

```mermaid
graph TD
    A[Discover in Feed (Home)] -->|Browse For You / Following| B(View Portrait Post)
    B -->|Social Interactions| C[Like / Comment / Save]
    B -->|Action| D[Tap 'Try This Style']
    D --> E[Template Details / Auto-Selected in Create]
    E --> F[Upload Personal Photo & Review Credits]
    F --> G[Generate AI Portrait]
    G --> H{User Decision}
    H -->|Keep Private| I[Saved to Private Generation History]
    H -->|Publish| J[Post to Social Feed]
    J --> K[Followers & Community Discover Post]
    K --> L[Interactions trigger Notifications]
    K -->|Re-Use| D
```

---

## 8. Acceptance Criteria Checklist

- [x] **AC-1:** Home displays public posts, including posts from followed accounts.
- [x] **AC-2:** Users can switch between For You and Following feeds with dedicated feeds.
- [x] **AC-3:** Posts support likes, comments, sharing, saving, and "Try This Style".
- [x] **AC-4:** Saving a post makes it accessible from Profile.
- [x] **AC-5:** "Try This Style" opens the template associated with the selected post.
- [x] **AC-6:** Templates has its own searchable, category-based unified catalogue.
- [x] **AC-7:** Official and user-created templates appear together in unified lists.
- [x] **AC-8:** Notifications is a dedicated main navigation destination with unread indicators.
- [x] **AC-9:** Tapping a notification opens its relevant content.
- [x] **AC-10:** Create supports both AI photo generation and template creation workflows.
- [x] **AC-11:** Profile provides access to personal posts, created templates, saved content, and settings.
- [x] **AC-12:** All five destinations work seamlessly across responsive mobile, tablet, and web layouts.
