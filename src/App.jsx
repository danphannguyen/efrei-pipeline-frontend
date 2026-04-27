import React, {useEffect, useState} from 'react'

export default function App(){
  const [msg, setMsg] = useState('Loading...')

  useEffect(()=>{
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
    const url = `${base}/api`
    fetch(url)
      .then(r=>r.json())
      .then(d=>setMsg(d.message))
      .catch(()=>setMsg('Could not reach API'))
  },[])

  return (
    <div style={{fontFamily:'Arial,Helvetica,sans-serif',padding:24}}>
      <h1>Pipeline Frontend</h1>
      <p>API says: {msg}</p>
    </div>
  )
}
