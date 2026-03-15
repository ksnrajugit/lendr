'use client'

import { useRouter } from 'next/navigation'
import BookForm, { type BookFormData } from '@/components/BookForm'
import { createClient } from '@/lib/supabase/client'

export default function AddBookClient({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(data: BookFormData) {
    const { error } = await supabase.from('books').insert({
      owner_id: userId,
      isbn: data.isbn || null,
      title: data.title,
      author: data.author,
      subject: data.subject || null,
      cover_url: data.cover_url || null,
      condition: data.condition,
      listing_type: data.listing_type,
      price: data.listing_type === 'sell' && data.price ? parseFloat(data.price) : null,
      description: data.description || null,
      available: true,
    })

    if (error) throw new Error(error.message)
    router.push('/dashboard')
    router.refresh()
  }

  return <BookForm onSubmit={handleSubmit} submitLabel="List Book" />
}
