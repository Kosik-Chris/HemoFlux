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
  Dimensions,
  TextInput
} from 'react-native';
import RNBootSplash from "react-native-bootsplash";
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import {createAppContainer, StackActions} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, BottomTabBar } from 'react-navigation-tabs';
import Modal from 'react-native-modal';
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS, { exists } from 'react-native-fs';
import DeviceInfoScreen from '../components/device/deviceInfo';
import Insights from '../scenes/Insights';
import ModelView from '../scenes/ModelView';
import RawDataStream from '../services/ble/stream/RawDataStream';
import Profile from '../scenes/Profile';
import Welcome from '../components/info/Welcome';
import What from '../components/info/What';


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
import {check, request, PERMISSIONS, RESULTS, openSettings} from 'react-native-permissions';
import { BleManager, ScanMode, Service } from 'react-native-ble-plx';
import BLEconfig from '../services/files/bleConfig.json';

let ScanOptions = { scanMode: ScanMode.LowLatency };
let deviceList = new Map(); //holder for all devices
let BleManagerOptions = {restoreStateIdentifier: "hello"}; //TODO: work on background/ restored state functionality

const TabBarComponent = props => <BottomTabBar {...props} />;
let manager;
let path = RNFS.DocumentDirectoryPath;


class Main extends PureComponent {

  constructor(props){
    super(props);

    this.state = {
        isSetupModalVisible: false,
        isSessionModalVisible: false,
        isSessionRunning: false,
        orientation: '',
        //other device info (chars & services are subscribed/ accessed by other components)
        deviceLIST: [],
        device: null,
        isConnected: false,
        updateRate: 30,
        dataWidth: 75,
        filename: '/test.csv'
    };
  }

  async requestAll(){
    if(Platform.OS === 'android'){
      const aFineLoc = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      const aReadExt = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      const aWriteExt = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      return {aFineLoc,aReadExt,aWriteExt};
    }
    if(Platform.OS === 'ios'){
      const iLocAlways = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      const iLocWhenUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      const iMotion = await request(PERMISSIONS.IOS.MOTION);
      const iBLEP = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
      return {iLocAlways,iLocWhenUse,iMotion,iBLEP};
    }
  }

  componentDidMount() {
    manager = new BleManager();
    RNBootSplash.hide({ duration: 250 }); // fade bootsplash screen out
    this.requestAll().then(status => console.log(status));
    if(Platform.Os === 'android'){
      Platform.select({
        android:  RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                  interval: 10000,
                  fastInterval: 5000,
                    }).then(data => {})
      });
    }
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
    if(this.state.isConnected === true){
      this.disconnect;
    }
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
    this.toggleSessionModal;
    this.setState({
      isSessionModalVisible: false
    })
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

  disconnect = () => {
    if(this.state.isConnected){
      this.setState({
        isConnected: false,
        isSessionRunning: false,
      });
      manager.cancelDeviceConnection(this.state.device.id);
    }
  }


  async connectToDevice(device){
    console.log(this.state.dataWidth);
    //console.log("device state set for: "+this.state.device.name);
    await device.connect();
    this.setState({
      device: device,
      isConnected: true,
      isSessionRunning: true
    });
    const deviceSubscribe = manager.onDeviceDisconnected(this.state.device.id, () => {
            //subscription, device has disconnected due to error or connection issue
            //attempt to re-connect auto? look for better solution
            if(this.state.isSessionRunning === true){
              console.log("session still running, connection error");
            }
            else{
              console.log("succesful disconnection");
            }
        
    });
  }


  toggleSetupModal = () => {
    this.setState({isSetupModalVisible: !this.state.isSetupModalVisible});
  };
  toggleSessionModal = () => {
    this.setState({isSessionModalVisible: !this.state.isSessionModalVisible});
  }

  async record(filename){
    if(await exists(path+filename)){
      console.log('exists');
      RNFS.appendFile(path+filename, '1,', 'ascii')
      .then((success) => {
        console.log('FILE APPEND');
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
    else{
      RNFS.writeFile(path+filename, '2,', 'ascii')
      .then((success) => {
        console.log('FILE WRITTEN!');
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
  }

  render() {

    //not connected don't attempt to start components that need device prop
    if(this.state.isSessionRunning === false){
      return (
        <View style={styles.body}>
        <Welcome />
        <Modal isVisible={this.state.isSessionModalVisible}
          style={styles.sessionModal}
          hasBackdrop={true}
          backdropColor={'black'}
          backdropOpacity={0.3}
          >
          <View style={{flex: 1}}>
            <Text>Hello!</Text>
            <Button title="Start Session" onPress={this.scanDevices}/>
            <Button title="Hide modal" onPress={this.toggleSessionModal} />
          </View>
        </Modal>
        <Modal isVisible={this.state.isSetupModalVisible}
          style={styles.setupModal}
          hasBackdrop={true}
          backdropColor={'black'}
          backdropOpacity={0.3}
          >
          <View style={{flex: 1}}>
            <Text>Setup</Text>

            <Button title="Hide modal" onPress={this.toggleSetupModal} />
          </View>
        </Modal>
          <View style={styles.controlPanel}>
            <View style={styles.controlPanelRow}>
              <View style={styles.sessionBtnWrapper}>
                <Icon.Button
                name="play"
                backgroundColor="#e74d00"
                onPress={this.toggleSessionModal}
                >
                  Start
                </Icon.Button>
              </View>
              <View style={styles.sessionBtnWrapper}>
              <Icon.Button
                name="folder"
                backgroundColor="#e74d00"
                onPress={()=> {this.record(this.state.filename)}}
                >
                  Record
                </Icon.Button>
              </View>
              <View style={styles.sessionBtnWrapper}>
              <Icon.Button
                name="ellipsis-v"
                backgroundColor="#e74d00"
                //onPress={() => this.props.navigation.navigate('What')}
                onPress={this.toggleSetupModal}
                >
                </Icon.Button>
              </View>
            </View>
          </View>
        </View> 
      );
    }
    if(this.state.isSessionRunning === true){
      return (
        <View style={styles.body}>
          <Modal isVisible={this.state.isSetupModalVisible}
            style={styles.setupModal}
            hasBackdrop={true}
            backdropColor={'black'}
            backdropOpacity={0.3}
            >
          <View style={{flex: 1}}>
            <Text>Setup</Text>
            <Button title="Hide modal" onPress={this.toggleSetupModal} />
          </View>
        </Modal>
          <View style={styles.controlPanel}>
            <View style={styles.controlPanelRow}>
              <View style={styles.sessionBtnWrapper}>
              <Icon.Button
                name="stop"
                backgroundColor="#e74d00"
                onPress={this.disconnect}
                >
                 Stop
                </Icon.Button>
              </View>
              <View style={styles.sessionBtnWrapper}>
              <Icon.Button
                name="folder"
                backgroundColor="#e74d00"
                onPress={()=> {this.record(this.state.filename)}}
                >
                  Record
                </Icon.Button>
              </View>
              <View style={styles.sessionBtnWrapper}>
              <Icon.Button
                name="filter"
                backgroundColor="#e74d00"
                //onPress={() => this.props.navigation.navigate('What')}
                onPress={this.toggleSetupModal}
                >
                  Settings
                </Icon.Button>
              </View>
            </View>
          </View>
          <View style={styles.graphContainer}>
              <RawDataStream device={this.state.device}
               dataWidth={this.state.dataWidth}
               updateRate={this.state.updateRate}
               style={{height: '50%'}} />
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
    //flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'flex-start',
    flexDirection: 'column',
    height: '100%',
    width: '100%'
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
    padding: 5,
    borderWidth: 2,
    width: '100%',
    height: (Dimensions.get('window').height/15),
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: '#e6e6e6'
  },
  controlPanelRow: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  sessionBtn : {
    width: '20%',
  },
  sessionBtnWrapper : {
    display: 'flex',
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'stretch',
    marginTop: 0,
  },
  graphContainer : {
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    width: '100%',
    height: '90%',
    top: 0
  },
  setupModal: {

  },
  sessionModal: {

  },
});

const MainStack = createStackNavigator({
      Main: Main,
      What: What,
      DeviceInfo: DeviceInfoScreen
    },
    {
      headerMode: 'none'
    }
    );

const RootTabNav = createBottomTabNavigator(
  {
    Main: MainStack,
    ModelView: ModelView,
    Insights: Insights,
    Profile: Profile,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Icon;
        let iconName;
        if (routeName === 'Main') {
          iconName = focused
            ? 'signal'
            : 'signal';
          // Sometimes we want to add badges to some icons.
          // You can check the implementation below.
          //IconComponent = HomeIconWithBadge;
        } else if (routeName === 'ModelView') {
          iconName = focused ? 'child' : 'child';
        }
        else if(routeName === 'Insights'){
          iconName = focused ? 'bar-chart' : 'bar-chart';
        }
        else if(routeName === 'Profile'){
          iconName = focused ? 'user' : 'user';
        }

        // You can return any component that you like here!
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'red',
      inactiveTintColor: 'white',
      style: {
        backgroundColor: 'black', //#e6e6e6
      }
    },
  }

);


const AppContainer =  createAppContainer(RootTabNav);

export default AppContainer;
