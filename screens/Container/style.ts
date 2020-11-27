import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    splashContainer: {
        backgroundColor: '#AD182A', 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    splashLogo: {
        flex: 1, 
        width: 300, 
        height: 100, 
        resizeMode: 'contain'
    },
    noWalletContainer: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 25
    },
    noWalletLogo: {
        width: 100,
        height: 100, 
        resizeMode: 'contain'
    }
})