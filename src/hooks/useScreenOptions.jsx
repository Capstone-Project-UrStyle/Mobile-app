import React, { useState } from 'react'
import { TouchableOpacity, Alert } from 'react-native'
import { CardStyleInterpolators } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/core'
import { DrawerActions } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'

import { useData } from './useData'
import { useTranslation } from './useTranslation'

import Image from '../components/Image'
import Text from '../components/Text'
import useTheme from '../hooks/useTheme'
import Button from '../components/Button'
import Block from '../components/Block'
import Modal from '../components/Modal'

import closetApi from '../api/closetApi'
import itemApi from '../api/itemApi'

export default () => {
    const { t } = useTranslation()
    const { user } = useData()
    const navigation = useNavigation()
    const { icons, colors, gradients, sizes } = useTheme()

    const [openSelectAddItemModeModal, setOpenSelectAddItemModeModal] =
        useState(false)

    const renderSelectAddItemModeModal = (closetId) => {
        return (
            <Modal
                visible={openSelectAddItemModeModal}
                onRequestClose={() => setOpenSelectAddItemModeModal(false)}
            >
                <Block flex={0} marginBottom={sizes.m}>
                    <Button
                        paddingVertical={sizes.m}
                        onPress={() => {
                            navigation.navigate('CreateItem', {
                                closetId: closetId,
                            })
                            setOpenSelectAddItemModeModal(false)
                        }}
                    >
                        <Text p h5 semibold size={18} align="center">
                            {t('closetDetail.addNewItemToCloset')}
                        </Text>
                    </Button>
                    <Button
                        paddingVertical={sizes.m}
                        onPress={() => {
                            navigation.navigate('AddOrRemoveClosetItem', {
                                targetClosetId: closetId,
                            })
                            setOpenSelectAddItemModeModal(false)
                        }}
                    >
                        <Text p h5 semibold size={18} align="center">
                            {t('closetDetail.addCreatedItemToCloset')}
                        </Text>
                    </Button>
                </Block>
            </Modal>
        )
    }

    const handleDeleteCloset = async (closetId) => {
        try {
            Alert.alert(
                t('closetDetail.confirmDeleteCloset'),
                t('closetDetail.deleteWarning'),
                [
                    {
                        text: t('closetDetail.cancelButton'),
                        style: 'cancel',
                    },
                    {
                        text: t('closetDetail.deleteButton'),
                        style: 'destructive',
                        onPress: async () => {
                            const response = await closetApi.deleteById(
                                closetId,
                            )
                            if (response.request.status === 200) {
                                Alert.alert(response.data.message)
                                navigation.goBack()
                            }
                        },
                    },
                ],
                { cancelable: true },
            )
        } catch (error) {
            Alert.alert(error.response.data.message)
        }
    }

    const handleDeleteItem = async (itemId) => {
        try {
            Alert.alert(
                t('itemDetail.confirmDeleteItem'),
                t('itemDetail.deleteWarning'),
                [
                    {
                        text: t('itemDetail.cancelButton'),
                        style: 'cancel',
                    },
                    {
                        text: t('itemDetail.deleteButton'),
                        style: 'destructive',
                        onPress: async () => {
                            const response = await itemApi.deleteById(itemId)

                            if (response.request.status === 200) {
                                Alert.alert(response.data.message)
                                navigation.goBack()
                            }
                        },
                    },
                ],
                { cancelable: true },
            )
        } catch (error) {
            Alert.alert(error.response.data.message)
        }
    }

    const menu = {
        headerStyle: { elevation: 0 },
        headerTitleAlign: 'left',
        headerTitleContainerStyle: { marginLeft: -sizes.sm },
        headerLeftContainerStyle: { paddingLeft: sizes.s },
        headerRightContainerStyle: { paddingRight: sizes.s },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,

        headerTitle: ({ children }) => (
            <Text p size={18} semibold>
                {children}
            </Text>
        ),

        headerLeft: () => (
            <Button
                onPress={() =>
                    navigation.dispatch(DrawerActions.toggleDrawer())
                }
            >
                <Image source={icons.menu} radius={0} color={colors.icon} />
            </Button>
        ),

        headerRight: () => (
            <Block row flex={0} align="center" marginRight={sizes.padding}>
                <TouchableOpacity
                    style={{ marginRight: sizes.sm }}
                    onPress={() =>
                        navigation.navigate('Screens', {
                            screen: 'Pro',
                        })
                    }
                >
                    <Image source={icons.bell} radius={0} color={colors.icon} />
                    <Block
                        flex={0}
                        right={0}
                        width={sizes.s}
                        height={sizes.s}
                        radius={sizes.xs}
                        position="absolute"
                        gradient={gradients?.primary}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('Screens', {
                            screen: 'Pro',
                        })
                    }
                >
                    <Image
                        source={icons.basket}
                        radius={0}
                        color={colors.icon}
                    />
                    <Block
                        flex={0}
                        padding={0}
                        justify="center"
                        position="absolute"
                        top={-sizes.s}
                        right={-sizes.s}
                        width={sizes.sm}
                        height={sizes.sm}
                        radius={sizes.sm / 2}
                        gradient={gradients?.primary}
                    >
                        <Text
                            white
                            center
                            bold
                            size={10}
                            lineHeight={10}
                            paddingTop={3}
                        >
                            3
                        </Text>
                    </Block>
                </TouchableOpacity>
            </Block>
        ),
    }

    const options = {
        stack: menu,
        components: {
            ...menu,
            headerTitle: () => (
                <Text p size={18} white semibold>
                    {t('navigation.components')}
                </Text>
            ),
            headerRight: () => null,
            headerLeft: () => (
                <Button
                    onPress={() =>
                        navigation.dispatch(DrawerActions.toggleDrawer())
                    }
                >
                    <Image
                        source={icons.menu}
                        radius={0}
                        color={colors.white}
                    />
                </Button>
            ),
        },
        pro: {
            ...menu,
            headerTransparent: true,
            headerTitle: () => (
                <Text p size={18} white semibold>
                    {t('pro.title')}
                </Text>
            ),
            headerRight: () => null,
            headerLeft: () => (
                <Button
                    onPress={() =>
                        navigation.dispatch(DrawerActions.toggleDrawer())
                    }
                >
                    <Image
                        source={icons.menu}
                        radius={0}
                        color={colors.white}
                    />
                </Button>
            ),
        },
        back: {
            ...menu,
            headerRight: () => null,
            headerLeft: () => (
                <Button onPress={() => navigation.goBack()}>
                    <Image
                        radius={0}
                        width={10}
                        height={18}
                        color={colors.icon}
                        source={icons.arrow}
                        transform={[{ rotate: '180deg' }]}
                    />
                </Button>
            ),
        },
        closetDetail: (closetId, closetName) => {
            return {
                ...menu,
                headerRight: () => (
                    <Block row flex={0} align="center" marginRight={sizes.s}>
                        <Button
                            onPress={() => setOpenSelectAddItemModeModal(true)}
                        >
                            <MaterialIcons
                                size={22}
                                name="add"
                                color={colors.icon}
                            />
                        </Button>
                        {openSelectAddItemModeModal &&
                            renderSelectAddItemModeModal(closetId)}
                        {closetName !== 'All items' && (
                            <Block row flex={0} align="center">
                                <Button
                                    onPress={() =>
                                        navigation.navigate('EditCloset', {
                                            closetId: closetId,
                                        })
                                    }
                                >
                                    <MaterialIcons
                                        size={20}
                                        name="edit"
                                        color={colors.icon}
                                    />
                                </Button>
                                <Button
                                    onPress={() => handleDeleteCloset(closetId)}
                                >
                                    <MaterialIcons
                                        size={20}
                                        name="delete"
                                        color={colors.icon}
                                    />
                                </Button>
                            </Block>
                        )}
                    </Block>
                ),
                headerLeft: () => (
                    <Button onPress={() => navigation.goBack()}>
                        <Image
                            radius={0}
                            width={10}
                            height={18}
                            color={colors.icon}
                            source={icons.arrow}
                            transform={[{ rotate: '180deg' }]}
                        />
                    </Button>
                ),
            }
        },
        itemDetail: (itemId) => {
            return {
                ...menu,
                headerRight: () => (
                    <Block row flex={0} align="center" marginRight={sizes.s}>
                        <Button onPress={() => handleDeleteItem(itemId)}>
                            <MaterialIcons
                                size={20}
                                name="delete"
                                color={colors.icon}
                            />
                        </Button>
                    </Block>
                ),
                headerLeft: () => (
                    <Button onPress={() => navigation.goBack()}>
                        <Image
                            radius={0}
                            width={10}
                            height={18}
                            color={colors.icon}
                            source={icons.arrow}
                            transform={[{ rotate: '180deg' }]}
                        />
                    </Button>
                ),
            }
        },
        profile: {
            ...menu,
            headerRight: () => (
                <Block row flex={0} align="center" marginRight={sizes.padding}>
                    <TouchableOpacity
                        style={{ marginRight: sizes.sm }}
                        onPress={() =>
                            navigation.navigate('Screens', {
                                screen: 'Notifications',
                            })
                        }
                    >
                        <Image
                            source={icons.bell}
                            radius={0}
                            color={colors.icon}
                        />
                        <Block
                            flex={0}
                            right={0}
                            width={sizes.s}
                            height={sizes.s}
                            radius={sizes.xs}
                            position="absolute"
                            gradient={gradients?.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.dispatch(
                                DrawerActions.jumpTo('Screens', {
                                    screen: 'Profile',
                                }),
                            )
                        }
                    >
                        <Image
                            radius={6}
                            width={24}
                            height={24}
                            source={{ uri: user.avatar }}
                        />
                    </TouchableOpacity>
                </Block>
            ),
        },
    }

    return options
}
