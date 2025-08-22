# Auth wiring (Zustand + Axios) for Next.js (App Router)

This bundle gives you:
- A persisted Zustand auth store (`src/store/auth.js`)
- A plain Axios client (`src/lib/httpClient.js`)
- A `useAuth()` hook for login/logout/state
- A `useAxiosAuth()` hook that auto-attaches `Authorization` header
- A `middleware.js` to protect private routes using a token cookie

> Your login page already exists at `/(auth)/login`. In the URL, that's just `/login`.

## 1) Set the base URL
Create `.env.local` at the project root:
```
<<<<<<< HEAD
NEXT_PUBLIC_API_BASE_URL=https://aa7d282b0702.ngrok-free.app
=======
NEXT_PUBLIC_API_BASE_URL=https://bcare.my.id
```

## 2) Drop-in files
- Copy everything from this `src` folder into your app's `src` directory.
- Put `middleware.js` next to your `package.json`.

## 3) How to use in your login page
```jsx
'use client';
import React, { useState } from 'react';
import useAuth from '@/hooks/useAuth';

export default function LoginForm() {
  const { login, status, error } = useAuth();
  const [npp, setNpp] = useState('EMP00001');
  const [password, setPassword] = useState('budi');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ npp, password });
      // navigate wherever you want, e.g. /dashboard
      window.location.href = '/dashboard';
    } catch (e) {
      // error is already in store, but you can toast here too
      console.error(e.message);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input value={npp} onChange={(e) => setNpp(e.target.value)} placeholder="NPP" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit" disabled={status==='loading'}>
        {status==='loading' ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{color:'red'}}>{error}</p>}
    </form>
  );
}
```

## 4) Using the user data in the UI
```jsx
'use client';
import useAuth from '@/hooks/useAuth';

export default function TopbarUser() {
  const { user, isAuthenticated, logout } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <div>
      <strong>{user?.full_name}</strong> ({user?.role_details?.role_name})
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 5) Making authenticated API calls
```jsx
'use client';
import React, { useEffect, useState } from 'react';
import useAxiosAuth from '@/hooks/useAxiosAuth';

export default function Example() {
  const api = useAxiosAuth();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // When your other backend endpoints are ready:
    // api.get('/v1/tickets').then(res => setTickets(res.data));
  }, [api]);

  return <pre>{JSON.stringify(tickets, null, 2)}</pre>;
}
```

## 6) Route protection
- `middleware.js` checks for an `access_token` cookie.
- On successful login, we mirror the token into a cookie so middleware can protect private routes.
- For production, prefer moving login behind a Next **Route Handler** (`/app/api/auth/login/route.ts`) that sets an **HttpOnly** cookie.

## 7) Token format note
Your API returns `access_token: "Bearer eyJ..."`. We store it as-is and normalize so the `Authorization` header is correct even if the API later returns just the raw JWT.

Happy shipping!
