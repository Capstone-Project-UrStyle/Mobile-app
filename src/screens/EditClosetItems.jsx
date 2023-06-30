import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

import { useTranslation, useTheme, useData } from '../hooks'
import { Block, Button, Text, ItemSelector } from '../components'

import closetApi from '../api/closetApi'

const isAndroid = Platform.OS === 'android'

const EditClosetItems = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes } = useTheme()
    const { user, handleSetIsLoading } = useData()
    const isFocused = useIsFocused()

    const [refresh, forceRefresh] = useState(false)
    const [allItemClosetDetail, setAllItemClosetDetail] = useState(null)
    const [targetClosetDetail, setTargetClosetDetail] = useState(null)
    const [isValid, setIsValid] = useState({
        item_ids: false,
    })
    const [credentials, setCredentials] = useState({
        item_ids: [],
    })

    const { targetClosetId } = route.params

    // Force refresh the screen whenever focused
    useEffect(() => {
        if (isFocused) {
            forceRefresh((prev) => !prev)
        }
    }, [isFocused])

    // Fetch all items closet data
    useEffect(() => {
        async function fetchAllItemClosetDetail() {
            if (user) {
                handleSetIsLoading(true)
                try {
                    const response = await closetApi.getAllItemClosetByUserId(
                        user.id,
                    )
                    if (response.request.status === 200) {
                        setAllItemClosetDetail(response.data)
                        handleSetIsLoading(false)
                    }
                } catch (error) {
                    handleSetIsLoading(false)
                    Alert.alert(error.response.data.message)
                }
            }
        }

        async function fetchTargetClosetDetail() {
            if (user) {
                handleSetIsLoading(true)
                try {
                    const response = await closetApi.getOneById(targetClosetId)
                    if (response.request.status === 200) {
                        setTargetClosetDetail(response.data)
                        handleSetIsLoading(false)
                    }
                } catch (error) {
                    handleSetIsLoading(false)
                    Alert.alert(error.response.data.message)
                }
            }
        }

        fetchAllItemClosetDetail()
        fetchTargetClosetDetail()
    }, [user, refresh])

    // Set item_ids in credentials with target closet items
    useEffect(() => {
        if (targetClosetDetail) {
            const closetItems = targetClosetDetail.Items
            handleChangeCredentials({
                item_ids: closetItems.map((item) => item.id),
            })
        }
    }, [targetClosetDetail])

    // Update valid status check when credentials change
    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            item_ids:
                Array.isArray(credentials.item_ids) &&
                credentials.item_ids.length > 0,
        }))
    }, [credentials, setIsValid])

    const handleChangeCredentials = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const handleSubmit = useCallback(async () => {
        if (!Object.values(isValid).includes(false)) {
            try {
                const response = await closetApi.updateById(
                    targetClosetId,
                    credentials,
                )
                if (response.request.status === 200) {
                    Alert.alert(response.data.message)
                    navigation.goBack()
                }
            } catch (error) {
                Alert.alert(error.response.data.message)
            }
        }
    }, [isValid, credentials])

    return (
        <Block color={colors.card}>
            <ItemSelector
                closet={allItemClosetDetail}
                forceRefresh={forceRefresh}
                selectMode={{
                    credentials: credentials,
                    handleChangeCredentials: handleChangeCredentials,
                }}
            />
            <Block
                flex={0}
                padding={sizes.sm}
                position="absolute"
                width="100%"
                backgroundColor={colors.card}
                bottom={0}
            >
                <Button
                    outlined
                    gray
                    shadow={!isAndroid}
                    disabled={Object.values(isValid).includes(false)}
                    activeOpacity={
                        !Object.values(isValid).includes(false) ? 1 : 0.2
                    }
                    style={{
                        opacity: Object.values(isValid).includes(false)
                            ? 0.5
                            : 1,
                    }}
                    onPress={handleSubmit}
                >
                    <Text h5>{t('editClosetItems.done')}</Text>
                </Button>
            </Block>
        </Block>
    )
}

export default EditClosetItems
