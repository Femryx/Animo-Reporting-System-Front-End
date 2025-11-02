import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker } from 'react-native-maps';
// import { LeafletView } from 'react-native-leaflet-view';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../colors';
import Constants from 'expo-constants';

export default function MapScreen({ navigation, route }) {
    const [selectedLocation, setSelectedLocation] = useState(
      route.params?.postLocation || null
    );
    const [mode, setMode] = useState('pinpoint'); // Default mode is pinpoint

    // Get mode from navigation params
    useEffect(() => {
        if (route.params?.mode) {
            setMode(route.params.mode);
        }
    }, [route.params?.mode]);

    const defaultCenter = [14.324247,120.958614]

    const mapCenter = selectedLocation
      ? [selectedLocation.latitude, selectedLocation.longitude]
      : defaultCenter;
      
    const handleMapPress = (event) => {
      if (mode === 'pinpoint') {
        // LeafletView gives event with lat/lng
        const { lat, lng } = event;
        setSelectedLocation({ latitude: lat, longitude: lng });
      }
    };

    const handleSubmitLocation = () => {
        if (mode === 'pinpoint' && selectedLocation) {
          navigation.navigate("Confirmation", { selectedLocation });
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
