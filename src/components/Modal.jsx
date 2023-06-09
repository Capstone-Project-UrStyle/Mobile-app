import React from 'react'
import { StyleSheet, Modal as RNModal, Platform } from 'react-native'

import { useTheme } from '../hooks/'

import Block from './Block'
import Button from './Button'
import Image from './Image'

const Modal = ({ id = 'Modal', children, style, onRequestClose, ...props }) => {
    const { assets, colors, sizes } = useTheme()
    const modalStyles = StyleSheet.flatten([style, {}])

    // generate component testID or accessibilityLabel based on Platform.OS
    const modalID =
        Platform.OS === 'android' ? { accessibilityLabel: id } : { testID: id }

    return (
        <RNModal
            {...modalID}
            {...props}
            transparent
            style={modalStyles}
            animationType="slide"
            onRequestClose={onRequestClose}
        >
            <Block justify="flex-end">
                <Block
                    safe
                    flex={0}
                    color={colors.card}
                    borderTopRightRadius={sizes.cardRadius}
                    borderTopLeftRadius={sizes.cardRadius}
                >
                    <Button
                        top={sizes.s}
                        right={sizes.s}
                        position="absolute"
                        onPress={() => onRequestClose?.()}
                    >
                        <Image source={assets.close} color={colors.black} />
                    </Button>
                    <Block
                        flex={0}
                        marginTop={sizes.xl}
                        paddingHorizontal={sizes.padding}
                    >
                        {children}
                    </Block>
                </Block>
            </Block>
        </RNModal>
    )
}

export default React.memo(Modal)
