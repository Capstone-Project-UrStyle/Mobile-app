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
    FormRow,
    WeatherSelector,
    OccasionSelector,
    ColorSelector,
    MaterialSelector,
    PatternSelector,
    ItemSelector,
    DraggableImage,
} from '../components'

import { createFormDataFromUri } from '../utils/formDataCreator'

import { BASE_API_URL } from '../api/axiosClient'
import uploadImageApi from '../api/uploadImageApi'
import closetApi from '../api/closetApi'
import outfitApi from '../api/outfitApi'
import lstmModalApi from '../api/lstmModalApi'

const isAndroid = Platform.OS === 'android'

const RecommendCompatibleItems = ({ navigation }) => {
    const { t } = useTranslation()
    const { icons, colors, sizes, fonts, screenSize } = useTheme()
    const { user, handleSetIsLoading, setLoadingMessage, masterData } =
        useData()
    const isFocused = useIsFocused()
    const viewShotRef = useRef()

    const [refresh, forceRefresh] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [userClosets, setUserClosets] = useState(null)
    const [selectedClosetDetail, setSelectedClosetDetail] = useState(null)
    const [queryItemIds, setQueryItemIds] = useState([])
    const [queryKeywords, setQueryKeywords] = useState({
        weathers: [],
        occasion_ids: [],
        color_ids: [],
        material_ids: [],
        pattern_ids: [],
        brand: '',
        otherKeywords: '',
    })
    const [recommendItems, setRecommendItems] = useState(null)
    const [itemImageSizes, setItemImageSizes] = useState([])
    const [itemImageLastPositions, setItemImageLastPositions] = useState([])
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

    const handleChangeQueryItemIds = useCallback(
        (value) => {
            setQueryItemIds(value.item_ids)
            handleChangeCredentials({ item_ids: value.item_ids })
        },
        [setQueryItemIds],
    )

    const handleChangeQueryKeywords = useCallback(
        (value) => {
            setQueryKeywords((state) => ({ ...state, ...value }))
        },
        [setQueryKeywords],
    )

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

    const handlePressQueryWeatherTag = (weather) => {
        if (
            queryKeywords.weathers
                .map((weather) => weather.displayName)
                .includes(weather.displayName)
        ) {
            handleChangeQueryKeywords({
                weathers: queryKeywords.weathers.filter(
                    (qeuryWeather) =>
                        qeuryWeather.displayName !== weather.displayName,
                ),
            })
        } else {
            handleChangeQueryKeywords({
                weathers: [...queryKeywords.weathers, weather],
            })
        }
    }

    const isEnableSubmitButton = useCallback(() => {
        switch (currentStep) {
            case 1:
                return selectedClosetDetail !== null
            case 2:
                return Array.isArray(queryItemIds) && queryItemIds.length > 0
            case 3:
                return true
            case 4:
                return isValid.item_ids
            case 5:
                return true
            case 6:
                return !Object.values(isValid).includes(false)
            default:
                break
        }
    }, [currentStep, selectedClosetDetail, queryItemIds, isValid])

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
                // Move to step 3
                setCurrentStep(3)
                break
            case 3:
                // Built query_keywords array
                const weatherNames = queryKeywords.weathers
                    .map((weather) => weather.name)
                    .filter((name) => name !== '')
                const occasionNames = masterData.Occasions.filter((occasion) =>
                    queryKeywords.occasion_ids.includes(occasion.id),
                ).map((occasion) => occasion.name)
                const colorNames = masterData.Colors.filter((color) =>
                    queryKeywords.color_ids.includes(color.id),
                ).map((color) => color.name)
                const materialNames = masterData.Materials.filter((material) =>
                    queryKeywords.material_ids.includes(material.id),
                ).map((material) => material.name)
                const patternNames = masterData.Patterns.filter((pattern) =>
                    queryKeywords.pattern_ids.includes(pattern.id),
                ).map((pattern) => pattern.name)

                const query_keywords = [
                    ...weatherNames,
                    ...occasionNames,
                    ...colorNames,
                    ...materialNames,
                    ...patternNames,
                ]

                if (queryKeywords.brand)
                    query_keywords.push(queryKeywords.brand)

                const recommendCredentials = {
                    query_item_ids: queryItemIds,
                    query_keywords: query_keywords,
                }

                // Call API to generate outfit recommendation by query
                try {
                    handleSetIsLoading(true)
                    setLoadingMessage(
                        t('recommendCompatibleItems.modelRunningMessage'),
                    )
                    const recommendResponse =
                        await lstmModalApi.generateItemRecommendations(
                            recommendCredentials,
                        )
                    if (recommendResponse.request.status === 200) {
                        setRecommendItems(recommendResponse.data)
                        handleSetIsLoading(false)
                        setLoadingMessage(null)

                        // Move to step 4
                        setCurrentStep(4)
                    }
                } catch (error) {
                    handleSetIsLoading(false)
                    setLoadingMessage(null)
                    Alert.alert(error.response.data.message)
                }
                break
            case 4:
                // Initiate image's sizes
                setItemImageSizes(Array(credentials.item_ids.length).fill(150))

                // Initiate image's positions
                setItemImageLastPositions(
                    Array(credentials.item_ids.length).fill({ x: 0, y: 0 }),
                )

                // Move to step 5
                setCurrentStep(5)
                break
            case 5:
                try {
                    // Save composit image
                    const compositImageUri = await viewShotRef.current.capture()
                    setOutfitImageUri(compositImageUri)

                    // Move to step 5
                    setCurrentStep(6)
                } catch (error) {
                    console.log(error)
                }
                break
            case 6:
                // Submit new outfit
                if (!Object.values(isValid).includes(false)) {
                    try {
                        handleSetIsLoading(true)
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
            default:
                break
        }
    }, [currentStep, queryKeywords, isValid, outfitImageUri, credentials])

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
                        t('recommendCompatibleItems.stepOneLabel')}
                    {currentStep === 2 &&
                        t('recommendCompatibleItems.stepTwoLabel')}
                    {currentStep === 3 &&
                        t('recommendCompatibleItems.stepThreeLabel')}
                    {currentStep === 4 &&
                        t('recommendCompatibleItems.stepFourLabel')}
                    {currentStep === 5 &&
                        t('recommendCompatibleItems.stepFiveLabel')}
                    {currentStep === 6 &&
                        t('recommendCompatibleItems.stepSixLabel')}
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

            {currentStep === 2 && (
                // Render item selector
                <ItemSelector
                    closet={selectedClosetDetail}
                    forceRefresh={forceRefresh}
                    selectMode={{
                        credentials: { item_ids: queryItemIds },
                        handleChangeCredentials: handleChangeQueryItemIds,
                    }}
                />
            )}

            {currentStep === 3 && (
                // Render query builder
                <Block scroll showsVerticalScrollIndicator={false} flex={1}>
                    <Block padding={sizes.sm}>
                        {/* Weather selector */}
                        <Block paddingBottom={sizes.m}>
                            <Block flex={0} row align="center">
                                <Text h5 marginRight={sizes.xs}>
                                    {t(
                                        'recommendCompatibleItems.weatherInfo',
                                    )}
                                </Text>
                                <Image
                                    source={icons.weather}
                                    radius={0}
                                    width={30}
                                    height={30}
                                />
                            </Block>
                            <FormRow
                                type="Weathers"
                                label={t('recommendCompatibleItems.weathers')}
                                values={queryKeywords.weathers.map(
                                    (weather) => weather.displayName,
                                )}
                                renderValueSelector={() => (
                                    <WeatherSelector
                                        selectedWeathers={queryKeywords.weathers.map(
                                            (weather) => weather.displayName,
                                        )}
                                        handlePressWeatherTag={
                                            handlePressQueryWeatherTag
                                        }
                                    />
                                )}
                            />
                        </Block>

                        {/* Occasion selector */}
                        <Block paddingVertical={sizes.m}>
                            <Text h5>
                                {t('recommendCompatibleItems.occasionInfo')}
                            </Text>
                            <FormRow
                                type="Occasions"
                                label={t(
                                    'recommendCompatibleItems.occasions',
                                )}
                                values={queryKeywords.occasion_ids}
                                renderValueSelector={() => (
                                    <OccasionSelector
                                        selectedOccasionIds={
                                            queryKeywords.occasion_ids
                                        }
                                        handleChangeCredentials={
                                            handleChangeQueryKeywords
                                        }
                                    />
                                )}
                            />
                        </Block>

                        {/* Item info */}
                        <Block paddingVertical={sizes.m}>
                            <Text h5>
                                {t('recommendCompatibleItems.itemInfo')}
                            </Text>

                            {/* Color selector */}
                            <FormRow
                                type="Colors"
                                label={t(
                                    'recommendCompatibleItems.itemColor',
                                )}
                                values={queryKeywords.color_ids}
                                renderValueSelector={() => (
                                    <ColorSelector
                                        selectedColorIds={
                                            queryKeywords.color_ids
                                        }
                                        handleChangeCredentials={
                                            handleChangeQueryKeywords
                                        }
                                    />
                                )}
                            />

                            {/* Material selector */}
                            <FormRow
                                type="Materials"
                                label={t(
                                    'recommendCompatibleItems.itemMaterial',
                                )}
                                values={queryKeywords.material_ids}
                                renderValueSelector={() => (
                                    <MaterialSelector
                                        selectedMaterialIds={
                                            queryKeywords.material_ids
                                        }
                                        handleChangeCredentials={
                                            handleChangeQueryKeywords
                                        }
                                    />
                                )}
                            />

                            {/* Pattern selector */}
                            <FormRow
                                type="Patterns"
                                label={t(
                                    'recommendCompatibleItems.itemPattern',
                                )}
                                values={queryKeywords.pattern_ids}
                                renderValueSelector={() => (
                                    <PatternSelector
                                        selectedPatternIds={
                                            queryKeywords.pattern_ids
                                        }
                                        handleChangeCredentials={
                                            handleChangeQueryKeywords
                                        }
                                    />
                                )}
                            />

                            {/* Item brand */}
                            <Block
                                flex={1}
                                borderBottomWidth={0.8}
                                borderColor={colors.light}
                            >
                                <Block
                                    row
                                    align="center"
                                    justify="space-between"
                                    paddingVertical={sizes.s}
                                >
                                    <Text p semibold marginRight={sizes.m}>
                                        {t(
                                            'recommendCompatibleItems.itemBrand',
                                        )}
                                    </Text>
                                    <Block
                                        borderBottomWidth={0.8}
                                        borderColor={colors.light}
                                    >
                                        <Input
                                            textAlign="right"
                                            autoCapitalize="none"
                                            success={Boolean(
                                                queryKeywords.brand &&
                                                    queryKeywords.brand
                                                        .length <= 50,
                                            )}
                                            danger={Boolean(
                                                queryKeywords.brand &&
                                                    queryKeywords.brand
                                                        .length <= 50,
                                            )}
                                            onChangeText={(value) =>
                                                handleChangeQueryKeywords({
                                                    brand: value,
                                                })
                                            }
                                            value={queryKeywords.brand}
                                            noBorder
                                        />
                                    </Block>
                                </Block>
                            </Block>
                        </Block>

                        {/* Other keywords */}
                        <Block paddingTop={sizes.m}>
                            <Text h5>
                                {t('recommendCompatibleItems.otherKeywords')}
                            </Text>
                            <Block
                                borderBottomWidth={0.8}
                                borderColor={colors.light}
                            >
                                <Input
                                    placeholder={t(
                                        'recommendCompatibleItems.otherKeywordsPlaceholder',
                                    )}
                                    autoCapitalize="none"
                                    success={Boolean(
                                        queryKeywords.otherKeywords &&
                                            queryKeywords.otherKeywords
                                                .length <= 50,
                                    )}
                                    danger={!Boolean(
                                        queryKeywords.otherKeywords &&
                                            !queryKeywords.otherKeywords
                                                .length <= 50,
                                    )}
                                    onChangeText={(value) =>
                                        handleChangeQueryKeywords({
                                            otherKeywords: value,
                                        })
                                    }
                                    value={queryKeywords.otherKeywords}
                                    noBorder
                                />
                            </Block>
                        </Block>
                    </Block>
                </Block>
            )}

            {currentStep === 4 && (
                // Render item selector
                <ItemSelector
                    closet={{ Items: recommendItems }}
                    forceRefresh={forceRefresh}
                    selectMode={{
                        credentials: credentials,
                        handleChangeCredentials: handleChangeCredentials,
                    }}
                />
            )}

            {currentStep === 5 && (
                <Block flex={0} height={screenSize.height - 175}>
                    {/* Render dragable view */}
                    <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
                        {recommendItems
                            .concat(
                                selectedClosetDetail
                                    ? selectedClosetDetail.Items
                                    : [],
                            )
                            .filter((item) =>
                                credentials.item_ids.includes(item.id),
                            )
                            .map((item, index) => {
                                return (
                                    <DraggableImage
                                        key={`item-${item.id}`}
                                        index={index}
                                        width={itemImageSizes[index]}
                                        height={itemImageSizes[index]}
                                        source={{
                                            uri: BASE_API_URL + item.image,
                                        }}
                                        lastPosition={
                                            itemImageLastPositions[index]
                                        }
                                        onDrag={handleDragItemImage}
                                    />
                                )
                            })}
                    </ViewShot>
                </Block>
            )}

            {currentStep === 6 && (
                // Render outfit's info form
                <Block
                    scroll
                    showsVerticalScrollIndicator={false}
                    flex={1}
                    paddingHorizontal={sizes.sm}
                    paddingBottom={sizes.s}
                >
                    {/* Outfit image */}
                    <Block>
                        <Text h5 paddingBottom={sizes.s}>
                            {t('recommendCompatibleItems.outfitImage')}
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
                    <Block paddingVertical={sizes.sm}>
                        <Text h5 paddingBottom={sizes.s}>
                            {t('recommendCompatibleItems.occasions')}
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
                        marginBottom={sizes.sm}
                    >
                        <Text h5>{t('recommendCompatibleItems.public')}</Text>
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
                        {currentStep === 6 ? (
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

export default RecommendCompatibleItems
