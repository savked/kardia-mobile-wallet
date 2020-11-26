import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 25
    },
    headline:{
        fontWeight: "bold",
        color: 'gray',
        marginBottom:5
    },

    input:{
        borderRadius: 8,
        height: 40, 
        borderColor: 'gray',
        borderWidth: 1,
        backgroundColor:'white',
        minWidth:'100%',
    },

    wrap:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    left:{},

    right:{},

    title:{
        fontSize: 16,
        fontWeight:'bold',
        marginBottom: 5
    },
    
    mb5:{
        marginBottom: 5
    },

    listCard:{
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-around',
    }
})