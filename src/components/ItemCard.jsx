import React from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { Feather } from '@expo/vector-icons'

import Block from './Block'
import Image from './Image'
import Text from './Text'
import Checkbox from './Checkbox'

import { BASE_API_URL } from '../api/axiosClient'
import { useTranslation, useTheme } from '../hooks/'

import { shortenDisplayText } from '../utils/shortenDisplayText'

const ItemCard = ({ item, selectMode }) => {
    const { t } = useTranslation()
    const { colors, fonts, sizes, screenSize } = useTheme()
    const navigation = useNavigation()

    return (
        <TouchableWithoutFeedback
            onPress={() => {
                if (selectMode) {
                    if (!selectMode.isFixed) return selectMode.onSelect()
                    return null
                }
                return navigation.navigate('ItemDetail', { itemId: item.id })
            }}
        >
            <Block
                flex={0}
                padding={sizes.s + 0.5}
                borderRightWidth={0.8}
                borderBottomWidth={0.8}
                borderColor={colors.light}
            >
                <Image
                    resizeMode="contain"
                    style={{
                        width: screenSize.width / 3.5,
                        height: screenSize.width / 3.5,
                    }}
                    source={{ uri: BASE_API_URL + item.image + "?time=" + new Date()}}
                />
                <Text
                    p
                    size={14}
                    font={fonts?.['light']}
                    paddingVertical={sizes.xs}
                >
                    {shortenDisplayText(item.brand, 12) ||
                        t('closetDetail.noBrand')}
                </Text>

                {selectMode && (
                    <Block
                        position="absolute"
                        backgroundColor={
                            selectMode.isSelected ? 'rgba(0, 0, 0, 0.4)' : null
                        }
                        width={screenSize.width / 3 - 0.7}
                        height={screenSize.width / 3 + sizes.m + 1.4 * sizes.xs}
                        padding={sizes.s}
                    >
                        <Checkbox
                            checked={selectMode.isSelected}
                            onPress={selectMode.onSelect}
                        />
                    </Block>
                )}

                {selectMode && (
                    <Block position="absolute" bottom={sizes.s} right={0}>
                        <TouchableWithoutFeedback
                            onPress={() =>
                                navigation.navigate('ItemDetail', {
                                    itemId: item.id,
                                })
                            }
                        >
                            <Feather
                                name="more-vertical"
                                size={25}
                                color={colors.info}
                            />
                        </TouchableWithoutFeedback>
                    </Block>
                )}
            </Block>
        </TouchableWithoutFeedback>
    )
}

export default React.memo(ItemCard)
