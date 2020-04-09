/**
 * @format
 * @flow
 *
 */ 

import React, {PureComponent, Component} from 'react';
import {StyleSheet, processColor, View, Text, TouchableOpacity, ScrollView, Platform, Button} from 'react-native';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import {check, request, PERMISSIONS, RESULTS, openSettings} from 'react-native-permissions';
import RNFS, { exists } from 'react-native-fs';
import Mailer from 'react-native-mail';
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
let extpath;

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

  async handleEmail(filename) {
    if(Platform.Os !== 'ios'){
      //SOLUTION CREDIT: https://github.com/chirag04/react-native-mail/issues/123
      //we must copy the file to external storage for android to be able to access it rather than internal app cache.
      try{
        let hasPermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (hasPermission !== 'granted') {
          handleError(i18n.t('error_accessing_storage'));
        }
        let hasPermissionread = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        if (hasPermissionread !== 'granted') {
          handleError(i18n.t('error_read_storage'));
        }
      }catch(error){
        console.warn(error);
      }
      
      extpath = `${RNFS.ExternalStorageDirectoryPath}`;
      RNFS.mkdir(extpath+'/HemoFlux');
      hemoPath = extpath+'/HemoFlux';
      try {
        await RNFS.copyFile(path+filename, hemoPath+filename);
        let fileChk = await exists(hemoPath+filename);
        console.log(fileChk);
        Mailer.mail({
          subject: 'HemoFlux email test',
          recipients: ['joseignacio.rodriguez-labra@wmich.edu'],
          ccRecipients: ['christopher.j.kosik@wmich.edu'],
          bccRecipients: ['christopher.j.kosik@wmich.edu'],
          body: '<b>In the beginning it was pure creation..</b>',
          isHTML: true,
          attachment: {
            path: hemoPath+filename,  // The absolute path of the file from which to read data.
            type: 'csv',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
            name: 'westworld.csv',   // Optional: Custom filename for attachment
          }
        }, (error, event) => {
          Alert.alert(
            error,
            event,
            [
              {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
              {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
            ],
            { cancelable: true }
          )
        });
      } catch(error) {
        console.log(error);
      }
    }
    if(Platform.Os !== 'ios'){

    Mailer.mail({
      subject: 'HemoFlux email test',
      recipients: ['joseignacio.rodriguez-labra@wmich.edu'],
      ccRecipients: ['christopher.j.kosik@wmich.edu'],
      bccRecipients: ['christopher.j.kosik@wmich.edu'],
      body: '<b>In the beginning it was pure creation..</b>',
      isHTML: true,
      attachment: {
        path: path+filename,  // The absolute path of the file from which to read data.
        type: 'csv',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
        name: 'westworld.csv',   // Optional: Custom filename for attachment
      }
    }, (error, event) => {
      Alert.alert(
        error,
        event,
        [
          {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
          {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
        ],
        { cancelable: true }
      )
    });
    }
  }


  render() {
    return(
      <View>
        <Text>Git gud</Text>
        <Button onPress={() => {this.readFile(this.state.filename)}} title='READ'></Button>
        <Button onPress={() => {this.deleteFile(this.state.filename)}} title='DELETE'></Button>
        <Button onPress={() => {this.handleEmail(this.state.filename)}} title='EMAIL'></Button>
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