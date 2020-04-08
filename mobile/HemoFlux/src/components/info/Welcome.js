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
                        What is this?
                    </Text>
                    <Text style={styles.mainText}>
                        HemoFlux integrates with the HemoFlux Biosensor board, which is utilized sense bloodflow in exttremeties in real time! The device implements
                        Photoplethsmography, or PPG, to use light in penetration of the skin for determination of heart rate, blood volume, blood flow, and more!
                    </Text>
                    <Text style={styles.headerText}>
                        Features:
                    </Text>
                    <Text style={styles.mainText}>
                        1. Stream Biosensor data to your mobile device in real time
                    </Text>
                    <Text style={styles.mainText}>
                        2. Record the Biosensor data you have streamed
                    </Text>
                    <Text style={styles.mainText}>
                        3. Observe and record real time HR values derived from multiple biosensors for improved accuracy and signal robustness 
                    </Text>
                    <Text style={styles.mainText}>
                        4. Observe a 3D model of the device and sensor locations in order to receive visual feedback on bloodflow insights
                    </Text>
                    <Text style={styles.mainText}>
                        5. Track longer term trends with the insights tab
                    </Text>
                    <Text style={styles.mainText}>
                        6. Personalize the calculations by providing personal health info to assist calculations. **NOTE** all data is stored locally on your device in csv format.
                        Data is not exported to a server.
                    </Text>
                    <Text>

                    </Text>
                    <Text>

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