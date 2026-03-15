'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Book, BookRequest } from '@/lib/types'

interface DashboardClientProps {
  myBooks: Book[]
  incomingRequests: BookRequest[]
  outgoingRequests: BookRequest[]
  userId: string
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
}

export default function DashboardClient({ myBooks, incomingRequests, outgoingRequests }: DashboardClientProps) {
  const [tab, setTab] = useState<'books' | 'incoming' | 'outgoing'>('books')
  const [requests, setRequests] = useState(incomingRequests)
  const router = useRouter()
  const supabase = createClient()

  async function handleRequestAction(requestId: string, status: 'accepted' | 'declined') {
    await supabase.from('requests').update({ status }).eq('id', requestId)
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r))
  }

  async function handleToggleAvailable(bookId: string, current: boolean) {
    await supabase.from('books').update({ available: !current }).eq('id', bookId)
    router.refresh()
  }

  async function handleDeleteBook(bookId: string) {
    if (!confirm('Delete this listing?')) return
    await supabase.from('books').delete().eq('id', bookId)
    router.refresh()
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8">
        {[
          { key: 'books', label: `My Books (${myBooks.length})` },
          { key: 'incoming', label: `Requests Received (${requests.filter(r => r.status === 'pending').length})` },
          { key: 'outgoing', label: `My Requests (${outgoingRequests.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* My Books */}
      {tab === 'books' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{myBooks.length} listing{myBooks.length !== 1 ? 's' : ''}</p>
            <Link
              href="/books/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              + Add Book
            </Link>
          </div>

          {myBooks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-sm mb-4">You haven&apos;t listed any books yet.</p>
              <Link href="/books/new" className="text-indigo-600 text-sm font-medium hover:underline">
                List your first book →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myBooks.map(book => (
                <div key={book.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                  <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {book.cover_url ? (
                      <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xl">📖</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${book.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {book.available ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {book.listing_type === 'sell' ? `$${book.price?.toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/books/${book.id}`} className="text-xs text-indigo-600 hover:underline">
                      View
                    </Link>
                    <button
                      onClick={() => handleToggleAvailable(book.id, book.available)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {book.available ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incoming Requests */}
      {tab === 'incoming' && (
        <div>
          {requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-sm">No requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {(req.requester as { display_name: string })?.display_name} wants your book
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        &ldquo;{(req.books as { title: string })?.title}&rdquo;
                      </p>
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2.5 italic">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusBadge[req.status]}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleRequestAction(req.id, 'accepted')}
                        className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(req.id, 'declined')}
                        className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Outgoing Requests */}
      {tab === 'outgoing' && (
        <div>
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📤</div>
              <p className="text-sm">You haven&apos;t requested any books yet.</p>
              <Link href="/books" className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline">
                Browse books →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {outgoingRequests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {(req.books as { title: string })?.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 italic">&ldquo;{req.message}&rdquo;</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusBadge[req.status]}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
