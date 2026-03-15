'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RequestModal from '@/components/RequestModal'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

interface BookDetailClientProps {
  book: Book
  userId: string | null
  isOwner: boolean
  hasRequested: boolean
}

export default function BookDetailClient({ book, userId, isOwner, hasRequested }: BookDetailClientProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [requested, setRequested] = useState(hasRequested)
  const [toggleLoading, setToggleLoading] = useState(false)
  const supabase = createClient()

  async function handleToggleAvailable() {
    setToggleLoading(true)
    await supabase.from('books').update({ available: !book.available }).eq('id', book.id)
    router.refresh()
    setToggleLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    await supabase.from('books').delete().eq('id', book.id)
    router.push('/dashboard')
    router.refresh()
  }

  if (isOwner) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleToggleAvailable}
          disabled={toggleLoading}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          {book.available ? 'Mark as unavailable' : 'Mark as available'}
        </button>
        <button
          onClick={handleDelete}
          className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
        >
          Delete listing
        </button>
      </div>
    )
  }

  if (!userId) {
    return (
      <Link
        href="/auth/login"
        className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
      >
        Sign in to request this book
      </Link>
    )
  }

  if (!book.available) {
    return (
      <p className="text-sm text-gray-500">This book is currently not available.</p>
    )
  }

  if (requested) {
    return (
      <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg text-sm font-medium border border-green-200">
        ✓ Request sent — waiting for the owner to respond
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
      >
        {book.listing_type === 'sell' ? 'Request to Buy' : 'Request to Borrow'}
      </button>

      {showModal && (
        <RequestModal
          book={book}
          requesterId={userId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setRequested(true)
          }}
        />
      )}
    </>
  )
}
