import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokSavedAudienceModel from "@/models/TikTokSavedAudience.model"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const filter = {}
    if (type) filter.type = type
    if (status) filter.status = status

    const audiences = await TikTokSavedAudienceModel.find(filter).sort({ createdAt: -1 })

    return response(true, 200, 'Saved audiences retrieved successfully', audiences)
  } catch (error) {
    console.error('Error fetching saved audiences:', error)
    return response(false, 500, error.message || 'Failed to fetch saved audiences')
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, description, targetingCriteria, type, size } = body

    if (!name) {
      return response(false, 400, 'Audience name is required')
    }

    if (!targetingCriteria) {
      return response(false, 400, 'Targeting criteria is required')
    }

    const audience = await TikTokSavedAudienceModel.create({
      name,
      description,
      targetingCriteria,
      type: type || 'SAVED',
      size,
      status: 'active'
    })

    return response(true, 200, 'Saved audience created successfully', audience)
  } catch (error) {
    console.error('Error creating saved audience:', error)
    return response(false, 500, error.message || 'Failed to create saved audience')
  }
}

export async function PUT(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { audienceId, name, description, targetingCriteria, status, sharedWith } = body

    if (!audienceId) {
      return response(false, 400, 'Audience ID is required')
    }

    const updateData = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (targetingCriteria) updateData.targetingCriteria = targetingCriteria
    if (status) updateData.status = status
    if (sharedWith) updateData.sharedWith = sharedWith

    const audience = await TikTokSavedAudienceModel.findByIdAndUpdate(
      audienceId,
      updateData,
      { new: true }
    )

    if (!audience) {
      return response(false, 404, 'Audience not found')
    }

    return response(true, 200, 'Saved audience updated successfully', audience)
  } catch (error) {
    console.error('Error updating saved audience:', error)
    return response(false, 500, error.message || 'Failed to update saved audience')
  }
}

export async function DELETE(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const audienceId = searchParams.get('audienceId')

    if (!audienceId) {
      return response(false, 400, 'Audience ID is required')
    }

    const audience = await TikTokSavedAudienceModel.findByIdAndDelete(audienceId)

    if (!audience) {
      return response(false, 404, 'Audience not found')
    }

    return response(true, 200, 'Saved audience deleted successfully')
  } catch (error) {
    console.error('Error deleting saved audience:', error)
    return response(false, 500, error.message || 'Failed to delete saved audience')
  }
}
