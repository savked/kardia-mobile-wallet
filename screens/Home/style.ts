import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    logo: {
        width: 32,
        height: 32,
        marginRight: 15
    },
    headerContainer: {
        height: 55,
        flexDirection: 'row',
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    kaiCardSlider: {
        backgroundColor: '#2A343D',
        paddingVertical: 15
    },
    kaiCardContainer: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        height: 220
    },
    kaiCard: {
        borderRadius: 9,
        backgroundColor: '#AD182A',
        padding: 25,
        flex: 1,
        justifyContent: 'space-between'
    },
    kaiCardText: {
        color: '#FFFFFF'
    },
    kaiCardBalanceText: {
        fontSize: 18
    },
    buttonGroupContainer: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})