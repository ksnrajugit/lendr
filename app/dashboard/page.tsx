import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/dashboard')

  const [{ data: myBooks }, { data: incomingRequests }, { data: outgoingRequests }] = await Promise.all([
    supabase
      .from('books')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('requests')
      .select('*, books(title, author, cover_url), requester:profiles!requests_requester_id_fkey(display_name)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('requests')
      .select('*, books(title, author, cover_url)')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Dashboard</h1>
      <DashboardClient
        myBooks={myBooks ?? []}
        incomingRequests={incomingRequests ?? []}
        outgoingRequests={outgoingRequests ?? []}
        userId={user.id}
      />
    </div>
  )
}
