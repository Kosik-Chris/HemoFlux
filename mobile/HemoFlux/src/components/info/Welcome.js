/**
 * @format
 * @flow
 *
 */ 

import React, {PureComponent, Component} from 'react';
import {StyleSheet, processColor, View, Text, TouchableOpacity, ScrollView, Platform, SafeAreaView,Dimensions} from 'react-native';
import * as Animatable from 'react-native-animatable';

export default class Welcome extends Component{
    render(){
        return(
            <SafeAreaView style={styles.container}>
                <ScrollView >
                    <Text style={styles.introText}>Welcome to HemoFlux</Text>
                    <Animatable.Text animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.heart}>❤️</Animatable.Text>
                    <Text style={styles.headerText}>
                        How do I start a session for streaming data?
                    </Text>
                    <Text style={styles.mainText}>
                        Press the start button on the control panel below, a popup should ask what you would like
                        to stream (raw data, HR value, gyro data)
                    </Text>
                    <Text style={styles.headerText}>
                        How else can I visualize data?
                    </Text>
                    <Text style={styles.mainText}>
                        Check out the ModelView tab at the bottom! this updates a 3D rendition of the device to show values by color.
                    </Text>
                    <Text>

                    </Text>
                    <Text>

                    </Text>
                </ScrollView>
            </SafeAreaView>    
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
      backgroundColor: 'transparent',
      width: '100%',
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
    introText: {
        fontSize: 30,
        fontWeight: '200',
        textAlign: 'center',
        padding: 5,
    },
    heart : {
        textAlign: 'center',
        fontSize: 75 
    },
    mainText : {
        fontSize: 15,
        marginLeft: 5,
        textAlign: 'left'
    },
    headerText: {
        fontSize: 25,
        fontWeight: '100',
        marginLeft: 5,
        textAlign: 'left'
    }

  });