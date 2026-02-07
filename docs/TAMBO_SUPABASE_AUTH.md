# Tambo + Supabase authentication

This app uses [Supabase Auth](https://supabase.com/docs/guides/auth) and passes the Supabase JWT to [Tambo](https://docs.tambo.co/concepts/user-authentication) so each user has isolated threads and messages.

## 1. Supabase (dashboard & env)

### Create a project
- Go to [database.new](https://database.new) and create a Supabase project (or use an existing one).

### Enable Auth
- In the Supabase dashboard: **Authentication** → **Providers**. Enable **Email** (and optionally **Google** or other OAuth providers).
- For email sign-up you may want to configure **Authentication** → **Email Templates** and **Redirect URLs** (see below).

### Redirect URLs
- **Authentication** → **URL Configuration** → **Redirect URLs**: add your app URLs, e.g.:
  - `http://localhost:3000/auth/callback` (development)
  - `https://yourdomain.com/auth/callback` (production)

### Env vars
In `.env.local` add (from **Project Settings** → **API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Use the **anon** (public) key, not the service role key.

---

## 2. Tambo (dashboard) — required to avoid 403

From [Tambo’s user authentication docs](https://docs.tambo.co/concepts/user-authentication) and [Supabase guide](https://docs.tambo.co/guides/add-authentication/supabase):

### Disable JWT verification for Supabase
Supabase uses **symmetric** JWT signing (HMAC), not asymmetric. Tambo’s verification expects asymmetric tokens, so you must turn verification off when using Supabase:

- In the **Tambo dashboard**: **Settings** → **User Authentication** → **Verification strategy** → set to **None**.

This is safe because Supabase has already authenticated the user; Tambo only needs to identify them via the token exchange.

---

## 3. App flow

- **Landing** (`/`): public.
- **Login** (`/login`): email/password sign in and sign up; redirects to `?next=` (default `/chat`) after success.
- **Chat** (`/chat`): protected; requires a Supabase session. Session `access_token` is passed to `TamboProvider` as `userToken` so Tambo can associate threads with the user.
- **Auth callback** (`/auth/callback`): handles the OAuth code exchange (e.g. for social logins) and redirects to `?next=` or `/chat`.

---

## Troubleshooting

### 403 Forbidden after login on `/chat`
The request is coming from the Tambo client (threads/messages). Tambo returns 403 when it cannot accept your Supabase JWT.

**Fix:** In the **Tambo dashboard**, go to **Settings** → **User Authentication** and set **Verification strategy** to **None**. Supabase JWTs are symmetrically signed; Tambo’s default verification is for asymmetric (OIDC) tokens, so the token is rejected until verification is disabled.

After changing to **None**, sign out and sign back in (or refresh the session), then try `/chat` again.

---

## 4. Google (and other OAuth) login

The app includes a **Sign in with Google** button on `/login`. To enable it:

### Google Cloud (credentials)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
3. If prompted, configure the **OAuth consent screen** (External user type is fine; add your app name and support email).
4. Application type: **Web application**.
5. Under **Authorized redirect URIs** add:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - You find the exact URL in Supabase: **Authentication** → **Providers** → **Google** → “Callback URL (for OAuth)”.
6. Copy the **Client ID** and **Client secret**.

### Supabase (Google provider)

1. **Authentication** → **Providers** → **Google** → enable.
2. Paste **Client ID** and **Client secret** from Google Cloud.
3. Save.

### Redirect URLs

Ensure your app’s callback is allowed in Supabase:

- **Authentication** → **URL Configuration** → **Redirect URLs**: include `http://localhost:3000/auth/callback` and `https://yourdomain.com/auth/callback` (or your production URL).

After that, **Sign in with Google** on the login page will redirect to Google and then back to the app; the existing `/auth/callback` route exchanges the code and redirects to `/chat` (or the `next` query param).
