/**
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';
import React, {Component, PureComponent} from 'react';
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
import {createAppContainer, StackActions} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Modal from 'react-native-modal';
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import DeviceInfo from 'react-native-device-info';

import Sinewave from '../components/charts/Sinewave';
import Piechart from '../components/charts/Piechart';
import Bubble from '../components/charts/Bubble';
import Linkage from '../components/charts/Linkage';
import Radar from '../components/charts/Radar';
import Scatter from '../components/charts/Scatter';
import Stock from '../components/charts/Stock';
import DeviceInfoScreen from '../components/device/deviceInfo';
import RawDataStream from '../services/ble/stream/RawDataStream';


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
    title: 'Main',
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
        // device: {
        //   connected: false,  
        //   name: null,
        //   id: null,
        //   rssi: null,
        //   batt_lvl: null,
        //   heart_rate: null,
        //   ax_val: null,
        //   ay_val: null,
        //   az_val: null,
        //   gx_val: null,
        //   gy_val: null,
        //   gz_val: null,
        //   dev_info: {
        //       manufact_name: null,
        //       model_num: null,
        //       hardware_version: null,
        //       firmware_version: null,
        //       system_id: null,
        //   },
        // },
    };
  }

  componentDidMount() {
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
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignItems: 'stretch',
          }}>
          <View style={{flex: 1}}>
            <Button title="Select Chart type" onPress={this.toggleModal} />
            <Modal isVisible={this.state.isModalVisible}>
              <View style={{flex: 1}}>
                <Button
                  title="Sinewave"
                  onPress={() => {
                    this.props.navigation.navigate('Sinewave');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Piechart"
                  onPress={() => {
                    this.props.navigation.navigate('Piechart');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Bubble"
                  onPress={() => {
                    this.props.navigation.navigate('Bubble');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Linkage"
                  onPress={() => {
                    this.props.navigation.navigate('Linkage');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Radar"
                  onPress={() => {
                    this.props.navigation.navigate('Radar');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Scatter"
                  onPress={() => {
                    this.props.navigation.navigate('Scatter');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Stock"
                  onPress={() => {
                    this.props.navigation.navigate('Stock');
                    this.toggleModal();
                  }}
                />
              </View>
            </Modal>
            <Button
              title="Scan & Connect"
              onPress={this.scanDevices}
            />
            <Button
              title="DeviceInfo"
              onPress={() => this.props.navigation.navigate('DeviceInfoScreen')}
            />
          </View>
        </View> 
      );
    }
    else{
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignItems: 'stretch',
          }}>
          <View style={{flex: 1}}>
            <Button title="Select Chart type" onPress={this.toggleModal} />
            <Modal isVisible={this.state.isModalVisible}>
              <View style={{flex: 1}}>
                <Button
                  title="Sinewave"
                  onPress={() => {
                    this.props.navigation.navigate('Sinewave');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Piechart"
                  onPress={() => {
                    this.props.navigation.navigate('Piechart');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Bubble"
                  onPress={() => {
                    this.props.navigation.navigate('Bubble');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Linkage"
                  onPress={() => {
                    this.props.navigation.navigate('Linkage');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Radar"
                  onPress={() => {
                    this.props.navigation.navigate('Radar');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Scatter"
                  onPress={() => {
                    this.props.navigation.navigate('Scatter');
                    this.toggleModal();
                  }}
                />
                <Button
                  title="Stock"
                  onPress={() => {
                    this.props.navigation.navigate('Stock');
                    this.toggleModal();
                  }}
                />
              </View>
            </Modal>
            <Button
              title="Scan & Connect"
              onPress={this.scanDevices}
            />
            <Button
              title="DeviceInfo"
              onPress={() => this.props.navigation.navigate('DeviceInfoScreen')}
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
});

const AppNavigator = createStackNavigator(
  {
    Main: Main,
    Sinewave: Sinewave,
    Piechart: Piechart,
    Bubble: Bubble,
    Linkage: Linkage,
    Radar: Radar,
    Scatter: Scatter,
    Stock: Stock,
    DeviceInfoScreen: DeviceInfoScreen,
    RawDataStream: RawDataStream,
  },
  {
    initialRouteName: 'Main',
  },
);

export default createAppContainer(AppNavigator);
