import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import { useTranslation, useTheme, useData } from '../hooks'
import {
    Block,
    Button,
    Text,
    Image,
    Input,
    ClosetCard,
    FormRow,
    OccasionSelector,
    CategorySelector,
    ColorSelector,
    MaterialSelector,
    PatternSelector,
} from '../components'
import { createFormDataFromUri } from '../utils/formDataCreator'

import { BASE_API_URL } from '../api/axiosClient'
import uploadImageApi from '../api/uploadImageApi'
import itemApi from '../api/itemApi'
import closetApi from '../api/closetApi'

const isAndroid = Platform.OS === 'android'

const ItemDetail = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts } = useTheme()
    const { user, handleSetIsLoading } = useData()

    const [tab, setTab] = useState(0)
    const [itemDetail, setItemDetail] = useState(null)
    const [userClosets, setUserClosets] = useState([])
    const [uploadItemImageUri, setUploadItemImageUri] = useState(null)
    const [isValid, setIsValid] = useState({
        closet_ids: false,
        occasion_ids: false,
        category_id: false,
        color_ids: false,
        material_ids: false,
        pattern_ids: false,
        brand: false,
    })
    const [credentials, setCredentials] = useState({
        closet_ids: [],
        occasion_ids: [],
        category_id: null,
        color_ids: [],
        material_ids: [],
        pattern_ids: [],
        brand: '',
    })

    const { itemId } = route.params

    // Fetch all user closets and master data
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

        fetchUserClosets()
    }, [])

    useEffect(() => {
        async function fetchItemDetail() {
            handleSetIsLoading(true)
            try {
                const response = await itemApi.getOneById(itemId)
                if (response.request.status === 200) {
                    setItemDetail(response.data)
                    handleSetIsLoading(false)
                }
            } catch (error) {
                handleSetIsLoading(false)
                Alert.alert(error.response.data.message)
            }
        }

        fetchItemDetail()
    }, [])

    useEffect(() => {
        if (itemDetail) {
            // Update credentials
            handleChangeCredentials({
                closet_ids: itemDetail.Closets.map((item) => item.id),
                occasion_ids: itemDetail.Occasions.map((item) => item.id),
                category_id: itemDetail.category_id,
                color_ids: itemDetail.Colors.map((item) => item.id),
                material_ids: itemDetail.Materials.map((item) => item.id),
                pattern_ids: itemDetail.Patterns.map((item) => item.id),
                brand: itemDetail.brand,
            })
        }
    }, [itemDetail])

    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            closet_ids: Array.isArray(credentials.closet_ids),
            occasion_ids: Array.isArray(credentials.occasion_ids),
            category_id: Number.isInteger(credentials.category_id),
            color_ids: Array.isArray(credentials.color_ids),
            material_ids: Array.isArray(credentials.material_ids),
            pattern_ids: Array.isArray(credentials.pattern_ids),
            brand: credentials.brand !== null && credentials.brand.length <= 50,
        }))
    }, [credentials, setIsValid])

    const handleChooseItemImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        })

        if (!result.canceled) {
            setUploadItemImageUri(result.assets[0].uri)
        }
    }

    const handleTabs = useCallback(
        (tab) => {
            setTab(tab)
        },
        [setTab],
    )

    const handleChangeCredentials = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const handlePressClosetCheckbox = (closetId) => {
        if (credentials.closet_ids.includes(closetId)) {
            handleChangeCredentials({
                closet_ids: credentials.closet_ids.filter(
                    (id) => id !== closetId,
                ),
            })
        } else {
            handleChangeCredentials({
                closet_ids: [...credentials.closet_ids, closetId],
            })
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

    const handlePressCategoryTag = (categoryId) => {
        if (credentials.category_id === categoryId) {
            return handleChangeCredentials({ category_id: null })
        }
        return handleChangeCredentials({ category_id: categoryId })
    }

    const handlePressColorTag = (colorId) => {
        if (credentials.color_ids.includes(colorId)) {
            handleChangeCredentials({
                color_ids: credentials.color_ids.filter((id) => id !== colorId),
            })
        } else {
            handleChangeCredentials({
                color_ids: [...credentials.color_ids, colorId],
            })
        }
    }

    const handlePressMaterialTag = (materialId) => {
        if (credentials.material_ids.includes(materialId)) {
            handleChangeCredentials({
                material_ids: credentials.material_ids.filter(
                    (id) => id !== materialId,
                ),
            })
        } else {
            handleChangeCredentials({
                material_ids: [...credentials.material_ids, materialId],
            })
        }
    }

    const handlePressPatternTag = (patternId) => {
        if (credentials.pattern_ids.includes(patternId)) {
            handleChangeCredentials({
                pattern_ids: credentials.pattern_ids.filter(
                    (id) => id !== patternId,
                ),
            })
        } else {
            handleChangeCredentials({
                pattern_ids: [...credentials.pattern_ids, patternId],
            })
        }
    }

    const renderSelectClosets = () => {
        return (
            <Block row wrap="wrap" justify="space-between">
                {userClosets.map((closet) => (
                    <Block
                        flex={0}
                        key={`closet-${closet?.id}`}
                        alignItems="flex-end"
                    >
                        <ClosetCard
                            key={`closet-${closet?.id}`}
                            closet={closet}
                            type={'vertical'}
                            selectMode={{
                                onSelect: () =>
                                    handlePressClosetCheckbox(closet.id),
                                isSelected: credentials.closet_ids.includes(
                                    closet.id,
                                ),
                                isFixed: closet.name === 'All items',
                            }}
                        />
                    </Block>
                ))}
            </Block>
        )
    }

    const handleSubmit = useCallback(async () => {
        if (!Object.values(isValid).includes(false)) {
            try {
                // Upload item image
                if (uploadItemImageUri) {
                    const postData = createFormDataFromUri(
                        'item-image',
                        uploadItemImageUri,
                    )
                    await uploadImageApi.uploadItemImage(itemId, postData)
                }

                const response = await itemApi.updateById(itemId, credentials)
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
            {itemDetail && (
                <Block>
                    <Block scroll showsVerticalScrollIndicator={false} flex={1}>
                        {/* Item image */}
                        <Block
                            paddingHorizontal={sizes.s}
                            paddingBottom={sizes.s}
                        >
                            <TouchableOpacity onPress={handleChooseItemImage}>
                                <Image
                                    resizeMode="cover"
                                    style={{
                                        height: 350,
                                        width: '100%',
                                    }}
                                    source={{
                                        uri:
                                            uploadItemImageUri ||
                                            BASE_API_URL + itemDetail.image,
                                    }}
                                />
                            </TouchableOpacity>
                        </Block>

                        {/* Tabs */}
                        <Block
                            row
                            flex={0}
                            align="center"
                            justify="space-between"
                            color={colors.card}
                        >
                            <Block
                                borderBottomWidth={1}
                                borderColor={
                                    tab === 0 ? colors.black : colors.light
                                }
                            >
                                <Button onPress={() => handleTabs(0)}>
                                    <Text
                                        p
                                        font={
                                            fonts?.[
                                                tab === 0
                                                    ? 'semibold'
                                                    : 'normal'
                                            ]
                                        }
                                    >
                                        {t('itemDetail.informationTab')}
                                    </Text>
                                </Button>
                            </Block>

                            <Block
                                borderBottomWidth={1}
                                borderColor={
                                    tab === 1 ? colors.black : colors.light
                                }
                            >
                                <Button onPress={() => handleTabs(1)}>
                                    <Text
                                        p
                                        font={
                                            fonts?.[
                                                tab === 1
                                                    ? 'semibold'
                                                    : 'normal'
                                            ]
                                        }
                                    >
                                        {t('itemDetail.outfitTab')}
                                    </Text>
                                </Button>
                            </Block>
                        </Block>

                        {/* Item infomation tab */}
                        {tab === 0 && (
                            <Block padding={sizes.sm}>
                                {/* Item closets */}
                                <Block paddingVertical={sizes.m}>
                                    <Text h5>{t('itemDetail.closetInfo')}</Text>
                                    <FormRow
                                        type="Closets"
                                        label={t('itemDetail.closets')}
                                        values={userClosets.filter((closet) =>
                                            credentials.closet_ids.includes(
                                                closet.id,
                                            ),
                                        )}
                                        renderValueSelector={
                                            renderSelectClosets
                                        }
                                    />
                                </Block>

                                {/* Item occasions */}
                                <Block paddingVertical={sizes.m}>
                                    <Text h5>
                                        {t('itemDetail.occasionInfo')}
                                    </Text>
                                    <FormRow
                                        type="Occasions"
                                        label={t('itemDetail.occasions')}
                                        values={credentials.occasion_ids}
                                        renderValueSelector={() => (
                                            <OccasionSelector
                                                selectedOccasionIds={
                                                    credentials.occasion_ids
                                                }
                                                handlePressOccasionTag={
                                                    handlePressOccasionTag
                                                }
                                            />
                                        )}
                                    />
                                </Block>

                                {/* Item info */}
                                <Block paddingVertical={sizes.m}>
                                    <Text h5>{t('itemDetail.itemInfo')}</Text>

                                    {/* Item category */}
                                    <FormRow
                                        type="Categories"
                                        label={t('itemDetail.itemCategory')}
                                        categoryId={credentials.category_id}
                                        renderValueSelector={() => (
                                            <CategorySelector
                                                selectedCategoryId={
                                                    credentials.category_id
                                                }
                                                handlePressCategoryTag={
                                                    handlePressCategoryTag
                                                }
                                            />
                                        )}
                                    />

                                    {/* Item color */}
                                    <FormRow
                                        type="Colors"
                                        label={t('itemDetail.itemColor')}
                                        values={credentials.color_ids}
                                        renderValueSelector={() => (
                                            <ColorSelector
                                                selectedColorIds={
                                                    credentials.color_ids
                                                }
                                                handlePressColorTag={
                                                    handlePressColorTag
                                                }
                                            />
                                        )}
                                    />

                                    {/* Item material */}
                                    <FormRow
                                        type="Materials"
                                        label={t('itemDetail.itemMaterial')}
                                        values={credentials.material_ids}
                                        renderValueSelector={() => (
                                            <MaterialSelector
                                                selectedMaterialIds={
                                                    credentials.material_ids
                                                }
                                                handlePressMaterialTag={
                                                    handlePressMaterialTag
                                                }
                                            />
                                        )}
                                    />

                                    {/* Item pattern */}
                                    <FormRow
                                        type="Patterns"
                                        label={t('itemDetail.itemPattern')}
                                        values={credentials.pattern_ids}
                                        renderValueSelector={() => (
                                            <PatternSelector
                                                selectedPatternIds={
                                                    credentials.pattern_ids
                                                }
                                                handlePressPatternTag={
                                                    handlePressPatternTag
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
                                            <Text
                                                p
                                                semibold
                                                marginRight={sizes.m}
                                            >
                                                {t('itemDetail.itemBrand')}
                                            </Text>
                                            <Block
                                                borderBottomWidth={0.8}
                                                borderColor={colors.light}
                                            >
                                                <Input
                                                    textAlign="right"
                                                    autoCapitalize="none"
                                                    success={Boolean(
                                                        credentials.brand &&
                                                            isValid.brand,
                                                    )}
                                                    danger={Boolean(
                                                        credentials.brand &&
                                                            !isValid.brand,
                                                    )}
                                                    onChangeText={(value) =>
                                                        handleChangeCredentials(
                                                            { brand: value },
                                                        )
                                                    }
                                                    value={credentials.brand}
                                                    noBorder
                                                />
                                            </Block>
                                        </Block>
                                    </Block>
                                </Block>
                            </Block>
                        )}

                        {/* Item outfit tab */}
                        {tab === 1 && <Block></Block>}
                    </Block>

                    {/* Submit button */}
                    <Block
                        flex={0}
                        paddingHorizontal={sizes.sm}
                        paddingVertical={sizes.s}
                    >
                        <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            disabled={Object.values(isValid).includes(false)}
                            activeOpacity={
                                !Object.values(isValid).includes(false)
                                    ? 1
                                    : 0.2
                            }
                            style={{
                                opacity: Object.values(isValid).includes(false)
                                    ? 0.5
                                    : 1,
                            }}
                            onPress={handleSubmit}
                        >
                            <Text h5>{t('itemDetail.done')}</Text>
                        </Button>
                    </Block>
                </Block>
            )}
        </Block>
    )
}

export default ItemDetail
