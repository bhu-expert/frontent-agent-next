# Meta (Facebook/Instagram) Integration Setup Guide

## Overview

This guide explains how to configure Facebook and Instagram publishing permissions for plugandplayagents.

## Prerequisites

- Facebook Developer Account
- Facebook App created at https://developers.facebook.com/apps/
- Facebook Page that you admin
- Instagram Business account linked to your Facebook Page

---

## Step 1: Configure Facebook App

### 1.1 Add Facebook Login Product

1. Go to https://developers.facebook.com/apps/
2. Select your app (or create new one)
3. Click **"Add Product"**
4. Find **"Facebook Login"** and click **"Set Up"**

### 1.2 Configure OAuth Settings

1. In the left sidebar, go to **Facebook Login → Settings**
2. Add these **Valid OAuth Redirect URIs**:

```
https://cjkovzjojvcjborahmgr.supabase.co/auth/v1/callback
https://your-production-domain.com/api/integrations/meta/callback
https://localhost:3000/api/integrations/meta/callback  (for development)
```

3. Enable **"Embedded Browser OAuth"** if needed
4. Click **Save Changes**

### 1.3 Configure App Domain

1. Go to **Settings → Basic**
2. Add your domain to **App Domains**:
   ```
   your-domain.com
   localhost (for development)
   ```
3. Add your **Privacy Policy URL**: `https://your-domain.com/privacy`
4. Add your **Terms of Service URL**: `https://your-domain.com/terms`
5. Click **Save Changes**

---

## Step 2: Request Required Permissions

### 2.1 Submit for App Review

Go to **App Review → Permissions and Features** and request these permissions:

#### Core Permissions (Required)

| Permission              | Status             | Purpose                             |
| ----------------------- | ------------------ | ----------------------------------- |
| `public_profile`        | ✅ Auto-approved   | Basic profile info                  |
| `email`                 | ✅ Auto-approved   | User email                          |
| `pages_show_list`       | ⏳ Review required | List Pages user manages             |
| `pages_read_engagement` | ⏳ Review required | Read Page engagement metrics        |
| `pages_manage_posts`    | ⏳ Review required | **Publish posts to Facebook Pages** |

#### Instagram Permissions (Required for Instagram Publishing)

| Permission                  | Status             | Purpose                           |
| --------------------------- | ------------------ | --------------------------------- |
| `instagram_basic`           | ⏳ Review required | Access Instagram Business account |
| `instagram_content_publish` | ⏳ Review required | **Publish to Instagram**          |
| `pages_read_user_metadata`  | ⏳ Review required | Access Page configuration         |

### 2.2 How to Request Each Permission

1. Go to **App Review → Permissions and Features**
2. Click **"Request Advanced Access"** for each permission
3. For each permission, provide:
   - **Use Case Description**: Explain how your app uses this permission
   - **Screen Recording**: Show the permission being used in your app
   - **Step-by-Step Instructions**: How reviewers can test

### 2.3 Sample Use Case Descriptions

**For `pages_manage_posts`:**

```
plugandplayagents is a social media management platform that allows businesses to schedule
and publish content to their Facebook Pages. Users can create posts, add images,
write captions, and schedule them for future publishing. This permission is required
to publish content on behalf of the user to their connected Facebook Pages.

Test Instructions:
1. Log in with a Facebook account that administers a Page
2. Click "Connect with Facebook" in the Integrations tab
3. Select the Facebook Page to connect
4. Create a post in the Content tab
5. Click "Publish" to publish to the connected Page
```

**For `instagram_content_publish`:**

```
plugandplayagents allows businesses to publish content to their Instagram Business accounts.
Users can create Reels, carousel posts, and single image posts directly from our
platform. This permission is required to publish content to connected Instagram
Business accounts.

Test Instructions:
1. Ensure Instagram Business account is linked to Facebook Page
2. Connect Facebook in the Integrations tab
3. Instagram will auto-connect if linked to the Page
4. Create Instagram content in the Content tab
5. Publish to Instagram
```

---

## Step 3: Configure Supabase

### 3.1 Enable Facebook Provider in Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication → Providers**
4. Enable **Facebook**
5. Enter your credentials:
   - **App ID**: From Facebook App Dashboard
   - **App Secret**: From Facebook App Dashboard
6. Add redirect URL:
   ```
   https://cjkovzzjojvcjborahmgr.supabase.co/auth/v1/callback
   ```
7. Click **Save**

### 3.2 Get Facebook App Credentials

From Facebook App Dashboard:

1. Go to **Settings → Basic**
2. Copy **App ID**
3. Click **Show** next to App Secret and copy it
4. Paste both into Supabase Facebook provider settings

---

## Step 4: Test the Integration

### 4.1 Development Mode Testing

1. Keep your app in **Development Mode** (App Review → App Modes)
2. Add test users in **App Review → Roles → Test Users**
3. Test with your Facebook account (automatically has access)

### 4.2 Test Facebook Connection

1. Go to your app's Integrations tab
2. Click **"Connect with Facebook"**
3. Log in with your Facebook account
4. Grant requested permissions
5. Select a Facebook Page
6. Verify connection shows as "Connected - [Page Name]"

### 4.3 Test Publishing

1. Go to Content tab
2. Create a new post
3. Select your connected Facebook Page
4. Add content and click **Publish**
5. Verify post appears on your Facebook Page

### 4.4 Test Instagram Publishing

1. Ensure Instagram Business account is linked to Facebook Page
   - Go to Facebook Page → Settings → Instagram
   - Click **Connect Account**
   - Log in with Instagram Business credentials
2. In plugandplayagents, connect Facebook (Instagram auto-connects)
3. Create Instagram content
4. Publish and verify on Instagram

---

## Step 5: Go Live (Production)

### 5.1 Complete App Review

1. Submit all required permissions for review
2. Provide detailed use cases and screen recordings
3. Wait for Meta approval (typically 3-10 business days)

### 5.2 Switch to Live Mode

1. Go to **App Review → App Modes**
2. Switch from **"In Development"** to **"Live"**
3. All Facebook users can now connect (not just test users)

### 5.3 Update Production URLs

Update your Facebook App settings:

- **Valid OAuth Redirect URIs**: Add production URL
- **App Domains**: Add production domain
- **Privacy Policy URL**: Production URL
- **Terms of Service URL**: Production URL

---

## Troubleshooting

### Error: "Invalid OAuth Redirect URI"

- Ensure redirect URI in Supabase matches exactly what's in Facebook App
- Check for trailing slashes or http vs https

### Error: "Permission Not Approved"

- App is in Development Mode - only test users can connect
- Submit permission for review in App Review

### Error: "Instagram Account Not Connected"

- Ensure Instagram is Business/Creator account
- Link Instagram to Facebook Page first
- Re-connect Facebook after linking

### Error: "Cannot Publish to Page"

- Verify user has Admin or Editor role on Page
- Re-authorize Facebook connection
- Check Page permissions in Facebook

---

## Required for Meta App Review

When submitting for review, ensure you have:

✅ Privacy Policy published (yours is at `/privacy`)  
✅ Account deletion functionality (yours is at `/settings/delete-account`)  
✅ Clear use case descriptions for each permission  
✅ Screen recordings showing permission usage  
✅ Test instructions for Meta reviewers  
✅ Terms of Service page

---

## Support

- **Meta Developer Documentation**: https://developers.facebook.com/docs/
- **Facebook Login Guide**: https://developers.facebook.com/docs/facebook-login/
- **Instagram Graph API**: https://developers.facebook.com/docs/instagram-api/
- **Supabase OAuth Docs**: https://supabase.com/docs/guides/auth/social-login

---

**Last Updated:** March 17, 2026
