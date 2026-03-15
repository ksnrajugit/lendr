export interface ISBNLookupResult {
  title: string
  author: string
  subject: string
  coverUrl: string
}

async function lookupOpenLibrary(isbn: string): Promise<ISBNLookupResult | null> {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  const key = `ISBN:${isbn}`
  const book = data[key]
  if (!book) return null

  const title: string = book.title ?? ''
  const author: string = book.authors?.[0]?.name ?? ''
  const subject: string = book.subjects?.[0]?.name ?? ''
  const coverId: string | undefined = book.cover?.large ?? book.cover?.medium ?? book.cover?.small
  const coverUrl: string = coverId ?? ''

  return { title, author, subject, coverUrl }
}

async function lookupGoogleBooks(isbn: string): Promise<ISBNLookupResult | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  const item = data.items?.[0]
  if (!item) return null

  const info = item.volumeInfo
  const title: string = info.title ?? ''
  const author: string = info.authors?.[0] ?? ''
  const subject: string = info.categories?.[0] ?? ''
  const coverUrl: string = info.imageLinks?.thumbnail?.replace('http://', 'https://') ?? ''

  return { title, author, subject, coverUrl }
}

export async function lookupISBN(isbn: string): Promise<ISBNLookupResult | null> {
  const cleaned = isbn.replace(/[-\s]/g, '')
  if (!/^\d{10}(\d{3})?$/.test(cleaned)) return null

  const openLib = await lookupOpenLibrary(cleaned)
  if (openLib && openLib.title) return openLib

  return lookupGoogleBooks(cleaned)
}
