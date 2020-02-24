import React, {Component, Fragment} from 'react';
import {BleManager, ScanMode} from 'react-native-ble-plx';
import {Button, View, Text, ScrollView, StyleSheet} from 'react-native';
import {getDecFrom64} from '../services/ble/utility/DecFrom64';
//import {ScanObserver, scanObserverValues} from '../services/ble/ScanObserver';
import {throwStatement} from '@babel/types';
import {test} from '../services/test';

//let ScanOptions = { scanMode: ScanMode.LowLatency };
let deviceList = new Map(); //holder for all device

//TODO: change hardcoded Scan options
let ScanOptions = {scanMode: ScanMode.LowLatency};
let filter = null;

class ConnectScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionState: false,
      bluetoothState: '',
      orientation: '',
      deviceLIST: [],
      device: {
        name: null, //MAC (android) UUID (ios)
        id: null,
        rssi: null,
        mtu: null,
        manufactureData: null,
        serviceData: null,
        serviceUUIDs: null,
        localName: null,
        txPowerLevel: null,
        solicitedServiceUUIDs: null,
        isConnectable: null, //IOS ONLY
        overflowServiceUUIDs: false, //IOS ONLY
        services: null,
      },
    };

    this.manager = new BleManager(); //single reference to hardware BLE management
  }

  componentDidMount() {
    this.manager.enable();
    const subscription = this.manager.onStateChange(state => {
      if (state === 'PoweredOn') {
        //this.scanObserverValues();
      }
      if (state === 'PoweredOff') {
      }
    }, true);
  }

  scanObserverValues() {
    //Important that proper BLEdevicemanger object is sent into function
    console.log('starting scan..');
    this.manager.startDeviceScan(
      null,
      ScanOptions,
      //This function is called for EVERY scanned device!
      (error, device) => {
        if (error) {
          console.log(error.message);
          console.log('error');
          return;
        }

        try {
          //add device to the device map with id as key, device object as value

          //console.log(device.id); //look at MAC
          //get hex (ascii) values for each character
          //tx packet always only care about first 3 chars ignore = on x64

          //   let decVal = getDecFrom64(
          //     device.manufactureData.charCodeAt(0),
          //     device.manufactureData.charCodeAt(1),
          //     device.manufactureData.charCodeAt(2)
          //   );
          //   console.log(decVal);
          console.log(device.name);

          if (!deviceList.has(device.id)) {
            deviceList.set(device.id, device);
            this.setState({
              deviceLIST: this.state.deviceLIST.concat([
                {
                  name: device.name,
                  id: device.id,
                  rssi: device.rssi,
                  mtu: device.mtu,
                  manufactureData: device.manufactureData,
                  serviceData: device.serviceData,
                  serviceUUIDs: device.serviceUUIDs,
                  localName: device.localName,
                  txPowerLevel: device.txPowerLevel,
                  solicitedServiceUUIDs: device.solicitedServiceUUIDs,
                  isConnectable: null, //IOS ONLY
                  overflowServiceUUIDs: false, //IOS ONLY
                  services: device.services,
                },
              ]),
            });
          }

          if (deviceList.has(device.id)) {
            for (var i = 0; i < this.state.deviceLIST.length; i++) {
              if (this.state.deviceLIST[i].id === device.id) {
                this.state.deviceLIST[i] = {
                  name: device.name,
                  id: device.id,
                  rssi: device.rssi,
                  mtu: device.mtu,
                  manufactureData: device.manufactureData,
                  serviceData: device.serviceData,
                  serviceUUIDs: device.serviceUUIDs,
                  localName: device.localName,
                  txPowerLevel: device.txPowerLevel,
                  solicitedServiceUUIDs: device.solicitedServiceUUIDs,
                  isConnectable: null, //IOS ONLY
                  overflowServiceUUIDs: false, //IOS ONLY
                  services: device.services,
                };
              }
            }
          }

          this.setState({
            device: {
              name: device.name,
              id: device.id,
              rssi: device.rssi,
              mtu: device.mtu,
              manufactureData: device.manufactureData,
              serviceData: device.serviceData,
              serviceUUIDs: device.serviceUUIDs,
              localName: device.localName,
              txPowerLevel: device.txPowerLevel,
              solicitedServiceUUIDs: device.solicitedServiceUUIDs,
              isConnectable: null, //IOS ONLY
              overflowServiceUUIDs: false, //IOS ONLY
              services: device.services,
            },
          });
        } catch (error) {
          console.log(error.message);
        }
      },
    );
  }

  render() {
    const {device, deviceLIST} = this.state;
    //TODO: Enhance user interface by creating the card system for displaying
    let deviceView = this.state.deviceLIST.map((device, i) => {
      return (
        <View style={styles.container}>
          <Text key={i}>{device.name}</Text>
          <Text key={i}>{device.localName}</Text>
          <Text key={i}>{device.id}</Text>
          <Text key={i}>{device.rssi}</Text>
          <Text key={i}>{device.txPowerLevel}</Text>
          <Text key={i}>{device.serviceUUIDs}</Text>
        </View>
      );
    });

    if (deviceLIST.length === 0) {
      return (
        <Fragment>
          <ScrollView>
            <View>
              <Button
                title="Scan Observer"
                onPress={() => {
                  this.scanObserverValues();
                }}
              />
            </View>
            <View>
              <Text>Searching for devices...</Text>
            </View>
          </ScrollView>
        </Fragment>
      );
    }

    if (deviceLIST.length > 0) {
      return (
        <Fragment>
          <ScrollView>
            <View>
              <View>
                <Button
                  title="Scan Observer"
                  onPress={() => {
                    this.scanObserverValues();
                  }}
                />
              </View>
              <View>{deviceView}</View>
            </View>
          </ScrollView>
        </Fragment>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
  },
});

export default ConnectScene;
