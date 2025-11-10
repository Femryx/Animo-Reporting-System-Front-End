import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Modal,
    Button
} from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { colors } from '../colors';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Separator = () => <View style={styles.separator}/>;

const Upload = ({navigation}) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageInfo, setImageInfo] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    //Information for the passing if ever it is false or true
    const [prediction,setprediction] = useState("");
    const [severity,setSeverity] = useState("");
    const [confidence,setConfidence] = useState(0);
    const [severityscore, setSeverityScore] = useState(0);
    const [highlightimage,sethighlightimage] = useState();
    //Image
    const formdata = new FormData()

    const get_highlights_image = async(image_url)=>{
        console.log("Sample1")
        const base64Image = await FileSystem.readAsStringAsync(image_url, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const response = await fetch('https://serverless.roboflow.com/projects-lkhtb/workflows/detect-count-and-visualize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: 'DWFToNzm6BYOFx31CvMx',
                inputs: {
                    image: {
                        type: "base64",
                        value: base64Image
                    }
                }
            })
        });
        const result = await response.json();
        sethighlightimage(result.outputs[0].output_image.value);
        console.log(result)
        console.log('done')
    }

    // Request permissions for accessing media library
    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera roll permissions to select images!',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Select image from gallery
    const selectImage = async () => {
        const hasPermission = await requestPermissions();
        
        if (!hasPermission) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setSelectedImage(asset.uri);
            setImageInfo({
                width: asset.width,
                height: asset.height,
                fileSize: asset.fileSize,
                fileName: asset.fileName || 'image.jpg'
            });
        };
    }
    const get_predictions = async() =>{
        formdata.append('image', {
        uri: selectedImage,
        type: 'image/jpg',
        name: imageInfo?.fileName || 'image.jpg',
        });

        const response = await fetch('https://thesisprojectbackendserver-production.up.railway.app/api/get_predictions',
            {
                method:'POST',
                headers:{
                    'Content-Type': 'multipart/form-data',
                },
                body:formdata,
            }
        );
        const json = await response.json();
        setprediction(json.result);
        setConfidence(json.score);
        setSeverity(json.severity);
        setSeverityScore(json.severity_score);
        return json;
    }
    // Upload image function - now shows modal instead of direct upload
    const uploadImage = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please select an image first!');
            return;
        }
        const json = await get_predictions();
        get_highlights_image(selectedImage);
        // Show modal for prediction/confirmation
        if (json.result){
            setIsModalVisible(true);
        }
    };

    const passing_data = async(correct)=>{
        try{
            const temppath = FileSystem.documentDirectory + imageInfo?.fileName

            //Copying
            await FileSystem.copyAsync({
                from: selectedImage,
                to: temppath,
            })

            //filename
            const fileName_link = imageInfo?.fileName

            const token = await AsyncStorage.getItem('jwt');
            navigation.navigate("Map",{
                token,
                prediction,
                severity,
                temppath,
                fileName_link,
                mode: "pinpoint",
                correct
            })
        }catch(err){
            console.log(err)
        }
    }
    // Clear selected image
    const clearImage = () => {
        setSelectedImage(null);
        sethighlightimage(null);
        setImageInfo(null);
        setprediction("");
        setConfidence(0);
        setSeverity("");
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <View style={styles.content}>
                <Text style={styles.title}>Upload Image</Text>
                <Text style={styles.subtitle}>Select an image for damage assessment</Text>
                
                <View style={styles.imageContainer}>
                    {selectedImage ? (
                        <>
                            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                            {imageInfo && (
                                <Text style={styles.imageInfo}>
                                    {imageInfo.fileName} • {imageInfo.width}×{imageInfo.height} • 
                                    {imageInfo.fileSize ? ` ${Math.round(imageInfo.fileSize / 1024)}KB` : ''}
                                </Text>
                            )}
                            <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
                                <Text style={styles.clearButtonText}>🗑️ Remove Image</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Text style={styles.placeholderIcon}>📷</Text>
                            <Text style={styles.placeholderText}>
                                No image selected{'\n'}Tap "Select from Gallery" to choose an image
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity 
                    style={[styles.button, styles.selectButton]} 
                    onPress={selectImage}
                    disabled={uploading}
                >
                    <Text style={styles.buttonText}>📁 Select from Gallery</Text>
                </TouchableOpacity>

                {selectedImage && (
                    <TouchableOpacity 
                        style={[styles.button, styles.uploadButton]} 
                        onPress={uploadImage}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color={colors.surface} />
                        ) : (
                            <Text style={styles.buttonText}>🚀 Upload Image</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/*Modal for the prediction*/}
            <Modal 
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.popUp}>
                        <View style={styles.popUpElements}>
                            <View style={styles.pictureBox}>
                                {highlightimage ? (
                                    <Image source={{ uri: `data:image/jpeg;base64,${highlightimage}` }} style={styles.modalImage} />
                                ):(
                                    <Text style = {styles.pictureBox}>Loading image...</Text> // optional placeholder
                                )}
                            </View>
                            <View style={styles.predictionContainer}>
                                <Text style={styles.modelTitle}>Prediction: {prediction}</Text>
                                <Text style={styles.modelSubtitle}>Severity: {severity}</Text>
                                <Text style={styles.modelSubtitle}>Severity Score: {Math.round(severityscore)}%</Text>
                                <Text style={styles.modelSubtitle}>Confidence: {Math.round(confidence)}%</Text>
                            </View>
                            <Text style={styles.confirmationText}>Is the Prediction Correct?</Text>
                        </View>
                        
                        <Separator/>
                        
                        <View style={styles.fixButtons}>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.yesButton]}
                                onPress={async() => 
                                    {
                                        setIsModalVisible(false),
                                        clearImage(),
                                        passing_data('Yes')
                                    }
                                }
                            >
                                <Text style={styles.confirmButtonText}>✓ Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.noButton]}
                                onPress={() => 
                                    {
                                        setIsModalVisible(false),
                                        clearImage(),
                                        passing_data('No')
                                    }   
                                }
                            >
                                <Text style={styles.confirmButtonText}>✗ No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Upload;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    selectedImage: {
        width: 300,
        height: 300,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    imageInfo: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 15,
        textAlign: 'center',
    },
    placeholderContainer: {
        width: 300,
        height: 300,
        borderWidth: 3,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: colors.surface,
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: 15,
    },
    placeholderText: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    selectButton: {
        backgroundColor: colors.primaryLight,
    },
    uploadButton: {
        backgroundColor: colors.success,
    },
    buttonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: colors.error,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    clearButtonText: {
        color: colors.surface,
        fontSize: 14,
        fontWeight: '500',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    separator: {
        marginVertical: 20,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
    },
    popUp: {
        backgroundColor: colors.surface,
        borderRadius: 25,
        padding: 30,
        margin: 20,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
    popUpElements: {
        alignItems: 'center',
    },
    pictureBox: {
        width: 300,
        height: 300,
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    modalImage: {
        width: 280,
        height: 280,
        borderRadius: 15,
    },
    predictionContainer: {
        width: '100%',
        marginBottom: 20,
    },
    modelTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    modelSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 6,
        textAlign: 'center',
    },
    confirmationText: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
        textAlign: 'center',
        marginTop: 10,
    },
    fixButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginHorizontal: 10,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    yesButton: {
        backgroundColor: colors.success,
    },
    noButton: {
        backgroundColor: colors.error,
    },
    confirmButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});