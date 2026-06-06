'use client';
import { useEffect, useState } from 'react';

export function useDashboardData(){
 const [data,setData]=useState<any>(null); const [error,setError]=useState('');
 useEffect(()=>{ fetch('/api/dashboard',{cache:'no-store'}).then(r=>r.json()).then(j=>{ if(j.error) setError(j.error); else setData(j); }).catch(e=>setError(e.message)); },[]);
 return {data,error,loading:!data&&!error};
}
export function pct(v:any){ const n=Number(v); return Number.isFinite(n)?`${(n*100).toFixed(2)}%`:'0.00%'; }
export function num(v:any,d=2){ const n=Number(v); return Number.isFinite(n)?n.toFixed(d):String(v||''); }
