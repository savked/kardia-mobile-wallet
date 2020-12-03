import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'stretch'
    },
    dateText: {
        color: '#b0acac',
        fontSize: 11,
        fontWeight: 'bold'
    },
    dateContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    kaiAmount: {
        fontWeight: 'bold'
    },
    controlContainer: {
        flexDirection: 'row',
        width: '100%',
        padding: 22
    }
})