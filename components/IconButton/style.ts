import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    badgeContainer: {
        position: 'absolute',
        top: -12,
        right: -12,
        backgroundColor: '#AD182A',
        padding: 5,
        width: 25,
        height: 25,
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