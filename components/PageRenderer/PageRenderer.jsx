'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import Image from "next/image"

const PageRenderer = ({ page }) => {
    if (!page || !page.components) {
        return <div className="p-8 text-center">No content available</div>
    }

    const renderComponent = (component, index) => {
        const { type, content, styles } = component
        const componentStyle = {
            padding: styles?.padding || '16px',
            margin: styles?.margin || '0',
            backgroundColor: styles?.backgroundColor || 'transparent',
            color: styles?.textColor || '#000000'
        }

        switch (type) {
            case 'hero':
                return (
                    <div key={index} style={componentStyle} className="text-center py-16 px-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title}</h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-600">{content.subtitle}</p>
                        {content.buttonText && (
                            <Button size="lg" asChild>
                                <a href={content.buttonLink}>{content.buttonText}</a>
                            </Button>
                        )}
                    </div>
                )

            case 'text':
                return (
                    <div key={index} style={componentStyle} className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: content.text }} />
                    </div>
                )

            case 'image':
                return (
                    <div key={index} style={componentStyle} className="relative">
                        {content.url ? (
                            <Image
                                src={content.url}
                                alt={content.alt || 'Image'}
                                width={800}
                                height={400}
                                className="w-full rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                            </div>
                        )}
                        {content.caption && (
                            <p className="text-center mt-2 text-gray-600">{content.caption}</p>
                        )}
                    </div>
                )

            case 'button':
                return (
                    <div key={index} style={componentStyle} className="text-center">
                        <Button variant={content.variant || 'default'} asChild>
                            <a href={content.link}>{content.text}</a>
                        </Button>
                    </div>
                )

            case 'section':
                return (
                    <div key={index} style={{ ...componentStyle, backgroundColor: content.backgroundColor || '#ffffff', padding: content.padding || '40px' }}>
                        <div className="max-w-6xl mx-auto">
                            {/* Section content can be nested components */}
                        </div>
                    </div>
                )

            case 'spacer':
                return (
                    <div key={index} style={{ height: content.height || '40px' }} />
                )

            case 'divider':
                return (
                    <div key={index} style={componentStyle}>
                        <hr style={{ borderColor: content.color || '#e5e7eb', borderWidth: content.thickness || '1px' }} />
                    </div>
                )

            case 'video':
                return (
                    <div key={index} style={componentStyle} className="aspect-video">
                        {content.url ? (
                            <iframe
                                src={content.url}
                                className="w-full h-full rounded-lg"
                                allowFullScreen
                                title="Video"
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">No video</span>
                            </div>
                        )}
                    </div>
                )

            case 'gallery':
                return (
                    <div key={index} style={componentStyle} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {content.images && content.images.length > 0 ? (
                            content.images.map((img, imgIndex) => (
                                <div key={imgIndex} className="relative aspect-square">
                                    <Image
                                        src={img.url}
                                        alt={img.alt || 'Gallery image'}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">No images in gallery</span>
                            </div>
                        )}
                    </div>
                )

            case 'form':
                return (
                    <div key={index} style={componentStyle} className="max-w-md mx-auto">
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" className="w-full p-2 border rounded" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" className="w-full p-2 border rounded" placeholder="your@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea className="w-full p-2 border rounded" rows={4} placeholder="Your message" />
                            </div>
                            <Button type="submit" className="w-full">Submit</Button>
                        </form>
                    </div>
                )

            default:
                return <div key={index} style={componentStyle}>Unknown component type: {type}</div>
        }
    }

    return (
        <div className="min-h-screen">
            {page.components
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((component, index) => renderComponent(component, index))}
        </div>
    )
}

export default PageRenderer
