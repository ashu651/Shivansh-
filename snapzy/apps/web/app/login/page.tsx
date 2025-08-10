'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      (async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/v1/auth/magic/consume?token=${t}`, { credentials: 'include' });
          const data = await res.json();
          if (data?.accessToken) setToken(data.accessToken);
        } catch {}
      })();
    }
  }, []);

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await api.post('/auth/login', { email, password });
          if (res.ok) setToken(res.accessToken);
        }}
        className="space-y-3"
      >
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-brand-500 text-white px-4 py-2 rounded" type="submit">Login</button>
        {token && <p className="break-all">Token: {token}</p>}
      </form>
    </main>
  );
}