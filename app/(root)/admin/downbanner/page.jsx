'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import { Link } from "lucide-react"
import { ADMIN_DOWNBANNER_ADD } from "@/routes/AdminPanelRoute"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Down Banner' },
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

const action = (row, deleteType, handleDelete) => [
    {
        label: 'Edit',
        icon: <Link size={16} />,
        onClick: () => window.location.href = `/admin/downbanner/edit/${row.original._id}`
    }
]

const DownBannerPage = () => {
    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2 flex justify-between items-center">
                    <h4 className='text-xl font-semibold'>Down Banner Management</h4>
                    <Button asChild>
                        <Link href={ADMIN_DOWNBANNER_ADD}>Add Banner</Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-3">
                    <DatatableWrapper
                        queryKey="downbanner-data"
                        fetchUrl="/api/admin/downbanner"
                        initialPageSize={10}
                        columnsConfig={columnsConfig}
                        deleteEndpoint="/api/admin/downbanner"
                        deleteType="SD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default DownBannerPage
