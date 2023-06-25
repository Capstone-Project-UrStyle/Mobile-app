import React, { useState, useEffect } from 'react'

import { useData } from '../hooks/'

import Block from './Block'
import ColorTag from './ColorTag'

const ColorSelector = ({ selectedColorIds, handleChangeCredentials }) => {
    const { masterData } = useData()

    const [colors, setColors] = useState([])

    // Fetch colors in master data
    useEffect(() => {
        setColors(masterData?.Colors)
    }, [masterData.Colors])

    const handlePressColorTag = (colorId) => {
        if (selectedColorIds.includes(colorId)) {
            handleChangeCredentials({
                color_ids: selectedColorIds.filter((id) => id !== colorId),
            })
        } else {
            handleChangeCredentials({
                color_ids: [...selectedColorIds, colorId],
            })
        }
    }

    return (
        <Block row flex={1} wrap="wrap" justify="flex-start">
            {colors.map((color) => {
                const isSelected = selectedColorIds.includes(color.id)
                return (
                    <ColorTag
                        key={`color-${color.id}`}
                        color={color}
                        isSelected={isSelected}
                        onPress={() => handlePressColorTag(color.id)}
                    />
                )
            })}
        </Block>
    )
}

export default React.memo(ColorSelector)
