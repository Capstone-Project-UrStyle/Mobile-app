import React, { useCallback, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import {
    USERS,
    FOLLOWING,
    TRENDING,
    CATEGORIES,
    ARTICLES,
} from '../constants/mocks'
import { light } from '../constants'

import axiosClient from '../api/axiosClient'
import authApi from '../api/auth'
import masterDataApi from '../api/masterDataApi'

export const DataContext = React.createContext({})

export const DataProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState(null)
    const [isDark, setIsDark] = useState(false)
    const [theme, setTheme] = useState(light)
    const [showModal, setShowModal] = useState(false)
    const [modalContent, setModalContent] = useState(null)
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [masterData, setMasterData] = useState(null)
    const [refreshImage, forceRefreshImage] = useState(false)
    const [homeTab, setHomeTab] = useState(0)

    const [users, setUsers] = useState(USERS)
    const [following, setFollowing] = useState(FOLLOWING)
    const [trending, setTrending] = useState(TRENDING)
    const [categories, setCategories] = useState(CATEGORIES)
    const [articles, setArticles] = useState(ARTICLES)
    const [article, setArticle] = useState({})

    // Handle close modal
    const handleCloseModal = useCallback(() => {
        setShowModal(false)
        setModalContent(null)
    }, [setShowModal, setModalContent])

    // Handle set isLoading mode
    const handleSetIsLoading = useCallback(
        (payload) => {
            // Set isLoading / compare if has updated
            setIsLoading(payload)
            // Save preferance to storage
            AsyncStorage.setItem('isLoading', JSON.stringify(payload))
        },
        [setIsLoading],
    )

    // Get isDark mode from storage
    const getIsDark = useCallback(async () => {
        // Get preferance gtom storage
        const isDarkJSON = await AsyncStorage.getItem('isDark')

        if (isDarkJSON !== null) {
            // Set isDark / compare if has updated
            setIsDark(JSON.parse(isDarkJSON))
        }
    }, [setIsDark])

    // handle isDark mode
    const handleSetIsDark = useCallback(
        (payload) => {
            // set isDark / compare if has updated
            setIsDark(payload)
            // save preferance to storage
            AsyncStorage.setItem('isDark', JSON.stringify(payload))
        },
        [setIsDark],
    )

    // handle users / profiles
    const handleUsers = useCallback(
        (payload) => {
            // set users / compare if has updated
            if (JSON.stringify(payload) !== JSON.stringify(users)) {
                setUsers({ ...users, ...payload })
            }
        },
        [users, setUsers],
    )

    // Handle set user
    const handleSetUser = useCallback(
        (payload) => {
            // User logged out => set user === null
            if (!payload) {
                AsyncStorage.removeItem('user')
                setUser(null)
            }

            // set user / compare if has updated
            if (JSON.stringify(payload) !== JSON.stringify(user)) {
                AsyncStorage.setItem('user', JSON.stringify(payload))
                setUser(payload)
            }
        },
        [user, setUser],
    )

    // Get token
    const getToken = useCallback(async () => {
        // Get preferance gtom storage
        const tokenString = await AsyncStorage.getItem('token')

        if (tokenString !== null) {
            handleSetToken(tokenString)
        } else {
            console.log('User logged out!')
        }
    }, [setToken])

    // Handle set token
    const handleSetToken = useCallback(
        (payload) => {
            if (payload !== null) {
                // set user / compare if has updated
                if (JSON.stringify(payload) !== JSON.stringify(token)) {
                    // Set authenticate token to axios
                    axiosClient.defaults.headers.common[
                        'Authorization'
                    ] = `Bearer ${payload}`

                    // Save preferance to storage
                    AsyncStorage.setItem('token', payload)

                    setToken(payload)

                    // Get current user's data
                    authApi
                        .getAuthenticatedUser()
                        .then((response) => {
                            handleSetUser(response.data)
                            console.log('Get authentication info successfully!')
                        })
                        .catch((error) => {
                            console.log('Get authentication info error:', error)
                        })

                    // Get master data
                    masterDataApi
                        .getMasterData()
                        .then((response) => {
                            handleSetMasterData(response.data)
                        })
                        .catch((error) => {
                            console.log('Get master data error:', error)
                        })
                }
            } else {
                AsyncStorage.removeItem('token')
                AsyncStorage.removeItem('user')
                AsyncStorage.removeItem('masterData')
                setToken(null)
                handleSetUser(null)
                handleSetMasterData(null)
            }
        },
        [user, setToken],
    )

    // Handle set master data
    const handleSetMasterData = useCallback(
        (payload) => {
            // set user / compare if has updated
            if (JSON.stringify(payload) !== JSON.stringify(masterData)) {
                AsyncStorage.setItem('masterData', JSON.stringify(payload))
                setMasterData(payload)
            }
        },
        [masterData, setMasterData],
    )

    // handle Article
    const handleArticle = useCallback(
        (payload) => {
            // set article / compare if has updated
            if (JSON.stringify(payload) !== JSON.stringify(article)) {
                setArticle(payload)
            }
        },
        [article, setArticle],
    )

    // get initial data for: token & isDark & language
    useEffect(() => {
        getToken()
        getIsDark()
    }, [getToken, getIsDark])

    // change theme based on isDark updates
    useEffect(() => {
        setTheme(isDark ? light : light)
    }, [isDark])

    const contextValue = {
        isLoading,
        handleSetIsLoading,
        loadingMessage,
        setLoadingMessage,
        isDark,
        handleSetIsDark,
        theme,
        setTheme,
        showModal,
        setShowModal,
        modalContent,
        setModalContent,
        handleCloseModal,
        user,
        handleSetUser,
        token,
        handleSetToken,
        masterData,
        handleSetMasterData,
        refreshImage,
        forceRefreshImage,
        homeTab,
        setHomeTab,

        users,
        handleUsers,
        following,
        setFollowing,
        trending,
        setTrending,
        categories,
        setCategories,
        articles,
        setArticles,
        article,
        handleArticle,
    }

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => useContext(DataContext)
