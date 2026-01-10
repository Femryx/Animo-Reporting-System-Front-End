import { View, Text, StyleSheet, Button, TextInput, Pressable, Alert, StatusBar, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { colors } from "../colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Log({navigation}){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async() => {

        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }
        try{
            const response = await fetch('https://thesisprojectbackendserver-main-production.up.railway.app/api/loginCheck',
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "email": email,
                        "password": password,
                    })
                }
            )
            const data = await response.json();
            const token = data.token;
            if(data.success){
                await AsyncStorage.setItem("jwt",token);
                await AsyncStorage.setItem("role",data.role);
                // Navigate to home screen
                navigation.navigate("Home");
            }

        }catch(error){
            console.log(error)
        }
        
    };

    return(
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <View style={styles.header}>
                <Text style={styles.headerSubtitle}>Welcome</Text>
                <Text style={styles.headerTitle}>Animo Reporting System</Text>
                <Text style={styles.headerSubtitle}>Sign in to your account</Text>
            </View>
            
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textLight}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textLight}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <Pressable style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.surface,
        textAlign: "center",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.accent,
        textAlign: "center",
        marginBottom: 0,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: "center",
        minHeight: 500,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: "#000000", // Keep input text black as requested
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loginButton: {
        backgroundColor: colors.primaryLight,
        borderRadius: 15,
        paddingVertical: 18,
        marginTop: 20,
        shadowColor: colors.primaryLight,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonText: {
        color: colors.surface,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },

})
