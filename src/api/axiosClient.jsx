import axios from 'axios'
import { parse, stringify } from 'qs'

export const BASE_API_URL = 'http://192.168.1.180:8000/'

const axiosClient = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
    },
    paramsSerializer: {
        encode: parse,
        serialize: stringify,
    },
})

export default axiosClient
