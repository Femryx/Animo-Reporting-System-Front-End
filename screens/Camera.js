import { View, Text, StyleSheet, Button, Modal, Pressable, Switch, TextInput, TouchableOpacity} from "react-native";
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import Box from "../components/Box"
import CameraScreen from "../components/Camera_screen"
import { colors } from '../colors';

const Seperator = () => <View style = {styles.seperator}/>;

export default function Camera({navigation}){
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [predicted, setpredicted] = useState({});
    const formdata = new FormData()
    //For geolocation variable:
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    //for storing in the database
    const [latitude,setlatitude] = useState();
    const [longitude, setlongitude] = useState();
    const [photolink,setPhotolink] = useState();

    //if the predictions is invalid
    const get_all_information = async()=>{

    }

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
    const get_predictions = () =>{
        fetch('http://192.168.198.213:5000/api/get_predictions',
            {
                method:'POST',
                headers:{
                    'Content-Type': 'multipart/form-data',
                },
                body:formdata,
            }
        )
        .then(response => response.json())
        .then(json =>{
            setpredicted(json)
        })
        .catch(error =>{
            console.log(error)
        })
    }

    //This handles the predictions with geolocaiton
    //User take pic
    const handlePhotoTaken = async(photo) => {
        //Confirmation Button
        setIsModalVisible(true);
        const photo_link = photo.uri;
        setPhotolink(photo_link);
        const split_photo = photo_link.split('/');
        const filename = split_photo[split_photo.length-1];
        console.log(filename)
        formdata.append('image',
           {
            uri: photo.uri,
            name:filename,
            type:'image/jpg'
           }
        )
        get_predictions();
        await get_geolocation();
      };
    

    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setErrorMsg('Permission to access location was denied');
              return;
            }
          }
      
        getCurrentLocation();
        console.log(location)
    },[]);
    return(
    <View style={{ flex: 1 }}>
      <CameraScreen onPhotoTaken={handlePhotoTaken}/>

        {/*Modal for the prediction*/}
    <Modal 
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="slide">
        <View style = {styles.modalContainer}>
            <View style = {styles.popUp}>
                <View style = {styles.popUpElements}>
                    <View style = {styles.pictureBox}></View>
                    
                    <View style={styles.predictionContainer}>
                        <Text style = {styles.modelTitle}>Prediction: {predicted.result}</Text>
                        <Text style = {styles.modelSubtitle}>Confidence: {predicted.result}</Text>
                        <Text style = {styles.modelSubtitle}>Severity: {predicted.result}</Text>
                        <Text style = {styles.modelSubtitle}>Cost of repair: {predicted.result}</Text>
                    </View>
                    
                    <Text style = {styles.confirmationText}>Is the Prediction Correct?</Text>
                </View>
                
                <Seperator/>
                
                <View style = {styles.fixButtons}>
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
})