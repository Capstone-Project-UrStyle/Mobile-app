import React, { useCallback, useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { BASE_API_URL } from '../api/axiosClient'
import { useData, useTheme, useTranslation } from '../hooks'
import {
    Block,
    Button,
    Image,
    Product,
    Text,
    WeatherCard,
    ClosetCard,
} from '../components'

import closetApi from '../api/closetApi'

const Home = () => {
    const { t } = useTranslation()
    const { assets, colors, fonts, gradients, sizes } = useTheme()
    const { user, handleSetIsLoading } = useData()

    const [tab, setTab] = useState(0)
    const [cardList, setCardList] = useState([])
    const [refresh, forceRefresh] = useState(false)

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
                <Text p center font={fonts?.['medium']} width="100%">
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
                        <Text p font={fonts?.[tab === 0 ? 'medium' : 'normal']}>
                            {t('home.closets')}
                        </Text>
                    </Button>
                </Block>

                <Block
                    borderBottomWidth={1}
                    borderColor={tab === 1 ? colors.black : colors.light}
                >
                    <Button onPress={() => handleTabs(1)}>
                        <Text p font={fonts?.[tab === 1 ? 'medium' : 'normal']}>
                            {t('home.outfits')}
                        </Text>
                    </Button>
                </Block>

                <Block
                    borderBottomWidth={1}
                    borderColor={tab === 2 ? colors.black : colors.light}
                >
                    <Button onPress={() => handleTabs(2)}>
                        <Text p font={fonts?.[tab === 2 ? 'medium' : 'normal']}>
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
        </Block>
    )
}

export default Home
