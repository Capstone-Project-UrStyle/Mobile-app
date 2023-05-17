import React from 'react'

import { useTheme } from '../hooks/'

import Text from '../components/Text'
import Button from '../components/Button'

const OccasionTag = ({ onPress, occasion, isSelected }) => {
    const { gradients, sizes } = useTheme()

    return (
        <Button
            radius={sizes.m}
            key={`occasion-${occasion.id}}`}
            onPress={onPress}
            gradient={gradients?.[isSelected ? 'primary' : 'light']}
            margin={sizes.xs}
        >
            <Text
                p
                white={isSelected}
                black={!isSelected}
                marginHorizontal={sizes.s}
            >
                {occasion.name}
            </Text>
        </Button>
    )
}

export default React.memo(OccasionTag)
