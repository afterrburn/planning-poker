import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBwI5gYt7NPCZZot9eRtsXmNzv4WalTQCY",
  authDomain: "planning-poker-d12a0.firebaseapp.com",
  databaseURL: "https://planning-poker-d12a0-default-rtdb.firebaseio.com",
  projectId: "planning-poker-d12a0",
  storageBucket: "planning-poker-d12a0.firebasestorage.app",
  messagingSenderId: "885476807167",
  appId: "1:885476807167:web:1bf537187fc9073b17d7ca"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ hd: 'bamboohr.com' })

export const ALLOWED_DOMAIN = 'bamboohr.com'
export const FIBONACCI = [0, 1, 2, 3, 5, 8, 13, 21, '?', '☕'] as const
export type VoteValue = (typeof FIBONACCI)[number] | null
