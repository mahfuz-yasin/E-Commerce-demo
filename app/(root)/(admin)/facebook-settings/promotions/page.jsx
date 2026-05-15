'use client'
import { useState, useEffect } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD, ADMIN_FACEBOOK_SETTINGS } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { Facebook, Gift, Percent, Tag, Clock } from 'lucide-react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_FACEBOOK_SETTINGS, label: 'Facebook Settings' },
  { href: '', label: 'Promotions' },
]

const FacebookPromotions = () => {
  const [loading, setLoading] = useState(false)
  const [validation, setValidation] = useState({})
  
  const [formData, setFormData] = useState({
    promotionStatus: 'inactive',
    promotionBannerText: '',
    promotionDiscountPercentage: 10,
    promotionDiscountCode: '',
    promotionCookieExpiration: 7
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/facebook-settings')
      if (data.success) {
        setFormData({
          promotionStatus: data.data.promotionStatus || 'inactive',
          promotionBannerText: data.data.promotionBannerText || '',
          promotionDiscountPercentage: data.data.promotionDiscountPercentage || 10,
          promotionDiscountCode: data.data.promotionDiscountCode || '',
          promotionCookieExpiration: data.data.promotionCookieExpiration || 7
        })
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const validateField = (field, value) => {
    let isValid = true
    if (field === 'promotionBannerText' && value && value.length < 5) {
      isValid = false
    }
    if (field === 'promotionDiscountCode' && value && value.length < 3) {
      isValid = false
    }
    setValidation(prev => ({ ...prev, [field]: isValid }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post('/api/admin/facebook-settings', formData)
      if (data.success) {
        showToast('success', data.message)
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <CardTitle>Facebook Promotions</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="promotionStatus">Enable Facebook Retargeting Banner</Label>
                <Switch
                  id="promotionStatus"
                  checked={formData.promotionStatus === 'active'}
                  onCheckedChange={(checked) => handleInputChange('promotionStatus', checked ? 'active' : 'inactive')}
                />
              </div>
              
              <p className="text-sm text-gray-600">
                When enabled, users coming from Facebook (with utm_source=facebook or fbclid) will see a promotional banner with a discount code.
              </p>
            </div>

            {formData.promotionStatus === 'active' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Banner Text</Label>
                  <Input
                    placeholder="Special Facebook Offer!"
                    value={formData.promotionBannerText}
                    onChange={(e) => handleInputChange('promotionBannerText', e.target.value)}
                    className={validation.promotionBannerText === false ? 'border-red-500' : validation.promotionBannerText === true ? 'border-green-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Percentage (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.promotionDiscountPercentage}
                    onChange={(e) => handleInputChange('promotionDiscountPercentage', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Code</Label>
                  <Input
                    placeholder="FB10OFF"
                    value={formData.promotionDiscountCode}
                    onChange={(e) => handleInputChange('promotionDiscountCode', e.target.value)}
                    className={validation.promotionDiscountCode === false ? 'border-red-500' : validation.promotionDiscountCode === true ? 'border-green-500' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cookie Expiration (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.promotionCookieExpiration}
                    onChange={(e) => handleInputChange('promotionCookieExpiration', parseInt(e.target.value) || 7)}
                  />
                  <p className="text-sm text-gray-600">How long the banner should not show again after being dismissed.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Preview</h4>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-4 relative">
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 rounded-full p-2">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">
                          {formData.promotionBannerText || 'Special Facebook Offer!'}
                        </h3>
                        <div className="bg-white/20 rounded p-2 mb-2">
                          <p className="text-xs opacity-90 mb-1">Use code at checkout:</p>
                          <code className="text-xl font-bold tracking-wider">
                            {formData.promotionDiscountCode || 'FB10OFF'}
                          </code>
                        </div>
                        <p className="text-sm opacity-90">
                          Get {formData.promotionDiscountPercentage}% off your first order!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="outline" onClick={fetchSettings} disabled={loading}>
              Reset
            </Button>
            <ButtonLoading loading={loading} type="submit" text="Save Changes" className="cursor-pointer" onClick={handleSave} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FacebookPromotions
