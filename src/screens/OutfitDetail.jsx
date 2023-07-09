import React, { useCallback, useEffect, useState } from 'react'
import { Platform, Alert } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useIsFocused } from '@react-navigation/native'

import { useTranslation, useTheme, useData } from '../hooks'
import {
    Block,
    Button,
    Text,
    Image,
    FormRow,
    Switch,
    Input,
    OccasionSelector,
    ItemCard,
} from '../components'

import { BASE_API_URL } from '../api/axiosClient'
import outfitApi from '../api/outfitApi'

const isAndroid = Platform.OS === 'android'

const OutfitDetail = ({ route, navigation }) => {
    const { t } = useTranslation()
    const { colors, sizes } = useTheme()
    const { handleSetIsLoading, refreshImage } = useData()
    const isFocused = useIsFocused()

    const { outfitId } = route.params
    
    const [refresh, forceRefresh] = useState(false)
    const [outfitDetail, setOutfitDetail] = useState(null)
    const [selfieImageUris, setSelfieImageUris] = useState(null)
    const [isValid, setIsValid] = useState({
        occasion_ids: false,
        description: false,
    })
    const [credentials, setCredentials] = useState({
        occasion_ids: [],
        is_public: false,
        description: '',
    })

    // Force refresh the screen whenever focused
    useEffect(() => {
        if (isFocused) {
            forceRefresh((prev) => !prev)
        }
    }, [isFocused])

    // Fetch outfit's data
    useEffect(() => {
        async function fetchOutfitDetail() {
            handleSetIsLoading(true)
            try {
                const response = await outfitApi.getOneById(outfitId)
                setOutfitDetail(response.data)
                handleSetIsLoading(false)
            } catch (error) {
                handleSetIsLoading(false)
                alert(error.response.data.message)
            }
        }

        if (outfitId) {
            fetchOutfitDetail()
        }
    }, [outfitId])

    // Update credentials when outfit detail data is fetched
    useEffect(() => {
        if (outfitDetail) {
            handleChangeCredentials({
                occasion_ids: outfitDetail.Occasions.map(
                    (occasion) => occasion.id,
                ),
                description: outfitDetail.description,
                is_public: outfitDetail.is_public,
            })
        }
    }, [outfitDetail])

    // Update valid status check when credentials change
    useEffect(() => {
        setIsValid((state) => ({
            ...state,
            occasion_ids: Array.isArray(credentials.occasion_ids),
            description:
                credentials.description !== null &&
                credentials.description.length <= 50,
        }))
    }, [credentials, setIsValid])

    const handleChangeCredentials = useCallback(
        (value) => {
            setCredentials((state) => ({ ...state, ...value }))
        },
        [setCredentials],
    )

    const renderOutfitItems = () => {
        if (outfitDetail) {
            return (
                <Block flex={0} row wrap="wrap">
                    {outfitDetail.Items.map(item => {
                        return (
                            <ItemCard
                                key={`item-${item.id}`}
                                item={item}
                            />
                        )
                    })}
                </Block>
            )
        }
    }

    const handleSubmit = useCallback(async () => {
        // Update outfit
        if (!Object.values(isValid).includes(false)) {
            handleSetIsLoading(true)
            try {
                const response = await outfitApi.updateById(
                    outfitId,
                    credentials,
                )
                if (response.request.status === 200) {
                    handleSetIsLoading(false)
                    Alert.alert(response.data.message)
                    navigation.goBack()
                }
            } catch (error) {
                handleSetIsLoading(false)
                Alert.alert(error.response.data.message)
            }
        }
    }, [isValid, credentials])

    return (
        <Block color={colors.card}>
            {outfitDetail && (
                <Block>
                    <Block scroll showsVerticalScrollIndicator={false} flex={1}>
                        {/* Outfit image */}
                        <Block
                            paddingHorizontal={sizes.s}
                            paddingBottom={sizes.s}
                        >
                            <Image
                                resizeMode="contain"
                                style={{
                                    height: 350,
                                    width: '100%',
                                }}
                                source={{
                                    uri: BASE_API_URL + outfitDetail.image + `?refresh=${refreshImage}`,
                                }}
                            />
                            <Block
                                position="absolute"
                                top={0}
                                right={sizes.s}
                            >
                                <Button
                                    onPress={() => {
                                        navigation.navigate('EditOutfitItems', {
                                            outfitId: outfitDetail.id,
                                        }
                                    )}}
                                >
                                    <MaterialIcons
                                        size={25}
                                        name="edit"
                                        color={colors.icon}
                                    />
                                </Button>
                            </Block>
                        </Block>

                        {/* Outfit infomation tab */}
                        <Block padding={sizes.sm}>
                            {/* Outfit items */}
                            <Block paddingVertical={sizes.sm}>
                                <Text h5>{t('outfitDetail.itemInfo')}</Text>
                                <FormRow
                                    type="Items"
                                    label={t('outfitDetail.items')}
                                    values={outfitDetail.Items}
                                    renderValueSelector={renderOutfitItems}
                                />
                            </Block>

                            {/* Outfit occasions */}
                            <Block paddingVertical={sizes.sm}>
                                <Text h5>{t('outfitDetail.occasionInfo')}</Text>
                                <FormRow
                                    type="Occasions"
                                    label={t('outfitDetail.occasions')}
                                    values={credentials.occasion_ids}
                                    renderValueSelector={() => (
                                        <OccasionSelector
                                            selectedOccasionIds={
                                                credentials.occasion_ids
                                            }
                                            handleChangeCredentials={
                                                handleChangeCredentials
                                            }
                                        />
                                    )}
                                />
                            </Block>

                            {/* Outfit description */}
                            <Block paddingVertical={sizes.s}>
                                <Text h5 paddingBottom={sizes.sm}>
                                    {t('outfitDetail.description')}
                                </Text>
                                <Input
                                    marginBottom={sizes.sm}
                                    placeholder={t(
                                        'outfitDetail.descriptionPlaceholder',
                                    )}
                                    success={Boolean(
                                        credentials.description &&
                                            isValid.description,
                                    )}
                                    danger={Boolean(
                                        credentials.description &&
                                            !isValid.description,
                                    )}
                                    onChangeText={(value) =>
                                        handleChangeCredentials({
                                            description: value,
                                        })
                                    }
                                    value={credentials.description}
                                />
                            </Block>

                            {/* Public switch */}
                            <Block
                                flex={0}
                                row
                                align="center"
                                justify="space-between"
                                paddingVertical={sizes.s}
                            >
                                <Text h5>{t('outfitDetail.public')}</Text>
                                <Switch
                                    checked={credentials.is_public}
                                    onPress={(checked) =>
                                        handleChangeCredentials({
                                            is_public: checked,
                                        })
                                    }
                                />
                            </Block>
                        </Block>
                    </Block>

                    {/* Submit button */}
                    <Block
                        flex={0}
                        paddingHorizontal={sizes.sm}
                        paddingVertical={sizes.s}
                    >
                        <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            disabled={Object.values(isValid).includes(false)}
                            activeOpacity={
                                !Object.values(isValid).includes(false)
                                    ? 1
                                    : 0.2
                            }
                            style={{
                                opacity: Object.values(isValid).includes(false)
                                    ? 0.5
                                    : 1,
                            }}
                            onPress={handleSubmit}
                        >
                            <Text h5>{t('itemDetail.done')}</Text>
                        </Button>
                    </Block>
                </Block>
            )}
        </Block>
    )
}

export default OutfitDetail
