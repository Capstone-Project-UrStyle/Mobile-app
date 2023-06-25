import React, { useState, useEffect } from 'react'

import { useData } from '../hooks/'

import Block from './Block'
import CategoryTag from './CategoryTag'

const CategorySelector = ({ selectedCategoryId, handleChangeCredentials }) => {
    const { masterData } = useData()

    const [categories, setCategories] = useState([])
    const [selectedParentCategoryId, setSelectedParentCategoryId] =
        useState(null)

    // Fetch categories in master data
    useEffect(() => {
        setCategories(masterData?.Categories)
    }, [masterData.Categories])

    useEffect(() => {
        if (selectedCategoryId && categories.length > 0) {
            const selectedCategory = categories.find(
                (item) => item.id === selectedCategoryId,
            )
            setSelectedParentCategoryId(selectedCategory.parent_id)
        }
    }, [selectedCategoryId, categories])

    const handlePressParentCategoryTag = (parentCategoryId) => {
        if (selectedParentCategoryId === parentCategoryId) {
            handlePressCategoryTag(null)
            return setSelectedParentCategoryId(null)
        }
        return setSelectedParentCategoryId(parentCategoryId)
    }

    const handlePressCategoryTag = (categoryId) => {
        if (selectedCategoryId === categoryId) {
            return handleChangeCredentials({ category_id: null })
        }
        return handleChangeCredentials({ category_id: categoryId })
    }

    const renderParentCategoryTags = () => {
        if (selectedParentCategoryId) {
            const parentCategory = categories.find(
                (category) => category.id === selectedParentCategoryId,
            )
            return (
                <CategoryTag
                    key={`parent-category-${parentCategory.id}`}
                    category={parentCategory}
                    isSelected
                    onPress={() =>
                        handlePressParentCategoryTag(parentCategory.id)
                    }
                />
            )
        } else {
            let parentCategoryTags = []
            categories.map((category) => {
                if (category.is_parent) {
                    parentCategoryTags.push(
                        <CategoryTag
                            key={`parent-category-${category.id}`}
                            category={category}
                            isSelected={false}
                            onPress={() =>
                                handlePressParentCategoryTag(category.id)
                            }
                        />,
                    )
                }
            })
            return parentCategoryTags
        }
    }

    return (
        <Block>
            {/* Render parent categories */}
            <Block row flex={1} wrap="wrap" justify="flex-start">
                {renderParentCategoryTags()}
                {}
            </Block>

            {/* Render child categories */}
            <Block row flex={1} wrap="wrap" justify="flex-start">
                {selectedParentCategoryId &&
                    categories.map((category) => {
                        const isSelected = category.id === selectedCategoryId
                        return (
                            !category.is_parent &&
                            category.parent_id === selectedParentCategoryId && (
                                <CategoryTag
                                    key={`child-category-${category.id}`}
                                    category={category}
                                    isSelected={isSelected}
                                    onPress={() =>
                                        handlePressCategoryTag(category.id)
                                    }
                                />
                            )
                        )
                    })}
            </Block>
        </Block>
    )
}

export default React.memo(CategorySelector)
