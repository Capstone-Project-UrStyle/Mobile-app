import axiosClient from './axiosClient'

const headerConfig = {
    headers: {
        'content-type': 'multipart/form-data',
    },
}

const uploadImageApi = {
    uploadUserAvatar: (userId, image) => {
        const url = `/api/upload/avatar/user/${userId}`
        return axiosClient.post(url, image, headerConfig)
    },
    uploadItemImage: (itemId, image) => {
        const url = `/api/upload/image/item/${itemId}`
        return axiosClient.post(url, image, headerConfig)
    },
    uploadOutfitImage: (outfitId, image) => {
        const url = `/api/upload/image/outfit/${outfitId}`
        return axiosClient.post(url, image, headerConfig)
    },
}

export default uploadImageApi
