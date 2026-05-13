'use client'

import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

// 5 Color Palettes with 25 colors total
const colorPalettes = [
  {
    name: "Evergreen Classics",
    description: "High Demand",
    colors: [
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Off-White", hex: "#FAF9F6" },
      { name: "Jet Black", hex: "#0A0A0A" },
      { name: "Midnight Navy", hex: "#001F3F" },
      { name: "Deep Maroon", hex: "#4A0404" },
    ]
  },
  {
    name: "Festive & Royal",
    description: "Wedding & Eid",
    colors: [
      { name: "Royal Blue", hex: "#4169E1" },
      { name: "Emerald Green", hex: "#046307" },
      { name: "Mustard Yellow", hex: "#E1AD01" },
      { name: "Antique Gold", hex: "#C5A059" },
      { name: "Imperial Purple", hex: "#4B0082" },
    ]
  },
  {
    name: "Modern Pastels",
    description: "Trending/Summer",
    colors: [
      { name: "Dusty Rose", hex: "#DCAE96" },
      { name: "Mint Green", hex: "#98FF98" },
      { name: "Sky Blue", hex: "#87CEEB" },
      { name: "Lavender", hex: "#E6E6FA" },
      { name: "Soft Peach", hex: "#FFDAB9" },
    ]
  },
  {
    name: "Earthy & Sophisticated",
    description: "Designer Choice",
    colors: [
      { name: "Olive Drab", hex: "#6B8E23" },
      { name: "Coffee Brown", hex: "#4B3621" },
      { name: "Terracotta", hex: "#E2725B" },
      { name: "Sand Beige", hex: "#D2B48C" },
      { name: "Charcoal Gray", hex: "#36454F" },
    ]
  },
  {
    name: "Premium & Unique Shades",
    description: "Exclusive",
    colors: [
      { name: "Teal Blue", hex: "#008080" },
      { name: "Silver Gray", hex: "#C0C0C0" },
      { name: "Wine Red", hex: "#722F37" },
      { name: "Slate Blue", hex: "#708090" },
      { name: "Salmon Pink", hex: "#FF8C69" },
    ]
  },
]

const ColorPicker = ({ selectedColors, onChange }) => {
  const [customColors, setCustomColors] = useState([])
  const [newCustomName, setNewCustomName] = useState('')
  const [newCustomHex, setNewCustomHex] = useState('#000000')
  const [showCustomForm, setShowCustomForm] = useState(false)

  const toggleColor = (color) => {
    const exists = selectedColors.find(c => c.hex === color.hex)
    if (exists) {
      onChange(selectedColors.filter(c => c.hex !== color.hex))
    } else {
      onChange([...selectedColors, color])
    }
  }

  const addCustomColor = () => {
    if (newCustomName.trim() && newCustomHex) {
      const customColor = {
        name: newCustomName.trim(),
        hex: newCustomHex,
        isCustom: true
      }
      const updatedCustoms = [...customColors, customColor]
      setCustomColors(updatedCustoms)
      onChange([...selectedColors, customColor])
      setNewCustomName('')
      setNewCustomHex('#000000')
      setShowCustomForm(false)
    }
  }

  const removeCustomColor = (hex) => {
    setCustomColors(customColors.filter(c => c.hex !== hex))
    onChange(selectedColors.filter(c => c.hex !== hex))
  }

  const isSelected = (hex) => selectedColors.some(c => c.hex === hex)

  return (
    <div className="space-y-6">
      {/* Selected Colors Summary */}
      {selectedColors.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <Label className="text-sm font-medium mb-2 block">Selected Colors ({selectedColors.length})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color) => (
              <div
                key={color.hex}
                className="flex items-center gap-1.5 bg-white border rounded-full px-2 py-1 text-xs"
              >
                <div
                  className="w-4 h-4 rounded-full border shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="truncate max-w-[100px]">{color.name}</span>
                <button
                  onClick={() => toggleColor(color)}
                  className="ml-1 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Palettes */}
      <div className="space-y-4">
        {colorPalettes.map((palette) => (
          <div key={palette.name} className="border rounded-lg p-4">
            <div className="mb-3">
              <h4 className="font-semibold text-sm">{palette.name}</h4>
              <p className="text-xs text-gray-500">{palette.description}</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {palette.colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => toggleColor(color)}
                  className={`relative group rounded-lg p-2 border-2 transition-all ${
                    isSelected(color.hex)
                      ? 'border-amber-500 ring-2 ring-amber-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded-md shadow-sm mb-1"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-gray-600 block text-center truncate">
                    {color.name}
                  </span>
                  {isSelected(color.hex) && (
                    <div className="absolute top-1 right-1 bg-amber-500 rounded-full p-0.5">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Colors Section */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-sm">Custom Colors</h4>
            <p className="text-xs text-gray-500">Add your own colors</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            <Plus size={16} className="mr-1" />
            {showCustomForm ? 'Cancel' : 'Add Custom'}
          </Button>
        </div>

        {/* Custom Color Form */}
        {showCustomForm && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Color Name</Label>
                <Input
                  type="text"
                  placeholder="e.g., Coral Red"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Color Code</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newCustomHex}
                    onChange={(e) => setNewCustomHex(e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={newCustomHex}
                    onChange={(e) => setNewCustomHex(e.target.value)}
                    placeholder="#FF5733"
                    className="flex-1 text-sm uppercase"
                  />
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={addCustomColor}
              disabled={!newCustomName.trim()}
              size="sm"
              className="w-full"
            >
              Add Color
            </Button>
          </div>
        )}

        {/* Display Custom Colors */}
        {customColors.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {customColors.map((color) => (
              <div
                key={color.hex}
                className={`relative group rounded-lg p-2 border-2 ${
                  isSelected(color.hex)
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleColor(color)}
                  className="w-full"
                >
                  <div
                    className="w-full aspect-square rounded-md shadow-sm mb-1"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-gray-600 block text-center truncate">
                    {color.name}
                  </span>
                </button>
                <button
                  onClick={() => removeCustomColor(color.hex)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
                {isSelected(color.hex) && (
                  <div className="absolute top-1 right-1 bg-amber-500 rounded-full p-0.5">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorPicker
