import * as React from "react";
import { StyleSheet } from "react-nativescript";
import { useTranslation } from 'react-i18next';
import { FrameNavigationProp } from "react-nativescript-navigation";
import { MainStackParamList } from "../../NavigationParamList";

type SearchScreenProps = {
    navigation: FrameNavigationProp<MainStackParamList, "Search">,
};

export function SearchScreen({ navigation }: SearchScreenProps) {
    const { t } = useTranslation();

    return (
        <flexboxLayout style={styles.container}>
            <label className="text-xl font-bold mb-4">
                {t('common.search')}
            </label>
            {/* Search form will be added here */}
        </flexboxLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        flexDirection: "column",
        padding: 20,
        backgroundColor: "#ffffff"
    }
});