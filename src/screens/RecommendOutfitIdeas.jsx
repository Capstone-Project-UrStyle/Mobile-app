import React, { useCallback, useEffect, useState, createRef } from 'react'
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
    Checkbox,
    FormRow,
    ClosetCard,
    OccasionSelector,
} from '../components'

import { createFormDataFromUri } from '../utils/formDataCreator'

import { BASE_API_URL } from '../api/axiosClient'
import uploadImageApi from '../api/uploadImageApi'
import closetApi from '../api/closetApi'
import outfitApi from '../api/outfitApi'
import lstmModalApi from '../api/lstmModalApi'

const isAndroid = Platform.OS === 'android'

const RecommendOutfitIdeas = ({ navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts } = useTheme()
    const { user, handleSetIsLoading, setLoadingMessage, forceRefreshImage } = useData()
    const isFocused = useIsFocused()

    const [refresh, forceRefresh] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [userClosets, setUserClosets] = useState(null)
    const [selectedClosetDetail, setSelectedClosetDetail] = useState(null)
    const [recommendOutfits, setRecommendOutfits] = useState(null)
    const [selectedRecommendOutfitIndexs, setSelectedRecommendOutfitIndexs] = useState([])
    const [viewShotRefs, setViewShotRefs] = useState([])
    const [outfitImageUris, setOutfitImageUris] = useState(null)
    const [isValid, setIsValid] = useState(null)
    const [credentials, setCredentials] = useState(null)

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

    // Init isValid and credentials when recommendOutfits changes
    useEffect(() => {
        if (recommendOutfits) {
            const initCredentials = recommendOutfits.map((outfit) => {
                return {
                    occasion_ids: [],
                    item_ids: outfit.items.map(item => item.id),
                    is_public: false,
                    description: '',
                }
            })
            setCredentials(initCredentials)

            const initViewShotRefs = recommendOutfits.map((_) => {
                return createRef()
            })
            setViewShotRefs(initViewShotRefs)

            setOutfitImageUris(Array(recommendOutfits.length).fill(null))
            setSelectedRecommendOutfitIndexs([])
        }
    }, [recommendOutfits])

    // Update isValid whenever credentials change
    useEffect(() => {
        if (credentials) {
            let newIsValid = []

            for (let index = 0; index < credentials.length; index++) {
                const newValidState = {
                    occasion_ids: Array.isArray(credentials[index].occasion_ids),
                    item_ids:
                        Array.isArray(credentials[index].item_ids) &&
                        credentials[index].item_ids.length > 0,
                    description:
                        credentials[index].description !== null &&
                        credentials[index].description.length <= 50,
                }
                
                newIsValid.push(newValidState)
            }

            setIsValid(newIsValid)
        }
    }, [credentials, setIsValid])

    const handleChangeCredentials = useCallback(
        (index, value) => {
            const newCredentials = [ ...credentials ]
            const newState = { ...credentials[index], ...value }
            newCredentials[index] = newState
            setCredentials(newCredentials)
        },
        [credentials, setCredentials],
    )

    const handlePressClosetCheckbox = (closet) => {
        if (selectedClosetDetail) {
            if (selectedClosetDetail.id === closet.id) {
                return setSelectedClosetDetail(null)
            }
        }

        return setSelectedClosetDetail(closet)
    }

    const handlePressRecommendOutfitCheckbox = async (index) => {
        if (selectedRecommendOutfitIndexs.includes(index)) {
            setSelectedRecommendOutfitIndexs(prev => prev.filter((idx) => idx !== index))
        } else {
            setSelectedRecommendOutfitIndexs(prev => [...prev, index])

            // Capture outfit image
            try {
                const outfitCompositImageUri = await viewShotRefs[index].current.capture()
                let newOutfitImageUris = [ ...outfitImageUris ]
                newOutfitImageUris[index] = outfitCompositImageUri
        
                setOutfitImageUris(newOutfitImageUris)
            } catch (error) {
                console.log(error)
            }
        }
    }

    const isEnableSubmitButton = useCallback(() => {
        switch (currentStep) {
            case 1:
                return selectedClosetDetail !== null
            case 2:
                const isValidContainsFalse = isValid.some(state => Object.values(state).includes(false))
                const selectedRecommendOutfitCheck = Array.isArray(selectedRecommendOutfitIndexs) && selectedRecommendOutfitIndexs.length > 0
                return !isValidContainsFalse && selectedRecommendOutfitCheck
            default:
                break
        }
    }, [currentStep, selectedClosetDetail, isValid, selectedRecommendOutfitIndexs])

    const handleSubmit = useCallback(async () => {
        switch (currentStep) {
            case 1:
                // Call API to generate outfit recommendation by query
                try {
                    handleSetIsLoading(true)
                    setLoadingMessage(
                        t('recommendOutfitIdeas.modelRunningMessage'),
                    )
                    const recommendResponse =
                        await lstmModalApi.generateOutfitRecommendations({
                            closet_id: selectedClosetDetail.id,
                            limit: 5,
                        })
                    if (recommendResponse.request.status === 200) {
                        setRecommendOutfits(recommendResponse.data)
                        handleSetIsLoading(false)
                        setLoadingMessage(null)

                        // Move to step 2
                        setCurrentStep(2)
                    }
                } catch (error) {
                    handleSetIsLoading(false)
                    setLoadingMessage(null)
                    Alert.alert(error.response.data.message)
                }
                break
            case 2:
                // Submit new outfits
                let alertMessage = ''
                handleSetIsLoading(true)

                for (let index = 0; index < selectedRecommendOutfitIndexs.length; index++) {
                    const outfitIndex = selectedRecommendOutfitIndexs[index]
                    if (!Object.values(isValid[outfitIndex]).includes(false)) {
                        try {
                            const response = await outfitApi.createNew(credentials[outfitIndex])
                            if (response.request.status === 200) {
                                // Upload outfit image
                                if (outfitImageUris[outfitIndex]) {
                                    const postData = createFormDataFromUri(
                                        'outfit-image',
                                        outfitImageUris[outfitIndex],
                                    )
                                    await uploadImageApi.uploadOutfitImage(
                                        response.data.outfitId,
                                        postData,
                                    )
                                    forceRefreshImage(prev => !prev)
                                }

                                alertMessage = response.data.message
                            }
                        } catch (error) {
                            handleSetIsLoading(false)
                            Alert.alert(error.response.data.message)
                        }
                    }
                }

                handleSetIsLoading(false)
                Alert.alert(alertMessage)
                navigation.navigate('Home')
                break
            default:
                break
        }
    }, [currentStep, selectedClosetDetail, isValid, outfitImageUris, credentials])

    const renderOutfitImages = (outfit, outfitIndex) => {
        const outfitItems = outfit.items

        return (
            <ViewShot ref={viewShotRefs[outfitIndex]} style={{ flex: 1 }}>
                <Block
                    card
                    flex={0}
                    row
                    wrap="wrap"
                    justify="space-evenly"
                    backgroundColor={colors.light}
                    padding={sizes.xs}
                >
                    {outfitItems && outfitItems.map(item => {
                        return (
                            <Image
                                key={`outfit-${outfitIndex}-item-${item.id}`}
                                resizeMode="contain"
                                style={{
                                    height: 120,
                                    width: 120,
                                }}
                                source={{ uri: BASE_API_URL + item.image }}
                            />
                        )
                    })}
                </Block>
            </ViewShot>
        )
    }

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
                    {currentStep === 1 &&
                        t('recommendOutfitIdeas.stepOneLabel')}
                    {currentStep === 2 &&
                        t('recommendOutfitIdeas.stepTwoLabel')}
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
                                {t('recommendCompatibleItems.noClosetFound')}
                            </Text>
                        )}
                    </Block>
                </Block>
            )}

            {currentStep === 2 && recommendOutfits && recommendOutfits.length > 0 && (
                // Render outfit's info forms
                <Block
                    scroll
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: sizes.sm }}
                    flex={1}
                    padding={sizes.sm}
                    color={colors.light}
                >
                    {recommendOutfits.map((recommendOutfit, index) => {
                        const isSelected = selectedRecommendOutfitIndexs.includes(index)
                        return (
                            <Block key={`recommend-outfit-${index}`} card marginBottom={sizes.sm} padding={sizes.sm}>
                                {/* Outfit image */}
                                <Block>
                                    <Text h5 paddingBottom={sizes.s}>
                                        {t('recommendCompatibleItems.outfitImage')} #{index + 1} - Score: {Number.parseInt(recommendOutfit.score) + 100}/100
                                    </Text>
                                    {renderOutfitImages(recommendOutfit, index)}
                                </Block>

                                {/* Checkbox */}
                                <Block
                                    position="absolute"
                                    top={sizes.sm}
                                    right={sizes.sm}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onPress={() => handlePressRecommendOutfitCheckbox(index)}
                                    />
                                </Block>

                                {isSelected && (
                                    <Block>
                                        {/* Occasion selectors */}
                                        <Block paddingVertical={sizes.sm}>
                                            <Text h5 paddingBottom={sizes.s}>
                                                {t('recommendCompatibleItems.occasions')}
                                            </Text>
                                            <FormRow
                                                type="Occasions"
                                                label={t('outfitDetail.occasions')}
                                                values={credentials[index].occasion_ids}
                                                renderValueSelector={() => (
                                                    <OccasionSelector
                                                        selectedOccasionIds={
                                                            credentials[index].occasion_ids
                                                        }
                                                        handleChangeCredentials={
                                                            handleChangeCredentials
                                                        }
                                                        credentialIndex={index}
                                                    />
                                                )}
                                            />
                                        </Block>

                                        {/* Outfit description */}
                                        <Block paddingVertical={sizes.sm}>
                                            <Text h5 paddingBottom={sizes.s}>
                                                {t('recommendCompatibleItems.description')}
                                            </Text>
                                            <Input
                                                marginBottom={sizes.sm}
                                                placeholder={t(
                                                    'recommendCompatibleItems.descriptionPlaceholder',
                                                )}
                                                success={Boolean(
                                                    credentials[index].description && isValid[index].description,
                                                )} 
                                                danger={Boolean(
                                                    credentials[index].description && !isValid[index].description,
                                                )}
                                                onChangeText={(value) =>
                                                    handleChangeCredentials(index, { description: value })
                                                }
                                                value={credentials[index].description}
                                            />
                                        </Block>

                                        {/* Public switch */}
                                        <Block
                                            flex={0}
                                            row
                                            align="center"
                                            justify="space-between"
                                            marginBottom={sizes.sm}
                                        >
                                            <Text h5>{t('recommendCompatibleItems.public')}</Text>
                                            <Switch
                                                checked={credentials[index].is_public}
                                                onPress={(checked) =>
                                                    handleChangeCredentials(index, { is_public: checked })
                                                }
                                            />
                                        </Block>
                                    </Block>
                                )}
                            </Block>
                        )
                    })}
                </Block>
            )}

            {/* Submit buttons */}
            <Block
                flex={0}
                row
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
                        <Text h5>
                            {t('recommendCompatibleItems.prevStep')}
                        </Text>
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
                            <Text h5>
                                {t('recommendCompatibleItems.done')}
                            </Text>
                        ) : (
                            <Text h5>
                                {t('recommendCompatibleItems.nextStep')}
                            </Text>
                        )}
                    </Button>
                </Block>
            </Block>
        </Block>
    )
}

export default RecommendOutfitIdeas
