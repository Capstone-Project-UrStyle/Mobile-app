import React from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { Feather } from '@expo/vector-icons'

import Block from './Block'
import Image from './Image'
import Text from './Text'
import Checkbox from './Checkbox'

import { BASE_API_URL } from '../api/axiosClient'
import { useTheme } from '../hooks/'

import { shortenDisplayText } from '../utils/shortenDisplayText'

const ClosetCard = ({ create, closet, type, selectMode }) => {
    const { assets, colors, sizes } = useTheme()
    const navigation = useNavigation()

    const isHorizontal = type !== 'vertical'
    const CARD_WIDTH = (sizes.width - sizes.padding * 2 - sizes.sm) / 2

    const renderItemImages = () => {
        if (create) {
            for (let index = 0; index < 4; index++) {
                return (
                    <Image
                        resizeMode="cover"
                        style={{
                            height: 130,
                            width: '100%',
                        }}
                        source={assets.createCloset}
                    />
                )
            }
        }

        if (closet) {
            const closetItems = closet.Items.sort(
                (item1, item2) => item1.id - item2.id,
            )
            let itemList = []
            for (let index = 0; index < 4; index++) {
                itemList.push(
                    <Image
                        key={
                            closetItems[index]
                                ? `item-${closetItems[index].id}`
                                : index
                        }
                        resizeMode="contain"
                        style={{
                            height: 60,
                            width: 60,
                        }}
                        marginVertical={sizes.xs}
                        source={{
                            uri: closetItems[index]
                                ? BASE_API_URL + closetItems[index].image
                                : '-',
                        }}
                    />,
                )
            }
            return itemList
        }
    }

    const handlePress = () => {
        if (create) {
            navigation.navigate('CreateCloset')
        } else {
            navigation.navigate('ClosetDetail', {
                closetId: closet.id,
                closetName: closet.name,
            })
        }
    }

    return (
        <TouchableWithoutFeedback
            onPress={() => {
                if (selectMode) {
                    if (!selectMode.isFixed) return selectMode.onSelect()
                    return null
                }
                return handlePress()
            }}
        >
            <Block
                card
                flex={0}
                row={isHorizontal}
                marginBottom={sizes.sm}
                width={isHorizontal ? CARD_WIDTH * 2 + sizes.sm : CARD_WIDTH}
                justify="space-evenly"
            >
                <Block
                    card={!create}
                    flex={0}
                    row
                    wrap="wrap"
                    justify="space-evenly"
                    backgroundColor={create || colors.light}
                    padding={sizes.xs}
                >
                    {renderItemImages()}
                </Block>

                {create || (
                    <Block
                        marginTop={sizes.s}
                        justify="space-between"
                        paddingLeft={isHorizontal ? sizes.sm : 0}
                        paddingBottom={isHorizontal ? sizes.s : 0}
                    >
                        <Text p color={colors.link} semibold size={sizes.sm}>
                            {shortenDisplayText(closet.name, 20)}
                        </Text>
                        <Text p size={sizes.sm}>
                            Items: {closet.Items.length}
                        </Text>
                    </Block>
                )}

                {selectMode && (
                    <Block
                        position="absolute"
                        backgroundColor={
                            selectMode.isSelected ? 'rgba(0, 0, 0, 0.4)' : null
                        }
                        borderRadius={sizes.cardRadius}
                        width={
                            isHorizontal
                                ? CARD_WIDTH * 2 + sizes.sm
                                : CARD_WIDTH
                        }
                        height="110%"
                        padding={sizes.s}
                    >
                        <Checkbox
                            fixed={selectMode.isFixed}
                            checked={selectMode.isSelected}
                            onPress={selectMode.onSelect}
                        />
                    </Block>
                )}

                {selectMode && (
                    <Block
                        position="absolute"
                        bottom={sizes.sm}
                        right={sizes.s}
                    >
                        <TouchableWithoutFeedback onPress={handlePress}>
                            <Feather
                                name="more-vertical"
                                size={30}
                                color={colors.info}
                            />
                        </TouchableWithoutFeedback>
                    </Block>
                )}
            </Block>
        </TouchableWithoutFeedback>
    )
}

export default React.memo(ClosetCard)
