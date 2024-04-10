import React, { useState, useEffect } from 'react';
import { BleManager } from 'react-native-ble-plx';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

// Define your device interface if using TypeScript
interface Device {
  id: string;
  name: string;
}

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [manager] = useState(new BleManager());
  const serviceUUID = "123e4567-e89b-12d3-a456-426614174000"; // Your unique UUID here

  useEffect(() => {
    return () => manager.destroy();
  }, [manager]);

  const targetDeviceName = "Jack pixel";

  const scanDevices = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        manager.stopDeviceScan();
        return;
      }
  
      if (device && device.serviceUUIDs && device.serviceUUIDs.includes(serviceUUID)) {
        const deviceName = device.localName || device.name || 'Unnamed device';
        const newDevice = {id: device.id, name: deviceName};

        
        
        // Check if this is the device we want to connect to
        if (newDevice.name === targetDeviceName) {
          // Stop scanning as we found the target device
          manager.stopDeviceScan();
          
          // Proceed with connecting to the device
          // Remember to handle the connection process according to the library's API and your device's requirements
          manager.connectToDevice(device.id)
            .then((device) => {
              // Handle successful connection
              console.log(`Connected to ${newDevice.name}`);
              // Once connected, you might want to stop the scan and navigate the user to another screen
            })
            .catch((error) => {
              // Handle connection error
              console.warn(error);
            });
        } else {
          // Device is not the one we're looking for; update the list
          setDevices((prevState) => {
            const deviceExists = prevState.some((existingDevice) => existingDevice.id === newDevice.id);
            if (!deviceExists) {
              return [...prevState, newDevice];
            }
            return prevState;
          });
        }
      }
    });
  
    // Consider a reasonable timeout for the scan
    setTimeout(() => {
      manager.stopDeviceScan();
    }, 10000); // Stop scanning after 10 seconds
  };
  

  const renderItem = ({ item }: { item: Device }) => (
    <View style={styles.deviceContainer}>
      
      <Text style={styles.deviceText}>{item.name}</Text>
      <TouchableOpacity
        style={styles.pairButton}
        onPress={() => console.log('Pairing with', item.name)}
      >
        <Text>Pair</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <Button title="Scan for Devices" onPress={scanDevices} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lighter,
  },
  deviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  deviceText: {
    fontSize: 16,
  },
  pairButton: {
    padding: 10,
    backgroundColor: '#add8e6',
    borderRadius: 5,
  },
});

export default App;
