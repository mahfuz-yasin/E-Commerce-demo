'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronRight, CheckCircle, ExternalLink } from 'lucide-react'

const GoogleSetupGuide = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Google Cloud Console',
      description: 'Enable required APIs for Google integration',
      items: [
        { text: 'Go to console.cloud.google.com', link: 'https://console.cloud.google.com' },
        { text: 'Create a new project or select existing', link: null },
        { text: 'Enable Analytics Reporting API', link: 'https://console.cloud.google.com/apis/library/analyticsreporting.googleapis.com' },
        { text: 'Enable Google Ads API', link: 'https://console.cloud.google.com/apis/library/googleads.googleapis.com' },
        { text: 'Enable Google Merchant API', link: 'https://console.cloud.google.com/apis/library/content.googleapis.com' }
      ]
    },
    {
      title: 'Create Service Account',
      description: 'Set up authentication for API access',
      items: [
        { text: 'Go to IAM & Admin > Service Accounts', link: 'https://console.cloud.google.com/iam-admin/serviceaccounts' },
        { text: 'Create a new service account', link: null },
        { text: 'Download JSON key file', link: null },
        { text: 'Grant Analytics and Ads permissions', link: null },
        { text: 'Set environment variable GOOGLE_SERVICE_ACCOUNT_KEY', link: null }
      ]
    },
    {
      title: 'Get GA4 Property',
      description: 'Set up Google Analytics 4 for your website',
      items: [
        { text: 'Go to analytics.google.com', link: 'https://analytics.google.com' },
        { text: 'Create a GA4 property', link: null },
        { text: 'Get Measurement ID (G-XXXXXXXXX)', link: null },
        { text: 'Get Property ID from Admin > Property Settings', link: null },
        { text: 'Configure data streams', link: null }
      ]
    },
    {
      title: 'Get Merchant Center ID',
      description: 'Set up Google Shopping for product ads',
      items: [
        { text: 'Go to merchants.google.com', link: 'https://merchants.google.com' },
        { text: 'Create a Merchant Center account', link: null },
        { text: 'Get 12-digit Merchant Center ID', link: null },
        { text: 'Claim and verify website URL', link: null },
        { text: 'Set up product feed', link: null }
      ]
    },
    {
      title: 'Configure in Admin',
      description: 'Enter credentials in Google Settings',
      items: [
        { text: 'Go to Admin > Google Settings', link: null },
        { text: 'Enter GA4 Measurement ID', link: null },
        { text: 'Enter GA4 Property ID', link: null },
        { text: 'Enter Google Ads Customer ID', link: null },
        { text: 'Enter Merchant Center ID', link: null }
      ]
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google Integration Setup Guide</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}: {currentStepData.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-sm text-gray-600">{currentStepData.description}</p>
          </div>

          {/* Step items */}
          <div className="space-y-3">
            {currentStepData.items.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{item.text}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      Open link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="cursor-pointer"
            >
              Previous
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={onClose} className="cursor-pointer">
                Complete Setup
              </Button>
            ) : (
              <Button onClick={handleNext} className="cursor-pointer">
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GoogleSetupGuide
