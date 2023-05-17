import axiosClient from './axiosClient'

const masterDataApi = {
    getMasterData: () => {
        const url = `api/master-data`
        return axiosClient.get(url)
    },
    createNewOccasion: (data) => {
        const url = `api/master-data/occasions`
        return axiosClient.post(url, data)
    },
    updateOccasionById: (id, data) => {
        const url = `/api/master-data/occasions/${id}`
        return axiosClient.patch(url, data)
    },
    deleteOccasionById: (id) => {
        const url = `/api/master-data/occasions/${id}`
        return axiosClient.delete(url)
    },
}

export default masterDataApi
