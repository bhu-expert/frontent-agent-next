# Meta App Review - Test Instructions

**App Name:** plugandplayagents  
**Submission Date:** March 17, 2026  
**Contact:** support@plugandplayagents.com

---

## Quick Start for Meta Reviewers

### Test Credentials

**Option 1: Use Provided Test Account**
- **Email:** reviewer-test@plugandplayagents.com
- **Password:** [Will be provided separately via secure channel]

**Option 2: Use Your Facebook Account**
- Our app is in Development Mode
- Add your Facebook account as a **Test User** in App Review → Roles → Test Users
- Or switch app to Live Mode after approval

### Access Instructions

1. **Navigate to App:** https://your-production-url.com
2. **Sign Up/Login:** Create account or use test credentials
3. **Go to Integrations:** Click "Integrations" in dashboard sidebar
4. **Connect Facebook:** Click "Connect with Facebook" button

---

## Permissions Requested & Justification

### 1. pages_show_list
**Why We Need It:**
- Display list of Facebook Pages the user manages
- Allow user to select which Page to connect to plugandplayagents

**How We Use It:**
1. User clicks "Connect with Facebook"
2. We fetch Pages they admin
3. Show Pages in connection dialog
4. User selects Page to connect

**Test Steps:**
1. Login with Facebook account that manages a Page
2. Click "Connect with Facebook"
3. See list of Pages
4. Select a Page

---

### 2. pages_read_engagement
**Why We Need It:**
- Read Page engagement metrics (likes, comments, shares)
- Show post performance analytics
- Understand which content performs best

**How We Use It:**
1. After connecting Page
2. Fetch engagement data for published posts
3. Display analytics in dashboard
4. Help users optimize content strategy

**Test Steps:**
1. Connect Facebook Page
2. Publish a post
3. View analytics in dashboard
4. See engagement metrics

---

### 3. pages_manage_posts ⭐ **Critical for Publishing**
**Why We Need It:**
- **Publish posts to Facebook Pages**
- Schedule content for future publishing
- Create text, image, and carousel posts
- This is the core functionality of our app

**How We Use It:**
1. User creates post in plugandplayagents
2. Adds content (text, images)
3. Selects connected Facebook Page
4. Clicks "Publish" or "Schedule"
5. We publish to Facebook Page via API

**Test Steps:**
1. Connect Facebook Page
2. Go to "Content" tab
3. Click "Create Post"
4. Add text and/or images
5. Select Facebook Page
6. Click "Publish"
7. Verify post appears on Facebook Page

---

### 4. instagram_basic
**Why We Need It:**
- Access Instagram Business account info
- Display connected Instagram account
- Verify account type (Business/Creator)

**How We Use It:**
1. When Facebook is connected
2. Check for linked Instagram Business account
3. Display Instagram connection status
4. Show Instagram account name

**Test Steps:**
1. Ensure Instagram Business is linked to Facebook Page
2. Connect Facebook in plugandplayagents
3. See Instagram card show "Connected"
4. View Instagram account name

---

### 5. instagram_content_publish ⭐ **Critical for Instagram Publishing**
**Why We Need It:**
- **Publish content to Instagram**
- Create Reels, carousels, and single image posts
- Schedule Instagram content
- This is essential for Instagram publishing feature

**How We Use It:**
1. User creates Instagram post in plugandplayagents
2. Adds media (images/video)
3. Writes caption
4. Selects Instagram account
5. Clicks "Publish to Instagram"
6. We publish via Instagram Graph API

**Test Steps:**
1. Connect Facebook Page with linked Instagram
2. Go to "Content" tab
3. Create Instagram post (Reel or carousel)
4. Add media and caption
5. Select Instagram account
6. Click "Publish"
7. Verify post appears on Instagram

---

### 6. pages_read_user_metadata
**Why We Need It:**
- Access Page settings and configuration
- Verify Page permissions
- Get Page profile information

**How We Use It:**
1. During Page connection
2. Fetch Page profile data
3. Verify user has admin access
4. Store Page configuration

**Test Steps:**
1. Connect Facebook Page
2. See Page name and info displayed
3. Verify correct Page is shown

---

## Feature Demonstration

### Facebook Publishing Flow

```
1. User logs in to plugandplayagents
   ↓
2. Goes to Integrations tab
   ↓
3. Clicks "Connect with Facebook"
   ↓
4. Facebook OAuth popup appears
   ↓
5. User grants permissions (pages_show_list, pages_manage_posts, etc.)
   ↓
6. User selects Facebook Page
   ↓
7. Page shows as "Connected"
   ↓
8. User goes to Content tab
   ↓
9. Creates new post with text/images
   ↓
10. Selects connected Facebook Page
    ↓
11. Clicks "Publish"
    ↓
12. Post published to Facebook Page ✅
```

### Instagram Publishing Flow

```
1. User ensures Instagram Business is linked to Facebook Page
   (Facebook Page Settings → Instagram → Connect Account)
   ↓
2. User connects Facebook in plugandplayagents
   ↓
3. Instagram auto-detects and shows "Connected"
   ↓
4. User creates Instagram content (Reel/carousel)
   ↓
5. Adds media, caption, hashtags
   ↓
6. Selects Instagram account
   ↓
7. Clicks "Publish to Instagram"
   ↓
8. Content published to Instagram ✅
```

---

## Compliance Checklist

### ✅ Data Use Check

- [x] We only request permissions necessary for app functionality
- [x] We use data solely to provide social media management services
- [x] We do not sell or transfer user data to third parties
- [x] We do not use data for advertising or ad targeting
- [x] We delete user data within 30 days of account deletion

### ✅ User Control

- [x] Users can connect Facebook/Instagram voluntarily
- [x] Users can disconnect at any time via Integrations tab
- [x] Users can delete account entirely via Settings
- [x] Clear consent obtained via OAuth dialog

### ✅ Privacy & Terms

- [x] Privacy Policy: https://your-domain.com/privacy
- [x] Terms of Service: https://your-domain.com/terms
- [x] Account Deletion: https://your-domain.com/settings/delete-account
- [x] GDPR compliant
- [x] CCPA compliant

### ✅ Security

- [x] OAuth 2.0 for authentication
- [x] Encrypted data storage
- [x] Secure token handling
- [x] No sensitive data in client-side code

---

## Video Demo (Optional)

We have prepared a screen recording demonstrating:
1. Facebook connection flow
2. Creating and publishing a Facebook post
3. Instagram connection
4. Publishing to Instagram

**Video Link:** [Will be provided if requested]

---

## Additional Notes for Reviewers

### App Status
- Currently in **Development Mode**
- Only test users can connect Facebook
- Switching to Live Mode after approval

### Data Retention
- Facebook access tokens: Stored securely, refreshed automatically
- Page data: Cached for 5 minutes to improve performance
- Published posts: Metadata stored indefinitely for analytics
- User data: Deleted within 30 days of account deletion

### Third-Party Services
- **Hosting:** [Your hosting provider]
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + Facebook OAuth
- **Analytics:** [Your analytics provider if any]

---

## Contact Information

**For Review Questions:**
- Email: support@plugandplayagents.com
- Developer: [Your Name]
- Response Time: Within 24 hours

**Meta Platform Issues:**
- Contact via Meta Developer Support
- Reference App ID: [Your App ID]

---

## Thank You

Thank you for reviewing our app. We're committed to providing a safe and valuable social media management platform while respecting user privacy and following Meta's Platform Terms.

If you need any additional information or clarification, please don't hesitate to reach out.

**plugandplayagents Team**
support@plugandplayagents.com

---

**Document Version:** 1.0  
**Last Updated:** March 17, 2026
