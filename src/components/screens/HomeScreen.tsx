import * as React from "react";
import { StyleSheet } from "react-nativescript";
import { useTranslation } from 'react-i18next';
import { FrameNavigationProp } from "react-nativescript-navigation";
import { MainStackParamList } from "../../NavigationParamList";

type HomeScreenProps = {
    navigation: FrameNavigationProp<MainStackParamList, "Home">,
};

export function HomeScreen({ navigation }: HomeScreenProps) {
    const { t } = useTranslation();

    return (
        <flexboxLayout style={styles.container}>
            <label className="text-2xl mb-4 font-bold text-center">
                {t('home.welcome')}
            </label>
            <button
                className="btn btn-primary m-2"
                onTap={() => navigation.navigate("Search")}
            >
                {t('home.findRide')}
            </button>
            <button
                className="btn btn-secondary m-2"
                onTap={() => navigation.navigate("Offer")}
            >
                {t('home.offerRide')}
            </button>
        </flexboxLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff"
    }
});