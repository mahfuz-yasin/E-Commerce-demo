'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { ADMIN_UPBANNER_ADD, ADMIN_UPBANNER_EDIT } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useCallback, useMemo } from "react"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Up Banner' },
]

const columnsConfig = [
    {
        accessorKey: 'imageUrl',
        header: 'Image',
        Cell: ({ row }) => (
            <div className="w-20 h-12">
                <img
                    src={row.original.imageUrl}
                    alt={row.original.title}
                    className="w-full h-full object-cover rounded"
                />
            </div>
        )
    },
    {
        accessorKey: 'title',
        header: 'Title'
    },
    {
        accessorKey: 'link',
        header: 'Link'
    },
    {
        accessorKey: 'order',
        header: 'Order'
    },
    {
        accessorKey: 'isActive',
        header: 'Active',
        Cell: ({ row }) => (
            <span className={row.original.isActive ? 'text-green-600' : 'text-red-600'}>
                {row.original.isActive ? 'Yes' : 'No'}
            </span>
        )
    }
]

const UpBannerPage = () => {
    const columns = useMemo(() => columnsConfig, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        const editHref = ADMIN_UPBANNER_EDIT(row.original._id)
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
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2 flex justify-between items-center">
                    <h4 className='text-sm font-semibold text-foreground'>Up Banner Management</h4>
                    <Button asChild>
                        <Link href={ADMIN_UPBANNER_ADD}>Add Banner</Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-3">
                    <DatatableWrapper
                        queryKey="upbanner-data"
                        fetchUrl="/api/admin/upbanner"
                        initialPageSize={10}
                        columnsConfig={columns}
                        deleteEndpoint="/api/admin/upbanner"
                        deleteType="SD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default UpBannerPage
