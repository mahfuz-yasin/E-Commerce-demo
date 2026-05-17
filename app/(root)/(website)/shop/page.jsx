import React, { Suspense } from 'react'
import ShopContent from './ShopContent'

const Shop = () => {
    return (
        <Suspense fallback={<div className='p-10 text-center'>Loading shop...</div>}>
            <ShopContent />
        </Suspense>
    )
}

export default Shop