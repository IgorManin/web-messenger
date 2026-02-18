'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {useAuthStore} from "../../modules/auth/store/auth.store";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    const token = useAuthStore((s) => s.accessToken)
    const isInitialized = useAuthStore((s) => s.isInitialized)

    useEffect(() => {
        if (!isInitialized) return
        if (!token) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }, [isInitialized, token, router, pathname])

    if (!isInitialized) return null
    if (!token) return null

    return <>{children}</>
}
