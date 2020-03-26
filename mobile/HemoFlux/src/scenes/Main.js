/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';
import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar,
} from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Modal from 'react-native-modal';
import DeviceInfo from 'react-native-device-info';

import Sinewave from '../components/charts/Sinewave';
import Piechart from '../components/charts/Piechart';
import Bubble from '../components/charts/Bubble';
import Linkage from '../components/charts/Linkage';
import Radar from '../components/charts/Radar';
import Scatter from '../components/charts/Scatter';
import Stock from '../components/charts/Stock';
import Connect from '../scenes/Connect';
import DeviceInfoScreen from '../components/device/deviceInfo';
import DataStream from '../services/ble/stream/DataStream';


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

class HomeScene extends Component {
  state = {
    isModalVisible: false,
  };

  componentDidMount() {}

  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };

  render() {
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
            title="Connect"
            onPress={() => this.props.navigation.navigate('Connect')}
          />
          <Button
            title="DeviceInfo"
            onPress={() => this.props.navigation.navigate('DeviceInfoScreen')}
          />
          <Button
            title="DataStream"
            onPress={() => this.props.navigation.navigate('DataStream')}
          />
          <Sinewave style={{}} />
          <Stock />
        </View>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator(
  {
    Home: HomeScene,
    Sinewave: Sinewave,
    Piechart: Piechart,
    Bubble: Bubble,
    Linkage: Linkage,
    Radar: Radar,
    Scatter: Scatter,
    Stock: Stock,
    Connect: Connect,
    DeviceInfoScreen: DeviceInfoScreen,
    DataStream: DataStream,
  },
  {
    initialRouteName: 'Home',
  },
);

export default createAppContainer(AppNavigator);
