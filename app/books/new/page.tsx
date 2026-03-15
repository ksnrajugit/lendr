import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddBookClient from './AddBookClient'

export default async function NewBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/books/new')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">List a Book</h1>
      <p className="text-gray-500 text-sm mb-8">Enter an ISBN to auto-fill details, or fill them in manually.</p>
      <AddBookClient userId={user.id} />
    </div>
  )
}
