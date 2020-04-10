/**
 * @format
 * @flow
 * 
 * This component renders all configured channels raw data in line graph form.
 * Component receives the device object from controlling middleware and subscribes to configured chars
 * Component is not navigated to.
 */

import React, {PureComponent} from 'react';
import {StyleSheet, processColor, View, Text, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import RNFS, { exists } from 'react-native-fs';
import {LineChart} from 'react-native-charts-wrapper';
import { getDecFrom64 } from '../utility/DecFrom64';
import BLEconfig from '../../files/bleConfig';

//Intermediate variables for holding received values from tx
let r0,r1,r2,r3,r4,r5,r6;
let i0,i1,i2,i3,i4,i5,i6;
let g0,g1,g2,g3,g4,g5,g6;
let r0subscribe, r1subscribe, r2subscribe, r3subscribe, r4subscribe, r5subscribe, r6subscribe;
let i0subscribe, i1subscribe, i2subscribe, i3subscribe, i4subscribe, i5subscribe, i6subscribe;
let g0subscribe, g1subscribe, g2subscribe, g3subscribe, g4subscribe, g5subscribe, g6subscribe;
let renderCnt = 0;
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

/**
 * dataWidth: how many data points to display for any linegraph across the screen
 * updateRate: HARDCODED from delay put into uC. Don't lower below 30, synchronize with uC tx delay
 * timeIndex: the number to display as x value data
 */
let timeIndex = 0;

/**
 * Pure component for rendering raw channels.
 * Receives Device (connected state enforced by parent) object as a prop to manipulate
 */
export default class RawDataStream extends PureComponent {
  
  constructor(props) {
    super(props);
    this.state = {
      //the array of values for each channel
      r0values: [{x: 0, y: 2200}],
      i0values: [{x: 0, y: 1500}],
      g0values: [{x: 0, y: 300}],
      r1values: [{x: 0, y: 2200}],
      i1values: [{x: 0, y: 1500}],
      g1values: [{x: 0, y: 300}],
      r2values: [{x: 0, y: 2200}],
      i2values: [{x: 0, y: 1500}],
      g2values: [{x: 0, y: 100}],
      r3values: [{x: 0, y: 2200}],
      i3values: [{x: 0, y: 1500}],
      g3values: [{x: 0, y: 300}],
      r4values: [{x: 0, y: 2200}],
      i4values: [{x: 0, y: 1500}],
      g4values: [{x: 0, y: 300}],
      r5values: [{x: 0, y: 2200}],
      i5values: [{x: 0, y: 1500}],
      g5values: [{x: 0, y: 300}],
      r6values: [{x: 0, y: 2200}],
      i6values: [{x: 0, y: 1500}],
      g6values: [{x: 0, y: 300}],
      marker: {
        enabled: true,
        digits: 2,
        backgroundTint: processColor('teal'),
        markerColor: processColor('#F0C0FF8C'),
        textColor: processColor('white'),
      },
      //singular values to add to respective value array, shifted in or concat in.
      //depending in recording prop passed in added into file or not.
        r0_val: null,
        r1_val: null,
        r2_val: null,
        r3_val: null,
        r4_val: null,
        r5_val: null,
        r6_val: null,
        i0_val: null,
        i1_val: null,
        i2_val: null,
        i3_val: null,
        i4_val: null,
        i5_val: null,
        i6_val: null,
        g0_val: null,
        g1_val: null,
        g2_val: null,
        g3_val: null,
        g4_val: null,
        g5_val: null,
        g6_val: null,
      //   ax_val: null,
      //   ay_val: null,
      //   az_val: null,
      //   gx_val: null,
      //   gy_val: null,
      //   gz_val: null,
      //   dev_info: {
      //       manufact_name: null,
      //       model_num: null,
      //       hardware_version: null,
      //       firmware_version: null,
      //       system_id: null,
      //   },
      // },
    };
  }

/**
 * This function attaches and formats the value arrays to the rendered graph. 
 * Add or remove values from dataSet based on NUM_PPG configured
 * value data is contained in data, x data below.
 * TODO: dynamically handle based off of NUM_PPG
 * @param {*} r0values 
 * @param {*} i0values 
 * @param {*} g0values 
 * @param {*} r1values 
 * @param {*} i1values 
 * @param {*} g1values 
 * @param {*} r2values 
 * @param {*} i2values 
 * @param {*} g2values
 * @param {*} r3values 
 * @param {*} i3values 
 * @param {*} g3values
 * @param {*} r4values 
 * @param {*} i4values 
 * @param {*} g4values
 * @param {*} r5values 
 * @param {*} i5values 
 * @param {*} g5values
 * @param {*} r6values 
 * @param {*} i6values 
 * @param {*} g6values
 */
  next(r0values,i0values,g0values,r1values,i1values,g1values,
    r2values,i2values,g2values,r3values,i3values,g3values,
    r4values,i4values,g4values,r5values,i5values,g5values,
    r6values,i6values,g6values) {
    if(BLEconfig.deviceSetup.NUM_PPG == 1){
      return {
        data: {
          dataSets: [
            {
              values: r0values,
              //time: time,
              label: 'red0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i0values,
              //time: time,
              label: 'ir0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[1],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g0values,
              //time: time,
              label: 'green0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[2],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
          ],
        },
        xAxis: {
          axisLineWidth: 0,
          drawLabels: true,
          position: 'BOTTOM',
          drawGridLines: true,
        },
      };
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 2){
      return {
        data: {
          dataSets: [
            {
              values: r0values,
              //time: time,
              label: 'red0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i0values,
              //time: time,
              label: 'ir0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[1],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g0values,
              //time: time,
              label: 'green0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[2],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r1values,
              //time: time,
              label: 'red1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[3],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i1values,
              //time: time,
              label: 'ir1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[4],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g1values,
              //time: time,
              label: 'green1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[5],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
          ],
        },
        xAxis: {
          axisLineWidth: 0,
          drawLabels: true,
          position: 'BOTTOM',
          drawGridLines: true,
        },
      };
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 3){
      return {
        data: {
          dataSets: [
            {
              values: r0values,
              //time: time,
              label: 'red0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i0values,
              //time: time,
              label: 'ir0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[1],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g0values,
              //time: time,
              label: 'green0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[2],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r1values,
              //time: time,
              label: 'red1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[3],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i1values,
              //time: time,
              label: 'ir1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[4],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g1values,
              //time: time,
              label: 'green1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[5],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r2values,
              //time: time,
              label: 'red2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[6],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i2values,
              //time: time,
              label: 'ir2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[7],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g2values,
              //time: time,
              label: 'green2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[8],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
          ],
        },
        xAxis: {
          axisLineWidth: 0,
          drawLabels: true,
          position: 'BOTTOM',
          drawGridLines: true,
        },
      };
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 4){
      return {
        data: {
          dataSets: [
            {
              values: r0values,
              //time: time,
              label: 'red0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i0values,
              //time: time,
              label: 'ir0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[1],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g0values,
              //time: time,
              label: 'green0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[2],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r1values,
              //time: time,
              label: 'red1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[3],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i1values,
              //time: time,
              label: 'ir1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[4],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g1values,
              //time: time,
              label: 'green1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[5],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r2values,
              //time: time,
              label: 'red2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[6],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i2values,
              //time: time,
              label: 'ir2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[7],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g2values,
              //time: time,
              label: 'green2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[8],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r3values,
              //time: time,
              label: 'red3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[9],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i3values,
              //time: time,
              label: 'ir3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[10],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g3values,
              //time: time,
              label: 'green3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[11],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
          ],
        },
        xAxis: {
          axisLineWidth: 0,
          drawLabels: true,
          position: 'BOTTOM',
          drawGridLines: true,
        },
      };
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 5){
      return {
        data: {
          dataSets: [
            {
              values: r0values,
              //time: time,
              label: 'red0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i0values,
              //time: time,
              label: 'ir0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[1],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g0values,
              //time: time,
              label: 'green0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[2],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r1values,
              //time: time,
              label: 'red1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[3],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i1values,
              //time: time,
              label: 'ir1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[4],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g1values,
              //time: time,
              label: 'green1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[5],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r2values,
              //time: time,
              label: 'red2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[6],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i2values,
              //time: time,
              label: 'ir2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[7],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g2values,
              //time: time,
              label: 'green2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[8],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r3values,
              //time: time,
              label: 'red3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[9],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i3values,
              //time: time,
              label: 'ir3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[10],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g3values,
              //time: time,
              label: 'green3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[11],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r4values,
              //time: time,
              label: 'red4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[12],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i4values,
              //time: time,
              label: 'ir4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[13],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g4values,
              //time: time,
              label: 'green4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[14],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
          ],
        },
        xAxis: {
          axisLineWidth: 0,
          drawLabels: true,
          position: 'BOTTOM',
          drawGridLines: true,
        },
      };
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 6){
      return {
        data: {
          dataSets: [
            {
              values: r0values,
              //time: time,
              label: 'red0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i0values,
              //time: time,
              label: 'ir0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[1],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g0values,
              //time: time,
              label: 'green0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[2],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r1values,
              //time: time,
              label: 'red1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[3],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i1values,
              //time: time,
              label: 'ir1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[4],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g1values,
              //time: time,
              label: 'green1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[5],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r2values,
              //time: time,
              label: 'red2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[6],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i2values,
              //time: time,
              label: 'ir2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[7],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g2values,
              //time: time,
              label: 'green2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[8],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r3values,
              //time: time,
              label: 'red3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[9],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i3values,
              //time: time,
              label: 'ir3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[10],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g3values,
              //time: time,
              label: 'green3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[11],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r4values,
              //time: time,
              label: 'red4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[12],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i4values,
              //time: time,
              label: 'ir4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[13],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g4values,
              //time: time,
              label: 'green4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[14],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r5values,
              //time: time,
              label: 'red5',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[15],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i5values,
              //time: time,
              label: 'ir5',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[16],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g5values,
              //time: time,
              label: 'green5',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[17],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
          ],
        },
        xAxis: {
          axisLineWidth: 0,
          drawLabels: true,
          position: 'BOTTOM',
          drawGridLines: true,
        },
      };
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 7){
      return {
        data: {
          dataSets: [
            {
              values: r0values,
              //time: time,
              label: 'red0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i0values,
              //time: time,
              label: 'ir0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[1],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g0values,
              //time: time,
              label: 'green0',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[2],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r1values,
              //time: time,
              label: 'red1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[3],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i1values,
              //time: time,
              label: 'ir1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[4],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g1values,
              //time: time,
              label: 'green1',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[5],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r2values,
              //time: time,
              label: 'red2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[6],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i2values,
              //time: time,
              label: 'ir2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[7],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g2values,
              //time: time,
              label: 'green2',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[8],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r3values,
              //time: time,
              label: 'red3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[9],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i3values,
              //time: time,
              label: 'ir3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[10],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g3values,
              //time: time,
              label: 'green3',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[11],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r4values,
              //time: time,
              label: 'red4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[12],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i4values,
              //time: time,
              label: 'ir4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[13],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g4values,
              //time: time,
              label: 'green4',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[14],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r5values,
              //time: time,
              label: 'red5',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[15],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i5values,
              //time: time,
              label: 'ir5',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[16],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g5values,
              //time: time,
              label: 'green5',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[17],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
            {
              values: r6values,
              //time: time,
              label: 'red6',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[18],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
              },
            },
            {
              values: i6values,
              //time: time,
              label: 'ir6',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[19],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
          },
            {
              values: g6values,
              //time: time,
              label: 'green6',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[20],
                mode: 'CUBIC_BEZIER',
                drawCircles: false,
                lineWidth: 2,
            },
            },
          ],
        },
        xAxis: {
          axisLineWidth: 0,
          drawLabels: true,
          position: 'BOTTOM',
          drawGridLines: true,
        },
      };
    }
  }

  /**
   * Each shift function handles a different array:
   * create copy and slice the values, shift the array over, assing new X variables to last ele in array
   * return coped array
   * @param {*} values 
   */
  r0shiftData(values) {
    let temp = values.slice(); //both x and y get sliced
    temp.shift(); //both x and y get shifted
    temp[temp.length] = this.state.r0_val;
    return temp;
  }
  i0shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.i0_val; //replace last element with new data
    return temp;
  }
  g0shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.g0_val;
    return temp;
  }
  r1shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.r1_val;
    return temp;
  }
  i1shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.i1_val; //replace last element with new data
    return temp;
  }
  g1shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.g1_val;
    return temp;
  }
  r2shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.r2_val;
    return temp;
  }
  i2shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.i2_val; //replace last element with new data
    return temp;
  }
  g2shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.g2_val;
    return temp;
  }
  r3shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.r3_val;
    return temp;
  }
  i3shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.i3_val; //replace last element with new data
    return temp;
  }
  g3shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.g3_val;
    return temp;
  }
  r4shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.r4_val;
    return temp;
  }
  i4shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.i4_val; //replace last element with new data
    return temp;
  }
  g4shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.g4_val;
    return temp;
  }
  r5shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.r5_val;
    return temp;
  }
  i5shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.i5_val; //replace last element with new data
    return temp;
  }
  g5shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.g5_val;
    return temp;
  }
  r6shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.r6_val;
    return temp;
  }
  i6shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.i6_val; //replace last element with new data
    return temp;
  }
  g6shiftData(values) {
    let temp = values.slice();
    temp.shift();
    temp[temp.length] = this.state.g6_val;
    return temp;
  }

  /**
   * Start recording the values after creating file if configured for recording  
   */
  record(r0_val,i0_val,g0_val){
      RNFS.appendFile(path+this.props.filename, r0_val+','+i0_val+','+g0_val+'\r\n', 'ascii')
      .then((success) => {
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  /**
   * Called when component is initialized (after constructor) to mount channels.
   * If recording is enabled, append the data file with the popped value when update rate is triggered
   */
  componentDidMount() {
    if(this.props.device.name != null){
    
    this.subscribeToChannels();
    if (this.state.r0values.length >= this.props.dataWidth) {
      console.log("some mount error..");
    } 
    if(this.state.r0values.length >= 1 && this.state.r0values.length < this.props.dataWidth && this.state.r0_val != null) {
        console.log("some mount error..");
    }
    if(this.state.r0values < 1 || this.state.r0_val == null){
      //this.refs.rawChart.highlights([]);
            // https://github.com/PhilJay/MPAndroidChart/issues/2450
      // MpAndroidChart 3.0.2 will crash when data entry list is empty.
      console.log("origin mount");
      
      /**Only mount the channels that are present in the BLE broadcast/ configured!**/
      if(BLEconfig.deviceSetup.NUM_PPG == 1){
        this.setState({
          r0values: this.state.r0values.concat({
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            y: 200,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 2){
        this.setState({
          r0values: this.state.r0values.concat({
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 3){
        this.setState({
          r0values: this.state.r0values.concat({
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 4){
        this.setState({
          r0values: this.state.r0values.concat({
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 5){
        this.setState({
          r0values: this.state.r0values.concat({
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            y: 300,
          }),
          r4values: this.state.r4values.concat({
            y: 1600,
          }),
          i4values: this.state.i4values.concat({
            y: 1000,
          }),
          g4values: this.state.g4values.concat({
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 6){
        this.setState({
          r0values: this.state.r0values.concat({
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            y: 300,
          }),
          r4values: this.state.r4values.concat({
            y: 1600,
          }),
          i4values: this.state.i4values.concat({
            y: 1000,
          }),
          g4values: this.state.g4values.concat({
            y: 300,
          }),
          r5values: this.state.r5values.concat({
            y: 1600,
          }),
          i5values: this.state.i5values.concat({
            y: 1000,
          }),
          g5values: this.state.g5values.concat({
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 7){
        this.setState({
          r0values: this.state.r0values.concat({
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            y: 300,
          }),
          r4values: this.state.r4values.concat({
            y: 1600,
          }),
          i4values: this.state.i4values.concat({
            y: 1000,
          }),
          g4values: this.state.g4values.concat({
            y: 300,
          }),
          r5values: this.state.r5values.concat({
            y: 1600,
          }),
          i5values: this.state.i5values.concat({
            y: 1000,
          }),
          g5values: this.state.g5values.concat({
            y: 300,
          }),
          r6values: this.state.r6values.concat({
            y: 1600,
          }),
          i6values: this.state.i6values.concat({
            y: 1000,
          }),
          g6values: this.state.g6values.concat({
            y: 300,
          }),
        });
      }
    }
    //ms timer implementation
    this.interval = setInterval(() => {
        timeIndex = timeIndex+this.props.updateRate;
        /**Only mount the channels that are present in the BLE broadcast/ configured!**/
        if(BLEconfig.deviceSetup.NUM_PPG == 1){
          this.setState({
              r0_val : r0,
              i0_val: i0,
              g0_val : g0
          });
          //if recording enabled output the enabled channels into the filename
          if(this.state.r0_val !== null && this.state.r0_val !== undefined &&
            this.state.i0_val !== null && this.state.i0_val !== undefined &&
            this.state.g0_val !== null && this.state.g0_val !== undefined
            && this.props.isRecording){
            this.record(this.state.r0_val, this.state.i0_val,this.state.g0_val);
          }
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 2){
          //console.log('r1: '+r1+' i1: '+i1+' g1: '+g1);
          this.setState({
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 3){
          this.setState({
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
              r2_val : r2,
              i2_val: i2,
              g2_val : g2,
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 4){
          this.setState({
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
              r2_val : r2,
              i2_val: i2,
              g2_val : g2,
              r3_val : r3,
              i3_val: i3,
              g3_val : g3,
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 5){
          this.setState({
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
              r2_val : r2,
              i2_val: i2,
              g2_val : g2,
              r3_val : r3,
              i3_val: i3,
              g3_val : g3,
              r4_val : r4,
              i4_val: i4,
              g4_val : g4,
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 6){
          this.setState({
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
              r2_val : r2,
              i2_val: i2,
              g2_val : g2,
              r3_val : r3,
              i3_val: i3,
              g3_val : g3,
              r4_val : r4,
              i4_val: i4,
              g4_val : g4,
              r5_val : r5,
              i5_val: i5,
              g5_val : g5,
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 7){
          this.setState({
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
              r2_val : r2,
              i2_val: i2,
              g2_val : g2,
              r3_val : r3,
              i3_val: i3,
              g3_val : g3,
              r4_val : r4,
              i4_val: i4,
              g4_val : g4,
              r5_val : r5,
              i5_val: i5,
              g5_val : g5,
              r6_val : r6,
              i6_val: i6,
              g6_val : g6,
          });
        }
    }, this.props.updateRate);
    }
  }
  /**
   * Called when component is removed. Remove all subscriptions and Async tasks 
   */
  componentWillUnmount() {
      clearInterval(this.interval); //clear update interval
      //unsubscribe from channels
    switch(BLEconfig.deviceSetup.NUM_PPG){
      case 1:
        r0subscribe.remove();i0subscribe.remove();g0subscribe.remove();
      break;
      case 2:
        r0subscribe.remove();i0subscribe.remove();g0subscribe.remove();
        r1subscribe.remove();i1subscribe.remove();g1subscribe.remove();
      break;
      case 3:
        r0subscribe.remove();i0subscribe.remove();g0subscribe.remove();
        r1subscribe.remove();i1subscribe.remove();g1subscribe.remove();
        r2subscribe.remove();i2subscribe.remove();g2subscribe.remove();
      break;
      case 4:
        r0subscribe.remove();i0subscribe.remove();g0subscribe.remove();
        r1subscribe.remove();i1subscribe.remove();g1subscribe.remove();
        r2subscribe.remove();i2subscribe.remove();g2subscribe.remove();
        r3subscribe.remove();i3subscribe.remove();g3subscribe.remove();
      break;
      case 5:
        r0subscribe.remove();i0subscribe.remove();g0subscribe.remove();
        r1subscribe.remove();i1subscribe.remove();g1subscribe.remove();
        r2subscribe.remove();i2subscribe.remove();g2subscribe.remove();
        r3subscribe.remove();i3subscribe.remove();g3subscribe.remove();
        r4subscribe.remove();i4subscribe.remove();g4subscribe.remove();
      break;
      case 6:
        r0subscribe.remove();i0subscribe.remove();g0subscribe.remove();
        r1subscribe.remove();i1subscribe.remove();g1subscribe.remove();
        r2subscribe.remove();i2subscribe.remove();g2subscribe.remove();
        r3subscribe.remove();i3subscribe.remove();g3subscribe.remove();
        r4subscribe.remove();i4subscribe.remove();g4subscribe.remove();
        r5subscribe.remove();i5subscribe.remove();g5subscribe.remove();
      break;
      case 7:
        r0subscribe.remove();i0subscribe.remove();g0subscribe.remove();
        r1subscribe.remove();i1subscribe.remove();g1subscribe.remove();
        r2subscribe.remove();i2subscribe.remove();g2subscribe.remove();
        r3subscribe.remove();i3subscribe.remove();g3subscribe.remove();
        r4subscribe.remove();i4subscribe.remove();g4subscribe.remove();
        r5subscribe.remove();i5subscribe.remove();g5subscribe.remove();
        r6subscribe.remove();i6subscribe.remove();g6subscribe.remove();
      break;
    }
  }


/**
 * Function subscribes to the characteristics of the BLE device based on configured PPG
 */
  async subscribeToChannels(){
    await this.props.device.discoverAllServicesAndCharacteristics();
    if(BLEconfig.deviceSetup.NUM_PPG == 1){
        r0subscribe = await this.props.device.monitorCharacteristicForService(
          BLEconfig.channelSID,
          BLEconfig.channelCID.r0,
          (error, chr) => {
            let basesixfour = chr.value;
            let basedec= getDecFrom64(basesixfour);
            r0 = basedec;
              if(this.state.r0values.length >= this.props.dataWidth){
                  this.setState({
                    r0values: this.r0shiftData(this.state.r0values),
                  });
              }else{
                this.setState({
                  r0values: this.state.r0values.concat({
                    y: basedec
                  })
                })
              }
            }
      ); //subscription to BLE char
      i0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.i0,
          (error, chr) => {
            let basesixfour = chr.value;
            let basedec= getDecFrom64(basesixfour);
            i0 = basedec;
              if(this.state.i0values.length >= this.props.dataWidth){
                  this.setState({
                    i0values: this.i0shiftData(this.state.i0values),
                  });
              }else{
                this.setState({
                  i0values: this.state.i0values.concat({
                    y: basedec
                  })
                })
              }
          }
      ); //subscription to BLE char
      g0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.g0,
          (error, chr) => {
            let basesixfour = chr.value;
            let basedec= getDecFrom64(basesixfour);
            g0 = basedec;
                if(this.state.g0values.length >= this.props.dataWidth){
                    this.setState({
                      g0values: this.g0shiftData(this.state.g0values),
                    });
                }else{
                  this.setState({
                    g0values: this.state.g0values.concat({
                      y: basedec
                    })
                  })
                }
          }
      ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 2){
      r0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= this.props.dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    i0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= this.props.dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    g0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= this.props.dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= this.props.dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= this.props.dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= this.props.dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 3){
      r0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= this.props.dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    i0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= this.props.dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    g0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= this.props.dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= this.props.dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= this.props.dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= this.props.dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= this.props.dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= this.props.dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= this.props.dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 4){
      r0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= this.props.dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    i0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= this.props.dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    g0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= this.props.dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= this.props.dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= this.props.dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= this.props.dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= this.props.dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= this.props.dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= this.props.dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= this.props.dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= this.props.dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= this.props.dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 5){
      r0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= this.props.dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    i0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= this.props.dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    g0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= this.props.dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= this.props.dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= this.props.dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= this.props.dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= this.props.dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= this.props.dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= this.props.dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= this.props.dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= this.props.dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= this.props.dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r4,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r4 = basedec;
          if(this.state.r4values.length >= this.props.dataWidth){
              this.setState({
                r4values: this.r4shiftData(this.state.r4values),
              });
          }else{
            this.setState({
              r4values: this.state.r4values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i4 = basedec;
            if(this.state.i4values.length >= this.props.dataWidth){
                this.setState({
                  i4values: this.i4shiftData(this.state.i4values),
                });
            }else{
              this.setState({
                i4values: this.state.i4values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g4 = basedec;
              if(this.state.g4values.length >= this.props.dataWidth){
                  this.setState({
                    g4values: this.g4shiftData(this.state.g4values),
                  });
              }else{
                this.setState({
                  g4values: this.state.g4values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 6){
      r0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= this.props.dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    i0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= this.props.dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    g0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= this.props.dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= this.props.dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= this.props.dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= this.props.dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= this.props.dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= this.props.dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= this.props.dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= this.props.dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= this.props.dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= this.props.dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r4,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r4 = basedec;
          if(this.state.r4values.length >= this.props.dataWidth){
              this.setState({
                r4values: this.r4shiftData(this.state.r4values),
              });
          }else{
            this.setState({
              r4values: this.state.r4values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i4 = basedec;
            if(this.state.i4values.length >= this.props.dataWidth){
                this.setState({
                  i4values: this.i4shiftData(this.state.i4values),
                });
            }else{
              this.setState({
                i4values: this.state.i4values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g4 = basedec;
              if(this.state.g4values.length >= this.props.dataWidth){
                  this.setState({
                    g4values: this.g4shiftData(this.state.g4values),
                  });
              }else{
                this.setState({
                  g4values: this.state.g4values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r5subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r5,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r5 = basedec;
          if(this.state.r5values.length >= this.props.dataWidth){
              this.setState({
                r5values: this.r5shiftData(this.state.r5values),
              });
          }else{
            this.setState({
              r5values: this.state.r5values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i5subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i5 = basedec;
            if(this.state.i5values.length >= this.props.dataWidth){
                this.setState({
                  i5values: this.i5shiftData(this.state.i5values),
                });
            }else{
              this.setState({
                i5values: this.state.i5values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g5subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g5 = basedec;
              if(this.state.g5values.length >= this.props.dataWidth){
                  this.setState({
                    g5values: this.g5shiftData(this.state.g5values),
                  });
              }else{
                this.setState({
                  g5values: this.state.g5values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 7){
      r0subscribe = await this.props.device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= this.props.dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    i0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= this.props.dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    g0subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= this.props.dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= this.props.dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= this.props.dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g1subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= this.props.dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= this.props.dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= this.props.dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g2subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= this.props.dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= this.props.dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= this.props.dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g3subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= this.props.dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r4,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r4 = basedec;
          if(this.state.r4values.length >= this.props.dataWidth){
              this.setState({
                r4values: this.r4shiftData(this.state.r4values),
              });
          }else{
            this.setState({
              r4values: this.state.r4values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i4 = basedec;
            if(this.state.i4values.length >= this.props.dataWidth){
                this.setState({
                  i4values: this.i4shiftData(this.state.i4values),
                });
            }else{
              this.setState({
                i4values: this.state.i4values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g4subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g4 = basedec;
              if(this.state.g4values.length >= this.props.dataWidth){
                  this.setState({
                    g4values: this.g4shiftData(this.state.g4values),
                  });
              }else{
                this.setState({
                  g4values: this.state.g4values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r5subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r5,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r5 = basedec;
          if(this.state.r5values.length >= this.props.dataWidth){
              this.setState({
                r5values: this.r5shiftData(this.state.r5values),
              });
          }else{
            this.setState({
              r5values: this.state.r5values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i5subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i5 = basedec;
            if(this.state.i5values.length >= this.props.dataWidth){
                this.setState({
                  i5values: this.i5shiftData(this.state.i5values),
                });
            }else{
              this.setState({
                i5values: this.state.i5values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g5subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g5 = basedec;
              if(this.state.g5values.length >= this.props.dataWidth){
                  this.setState({
                    g5values: this.g5shiftData(this.state.g5values),
                  });
              }else{
                this.setState({
                  g5values: this.state.g5values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    r6subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r6,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r6 = basedec;
          if(this.state.r6values.length >= this.props.dataWidth){
              this.setState({
                r6values: this.r6shiftData(this.state.r6values),
              });
          }else{
            this.setState({
              r6values: this.state.r6values.concat({
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    i6subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i6,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i6 = basedec;
            if(this.state.i6values.length >= this.props.dataWidth){
                this.setState({
                  i6values: this.i6shiftData(this.state.i6values),
                });
            }else{
              this.setState({
                i6values: this.state.i6values.concat({
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    g6subscribe = await this.props.device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g6,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g6 = basedec;
              if(this.state.g6values.length >= this.props.dataWidth){
                  this.setState({
                    g6values: this.g6shiftData(this.state.g6values),
                  });
              }else{
                this.setState({
                  g6values: this.state.g6values.concat({
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
  }

  
  render() {
    //console.log("render: "+renderCnt);
    //++renderCnt;
    const {r0values,i0values,g0values,r1values,i1values,g1values,
      r2values,i2values,g2values,r3values,i3values,g3values,
      r4values,i4values,g4values,r5values,i5values,g5values,
      r6values,i6values,g6values} = this.state;
    const config = this.next(r0values,i0values,g0values,r1values,i1values,g1values,
      r2values,i2values,g2values,r3values,i3values,g3values,
      r4values,i4values,g4values,r5values,i5values,g5values,
      r6values,i6values,g6values);
    if(this.state.r0_val != null){
      return (
              <LineChart
                data={config.data}
                xAxis={config.xAxis}
                style={styles.container}
                marker={this.state.marker}
                ref="rawChart"
              />
      );
    }
    else{
      return(
          <View style={styles.rowItemBold}>
            <Animatable.Text animation="pulse" easing="ease-out" iterationCount="infinite" style={{fontSize: 35, fontWeight: '100'}}>Loading...</Animatable.Text>
            <Animatable.Text animation="pulse" easing="ease-out" iterationCount="infinite" style={{fontSize: 75}}>❤️</Animatable.Text>
          </View>
      );
    }
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
    graphTitle: {
      fontSize: 20,
      paddingLeft: 15,
      alignSelf: 'center',
      fontWeight: 'bold'
    },  
    highlight: {
      fontWeight: '700'
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
      flexDirection: 'row',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 75 
    },
  });
