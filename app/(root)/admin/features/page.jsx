'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ADMIN_FEATURES_ADD, ADMIN_FEATURES_EDIT, ADMIN_FEATURES_SHOW, ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useCallback, useMemo } from "react"
import { FiPlus } from "react-icons/fi"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_FEATURES_SHOW, label: 'Features' },
]

const ShowFeatures = () => {
    const columns = useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => <span>{row.original.title}</span>
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => <span className="line-clamp-2">{row.original.description}</span>
        },
        {
            accessorKey: 'icon',
            header: 'Icon',
            cell: ({ row }) => <span>{row.original.icon}</span>
        },
        {
            accessorKey: 'color',
            header: 'Color',
            cell: ({ row }) => <span className="capitalize">{row.original.color}</span>
        },
        {
            accessorKey: 'order',
            header: 'Order',
            cell: ({ row }) => <span>{row.original.order}</span>
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <span className={row.original.isActive ? 'text-green-600' : 'text-red-600'}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ], [])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        const editHref = ADMIN_FEATURES_EDIT(row.original._id)
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
                        <h4 className='text-sm font-semibold text-foreground'>Manage Features</h4>
                        <Button asChild>
                            <Link href={ADMIN_FEATURES_ADD}>
                                <FiPlus />
                                New Feature
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="features-data"
                        fetchUrl="/api/admin/features"
                        initialPageSize={10}
                        columnsConfig={columns}
                        deleteEndpoint="/api/admin/features"
                        deleteType="SD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowFeatures
