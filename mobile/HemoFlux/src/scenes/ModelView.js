/**
 * @format
 * @flow
 *
 */

import React, {PureComponent} from 'react';
import {StyleSheet, processColor, View, Text,TouchableOpacity, ScrollView, Platform} from 'react-native';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';

import GestureControl from '../components/modelcontrol/GestureControl';
import Animations from '../components/modelcontrol/Animations';
import Multiple from '../components/modelcontrol/Multiple';
import RuntimeAssets from '../components/modelcontrol/RuntimeAssets';
import { createStackNavigator } from 'react-navigation-stack';

export default class ModelView extends PureComponent {

  state = {
    example: undefined,
  };

  select(example) {
    this.setState({example});
  }

  render() {
    return (
      <View style={styles.container}>
        <GestureControl/>
        {/* <View style={styles.header}>
          {this.state.example && (
            <TouchableOpacity
              onPress={() => this.select()}
              hitSlop={{top: 9, left: 9, bottom: 9, right: 9}}>
              <Text style={styles.backButton}>&lt;</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>GLModelView Examples</Text>
        </View>

        <View style={styles.body}>{this.renderContent()}</View> */}
      </View>
    );
  }

  renderContent() {
    if (this.state.example) {
      const Example = this.state.example;
      return <Example />;
    }


  const examples = [
    {component: Animations, info: 'Control via Animated API'},
    {component: GestureControl, info: 'Rotation via Gesture Responder'},
    {component: Multiple, info: 'Using multiple ModelViews'},
    {component: RuntimeAssets, info: 'Initializing ModelViews using Network'},
  ];

  return (
    <ScrollView style={styles.menu}>
      {examples.map((example, i) => {
        const title = i + 1 + '. ' + example.info;
        return (
          <TouchableOpacity
            onPress={this.select.bind(this, example.component)}
            key={example.info}>
            <Text style={styles.button}>{title}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );


  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: 'white',
  },
  header: {
    height: 75,
    paddingTop: 22,
    paddingLeft: 20,
    flexDirection: 'row',
    backgroundColor: '#5894f3',
    alignItems: 'center',
    zIndex: 100,
  },
  body: {
    flex: 1,
    zIndex: 1,
  },
  menu: {
    flex: 1,
    paddingTop: 15,
    paddingLeft: 40,
    backgroundColor: '#fff',
  },
  backButton: {
    color: 'white',
    fontSize: 18,
    width: 30,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  button: {
    color: '#333',
    fontSize: 20,
    marginBottom: 24,
  },
});