import { Navigate } from 'react-router-dom'

// TODO: Ganti dengan Supabase session check
// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  // Sementara — simulate logged in
  // Bila Supabase ready, tukar kepada:
  // const [session, setSession] = useState(null)
  // const [loading, setLoading] = useState(true)
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session); setLoading(false)
  //   })
  // }, [])
  // if (loading) return <div>Loading...</div>
  // if (!session) return <Navigate to="/login" />
  // return children

  const isLoggedIn = true // tukar kepada false untuk test redirect
  if (!isLoggedIn) return <Navigate to="/login" />
  return children
}