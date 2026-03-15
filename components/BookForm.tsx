'use client'

import { useState } from 'react'
import Image from 'next/image'
import { lookupISBN } from '@/lib/isbn'
import type { BookCondition, ListingType } from '@/lib/types'

export interface BookFormData {
  isbn: string
  title: string
  author: string
  subject: string
  cover_url: string
  condition: BookCondition
  listing_type: ListingType
  price: string
  description: string
}

interface BookFormProps {
  initialData?: Partial<BookFormData>
  onSubmit: (data: BookFormData) => Promise<void>
  submitLabel?: string
}

const defaultData: BookFormData = {
  isbn: '',
  title: '',
  author: '',
  subject: '',
  cover_url: '',
  condition: 'good',
  listing_type: 'share',
  price: '',
  description: '',
}

export default function BookForm({ initialData, onSubmit, submitLabel = 'Add Book' }: BookFormProps) {
  const [form, setForm] = useState<BookFormData>({ ...defaultData, ...initialData })
  const [isbnInput, setIsbnInput] = useState(initialData?.isbn ?? '')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(field: keyof BookFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleISBNLookup() {
    setLookupLoading(true)
    setLookupError('')
    const result = await lookupISBN(isbnInput)
    if (result) {
      setForm(prev => ({
        ...prev,
        isbn: isbnInput,
        title: result.title || prev.title,
        author: result.author || prev.author,
        subject: result.subject || prev.subject,
        cover_url: result.coverUrl || prev.cover_url,
      }))
    } else {
      setLookupError('No book found for that ISBN. You can still fill in details manually.')
    }
    setLookupLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError('')
    try {
      await onSubmit({ ...form, isbn: isbnInput })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ISBN Lookup */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <label className="block text-sm font-semibold text-indigo-800 mb-1">
          ISBN Lookup <span className="font-normal text-indigo-500">(optional — auto-fills details)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={isbnInput}
            onChange={e => setIsbnInput(e.target.value)}
            className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            placeholder="e.g. 9780140328721"
          />
          <button
            type="button"
            onClick={handleISBNLookup}
            disabled={!isbnInput || lookupLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            {lookupLoading ? 'Looking up…' : 'Look Up'}
          </button>
        </div>
        {lookupError && <p className="text-amber-700 text-xs mt-2">{lookupError}</p>}
        {form.cover_url && (
          <div className="mt-3 flex items-center gap-3">
            <Image
              src={form.cover_url}
              alt="Book cover"
              width={48}
              height={64}
              className="rounded object-cover shadow-sm"
            />
            <p className="text-xs text-indigo-700">Cover found — will be shown on your listing</p>
          </div>
        )}
      </div>

      {/* Title & Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Harry Potter and the…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.author}
            onChange={e => update('author', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="J.K. Rowling"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Genre</label>
        <input
          type="text"
          value={form.subject}
          onChange={e => update('subject', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Fantasy, Science, History…"
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
        <div className="flex gap-2 flex-wrap">
          {(['new', 'good', 'fair', 'worn'] as BookCondition[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => update('condition', c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                form.condition === c
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-indigo-400'
              }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Listing type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => update('listing_type', 'share')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition ${
              form.listing_type === 'share'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            🤝 Share (Free)
          </button>
          <button
            type="button"
            onClick={() => update('listing_type', 'sell')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition ${
              form.listing_type === 'sell'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            💰 Sell
          </button>
        </div>
      </div>

      {/* Price (conditional) */}
      {form.listing_type === 'sell' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={e => update('price', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="5.00"
          />
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => update('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Any notes about the book, highlighted pages, etc."
        />
      </div>

      {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

      <button
        type="submit"
        disabled={submitLoading}
        className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {submitLoading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
