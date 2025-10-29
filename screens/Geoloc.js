import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { colors } from '../colors';
import Constants from 'expo-constants';

export default function MapScreen({ navigation, route }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [mode, setMode] = useState('pinpoint'); // Default mode is pinpoint

    // Get mode from navigation params
    useEffect(() => {
        if (route.params?.mode) {
            setMode(route.params.mode);
        }
    }, [route.params?.mode]);

    // Get API key for Google Maps
    const googleMapsApiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
    const useGoogleMaps = googleMapsApiKey && googleMapsApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

    const handleMapPress = (event) => {
        // Only allow map interaction in pinpoint mode
        if (mode === 'pinpoint') {
            const { coordinate } = event.nativeEvent;
            setSelectedLocation(coordinate);
        }
    };

    const handleSubmitLocation = () => {
        if (selectedLocation && mode === 'pinpoint') {
            // Here you would typically save the location data
            // For now, just navigate back to home
            navigation.navigate("Home");
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={useGoogleMaps ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                showsUserLocation
                showsMyLocationButton
                onPress={handleMapPress}
                scrollEnabled={mode === 'pinpoint'} // Disable scrolling in viewing mode
                zoomEnabled={mode === 'pinpoint'}   // Disable zoom in viewing mode
                rotateEnabled={mode === 'pinpoint'} // Disable rotation in viewing mode
                apiKey={useGoogleMaps ? googleMapsApiKey : undefined}
            >
                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation}
                        title="Damage Location"
                        description={mode === 'pinpoint' ? "Tap to confirm this location" : "Damage location"}
                    />
                )}
            </MapView>

            {/* Back Button - Always visible */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            {/* Instructions - Only shown in pinpoint mode */}
            {mode === 'pinpoint' && (
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>
                        Tap on the map to pinpoint the damage location
                    </Text>
                </View>
            )}

            {/* Submit Button - Only in pinpoint mode */}
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
                        <Text style={[
                            styles.submitButtonText,
                            !selectedLocation && styles.submitButtonTextDisabled
                        ]}>
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
    top: 50,
    left: 20,
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
