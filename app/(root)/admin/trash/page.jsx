'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_CATEGORY_COLUMN, DT_COUPON_COLUMN, DT_CUSTOMERS_COLUMN, DT_ORDER_COLUMN, DT_PRODUCT_COLUMN, DT_PRODUCT_VARIANT_COLUMN, DT_REVIEW_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_TRASH } from "@/routes/AdminPanelRoute"

import { useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_TRASH, label: 'Trash' },
]

const TRASH_CONFIG = {
    category: {
        title: 'Category Trash',
        columns: DT_CATEGORY_COLUMN,
        fetchUrl: '/api/category',
        exportUrl: '/api/category/export',
        deleteUrl: '/api/category/delete'
    },

    product: {
        title: 'Product Trash',
        columns: DT_PRODUCT_COLUMN,
        fetchUrl: '/api/product',
        exportUrl: '/api/product/export',
        deleteUrl: '/api/product/delete'
    },
    "product-variant": {
        title: 'Product Variant Trash',
        columns: DT_PRODUCT_VARIANT_COLUMN,
        fetchUrl: '/api/product-variant',
        exportUrl: '/api/product-variant/export',
        deleteUrl: '/api/product-variant/delete'
    },
    coupon: {
        title: 'Coupon Trash',
        columns: DT_COUPON_COLUMN,
        fetchUrl: '/api/coupon',
        exportUrl: '/api/coupon/export',
        deleteUrl: '/api/coupon/delete'
    },
    customers: {
        title: 'Customers Trash',
        columns: DT_CUSTOMERS_COLUMN,
        fetchUrl: '/api/customers',
        exportUrl: '/api/customers/export',
        deleteUrl: '/api/customers/delete'
    },
    review: {
        title: 'Review Trash',
        columns: DT_REVIEW_COLUMN,
        fetchUrl: '/api/review',
        exportUrl: '/api/review/export',
        deleteUrl: '/api/review/delete'
    },
    orders: {
        title: 'Orders Trash',
        columns: DT_ORDER_COLUMN,
        fetchUrl: '/api/orders',
        exportUrl: '/api/orders/export',
        deleteUrl: '/api/orders/delete'
    },

}

const Trash = () => {

    const searchParams = useSearchParams()
    const trashOf = searchParams.get('trashof')

    const config = TRASH_CONFIG[trashOf]

    const columns = useMemo(() => {
        return columnConfig(config.columns, false, false, true)
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        return [<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />]
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="rounded-xl shadow-sm border border-border/60 overflow-hidden gap-0 py-0">
                <CardHeader className="px-5 py-4 border-b bg-muted/30">
                    <div className="flex justify-between items-center">
                        <h4 className='text-sm font-semibold text-foreground'>{config.title}</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey={`${trashOf}-data-deleted`}
                        fetchUrl={config.fetchUrl}
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint={config.exportUrl}
                        deleteEndpoint={config.deleteUrl}
                        deleteType="PD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default Trash