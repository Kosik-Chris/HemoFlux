/**
 * @format
 * @flow
 *
 */ 

import React, {PureComponent} from 'react';
import {StyleSheet, processColor, View, Text, TouchableOpacity, ScrollView, Platform} from 'react-native';

export default class Insights extends PureComponent {

  render() {
    return(
      <View style={styles.body}>
        <Text>Insights, Add weekday-calendar select for data + loading of saved csv for session etc.</Text>
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