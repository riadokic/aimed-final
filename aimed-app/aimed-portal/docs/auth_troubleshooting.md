# Google OAuth Troubleshooting — AIMED

## Prerequisites Checklist

### 1. Google Cloud Console

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
- [ ] Create an **OAuth 2.0 Client ID** (Web application type)
- [ ] Set **Authorized JavaScript Origins**:
  - `http://localhost:3000` (development)
  - `https://your-production-domain.com` (production)
- [ ] Set **Authorized Redirect URIs**:
  - `https://ljtxybwihzyxocxzsizx.supabase.co/auth/v1/callback`
  - (This is the Supabase auth callback, NOT your app's `/auth/callback`)
- [ ] Copy the **Client ID** and **Client Secret**

### 2. Supabase Dashboard

- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ljtxybwihzyxocxzsizx/auth/providers)
- [ ] Under **Authentication > Providers > Google**:
  - [ ] Toggle **Enable Google provider** to ON
  - [ ] Paste **Client ID** from Google Console
  - [ ] Paste **Client Secret** from Google Console
  - [ ] Leave "Authorized Client IDs" empty (or add for mobile apps)
- [ ] Under **Authentication > URL Configuration**:
  - [ ] **Site URL**: `http://localhost:3000` (or production URL)
  - [ ] **Redirect URLs**: Add:
    - `http://localhost:3000/auth/callback`
    - `https://your-production-domain.com/auth/callback`

### 3. Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://ljtxybwihzyxocxzsizx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Common Issues

### "redirect_uri_mismatch" Error
**Cause**: The redirect URI in Google Console doesn't match what Supabase sends.
**Fix**: The redirect URI in Google Console must be:
```
https://ljtxybwihzyxocxzsizx.supabase.co/auth/v1/callback
```
NOT your app's `/auth/callback` — that's where Supabase redirects *after* the OAuth exchange.

### "Invalid client" Error
**Cause**: Client ID or Secret is wrong in Supabase dashboard.
**Fix**: Re-copy both values from Google Cloud Console. Make sure there are no leading/trailing spaces.

### Redirect loop after Google sign-in
**Cause**: The app's `/auth/callback` route isn't exchanging the code for a session.
**Fix**: Verify `src/app/auth/callback/route.ts` calls `supabase.auth.exchangeCodeForSession(code)`.

### Google sign-in opens but nothing happens after consent
**Cause**: Supabase URL Configuration > Redirect URLs is missing your app's callback.
**Fix**: Add `http://localhost:3000/auth/callback` to the Redirect URLs list in Supabase.

### "Email not confirmed" after Google sign-in
**Cause**: Google OAuth users should be auto-confirmed. If not:
**Fix**: In Supabase Dashboard > Authentication > Settings, check "Confirm email" toggle. Google users bypass this, but if it's causing issues, check the Supabase auth logs.

### User signs in via Google but profile is empty
**Cause**: Google returns the user's name in `raw_user_meta_data.name` (not `full_name`).
**Fix**: The `handle_new_user` trigger already handles this with `COALESCE(... ->> 'full_name', ... ->> 'name', '')`.

---

## Testing Flow

1. **Email/Password Registration**:
   - Go to `/registracija`
   - Fill in: Ime i prezime, Specijalnost, Klinika, Email, Password
   - Check email for confirmation link
   - Click link → should redirect to `/login`
   - Login → should see GDPR consent modal → accept → dashboard

2. **Google OAuth**:
   - Go to `/login` or `/registracija`
   - Click "Prijavi se putem Google-a"
   - Google consent screen appears
   - After consent → redirects to `/auth/callback` → exchanges code → redirects to `/`
   - GDPR consent modal appears → accept → dashboard

3. **Profile Data Verification**:
   ```sql
   SELECT p.full_name, p.specialization, p.clinic_name, u.email
   FROM profiles p
   JOIN auth.users u ON u.id = p.id;
   ```

4. **RLS Verification**:
   - Each user should only see their own profile and settings
   - Test by creating two users and verifying isolation

---

## Supabase Auth Logs

Check live auth logs in the Supabase Dashboard:
**Project > Logs > Auth** or use MCP:
```
get_logs(project_id, service: "auth")
```
