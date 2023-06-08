import React from 'react'

import { useTheme } from '../hooks/'

import Block from './Block'
import Text from '../components/Text'
import Button from '../components/Button'
import Image from './Image'

import BASE_API_URL from '../api/axiosClient'

const MaterialTag = ({ onPress, material, isSelected }) => {
    const { gradients, sizes, colors } = useTheme()

    return (
        <Button
            key={`material-${material.id}}`}
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
                    source={BASE_API_URL + material.image}
                />
                <Text
                    p
                    size={13}
                    white={isSelected}
                    black={!isSelected}
                    marginHorizontal={sizes.xs}
                >
                    {material.name}
                </Text>
            </Block>
        </Button>
    )
}

export default React.memo(MaterialTag)
