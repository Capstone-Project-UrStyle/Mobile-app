import React, { useCallback, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import {
  USERS,
  FOLLOWING,
  TRENDING,
  CATEGORIES,
  ARTICLES
} from "../constants/mocks"
import { light } from "../constants"

import axiosClient from '../api/axiosClient'
import authApi from '../api/auth'

export const DataContext = React.createContext({})

export const DataProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [theme, setTheme] = useState(light)
  const [user, setUser] = useState(USERS[0])
  const [token, setToken] = useState(null)

  const [users, setUsers] = useState(USERS)
  const [following, setFollowing] = useState(FOLLOWING)
  const [trending, setTrending] = useState(TRENDING)
  const [categories, setCategories] = useState(CATEGORIES)
  const [articles, setArticles] = useState(ARTICLES)
  const [article, setArticle] = useState({})

  // Handle set isLoading mode
  const handleSetIsLoading = useCallback(
    payload => {
      // Set isLoading / compare if has updated
      setIsLoading(payload)
      // Save preferance to storage
      AsyncStorage.setItem("isLoading", JSON.stringify(payload))
    },
    [setIsLoading]
  )

  // Get isDark mode from storage
  const getIsDark = useCallback(async () => {
    // Get preferance gtom storage
    const isDarkJSON = await AsyncStorage.getItem("isDark")

    if (isDarkJSON !== null) {
      // Set isDark / compare if has updated
      setIsDark(JSON.parse(isDarkJSON))
    }
  }, [setIsDark])

  // handle isDark mode
  const handleSetIsDark = useCallback(
    payload => {
      // set isDark / compare if has updated
      setIsDark(payload)
      // save preferance to storage
      AsyncStorage.setItem("isDark", JSON.stringify(payload))
    },
    [setIsDark]
  )

  // handle users / profiles
  const handleUsers = useCallback(
    payload => {
      // set users / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(users)) {
        setUsers({ ...users, ...payload })
      }
    },
    [users, setUsers]
  )

  // Handle set user
  const handleSetUser = useCallback(
    payload => {
      // set user / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(user)) {
        AsyncStorage.setItem('user', JSON.stringify(payload))
        setUser(payload)
      }
    },
    [user, setUser]
  )

  // Get token
  const getToken = useCallback(async () => {
    // Get preferance gtom storage
    const tokenString = await AsyncStorage.getItem("token")

    if (tokenString !== null) {
      handleSetToken(tokenString)
    } else {
      console.log('User logged out!')
    }
  }, [setToken])

  // Handle set token
  const handleSetToken = useCallback(
    payload => {
      if (payload !== null) {
        // set user / compare if has updated
        if (JSON.stringify(payload) !== JSON.stringify(token)) {
          // Set authenticate token to axios
          axiosClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${payload}`
          
          // Save preferance to storage
          AsyncStorage.setItem('token', token)

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
        }
      } else {
        setToken(null)
        handleSetUser(null)
      }
    },
    [user, setToken]
  )

  // handle Article
  const handleArticle = useCallback(
    payload => {
      // set article / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(article)) {
        setArticle(payload)
      }
    },
    [article, setArticle]
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
    isDark,
    handleSetIsDark,
    theme,
    setTheme,
    user,
    handleSetUser,
    token,
    handleSetToken,

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
    handleArticle
  }

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
