import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Platform, Alert } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import ViewShot from 'react-native-view-shot'

import { useTranslation, useTheme, useData } from '../hooks'
import {
    Block,
    Button,
    Text,
    Image,
    Switch,
    Input,
    ClosetCard,
    ItemSelector,
    OccasionSelector,
    DraggableImage,
} from '../components'

import { createFormDataFromUri } from '../utils/formDataCreator'

import { BASE_API_URL } from '../api/axiosClient'
import uploadImageApi from '../api/uploadImageApi'
import closetApi from '../api/closetApi'
import outfitApi from '../api/outfitApi'

const isAndroid = Platform.OS === 'android'

const CreateOutfit = ({ navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts, screenSize } = useTheme()
    const { user, handleSetIsLoading, forceRefreshImage } = useData()
    const isFocused = useIsFocused()
    const viewShotRef = useRef()

    const [refresh, forceRefresh] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [userClosets, setUserClosets] = useState(null)
    const [selectedClosetDetail, setSelectedClosetDetail] = useState(null)
    const [itemImageSizes, setItemImageSizes] = useState([])
    const [itemImageLastPositions, setItemImageLastPositions] = useState([])
    const [outfitImageUri, setOutfitImageUri] = useState(null)
    const [selfieImageUris, setSelfieImageUris] = useState(null)
    const [isValid, setIsValid] = useState({
        outfit_image_uri: false,
        occasion_ids: false,
        item_ids: false,
        description: false,
    })
    const [credentials, setCredentials] = useState({
        occasion_ids: [],
        item_ids: [],
        is_public: false,
        description: '',
    })

    // Force refresh the screen whenever focused
    useEffect(() => {
        if (isFocused) {
            forceRefresh((prev) => !prev)
        }
    }, [isFocused])

    // Fetch all user's closets data
    useEffect(() => {
        async function fetchUserClosets() {
            handleSetIsLoading(true)
            try {
                const response = await closetApi.getListByUserId(user.id)
                setUserClosets(response.data)
                handleSetIsLoading(false)
            } catch (error) {
                handleSetIsLoading(false)
                alert(error.response.data.message)
            }
        }

        if (user) {
            fetchUserClosets()
        }
    }, [refresh, user])

    // Update valid status check when credentials change
    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            outfit_image_uri: outfitImageUri !== null,
            occasion_ids: Array.isArray(credentials.occasion_ids),
            item_ids:
                Array.isArray(credentials.item_ids) &&
                credentials.item_ids.length > 0,
            description:
                credentials.description !== null &&
                credentials.description.length <= 50,
        }))
    }, [credentials, outfitImageUri, setIsValid])

    const handleChangeCredentials = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const handlePressClosetCheckbox = (closet) => {
        if (selectedClosetDetail) {
            if (selectedClosetDetail.id === closet.id) {
                return setSelectedClosetDetail(null)
            }
        }

        return setSelectedClosetDetail(closet)
    }

    const isEnableSubmitButton = useCallback(() => {
        switch (currentStep) {
            case 1:
                return selectedClosetDetail !== null
            case 2:
                return isValid.item_ids
            case 3:
                return true
            case 4:
                return !Object.values(isValid).includes(false)
            default:
                break
        }
    }, [currentStep, selectedClosetDetail, isValid])

    const handleDragItemImage = (index, lastPosition) => {
        // Update last position of touched item image
        const updatedPositions = [...itemImageLastPositions]
        updatedPositions[index] = lastPosition
        setItemImageLastPositions(updatedPositions)
    }

    const handleSubmit = useCallback(async () => {
        switch (currentStep) {
            case 1:
                // Move to step 2
                setCurrentStep(2)
                break
            case 2:
                // Initiate image's sizes
                setItemImageSizes(Array(credentials.item_ids.length).fill(150))

                // Initiate image's positions
                setItemImageLastPositions(
                    Array(credentials.item_ids.length).fill({ x: 0, y: 0 }),
                )

                // Move to step 3
                setCurrentStep(3)
                break
            case 3:
                try {
                    // Save composit image
                    const compositImageUri = await viewShotRef.current.capture()
                    setOutfitImageUri(compositImageUri)

                    // Move to step 4
                    setCurrentStep(4)
                } catch (error) {
                    console.log(error)
                }
                break
            case 4:
                // Submit new outfit
                if (!Object.values(isValid).includes(false)) {
                    try {
                        const response = await outfitApi.createNew(credentials)
                        if (response.request.status === 200) {
                            // Upload outfit image
                            if (outfitImageUri) {
                                const postData = createFormDataFromUri(
                                    'outfit-image',
                                    outfitImageUri,
                                )
                                await uploadImageApi.uploadOutfitImage(
                                    response.data.outfitId,
                                    postData,
                                )
                                forceRefreshImage(prev => !prev)
                            }

                            Alert.alert(response.data.message)
                            navigation.goBack()
                        }
                    } catch (error) {
                        Alert.alert(error.response.data.message)
                    }
                }
            default:
                break
        }
    }, [currentStep, isValid, outfitImageUri, credentials])

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
                    {currentStep === 1 && t('createOutfit.stepOneLabel')}
                    {currentStep === 2 && t('createOutfit.stepTwoLabel')}
                    {currentStep === 3 && t('createOutfit.stepThreeLabel')}
                    {currentStep === 4 && t('createOutfit.stepFourLabel')}
                </Text>
            </Block>

            {currentStep === 1 && (
                // Render closet selector
                <Block
                    scroll
                    paddingHorizontal={sizes.padding}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: sizes.l }}
                    forceRefresh={forceRefresh}
                    color={colors.light}
                >
                    <Block
                        row
                        wrap="wrap"
                        justify="space-between"
                        marginTop={sizes.sm}
                    >
                        {userClosets && userClosets.length > 0 ? (
                            userClosets.map((closet) => (
                                <ClosetCard
                                    key={`card-${closet?.id}`}
                                    closet={closet}
                                    type={'vertical'}
                                    selectMode={{
                                        onSelect: () =>
                                            handlePressClosetCheckbox(closet),
                                        isSelected: selectedClosetDetail
                                            ? selectedClosetDetail.id ===
                                              closet.id
                                            : false,
                                    }}
                                />
                            ))
                        ) : (
                            <Text
                                p
                                center
                                font={fonts?.['semibold']}
                                width="100%"
                                marginTop={sizes.sm}
                            >
                                {t('createOutfit.noClosetFound')}
                            </Text>
                        )}
                    </Block>
                </Block>
            )}

            {currentStep === 2 && (
                // Render item selector
                <ItemSelector
                    closet={selectedClosetDetail}
                    forceRefresh={forceRefresh}
                    selectMode={{
                        credentials: credentials,
                        handleChangeCredentials: handleChangeCredentials,
                    }}
                />
            )}

            {currentStep === 3 && (
                <Block flex={0} height={screenSize.height - 175}>
                    {/* Render dragable view */}
                    <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
                        {selectedClosetDetail.Items.filter((item) =>
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

            {currentStep === 4 && (
                // Render outfit's info form
                <Block
                    scroll
                    showsVerticalScrollIndicator={false}
                    flex={1}
                    paddingHorizontal={sizes.sm}
                    paddingBottom={sizes.sm}
                    marginBottom={80}
                >
                    {/* Outfit image */}
                    <Block paddingVertical={sizes.s}>
                        <Text h5 paddingBottom={sizes.s}>
                            {t('createOutfit.outfitImage')}
                        </Text>
                        <Image
                            resizeMode="contain"
                            style={{
                                height: 350,
                                width: '100%',
                            }}
                            source={{ uri: outfitImageUri }}
                        />
                    </Block>

                    {/* Occasion selectors */}
                    <Block paddingVertical={sizes.s}>
                        <Text h5 paddingBottom={sizes.s}>
                            {t('createOutfit.occasions')}
                        </Text>
                        <Block
                            borderWidth={0.5}
                            radius={sizes.sm}
                            padding={sizes.s}
                        >
                            <Block
                                scroll
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled={true}
                                flex={1}
                                height={200}
                            >
                                <Block
                                    row
                                    flex={1}
                                    wrap="wrap"
                                    justify="flex-start"
                                >
                                    <OccasionSelector
                                        selectedOccasionIds={
                                            credentials.occasion_ids
                                        }
                                        handleChangeCredentials={
                                            handleChangeCredentials
                                        }
                                    />
                                </Block>
                            </Block>
                        </Block>
                    </Block>

                    {/* Outfit description */}
                    <Block paddingVertical={sizes.s}>
                        <Text h5 paddingBottom={sizes.s}>
                            {t('createOutfit.description')}
                        </Text>
                        <Input
                            marginBottom={sizes.sm}
                            placeholder={t(
                                'createOutfit.descriptionPlaceholder',
                            )}
                            success={Boolean(
                                credentials.description && isValid.description,
                            )}
                            danger={Boolean(
                                credentials.description && !isValid.description,
                            )}
                            onChangeText={(value) =>
                                handleChangeCredentials({ description: value })
                            }
                            value={credentials.description}
                        />
                    </Block>

                    {/* Public switch */}
                    <Block
                        flex={0}
                        row
                        align="center"
                        justify="space-between"
                        paddingVertical={sizes.s}
                    >
                        <Text h5>{t('createOutfit.public')}</Text>
                        <Switch
                            checked={credentials.is_public}
                            onPress={(checked) =>
                                handleChangeCredentials({ is_public: checked })
                            }
                        />
                    </Block>
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
                        <Text h5>{t('createOutfit.prevStep')}</Text>
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
                        {currentStep === 4 ? (
                            <Text h5>{t('createOutfit.done')}</Text>
                        ) : (
                            <Text h5>{t('createOutfit.nextStep')}</Text>
                        )}
                    </Button>
                </Block>
            </Block>
        </Block>
    )
}

export default CreateOutfit
