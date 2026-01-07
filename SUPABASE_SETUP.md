# Supabase Setup for Decision Jar

For **Squad Mode** (Real-time features) to work, you need to connect the app to a Supabase project.

## 1. Create Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Name it "Decision Jar".
4. Set a strong database password.

## 2. Get Keys (Environment Variables)
1. In your project dashboard, go to **Settings** (Gear Icon) -> **API**.
2. Find **Project URL** and **anon public** key.
3. Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key..."
```

## 3. Realtime Configuration
**Good news:** For the generic "Squad Mode" (Spinning Synchronization), **you do NOT need to enable any specific database settings.**

We are using **Broadcast Channels**, which are lightweight messages sent between users (client-to-client) without writing to the database. These are enabled by default for all new Supabase projects.

### (Optional) If you want to sync Database Changes later:
If we later add features that listen to *database updates* (like instantly seeing a new Idea pop up without refreshing):
1. Go to **Database** -> **Replication** in the sidebar.
2. Toggle the **Source** switch for the `supabase_realtime` publication.
3. Handle tables individually if needed.

**For now, just step 1 and 2 are required!**
