'use client'
import useFetch from "@/hooks/useFetch"
import { useEffect, useState } from "react"
import Image from "next/image"
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { Star, MessageSquare } from "lucide-react"

const StarRating = ({ rating, max = 5 }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
            <Star
                key={i}
                className={`w-3 h-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
            />
        ))}
    </div>
)

const LatestReview = () => {
    const [latestReview, setLatestReview] = useState([])
    const { data: getLatestReview, loading } = useFetch('/api/dashboard/admin/latest-review')

    useEffect(() => {
        if (getLatestReview?.success) setLatestReview(getLatestReview.data)
    }, [getLatestReview])

    if (loading) return (
        <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2.5 bg-muted rounded w-16" />
                    </div>
                </div>
            ))}
        </div>
    )

    if (!latestReview.length) return (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm">No reviews yet</p>
        </div>
    )

    return (
        <div className="divide-y">
            {latestReview.map((review) => {
                const img = review?.product?.media?.[0]?.secure_url || imgPlaceholder.src
                const name = review?.product?.name || 'Unknown Product'
                const reviewer = review?.customer?.name || review?.name || 'Anonymous'
                return (
                    <div key={review._id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border/60 shrink-0 bg-muted">
                            <Image
                                src={img}
                                alt={name}
                                fill
                                className="object-cover"
                                sizes="36px"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <StarRating rating={review.rating} />
                                <span className="text-xs text-muted-foreground">{reviewer}</span>
                            </div>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${
                            review.rating >= 4 ? 'text-emerald-600' :
                            review.rating >= 3 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                            {review.rating}.0
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default LatestReview