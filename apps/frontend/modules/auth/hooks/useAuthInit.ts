'use client'

import { useEffect } from 'react'
import {useAuthStore} from "../store/auth.store";
import {authApi} from "../api/auth.api";


export const useAuthInit = () => {
    const setAccessToken = useAuthStore((s) => s.setAccessToken)
    const setInitialized = useAuthStore((s) => s.setInitialized)

    useEffect(() => {
        let cancelled = false

        const run = async () => {
            try {
                const data = await authApi.refresh()
                if (!cancelled) setAccessToken(data.accessToken)
            } catch {
                // не залогинен — ок
            } finally {
                if (!cancelled) setInitialized(true)
            }
        }

        run().then(r => cancelled = true)

        return () => {
            cancelled = true
        }
    }, [setAccessToken, setInitialized])
}
