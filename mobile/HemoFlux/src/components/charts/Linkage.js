import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Button,
  View,
  processColor,
} from 'react-native';
import update from 'immutability-helper';
import RNFS, { exists } from 'react-native-fs';

import {LineChart} from 'react-native-charts-wrapper';
let path = RNFS.DocumentDirectoryPath;

//colors used for channels
const colors = [
  processColor('red'),
  processColor('blue'),
  processColor('green'),

  processColor('darkred'),
  processColor('blueviolet'),
  processColor('darkgreen'),

  processColor('indianred'),
  processColor('cadetblue'),
  processColor('darkolivegreen'),

  processColor('mediumvioletred'),
  processColor('cornflowerblue'),
  processColor('darkseaggreen'),

  processColor('orangered'),
  processColor('darkblue'),
  processColor('forestgreen'),

  processColor('palevioletred'),
  processColor('darkslateblue'),
  processColor('greenyellow'),

  processColor('salmon'),
  processColor('dodgerblue'),
  processColor('lightgreen'),
];

class LinkageChartScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hrData: {
        dataSets: [
          {
            values: Array.from(new Array(600), (val, index) => index),
            label: 'heart-rate',
          },
        ],
      },
      testData: {
        dataSets: [
          {
            values: Array.from(new Array(600), (val, index) => index),
            label: 'test',
          },
        ],
      },
      // rawData: {
      //   dataSets: [
      //     {
      //       values: Array.from(new Array(600), (val, index) => index),
      //       label: 'volume',
      //     },
      //     {
      //       values: r0values,
      //       //time: time,
      //       label: 'red0',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[0],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //       },
      //     },
      //     {
      //       values: i0values,
      //       //time: time,
      //       label: 'ir0',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[1],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //   },
      //     {
      //       values: g0values,
      //       //time: time,
      //       label: 'green0',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[2],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //     },
      //     {
      //       values: r1values,
      //       //time: time,
      //       label: 'red1',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[3],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //       },
      //     },
      //     {
      //       values: i1values,
      //       //time: time,
      //       label: 'ir1',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[4],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //   },
      //     {
      //       values: g1values,
      //       //time: time,
      //       label: 'green1',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[5],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //     },
      //     {
      //       values: r2values,
      //       //time: time,
      //       label: 'red2',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[6],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: ftrue,
      //         lineWidth: 2,
      //       },
      //     },
      //     {
      //       values: i2values,
      //       //time: time,
      //       label: 'ir2',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[7],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //   },
      //     {
      //       values: g2values,
      //       //time: time,
      //       label: 'green2',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[8],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //     },
      //     {
      //       values: r3values,
      //       //time: time,
      //       label: 'red3',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[9],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //       },
      //     },
      //     {
      //       values: i3values,
      //       //time: time,
      //       label: 'ir3',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[10],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //   },
      //     {
      //       values: g3values,
      //       //time: time,
      //       label: 'green3',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[11],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //     },
      //     {
      //       values: r4values,
      //       //time: time,
      //       label: 'red4',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[12],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //       },
      //     },
      //     {
      //       values: i4values,
      //       //time: time,
      //       label: 'ir4',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[13],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //   },
      //     {
      //       values: g4values,
      //       //time: time,
      //       label: 'green4',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[14],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //     },
      //     {
      //       values: r5values,
      //       //time: time,
      //       label: 'red5',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[15],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //       },
      //     },
      //     {
      //       values: i5values,
      //       //time: time,
      //       label: 'ir5',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[16],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //   },
      //     {
      //       values: g5values,
      //       //time: time,
      //       label: 'green5',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[17],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //     },
      //     {
      //       values: r6values,
      //       //time: time,
      //       label: 'red6',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[18],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //       },
      //     },
      //     {
      //       values: i6values,
      //       //time: time,
      //       label: 'ir6',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[19],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //   },
      //     {
      //       values: g6values,
      //       //time: time,
      //       label: 'green6',
      //       config: {
      //         drawValues: true, //draws values at points on graph
      //         color: colors[20],
      //         mode: 'CUBIC_BEZIER',
      //         drawCircles: true,
      //         lineWidth: 2,
      //     },
      //     },
      //   ],
      // },
      

    };
  }

  // unfortunately, doubleTapToZoomEnabled is not supported in linkage chart,
  // because in iOS Charts, the double tap event is handled by Charts itself, and no callback/custom listener
  // so it is not possible to sync double tap event to other charts in the same group

  // charts will broadcast their operation to other charts in the same group
  // different chart should have different identifier
  // synX is enabled by default, and syncY is disabled by default
  render() {
      return (
        <View style={{flex: 1}}>
          <View style={styles.container}>
            <LineChart
              style={styles.chart}
              data={this.state.hrData}
              xAxis={this.state.xAxis}
              group="stock"
              identifier="heart-rate"
              syncX={true}
              syncY={true}
              visibleRange={{x: {min: 1, max: 100}}}
              dragDecelerationEnabled={false}
              doubleTapToZoomEnabled={false} // it has to be false!!
            />
          </View>
  
          <View style={styles.container}>
            <LineChart
              style={styles.chart}
              data={this.state.testData}
              xAxis={this.state.xAxis}
              group="stock"
              identifier="test"
              syncX={true}
              syncY={true}
              visibleRange={{x: {min: 1, max: 100}}}
              dragDecelerationEnabled={false}
              doubleTapToZoomEnabled={false} // it has to be false!!
            />
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    marginTop: 5
  },
  chart: {
    flex: 1,
  },
});

export default LinkageChartScreen;
