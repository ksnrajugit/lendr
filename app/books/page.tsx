import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/BookCard'
import type { Book } from '@/lib/types'

interface SearchParams {
  q?: string
  type?: string
  subject?: string
}

export default async function BooksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('books')
    .select('*, profiles(display_name, avatar_url)')
    .eq('available', true)
    .order('created_at', { ascending: false })

  if (params.type === 'share' || params.type === 'sell') {
    query = query.eq('listing_type', params.type)
  }

  if (params.subject) {
    query = query.ilike('subject', `%${params.subject}%`)
  }

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,author.ilike.%${params.q}%`)
  }

  const { data: books } = await query

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Books</h1>

      {/* Search + filters */}
      <form className="flex flex-wrap gap-3 mb-8" method="get">
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ''}
          placeholder="Search by title or author…"
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          name="type"
          defaultValue={params.type ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All types</option>
          <option value="share">Free (share)</option>
          <option value="sell">For sale</option>
        </select>
        <input
          type="text"
          name="subject"
          defaultValue={params.subject ?? ''}
          placeholder="Subject / genre"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Search
        </button>
        {(params.q || params.type || params.subject) && (
          <a href="/books" className="text-sm text-gray-500 hover:text-gray-700 self-center">
            Clear
          </a>
        )}
      </form>

      {books && books.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">{books.length} book{books.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(books as Book[]).map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">No books match your search.</p>
        </div>
      )}
    </div>
  )
}
