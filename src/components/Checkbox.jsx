import React, { useCallback, useState } from 'react'
import { Platform, Pressable } from 'react-native'
// import * as Haptics from 'expo-haptics'

import { useTheme } from '../hooks/'
import Block from '../components/Block'
import Image from '../components/Image'
import Text from '../components/Text'

const Checkbox = ({
    onPress,
    haptic = true,
    id = 'Checkbox',
    fixed,
    ...props
}) => {
    const { colors, icons, sizes } = useTheme()
    const [checked, setChecked] = useState(props.checked || false)

    const handlePress = useCallback(() => {
        if (!fixed) {
            onPress?.(!checked)
            setChecked(!checked)
        }

        /* haptic feedback onPress */
        // if (haptic) {
        //     Haptics.selectionAsync()
        // }
    }, [checked, haptic, setChecked, onPress])

    // generate component testID or accessibilityLabel based on Platform.OS
    const checkboxID =
        Platform.OS === 'android' ? { accessibilityLabel: id } : { testID: id }

    return (
        <Pressable {...checkboxID} hitSlop={sizes.s} onPress={handlePress}>
            <Block row flex={0} align="center" paddingBottom={sizes.sm}>
                <Text
                    p
                    h5
                    marginRight={sizes.s}
                    color={checked ? colors.success : colors.danger}
                >
                    {checked ? 'Selected' : 'Not selected'}
                </Text>
                <Block
                    flex={0}
                    align="center"
                    justify="center"
                    gray={!checked}
                    outlined={!checked}
                    width={sizes.checkboxWidth}
                    height={sizes.checkboxHeight}
                    radius={sizes.checkboxRadius}
                    gradient={checked ? colors.checkbox : undefined}
                    {...props}
                >
                    {checked && (
                        <Image
                            source={icons.check}
                            color={colors.checkboxIcon}
                            width={sizes.checkboxIconWidth}
                            height={sizes.checkboxIconHeight}
                        />
                    )}
                </Block>
            </Block>
        </Pressable>
    )
}

export default React.memo(Checkbox)
