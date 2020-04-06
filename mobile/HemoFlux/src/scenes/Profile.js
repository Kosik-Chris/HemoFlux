/**
 * @format
 * @flow
 *
 */ 

import React, {PureComponent, Component} from 'react';
import {StyleSheet, processColor, View, Text, TouchableOpacity, ScrollView, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; //figure out how to use this
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';

import { createStackNavigator } from 'react-navigation-stack';
import Stock from '../components/charts/Stock';
import Sinewave from '../components/charts/Sinewave';
import RNFetchBlob from 'rn-fetch-blob';
import Scatter from '../components/charts/Scatter';




export default class Profile extends Component {




  render() {
    return(
      <Scatter/>
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