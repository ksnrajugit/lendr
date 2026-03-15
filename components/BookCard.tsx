import Link from 'next/link'
import Image from 'next/image'
import type { Book } from '@/lib/types'

const conditionLabel: Record<string, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  worn: 'Worn',
}

const conditionColor: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-yellow-100 text-yellow-700',
  worn: 'bg-orange-100 text-orange-700',
}

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="relative h-48 bg-gray-100">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">
            📖
          </div>
        )}
        <div className="absolute top-2 left-2">
          {book.listing_type === 'sell' ? (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              ${book.price?.toFixed(2)}
            </span>
          ) : (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Free
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-gray-500 text-xs mt-1">{book.author}</p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColor[book.condition]}`}>
            {conditionLabel[book.condition]}
          </span>
          {book.profiles && (
            <span className="text-xs text-gray-400">{book.profiles.display_name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
