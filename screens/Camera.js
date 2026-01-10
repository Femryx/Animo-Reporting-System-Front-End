import { View, Text, StyleSheet, Button, Modal, Pressable, Switch, TextInput, TouchableOpacity, Image} from "react-native";
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import Box from "../components/Box"
import CameraScreen from "../components/Camera_screen"
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { colors } from '../colors';
import { ActivityIndicator } from "react-native";
import * as ImageManipulator from 'expo-image-manipulator';

const Seperator = () => <View style = {styles.seperator}/>;

export default function Camera({navigation}){
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [predicted, setpredicted] = useState();
    const [confidencescore, setConfidencescore] = useState(0);
    const [severity,setSeverity] = useState("");
    const [severityscore, setSeverityscore] = useState(0);
    const predictionformdata = new FormData()
    //For geolocation variable:
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    //for storing in the database
    const [latitude,setlatitude] = useState();
    const [longitude, setlongitude] = useState();
    const [photolink,setPhotolink] = useState();
    const [filename_link,setFilename] = useState();
    //for highlights image
    const [highlightimage,sethighlightimage] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const get_highlights_image = async(image_url)=>{
        console.log("Sample1")
        const manipulated = await ImageManipulator.manipulateAsync(
            image_url,
            [{ resize: { width: 640 } }], // reduces size to 640px wide
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        const base64Image = await FileSystem.readAsStringAsync(manipulated.uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        // console.log(base64Image)
        console.log('sample2')
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
        console.log('sample3')
        const result = await response.json();
        sethighlightimage(result.outputs[0].output_image.value);
        // console.log(result)
        // console.log(result);
        console.log('done')
    }

    //if the predictions is invalid
    // const get_all_information = async()=>{
    //     try{
    //         //Creating a temp file
    //         const temppath = FileSystem.documentDirectory + filename_link;

    //         //Copying
    //         await FileSystem.copyAsync({
    //             from: photolink,
    //             to: temppath,
    //         });
    //         const token = await AsyncStorage.getItem('jwt');

    //         navigation.navigate("Confirmation",{
    //             token,
    //             temppath,
    //             filename_link,
    //             longitude,
    //             latitude,
    //         });
    //         // Reset all relevant state
    //         setPhotolink(null);
    //         setFilename(null);
    //         setpredicted(null);
    //         setConfidencescore(0);
    //         setSeverity("");
    //         setSeverityscore(0);
    //         sethighlightimage(null);
    //         setIsModalVisible(false)
    //         // Clear the FormData if needed
    //         predictionformdata.delete?.('image'); // safe if FormData supports 
    //     }catch(err){
    //         console.log(err)
    //     }
    // }
    //If the predictions is correct sending it to the database
    const post_database_data = async()=>{
        console.log('something')
        const formdata = new FormData()
        console.log('Formdata Created!')
        // formdata.append('user_id',decoded_user_id.user_id);
        const token = await AsyncStorage.getItem('jwt')
        formdata.append('token',token)
        formdata.append('result',predicted)
        formdata.append('severity',severity)
        formdata.append('longitude',longitude)
        formdata.append('latitude',latitude)
        formdata.append('image',
             {
                uri: photolink,
                name: filename_link,
                type:'image/jpg'
           }
        )
        console.log(formdata)
        try{
            const response = await fetch('https://thesisprojectbackendserver-main-production.up.railway.app/api/store_the_post',
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
        // Reset all relevant state
        setPhotolink(null);
        setFilename(null);
        setpredicted(null);
        setConfidencescore(0);
        setSeverity("");
        setSeverityscore(0);
        sethighlightimage(null);

        // Clear the FormData if needed
        predictionformdata.delete?.('image'); // safe if FormData supports 
        setIsModalVisible(false)
        navigation.navigate("Home")
    }
    //Getting the location
    const get_geolocation = async()=>{
        let location = await Location.getCurrentPositionAsync({});
        latitude_location = location.coords.latitude
        longitutde_location = location.coords.longitude
        console.log(latitude_location)
        console.log(longitutde_location)
        //Store it to the variable
        setlatitude(latitude_location);
        setlongitude(longitutde_location);
    }
    //Getting the Predictions
    const get_predictions = async () =>{
        fetch('https://thesisprojectbackendserver-main-production.up.railway.app/api/get_predictions',
            {
                method:'POST',
                headers:{
                    'Content-Type': 'multipart/form-data',
                },
                body:predictionformdata,
            }
        )
        .then(response => response.json())
        .then(json =>{
            setpredicted(json.result);
            setConfidencescore(json.score);
            setSeverity(json.severity);
            setSeverityscore(json.severity_score)
        })
        .catch(error =>{
            console.log(error)
        })

    }
    //This handles the predictions with geolocaiton
    //User take pic
const handlePhotoTaken = async (photo) => {
    try {
        setIsLoading(true); 

        const photo_link = photo.uri;
        setPhotolink(photo_link);

        const split_photo = photo_link.split('/');
        const filename = split_photo[split_photo.length - 1];
        setFilename(filename);

        // Append photo to form data
        predictionformdata.append('image', {
            uri: photo.uri,
            name: filename,
            type: 'image/jpg',
        });
        await get_predictions()
        // Run all 3 async tasks
        await Promise.all([
            get_highlights_image(photo_link),
            get_geolocation(),
        ]);

        // When all done
        setIsModalVisible(true);
    } catch (err) {
        console.log("Error during photo processing:", err);
    } finally {
        setIsLoading(false);
    }
};

    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setErrorMsg('Permission to access location was denied');
              return;
            }
          }
        //   console.log(highlightimage)
        getCurrentLocation();
    },[]);
    return(
    <View style={{ flex: 1 }}>
        {isLoading && (
            <View style={styles.loadingOverlay}>
                <View style={styles.loadingBox}>
                    <Text style={styles.loadingText}>Analyzing image...</Text>
                </View>
            </View>
            )}
      <CameraScreen onPhotoTaken={handlePhotoTaken}/>
        {/*Modal for the prediction*/}
    <Modal 
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="slide">
        <View style = {styles.modalContainer}>
            <View style = {styles.popUp}>
                <View style = {styles.popUpElements}>
                    <View style = {styles.pictureBox}>
                        {highlightimage ? (
                            <Image
                            source={{ uri:`data:image/jpeg;base64,${highlightimage}`}}
                            style={styles.pictureBox}
                            resizeMode="contain"
                            />
                        ) : (
                            <Text style = {styles.pictureBox}>Loading image...</Text> // optional placeholder
                        )}
                    </View>
                    <View style={styles.predictionContainer}>
                        <Text style = {styles.modelTitle}>Prediction: {predicted}</Text>
                        <Text style = {styles.modelSubtitle}>Severity: {severity}</Text>
                        <Text style={styles.modelSubtitle}>Severity Score: {severityscore == null || isNaN(severityscore) ? 'Unknown' : `${Math.round(severityscore * 100)}%`}</Text>
                        <Text style={styles.modelSubtitle}>Probability: {Math.round(confidencescore * 100)}%</Text>
                    </View>
                    
                    {/* <Text style = {styles.confirmationText}>Is the Prediction Correct?</Text> */}
                </View>
                
                <Seperator/>
                
                <View style = {styles.fixButtons}>
                    <TouchableOpacity
                        style={[styles.confirmButton, styles.yesButton]}
                        onPress={async() => 
                            {
                                if (isSubmitting) return; // prevent double click
                                setIsSubmitting(true);    // show loading
                                await post_database_data();
                                setIsSubmitting(false);   // reset when done
                            }
                        }
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.confirmButtonText}>Submit Report</Text>
                        )}
                    </TouchableOpacity>
{/*                     
                    <TouchableOpacity
                        style={[styles.confirmButton, styles.noButton]}
                        onPress={() => 
                            get_all_information()}
                    >
                        <Text style={styles.confirmButtonText}>✗ No</Text>
                    </TouchableOpacity> */}
                </View>
                 <TouchableOpacity
                        style={[styles.retakebutton]}
                        onPress={() => 
                        {
                            // Reset all relevant state
                            setPhotolink(null);
                            setFilename(null);
                            setpredicted(null);
                            setConfidencescore(0);
                            setSeverity("");
                            setSeverityscore(0);
                            sethighlightimage(null);

                            // Clear the FormData if needed
                            predictionformdata.delete?.('image'); // safe if FormData supports delete

                            // Close the modal
                            setIsModalVisible(false);
                            }
                        }
                    >
                        <Text style={styles.confirmButtonText}>Retake Photo</Text>
                </TouchableOpacity>
            </View>
        </View>
        </Modal>
    </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pictureBox:{
        width: 300,
        height: 300,
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border,
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    seperator:{
        marginVertical: 20,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
    },
    addButton:{
        width:60,
        height:60,
        borderRadius:30,
        backgroundColor: colors.surface,
        borderWidth:3,
        borderColor: colors.border,
        position: 'relative',
        top: 280,
    },
    container:{
        flex:1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column-reverse",
    },
    text:{
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    popUp:{
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
    popUpElements:{
        alignItems: 'center',
    },
    predictionContainer: {
        width: '100%',
        marginBottom: 20,
    },
    modelTitle:{
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    modelSubtitle:{
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 6,
        textAlign: 'center',
    },
    confirmationText:{
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
        textAlign: 'center',
        marginTop: 10,
    },
    layout:{
        flexDirection: "row",
        justifyContent: 'flex-start',
        alignItems: "center",
        paddingHorizontal: 30,
    },
    input:{
        height: 40,
        margin: 12,
        borderWidth: 1,
    },
    fixButtons:{
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
    modalImage: {
        width: 300,
        height: 300,
        borderRadius: 8,
    },
    confirmationText_retake:{
        color: '#fff',          // white text
        fontSize: 16,           // slightly bigger
        fontWeight: '700',      // bolder for emphasis
        textAlign: 'center',
    },
    retake: {
        backgroundColor: 'blue'
    },
    retakebutton: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginHorizontal: 10,
        marginTop: 15,      // optional small margin
        marginBottom: 10,   // optional small margin     // reduced to fit nicely under the other buttons
        alignItems: 'center',
        backgroundColor: '#007BFF', // blue color
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingBox: {
        backgroundColor: colors.surface,
        paddingVertical: 25,
        paddingHorizontal: 40,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loadingText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },

})