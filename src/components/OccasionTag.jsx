import React from 'react'

import { useTheme } from '../hooks/'

import Text from '../components/Text'
import Button from '../components/Button'

const OccasionTag = ({ onPress, occasion, isSelected }) => {
    const { gradients, sizes } = useTheme()

    return (
        <Button
            key={`occasion-${occasion.id}}`}
            radius={sizes.sm}
            onPress={onPress}
            gradient={gradients?.[isSelected ? 'primary' : 'light']}
            margin={sizes.xs}
        >
            <Text
                p
                size={13}
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
