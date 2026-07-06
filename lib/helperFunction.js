
import { NextResponse } from "next/server"

export const response = (success, statusCode, message, data = {}) => {
    return NextResponse.json({
        success, statusCode, message, data
    })
}

export const catchError = (error, customMessage) => {
    // handling duplicate key error 
    if (error.code === 11000) {
        const keys = Object.keys(error.keyPattern).join(',')
        error.message = `Duplicate fields: ${keys}. These fields value must be unique.`
    }


    let errorObj = {}

    if (process.env.NODE_ENV === 'development') {
        errorObj = {
            message: error.message,
            error
        }
    } else {
        errorObj = {
            message: customMessage || 'Internal server error.',
        }
    }

    return NextResponse.json({
        success: false,
        statusCode: error.code,
        ...errorObj
    })

}

export const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    return otp
}


export const columnConfig = (column, isCreatedAt = false, isUpdatedAt = false, isDeletedAt = false) => {
    const newColumn = [...column]

    if (isCreatedAt) {
        newColumn.push({
            accessorKey: 'createdAt',
            header: 'Created At',
            Cell: ({ renderedCellValue }) => (new Date(renderedCellValue).toLocaleString())
        })
    }
    if (isUpdatedAt) {
        newColumn.push({
            accessorKey: 'updatedAt',
            header: 'Updated At',
            Cell: ({ renderedCellValue }) => (new Date(renderedCellValue).toLocaleString())
        })
    }
    if (isDeletedAt) {
        newColumn.push({
            accessorKey: 'deletedAt',
            header: 'Deleted At',
            Cell: ({ renderedCellValue }) => (new Date(renderedCellValue).toLocaleString())
        })
    }

    return newColumn
}

export const statusBadge = (status) => {
    const statusColorConfig = {
        pending:    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800',
        processing: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800',
        shipped:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 ring-1 ring-cyan-200 dark:ring-cyan-800',
        delivered:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800',
        cancelled:  'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',
        unverified: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800',
    }
    const cls = statusColorConfig[status] || 'bg-muted text-muted-foreground ring-1 ring-border'
    return <span className={`${cls} capitalize px-2.5 py-0.5 rounded-full text-xs font-medium`}>{status}</span>
}