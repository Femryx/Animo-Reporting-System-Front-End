import { View, Text, StyleSheet, Button,  VirtualizedList, ScrollView, StatusBar, Image, Pressable, TouchableOpacity, Modal} from "react-native";
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { colors } from '../colors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function HomeScreen( {navigation}){
    const [post,setpost] = useState([])
    const [role_account,setRole] = useState()
    const [dropdownVisible, setDropdownVisible] = useState(null)
    const [modelConfirmation, setmodelConfirmation] = useState(false)
    const [postdelete,setpostdelete] = useState(0);
    const [instructtion,setInstruction] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [proofModalVisible, setProofModalVisible] = useState(false);
    const [selectedProofImage, setSelectedProofImage] = useState(null);
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
        const fetchBackendIP = async () => {
            const ip = await AsyncStorage.getItem('backendIP');
            if (ip) setBackendIP(ip);
        };
        fetchBackendIP();
    },[])

        const handleStatusChange = async (postId, newStatus) => {
        try {
            const formData = new FormData();
            formData.append("id", postId);
            formData.append("status", newStatus);

            if (newStatus === "Complete") {
                
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                    alert("Permission to access photos is required!");
                    return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 1,
                });

                if (result.canceled) return;

                const img = result.assets[0];

                formData.append("complete_image", {
                    uri: img.uri,
                    type: "image/jpeg",
                    name: img.fileName,
                });
            }

            const response = await fetch("http://192.168.5.108:5000/api/statuschange", { 
                method: "POST",
                headers: { "Content-Type": "multipart/form-data" },
                body: formData,
            });

            const json = await response.json();
            console.log("SUCCESS:", json);
            setDropdownVisible(null);
            get_post();
        } catch (error) {
            console.log("ERROR:", error);
        }
    };

    const deleting_post = async (postId, confirm) => {
        if (!confirm) {
            setmodelConfirmation(false);
            return;
        }

        try {
            const response = await fetch('http://192.168.5.108:5000/api/delete_post', {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id:postId}),
            });

            // Check if response is JSON
            const text = await response.text(); // get raw text
            try {
                const json = JSON.parse(text);
                console.log(json);
            } catch {
                console.log("Server returned non-JSON:", text);
            }

        } catch (error) {
            console.log("Fetch error:", error);
        }

        setmodelConfirmation(false);
        get_post();
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={proofModalVisible}
                onRequestClose={() => setProofModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Image
                            source={{ uri: selectedProofImage }}
                            style={styles.proofImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setProofModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                transparent={true}
                visible={instructtion}
                animationType="fade"
                onRequestClose={() => setInstruction(false)}
            >
                <View style={styles.instructionOverlay}>
                    <View style={styles.instructionBox}>
                        <Text style={styles.instructionTitle}>📘 Instruction Guide</Text>

                        <View style={styles.instructionSection}>
                            <Text style={styles.instructionItem}>
                                ➕ <Text style={styles.highlight}>“+” Button</Text> — Upload a photo and locate the damage on the map.
                            </Text>
                            <Text style={styles.instructionItem}>
                                📷 <Text style={styles.highlight}>Camera Button</Text> — Take a photo of the damage (auto-geotagged).
                            </Text>
                        </View>

                        {role_account === "Admin" && (
                            <>
                                <View style={styles.instructionNoteBox}>
                                    <Text style={styles.instructionNoteTitle}>💡 Additional Note (Admin): </Text>
                                    <Text style={styles.instructionNote}>Once completed you will upload a proof of image that the damage was fixed.</Text>
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.instructionButton}
                            onPress={() => setInstruction(false)}
                        >
                            <Text style={styles.instructionButtonText}>Got it!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView 
            style = {styles.scrollView}
            contentContainerStyle = {{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}>
            <View style={styles.filterContainer}>
                {["All", "In Progress", "Complete"].map((status) => (
                    <TouchableOpacity
                    key={status}
                    style={[
                        styles.filterButton,
                        statusFilter === status && styles.filterButtonActive
                    ]}
                    onPress={() => setStatusFilter(status)}
                    >
                    <Text
                        style={[
                        styles.filterButtonText,
                        statusFilter === status && styles.filterButtonTextActive
                        ]}
                    >
                        {status}
                    </Text>
                    </TouchableOpacity>
                ))}
            </View>
                {post
                    .filter(p => statusFilter === "All" || (p.status === statusFilter))
                    .map((post) => {
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
                                {role_account === "Admin" ? (
                                post.status === "Complete" && post.link_complete ? (
                                        <TouchableOpacity 
                                            style={[styles.statusDropdown, styles.statusDropdownComplete]} 
                                        >
                                            <Text style={[styles.statusTextComplete]}>Complete</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={[styles.statusDropdown, post.status === 'Complete' && styles.statusDropdownComplete]} onPress={() => toggleDropdown(post.id)}>
                                            <Text style={[styles.statusText, post.status === 'Complete' && styles.statusTextComplete]}>{post.status}</Text>
                                            <Text style={[styles.dropdownArrow, post.status === 'Complete' && styles.dropdownArrowComplete]}>▼</Text>
                                        </TouchableOpacity>
                                    )
                                ) : (
                                    <Text style={[styles.statusDropdown, post.status === 'Complete' && styles.statusDropdownComplete]}>{post.status}</Text>
                                )}
                            </View>
                            <View style={styles.postContent}>
                                <Text style={styles.damageType}>Damage Type: {post.Severity_Damage}</Text>
                                <Text style={styles.recommendation}>Severity: {post.Severity}</Text>

                                {role_account === "Admin" && (
                                    <Text style={styles.recommendation}>Who will take action: {post.role_action}</Text>
                                )}

                                <Text style={styles.recommendation}>
                                    Recommendation Repair:
                                    {/* {Array.isArray(JSON.parse(post.recommendation_repair)) &&
                                        JSON.parse(post.recommendation_repair).map((item, index) => ( */}
                                            <Text style={styles.recommendation}> {post.recommendation_repair} </Text>
                                        {/* // ))} */}
                                </Text>

                                <Text style={styles.recommendation}>
                                    Possible Effect:
                                    {/* {Array.isArray(JSON.parse(post.possible_cause)) &&
                                        JSON.parse(post.possible_cause).map((item, index) => ( */}
                                            <Text style={styles.recommendation}> {post.possible_cause}</Text>
                                        {/* ))} */}
                                </Text>
                                {post.status === "Complete" && post.link_complete && (
                                    <TouchableOpacity
                                        style={styles.viewProofButton}
                                        onPress={() => {
                                            setSelectedProofImage(post.link_complete);
                                            setProofModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.viewProofText}>📷 View Proof</Text>
                                    </TouchableOpacity>
                                )}
                                {role_account === "Admin" && (
                                    <TouchableOpacity
                                        style={styles.submitButton}
                                        onPress={() => {
                                            setpostdelete(post.id);
                                            setmodelConfirmation(true);
                                        }}
                                    >
                                        <Text style={styles.submitButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                )}
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

            <Modal
                visible={modelConfirmation}
                transparent={true} // Makes the background slightly dark
                onRequestClose={() => setmodelConfirmation(false)}
                animationType="slide"
                >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Are you sure you want to delete this post?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                            style={[styles.button, styles.yesButton]}
                            onPress={() => deleting_post(postdelete,true)}
                            >
                            <Text style={styles.buttonText}>Yes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                            style={[styles.button, styles.noButton]}
                            onPress={() => deleting_post(postdelete,false)}
                            >
                            <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        bottom: 80,   // just above your bottom navigation
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
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
        submitSection: {
        marginTop: 20,
        marginBottom: 30,
    },
    submitButton: {
        backgroundColor: 'red',
        borderRadius: 15,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.primaryLight,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonText: {
        color: colors.surface,
        fontSize: 18,
        fontWeight: '600',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
    },
    modalContainer: {
        width: 300,
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    yesButton: {
        backgroundColor: 'red',
    },
    noButton: {
        backgroundColor: 'gray',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    instructionOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 20,
        },

    instructionBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },

    instructionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.primary,
        alignSelf: "center",
        marginBottom: 15,
    },

    instructionSection: {
        marginBottom: 20,
    },

    instructionItem: {
        fontSize: 15,
        color: colors.text,
        marginBottom: 10,
        lineHeight: 22,
    },

    highlight: {
        fontWeight: "bold",
        color: colors.secondary,
    },

    instructionNoteBox: {
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },

    instructionNoteTitle: {
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
        fontSize: 15,
    },
    instructionNote: {
        color: "#fff",
        fontSize: 14,
        lineHeight: 20,
    },
    instructionButton: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 30,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },

    instructionButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterButtonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    filterButtonTextActive: {
        color: colors.surface,
    },
    proofImage: 
    { 
        width: 300, 
        height: 300, 
        borderRadius: 10, 
        marginBottom: 20 
    },
    closeButton: { 
        backgroundColor: '#FF3333', 
        paddingVertical: 10, 
        paddingHorizontal: 20, 
        borderRadius: 10 
    },
    closeButtonText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        textAlign: 'center' },
    viewProofButton: { 
        backgroundColor: '#0066FF', 
        padding: 10, 
        borderRadius: 15, 
        marginVertical: 10 },
    viewProofText: { 
        color: '#fff', 
        fontWeight: '600', 
        textAlign: 'center' },
})
