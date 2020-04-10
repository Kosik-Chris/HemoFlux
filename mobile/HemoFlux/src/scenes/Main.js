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
import HRStream from '../services/ble/stream/HRStream';
import IMUStream from '../services/ble/stream/IMUStream';
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
        chartSelect: 'rawchart',
        isRecording: false,
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
    this.getOrientation();
    Dimensions.addEventListener('change', () => {
      this.getOrientation();
    });
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
        console.log('portrait');
      } else {
        this.setState({ orientation: 'landscape' });
        console.log('landscape');
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


  /**
   * Create the record on mount if configured for recording, set record flag
   * @param {*} this.state.filename
   */
  createRecord = () => {
        RNFS.appendFile(path+this.state.filename, 'Red0Value,Ir0Value,Green0Value,UpdateRate(time width)\r\n', 'ascii')
        .then((success) => {
          console.log("record file created successfully");
        })
        .catch((err) => {
          console.log(err.message);
        });
    this.setState({
      isRecording: true
    });
    this.scanDevices();
  }

  /**
   * Delete the local file if it already exists, then go ahead and start appending
   * @param {*} this.state.filename 
   */
  preDeleteFile = () =>{
    if(exists(path+this.state.filename)){
      RNFS.unlink(path+this.state.filename)
      .then((success) => {
        console.log('DELETED');
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
    else{
      console.log('File DNE');
    }
    this.createRecord();
  }

  setHRChart = () => {
    this.setState({
      chartSelect: 'hrchart'
    });
    this.scanDevices();
  }

  setIMUChart = () => {
    this.setState({
      chartSelect: 'imuchart'
    });
    this.scanDevices();
  }

  setRawChart = () => {
    this.setState({
      chartSelect: 'rawchart'
    });
    this.scanDevices();
  }


  render() {

    let panelHeight;

    if (this.state.orientation === 'portrait') {
      panelHeight = Dimensions.get('window').height/15;
    }
    if (this.state.orientation === 'landscape') {
      panelHeight = Dimensions.get('window').height/10;
    }

    //not connected don't attempt to start components that need device prop
    if(this.state.isSessionRunning === false){
      return (
        <SafeAreaView>
        <View style={styles.body}>
        <Welcome />
        <Modal isVisible={this.state.isSessionModalVisible}
          hasBackdrop={true}
          backdropColor={'red'}
          backdropOpacity={0.4}
          >
          <View style={styles.sessionModal}>
            <View style={styles.modalBtnWrapper}>
              <Icon.Button 
              onPress={this.setRawChart}
              backgroundColor="#1e1e1e"
              name="play-circle-o"
              >
                Start unrecorded Session
              </Icon.Button>  
            </View>
            <View style={styles.modalBtnWrapper}>
              <Icon.Button
              onPress={this.preDeleteFile}
              backgroundColor="#1e1e1e"
              name="times-rectangle"
              >
                Start recorded Session
              </Icon.Button>  
            </View>
            <View style={styles.modalBtnWrapper}>
              <Icon.Button 
              onPress={this.preDeleteFile}
              backgroundColor="#1e1e1e"
              name="wrench"
              >
                Pre-configure recording details
              </Icon.Button>    
            </View>
            <View style={styles.modalBtnWrapper}>
              <Icon.Button 
              onPress={this.setHRChart}
              backgroundColor="#1e1e1e"
              name="heartbeat"
              >
                Start Unrecorded HR
              </Icon.Button>  
            </View>
            <View style={styles.modalBtnWrapper}>
              <Icon.Button 
              onPress={this.setIMUChart}
              backgroundColor="#1e1e1e"
              name="balance-scale"
              >
                Start Unrecorded IMU
              </Icon.Button>  
            </View> 
            <View style={styles.modalBtnWrapper}>
              <Icon.Button 
              onPress={this.toggleSessionModal}
              backgroundColor="#1e1e1e"
              name="backward"
              >
                Back
              </Icon.Button> 
            </View>          
          </View>
        </Modal>
        <Modal isVisible={this.state.isSetupModalVisible}
          hasBackdrop={true}
          backdropColor={'red'}
          backdropOpacity={0.4}
          >
          <View style={styles.setupModal}>
          <Icon.Button name="backward"
            backgroundColor="#1e1e1e"
            style={styles.modalBtn}
            onPress={this.toggleSetupModal}>
              Back
            </Icon.Button>
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
        </SafeAreaView>
      );
    }
    if(this.state.isSessionRunning === true && this.state.chartSelect === 'rawchart'){
      return (
        <SafeAreaView>
        <View style={styles.body}>
          <Modal isVisible={this.state.isSetupModalVisible}
            hasBackdrop={true}
            backdropColor={'red'}
            backdropOpacity={0.4}
            >
          <View tyle={styles.setupModal}>
            <Icon.Button name="backward"
            onPress={this.toggleSetupModal}
            backgroundColor="#1e1e1e">
              Back
            </Icon.Button>
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
               filename={this.state.filename}
               dataWidth={this.state.dataWidth}
               updateRate={this.state.updateRate}
               isRecording={this.state.isRecording}
               style={{height: '50%'}} />
          </View>
        </View>
        </SafeAreaView> 
      );
    }
    if(this.state.isSessionRunning === true && this.state.chartSelect === 'hrchart'){
      return (
        <SafeAreaView>
        <View style={styles.body}>
          <Modal isVisible={this.state.isSetupModalVisible}
            hasBackdrop={true}
            backdropColor={'red'}
            backdropOpacity={0.4}
            >
          <View style={styles.setupModal}>
          <Icon.Button name="backward"
            onPress={this.toggleSetupModal}
            backgroundColor="#1e1e1e">
              Back
            </Icon.Button>
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
              <HRStream device={this.state.device}
               filename={this.state.filename}
               dataWidth={this.state.dataWidth}
               updateRate={this.state.updateRate}
               isRecording={this.state.isRecording}
               style={{height: '50%'}} />
          </View>
        </View>
        </SafeAreaView> 
      );
    }
    if(this.state.isSessionRunning === true && this.state.chartSelect === 'imuchart'){
      return (
        <SafeAreaView>
        <View style={styles.body}>
          <Modal isVisible={this.state.isSetupModalVisible}
            hasBackdrop={true}
            backdropColor={'red'}
            backdropOpacity={0.4}
            >
          <View style={styles.setupModal}>
          <Icon.Button name="backward"
            onPress={this.toggleSetupModal}
            backgroundColor="#1e1e1e">
              Back
            </Icon.Button>
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
              <IMUStream device={this.state.device}
               filename={this.state.filename}
               dataWidth={this.state.dataWidth}
               updateRate={this.state.updateRate}
               isRecording={this.state.isRecording}
               style={{height: '50%'}} />
          </View>
        </View> 
        </SafeAreaView>
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
    height: Dimensions.get('window').height/15,
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
    justifyContent: 'space-around'
  },
  sessionModal: {
    justifyContent: 'space-around',
  },
  modalBtnWrapper: {
    display: 'flex',
    marginLeft: 10,
    marginRight: 10,
    padding: 2,
    width: Dimensions.get('window').width/2
  },
  modalBtn: {

  }
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
