import { atom } from 'jotai'

export const userAtom = atom(null)
export const roleAtom = atom<'admin' | 'user'| 'principal' | 'student' | 'co-ordinator' | null>(null)
export const postsAtom = atom([])
export const settingsAtom = atom({ theme: 'light', language: 'en' })