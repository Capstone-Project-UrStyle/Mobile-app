import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'

import { useTranslation, useTheme } from '../hooks'
import {
    Block,
    Button,
    Text,
    Input,
    Switch,
    OccasionSelector,
} from '../components'

import closetApi from '../api/closetApi'

const isAndroid = Platform.OS === 'android'

const CreateCloset = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes } = useTheme()

    const exampleNames = [
        'island_vacation',
        'frequentlyworn',
        'Fall Closet',
        'September_Europe_Trip',
    ]

    const [isValid, setIsValid] = useState({
        name: false,
        occasion_ids: false,
    })
    const [credentials, setCredentials] = useState({
        name: '',
        is_public: false,
        occasion_ids: [],
    })

    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            name: credentials.name !== '' && credentials.name.length <= 50,
            occasion_ids: Array.isArray(credentials.occasion_ids),
        }))
    }, [credentials, setIsValid])

    const handleChangeCredentials = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const handleSubmit = useCallback(async () => {
        if (!Object.values(isValid).includes(false)) {
            try {
                const response = await closetApi.createNew(credentials)
                if (response.request.status === 200) {
                    Alert.alert(response.data.message)
                    navigation.goBack()
                }
            } catch (error) {
                Alert.alert(error.response.data.message)
            }
        }
    }, [isValid, credentials])

    return (
        <Block
            flex={1}
            color={colors.card}
            justify="space-between"
            paddingBottom={70}
        >
            <Block flex={1} padding={sizes.sm}>
                <Text h5 marginBottom={sizes.s}>
                    {t('createCloset.name')}
                </Text>
                <Input
                    autoCapitalize="none"
                    marginBottom={sizes.m}
                    keyboardType="email-address"
                    placeholder={t('createCloset.namePlaceholder')}
                    success={Boolean(credentials.name && isValid.name)}
                    danger={Boolean(credentials.emnameail && !isValid.name)}
                    onChangeText={(value) =>
                        handleChangeCredentials({ name: value })
                    }
                />

                <Block card flex={0} color={colors.light} minHeight={75}>
                    <Text p padding={sizes.s}>
                        {t('createCloset.hint')}
                    </Text>
                    {exampleNames.map((name) => {
                        return (
                            <Text p padding={sizes.s} key={name}>
                                . {name}
                            </Text>
                        )
                    })}
                </Block>

                {/* Occasion selectors */}
                <Block flex={1} paddingVertical={sizes.sm}>
                    <Text h5 paddingBottom={sizes.s}>
                        {t('createCloset.occasions')}
                    </Text>
                    <Block
                        borderWidth={0.5}
                        radius={sizes.sm}
                        padding={sizes.s}
                    >
                        <Block
                            scroll
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            flex={0}
                        >
                            <Block
                                row
                                flex={1}
                                wrap="wrap"
                                justify="flex-start"
                            >
                                <OccasionSelector
                                    selectedOccasionIds={
                                        credentials.occasion_ids
                                    }
                                    handleChangeCredentials={
                                        handleChangeCredentials
                                    }
                                />
                            </Block>
                        </Block>
                    </Block>
                </Block>

                {/* Public switch */}
                <Block
                    flex={0}
                    row
                    paddingVertical={sizes.sm}
                    align="center"
                    justify="space-between"
                >
                    <Text h5>{t('createCloset.public')}</Text>
                    <Switch
                        checked={credentials.is_public}
                        onPress={(checked) =>
                            handleChangeCredentials({ is_public: checked })
                        }
                    />
                </Block>
            </Block>

            {/* Submit button */}
            <Block
                flex={0}
                padding={sizes.sm}
                position="absolute"
                width="100%"
                backgroundColor={colors.card}
                bottom={0}
            >
                <Button
                    outlined
                    gray
                    shadow={!isAndroid}
                    disabled={Object.values(isValid).includes(false)}
                    activeOpacity={
                        !Object.values(isValid).includes(false) ? 1 : 0.2
                    }
                    style={{
                        opacity: Object.values(isValid).includes(false)
                            ? 0.5
                            : 1,
                    }}
                    onPress={handleSubmit}
                >
                    <Text h5>{t('createCloset.done')}</Text>
                </Button>
            </Block>
        </Block>
    )
}

export default CreateCloset
