import React from 'react'
import { TouchableWithoutFeedback } from 'react-native'

import { useTranslation, useTheme, useData } from '../hooks/'

import Block from './Block'
import Image from './Image'
import Text from './Text'

const HomeAddModal = ({ navigation }) => {
    const { t } = useTranslation()
    const { assets, colors, fonts, sizes, screenSize } = useTheme()
    const { handleCloseModal } = useData()

    const renderCardItem = (title, imageSource, navScreen) => {
        return (
            <TouchableWithoutFeedback onPress={() => {
                handleCloseModal()
                navigation.navigate(navScreen)
            }}>
                <Block
                    flex={0}
                    align="center"
                    justify="center"
                    width={screenSize.width / 2.3}
                >
                    <Image
                        resizeMode="cover"
                        style={{
                            height: screenSize.width / 3,
                            width: screenSize.width / 3,
                        }}
                        marginVertical={sizes.xs}
                        source={imageSource}
                    />
                    <Text
                        p
                        h5
                        size={sizes.sm}
                        font={fonts.semibold}
                        color={colors.gray}
                        paddingBottom={sizes.s}
                        width="110%"
                        align="center"
                    >
                        {title}
                    </Text>
                </Block>
            </TouchableWithoutFeedback>
        )
    }
    return (
        <Block
            flex={0}
            row
            wrap="wrap"
            align="center"
            justify="space-evenly"
        >
            <Text
                p
                size={20}
                font={fonts.semibold}
                color={colors.black}
                width="100%"
                align="left"
                padding={sizes.s}
            >
                {t('homeAddModal.createBlockTitle')}
            </Text>
            {renderCardItem(
                t('homeAddModal.createItemLable'),
                assets.createItem,
                'CreateItem'
            )}
            {renderCardItem(
                t('homeAddModal.createOutfitLable'),
                assets.createOutfit,
                'CreateOutfit'
            )}
            <Text
                p
                size={20}
                font={fonts.semibold}
                color={colors.black}
                width="100%"
                align="left"
                padding={sizes.s}
            >
                {t('homeAddModal.outfitRecommendTitle')}
            </Text>
            {renderCardItem(
                t('homeAddModal.outfitIdeaRecommendation'),
                assets.generateOutfit,
                'CreateOutfit'
            )}
            {renderCardItem(
                t('homeAddModal.outfitIdeaCompatibility'),
                assets.outfitCompatibility,
                'CreateOutfit'
            )}
        </Block>
    )
}

export default React.memo(HomeAddModal)
