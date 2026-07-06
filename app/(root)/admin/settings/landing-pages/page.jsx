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
    { href: '/admin/settings', label: 'Settings' },
    { href: '', label: 'All Landing Pages' },
]

const ShowLandingPages = () => {
    const columns = useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => <span>{row.original.title}</span>
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            cell: ({ row }) => <span>{row.original.slug}</span>
        },
        {
            accessorKey: 'components',
            header: 'Components',
            cell: ({ row }) => <span>{row.original.components?.length || 0}</span>
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <span className={row.original.isActive ? 'text-green-600' : 'text-red-600'}>
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            accessorKey: 'isPublished',
            header: 'Published',
            cell: ({ row }) => (
                <span className={row.original.isPublished ? 'text-green-600' : 'text-yellow-600'}>
                    {row.original.isPublished ? 'Yes' : 'No'}
                </span>
            )
        }
    ], [])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        const editHref = `/admin/settings/landing-pages/create/builder?edit=${row.original._id}`
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
                        <h4 className='text-sm font-semibold text-foreground'>All Landing Pages</h4>
                        <Button asChild>
                            <Link href="/admin/settings/landing-pages/create/builder">
                                <FiPlus />
                                Create Landing Page
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="landing-pages-data"
                        fetchUrl="/api/admin/pagebuilder?pageType=landing_page"
                        initialPageSize={10}
                        columnsConfig={columns}
                        deleteEndpoint="/api/admin/pagebuilder"
                        deleteType="SD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowLandingPages
