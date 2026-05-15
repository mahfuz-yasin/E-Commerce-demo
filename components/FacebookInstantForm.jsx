'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Facebook } from 'lucide-react'

export default function FacebookInstantForm({ pageId, formId, buttonText = 'Get Offer', className = '' }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!pageId || !formId) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Facebook className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <div className="w-full h-[600px]">
          <iframe
            src={`https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/${pageId}&tabs=messages&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
            width="100%"
            height="100%"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowTransparency="true"
            allow="encrypted-media"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
