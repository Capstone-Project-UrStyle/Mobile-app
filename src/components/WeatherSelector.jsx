import React from 'react'

import { useTheme } from '../hooks/'

import Button from './Button'
import Block from './Block'
import Image from './Image'
import Text from './Text'

const WeatherSelector = ({ selectedWeathers, handlePressWeatherTag }) => {
    const { gradients, sizes } = useTheme()

    const weathers = [
        {
            keywords: 'hot warm sun',
            displayName: 'Sunny',
            icon: '113.png',
        },
        {
            keywords: 'rain wet waterproof water',
            displayName: 'Rainy',
            icon: '266.png',
        },
        {
            keywords: 'cloud',
            displayName: 'Cloudy',
            icon: '116.png',
        },
        {
            keywords: '',
            displayName: 'Windy',
            icon: '248.png',
        },
        {
            keywords: 'snow',
            displayName: 'Snowy',
            icon: '338.png',
        },
    ]

    return (
        <Block row flex={1} wrap="wrap" justify="flex-start">
            {weathers.map((weather) => {
                const isSelected = selectedWeathers.includes(
                    weather.displayName,
                )
                return (
                    <Button
                        key={`weather-${weather.displayName}`}
                        radius={sizes.sm}
                        onPress={() => handlePressWeatherTag(weather)}
                        gradient={gradients?.[isSelected ? 'primary' : 'light']}
                        margin={sizes.xs}
                    >
                        <Block row align="center">
                            <Image
                                radius={sizes.s}
                                width={35}
                                height={35}
                                source={{
                                    uri: `https://cdn.weatherapi.com/weather/64x64/day/${weather.icon}`,
                                }}
                            />
                            <Text
                                p
                                size={13}
                                white={isSelected}
                                black={!isSelected}
                                marginHorizontal={sizes.xs}
                            >
                                {weather.displayName}
                            </Text>
                        </Block>
                    </Button>
                )
            })}
        </Block>
    )
}

export default React.memo(WeatherSelector)
