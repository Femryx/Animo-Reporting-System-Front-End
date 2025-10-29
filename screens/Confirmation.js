import { View, Text, StyleSheet, Button, Modal, Pressable, Switch, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar} from "react-native";
import { SelectList } from 'react-native-dropdown-select-list'
import { useState, useEffect } from 'react';
import Label from '../Label.json';
import { colors } from '../colors';


const Seperator = () => <View style = {styles.seperator}/>;



const Confirmation = ({navigation}) => {
    const [isselected, setIsselecteddamage] = useState(null);
    const [iscorrect, setIscorrectlabel] = useState(false);
    const [label,setlabel] = useState('');
    const [recommendation,  setrecommendation] = useState('');
    //To do: Sending data to the backend
    const isselecteddamage = (index) =>{
        if(isselected == index){
            setIsselecteddamage(null);
        }else{
            setIsselecteddamage(index);
        }
    }
    const [damage,setDamage] = useState([]);
    const get_folder_name = async() =>{
        try{
            const response = await fetch('http://192.168.82.213:5000/api/get_folder_name',
                {
                    method:'GET',
                }
            );
            const folder = await response.json();
            setDamage(folder.data)
        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        get_folder_name();
    },[])

    {/* for the dropdown list */}
    const [selected, setSelected] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("");

    // Severity level options
    const severityOptions = [
        {"key":"1", "value":"Minor"},
        {"key":"2", "value":"Moderate"},
        {"key":"3", "value":"Severe"}
    ];

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
                                    data={Label}
                                    save="value"
                                    boxStyles={styles.dropdownBox}
                                    inputStyles={styles.dropdownInput}
                                    dropdownStyles={styles.dropdownDropdown}
                                />
                            </View>
                        </View>

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
                            <Text style={styles.label}>Repair Recommendation</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe recommended repair actions..."
                                placeholderTextColor={colors.textLight}
                                multiline={true}
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Possible Cause</Text>
                            <TextInput
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
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => navigation.navigate("Map", { mode: 'pinpoint' })}
                        >
                            <Text style={styles.submitButtonText}>📍 Locate the damage</Text>
                        </TouchableOpacity>
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
