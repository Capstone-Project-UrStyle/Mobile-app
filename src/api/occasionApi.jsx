import axiosClient from './axiosClient'

const occasionApi = {
    getAll: () => {
        const url = `api/occasions`
        return axiosClient.get(url)
    },
    createNew: (data) => {
        const url = `api/occasions`
        return axiosClient.post(url, data)
    },
    updateById: (id, data) => {
        const url = `/api/occasions/${id}`
        return axiosClient.patch(url, data)
    },
    deleteById: (id) => {
        const url = `/api/occasions/${id}`
        return axiosClient.delete(url)
    },
}

export default occasionApi
