'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

interface RequestModalProps {
  book: Book
  requesterId: string
  onClose: () => void
  onSuccess: () => void
}

export default function RequestModal({ book, requesterId, onClose, onSuccess }: RequestModalProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('requests').insert({
      book_id: book.id,
      requester_id: requesterId,
      owner_id: book.owner_id,
      message,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Request this book</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {book.listing_type === 'sell'
                ? `Asking price: $${book.price?.toFixed(2)}`
                : 'Available to borrow for free'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="flex gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="text-2xl">📖</div>
          <div>
            <p className="font-medium text-sm text-gray-900">{book.title}</p>
            <p className="text-xs text-gray-500">{book.author}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message to owner
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder={
                book.listing_type === 'sell'
                  ? `Hi! I'm interested in buying this book. When can we meet?`
                  : `Hi! I'd love to borrow this book. How long can I keep it?`
              }
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
