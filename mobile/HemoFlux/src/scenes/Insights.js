/**
 * @format
 * @flow
 *
 */ 

import React, {PureComponent, Component} from 'react';
import {StyleSheet, processColor, View, Text, TouchableOpacity, ScrollView, Platform, Button} from 'react-native';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import RNFS, { exists } from 'react-native-fs';
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
import { createStackNavigator } from 'react-navigation-stack';
import Stock from '../components/charts/Stock';
import Sinewave from '../components/charts/Sinewave';
import RNFetchBlob from 'rn-fetch-blob';
import Piechart from '../components/charts/Piechart';


let path = RNFS.DocumentDirectoryPath;

export default class Insights extends Component {

  constructor(props){
    super(props);

    this.state = {
      filename: '/test.csv'
    }
  }

  async readFile(filename){
    if(await exists(path+filename)){
      console.log('exists');
      RNFS.readFile(path+filename, 'ascii')
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
    else{
      console.log('File DNE');
    }
  }

  async deleteFile(filename){
    if(await exists(path+filename)){
      console.log('exists');
      RNFS.unlink(path+filename)
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
  }


  render() {
    return(
      <View>
        <Text>Git gud</Text>
        <Button onPress={() => {this.readFile(this.state.filename)}} title='READ'></Button>
        <Button onPress={() => {this.deleteFile(this.state.filename)}} title='DELETE'></Button>
      </View>
    );
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