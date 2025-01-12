import { Class, User, UserRole } from '@/interface/general'
import { atom } from 'jotai'

export const userAtom = atom(null)
export const roleAtom = atom<UserRole | null>(null)
export const postsAtom = atom([])
export const settingsAtom = atom({ theme: 'light', language: 'en' })
export const institutionIdAtom = atom<number | null>(
  Number(localStorage.getItem('institution_id')) || null
);
export const departmentIdAtom = atom<string | null>(null)
export const userDataAtom = atom<User | null>(null)
export const classDataAtom = atom<Class|null>(null)
export const user_idAtom = atom<number | null>(null)