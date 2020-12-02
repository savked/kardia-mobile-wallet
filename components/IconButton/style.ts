import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    badgeContainer: {
        position: 'absolute',
        top: -9,
        right: -9,
        backgroundColor: '#AD182A',
        padding: 5,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100
    },
    badgeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12
    }
})