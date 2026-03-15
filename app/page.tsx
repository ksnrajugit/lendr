import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/BookCard'
import type { Book } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: books } = await supabase
    .from('books')
    .select('*, profiles(display_name, avatar_url)')
    .eq('available', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Share books with your classmates
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Lendr makes it easy to lend or sell books within your school. Find what you need, share what you have.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/books"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Browse Books
          </Link>
          {user ? (
            <Link
              href="/books/new"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              List a Book
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Join Now
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-16 max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-indigo-600">{books?.length ?? 0}+</div>
          <div className="text-xs text-gray-500 mt-1">Books listed</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">Free</div>
          <div className="text-xs text-gray-500 mt-1">To borrow</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-amber-500">$</div>
          <div className="text-xs text-gray-500 mt-1">Buy &amp; sell</div>
        </div>
      </div>

      {/* Recent listings */}
      {books && books.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recently added</h2>
            <Link href="/books" className="text-sm text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(books as Book[]).map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      {(!books || books.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">No books yet. Be the first to list one!</p>
          {user && (
            <Link href="/books/new" className="mt-4 inline-block text-indigo-600 text-sm font-medium hover:underline">
              Add a book →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
