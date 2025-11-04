import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker } from 'react-native-maps';
// import { LeafletView } from 'react-native-leaflet-view';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../colors';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

export default function MapScreen({ navigation, route }) {
    const [selectedLocation, setSelectedLocation] = useState(
      route.params?.postLocation || null
    );
    const {token, prediction, severity, temppath, fileName_link, mode_notuse, correct} = route.params
    const [mode, setMode] = useState('pinpoint'); // Default mode is pinpoint

    // Get mode from navigation params
    useEffect(() => {
        if (route.params?.mode) {
            setMode(route.params.mode);
        }
    }, [route.params?.mode]);

    //X and y of the De Lasalle University Dasmarinas
    const defaultCenter = [14.324247,120.958614]

    const mapCenter = selectedLocation
      ? [selectedLocation.latitude, selectedLocation.longitude]
      : defaultCenter;
      
    //If the predictions is correct sending it to the database
    const post_database_data = async()=>{
        const formdata = new FormData()
        console.log('Formdata Created!')

        formdata.append('token',token)
        formdata.append('result',prediction)
        formdata.append('severity',severity)
        formdata.append('longitude',selectedLocation.longitude)
        formdata.append('latitude',selectedLocation.latitude)
        formdata.append('image',
             {
                uri: temppath,
                name: fileName_link,
                type:'image/jpg'
           }
        )
        console.log(formdata)
        try{
            const response = await fetch('https://back-end-server-v8fv.onrender.com/api/store_the_post',
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
    }

    const handleMapPress = (event) => {
      if (mode === 'pinpoint') {
        // LeafletView gives event with lat/lng
        const { lat, lng } = event;
        setSelectedLocation({ latitude: lat, longitude: lng });
      }
    };

    //Modify for the Yes or no
    const handleSubmitLocation = async() => {
        if (mode === 'pinpoint' && selectedLocation) {
          if (correct === "Yes"){
            await post_database_data()
            await FileSystem.deleteAsync(temppath,{idempotent:true})
            console.log("temporary file has been deleted and posted to the database!")
            navigation.navigate("Home")
          }else if(correct === "No"){
            const longitude = selectedLocation.longitude
            const latitude = selectedLocation.latitude
            navigation.navigate("Confirmation", { 
              token,
              temppath,
              fileName_link,
              longitude,
              latitude
            })
          }
          ;
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
          <WebView
            originWhitelist={['*']}
            source={{ html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
                <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
              </head>
              <body>
                <div id="map"></div>
                <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
                <script>
                  const map = L.map('map').setView([${mapCenter[0]}, ${mapCenter[1]}], 25);
                  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                  }).addTo(map);

                  let marker;
                  ${selectedLocation ? `marker = L.marker([${selectedLocation.latitude}, ${selectedLocation.longitude}]).addTo(map);` : ''}

                  map.on('click', function(e){
                    window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: e.latlng.lat, longitude: e.latlng.lng }));
                  });
                </script>
              </body>
              </html>
            `}}

          onMessage={(event) => {
              const { latitude, longitude } = JSON.parse(event.nativeEvent.data);
              handleMapPress({ lat: latitude, lng: longitude });
            }}
            style={{ flex: 1 }}
          />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Instructions */}
          {mode === 'pinpoint' && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Tap on the map to pinpoint the damage location
              </Text>
            </View>
          )}

          {/* Submit Button */}
          {mode === 'pinpoint' && (
            <View style={styles.submitContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !selectedLocation && styles.submitButtonDisabled
                ]}
                onPress={handleSubmitLocation}
                disabled={!selectedLocation}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    !selectedLocation && styles.submitButtonTextDisabled
                  ]}
                >
                  ✅ Confirm Location
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionsText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  submitButton: {
    backgroundColor: colors.primaryLight,
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
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: colors.textLight,
  },
  backButton: {
    position: 'absolute',
    top: 85,
    left: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  backButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
