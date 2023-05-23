import React, { useCallback, useEffect, useState } from 'react'
import { Alert, TouchableWithoutFeedback } from 'react-native'

import { useTranslation, useTheme, useData } from '../hooks'
import { Block, Button, Text, Image } from '../components'

import { BASE_API_URL } from '../api/axiosClient'
import closetApi from '../api/closetApi'

const ClosetDetail = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts, screenSize } = useTheme()
    const { masterData, handleSetIsLoading } = useData()

    const [closetDetail, setClosetDetail] = useState(null)
    const [parentCategories, setParentCategories] = useState([])
    const [childCategories, setChildCategories] = useState([])
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState(0)
    const [selectedChildCategoryId, setSelectedChildCategoryId] = useState(0)
    const [itemList, setItemList] = useState([])
    const [refresh, forceRefresh] = useState(false)

    const { closetId } = route.params

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

    useEffect(() => {
        if (masterData && closetDetail) {
            const closetItems = closetDetail.Items
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
    }, [closetDetail])

    useEffect(() => {
        if (closetDetail && selectedParentCategoryId !== 0) {
            const closetItems = closetDetail.Items
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
    }, [closetDetail, selectedParentCategoryId])

    useEffect(() => {
        if (closetDetail && selectedParentCategoryId === 0) {
            setItemList(closetDetail.Items)
        }

        if (closetDetail && selectedParentCategoryId !== 0) {
            if (selectedChildCategoryId === 0) {
                const filterItems = closetDetail.Items.filter(
                    (item) =>
                        item.Category.parent_id === selectedParentCategoryId,
                )
                setItemList(filterItems)
            } else {
                const filterItems = closetDetail.Items.filter(
                    (item) => item.category_id === selectedChildCategoryId,
                )
                setItemList(filterItems)
            }
        }
    }, [closetDetail, selectedParentCategoryId, selectedChildCategoryId])

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

    const renderItemList = () => {
        if (itemList && itemList.length > 0) {
            return itemList.map((item) => {
                return (
                    <TouchableWithoutFeedback
                        key={`item-${item.id}`}
                        onPress={() =>
                            navigation.navigate('ItemDetail', {
                                itemId: item.id,
                                forceRefresh: forceRefresh,
                            })
                        }
                    >
                        <Block
                            flex={0}
                            padding={sizes.s}
                            borderRightWidth={0.8}
                            borderBottomWidth={0.8}
                            borderColor={colors.light}
                        >
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: screenSize.width / 3.5,
                                    height: screenSize.width / 3.5,
                                }}
                                source={{ uri: BASE_API_URL + item.image }}
                            />
                            <Text
                                p
                                size={14}
                                font={fonts?.['light']}
                                paddingVertical={sizes.xs}
                            >
                                {item.brand || t('closetDetail.noBrand')}
                            </Text>
                        </Block>
                    </TouchableWithoutFeedback>
                )
            })
        } else {
            return (
                <Text p center font={fonts?.['semibold']} width="100%">
                    {t('closetDetail.noItemFound')}
                </Text>
            )
        }
    }

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
                <Block
                    row
                    wrap="wrap"
                    align="flex-start"
                    justify="space-between"
                >
                    {renderItemList()}
                </Block>
            </Block>
        </Block>
    )
}

export default ClosetDetail
