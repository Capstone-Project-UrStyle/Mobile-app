import React, { useState, useEffect } from 'react'

import { useData } from '../hooks/'

import Block from './Block'
import OccasionTag from './OccasionTag'

const OccasionSelector = ({ selectedOccasionIds, handlePressOccasionTag }) => {
    const { masterData } = useData()

    const [occasions, setOccasions] = useState([])

    // Fetch occasions in master data
    useEffect(() => {
        setOccasions(masterData?.Occasions)
    }, [masterData.Occasions])

    return (
        <Block row flex={1} wrap="wrap" justify="flex-start">
            {occasions.map((occasion) => {
                const isSelected = selectedOccasionIds.includes(occasion.id)
                return (
                    <OccasionTag
                        key={`occasion-${occasion.id}`}
                        occasion={occasion}
                        isSelected={isSelected}
                        onPress={() => handlePressOccasionTag(occasion.id)}
                    />
                )
            })}
        </Block>
    )
}

export default React.memo(OccasionSelector)
