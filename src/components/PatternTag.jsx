import React from 'react'

import { useTheme } from '../hooks/'

import Block from './Block'
import Text from '../components/Text'
import Button from '../components/Button'
import Image from './Image'

import { BASE_API_URL } from '../api/axiosClient'

const PatternTag = ({ onPress, pattern, isSelected }) => {
    const { gradients, sizes, colors } = useTheme()

    return (
        <Button
            key={`pattern-${pattern.id}}`}
            radius={sizes.sm}
            onPress={onPress}
            gradient={gradients?.[isSelected ? 'primary' : 'light']}
            margin={sizes.xs}
        >
            <Block row align="center">
                <Image
                    radius={sizes.s}
                    width={25}
                    height={25}
                    style={{ margin: sizes.xs }}
                    borderWidth={0.5}
                    borderColor={colors.black}
                    source={{ uri: BASE_API_URL + pattern.image }}
                />
                <Text
                    p
                    size={13}
                    white={isSelected}
                    black={!isSelected}
                    marginHorizontal={sizes.xs}
                >
                    {pattern.name}
                </Text>
            </Block>
        </Button>
    )
}

export default React.memo(PatternTag)
