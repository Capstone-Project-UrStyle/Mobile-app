import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'

import { useTranslation, useTheme, useData } from '../hooks'
import { Block, Button, Text, Input, Switch, OccasionTag } from '../components'

import closetApi from '../api/closetApi'

const isAndroid = Platform.OS === 'android'

const EditCloset = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes } = useTheme()
    const { masterData, handleSetIsLoading } = useData()

    const { closetId } = route.params

    const exampleNames = [
        'island_vacation',
        'frequentlyworn',
        'Fall Closet',
        'September_Europe_Trip',
    ]

    const [occasions, setOccasions] = useState([])
    const [isValid, setIsValid] = useState({
        name: false,
        occasion_ids: false,
    })
    const [credentials, setCredentials] = useState({
        name: '',
        is_public: false,
        occasion_ids: [],
    })

    // Fetch closet detail
    useEffect(() => {
        async function fetchClosetDetail() {
            handleSetIsLoading(true)
            try {
                const response = await closetApi.getOneById(closetId)
                if (response.request.status === 200) {
                    const closetDetail = response.data
                    const closetOccasionIds = closetDetail.Occasions.map(
                        (occasion) => occasion.id,
                    )
                    handleChange({
                        name: closetDetail.name,
                        is_public: closetDetail.is_public,
                        occasion_ids: closetOccasionIds,
                    })
                    handleSetIsLoading(false)
                }
            } catch (error) {
                handleSetIsLoading(false)
                Alert.alert(error.response.data.message)
            }
        }

        fetchClosetDetail()
    }, [])

    // Fetch occasions in master data
    useEffect(() => {
        setOccasions(masterData?.Occasions)
    }, [masterData.Occasions])

    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            name: credentials.name !== '' && credentials.name.length <= 50,
            occasion_ids: Array.isArray(credentials.occasion_ids),
        }))
    }, [credentials, setIsValid])

    const handleChange = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const handleSubmit = useCallback(async () => {
        if (!Object.values(isValid).includes(false)) {
            try {
                const response = await closetApi.updateById(
                    closetId,
                    credentials,
                )
                if (response.request.status === 200) {
                    Alert.alert(response.data.message)
                    navigation.goBack()
                }
            } catch (error) {
                Alert.alert(error.response.data.message)
            }
        }
    }, [isValid, credentials])

    const handlePressOccasionTag = (occasionId) => {
        if (credentials.occasion_ids.includes(occasionId)) {
            handleChange({
                occasion_ids: credentials.occasion_ids.filter(
                    (id) => id !== occasionId,
                ),
            })
        } else {
            handleChange({
                occasion_ids: [...credentials.occasion_ids, occasionId],
            })
        }
    }

    return (
        <Block flex={1} color={colors.card} justify="space-between">
            <Block flex={1} padding={sizes.sm}>
                <Text h5 marginBottom={sizes.s}>
                    {t('editCloset.name')}
                </Text>
                <Input
                    autoCapitalize="none"
                    marginBottom={sizes.m}
                    keyboardType="email-address"
                    placeholder={t('editCloset.namePlaceholder')}
                    success={Boolean(credentials.name && isValid.name)}
                    danger={Boolean(credentials.emnameail && !isValid.name)}
                    onChangeText={(value) => handleChange({ name: value })}
                    value={credentials.name}
                />

                <Block card flex={0} color={colors.light} minHeight={75}>
                    <Text p padding={sizes.s}>
                        {t('editCloset.hint')}
                    </Text>
                    {exampleNames.map((name) => {
                        return (
                            <Text p padding={sizes.s} key={name}>
                                . {name}
                            </Text>
                        )
                    })}
                </Block>

                <Block
                    flex={0}
                    row
                    paddingVertical={sizes.m}
                    align="center"
                    justify="space-between"
                >
                    <Text h5>{t('editCloset.public')}</Text>
                    <Switch
                        checked={credentials.is_public}
                        onPress={(checked) =>
                            handleChange({ is_public: checked })
                        }
                    />
                </Block>

                {/* Occasion selectors */}
                <Block flex={1}>
                    <Text h5 paddingBottom={sizes.s}>
                        {t('editCloset.occasions')}
                    </Text>
                    <Block
                        borderWidth={0.5}
                        radius={sizes.sm}
                        padding={sizes.s}
                    >
                        <Block
                            scroll
                            showsVerticalScrollIndicator={false}
                            flex={0}
                        >
                            <Block
                                row
                                flex={1}
                                wrap="wrap"
                                justify="flex-start"
                            >
                                {occasions?.map((occasion) => {
                                    const isSelected =
                                        credentials.occasion_ids.includes(
                                            occasion.id,
                                        )
                                    return (
                                        <OccasionTag
                                            key={`occasion-${occasion.id}`}
                                            occasion={occasion}
                                            isSelected={isSelected}
                                            onPress={() =>
                                                handlePressOccasionTag(
                                                    occasion.id,
                                                )
                                            }
                                        />
                                    )
                                })}
                            </Block>
                        </Block>
                    </Block>
                </Block>
            </Block>

            <Block flex={0} padding={sizes.sm}>
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
                    <Text h5>{t('editCloset.done')}</Text>
                </Button>
            </Block>
        </Block>
    )
}

export default EditCloset
