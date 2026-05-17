import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const errorData = await request.json()
    
    // Log to server console for production debugging
    console.error('=== CLIENT ERROR REPORT ===')
    console.error('Message:', errorData.message)
    console.error('Context:', errorData.context)
    console.error('Stack:', errorData.stack)
    console.error('Digest:', errorData.digest)
    console.error('URL:', errorData.url)
    console.error('Timestamp:', errorData.timestamp)
    console.error('===========================')
    
    return NextResponse.json({ logged: true })
  } catch (error) {
    return NextResponse.json({ logged: false }, { status: 500 })
  }
}
