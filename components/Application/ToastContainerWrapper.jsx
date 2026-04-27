'use client'
import { ToastContainer } from 'react-toastify'
import { useEffect } from 'react'

const ToastContainerWrapper = () => {
    useEffect(() => {
        // Ensure this only runs on client
    }, [])

    return (
        <ToastContainer />
    )
}

export default ToastContainerWrapper
