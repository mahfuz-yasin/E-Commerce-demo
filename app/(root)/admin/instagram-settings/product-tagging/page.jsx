'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { ADMIN_DASHBOARD, ADMIN_INSTAGRAM_SETTINGS } from '@/routes/AdminPanelRoute'
import { ShoppingBag, Tag, CheckCircle, ExternalLink, Package, Link2, Image as ImageIcon, Upload, CheckSquare, Square, Search } from 'lucide-react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_INSTAGRAM_SETTINGS, label: 'Instagram Business' },
    { href: '', label: 'Product Tagging' },
]

export default function InstagramProductTaggingPage() {
    const [config, setConfig] = useState({
        shop: {
            isEnabled: false,
            productCatalogId: '',
            checkoutEnabled: false
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProducts, setSelectedProducts] = useState([])

    // Mock products data
    const mockProducts = [
        { id: 1, name: 'Premium Panjabi - Black', slug: 'premium-panjabi-black', image: '/placeholder.jpg', price: 2500, tagged: true },
        { id: 2, name: 'Premium Panjabi - White', slug: 'premium-panjabi-white', image: '/placeholder.jpg', price: 2500, tagged: true },
        { id: 3, name: 'Classic Panjabi - Navy', slug: 'classic-panjabi-navy', image: '/placeholder.jpg', price: 1800, tagged: false },
        { id: 4, name: 'Designer Panjabi - Maroon', slug: 'designer-panjabi-maroon', image: '/placeholder.jpg', price: 3200, tagged: true },
        { id: 5, name: 'Casual Panjabi - Gray', slug: 'casual-panjabi-gray', image: '/placeholder.jpg', price: 1500, tagged: false },
    ]

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get('/api/admin/instagram/config')
            if (data.success && data.data) {
                setConfig(prev => ({
                    ...prev,
                    shop: data.data.shop || prev.shop
                }))
            }
        } catch (error) {
            console.log('No existing config found')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data } = await axios.post('/api/admin/instagram/config', {
                shop: config.shop
            })
            
            if (!data.success) {
                throw new Error(data.message)
            }

            showToast('success', 'Product tagging settings saved!')
            
        } catch (error) {
            console.error('Save error:', error)
            showToast('error', error.message || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const updateField = (path, value) => {
        setConfig(prev => {
            const newConfig = { ...prev }
            const keys = path.split('.')
            let current = newConfig
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]]
            }
            current[keys[keys.length - 1]] = value
            return newConfig
        })
    }

    const toggleProductTag = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const filteredProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            
            <div className="border rounded-lg overflow-hidden">
                <div className="py-3 px-5 border-b bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        <h4 className="text-lg font-bold">Product Tagging</h4>
                    </div>
                </div>

                <div className="p-5 space-y-6">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg ${config.shop?.isEnabled ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-center gap-3">
                            {config.shop?.isEnabled ? (
                                <>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-green-800">Product Tagging Enabled</h5>
                                        <p className="text-green-600 text-sm">
                                            Products can be tagged in Instagram posts and stories
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Tag className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-yellow-800">Product Tagging Disabled</h5>
                                        <p className="text-yellow-600 text-sm">
                                            Enable Instagram Shop to start tagging products
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Shop Configuration */}
                    <div className="border rounded-lg p-5">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-indigo-600" />
                            Shop Configuration
                        </h5>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Catalog ID
                                </label>
                                <input
                                    type="text"
                                    value={config.shop?.productCatalogId || ''}
                                    onChange={(e) => updateField('shop.productCatalogId', e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter Product Catalog ID"
                                />
                            </div>
                            <div className="flex items-end">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg w-full">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.shop?.checkoutEnabled || false}
                                            onChange={(e) => updateField('shop.checkoutEnabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                    <div>
                                        <p className="font-medium text-gray-800">In-App Checkout</p>
                                        <p className="text-sm text-gray-500">Allow checkout on Instagram</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-600" />
                                Products for Tagging
                            </h5>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                                    placeholder="Search products..."
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className={`border rounded-lg p-4 hover:shadow-md transition-all ${
                                        selectedProducts.includes(product.id) || product.tagged
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                            <p className="text-sm text-gray-500">৳{product.price}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {product.tagged ? (
                                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                                        <CheckCircle className="w-3 h-3" /> Tagged
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not tagged</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleProductTag(product.id)}
                                            className="flex-shrink-0"
                                        >
                                            {selectedProducts.includes(product.id) || product.tagged ? (
                                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {filteredProducts.length} products found
                            </p>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Sync to Instagram
                            </button>
                        </div>
                    </div>

                    {/* Tagging Guidelines */}
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                            <Link2 className="w-5 h-5" />
                            Product Tagging Guidelines
                        </h5>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="font-medium text-blue-900">Requirements:</p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Instagram Shop must be enabled</li>
                                    <li>• Product catalog must be connected</li>
                                    <li>• Products must have valid images</li>
                                    <li>• Prices and availability must be accurate</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium text-blue-900">Best Practices:</p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Tag products in high-quality photos</li>
                                    <li>• Ensure product visibility in the image</li>
                                    <li>• Update inventory regularly</li>
                                    <li>• Monitor tagged product performance</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <ButtonLoading
                            type="button"
                            loading={saving}
                            onClick={handleSave}
                            text="Save Tagging Settings"
                            className="bg-indigo-600 hover:bg-indigo-700"
                        />
                        <a
                            href="https://business.facebook.com/commerce/catalogs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Commerce Manager
                        </a>
                        <a
                            href="https://business.facebook.com/business/help/898752977282997"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Shopping Help
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
