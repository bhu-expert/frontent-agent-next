# Meta Integration - UI Location Guide

## Where to Find Each Feature

### 1. **Integrations Tab** (Main Location)

**URL:** `/dashboard?tab=integrations`

**How to Access:**

1. Login to your app
2. Go to Dashboard
3. Click **"Integrations"** in the left sidebar

---

### 2. **Connect Facebook Button**

**Location:** Integrations Tab → Meta (Facebook) Card

```
┌─────────────────────────────────────────────┐
│  Integrations                               │
│                                             │
│  Connected Platforms                        │
│  ┌─────────────────────────────────────┐   │
│  │  [f] Meta (Facebook)                │   │
│  │                                     │   │
│  │  Connect your Facebook Page to      │   │
│  │  publish and track posts.           │   │
│  │                                     │   │
│  │  ┌──────────────────────────────┐  │   │
│  │  │  Connect with Facebook       │  │   │
│  │  └──────────────────────────────┘  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

### 3. **Connected State Display**

**Shows After:** Successfully connecting Facebook and selecting a Page

**Location:** Same Meta Card

```
┌─────────────────────────────────────────────┐
│  [f] Meta (Facebook)                        │
│                                             │
│  ✓ Connected Page: My Business Page        │
│  📷 Instagram: my_business                  │
│                                             │
│  ┌──────────────┐ ┌──────────────┐        │
│  │ Change Page  │ │ Disconnect   │        │
│  └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────┘
```

**What You See:**

- ✅ Green badge showing "Connected Page: [Page Name]"
- 📷 Instagram account name (if linked)
- "Change Page" button - to switch to different Page
- "Disconnect" button - to remove connection

---

### 4. **Page Selector Modal**

**Shows:** Automatically after Facebook OAuth, or when clicking "Change Page"

**Location:** Overlay modal on top of Integrations Tab

```
┌─────────────────────────────────────────────────┐
│                                                 │
│    ┌───────────────────────────────────────┐   │
│    │  Select Facebook Page                 │   │
│    │                                       │   │
│    │  Choose which Facebook Page you want │   │
│    │  to connect to plugandplayagents              │   │
│    │                                       │   │
│    │  ┌─────────────────────────────────┐ │   │
│    │  │ [M] My Business Page      Connect│ │   │
│    │  └─────────────────────────────────┘ │   │
│    │  ┌─────────────────────────────────┐ │   │
│    │  │ [O] Other Page           Connect│ │   │
│    │  │ 📷 Instagram: other_insta       │ │   │
│    │  └─────────────────────────────────┘ │   │
│    │                                       │   │
│    │                    [Cancel]           │   │
│    └───────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 5. **Instagram Card**

**Location:** Integrations Tab → Right of Facebook Card

```
┌─────────────────────────────────────────────┐
│  [📷] Instagram                             │
│                                             │
│  ✓ Connected - my_business                  │
│                                             │
│  Link Instagram Business to auto-publish   │
│  Reels and Carousels. Requires Facebook    │
│  connection.                                │
│                                             │
│  ┌──────────────────────────────┐          │
│  │  Configure Instagram         │          │
│  └──────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

**Before Facebook Connection:**

```
┌─────────────────────────────────────────────┐
│  [📷] Instagram                             │
│                                             │
│  ⚠ Requires Facebook                        │
│                                             │
│  ┌──────────────────────────────┐          │
│  │  Connect Facebook First      │ (disabled)│
│  └──────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

---

### 6. **Info Note (Top of Integrations Tab)**

**Location:** Above the platform cards

```
┌─────────────────────────────────────────────┐
│ ℹ️  Connecting via Personal Account         │
│                                             │
│ When connecting Facebook, you'll           │
│ authenticate with your personal Facebook   │
│ account. After authorization, you can      │
│ select which Facebook Pages to connect.    │
│ For Instagram, you'll need an Instagram    │
│ Business account linked to your Facebook   │
│ Page. Learn more                           │
└─────────────────────────────────────────────┘
```

---

### 7. **Toast Notifications**

**Location:** Bottom-right corner of screen

**After Connecting Facebook:**

```
┌────────────────────────────────┐
│ ✓ Facebook Connected           │
│ Your Facebook account has been │
│ successfully connected.        │
└────────────────────────────────┘
```

**After Selecting Page:**

```
┌────────────────────────────────┐
│ ✓ Page Connected               │
│ My Business Page has been      │
│ connected successfully.        │
│                                │
│ 📷 Instagram Connected         │
│ Instagram account my_business  │
│ is also connected.             │
└────────────────────────────────┘
```

---

## Complete User Journey

### Step 1: Navigate to Integrations

```
Dashboard → Sidebar → Click "Integrations"
```

### Step 2: See Available Platforms

```
┌─────────────────────────────────────────────┐
│  Integrations                               │
│                                             │
│  Connected Platforms                        │
│  ┌──────────────┐ ┌──────────────┐        │
│  │ [f] Facebook │ │ [📷] Instagram│        │
│  │ Not Connected│ │ Requires FB   │        │
│  └──────────────┘ └──────────────┘        │
│                                             │
│  Coming Soon                                │
│  [TikTok] [LinkedIn] [X/Twitter]           │
└─────────────────────────────────────────────┘
```

### Step 3: Click "Connect with Facebook"

→ Redirects to Facebook OAuth

### Step 4: Grant Permissions

→ Facebook shows permission dialog

### Step 5: Page Selector Modal Appears

→ Choose which Page to connect

### Step 6: Connected State Shows

```
┌──────────────┐ ┌──────────────┐
│ ✓ Connected  │ │ ✓ Connected  │
│ My Page      │ │ my_insta     │
└──────────────┘ └──────────────┘
```

---

## API Endpoints (Behind the Scenes)

These run in the background when you interact with the UI:

| Action                  | API Endpoint                              |
| ----------------------- | ----------------------------------------- |
| Check connection status | `GET /api/integrations/meta/status`       |
| Select a Page           | `POST /api/integrations/meta/select-page` |
| Publish content         | `POST /api/integrations/meta/publish`     |
| Disconnect              | `POST /api/integrations/meta/disconnect`  |
| OAuth callback          | `GET /api/integrations/meta/callback`     |

---

## Testing the UI

1. **Start the dev server:**

   ```bash
   cd frontent-agent-next
   npm run dev
   ```

2. **Open browser:** `http://localhost:3000`

3. **Login** with your account

4. **Go to Dashboard** → **Integrations**

5. **Click "Connect with Facebook"**

6. **Follow OAuth flow**

7. **Select a Page** from the modal

8. **See connected state** with Page name

---

## Screenshots Locations

| Feature                | File Location                                     |
| ---------------------- | ------------------------------------------------- |
| Integrations Tab       | `src/components/dashboard/IntegrationsTab.tsx`    |
| Page Selector Modal    | `src/components/dashboard/PageSelectorModal.tsx`  |
| OAuth Callback Handler | `src/app/api/integrations/meta/callback/route.ts` |
| Connection Status API  | `src/app/api/integrations/meta/status/route.ts`   |
| Publishing API         | `src/app/api/integrations/meta/publish/route.ts`  |

---

**Last Updated:** March 17, 2026
