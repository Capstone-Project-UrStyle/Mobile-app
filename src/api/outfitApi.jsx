import axiosClient from './axiosClient'

const outfitApi = {
    getListByUserId: (userId) => {
        const url = `api/outfits/get-by-user/${userId}`
        return axiosClient.get(url)
    },
    getOneById: (id) => {
        const url = `api/outfits/${id}`
        return axiosClient.get(url)
    },
    createNew: (data) => {
        const url = `api/outfits`
        return axiosClient.post(url, data)
    },
    updateById: (id, data) => {
        const url = `/api/outfits/${id}`
        return axiosClient.patch(url, data)
    },
    deleteById: (id) => {
        const url = `/api/outfits/${id}`
        return axiosClient.delete(url)
    },
}

export default outfitApi
