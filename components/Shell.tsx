'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Shell({children}:{children:React.ReactNode}){
 const router=useRouter();
 async function logout(){ await fetch('/api/logout',{method:'POST'}); router.push('/login'); }
 return <div className="layout"><aside className="sidebar"><div className="brand">Project Dashboard</div><nav className="nav"><Link href="/dashboard">Dashboard</Link><Link href="/dashboard/progress">Progress</Link><Link href="/dashboard/activities">Activities</Link><Link href="/dashboard/delays">Delays</Link><Link href="/dashboard/risks">Risks</Link><Link href="/dashboard/photos">Photos</Link></nav></aside><main className="content"><div className="topbar"><span className="badge">Dynamic Excel Source</span><button className="btn" onClick={logout}>Logout</button></div>{children}</main></div>
}
