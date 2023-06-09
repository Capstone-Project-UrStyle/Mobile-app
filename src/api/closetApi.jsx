import axiosClient from './axiosClient'

const closetApi = {
    getListByUserId: (userId) => {
        const url = `api/closets/get-by-user/${userId}`
        return axiosClient.get(url)
    },
    getAllItemClosetByUserId: (userId) => {
        const url = `api/closets/get-all-item-closet-by-user/${userId}`
        return axiosClient.get(url)
    },
    getOneById: (id) => {
        const url = `api/closets/${id}`
        return axiosClient.get(url)
    },
    createNew: (data) => {
        const url = `api/closets`
        return axiosClient.post(url, data)
    },
    updateById: (id, data) => {
        const url = `/api/closets/${id}`
        return axiosClient.patch(url, data)
    },
    deleteById: (id) => {
        const url = `/api/closets/${id}`
        return axiosClient.delete(url)
    },
}

export default closetApi
