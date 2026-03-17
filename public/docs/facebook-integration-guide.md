# Facebook Integration Guide

This guide explains how to connect Facebook and Instagram to PostGini for content publishing and management.

## Overview

PostGini uses Facebook's OAuth 2.0 authentication to connect both Facebook Pages and Instagram Business accounts. When you connect via Facebook, you authenticate with your **personal Facebook account**, then select which Facebook Pages to manage.

---

## Connecting Facebook

### Step 1: Initiate Connection

1. Navigate to **Dashboard → Integrations**
2. Click **"Connect with Facebook"** on the Meta (Facebook) card
3. You'll be redirected to Facebook's authorization page

### Step 2: Authenticate with Personal Account

1. Log in with your **personal Facebook account** credentials
2. Review the permissions requested by PostGini:
   - `pages_show_list` - View your Facebook Pages
   - `pages_read_engagement` - Read Page content and engagement
   - `pages_manage_posts` - Create and manage Page posts
   - `instagram_basic` - Access connected Instagram accounts
   - `instagram_content_publish` - Publish to Instagram

3. Click **"Continue"** to authorize

### Step 3: Select Facebook Pages

1. After authorization, you'll see a list of Facebook Pages you manage
2. Select the Page(s) you want to connect to PostGini
3. Click **"Done"** to complete the connection

### Step 4: Connection Confirmed

- The Facebook card will show **"Connected"** status
- You can now publish posts to your selected Facebook Pages
- Connected Pages are available for content scheduling

---

## Connecting Instagram

### Prerequisites

Before connecting Instagram, ensure:

- ✅ You have a **Facebook Page** already connected to PostGini
- ✅ Your Instagram account is set to **Business** or **Creator** (not Personal)
- ✅ Your Instagram Business account is **linked to your Facebook Page**

### How to Link Instagram to Facebook Page

If your Instagram isn't linked yet:

1. Open the **Facebook app** or go to facebook.com
2. Go to your **Facebook Page**
3. Click **"Settings"** → **"Instagram"**
4. Click **"Connect Account"**
5. Log in with your Instagram Business credentials
6. Confirm the connection

### Step 1: Connect via Facebook

1. In PostGini, ensure your Facebook Page is already connected
2. The Instagram card will show **"Connect Facebook First"** until Facebook is linked
3. Once Facebook is connected, Instagram connection happens automatically for linked Business accounts

### Step 2: Verify Connection

- The Instagram card will show **"Connected"** status
- You can now publish:
  - **Reels** (auto-publish enabled)
  - **Carousel posts** (auto-publish enabled)
  - **Single image posts**

---

## Important Notes

### Personal vs. Business Accounts

| Account Type | Facebook | Instagram |
|-------------|----------|-----------|
| **Personal** | ✅ Used for authentication | ❌ Not supported |
| **Business/Creator** | N/A (Page is business) | ✅ Required for integration |

**Key Point:** You authenticate with your personal Facebook account, but you connect to **Facebook Pages** (business entities) and **Instagram Business accounts**.

### Instagram Account Requirements

- **Personal Instagram accounts** cannot be connected directly
- Convert to Business/Creator: Instagram Settings → Account → Switch to Professional Account
- Business accounts must be linked to a Facebook Page

### Facebook Page Permissions

You must be an **Admin**, **Editor**, or have content management permissions on the Facebook Page to connect it.

---

## Troubleshooting

### "No Pages Available"

- Ensure you're an admin or editor of at least one Facebook Page
- Try disconnecting and reconnecting Facebook
- Check that you granted `pages_show_list` permission

### Instagram Not Showing After Facebook Connection

- Verify Instagram is a **Business or Creator** account
- Confirm Instagram is linked to your Facebook Page (Facebook Page Settings → Instagram)
- Try refreshing the Integrations page

### Connection Failed

- Clear browser cache and cookies
- Ensure pop-ups aren't blocked for Facebook
- Check that your Facebook account isn't restricted
- Verify you have a stable internet connection

### "Permission Denied" Error

- Re-authorize PostGini in Facebook Settings → Apps and Websites
- Ensure all required permissions are granted during OAuth flow

---

## Security & Privacy

- PostGini only accesses Pages and accounts you explicitly select
- Access tokens are stored securely and encrypted
- You can revoke access anytime:
  - In PostGini: Dashboard → Integrations → Disconnect
  - In Facebook: Settings → Apps and Websites → Remove PostGini

---

## API & Technical Details

### OAuth Flow

1. User clicks "Connect with Facebook"
2. Redirect to Facebook OAuth 2.0 endpoint
3. User authenticates and grants permissions
4. Facebook redirects back with authorization code
5. PostGini exchanges code for access token
6. Token stored securely for API calls

### Token Management

- Access tokens are automatically refreshed
- Long-lived tokens valid for 60 days
- Automatic re-authentication before expiry

---

## Need Help?

- **Documentation**: Check the [PostGini Documentation](/docs)
- **Support**: Contact support@postgini.com
- **Status**: Check system status at status.postgini.com

---

**Last Updated:** March 17, 2026
