import { BaseNavigationContainer } from '@react-navigation/core';
import * as React from "react";
import { stackNavigatorFactory } from "react-nativescript-navigation";
import { HomeScreen } from "./screens/HomeScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { OfferScreen } from "./screens/OfferScreen";
import { BookingsScreen } from "./screens/BookingsScreen";
import { WalletScreen } from "./screens/WalletScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

const StackNavigator = stackNavigatorFactory();

export const MainStack = () => (
    <BaseNavigationContainer>
        <StackNavigator.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: true,
            }}
        >
            <StackNavigator.Screen
                name="Home"
                component={HomeScreen}
            />
            <StackNavigator.Screen
                name="Search"
                component={SearchScreen}
            />
            <StackNavigator.Screen
                name="Offer"
                component={OfferScreen}
            />
            <StackNavigator.Screen
                name="Bookings"
                component={BookingsScreen}
            />
            <StackNavigator.Screen
                name="Wallet"
                component={WalletScreen}
            />
            <StackNavigator.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </StackNavigator.Navigator>
    </BaseNavigationContainer>
);