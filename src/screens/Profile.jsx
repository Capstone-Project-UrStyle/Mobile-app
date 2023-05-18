import React, { useCallback } from 'react'
import { Platform, Linking, TouchableOpacity } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'

import * as ImagePicker from 'expo-image-picker'

import { BASE_API_URL } from '../api/axiosClient'
import { Block, Button, Image, Text } from '../components/'
import { useData, useTheme, useTranslation } from '../hooks/'
import { createFormDataFromUri } from '../utils/formDataCreator'

import uploadImageApi from '../api/uploadImageApi'

const isAndroid = Platform.OS === 'android'

const Profile = ({ route, navigation }) => {
    const { user } = useData()
    const { t } = useTranslation()
    const { assets, colors, sizes } = useTheme()

    const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3
    const IMAGE_VERTICAL_SIZE =
        (sizes.width - (sizes.padding + sizes.sm) * 2) / 2
    const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2
    const IMAGE_VERTICAL_MARGIN =
        (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2

    const userId = route.params.userId
    const isFollowed = false
    const genderIcon =
        user.UserInfo.gender === 0
            ? 'male'
            : user.UserInfo.gender === 1
            ? 'female'
            : 'male-female'

    const handleSocialLink = useCallback(
        (url) => {
            try {
                if (url) {
                    Linking.openURL(url)
                }
            } catch (error) {
                alert(`Cannot open URL: ${url}`)
            }
        },
        [user],
    )

    const handleChooseUserAvatar = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        })

        if (!result.canceled) {
            const postData = createFormDataFromUri('user-avatar', result.uri)
            await uploadImageApi.uploadUserAvatar(user.id, postData)
        }
    }

    return (
        <Block safe marginTop={sizes.md}>
            <Block
                scroll
                paddingHorizontal={sizes.s}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.padding }}
            >
                <Block flex={0}>
                    <Image
                        background
                        resizeMode="cover"
                        padding={sizes.sm}
                        paddingBottom={sizes.l}
                        radius={sizes.cardRadius}
                        source={assets.background}
                    >
                        <Block flex={0} row justify="space-between">
                            <Button
                                row
                                flex={0}
                                justify="flex-start"
                                onPress={() => navigation.goBack()}
                            >
                                <Image
                                    radius={0}
                                    width={10}
                                    height={18}
                                    color={colors.white}
                                    source={assets.arrow}
                                    transform={[{ rotate: '180deg' }]}
                                />
                                <Text p white marginLeft={sizes.s}>
                                    {t('profile.title')}
                                </Text>
                            </Button>
                            {user.id === userId && (
                                <Button
                                    row
                                    flex={0}
                                    // onPress={() => navigation.goBack()}
                                >
                                    <MaterialIcons
                                        size={20}
                                        name="edit"
                                        color={colors.white}
                                    />
                                </Button>
                            )}
                        </Block>

                        <Block flex={0} row justify="center" align="center">
                            <TouchableOpacity onPress={handleChooseUserAvatar}>
                                <Image
                                    width={80}
                                    height={80}
                                    marginHorizontal={sizes.s}
                                    source={{
                                        uri:
                                            BASE_API_URL + user.UserInfo.avatar,
                                    }}
                                />
                            </TouchableOpacity>
                            <Block flex={0} align="flex-start">
                                <Block
                                    row
                                    align="center"
                                    marginHorizontal={sizes.s}
                                >
                                    <Text h5 center white marginRight={sizes.s}>
                                        {user.name}
                                    </Text>
                                    <Ionicons
                                        size={14}
                                        name={genderIcon}
                                        color={colors.white}
                                        marginRight={sizes.s}
                                    />
                                </Block>
                                <Block
                                    row
                                    align="center"
                                    marginHorizontal={sizes.s}
                                >
                                    <Ionicons
                                        size={14}
                                        name="location"
                                        color={colors.white}
                                        marginRight={sizes.s}
                                    />
                                    <Text h6 center white>
                                        {user.UserInfo.address}
                                    </Text>
                                </Block>
                                <Block
                                    row
                                    align="center"
                                    marginHorizontal={sizes.s}
                                >
                                    <Ionicons
                                        size={14}
                                        name="md-phone-portrait"
                                        color={colors.white}
                                        marginRight={sizes.s}
                                    />
                                    <Text h6 center white>
                                        {user.UserInfo.phone_number}
                                    </Text>
                                </Block>
                            </Block>
                        </Block>

                        <Block
                            row
                            justify="center"
                            align="center"
                            marginVertical={sizes.m}
                        >
                            {user.id !== userId && (
                                <Button
                                    white
                                    outlined
                                    shadow={false}
                                    radius={sizes.m}
                                    marginHorizontal={sizes.s}
                                    onPress={() => {
                                        alert(`Follow ${user.name}`)
                                    }}
                                >
                                    <Block
                                        justify="center"
                                        radius={sizes.m}
                                        paddingHorizontal={sizes.m}
                                        color="rgba(255,255,255,0.2)"
                                    >
                                        <Text white bold transform="uppercase">
                                            {isFollowed
                                                ? t('common.unfollow')
                                                : t('common.follow')}
                                        </Text>
                                    </Block>
                                </Button>
                            )}
                            <Button
                                shadow={false}
                                radius={sizes.m}
                                marginHorizontal={sizes.s}
                                color="rgba(255,255,255,0.2)"
                                outlined={String(colors.white)}
                                onPress={() =>
                                    handleSocialLink(user.UserInfo.facebook)
                                }
                            >
                                <Ionicons
                                    size={20}
                                    name="logo-facebook"
                                    color={colors.white}
                                />
                            </Button>
                            <Button
                                shadow={false}
                                radius={sizes.m}
                                marginHorizontal={sizes.s}
                                color="rgba(255,255,255,0.2)"
                                outlined={String(colors.white)}
                                onPress={() =>
                                    handleSocialLink(user.UserInfo.instagram)
                                }
                            >
                                <Ionicons
                                    size={20}
                                    name="logo-instagram"
                                    color={colors.white}
                                />
                            </Button>
                        </Block>
                    </Image>

                    {/* profile: stats */}
                    <Block
                        flex={0}
                        radius={sizes.sm}
                        // disabled shadow on Android due to blur overlay + elevation issue
                        shadow={!isAndroid}
                        marginTop={-sizes.l}
                        marginHorizontal="8%"
                        color="rgba(255,255,255,0.2)"
                    >
                        <Block
                            row
                            blur
                            flex={0}
                            intensity={100}
                            radius={sizes.sm}
                            overflow="hidden"
                            tint={colors.blurTint}
                            justify="space-evenly"
                            paddingVertical={sizes.sm}
                            renderToHardwareTextureAndroid
                        >
                            <Block align="center">
                                <Text h5>{user.FollowerCount || 0}</Text>
                                <Text>{t('profile.followers')}</Text>
                            </Block>
                            <Block align="center">
                                <Text h5>{user.FollowingCount || 0}</Text>
                                <Text>{t('profile.following')}</Text>
                            </Block>
                        </Block>
                    </Block>

                    {/* profile: about me */}
                    <Block paddingHorizontal={sizes.sm}>
                        <Text
                            h5
                            semibold
                            marginBottom={sizes.s}
                            marginTop={sizes.sm}
                        >
                            {t('profile.aboutMe')}
                        </Text>
                        <Text p lineHeight={26}>
                            {user.about}
                        </Text>
                    </Block>

                    {/* profile: photo album */}
                    <Block paddingHorizontal={sizes.sm} marginTop={sizes.s}>
                        <Block row align="center" justify="space-between">
                            <Text h5 semibold>
                                {t('common.album')}
                            </Text>
                            <Button>
                                <Text p primary semibold>
                                    {t('common.viewall')}
                                </Text>
                            </Button>
                        </Block>
                        <Block row justify="space-between" wrap="wrap">
                            <Image
                                resizeMode="cover"
                                source={assets?.photo1}
                                style={{
                                    width:
                                        IMAGE_VERTICAL_SIZE + IMAGE_MARGIN / 2,
                                    height:
                                        IMAGE_VERTICAL_SIZE * 2 +
                                        IMAGE_VERTICAL_MARGIN,
                                }}
                            />
                            <Block marginLeft={sizes.m}>
                                <Image
                                    resizeMode="cover"
                                    source={assets?.photo2}
                                    marginBottom={IMAGE_VERTICAL_MARGIN}
                                    style={{
                                        height: IMAGE_VERTICAL_SIZE,
                                        width: IMAGE_VERTICAL_SIZE,
                                    }}
                                />
                                <Image
                                    resizeMode="cover"
                                    source={assets?.photo3}
                                    style={{
                                        height: IMAGE_VERTICAL_SIZE,
                                        width: IMAGE_VERTICAL_SIZE,
                                    }}
                                />
                            </Block>
                        </Block>
                    </Block>
                </Block>
            </Block>
        </Block>
    )
}

export default Profile
