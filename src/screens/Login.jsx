import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'

import { useData, useTheme, useTranslation } from '../hooks/'
import * as regex from '../constants/regex'
import { Block, Button, Input, Image, Text } from '../components/'

import authApi from '../api/auth'

const isAndroid = Platform.OS === 'android'

const Login = ({ navigation }) => {
    const { assets, colors, gradients, sizes } = useTheme()
    const { isDark, handleSetToken } = useData()
    const { t } = useTranslation()

    const [isValid, setIsValid] = useState({
        email: false,
        password: false,
    })
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    })

    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            email: regex.email.test(credentials.email),
            password: regex.password.test(credentials.password),
        }))
    }, [credentials, setIsValid])

    const handleChangeCredentials = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const handleLogin = useCallback(async () => {
        if (!Object.values(isValid).includes(false)) {
            try {
                const response = await authApi.login(credentials)
                if (response.request.status === 200) {
                    handleSetToken(response.data.token)
                    Alert.alert(response.data.message)
                    navigation.navigate('Home')
                }
            } catch (error) {
                Alert.alert(error.response.data.message)
            }
        }
    }, [isValid, credentials])

    return (
        <Block safe marginTop={sizes.md}>
            <Block paddingHorizontal={sizes.s}>
                <Block flex={0} style={{ zIndex: 0 }}>
                    <Image
                        background
                        resizeMode="cover"
                        padding={sizes.sm}
                        radius={sizes.cardRadius}
                        source={assets.background}
                        height={sizes.height * 0.3}
                    >
                        <Text
                            h4
                            center
                            white
                            marginTop={sizes.l}
                            marginBottom={sizes.md}
                        >
                            {t('login.title')}
                        </Text>
                    </Image>
                </Block>
                {/* register form */}
                <Block
                    keyboard
                    behavior={!isAndroid ? 'padding' : 'height'}
                    marginTop={-(sizes.height * 0.2 - sizes.l)}
                >
                    <Block
                        flex={0}
                        radius={sizes.sm}
                        marginHorizontal="8%"
                        // disabled shadow on Android due to blur overlay + elevation issue
                        shadow={!isAndroid}
                    >
                        <Block
                            blur
                            flex={0}
                            intensity={90}
                            radius={sizes.sm}
                            overflow="hidden"
                            justify="space-evenly"
                            tint={colors.blurTint}
                            paddingVertical={sizes.sm}
                        >
                            <Text p semibold center>
                                {t('login.subtitle')}
                            </Text>
                            {/* social buttons */}
                            <Block
                                row
                                center
                                justify="space-evenly"
                                marginVertical={sizes.m}
                            >
                                <Button outlined gray shadow={!isAndroid}>
                                    <Image
                                        source={assets.facebook}
                                        height={sizes.m}
                                        width={sizes.m}
                                        color={isDark ? colors.icon : undefined}
                                    />
                                </Button>
                                <Button outlined gray shadow={!isAndroid}>
                                    <Image
                                        source={assets.apple}
                                        height={sizes.m}
                                        width={sizes.m}
                                        color={isDark ? colors.icon : undefined}
                                    />
                                </Button>
                                <Button outlined gray shadow={!isAndroid}>
                                    <Image
                                        source={assets.google}
                                        height={sizes.m}
                                        width={sizes.m}
                                        color={isDark ? colors.icon : undefined}
                                    />
                                </Button>
                            </Block>
                            <Block
                                row
                                flex={0}
                                align="center"
                                justify="center"
                                marginBottom={sizes.sm}
                                paddingHorizontal={sizes.xxl}
                            >
                                <Block
                                    flex={0}
                                    height={1}
                                    width="50%"
                                    end={[1, 0]}
                                    start={[0, 1]}
                                    gradient={gradients.divider}
                                />
                                <Text center marginHorizontal={sizes.s}>
                                    {t('common.or')}
                                </Text>
                                <Block
                                    flex={0}
                                    height={1}
                                    width="50%"
                                    end={[0, 1]}
                                    start={[1, 0]}
                                    gradient={gradients.divider}
                                />
                            </Block>
                            {/* form inputs */}
                            <Block paddingHorizontal={sizes.sm}>
                                <Input
                                    autoCapitalize="none"
                                    marginBottom={sizes.m}
                                    label={t('common.email')}
                                    keyboardType="email-address"
                                    placeholder={t('common.emailPlaceholder')}
                                    success={Boolean(
                                        credentials.email && isValid.email,
                                    )}
                                    danger={Boolean(
                                        credentials.email && !isValid.email,
                                    )}
                                    onChangeText={(value) =>
                                        handleChangeCredentials({
                                            email: value,
                                        })
                                    }
                                />
                                <Input
                                    secureTextEntry
                                    autoCapitalize="none"
                                    marginBottom={sizes.m}
                                    label={t('common.password')}
                                    placeholder={t(
                                        'common.passwordPlaceholder',
                                    )}
                                    onChangeText={(value) =>
                                        handleChangeCredentials({
                                            password: value,
                                        })
                                    }
                                    success={Boolean(
                                        credentials.password &&
                                            isValid.password,
                                    )}
                                    danger={Boolean(
                                        credentials.password &&
                                            !isValid.password,
                                    )}
                                />
                            </Block>
                            <Button
                                onPress={handleLogin}
                                marginVertical={sizes.s}
                                marginHorizontal={sizes.sm}
                                gradient={gradients.primary}
                                disabled={Object.values(isValid).includes(
                                    false,
                                )}
                            >
                                <Text bold white transform="uppercase">
                                    {t('common.signin')}
                                </Text>
                            </Button>
                            <Button
                                primary
                                outlined
                                shadow={!isAndroid}
                                marginVertical={sizes.s}
                                marginHorizontal={sizes.sm}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <Text bold primary transform="uppercase">
                                    {t('common.signup')}
                                </Text>
                            </Button>
                        </Block>
                    </Block>
                </Block>
            </Block>
        </Block>
    )
}

export default Login
