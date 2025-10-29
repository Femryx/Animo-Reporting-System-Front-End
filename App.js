import { Text, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from "./screens/HomeScreen";
import Camera from "./screens/Camera";
import LogIn from "./screens/LogIn";
import Upload from "./screens/Upload";
import Geoloc from "./screens/Geoloc";
import Confirmation from "./screens/Confirmation";
import 'react-native-gesture-handler';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from './colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="LogIn"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="LogIn" 
          component={LogIn}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Damage Reports' }}
        />
        <Stack.Screen 
          name="Camera" 
          component={Camera}
          options={{ title: 'Camera' }}
        />
        <Stack.Screen 
          name="Upload" 
          component={Upload}
          options={{ title: 'Upload Image' }}
        />
        <Stack.Screen
          name="Map"
          component={Geoloc}
          options={{ title: 'Map' }}
        />
        <Stack.Screen 
          name="Confirmation" 
          component={Confirmation}
          options={{ title: 'Confirmation' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
