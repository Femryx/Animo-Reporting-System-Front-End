import React, { useState } from 'react';
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

const Separator = () => <View style={styles.separator}/>;

const Upload = ({navigation}) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageInfo, setImageInfo] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [predicted, setPredicted] = useState({});

    //If the predictions is correct sending it to the database
    const post_database_data = async()=>{

        const split_photo = photolink.split('/');
        const filename = split_photo[split_photo.length-1];
        formdata.append('image',
           {
            uri: photolink,
            name:filename,
            type:'image/jpg'
           }
        )
        
        formdata.append('result',predicted.result)
        formdata.append('longitude',longitude)
        formdata.append('latitude',latitude)
        console.log(formdata)
        try{
            const response = await fetch('http://192.168.82.213:5000/api/store_the_post',
            {
                method:'POST',
                body:formdata
            }
        )
            const message = await response.json();
            console.log(message.message)
        }catch(error){
            console.log(error)
        }
        navigation.navigate("Home")
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
        }
    };

    // Upload image function - now shows modal instead of direct upload
    const uploadImage = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please select an image first!');
            return;
        }

        // Show modal for prediction/confirmation
        setIsModalVisible(true);
        
        // Simulate getting predictions (you can replace this with actual API call)
        setPredicted({
            result: 'Sample Prediction',
            confidence: '85%',
            severity: 'Medium',
            cost: '$150'
        });
    };

    // Handle prediction confirmation
    const handlePredictionConfirm = async () => {
        setUploading(true);
        setIsModalVisible(false);
        
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('image', {
                uri: selectedImage,
                type: 'image/jpeg',
                name: imageInfo?.fileName || 'image.jpg',
            });

            //upload to your server
            //simulate an upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            Alert.alert(
                'Success!',
                'Image uploaded successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setSelectedImage(null);
                            setImageInfo(null);
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    // Clear selected image
    const clearImage = () => {
        setSelectedImage(null);
        setImageInfo(null);
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
                                {selectedImage && (
                                    <Image source={{ uri: selectedImage }} style={styles.modalImage} />
                                )}
                            </View>
                            
                            <View style={styles.predictionContainer}>
                                <Text style={styles.modelTitle}>Prediction: {predicted.result}</Text>
                                <Text style={styles.modelSubtitle}>Confidence: {predicted.confidence}</Text>
                                <Text style={styles.modelSubtitle}>Severity: {predicted.severity}</Text>
                                <Text style={styles.modelSubtitle}>Cost of repair: {predicted.cost}</Text>
                            </View>
                            
                            <Text style={styles.confirmationText}>Is the Prediction Correct?</Text>
                        </View>
                        
                        <Separator/>
                        
                        <View style={styles.fixButtons}>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.yesButton]}
                                onPress={async() => 
                                    await post_database_data()
                                }
                            >
                                <Text style={styles.confirmButtonText}>✓ Yes</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.noButton]}
                                onPress={() => 
                                    navigation.navigate("Confirmation")}
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