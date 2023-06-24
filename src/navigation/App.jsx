import React, { useEffect } from 'react'
import { Platform, StatusBar, ActivityIndicator } from 'react-native'
import { useFonts } from 'expo-font'
import AppLoading from 'expo-app-loading'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'

import Menu from './Menu'
import { useData, ThemeProvider, TranslationProvider } from '../hooks'
import { Block, Text, Modal } from '../components'

export default () => {
    const {
        isLoading,
        loadingMessage,
        isDark,
        theme,
        setTheme,
        showModal,
        modalContent,
        handleCloseModal,
    } = useData()

    /* set the status bar based on isDark constant */
    useEffect(() => {
        Platform.OS === 'android' && StatusBar.setTranslucent(true)
        StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content')
        return () => {
            StatusBar.setBarStyle('default')
        }
    }, [isDark])

    // load custom fonts
    const [fontsLoaded] = useFonts({
        'OpenSans-Light': theme.assets.OpenSansLight,
        'OpenSans-Regular': theme.assets.OpenSansRegular,
        'OpenSans-SemiBold': theme.assets.OpenSansSemiBold,
        'OpenSans-ExtraBold': theme.assets.OpenSansExtraBold,
        'OpenSans-Bold': theme.assets.OpenSansBold,
    })

    if (!fontsLoaded) {
        return <AppLoading />
    }

    const navigationTheme = {
        ...DefaultTheme,
        dark: isDark,
        colors: {
            ...DefaultTheme.colors,
            border: 'rgba(0,0,0,0)',
            text: String(theme.colors.text),
            card: String(theme.colors.card),
            primary: String(theme.colors.primary),
            notification: String(theme.colors.primary),
            background: String(theme.colors.background),
        },
    }

    return (
        <TranslationProvider>
            <ThemeProvider theme={theme} setTheme={setTheme}>
                <NavigationContainer theme={navigationTheme}>
                    <Menu />
                    {isLoading && (
                        <Block
                            flex={0}
                            position="absolute"
                            width="100%"
                            height="100%"
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor="rgba(0, 0, 0, 0.5)"
                        >
                            <ActivityIndicator
                                size={70}
                                color={String(theme.colors.white)}
                            />
                            <Text
                                h5
                                width="100%"
                                font={navigationTheme.fonts?.['semibold']}
                                color={theme.colors.white}
                                align="center"
                                marginTop={theme.sizes.s}
                            >
                                {loadingMessage || 'Loading'}
                            </Text>
                        </Block>
                    )}
                    {showModal && (
                        <Block
                            flex={0}
                            position="absolute"
                            width="100%"
                            height="100%"
                            alignItems="center"
                            backgroundColor="rgba(0, 0, 0, 0.5)"
                        >
                            <Modal
                                visible={showModal}
                                onRequestClose={handleCloseModal}
                            >
                                {modalContent}
                            </Modal>
                        </Block>
                    )}
                </NavigationContainer>
            </ThemeProvider>
        </TranslationProvider>
    )
}
