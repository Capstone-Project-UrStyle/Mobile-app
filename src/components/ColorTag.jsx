import React from 'react'

import { useTheme } from '../hooks/'

import Block from './Block'
import Text from '../components/Text'
import Button from '../components/Button'
import Image from './Image'

const ColorTag = ({ onPress, color, isSelected }) => {
    const { gradients, sizes, colors } = useTheme()

    return (
        <Button
            key={`color-${color.id}}`}
            radius={sizes.sm}
            onPress={onPress}
            gradient={gradients?.[isSelected ? 'primary' : 'light']}
            margin={sizes.xs}
        >
            <Block row align='center'>
                <Image
                    radius={sizes.s}
                    width={25}
                    height={25}
                    style={{
                        backgroundColor: color.hex,
                        margin: sizes.xs,
                    }}
                    borderWidth={0.5}
                    borderColor={colors.black}
                />
                <Text
                    p
                    size={13}
                    white={isSelected}
                    black={!isSelected}
                    marginHorizontal={sizes.xs}
                >
                    {color.name}
                </Text>
            </Block>
        </Button>
    )
}

export default React.memo(ColorTag)
