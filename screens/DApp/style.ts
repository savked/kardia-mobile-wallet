import {StyleSheet} from 'react-native';
export const styles = StyleSheet.create({
    listCard:{},
    thumbnail:{
        width:50,
        height:50,
        // marginRight: 15
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    appContainer: { 
        margin: 10, 
        padding: 20, 
        backgroundColor: 'white',
        borderRadius: 12, 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    appTitleContainer: {
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    }
})