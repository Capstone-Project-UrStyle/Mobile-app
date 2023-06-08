import React from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { useNavigation } from '@react-navigation/core'

import Block from './Block'
import Image from './Image'
import Text from './Text'

import { BASE_API_URL } from '../api/axiosClient'
import { useTheme } from '../hooks/'

const ClosetCard = ({ create, closet, type, forceRefresh }) => {
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
                        resizeMode="cover"
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
            navigation.navigate('CreateCloset', { forceRefresh: forceRefresh })
        } else {
            navigation.navigate('ClosetDetail', {
                closetId: closet.id,
                closetName: closet.name,
                forceRefresh: forceRefresh,
            })
        }
    }

    return (
        <TouchableWithoutFeedback onPress={handlePress}>
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
                            {closet.name}
                        </Text>
                        <Text p size={sizes.sm}>
                            Items: {closet.Items.length}
                        </Text>
                    </Block>
                )}
            </Block>
        </TouchableWithoutFeedback>
    )
}

export default ClosetCard
