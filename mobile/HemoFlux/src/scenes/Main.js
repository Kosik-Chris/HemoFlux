/**
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';
import React, {Component, PureComponent, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import RNBootSplash from "react-native-bootsplash";
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import {createAppContainer, StackActions} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Modal from 'react-native-modal';
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import DeviceInfo from 'react-native-device-info';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DeviceInfoScreen from '../components/device/deviceInfo';
import Insights from '../scenes/Insights';
import ModelView from '../scenes/ModelView';
import RawDataStream from '../services/ble/stream/RawDataStream';
import Profile from '../scenes/Profile';


import {
  getAvailableLocationProviders,
  getBuildId,
  getBrand,
  getBatteryLevel,
  getDeviceId,
  getDeviceType,
  getDeviceName,
  getIpAddress,
  getMacAddress,
  isBatteryCharging,
  isLandscape,
  isLocationEnabled,
  useBatteryLevel,
} from 'react-native-device-info';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { BleManager, ScanMode, Service } from 'react-native-ble-plx';
import BLEconfig from '../services/files/bleConfig.json';

let ScanOptions = { scanMode: ScanMode.LowLatency };
let deviceList = new Map(); //holder for all devices
let BleManagerOptions = {restoreStateIdentifier: "hello"}; //TODO: work on background/ restored state functionality

const manager = new BleManager();

class Main extends PureComponent {

  static navigationOptions = {
    title: 'Session',
    headerStyle: {
      backgroundColor: '#f4511e',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }

  constructor(props){
    super(props);

    this.state = {
        isModalVisible: false,
        orientation: '',
        //other device info (chars & services are subscribed/ accessed by other components)
        deviceLIST: [],
        device: null,
    };
  }

  componentDidMount() {
    RNBootSplash.hide({ duration: 250 }); // fade
    request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      }),
    );
    Platform.select({
      android:  RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                interval: 10000,
                fastInterval: 5000,
                  }).then(data => {})
    });
    const subscription = manager.onStateChange(bleState => {
      //BLE adapter is on
      if (bleState === 'PoweredOn') {

      }
      //BLE adapter is off
      if (bleState === 'PoweredOff') {
        //turn on ble
        manager.enable();
    }
    }, true);
  }

  componentWillUnmount(){
    manager.destroy(); //properly remove the BLE adapter instance
  }

  getOrientation = () => {
    if (this.refs.rootView) {
      if (Dimensions.get('window').width < Dimensions.get('window').height) {
        this.setState({ orientation: 'portrait' });
      } else {
        this.setState({ orientation: 'landscape' });
      }
    }
  };

  scanDevices = () => {
    console.log("beginning scan..");
    manager.startDeviceScan(
      //[BLEconfig.devID]
      [BLEconfig.channelSID], //only scan for red service being advertised
        ScanOptions,
        //This function is called for EVERY scanned device!
         (error,device) => {
            if (error) {
                console.log(error.message);
                return;
              }
            if(device.name == 'HemoFlux'){
                manager.stopDeviceScan(); //device found
                this.connectToDevice(device);
              
            }

        }
    );
  }


  async connectToDevice(device){
    //console.log("device state set for: "+this.state.device.name);
    await device.connect();
    console.log("connected to device!");
    this.setState({
      device: device
    });
    const deviceSubscribe = manager.onDeviceDisconnected(this.state.device.id, () => {
            //subscription, device has disconnected due to error or connection issue
            //attempt to re-connect auto? look for better solution
        console.log("device has disconnected.. attempting to reconnect");
        
    });
  }


  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };

  render() {
    //not connected don't attempt to start components that need device prop
    if(this.state.device == null){
      return (
        <View style={styles.body}>
          <View style={styles.controlPanel}>
            <Button
              title="Start"
              onPress={this.scanDevices}
              style={styles.sessionBtn}
            />
            <Button
              title="Record"
              //onPress={}
              style={styles.sessionBtn}
            />
            <Button
              title="Stop"
              //onPress={}
              style={styles.sessionBtn}
            />
          </View>
        </View> 
      );
    }
    else{
      return (
        <View style={styles.body}>
          <View style={{flex: 1}}>
            <Button
              title="Start"
              onPress={this.scanDevices}
              style={styles.sessionBtn}
            />
            <Button
              title="Record"
              //onPress={}
              style={styles.sessionBtn}
            />
            <Button
              title="Stop"
              //onPress={}
              style={styles.sessionBtn}
            />
            <RawDataStream device={this.state.device} style={{}} />
          </View>
        </View> 
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
    flexDirection: 'column',
    height: '100%'
  },
  headerRow: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingBottom: 10,
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 10
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5,
    paddingBottom: 5,
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 100
  },
  rowItem: {
    padding: 1,
    width: '33%',
    flexDirection: 'row'
  },
  rowItemBold: {
    padding: 1,
    width: '33%',
    flexDirection: 'row'
  },
  controlPanel : {
    padding: 2,
    width: '80%',
    justifyContent: 'space-between',
    bottom: 0,
    position: 'absolute'
  },
  sessionBtn : {
    width: '20%'
  }
});

const RootTabNav = createBottomTabNavigator(
  {
    Main: Main,
    ModelView: ModelView,
    Insights: Insights,
    Profile: Profile,
  },
  {
    initialRouteName: 'Main',
  },
  {
    defaultNavigationOptions: ({navigation}) => ({

    })
  }

);


const AppContainer =  createAppContainer(RootTabNav);

export default AppContainer;
