'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { FiSettings } from "react-icons/fi"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Settings' },
]

const Settings = () => {
    const settingsSections = [
        {
            title: 'Header',
            description: 'Manage website header content',
            icon: '🔝',
            link: '/settings/header'
        },
        {
            title: 'Footer',
            description: 'Manage website footer content',
            icon: '📋',
            link: '/settings/footer'
        },
        {
            title: 'Banner',
            description: 'Manage promotional banners',
            icon: '🖼️',
            link: '/settings/banner'
        },
        {
            title: 'All Pages',
            description: 'Manage all custom pages',
            icon: '📄',
            link: '/settings/pages'
        },
        {
            title: 'Create Page',
            description: 'Create new custom page',
            icon: '➕',
            link: '/settings/pages/create'
        },
        {
            title: 'All Landing Pages',
            description: 'Manage all landing pages',
            icon: '🎯',
            link: '/settings/landing-pages'
        },
        {
            title: 'Create Landing Page',
            description: 'Create new landing page',
            icon: '🚀',
            link: '/settings/landing-pages/create'
        }
    ]

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsSections.map((section, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={section.link}>
                            <CardHeader>
                                <div className="text-4xl mb-2">{section.icon}</div>
                                <CardTitle className="text-xl">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">{section.description}</p>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Settings
