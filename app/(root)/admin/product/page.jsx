'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_PRODUCT_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_EDIT, ADMIN_PRODUCT_SHOW, ADMIN_TRASH } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useCallback, useMemo } from "react"
import { FiPlus } from "react-icons/fi"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_PRODUCT_SHOW, label: 'Product' },
]
const ShowProduct = () => {

    const columns = useMemo(() => {
        return columnConfig(DT_PRODUCT_COLUMN)
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        const editHref = ADMIN_PRODUCT_EDIT(row.original._id)
        if (editHref) {
            actionMenu.push(<EditAction key="edit" href={editHref} />)
        }
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
        return actionMenu
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="rounded-xl shadow-sm border border-border/60 overflow-hidden gap-0 py-0">
                <CardHeader className="px-5 py-4 border-b bg-muted/30">
                    <div className="flex justify-between items-center">
                        <h4 className='text-sm font-semibold text-foreground'>Manage Product</h4>
                        <Button asChild>
                            <Link href={ADMIN_PRODUCT_ADD}>New Product</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="product-data"
                        fetchUrl="/api/product"
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/product/export"
                        deleteEndpoint="/api/product/delete"
                        deleteType="SD"
                        trashView={`${ADMIN_TRASH}?trashof=product`}
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowProduct