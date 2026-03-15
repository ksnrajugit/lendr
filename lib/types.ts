export type ListingType = 'share' | 'sell'
export type BookCondition = 'new' | 'good' | 'fair' | 'worn'
export type RequestStatus = 'pending' | 'accepted' | 'declined'

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
}

export interface Book {
  id: string
  owner_id: string
  isbn: string | null
  title: string
  author: string
  subject: string | null
  cover_url: string | null
  condition: BookCondition
  listing_type: ListingType
  price: number | null
  description: string | null
  available: boolean
  created_at: string
  profiles?: Pick<Profile, 'display_name' | 'avatar_url'>
}

export interface BookRequest {
  id: string
  book_id: string
  requester_id: string
  owner_id: string
  message: string
  status: RequestStatus
  created_at: string
  books?: Pick<Book, 'title' | 'author' | 'cover_url'>
  requester?: Pick<Profile, 'display_name'>
}
