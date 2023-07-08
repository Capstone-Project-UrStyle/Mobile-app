import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Platform, Alert } from 'react-native'
import ViewShot from 'react-native-view-shot'

import { useTranslation, useTheme, useData } from '../hooks'
import {
    Block,
    Button,
    Text,
    ItemSelector,
    DraggableImage,
} from '../components'

import { createFormDataFromUri } from '../utils/formDataCreator'

import { BASE_API_URL } from '../api/axiosClient'
import uploadImageApi from '../api/uploadImageApi'
import closetApi from '../api/closetApi'
import outfitApi from '../api/outfitApi'

const isAndroid = Platform.OS === 'android'

const EditOutfitItems = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts, screenSize } = useTheme()
    const { user, handleSetIsLoading, forceRefreshImage } = useData()
    const viewShotRef = useRef()

    const { outfitId } = route.params

    const [refresh, forceRefresh] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [allItemClosetDetail, setAllItemClosetDetail] = useState(null)
    const [outfitDetail, setOutfitDetail] = useState(null)
    const [itemImageSizes, setItemImageSizes] = useState([])
    const [itemImageLastPositions, setItemImageLastPositions] = useState([])
    const [selfieImageUris, setSelfieImageUris] = useState(null)
    const [isValid, setIsValid] = useState({
        item_ids: false,
    })
    const [credentials, setCredentials] = useState({
        item_ids: [],
    })

    // Fetch outfit detail
    useEffect(() => {
        async function fetchOutfitDetail() {
            handleSetIsLoading(true)
            try {
                const response = await outfitApi.getOneById(outfitId)
                if (response.request.status === 200) {
                    setOutfitDetail(response.data)
                    handleSetIsLoading(false)
                }
            } catch (error) {
                handleSetIsLoading(false)
                alert(error.response.data.message)
            }
        }
        fetchOutfitDetail()
    }, [outfitId])

    // Update credentials item_ids when outfit detail is fetched
    useEffect(() => {
        if (outfitDetail) {
            handleChangeCredentials({ item_ids: outfitDetail.Items.map(item => item.id) })
        }
    }, [outfitDetail])

    // Fetch user's all item closet data
    useEffect(() => {
        async function fetchAllItemClosetDetail() {
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
                alert(error.response.data.message)
            }
        }

        if (user) {
            fetchAllItemClosetDetail()
        }
    }, [refresh, user])

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

    const isEnableSubmitButton = useCallback(() => {
        switch (currentStep) {
            case 1:
                return isValid.item_ids
            case 2:
                return true
            case 3:
                return !Object.values(isValid).includes(false)
            default:
                break
        }
    }, [currentStep, isValid])

    const handleDragItemImage = (index, lastPosition) => {
        // Update last position of touched item image
        const updatedPositions = [...itemImageLastPositions]
        updatedPositions[index] = lastPosition
        setItemImageLastPositions(updatedPositions)
    }

    const handleSubmit = useCallback(async () => {
        switch (currentStep) {
            case 1:
                // Initiate image's sizes
                setItemImageSizes(Array(credentials.item_ids.length).fill(150))

                // Initiate image's positions
                setItemImageLastPositions(
                    Array(credentials.item_ids.length).fill({ x: 0, y: 0 }),
                )

                // Move to step 2
                setCurrentStep(2)
                break
            case 2:
                try {
                    // Save composit image
                    const compositImageUri = await viewShotRef.current.capture()

                    // Submit new outfit
                    if (!Object.values(isValid).includes(false)) {
                        handleSetIsLoading(true)
                        try {
                            const response = await outfitApi.updateById(outfitId, credentials)
                            if (response.request.status === 200) {
                                // Upload outfit image
                                if (compositImageUri) {
                                    const postData = createFormDataFromUri(
                                        'outfit-image',
                                        compositImageUri,
                                    )
                                    await uploadImageApi.uploadOutfitImage(
                                        outfitId,
                                        postData,
                                    )
                                    forceRefreshImage(prev => !prev)
                                }

                                handleSetIsLoading(false)
                                Alert.alert(response.data.message)
                                navigation.goBack()
                            }
                        } catch (error) {
                            handleSetIsLoading(false)
                            Alert.alert(error.response.data.message)
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
                break  
            default:
                break
        }
    }, [currentStep, isValid, credentials])

    return (
        <Block color={colors.card}>
            <Block
                flex={0}
                width="100%"
                backgroundColor={colors.card}
                paddingHorizontal={sizes.sm}
                paddingVertical={sizes.s}
            >
                <Text h5 font={fonts?.['semibold']} width="100%">
                    {currentStep === 1 && t('editOutfitItems.stepOneLabel')}
                    {currentStep === 2 && t('editOutfitItems.stepTwoLabel')}
                </Text>
            </Block>

            {currentStep === 1 && (
                // Render item selector
                <ItemSelector
                    closet={allItemClosetDetail}
                    forceRefresh={forceRefresh}
                    selectMode={{
                        credentials: credentials,
                        handleChangeCredentials: handleChangeCredentials,
                    }}
                />
            )}

            {currentStep === 2 && (
                <Block flex={0} height={screenSize.height - 175}>
                    {/* Render dragable view */}
                    <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
                        {allItemClosetDetail.Items.filter((item) =>
                            credentials.item_ids.includes(item.id),
                        ).map((item, index) => {
                            return (
                                <DraggableImage
                                    key={`item-${item.id}`}
                                    index={index}
                                    width={itemImageSizes[index]}
                                    height={itemImageSizes[index]}
                                    source={{ uri: BASE_API_URL + item.image }}
                                    lastPosition={itemImageLastPositions[index]}
                                    onDrag={handleDragItemImage}
                                />
                            )
                        })}
                    </ViewShot>
                </Block>
            )}

            {/* Submit buttons */}
            <Block
                flex={0}
                row
                position="absolute"
                bottom={0}
                width="100%"
                backgroundColor={colors.card}
                padding={sizes.sm}
            >
                <Block marginHorizontal={sizes.xs}>
                    <Button
                        outlined
                        gray
                        shadow={!isAndroid}
                        disabled={currentStep === 1}
                        activeOpacity={currentStep !== 1 ? 1 : 0.2}
                        style={{
                            opacity: currentStep !== 1 ? 1 : 0.5,
                        }}
                        onPress={() => setCurrentStep((prev) => prev - 1)}
                    >
                        <Text h5>{t('editOutfitItems.prevStep')}</Text>
                    </Button>
                </Block>
                <Block marginHorizontal={sizes.xs}>
                    <Button
                        outlined
                        gray
                        shadow={!isAndroid}
                        disabled={!isEnableSubmitButton()}
                        activeOpacity={isEnableSubmitButton() ? 1 : 0.2}
                        style={{
                            opacity: isEnableSubmitButton() ? 1 : 0.5,
                        }}
                        onPress={handleSubmit}
                    >
                        {currentStep === 2 ? (
                            <Text h5>{t('editOutfitItems.done')}</Text>
                        ) : (
                            <Text h5>{t('editOutfitItems.nextStep')}</Text>
                        )}
                    </Button>
                </Block>
            </Block>
        </Block>
    )
}

export default EditOutfitItems
