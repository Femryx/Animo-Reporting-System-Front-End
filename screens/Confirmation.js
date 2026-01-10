import { View, Text, StyleSheet, Button, Modal, Pressable, Switch, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar} from "react-native";
import { SelectList } from 'react-native-dropdown-select-list'
import { useState, useEffect } from 'react';
import Label from '../Label.json';
import { colors } from '../colors';
import * as FileSystem from 'expo-file-system';
import { ActivityIndicator, Alert } from "react-native";

const Seperator = () => <View style = {styles.seperator}/>;
const Confirmation = ({route,navigation}) => {
    const {token, temppath, filename_link, longitude, latitude } = route.params;
    const [damage,setDamage] = useState([]);
    const [damagetype,setDamagetype] = useState("");
    const [possiblecause,setPossiblecause] = useState("");
    const [recommendation,setRecommendation] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // Severity level options
    const severityOptions = [
        {"key":"1", "value":"Minor"},
        {"key":"2", "value":"Moderate"},
        {"key":"3", "value":"Severe"}
    ];

    {/* for the dropdown list */}
    const [selected, setSelected] = useState("");
    const get_folder_name = async() =>{
        try{
            const response = await fetch('https://back-end-server-v8fv.onrender.com/api/get_folder_name',
                {
                    method:'GET',
                }
            );
            const folder = await response.json();
            const updated_list = [...folder.data,{key:"other",value:"Others"}];
            setDamage(updated_list)
        }catch(error){
            console.log(error)
        }
    }

    const generateRandomNumber_for_name = () => {
        const min = 1; // Minimum value
        const max = 10000000000; // Maximum value
        // Generate random number in the range [min, max]
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        return number
    };

    const sending_database = async() =>{
        if (isLoading) return;

        setIsLoading(true);
        const formdata = new FormData();
        //This is for known damage
        if(damagetype === "" && selected !== null && recommendation !== null && possiblecause !== null && selectedSeverity !== null){
            formdata.append('latitude', latitude)
            formdata.append('longitude',longitude)
            formdata.append('image',
                {
                    uri:temppath,
                    name:filename_link || `${generateRandomNumber_for_name()}.jpg`,
                    type:'image/jpg',
                }
            );
            formdata.append('token',token)
            formdata.append('severity',selectedSeverity)
            formdata.append('damage',selected)
            formdata.append('Recommendation',recommendation)
            formdata.append('possiblecause',possiblecause)
        //this part is the new data    
        }else if(damagetype !== null && selected === "Others" && recommendation !== null && possiblecause !== null && selectedSeverity !== null){
            formdata.append('latitude', latitude)
            formdata.append('longitude',longitude)
            formdata.append('image',
                {
                    uri:temppath,
                    name:filename_link || `${generateRandomNumber_for_name()}.jpg`,
                    type:'image/jpg'
                }
            )
            formdata.append('token',token)
            formdata.append('severity',selectedSeverity)
            formdata.append('damage',damagetype)
            formdata.append('Recommendation',recommendation)
            formdata.append('possiblecause',possiblecause)
        }else if(damagetype !== "" && selected !== ""){
            Alert.alert("Both Selected List Damage and Input Damage has value, Please Choose One");
            setIsLoading(false);
            return;
        }else if(recommendation == null || possiblecause == null || selectedSeverity == null){
            Alert.alert("Make sure to have Input!")
            setIsLoading(false);
            return;
        }
        console.log(formdata)
        console.log(temppath)
        //Sending it to the database
        try{
            const response = await fetch('https://back-end-server-v8fv.onrender.com/api/new_data',
                 {
                method: 'POST',
                body:formdata,
                }
            )
            const message = await response.json();
            console.log(message); 
        }catch(err){
            console.log(err)
        }
        await FileSystem.deleteAsync(temppath,{idempotent:true})
        console.log("temporary file has been deleted!")
        setIsLoading(false);
        navigation.navigate("Home");
    }
    useEffect(()=>{
        get_folder_name();
    },[])
    return(
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Manual Assessment</Text>
                    <Text style={styles.headerSubtitle}>Please provide damage details</Text>
                </View>

                <View style={styles.content}>
                    <Seperator/>

                    {/* Assessment Form */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📝 Assessment Details</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Label</Text>
                            <View style={styles.dropdownContainer}>
                                <SelectList
                                    setSelected={(val) => setSelected(val)} 
                                    data={damage} 
                                    save="value"
                                    boxStyles={styles.dropdownBox}
                                    inputStyles={styles.dropdownInput}
                                    dropdownStyles={styles.dropdownDropdown}
                                />
                            </View>
                        </View>
                        {selected === "Others" ? (
                            <>
                                <Text style={styles.label}>
                                    Damage Name (If damage isn't in the Label)
                                </Text>
                                <TextInput
                                    value = {damagetype}
                                    onChangeText = {setDamagetype} 
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Input what kind of damage...."
                                    placeholderTextColor={colors.textLight}
                                />
                            </>
                        ): null
                        }
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Enter severity</Text>
                            <View style={styles.dropdownContainer}>
                                <SelectList
                                    setSelected={(val) => setSelectedSeverity(val)}
                                    data={severityOptions}
                                    save="value"
                                    placeholder="Select severity level"
                                    boxStyles={styles.dropdownBox}
                                    inputStyles={styles.dropdownInput}
                                    dropdownStyles={styles.dropdownDropdown}
                                />
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Repair Recommendation (Required)</Text>
                            <TextInput
                                value = {recommendation}
                                onChangeText={setRecommendation}
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe recommended repair actions..."
                                placeholderTextColor={colors.textLight}
                                multiline={true}
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Possible Effect (Required)</Text>
                            <TextInput
                                value = {possiblecause}
                                onChangeText={setPossiblecause}
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe possible causes of the damage..."
                                placeholderTextColor={colors.textLight}
                                multiline={true}
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                    <Seperator/>
                    {/* Submit Button */}
                    <View style={styles.submitSection}>
                        <View style={styles.submitSection}>
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isLoading && { opacity: 0.7 } // make it slightly dimmed when loading
                                ]}
                                onPress={!isLoading ? sending_database : null}
                                disabled={isLoading}
                                >
                                {isLoading ? (
                                    <>
                                        <ActivityIndicator size="small" color={colors.surface} />
                                        <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>
                                            Submitting...
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Confirmation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: colors.primary,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.surface,
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.accent,
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 15,
    },
    damageList: {
        backgroundColor: colors.surface,
        borderRadius: 15,
        padding: 15,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    damageItem: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: colors.border,
    },
    damageItemSelected: {
        borderColor: colors.primaryLight,
        backgroundColor: colors.accent,
    },
    damageItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    damageItemText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 15,
        flex: 1,
    },
    damageItemTextSelected: {
        color: colors.text,
        fontWeight: '600',
    },
    seperator: {
        marginVertical: 20,
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    dropdownContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdownBox: {
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    dropdownInput: {
        color: colors.text,
        fontSize: 16,
    },
    dropdownDropdown: {
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000000', // Keep input text black as requested
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitSection: {
        marginTop: 20,
        marginBottom: 30,
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
    submitButtonText: {
        color: colors.surface,
        fontSize: 18,
        fontWeight: '600',
    },
})
