import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/core'

import {
    Login,
    Register,
    Profile,
    Home,
    CreateCloset,
    ClosetDetail,
    EditCloset,
    CreateItem,
    ItemDetail,
    EditClosetItems,
    CreateOutfit,
    OutfitDetail,
    EditOutfitItems,
    RecommendCompatibleItems,
    RecommendOutfitIdeas,
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
                name="ClosetDetail"
                component={ClosetDetail}
                options={({ route }) => ({
                    title: route.params.closetName,
                    ...screenOptions.closetDetail(
                        route.params.closetId,
                        route.params.closetName,
                    ),
                })}
            />

            <Stack.Screen
                name="EditCloset"
                component={EditCloset}
                options={{
                    title: t('navigation.editCloset'),
                    ...screenOptions.back,
                }}
            />

            <Stack.Screen
                name="CreateItem"
                component={CreateItem}
                options={{
                    title: t('navigation.createItem'),
                    ...screenOptions.back,
                }}
            />

            <Stack.Screen
                name="ItemDetail"
                component={ItemDetail}
                options={({ route }) => ({
                    title: t('navigation.itemDetail'),
                    ...screenOptions.itemDetail(route.params.itemId),
                })}
            />

            <Stack.Screen
                name="EditClosetItems"
                component={EditClosetItems}
                options={({ route }) => ({
                    title: t('navigation.editClosetItems'),
                    ...screenOptions.back,
                })}
            />

            <Stack.Screen
                name="CreateOutfit"
                component={CreateOutfit}
                options={{
                    title: t('navigation.createOutfit'),
                    ...screenOptions.back,
                }}
            />

            <Stack.Screen
                name="OutfitDetail"
                component={OutfitDetail}
                options={({ route }) => ({
                    title: t('navigation.outfitDetail'),
                    ...screenOptions.outfitDetail(route.params.outfitId),
                })}
            />

            <Stack.Screen
                name="EditOutfitItems"
                component={EditOutfitItems}
                options={{
                    title: t('navigation.editOutfitItems'),
                    ...screenOptions.back,
                }}
            />

            <Stack.Screen
                name="RecommendCompatibleItems"
                component={RecommendCompatibleItems}
                options={{
                    title: t('navigation.recommendCompatibleItems'),
                    ...screenOptions.back,
                }}
            />

            <Stack.Screen
                name="RecommendOutfitIdeas"
                component={RecommendOutfitIdeas}
                options={{
                    title: t('navigation.recommendOutfitIdeas'),
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
