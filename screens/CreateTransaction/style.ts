import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 25
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
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-around',
    }
})