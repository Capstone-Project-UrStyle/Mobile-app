import React, { useCallback, useState, useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import { useIsFocused } from '@react-navigation/native'

import { BASE_API_URL } from '../api/axiosClient'
import { useData, useTheme, useTranslation } from '../hooks'
import {
    Block,
    Button,
    Image,
    Text,
    WeatherCard,
    ClosetCard,
} from '../components'

import closetApi from '../api/closetApi'

const Home = ({ navigation }) => {
    const { t } = useTranslation()
    const { colors, fonts, sizes, gradients, screenSize } = useTheme()
    const { user, handleSetIsLoading } = useData()
    const isFocused = useIsFocused()

    const [tab, setTab] = useState(0)
    const [cardList, setCardList] = useState([])
    const [openAddMenu, setOpenAddMenu] = useState(false)
    const [refresh, forceRefresh] = useState(false)

    // Force refresh the screen whenever focused
    useEffect(() => {
        if (isFocused) {
            forceRefresh((prev) => !prev)
        }
    }, [isFocused])

    // Fetch all user's closets data
    useEffect(() => {
        async function fetchUserClosets() {
            handleSetIsLoading(true)
            try {
                const response = await closetApi.getListByUserId(user.id)
                setCardList(response.data)
                handleSetIsLoading(false)
            } catch (error) {
                handleSetIsLoading(false)
                alert(error.response.data.message)
            }
        }

        if (user) {
            switch (tab) {
                case 0:
                    // Fetch user closets
                    fetchUserClosets()
                case 1:
                // Fetch user outfits
                case 2:
                // Fetch user bookmarked outfits
                default:
            }
        }
    }, [user, tab, refresh])

    const handleTabs = useCallback(
        (tab) => {
            setTab(tab)
        },
        [setTab, setCardList],
    )

    const renderCardList = () => {
        if (cardList && cardList.length > 0) {
            switch (tab) {
                case 0:
                    return (
                        <>
                            {cardList.map((card) => (
                                <ClosetCard
                                    key={`card-${card?.id}`}
                                    closet={card}
                                    type={'vertical'}
                                />
                            ))}
                            <ClosetCard
                                key={'create'}
                                create
                                type={'vertical'}
                            />
                        </>
                    )
                case 1:
                case 2:
                default:
                    return
            }
        } else {
            return (
                <Text p center font={fonts?.['semibold']} width="100%">
                    {t('home.noItemFound')}
                </Text>
            )
        }
    }

    return (
        <Block>
            {/* user info and location */}
            <Block
                color={colors.card}
                flex={0}
                row
                align="center"
                paddingHorizontal={sizes.padding}
            >
                <Image
                    width={50}
                    height={50}
                    marginHorizontal={sizes.s}
                    source={{ uri: BASE_API_URL + user?.UserInfo.avatar }}
                />
                <Block align="flex-start" marginHorizontal={sizes.s}>
                    <Text h5 center marginRight={sizes.s}>
                        {user?.name}
                    </Text>
                    <Block row align="center" marginHorizontal={sizes.s}>
                        <Ionicons
                            size={14}
                            name="location"
                            color={colors.black}
                            marginRight={sizes.s}
                        />
                        <Text h6 center>
                            {user?.UserInfo.address}
                        </Text>
                    </Block>
                </Block>
            </Block>

            {/* weather info */}
            <Block
                flex={0}
                row
                align="center"
                color={colors.card}
                paddingHorizontal={sizes.padding}
                paddingVertical={sizes.s}
            >
                <WeatherCard />
            </Block>

            {/* toggle items list */}
            <Block
                row
                flex={0}
                align="center"
                justify="space-between"
                color={colors.card}
            >
                <Block
                    borderBottomWidth={1}
                    borderColor={tab === 0 ? colors.black : colors.light}
                >
                    <Button onPress={() => handleTabs(0)}>
                        <Text
                            p
                            font={fonts?.[tab === 0 ? 'semibold' : 'normal']}
                        >
                            {t('home.closets')}
                        </Text>
                    </Button>
                </Block>

                <Block
                    borderBottomWidth={1}
                    borderColor={tab === 1 ? colors.black : colors.light}
                >
                    <Button onPress={() => handleTabs(1)}>
                        <Text
                            p
                            font={fonts?.[tab === 1 ? 'semibold' : 'normal']}
                        >
                            {t('home.outfits')}
                        </Text>
                    </Button>
                </Block>

                <Block
                    borderBottomWidth={1}
                    borderColor={tab === 2 ? colors.black : colors.light}
                >
                    <Button onPress={() => handleTabs(2)}>
                        <Text
                            p
                            font={fonts?.[tab === 2 ? 'semibold' : 'normal']}
                        >
                            {t('home.bookmarked')}
                        </Text>
                    </Button>
                </Block>
            </Block>

            {/* Cards list */}
            <Block
                scroll
                paddingHorizontal={sizes.padding}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.l }}
                forceRefresh={forceRefresh}
            >
                <Block
                    row
                    wrap="wrap"
                    justify="space-between"
                    marginTop={sizes.sm}
                >
                    {renderCardList()}
                </Block>
            </Block>

            {/* Add Menu */}
            {openAddMenu && (
                <Block
                    position="absolute"
                    width="100%"
                    height="100%"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="rgba(0, 0, 0, 0.6)"
                >
                    <Block
                        position="absolute"
                        backgroundColor={colors.card}
                        borderRadius={10}
                        padding={sizes.sm}
                        bottom={80}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setOpenAddMenu(false)
                                navigation.navigate('CreateItem')
                            }}
                        >
                            <Block flex={0} row align="center">
                                <Ionicons
                                    name="shirt"
                                    size={30}
                                    color={colors.primary}
                                    paddingRight={sizes.sm}
                                    paddingVertical={sizes.s}
                                />
                                <Text p h5 font={fonts.semibold}>
                                    Add new clothes item
                                </Text>
                            </Block>
                        </TouchableOpacity>
                        <Block
                            flex={0}
                            height={1}
                            marginVertical={sizes.xs}
                            gradient={gradients.menu}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                setOpenAddMenu(false)
                                navigation.navigate('CreateOutfit')
                            }}
                        >
                            <Block flex={0} row align="center">
                                <Ionicons
                                    name="man"
                                    size={30}
                                    color={colors.dark}
                                    paddingRight={sizes.sm}
                                    paddingVertical={sizes.s}
                                />
                                <Text p h5 font={fonts.semibold}>
                                    Create new outfit
                                </Text>
                            </Block>
                        </TouchableOpacity>
                    </Block>
                </Block>
            )}

            <Block
                alignItems="center"
                justifyContent="center"
                position="absolute"
                bottom={10}
                right={screenSize.width / 2 - 27.5}
                backgroundColor={colors.card}
                borderRadius={100}
            >
                <TouchableOpacity
                    onPress={() => setOpenAddMenu((prev) => !prev)}
                >
                    {openAddMenu ? (
                        <AntDesign
                            name="closecircle"
                            size={55}
                            color="#01a699"
                        />
                    ) : (
                        <AntDesign
                            name="pluscircle"
                            size={55}
                            color="#01a699"
                        />
                    )}
                </TouchableOpacity>
            </Block>
        </Block>
    )
}

export default Home
