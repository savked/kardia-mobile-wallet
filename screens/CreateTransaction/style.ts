import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 25,
        flex: 1,
        justifyContent: "flex-start"
    },

    wrap: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    title: {
        fontSize: 16,
        fontWeight:'bold',
        marginBottom: 5
    },
    
    mb5: {
        marginBottom: 5
    },

    listCard: {
        flexDirection:'row',
        justifyContent:'space-around',
    },

    centerText: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 30,
        color: '#000000',
        fontWeight: 'bold'
    },

    textBold: {
        fontWeight: '500',
        color: '#000'
    }
})