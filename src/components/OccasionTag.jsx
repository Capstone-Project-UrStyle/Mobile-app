import React from 'react'

import { useTheme } from '../hooks/'
import { Text, Button } from '../components'

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
                marginHorizontal={sizes.sm}
            >
                {occasion.name}
            </Text>
        </Button>
    )
}

export default React.memo(OccasionTag)
