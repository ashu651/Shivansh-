'use client';
import { useState } from 'react';
import { api } from '../../lib/api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await api.post('/auth/register', { email, username, password });
          setOk(res.ok);
        }}
        className="space-y-3"
      >
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-brand-500 text-white px-4 py-2 rounded" type="submit">Sign up</button>
        {ok && <p>Registered. Please login.</p>}
      </form>
    </main>
  );
}