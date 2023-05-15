import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/core'

import {
    Login,
    Register,
    Profile,
    Home,
    CreateCloset,
    Articles,
    Components,
    Pro,
} from '../screens'
import { useData, useScreenOptions, useTranslation } from '../hooks'

const Stack = createStackNavigator()

export default () => {
    const { t } = useTranslation()
    const screenOptions = useScreenOptions()
    const navigation = useNavigation()

    const { token } = useData()

    useEffect(() => {
        if (token === null) {
            navigation.navigate('Login')
        }
    }, [token])

    return token ? (
        <Stack.Navigator screenOptions={screenOptions.stack}>
            <Stack.Screen
                name="Home"
                component={Home}
                options={{ title: t('navigation.home') }}
            />

            <Stack.Screen
                name="CreateCloset"
                component={CreateCloset}
                options={{
                    title: t('navigation.createCloset'),
                    ...screenOptions.back,
                }}
            />

            <Stack.Screen
                name="Components"
                component={Components}
                options={screenOptions.components}
            />

            <Stack.Screen
                name="Articles"
                component={Articles}
                options={{ title: t('navigation.articles') }}
            />

            <Stack.Screen
                name="Pro"
                component={Pro}
                options={screenOptions.pro}
            />

            <Stack.Screen
                name="Profile"
                component={Profile}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    ) : (
        <Stack.Navigator screenOptions={screenOptions.stack}>
            <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}
