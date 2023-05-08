import React, { useCallback, useState } from "react"
import { Ionicons } from "@expo/vector-icons"

import { BASE_API_URL } from "../api/axiosClient"
import { useData, useTheme, useTranslation } from "../hooks"
import { Block, Button, Image, Input, Product, Text, WeatherCard } from "../components"

const Home = () => {
  const { user } = useData()
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const { following, trending } = useData()
  const [products, setProducts] = useState(following)
  const { assets, colors, fonts, gradients, sizes } = useTheme()

  const handleTabs = useCallback(
    tab => {
      setTab(tab)
      setProducts(tab === 0 ? following : trending)
    },
    [following, trending, setTab, setProducts]
  )

  return (
    <Block>
      {/* user info and location */}
      <Block color={colors.card} flex={0} row align="center" paddingHorizontal={sizes.padding}>
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

      {/* toggle products list */}
      <Block
        row
        flex={0}
        align="center"
        justify="space-between"
        color={colors.card}
      >
        <Block borderBottomWidth={1} borderColor={tab === 0 ? colors.black : colors.light}>
          <Button onPress={() => handleTabs(0)}>
            <Text p font={fonts?.[tab === 0 ? "medium" : "normal"]}>
              {t("home.closets")}
            </Text>
          </Button>
        </Block>
        
        <Block borderBottomWidth={1} borderColor={tab === 1 ? colors.black : colors.light}>
          <Button onPress={() => handleTabs(1)}>
            <Text p font={fonts?.[tab === 1 ? "medium" : "normal"]}>
              {t("home.outfits")}
            </Text>
          </Button>
        </Block>

        <Block borderBottomWidth={1} borderColor={tab === 2 ? colors.black : colors.light}>
          <Button onPress={() => handleTabs(2)}>
            <Text p font={fonts?.[tab === 2 ? "medium" : "normal"]}>
              {t("home.bookmarked")}
            </Text>
          </Button>
        </Block>
      </Block>

      {/* products list */}
      <Block
        scroll
        paddingHorizontal={sizes.padding}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.l }}
      >
        <Block row wrap="wrap" justify="space-between" marginTop={sizes.sm}>
          {products?.map(product => (
            <Product {...product} key={`card-${product?.id}`} />
          ))}
        </Block>
      </Block>
    </Block>
  )
}

export default Home
