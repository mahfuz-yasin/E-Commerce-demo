'use client'
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import { CldUploadWidget } from 'next-cloudinary';
import { FiPlus } from "react-icons/fi";

const UploadMedia = ({ isMultiple, queryClient }) => {

    const handleOnError = (error) => {
        const message = error?.message || error?.statusText || JSON.stringify(error)
        showToast('error', message)
    }

    const getThumbnailUrl = (secureUrl, publicId) => {
        if (secureUrl) {
            return secureUrl.replace('/upload/', '/upload/c_thumb,w_200/')
        }
        return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_thumb,w_200/${publicId}`
    }

    const handleOnQueueEnd = async (results) => {
        const files = results.info.files
        const uploadedFiles = files.filter(file => file.uploadInfo).map(file => ({
            asset_id: file.uploadInfo.asset_id,
            public_id: file.uploadInfo.public_id,
            secure_url: file.uploadInfo.secure_url,
            path: file.uploadInfo.secure_url || file.uploadInfo.url,
            thumbnail_url: getThumbnailUrl(file.uploadInfo.secure_url, file.uploadInfo.public_id),
        }))

        if (uploadedFiles.length > 0) {
            try {
                const { data: mediaUploadResponse } = await axios.post('/api/media/create', uploadedFiles)
                if (!mediaUploadResponse.success) {
                    throw new Error(mediaUploadResponse.message)
                }

                queryClient.invalidateQueries(['media-data'])
                showToast('success', mediaUploadResponse.message)

            } catch (error) {
                showToast('error', error.message)
            }
        }
    }

    return (
        <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onError={handleOnError}
            onQueuesEnd={handleOnQueueEnd}
            config={{
                cloud: {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                }
            }}

            options={{
                multiple: isMultiple,
                sources: ['local', 'url', 'unsplash', 'google_drive'],
            }}
        >

            {({ open }) => {
                return (
                    <Button onClick={() => open()}>
                        <FiPlus />
                        Upload Media
                    </Button>
                );
            }}

        </CldUploadWidget>
    )
}

export default UploadMedia