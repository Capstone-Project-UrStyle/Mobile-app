import React, { useCallback, useEffect, useState } from 'react'

import { useTranslation, useTheme, useData } from '../hooks'
import Block from './Block'
import Button from './Button'
import Text from './Text'
import ItemCard from './ItemCard'

const ItemSelector = ({ closet, forceRefresh, selectMode }) => {
    const { t } = useTranslation()
    const { colors, sizes, fonts } = useTheme()
    const { masterData, handleSetIsLoading } = useData()

    const [parentCategories, setParentCategories] = useState([])
    const [childCategories, setChildCategories] = useState([])
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState(0)
    const [selectedChildCategoryId, setSelectedChildCategoryId] = useState(0)
    const [itemList, setItemList] = useState([])

    // Get all closet items's parent categories
    useEffect(() => {
        if (masterData && closet) {
            const closetItems = closet.Items
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
    }, [closet])

    // Get all closet items's child categories when select parent category changes
    useEffect(() => {
        if (closet && selectedParentCategoryId !== 0) {
            const closetItems = closet.Items
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
    }, [closet, selectedParentCategoryId])

    // Get item list when selected parent category or selected child category changes
    useEffect(() => {
        if (closet && selectedParentCategoryId === 0) {
            setItemList(closet.Items)
        }

        if (closet && selectedParentCategoryId !== 0) {
            if (selectedChildCategoryId === 0) {
                const filterItems = closet.Items.filter(
                    (item) =>
                        item.Category.parent_id === selectedParentCategoryId,
                )
                setItemList(filterItems)
            } else {
                const filterItems = closet.Items.filter(
                    (item) => item.category_id === selectedChildCategoryId,
                )
                setItemList(filterItems)
            }
        }
    }, [closet, selectedParentCategoryId, selectedChildCategoryId])

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

    const handlePressItemCheckbox = (itemId) => {
        if (selectMode.credentials.item_ids.includes(itemId)) {
            selectMode.handleChangeCredentials({
                item_ids: selectMode.credentials.item_ids.filter(
                    (id) => id !== itemId,
                ),
            })
        } else {
            selectMode.handleChangeCredentials({
                item_ids: [...selectMode.credentials.item_ids, itemId],
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
                        selectMode={
                            selectMode
                                ? {
                                      onSelect: () =>
                                          handlePressItemCheckbox(item.id),
                                      isSelected:
                                          selectMode.credentials.item_ids.includes(
                                              item.id,
                                          ),
                                  }
                                : null
                        }
                    />
                )
            })
        } else {
            return (
                <Text
                    p
                    center
                    font={fonts?.['semibold']}
                    width="100%"
                    marginTop={sizes.sm}
                >
                    {t('itemSelector.noItemFound')}
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
                <Block row wrap="wrap" align="flex-start" justify="flex-start">
                    {renderItemList()}
                </Block>
            </Block>
        </Block>
    )
}

export default React.memo(ItemSelector)
