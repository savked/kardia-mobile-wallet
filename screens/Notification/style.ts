import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    thumbnail: {
        width:65,
        height:65
    },
    row:{
        flexDirection: 'row',
        justifyContent:'space-around',
        marginBottom:10,
        padding:20,
        alignItems:'center',
        backgroundColor:'white',
        borderRadius:8
    },

    left:{
        marginRight:15
    },
    right:{
        flex:1
    },
    title:{
        fontWeight:'bold',
        fontSize:16
    },

    description:{},

    time:{

    }
})
