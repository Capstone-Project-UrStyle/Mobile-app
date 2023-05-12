import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'

import Text from './Text'
import Block from './Block'
import Image from './Image'
import { useTheme, useTranslation } from '../hooks/'

const WeatherCard = (props) => {
  const { colors, sizes } = useTheme()
  const [weatherInfo, setWeatherInfo] = useState(null)

  const WEATHER_API_KEY = '707e7924fe6241d7a25162853231205'

  useEffect(() => {
    const fetchWeatherInfo = async () => {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=Vietnam`,
        )
        const json = await response.json()
        setWeatherInfo(json)
      } catch (error) {
        console.log(error)
      }
    }

    fetchWeatherInfo()
  }, [])

  const getDate = (weatherInfo) => {
    const date = dayjs(weatherInfo.location.localtime)
      .toDate()
      .toString()
      .split(' ')
    return (
      <Block flex={0} row marginTop={sizes.s}>
        <Text h5 bold size={16} marginLeft={sizes.xs}>
          {date[0]}
        </Text>
        <Text h5 size={16} marginLeft={sizes.xs}>
          {date[1]}
        </Text>
        <Text h5 size={16} marginHorizontal={sizes.xs}>
          {date[2]}
        </Text>
      </Block>
    )
  }

  const renderTodayTag = (weatherInfo) => {
    if (
      dayjs(weatherInfo.location.localtime)
        .format('DD MMMM YYYY')
        .toString() === dayjs().format('DD MMMM YYYY').toString()
    ) {
      return (
        <Block
          flex={0}
          borderRadius={sizes.cardRadius}
          backgroundColor={colors.primary}
          paddingHorizontal={sizes.s}
          paddingVertical={sizes.xs}
          margin={sizes.xs}
        >
          <Text h5 bold size={14} color={colors.white}>
            Today
          </Text>
        </Block>
      )
    }
  }

  return (
    <Block
      card
      paddingVertical={sizes.xs}
      marginVertical={sizes.s}
      color={colors.light}
      minHeight={75}
    >
      {weatherInfo && (
        <Block flex={0} row align="center" justify="space-between">
          <Block flex={0}>
            <Block flex={0} row>
              {getDate(weatherInfo)}
              {renderTodayTag(weatherInfo)}
            </Block>

            <Block flex={0} row>
              <Text h5 size={18} marginLeft={sizes.xs}>
                {weatherInfo.current.temp_c} /
              </Text>
              <Text h5 size={18} marginLeft={sizes.xs}>
                {weatherInfo.current.feelslike_c}°C
              </Text>
              <Text h5 size={18} marginLeft={sizes.sm}>
                {weatherInfo.current.humidity}%
              </Text>
            </Block>
          </Block>
          <Image
            style={{ backgroundColor: colors.light }}
            width={sizes.xl}
            height={sizes.xl}
            marginRight={sizes.s}
            source={{ uri: `https:${weatherInfo.current.condition.icon}` }}
          />
        </Block>
      )}
    </Block>
  )
}

export default WeatherCard
