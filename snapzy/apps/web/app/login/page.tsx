'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

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