import axiosClient from './axiosClient'

const itemApi = {
    getOneById: (id) => {
        const url = `api/items/${id}`
        return axiosClient.get(url)
    },
    createNew: (data) => {
        const url = `api/items`
        return axiosClient.post(url, data)
    },
    updateById: (id, data) => {
        const url = `/api/items/${id}`
        return axiosClient.patch(url, data)
    },
    deleteById: (id) => {
        const url = `/api/items/${id}`
        return axiosClient.delete(url)
    },
}

export default itemApi
