import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30
    },
    buttonGroup: {
        marginTop: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
})