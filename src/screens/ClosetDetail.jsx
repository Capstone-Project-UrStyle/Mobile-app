import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

import { useTheme, useData } from '../hooks'
import { Block, ItemSelector } from '../components'

import closetApi from '../api/closetApi'

const ClosetDetail = ({ route }) => {
    const { colors } = useTheme()
    const { handleSetIsLoading } = useData()
    const isFocused = useIsFocused()

    const [closetDetail, setClosetDetail] = useState(null)
    const [refresh, forceRefresh] = useState(false)

    const { closetId } = route.params

    // Force refresh the screen whenever focused
    useEffect(() => {
        if (isFocused) {
            forceRefresh((prev) => !prev)
        }
    }, [isFocused])

    // Fetch closet data
    useEffect(() => {
        async function fetchClosetDetail() {
            handleSetIsLoading(true)
            try {
                const response = await closetApi.getOneById(closetId)
                if (response.request.status === 200) {
                    setClosetDetail(response.data)
                    handleSetIsLoading(false)
                }
            } catch (error) {
                handleSetIsLoading(false)
                Alert.alert(error.response.data.message)
            }
        }

        fetchClosetDetail()
    }, [refresh])

    return (
        <Block color={colors.card}>
            <ItemSelector closet={closetDetail} forceRefresh={forceRefresh} />
        </Block>
    )
}

export default ClosetDetail
