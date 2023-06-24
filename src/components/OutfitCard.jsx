import React from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { useNavigation } from '@react-navigation/core'

import Block from './Block'
import Image from './Image'
import Text from './Text'

import { BASE_API_URL } from '../api/axiosClient'
import { useTheme } from '../hooks/'

import { shortenDisplayText } from '../utils/shortenDisplayText'

const OutfitCard = ({ outfit, type }) => {
    const { colors, sizes, fonts } = useTheme()
    const navigation = useNavigation()

    const isHorizontal = type !== 'vertical'
    const CARD_WIDTH = (sizes.width - sizes.padding * 2 - sizes.sm) / 2

    const handlePress = () => {
        navigation.navigate('OutfitDetail', { outfitId: outfit.id })
    }

    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            <Block
                card
                flex={0}
                row={isHorizontal}
                marginBottom={sizes.sm}
                width={isHorizontal ? CARD_WIDTH * 2 + sizes.sm : CARD_WIDTH}
                padding={sizes.s}
            >
                <Block
                    card
                    flex={0}
                    row
                    backgroundColor={colors.light}
                    padding={sizes.xs}
                >
                    <Image
                        resizeMode="contain"
                        style={{
                            height: CARD_WIDTH,
                            width: CARD_WIDTH,
                        }}
                        marginVertical={sizes.xs}
                        source={{ uri: BASE_API_URL + outfit.image }}
                    />
                </Block>
                <Block flex={1} padding={sizes.xs} marginLeft={sizes.s}>
                    <Text
                        p
                        size={16}
                        align="justify"
                        paddingVertical={sizes.xs}
                    >
                        {shortenDisplayText(outfit.description, 30)}
                    </Text>

                    <Block flex={0} row paddingVertical={sizes.xs}>
                        <Text p size={sizes.sm} semibold>
                            {`Items: `}
                        </Text>
                        <Text p size={sizes.sm}>
                            {outfit.Items.length}
                        </Text>
                    </Block>

                    <Text
                        p
                        size={sizes.sm}
                        align="justify"
                        paddingVertical={sizes.xs}
                    >
                        <Text p size={sizes.sm} semibold>
                            {`Occasions: `}
                        </Text>
                        {outfit.Occasions &&
                            shortenDisplayText(
                                outfit.Occasions.map(
                                    (occasion) => occasion.name,
                                ).join(', '),
                                20,
                            )}
                    </Text>
                </Block>
            </Block>
        </TouchableWithoutFeedback>
    )
}

export default React.memo(OutfitCard)
