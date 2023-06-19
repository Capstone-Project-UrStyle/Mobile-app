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
import { showSelectImageSourceAlert } from '../utils/showSelectImageSourceAlert'

import uploadImageApi from '../api/uploadImageApi'
import itemApi from '../api/itemApi'
import closetApi from '../api/closetApi'

const isAndroid = Platform.OS === 'android'

const CreateItem = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes } = useTheme()
    const { user, handleSetIsLoading } = useData()

    const [userClosets, setUserClosets] = useState([])
    const [uploadItemImageUri, setUploadItemImageUri] = useState(null)
    const [isValid, setIsValid] = useState({
        item_image_uri: false,
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

    // Push all items closet's id and route params's closetId to credentials closet_ids array
    useEffect(() => {
        if (userClosets.length > 0) {
            const allItemsCloset = userClosets.find(
                (closet) => closet.name === 'All items',
            )
            if (allItemsCloset) {
                handlePressClosetCheckbox(allItemsCloset.id)
            }
        }
    }, [userClosets])

    // Push params closet id to credentials closet_ids array if exist
    useEffect(() => {
        if (route.params && route.params.closetId) {
            const closetId = route.params.closetId
            handlePressClosetCheckbox(closetId)
        }
    }, [route])

    // Force user to choose first item image
    useEffect(() => {
        if (uploadItemImageUri === null) {
            showSelectImageSourceAlert(
                t,
                navigation,
                uploadItemImageUri,
                handleUploadItemImage,
            )
        }
    }, [uploadItemImageUri])

    // Update valid status check when credentials change
    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            item_image_uri: uploadItemImageUri !== null,
            closet_ids: Array.isArray(credentials.closet_ids),
            occasion_ids: Array.isArray(credentials.occasion_ids),
            category_id: Number.isInteger(credentials.category_id),
            color_ids: Array.isArray(credentials.color_ids),
            material_ids: Array.isArray(credentials.material_ids),
            pattern_ids: Array.isArray(credentials.pattern_ids),
            brand: credentials.brand !== null && credentials.brand.length <= 50,
        }))
    }, [credentials, uploadItemImageUri, setIsValid])

    const handleUploadItemImage = async (fromCamera) => {
        let result = fromCamera
            ? await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
              })
            : await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
              })

        if (!result.canceled) {
            setUploadItemImageUri(result.assets[0].uri)
        }

        return result
    }

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
                ))}
            </Block>
        )
    }

    const handleSubmit = useCallback(async () => {
        if (!Object.values(isValid).includes(false)) {
            try {
                const response = await itemApi.createNew(credentials)
                if (response.request.status === 200) {
                    // Upload item image
                    if (uploadItemImageUri) {
                        const postData = createFormDataFromUri(
                            'item-image',
                            uploadItemImageUri,
                        )
                        await uploadImageApi.uploadItemImage(
                            response.data.itemId,
                            postData,
                        )
                    }

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
            <Block scroll showsVerticalScrollIndicator={false} flex={1}>
                {/* Item image */}
                <Block paddingHorizontal={sizes.s}>
                    <TouchableOpacity
                        onPress={() =>
                            showSelectImageSourceAlert(
                                t,
                                navigation,
                                uploadItemImageUri,
                                handleUploadItemImage,
                            )
                        }
                    >
                        <Image
                            resizeMode="cover"
                            style={{
                                height: 350,
                                width: '100%',
                            }}
                            source={{ uri: uploadItemImageUri }}
                        />
                    </TouchableOpacity>
                </Block>

                {/* Item info */}
                <Block padding={sizes.sm}>
                    {/* Item closets */}
                    <Block paddingVertical={sizes.m}>
                        <Text h5>{t('createItem.closetInfo')}</Text>
                        <FormRow
                            type="Closets"
                            label={t('createItem.closets')}
                            values={userClosets.filter((closet) =>
                                credentials.closet_ids.includes(closet.id),
                            )}
                            renderValueSelector={renderSelectClosets}
                        />
                    </Block>

                    {/* Item occasions */}
                    <Block paddingVertical={sizes.m}>
                        <Text h5>{t('createItem.occasionInfo')}</Text>
                        <FormRow
                            type="Occasions"
                            label={t('createItem.occasions')}
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
                        <Text h5>{t('createItem.itemInfo')}</Text>

                        {/* Item category */}
                        <FormRow
                            type="Categories"
                            label={t('createItem.itemCategory')}
                            categoryId={credentials.category_id}
                            renderValueSelector={() => (
                                <CategorySelector
                                    selectedCategoryId={credentials.category_id}
                                    handlePressCategoryTag={
                                        handlePressCategoryTag
                                    }
                                />
                            )}
                        />

                        {/* Item color */}
                        <FormRow
                            type="Colors"
                            label={t('createItem.itemColor')}
                            values={credentials.color_ids}
                            renderValueSelector={() => (
                                <ColorSelector
                                    selectedColorIds={credentials.color_ids}
                                    handlePressColorTag={handlePressColorTag}
                                />
                            )}
                        />

                        {/* Item material */}
                        <FormRow
                            type="Materials"
                            label={t('createItem.itemMaterial')}
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
                            label={t('createItem.itemPattern')}
                            values={credentials.pattern_ids}
                            renderValueSelector={() => (
                                <PatternSelector
                                    selectedPatternIds={credentials.pattern_ids}
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
                                <Text p semibold marginRight={sizes.m}>
                                    {t('createItem.itemBrand')}
                                </Text>
                                <Block
                                    borderBottomWidth={0.8}
                                    borderColor={colors.light}
                                >
                                    <Input
                                        textAlign="right"
                                        autoCapitalize="none"
                                        success={Boolean(
                                            credentials.brand && isValid.brand,
                                        )}
                                        danger={Boolean(
                                            credentials.brand && !isValid.brand,
                                        )}
                                        onChangeText={(value) =>
                                            handleChangeCredentials({
                                                brand: value,
                                            })
                                        }
                                        value={credentials.brand}
                                        noBorder
                                    />
                                </Block>
                            </Block>
                        </Block>
                    </Block>
                </Block>
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
                        !Object.values(isValid).includes(false) ? 1 : 0.2
                    }
                    style={{
                        opacity: Object.values(isValid).includes(false)
                            ? 0.5
                            : 1,
                    }}
                    onPress={handleSubmit}
                >
                    <Text h5>{t('createItem.done')}</Text>
                </Button>
            </Block>
        </Block>
    )
}

export default CreateItem
