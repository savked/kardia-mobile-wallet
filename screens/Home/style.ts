import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    logo: {
        width: 26,
        height: 26,
        marginRight: 15
    },
    headerContainer: {
        height: 38,
        flexDirection: 'row',
        paddingHorizontal: 30,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        backgroundColor: '#2A343D'
    },
    bodyContainer: {
        backgroundColor: '#2A343D',
    },
    kaiCardSlider: {
        // backgroundColor: '#2A343D',
        paddingVertical: 10
    },
    kaiCardContainer: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        height: 240
    },
    kaiCard: {
        borderRadius: 9,
        backgroundColor: '#AD182A',
        padding: 25,
        flex: 1,
        justifyContent: 'space-between'
    },
    kaiCardText: {
        color: '#FFFFFF',
        fontSize: 16
    },
    kaiCardBalanceText: {
        fontSize: 18
    },
    buttonGroupContainer: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    transactionContainer: { 
        height: 445, 
        // backgroundColor: '#FFFFFF', 
        backgroundColor: '#171E28', 
        borderTopLeftRadius: 22, 
        borderTopRightRadius: 22 
    },
    kaiAmount: {
        fontWeight: 'bold'
    },
    dateContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateText: {
        color: '#b0acac',
        fontSize: 11,
        fontWeight: 'bold'
    }
})