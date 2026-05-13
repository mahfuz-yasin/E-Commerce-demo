import { response } from "@/lib/helperFunction"

export async function POST(request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
            return response(false, 400, 'No file uploaded')
        }

        // Convert file to base64 for storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        const mimeType = file.type
        const dataUrl = `data:${mimeType};base64,${base64}`

        return response(true, 200, 'File uploaded successfully', { url: dataUrl })
    } catch (error) {
        return response(false, 500, 'Failed to upload file')
    }
}
