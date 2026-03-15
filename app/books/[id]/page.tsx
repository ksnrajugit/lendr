import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BookDetailClient from './BookDetailClient'
import type { Book } from '@/lib/types'

const conditionLabel: Record<string, string> = {
  new: 'New', good: 'Good', fair: 'Fair', worn: 'Worn',
}
const conditionColor: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-yellow-100 text-yellow-700',
  worn: 'bg-orange-100 text-orange-700',
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('books')
    .select('*, profiles(display_name, avatar_url)')
    .eq('id', id)
    .single()

  if (!book) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const isOwner = user?.id === book.owner_id

  // Check if user already sent a request
  let hasRequested = false
  if (user && !isOwner) {
    const { data } = await supabase
      .from('requests')
      .select('id')
      .eq('book_id', id)
      .eq('requester_id', user.id)
      .maybeSingle()
    hasRequested = !!data
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/books" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to browse
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Cover */}
          <div className="relative w-full sm:w-56 h-64 sm:h-auto bg-gray-100 flex-shrink-0">
            {book.cover_url ? (
              <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-7xl">
                📖
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                <p className="text-gray-500 mt-1">{book.author}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {book.listing_type === 'sell' ? (
                  <span className="text-2xl font-bold text-amber-600">${(book as Book).price?.toFixed(2)}</span>
                ) : (
                  <span className="text-lg font-semibold text-green-600">Free to borrow</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${conditionColor[book.condition]}`}>
                {conditionLabel[book.condition]} condition
              </span>
              {book.subject && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {book.subject}
                </span>
              )}
              {book.isbn && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-mono">
                  ISBN: {book.isbn}
                </span>
              )}
              {!book.available && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                  Unavailable
                </span>
              )}
            </div>

            {book.description && (
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{book.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                {(book.profiles as { display_name: string })?.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span>Listed by <strong>{(book.profiles as { display_name: string })?.display_name}</strong></span>
            </div>

            <BookDetailClient
              book={book as Book}
              userId={user?.id ?? null}
              isOwner={isOwner}
              hasRequested={hasRequested}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
