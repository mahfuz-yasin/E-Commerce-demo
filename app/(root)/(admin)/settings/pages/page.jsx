'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useCallback, useMemo } from "react"
import { FiPlus } from "react-icons/fi"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '/settings', label: 'Settings' },
    { href: '', label: 'All Pages' },
]

const ShowPages = () => {
    const columns = useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => <span>{row.original.title}</span>
        },
        {
            accessorKey: 'key',
            header: 'Key',
            cell: ({ row }) => <span>{row.original.key}</span>
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <span className="capitalize">{row.original.type}</span>
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
        actionMenu.push(<EditAction key="edit" href={`/settings/pages/edit/${row.original._id}`} />)
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
        return actionMenu
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>All Pages</h4>
                        <Button>
                            <FiPlus />
                            <Link href="/settings/pages/create">Create Page</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="pages-data"
                        fetchUrl="/api/admin/settings?type=page"
                        initialPageSize={10}
                        columnsConfig={columns}
                        deleteEndpoint="/api/admin/settings"
                        deleteType="SD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowPages
