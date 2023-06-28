import axiosClient from './axiosClient'

const lstmModalApi = {
    generateItemRecommendations: (data) => {
        const url = `api/lstm-model/generate-item-recommendations`
        return axiosClient.post(url, data)
    },
    generateOutfitRecommendations: (data) => {
        const url = `api/lstm-model/generate-outfit-recommendations`
        return axiosClient.post(url, data)
    },
}

export default lstmModalApi
