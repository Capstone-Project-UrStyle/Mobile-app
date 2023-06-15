import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert, TouchableOpacity } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'

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
} from '../components'

import closetApi from '../api/closetApi'
import outfitApi from '../api/outfitApi'

const isAndroid = Platform.OS === 'android'

const CreateOutfit = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts } = useTheme()
    const { user, handleSetIsLoading } = useData()
    const isFocused = useIsFocused()

    const [refresh, forceRefresh] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [userClosets, setUserClosets] = useState(null)
    const [selectedClosetId, setSelectedClosetId] = useState(null)
    const [closetDetail, setClosetDetail] = useState(null)
    const [outfitImageUri, setOutfitImageUri] = useState(null)
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
    }, [refresh, selectedClosetId])

    // Fetch selected closet data
    useEffect(() => {
        async function fetchClosetDetail() {
            handleSetIsLoading(true)
            try {
                const response = await closetApi.getOneById(selectedClosetId)
                if (response.request.status === 200) {
                    setClosetDetail(response.data)
                    handleSetIsLoading(false)
                }
            } catch (error) {
                handleSetIsLoading(false)
                Alert.alert(error.response.data.message)
            }
        }

        if (selectedClosetId) {
            fetchClosetDetail()
        }
    }, [refresh, selectedClosetId])

    // Force user to choose items
    useEffect(() => {
        async function forceChooseItems() {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            })
            if (!result.canceled) setUploadItemImageUri(result.assets[0].uri)
            else navigation.goBack()
        }

        // forceChooseItems()
    }, [outfitImageUri])

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

    const handleChooseOufitImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        })

        if (!result.canceled) {
            setOutfitImageUri(result.assets[0].uri)
        }
    }

    const handlePressClosetCheckbox = (closetId) => {
        if (selectedClosetId === closetId) {
            setSelectedClosetId(null)
        } else {
            setSelectedClosetId(closetId)
        }
    }

    const handlePressOccasionTag = (occasionId) => {
        if (credentials.occasion_ids.includes(occasionId)) {
            handleChangeCredentials({
                occasion_ids: credentials.occasion_ids.filter(
                    (id) => id !== occasionId,
                ),
            })
        } else {
            handleChangeCredentials({
                occasion_ids: [...credentials.occasion_ids, occasionId],
            })
        }
    }

    const isEnableSubmitButton = () => {
        switch (currentStep) {
            case 1:
                return selectedClosetId !== null
            case 2:
                return isValid.item_ids
            case 3:
                return !Object.values(isValid).includes(false)
            default:
                break
        }
    }

    const handleSubmit = useCallback(async () => {
        switch (currentStep) {
            case 1:
                // Move to step 2
                setCurrentStep(2)
                break
            case 2:
                // Move to step 3
                setCurrentStep(3)
                break
            case 3:
                // Submit new outfit
                if (!Object.values(isValid).includes(false)) {
                    try {
                        const response = await outfitApi.createNew(credentials)
                        if (response.request.status === 200) {
                            Alert.alert(response.data.message)
                            navigation.goBack()
                        }
                    } catch (error) {
                        Alert.alert(error.response.data.message)
                    }
                }
                break
            default:
                break
        }
    }, [isValid, credentials])

    return (
        <Block color={colors.card}>
            <Block
                flex={0}
                padding={sizes.sm}
                width="100%"
                backgroundColor={colors.card}
                top={0}
            >
                <Text h5 font={fonts?.['semibold']} width="100%">
                    {currentStep === 1 && t('createOutfit.stepOneLabel')}
                    {currentStep === 2 && t('createOutfit.stepTwoLabel')}
                    {currentStep === 3 && t('createOutfit.stepThreeLabel')}
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
                                            handlePressClosetCheckbox(
                                                closet.id,
                                            ),
                                        isSelected:
                                            selectedClosetId === closet.id,
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
                    closet={closetDetail}
                    forceRefresh={forceRefresh}
                    selectMode={{
                        credentials: credentials,
                        handleChangeCredentials: handleChangeCredentials,
                    }}
                />
            )}
            {currentStep === 3 && (
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
                    <Block marginBottom={sizes.sm}>
                        <Text h5 paddingBottom={sizes.s}>
                            {t('createOutfit.outfitImage')}
                        </Text>
                        <TouchableOpacity onPress={handleChooseOufitImage}>
                            <Image
                                resizeMode="cover"
                                style={{
                                    height: 350,
                                    width: '100%',
                                }}
                                source={{ uri: outfitImageUri }}
                            />
                        </TouchableOpacity>
                    </Block>

                    {/* Public switch */}
                    <Block
                        flex={0}
                        row
                        paddingVertical={sizes.s}
                        align="center"
                        justify="space-between"
                    >
                        <Text h5>{t('createOutfit.public')}</Text>
                        <Switch
                            checked={credentials.is_public}
                            onPress={(checked) =>
                                handleChangeCredentials({ is_public: checked })
                            }
                        />
                    </Block>

                    {/* Occasion selectors */}
                    <Block marginBottom={sizes.sm}>
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
                                        handlePressOccasionTag={
                                            handlePressOccasionTag
                                        }
                                    />
                                </Block>
                            </Block>
                        </Block>
                    </Block>

                    {/* Outfit description */}
                    <Block>
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
                </Block>
            )}

            {/* Submit buttons */}
            <Block
                flex={1}
                row
                padding={sizes.sm}
                position="absolute"
                width="100%"
                backgroundColor={colors.card}
                bottom={0}
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
                        {currentStep === 3 ? (
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
