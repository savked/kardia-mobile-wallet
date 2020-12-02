import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 22
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 25
    },
    optionContainer: {
        width: '100%',
        height: 420,
        alignItems: 'stretch',
        justifyContent: 'space-around'
    },
    accessWalletText: {
        paddingHorizontal: 24,
        marginTop: 30,
        textAlign: 'center',
        fontSize: 16
    },
    accessLink: {
        textDecorationLine: 'underline',
        fontWeight: 'bold'
    }
})