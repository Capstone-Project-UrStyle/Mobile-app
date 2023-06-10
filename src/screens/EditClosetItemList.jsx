import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

import { useTranslation, useTheme, useData } from '../hooks'
import { Block, Button, Text, ItemCard } from '../components'

import closetApi from '../api/closetApi'

const isAndroid = Platform.OS === 'android'

const EditClosetItemList = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts, screenSize } = useTheme()
    const { user, masterData, handleSetIsLoading } = useData()
    const isFocused = useIsFocused()

    const [allItemClosetDetail, setAllItemClosetDetail] = useState(null)
    const [targetClosetDetail, setTargetClosetDetail] = useState(null)
    const [parentCategories, setParentCategories] = useState([])
    const [childCategories, setChildCategories] = useState([])
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState(0)
    const [selectedChildCategoryId, setSelectedChildCategoryId] = useState(0)
    const [itemList, setItemList] = useState([])
    const [refresh, forceRefresh] = useState(false)
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

    // Get all closet items's parent categories
    useEffect(() => {
        if (masterData && allItemClosetDetail) {
            const closetItems = allItemClosetDetail.Items
            const categories = closetItems.map((item) => item.Category)

            // Get closet's unique parent categories
            const parentCategoryIds = categories.map(
                (category) => category.parent_id,
            )
            const uniqueParentCategoryIds = [...new Set(parentCategoryIds)]
            setParentCategories(
                masterData.Categories.filter((category) =>
                    uniqueParentCategoryIds.includes(category.id),
                ),
            )
        }
    }, [allItemClosetDetail])

    // Get all closet items's child categories when select parent category changes
    useEffect(() => {
        if (allItemClosetDetail && selectedParentCategoryId !== 0) {
            const closetItems = allItemClosetDetail.Items
            const categories = closetItems.map((item) => item.Category)

            // Get closet's unique child categories
            const uniqueChildCategories = categories.filter(
                (category, index, self) =>
                    index ===
                    self.findIndex(
                        (c) =>
                            c.id === category.id &&
                            category.parent_id === selectedParentCategoryId,
                    ),
            )
            setChildCategories(uniqueChildCategories)
            setSelectedChildCategoryId(0)
        }
    }, [allItemClosetDetail, selectedParentCategoryId])

    // Get item list when selected parent category or selected child category changes
    useEffect(() => {
        if (allItemClosetDetail && selectedParentCategoryId === 0) {
            setItemList(allItemClosetDetail.Items)
        }

        if (allItemClosetDetail && selectedParentCategoryId !== 0) {
            if (selectedChildCategoryId === 0) {
                const filterItems = allItemClosetDetail.Items.filter(
                    (item) =>
                        item.Category.parent_id === selectedParentCategoryId,
                )
                setItemList(filterItems)
            } else {
                const filterItems = allItemClosetDetail.Items.filter(
                    (item) => item.category_id === selectedChildCategoryId,
                )
                setItemList(filterItems)
            }
        }
    }, [allItemClosetDetail, selectedParentCategoryId, selectedChildCategoryId])

    // Update valid status check when credentials change
    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            item_ids:
                Array.isArray(credentials.item_ids) &&
                credentials.item_ids.length > 0,
        }))
    }, [credentials, setIsValid])

    const handleSelectCategory = useCallback(
        (category) => {
            if (category === 'All parent') {
                return setSelectedParentCategoryId(0)
            }

            if (category === 'All child') {
                return setSelectedChildCategoryId(0)
            }

            if (category.is_parent) {
                setSelectedParentCategoryId(category.id)
            } else {
                setSelectedChildCategoryId(category.id)
            }
        },
        [setSelectedParentCategoryId, setSelectedChildCategoryId],
    )

    const handleChangeCredentials = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const handlePressItemCheckbox = (itemId) => {
        if (credentials.item_ids.includes(itemId)) {
            handleChangeCredentials({
                item_ids: credentials.item_ids.filter((id) => id !== itemId),
            })
        } else {
            handleChangeCredentials({
                item_ids: [...credentials.item_ids, itemId],
            })
        }
    }

    const renderItemList = () => {
        if (itemList && itemList.length > 0) {
            return itemList.map((item) => {
                return (
                    <ItemCard
                        key={`item-${item.id}`}
                        item={item}
                        selectMode={{
                            onSelect: () => handlePressItemCheckbox(item.id),
                            isSelected: credentials.item_ids.includes(item.id),
                        }}
                    />
                )
            })
        } else {
            return (
                <Text p center font={fonts?.['semibold']} width="100%">
                    {t('addItemToCloset.noItemFound')}
                </Text>
            )
        }
    }

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
            {/* Render parent categories */}
            <Block flex={0} row color={colors.card}>
                <Block
                    scroll
                    horizontal
                    renderToHardwareTextureAndroid
                    showsHorizontalScrollIndicator={false}
                    flex={0}
                    borderBottomWidth={1}
                    borderColor={colors.light}
                >
                    <Block row flex={0} color={colors.card}>
                        <Block
                            key="parent-category-all"
                            borderBottomWidth={
                                selectedParentCategoryId === 0 ? 1 : 0
                            }
                            borderColor={
                                selectedParentCategoryId === 0
                                    ? colors.black
                                    : colors.light
                            }
                            paddingHorizontal={sizes.s}
                        >
                            <Button
                                onPress={() =>
                                    handleSelectCategory('All parent')
                                }
                            >
                                <Text
                                    p
                                    size={14}
                                    font={
                                        fonts?.[
                                            selectedParentCategoryId === 0
                                                ? 'semibold'
                                                : 'normal'
                                        ]
                                    }
                                >
                                    All
                                </Text>
                            </Button>
                        </Block>

                        {parentCategories &&
                            parentCategories.map((category) => {
                                const isSelected =
                                    selectedParentCategoryId === category.id
                                return (
                                    <Block
                                        key={`parent-category-${category.id}`}
                                        borderBottomWidth={isSelected ? 1 : 0}
                                        borderColor={
                                            isSelected
                                                ? colors.black
                                                : colors.light
                                        }
                                        paddingHorizontal={sizes.sm}
                                    >
                                        <Button
                                            onPress={() =>
                                                handleSelectCategory(category)
                                            }
                                        >
                                            <Text
                                                p
                                                font={
                                                    fonts?.[
                                                        isSelected
                                                            ? 'semibold'
                                                            : 'normal'
                                                    ]
                                                }
                                            >
                                                {category.name}
                                            </Text>
                                        </Button>
                                    </Block>
                                )
                            })}
                    </Block>
                </Block>
            </Block>

            {/* Render child categories */}
            {selectedParentCategoryId !== 0 && (
                <Block flex={0} row color={colors.card}>
                    <Block
                        scroll
                        horizontal
                        renderToHardwareTextureAndroid
                        showsHorizontalScrollIndicator={false}
                        flex={0}
                        borderBottomWidth={1}
                        borderColor={colors.light}
                    >
                        <Block row flex={0} color={colors.card} wrap="wrap">
                            <Block
                                key="child-category-all"
                                borderBottomWidth={
                                    selectedChildCategoryId === 0 ? 1 : 0
                                }
                                borderColor={
                                    selectedChildCategoryId === 0
                                        ? colors.black
                                        : colors.light
                                }
                                paddingHorizontal={sizes.s}
                            >
                                <Button
                                    onPress={() =>
                                        handleSelectCategory('All child')
                                    }
                                >
                                    <Text
                                        p
                                        size={14}
                                        font={
                                            fonts?.[
                                                selectedChildCategoryId === 0
                                                    ? 'semibold'
                                                    : 'normal'
                                            ]
                                        }
                                    >
                                        All
                                    </Text>
                                </Button>
                            </Block>

                            {childCategories &&
                                childCategories.map((category) => {
                                    const isSelected =
                                        selectedChildCategoryId === category.id
                                    return (
                                        <Block
                                            key={`child-category-${category.id}`}
                                            borderBottomWidth={
                                                isSelected ? 1 : 0
                                            }
                                            borderColor={
                                                isSelected
                                                    ? colors.black
                                                    : colors.light
                                            }
                                            paddingHorizontal={sizes.s}
                                        >
                                            <Button
                                                onPress={() =>
                                                    handleSelectCategory(
                                                        category,
                                                    )
                                                }
                                            >
                                                <Text
                                                    p
                                                    size={14}
                                                    font={
                                                        fonts?.[
                                                            isSelected
                                                                ? 'semibold'
                                                                : 'normal'
                                                        ]
                                                    }
                                                >
                                                    {category.name}
                                                </Text>
                                            </Button>
                                        </Block>
                                    )
                                })}
                        </Block>
                    </Block>
                </Block>
            )}

            {/* Render Item cards */}
            <Block
                scroll
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.l }}
                forceRefresh={forceRefresh}
            >
                <Block row wrap="wrap" align="flex-start" justify="flex-start">
                    {renderItemList()}
                </Block>
            </Block>

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
                    <Text h5>{t('addItemToCloset.done')}</Text>
                </Button>
            </Block>
        </Block>
    )
}

export default EditClosetItemList
