import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard'

export default function DashboardPage() {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🔵 Current user:', user)
      console.log('🔵 User ID:', user?.id)
      console.log('🔵 User email:', user?.email)

      if (!user) {
        console.log('🔴 No user found — defaulting to user role')
        setRole('user')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('🔵 Profile query data:', data)
      console.log('🔵 Profile query error:', error)
      console.log('🔵 Final role:', data?.role || 'user')

      setRole(data?.role || 'user')
      setLoading(false)
    }
    getRole()
  }, [])

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(29,158,117,0.2)',
        borderTop: '3px solid #1D9E75',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
        Memuatkan dashboard...
      </div>
    </div>
  )

  if (role === 'admin') return <AdminDashboard />
  return <UserDashboard />
}