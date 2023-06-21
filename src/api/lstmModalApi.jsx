import axiosClient from './axiosClient'

const lstmModalApi = {
    generateOutfitRecommendation: (data) => {
        const url = `api/lstm-model/generate-outfit-recommendation`
        return axiosClient.post(url, data)
    },
    createNewOccasion: (data) => {
        const url = `api/lstm-model/predict-fashion-compatibility`
        return axiosClient.post(url, data)
    },
}

export default lstmModalApi
