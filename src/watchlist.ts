import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ---------- Types ----------

export type MediaType = 'movie' | 'tv'
export type WatchStatus = 'want' | 'watching' | 'watched'

export const STATUS_LABELS: Record<WatchStatus, string> = {
  want: 'Want to watch',
  watching: 'Watching',
  watched: 'Watched',
}

export const MOOD_TAGS = [
  'Comfort watch',
  'With friends',
  'Date night',
  'Needs full attention',
  'Cry movie',
  'Quick watch',
]

export type WatchlistDraft = {
  mediaType: MediaType
  tmdbId: number
  title: string
  posterPath: string | null
  date: string
  status: WatchStatus
  reason: string
  recommendedBy: string
  source: string
  tags: string[]
}

export type WatchlistItem = WatchlistDraft & {
  createdAt: Timestamp | null
}

// ---------- Where things live ----------
// users/{uid}/watchlist/{movie-550}

function itemRef(uid: string, mediaType: MediaType, tmdbId: number) {
  return doc(db, 'users', uid, 'watchlist', `${mediaType}-${tmdbId}`)
}

function listRef(uid: string) {
  return collection(db, 'users', uid, 'watchlist')
}

// ---------- Reading (live) ----------

export function watchItem(
  uid: string,
  mediaType: MediaType,
  tmdbId: number,
  onChange: (item: WatchlistItem | null) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    itemRef(uid, mediaType, tmdbId),
    (snapshot) => {
      onChange(snapshot.exists() ? (snapshot.data() as WatchlistItem) : null)
    },
    onError,
  )
}

export function watchList(
  uid: string,
  onChange: (items: WatchlistItem[]) => void,
  onError: (error: Error) => void,
) {
  const newestFirst = query(listRef(uid), orderBy('createdAt', 'desc'))

  return onSnapshot(
    newestFirst,
    (snapshot) => {
      onChange(snapshot.docs.map((d) => d.data() as WatchlistItem))
    },
    onError,
  )
}

// ---------- Writing ----------

export function saveItem(uid: string, draft: WatchlistDraft, isNew: boolean) {
  const ref = itemRef(uid, draft.mediaType, draft.tmdbId)

  if (isNew) {
    return setDoc(ref, { ...draft, createdAt: serverTimestamp() })
  }
  return setDoc(ref, draft, { merge: true })
}

export function removeItem(uid: string, mediaType: MediaType, tmdbId: number) {
  return deleteDoc(itemRef(uid, mediaType, tmdbId))
}