import { View, Text, StyleSheet, Button,  VirtualizedList, ScrollView, StatusBar, Image, Pressable, TouchableOpacity, Modal} from "react-native";
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { colors } from '../colors';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen( {navigation}){
    const [post,setpost] = useState([])
    const [role,setRole] = useState()
    const [dropdownVisible, setDropdownVisible] = useState(null)
    const get_post = async() =>{
        try{
            const response = await fetch('http://192.168.5.108:5000/api',{
                method:'GET',
            });
            const json = await response.json();
            setpost(json);
            
        }catch(error){
            console.log(error)
        }
    }
    const logout = async() =>{
        await AsyncStorage.removeItem("jwt")
        await AsyncStorage.removeItem("role")
        navigation.navigate("LogIn")
    }

    useEffect(()=>{
        get_post();
        //Need to include the if else checking if the account is admin or student
        const fetchrole = async () =>{
            setRole(await AsyncStorage.getItem("role"))
        }
        fetchrole()
    },[])

    const handleStatusChange = async(postId, newStatus) => {
        try{
            const response = await fetch('http://192.168.5.108:5000/api/statuschange',{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    id: postId,
                })
            })
            const json = await response.json()
            console.log(json);
            get_post();
        }catch(error){
            console.log(error);
        }
        setDropdownVisible(null);

    };

    const toggleDropdown = (postId) => {
        setDropdownVisible(dropdownVisible === postId ? null : postId);
    };

    const maplocation = (postId,latitude,longitude) =>{
        navigation.navigate("Map", { 
            mode: 'viewing' ,
            postLocation: {latitude: latitude,longitude: longitude}
        })
    }
    return(
        <SafeAreaView style = {styles.safeContainer}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            
            <ScrollView style = {styles.scrollView} showsVerticalScrollIndicator={false}>
                {post.map((post) => {
                    return (
                        <TouchableOpacity
                            style={styles.postBox}
                            key = {post.id}
                            onPress={() => maplocation(post.id,post.latitude,post.longitude)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.imageContainer}>
                                <Image 
                                    source = {{uri:post.image_path}}
                                    style={styles.postImage}
                                />
                                {role === "Admin" ? (
                                    <TouchableOpacity
                                    style={[
                                        styles.statusDropdown,
                                        (post[post.id] || post.status) === 'Complete' && styles.statusDropdownComplete
                                    ]}
                                    onPress={() => toggleDropdown(post.id)}
                                >
                                    <Text style={[
                                        styles.statusText,
                                        (post[post.id] || post.status) === 'Complete' && styles.statusTextComplete
                                    ]}>{post[post.id] || post.status}</Text>
                                    <Text style={[
                                        styles.dropdownArrow,
                                        (post[post.id] || post.status) === 'Complete' && styles.dropdownArrowComplete
                                    ]}>▼</Text>
                                </TouchableOpacity>
                                ):(
                                    <Text style={[
                                        styles.statusDropdown,
                                        (post[post.id] || post.status) === 'Complete' && styles.statusTextComplete
                                    ]}>{post[post.id] || post.status}</Text>
                                )}
                            </View>
                            
                            <View style={styles.postContent}>
                                <Text style = {styles.damageType}>Damage Type: {post.Severity_Damage}</Text>
                                <Text style = {styles.recommendation}>Severity: {post.Severity}</Text>
                                <Text style = {styles.recommendation}>Recommendation Repair:  
                                    {Array.isArray(JSON.parse(post.recommendation_repair)) &&
                                    JSON.parse(post.recommendation_repair).map((item, index) => (
                                    <Text key={index} style={styles.recommendation}> {item}, </Text>
                                    ))
                                }</Text>
                                <Text style = {styles.recommendation}>Possible Cause:
                                    {Array.isArray(JSON.parse(post.possible_cause)) &&
                                    JSON.parse(post.possible_cause).map((item,index) => (
                                        <Text key = {index} style = {styles.recommendation}> {item}, </Text>
                                    ))}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Status Dropdown Modal */}
            <Modal
                visible={dropdownVisible !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDropdownVisible(null)}
                >
                    <View style={styles.dropdownOptions}>
                        <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={() => handleStatusChange(dropdownVisible,'In Progress')}
                        >
                            <Text style={styles.dropdownOptionText}>In Progress</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={() => handleStatusChange(dropdownVisible,'Complete')}
                        >
                            <Text style={styles.dropdownOptionText}>Complete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Upload Button - Upper Left Corner */}
            <TouchableOpacity
                style={styles.uploadButtonFloating}
                onPress={() => navigation.navigate("Upload")}
            >
                <Text style={styles.uploadButtonText}>+</Text>
            </TouchableOpacity>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavigation}>
                {/* Logout Button - Bottom Left (Icon Only) */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => logout()}
                >
                    <Text style={styles.logoutButtonText}>{"<"}</Text>
                </TouchableOpacity>

                {/* Camera Button - Bottom Middle */}
                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => navigation.navigate("Camera")}
                >
                    <Text style={styles.bottomButtonText}>📷 Camera</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer:{
        flex:1,
        backgroundColor: colors.background,
    },
    scrollView:{
        flex: 1,
        padding: 15,
        paddingTop: 20,
    },
    postBox:{
        backgroundColor: colors.surface,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    postImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    statusDropdown: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#FFD700', // Yellow background
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: '#000000', // Black text for better contrast on yellow
        fontSize: 12,
        fontWeight: '600',
    },
    dropdownArrow: {
        color: '#000000',
        fontSize: 10,
        marginLeft: 5,
    },
    statusDropdownComplete: {
        backgroundColor: '#4CAF50', // Green background for Complete status
    },
    statusTextComplete: {
        color: '#FFFFFF', // White text for better contrast on green
    },
    dropdownArrowComplete: {
        color: '#FFFFFF', // White arrow for green background
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownOptions: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 10,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    dropdownOption: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownOptionText: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
    },
    postContent: {
        padding: 20,
    },
    damageType: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    recommendation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 6,
        lineHeight: 20,
    },
    possibleCause: {
        fontSize: 14,
        color: colors.textLight,
        lineHeight: 20,
    },
    // Floating Upload Button - Upper Left Corner
    uploadButtonFloating: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.secondary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    uploadButtonText: {
        color: colors.surface,
        fontSize: 24,
        fontWeight: 'bold',
    },

    // Bottom Navigation
    bottomNavigation: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    bottomButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cameraButton: {
        backgroundColor: colors.primaryLight,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButton: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 8, // Square with slightly rounded corners
        backgroundColor: '#FF4444', // Red background
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF4444',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    logoutButtonText: {
        color: '#FFFFFF', // White text
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomButtonText: {
        color: colors.surface,
        fontSize: 12,
        fontWeight: '600',
    },
})
