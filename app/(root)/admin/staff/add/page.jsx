'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_STAFF } from '@/routes/AdminPanelRoute'

export default function StaffAddPage() {
    const router = useRouter()
    useEffect(() => {
        router.replace(ADMIN_STAFF + '?add=1')
    }, [router])
    return null
}
