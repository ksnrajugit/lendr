import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Lendr — Student Book Sharing',
  description: 'Share and find books with your classmates',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    displayName = profile?.display_name ?? null
  }

  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen">
        <Navbar user={user} displayName={displayName} />
        <main>{children}</main>
      </body>
    </html>
  )
}
