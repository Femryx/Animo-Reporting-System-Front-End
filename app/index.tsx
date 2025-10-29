import { Text, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from "../screens/HomeScreen";
import Camera from "../screens/Camera";
import Confirmation from "../screens/Confirmation";
import Geoloc from "../screens/Geoloc";
import LogIn from "../screens/LogIn";
import Upload from "../screens/Upload";
import 'react-native-gesture-handler';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="LogIn" screenOptions={{headerShown: false}}>
        <Stack.Screen name="LogIn" component={LogIn}/>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Upload" component={Upload}/>
        <Stack.Screen name="Camera" component={Camera}/>
        <Stack.Screen name="Map" component={Geoloc}/>
        <Stack.Screen name="Confirmation" component={Confirmation}/>
      </Stack.Navigator>
      
        //<Tab.Navigator>
        //  <Tab.Screen name="Home" component={HomeScreen}/>
        //  <Tab.Screen name="Camera" component={Camera}/>
        //</Tab.Navigator>
  );
}
