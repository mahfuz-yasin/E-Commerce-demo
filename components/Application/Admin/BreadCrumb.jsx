import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChevronRight, Home } from "lucide-react"

const BreadCrumb = ({ breadcrumbData }) => {
    return (
        <div className="mb-6">
            <Breadcrumb>
                <BreadcrumbList className="flex items-center gap-1">
                    {breadcrumbData.length > 0 && breadcrumbData.map((data, index) => {
                        const isLast = index === breadcrumbData.length - 1
                        const isFirst = index === 0
                        return (
                            <div key={index} className="flex items-center gap-1">
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="text-sm font-semibold text-foreground">
                                            {data.label}
                                        </BreadcrumbPage>
                                    ) : data.href ? (
                                        <BreadcrumbLink
                                            href={data.href}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            {isFirst && <Home className="w-3.5 h-3.5" />}
                                            {data.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage className="text-sm text-muted-foreground">
                                            {data.label}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && (
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                )}
                            </div>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}

export default BreadCrumb