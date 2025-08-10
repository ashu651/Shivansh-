"use client";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

async function subscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: (window as any).Uint8Array ? (await import('../../lib/vapid')).vapidKey : undefined });
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/v1/push/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(sub) });
  return true;
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<any>({ analytics: false, marketing: false, personalization: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const res = await api.get('/consent'); setPrefs(res); } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <main className="p-6">Loading…</main>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <section className="space-y-2">
        <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })} /> Analytics cookies</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} /> Marketing</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.personalization} onChange={(e) => setPrefs({ ...prefs, personalization: e.target.checked })} /> Personalization</label>
        <div className="flex gap-2">
          <button className="bg-brand-500 text-white px-3 py-1 rounded" onClick={async () => { await api.post('/consent', prefs); }}>Save</button>
          <button className="bg-slate-200 px-3 py-1 rounded" onClick={async () => { await subscribePush(); }}>Enable Push</button>
        </div>
      </section>
    </main>
  );
}