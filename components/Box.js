import {View, Text, StyleSheet} from "react-native";

export default function Box({ children, style}){
    return (
        <View style={[styles.box, style]}>
            <Text style={styles.text}>{children}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    box: {
        height: 50,
        width: 100,
        padding: 10,
        backgroundColor: "#fff", //white default color
        borderRadius: 10,
    },
    text:{
        fontSize: 19,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
})