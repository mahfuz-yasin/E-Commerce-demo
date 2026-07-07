'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { use, useEffect, useState } from 'react'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { IoMdAdd, IoMdRemove } from 'react-icons/io'
import { Package, Tag, Search, Settings, CreditCard, BarChart2, Plus, X } from 'lucide-react'
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Edit Product' },
]

const TABS = [
  { key: 'basic',    label: 'Basic Info',      icon: Package },
  { key: 'pricing',  label: 'Pricing & Stock', icon: BarChart2 },
  { key: 'details',  label: 'Description',     icon: Tag },
  { key: 'advanced', label: 'Advanced',        icon: Settings },
  { key: 'seo',      label: 'SEO',             icon: Search },
  { key: 'payment',  label: 'Payment',         icon: CreditCard },
]

const BADGE_OPTIONS = [
  { value: 'none', label: 'None' }, { value: 'new', label: 'New' },
  { value: 'sale', label: 'Sale' }, { value: 'hot', label: 'Hot' },
  { value: 'featured', label: 'Featured' }, { value: 'out_of_stock', label: 'Out of Stock' },
]

const FL = ({ label, required, children, half }) => (
  <div className={cn('space-y-1.5', half ? '' : '')}>
    <label className="text-xs font-semibold text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    {children}
  </div>
)

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0', value ? 'bg-emerald-500' : 'bg-muted-foreground/30')}>
    <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5', value ? 'translate-x-4' : 'translate-x-0.5')} />
  </button>
)

const EditProduct = ({ params }) => {
  const { id } = use(params)

  const [loading, setLoading]         = useState(false)
  const [activeTab, setActiveTab]     = useState('basic')
  const [categoryOption, setCategoryOption] = useState([])
  const [open, setOpen]               = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const [dataLoaded, setDataLoaded]   = useState(false)

  const { data: getCategory } = useFetch('/api/category?deleteType=SD&&size=10000')
  const { data: getProduct }  = useFetch(`/api/product/get/${id}`)

  // form state
  const [name, setName]               = useState('')
  const [slug, setSlug]               = useState('')
  const [category, setCategory]       = useState('')
  const [mrp, setMrp]                 = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [costPrice, setCostPrice]     = useState('')
  const [stock, setStock]             = useState('0')
  const [sku, setSku]                 = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')
  const [isActive, setIsActive]       = useState(true)
  const [badge, setBadge]             = useState('none')
  const [tags, setTags]               = useState([])
  const [tagInput, setTagInput]       = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription]   = useState([{ header: '', paragraph: '' }])
  const [weight, setWeight]           = useState('')
  const [dimL, setDimL]               = useState('')
  const [dimW, setDimW]               = useState('')
  const [dimH, setDimH]               = useState('')
  const [comboEnabled, setComboEnabled] = useState(false)
  const [comboMinQty, setComboMinQty] = useState('2')
  const [comboPrice, setComboPrice]   = useState('')
  const [comboDiscount, setComboDiscount] = useState('')
  const [seoTitle, setSeoTitle]       = useState('')
  const [seoDesc, setSeoDesc]         = useState('')
  const [seoKeywords, setSeoKeywords] = useState([])
  const [seoKwInput, setSeoKwInput]   = useState('')
  const [payments, setPayments]       = useState({ cod: true, bkash: true, nagad: true, card: true, bankTransfer: true })

  // Advanced toggles
  const [showOnWebsite, setShowOnWebsite]               = useState(true)
  const [freeDelivery, setFreeDelivery]                 = useState(false)
  const [allowBackorder, setAllowBackorder]             = useState(false)
  const [hideQuantitySelector, setHideQuantitySelector] = useState(false)
  const [isDigital, setIsDigital]                       = useState(false)

  // Extra fields
  const [additionalCost, setAdditionalCost] = useState('')
  const [youtubeUrl, setYoutubeUrl]         = useState('')
  const [internalNote, setInternalNote]     = useState('')

  // Badge extras
  const [showSaveAmountBadge, setShowSaveAmountBadge] = useState(false)
  const [specialPromoEnabled, setSpecialPromoEnabled] = useState(false)
  const [specialPromoTexts, setSpecialPromoTexts]     = useState('')

  useEffect(() => {
    if (getCategory?.success) {
      setCategoryOption(getCategory.data.map(c => ({ label: c.name, value: c._id })))
    }
  }, [getCategory])

  // Pre-populate all fields from existing product
  useEffect(() => {
    if (getProduct?.success && !dataLoaded) {
      const p = getProduct.data
      setName(p.name || '')
      setSlug(p.slug || '')
      setCategory(p.category?._id || p.category || '')
      setMrp(p.mrp ?? '')
      setSellingPrice(p.sellingPrice ?? '')
      setCostPrice(p.costPrice ?? '')
      setStock(p.stock ?? '0')
      setSku(p.sku || '')
      setLowStockThreshold(p.lowStockThreshold ?? '5')
      setIsActive(p.isActive !== false)
      setBadge(p.badge || 'none')
      setTags(p.tags || [])
      setShortDescription(p.shortDescription || p.description || '')
      setLongDescription(
        p.longDescription?.length > 0
          ? p.longDescription
          : [{ header: 'Description', paragraph: p.description || '' }]
      )
      setWeight(p.weight ?? '')
      setDimL(p.dimensions?.length ?? '')
      setDimW(p.dimensions?.width ?? '')
      setDimH(p.dimensions?.height ?? '')
      setComboEnabled(p.comboOffer?.enabled || false)
      setComboMinQty(p.comboOffer?.minQty ?? '2')
      setComboPrice(p.comboOffer?.comboPrice ?? '')
      setComboDiscount(p.comboOffer?.comboDiscount ?? '')
      setSeoTitle(p.seoTitle || '')
      setSeoDesc(p.seoDescription || '')
      setSeoKeywords(p.seoKeywords || [])
      setPayments(p.allowedPayments || { cod: true, bkash: true, nagad: true, card: true, bankTransfer: true })
      setShowOnWebsite(p.showOnWebsite !== false)
      setFreeDelivery(p.freeDelivery || false)
      setAllowBackorder(p.allowBackorder || false)
      setHideQuantitySelector(p.hideQuantitySelector || false)
      setIsDigital(p.isDigital || false)
      setAdditionalCost(p.additionalCost ?? '')
      setYoutubeUrl(p.youtubeUrl || '')
      setInternalNote(p.internalNote || '')
      setShowSaveAmountBadge(p.showSaveAmountBadge || false)
      setSpecialPromoEnabled(p.specialPromoBadge?.enabled || false)
      setSpecialPromoTexts((p.specialPromoBadge?.texts || []).join('\n'))
      if (p.media?.length) {
        setSelectedMedia(p.media.map(m => ({ _id: m._id, url: m.secure_url || m.url })))
      }
      setDataLoaded(true)
    }
  }, [getProduct, dataLoaded])

  const discountPct  = mrp > 0 && sellingPrice > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0
  const profitPerUnit = sellingPrice && costPrice ? (Number(sellingPrice) - Number(costPrice) - Number(additionalCost || 0)).toFixed(2) : null

  const addLongDesc   = () => setLongDescription(p => [...p, { header: '', paragraph: '' }])
  const removeLongDesc = (i) => setLongDescription(p => p.filter((_, idx) => idx !== i))
  const updateLongDesc = (i, field, val) => setLongDescription(p => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  const addTag    = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags(p => [...p, tagInput.trim()]); setTagInput('') } }
  const addSeoKw  = () => { if (seoKwInput.trim() && !seoKeywords.includes(seoKwInput.trim())) { setSeoKeywords(p => [...p, seoKwInput.trim()]); setSeoKwInput('') } }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name || !category || !mrp || !sellingPrice) return showToast('error', 'Name, Category, MRP, Selling Price required.')
    if (selectedMedia.length === 0) return showToast('error', 'Please select at least one image.')
    if (longDescription.some(s => !s.header || !s.paragraph)) return showToast('error', 'All long description sections must be filled.')
    setLoading(true)
    try {
      const payload = {
        _id: id,
        name, slug, category,
        mrp: Number(mrp), sellingPrice: Number(sellingPrice), discountPercentage: discountPct,
        costPrice: Number(costPrice) || 0,
        additionalCost: Number(additionalCost) || 0,
        stock: Number(stock) || 0,
        sku: sku || null,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        isActive, badge, tags,
        showOnWebsite, freeDelivery, allowBackorder, hideQuantitySelector, isDigital,
        youtubeUrl: youtubeUrl || null,
        internalNote: internalNote || null,
        showSaveAmountBadge,
        specialPromoBadge: {
          enabled: specialPromoEnabled,
          texts: specialPromoTexts.split('\n').map(t => t.trim()).filter(Boolean),
        },
        shortDescription, longDescription,
        weight: weight ? Number(weight) : null,
        dimensions: { length: dimL ? Number(dimL) : null, width: dimW ? Number(dimW) : null, height: dimH ? Number(dimH) : null },
        comboOffer: { enabled: comboEnabled, minQty: Number(comboMinQty), comboPrice: Number(comboPrice) || 0, comboDiscount: Number(comboDiscount) || 0 },
        seoTitle: seoTitle || null,
        seoDescription: seoDesc || null,
        seoKeywords,
        allowedPayments: payments,
        media: selectedMedia.map(m => m._id),
      }
      const { data } = await axios.put('/api/product/update', payload)
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message)
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!dataLoaded && getProduct === undefined) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        Loading product...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Tab nav */}
        <div className="flex gap-1 flex-wrap border-b border-border/60">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
                className={cn('flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 -mb-px transition-all',
                  activeTab === t.key ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            )
          })}
        </div>

        {/* BASIC INFO */}
        {activeTab === 'basic' && (
          <Card className="py-0 rounded-xl shadow-sm">
            <CardHeader className="px-5 py-3.5 border-b bg-muted/30">
              <h4 className="text-sm font-semibold">Basic Information</h4>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FL label="Product Name" required><Input value={name} onChange={e => setName(e.target.value)} /></FL>
                <FL label="Slug" required><Input value={slug} onChange={e => setSlug(e.target.value)} /></FL>
                <FL label="Category" required>
                  <Select options={categoryOption} selected={category} setSelected={setCategory} isMulti={false} />
                </FL>
                <FL label="SKU"><Input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. PROD-001" /></FL>
                <FL label="Badge">
                  <select value={badge} onChange={e => setBadge(e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {BADGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FL>
                <FL label="Status">
                  <div className="flex items-center gap-3 h-9">
                    <Toggle value={isActive} onChange={setIsActive} />
                    <span className={cn('text-sm font-medium', isActive ? 'text-emerald-600' : 'text-muted-foreground')}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </FL>
              </div>

              <FL label="Tags">
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Type tag and press Enter" className="flex-1" />
                  <Button type="button" size="sm" variant="outline" onClick={addTag}><Plus className="w-3 h-3" /></Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {t}<button type="button" onClick={() => setTags(p => p.filter(x => x !== t))}><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </FL>

              <FL label="Product Images" required>
                <div className="border border-dashed rounded-xl p-4 space-y-3">
                  <MediaModal open={open} setOpen={setOpen} selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} isMultiple={true} />
                  {selectedMedia.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.map(m => (
                        <div key={m._id} className="relative h-20 w-20 border rounded-lg overflow-hidden">
                          <Image src={m.url} fill alt="" className="object-cover" />
                          <button type="button" onClick={() => setSelectedMedia(p => p.filter(x => x._id !== m._id))}
                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs gap-1">
                    <Plus className="w-3 h-3" /> Change Images
                  </Button>
                </div>
              </FL>
            </CardContent>
          </Card>
        )}

        {/* PRICING & STOCK */}
        {activeTab === 'pricing' && (
          <Card className="py-0 rounded-xl shadow-sm">
            <CardHeader className="px-5 py-3.5 border-b bg-muted/30">
              <h4 className="text-sm font-semibold">Pricing & Stock</h4>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <FL label="MRP / Original Price (৳)" required>
                  <Input type="number" min="0" value={mrp} onChange={e => setMrp(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">আগের দাম — কেটে ডিসকাউন্ট দেখাবে</p>
                </FL>
                <FL label="Selling Price (৳)" required>
                  <Input type="number" min="0" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
                </FL>
                <FL label="Purchase / Cost Price (৳)">
                  <Input type="number" min="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0" />
                </FL>
                <FL label="Additional Cost (৳)">
                  <Input type="number" min="0" value={additionalCost} onChange={e => setAdditionalCost(e.target.value)} placeholder="0" />
                  <p className="text-[10px] text-muted-foreground mt-1">প্যাকেজিং, শিপিং ইত্যাদি বাড়তি খরচ</p>
                </FL>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-sm flex flex-wrap gap-x-5 gap-y-1">
                <span>Discount: <span className="font-bold text-emerald-600">{discountPct}%</span></span>
                {profitPerUnit !== null && <span>PROFIT PER UNIT: <span className={cn('font-bold', Number(profitPerUnit) >= 0 ? 'text-emerald-600' : 'text-red-600')}>৳{profitPerUnit}</span></span>}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <FL label="Stock Quantity"><Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} /></FL>
                <FL label="Low Stock Threshold"><Input type="number" min="0" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} /></FL>
                <FL label="Weight (grams)"><Input type="number" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 500" /></FL>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <FL label="Length (cm)"><Input type="number" min="0" value={dimL} onChange={e => setDimL(e.target.value)} placeholder="0" /></FL>
                <FL label="Width (cm)"><Input type="number" min="0" value={dimW} onChange={e => setDimW(e.target.value)} placeholder="0" /></FL>
                <FL label="Height (cm)"><Input type="number" min="0" value={dimH} onChange={e => setDimH(e.target.value)} placeholder="0" /></FL>
              </div>
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Combo Offer</p>
                  <Toggle value={comboEnabled} onChange={setComboEnabled} />
                </div>
                {comboEnabled && (
                  <div className="grid md:grid-cols-3 gap-3 pt-1">
                    <FL label="Min Qty"><Input type="number" min="2" value={comboMinQty} onChange={e => setComboMinQty(e.target.value)} /></FL>
                    <FL label="Combo Price"><Input type="number" min="0" value={comboPrice} onChange={e => setComboPrice(e.target.value)} placeholder="0" /></FL>
                    <FL label="Combo Discount %"><Input type="number" min="0" max="100" value={comboDiscount} onChange={e => setComboDiscount(e.target.value)} placeholder="0" /></FL>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* DESCRIPTION */}
        {activeTab === 'details' && (
          <Card className="py-0 rounded-xl shadow-sm">
            <CardHeader className="px-5 py-3.5 border-b bg-muted/30">
              <h4 className="text-sm font-semibold">Product Description</h4>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <FL label="Short Description" required>
                <Textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="min-h-[80px]" />
              </FL>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Long Description Sections<span className="text-red-500 ml-0.5">*</span></label>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addLongDesc}><IoMdAdd /> Add Section</Button>
                </div>
                <div className="space-y-3">
                  {longDescription.map((s, i) => (
                    <div key={i} className="border rounded-xl p-4 bg-muted/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Section {i + 1}</span>
                        {longDescription.length > 1 && (
                          <Button type="button" variant="destructive" size="sm" className="h-6 text-xs" onClick={() => removeLongDesc(i)}><IoMdRemove /> Remove</Button>
                        )}
                      </div>
                      <Input placeholder="Section header" value={s.header} onChange={e => updateLongDesc(i, 'header', e.target.value)} />
                      <Textarea placeholder="Section paragraph" className="min-h-[80px]" value={s.paragraph} onChange={e => updateLongDesc(i, 'paragraph', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ADVANCED */}
        {activeTab === 'advanced' && (
          <Card className="py-0 rounded-xl shadow-sm">
            <CardHeader className="px-5 py-3.5 border-b bg-muted/30">
              <h4 className="text-sm font-semibold">Advanced Settings</h4>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Behaviour Toggles */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product Behaviour</p>
                {[
                  { state: showOnWebsite,       set: setShowOnWebsite,       label: 'ওয়েবসাইটে দেখাবে না',          desc: 'বন্ধ থাকলে শুধু Landing Page-এ দেখাবে', onColor: 'bg-emerald-500', invert: true },
                  { state: freeDelivery,         set: setFreeDelivery,         label: 'ফ্রি ডেলিভারি',                 desc: 'এই পণ্যে কোনো ডেলিভারি চার্জ নেই', onColor: 'bg-emerald-500', invert: false },
                  { state: allowBackorder,       set: setAllowBackorder,       label: 'স্টক শেষেও অর্ডার নিন',        desc: 'স্টক ০ হলেও Back-order গ্রহণ করবে', onColor: 'bg-blue-500',   invert: false },
                  { state: hideQuantitySelector, set: setHideQuantitySelector, label: 'Quantity Selector লুকান',       desc: 'কাস্টমার পরিমাণ পরিবর্তন করতে পারবে না', onColor: 'bg-amber-500',  invert: false },
                  { state: isDigital,            set: setIsDigital,            label: 'ডিজিটাল প্রোডাক্ট',            desc: 'Checkout-এ Address এর বদলে Email চাইবে', onColor: 'bg-violet-500', invert: false },
                ].map(({ state, set, label, desc, onColor, invert }) => {
                  const active = invert ? !state : state
                  return (
                    <div key={label} className={cn('flex items-center justify-between p-3.5 rounded-xl border transition-all', active ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-border bg-muted/10')}>
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                      <Toggle value={invert ? !state : state} onChange={v => set(invert ? !v : v)} />
                    </div>
                  )
                })}
              </div>

              {/* Badge Extras */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Badge Settings</p>
                <div className={cn('flex items-center justify-between p-3.5 rounded-xl border transition-all', showSaveAmountBadge ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-border bg-muted/10')}>
                  <div>
                    <p className="text-sm font-medium">Show Save Amount Badge</p>
                    <p className="text-[10px] text-muted-foreground">"Save ৳XXX" badge দেখাবে প্রোডাক্ট কার্ডে</p>
                  </div>
                  <Toggle value={showSaveAmountBadge} onChange={setShowSaveAmountBadge} />
                </div>
                <div className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Special Promo Badge</p>
                      <p className="text-[10px] text-muted-foreground">Animated badge — একাধিক text দিলে rotate করবে</p>
                    </div>
                    <Toggle value={specialPromoEnabled} onChange={setSpecialPromoEnabled} />
                  </div>
                  {specialPromoEnabled && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Badge Texts (একটি প্রতি লাইন)</label>
                      <Textarea value={specialPromoTexts} onChange={e => setSpecialPromoTexts(e.target.value)}
                        placeholder={"Limited Offer!\n🔥 Trending\nশেষ সুযোগ!"} className="min-h-[80px] font-mono text-xs" />
                    </div>
                  )}
                </div>
              </div>

              {/* YouTube + Internal Note */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extra Info</p>
                <FL label="YouTube Video URL">
                  <Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                  <p className="text-[10px] text-muted-foreground mt-1">প্রোডাক্ট পেজে ভিডিও embed হবে</p>
                </FL>
                <FL label="Internal Note (Admin only)">
                  <Textarea value={internalNote} onChange={e => setInternalNote(e.target.value)}
                    className="min-h-[70px]" placeholder="কাস্টমার দেখবে না — শুধু admin নোট" />
                </FL>
              </div>

              <p className="text-xs text-muted-foreground">Variations (size, color) Product Variants page থেকে manage করুন।</p>
            </CardContent>
          </Card>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <Card className="py-0 rounded-xl shadow-sm">
            <CardHeader className="px-5 py-3.5 border-b bg-muted/30">
              <h4 className="text-sm font-semibold">SEO Settings</h4>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <FL label="SEO Title">
                <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={name || 'SEO title'} />
                <p className="text-[10px] text-muted-foreground mt-1">{seoTitle.length}/60</p>
              </FL>
              <FL label="SEO Description">
                <Textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="min-h-[80px]" />
                <p className="text-[10px] text-muted-foreground mt-1">{seoDesc.length}/160</p>
              </FL>
              <FL label="SEO Keywords">
                <div className="flex gap-2">
                  <Input value={seoKwInput} onChange={e => setSeoKwInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSeoKw())}
                    placeholder="Add keyword and press Enter" className="flex-1" />
                  <Button type="button" size="sm" variant="outline" onClick={addSeoKw}><Plus className="w-3 h-3" /></Button>
                </div>
                {seoKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {seoKeywords.map(k => (
                      <span key={k} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {k}<button type="button" onClick={() => setSeoKeywords(p => p.filter(x => x !== k))}><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </FL>
              {(seoTitle || name) && (
                <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Search Preview</p>
                  <p className="text-sm font-medium text-blue-600">{seoTitle || name}</p>
                  <p className="text-[10px] text-emerald-700">yoursite.com/products/{slug}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{seoDesc || shortDescription || 'No description.'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* PAYMENT */}
        {activeTab === 'payment' && (
          <Card className="py-0 rounded-xl shadow-sm">
            <CardHeader className="px-5 py-3.5 border-b bg-muted/30">
              <h4 className="text-sm font-semibold">Payment Method Settings</h4>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs text-muted-foreground">এই পণ্যের জন্য কোন payment methods allowed থাকবে তা নির্বাচন করুন।</p>
              <div className="space-y-2">
                {[
                  { key: 'cod',          label: 'Cash on Delivery (COD)', cls: 'text-emerald-600' },
                  { key: 'bkash',        label: 'bKash',                  cls: 'text-pink-600' },
                  { key: 'nagad',        label: 'Nagad',                  cls: 'text-orange-600' },
                  { key: 'card',         label: 'Credit / Debit Card',    cls: 'text-blue-600' },
                  { key: 'bankTransfer', label: 'Bank Transfer',          cls: 'text-violet-600' },
                ].map(p => (
                  <div key={p.key} className={cn(
                    'flex items-center justify-between p-3.5 rounded-xl border transition-all',
                    payments[p.key] ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border bg-muted/10'
                  )}>
                    <span className={cn('text-sm font-medium', payments[p.key] ? p.cls : 'text-muted-foreground')}>{p.label}</span>
                    <Toggle value={payments[p.key]} onChange={v => setPayments(prev => ({ ...prev, [p.key]: v }))} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <ButtonLoading loading={loading} type="submit" text="Save Changes" className="cursor-pointer" />
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

export default EditProduct