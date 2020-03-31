/**
 * @format
 * @flow
 * 
 * This component renders all configured channels raw data in line graph form.
 * TODO: split this component into a line graph accepting values to plot and pure BLE middleware ingest code to
 * be maintained globally.
 */

import React, {Component, PureComponent} from 'react';
import {StyleSheet, processColor, View, Text, Platform} from 'react-native';

import {LineChart} from 'react-native-charts-wrapper';
import { BleManager, ScanMode, Service } from 'react-native-ble-plx';
import { getDecFrom64 } from '../utility/DecFrom64';
import BLEconfig from '../../files/bleConfig';

let ScanOptions = { scanMode: ScanMode.LowLatency };
let deviceList = new Map(); //holder for all device
const manager = new BleManager();

let r0,r1,r2,r3,r4,r5,r6;
let i0,i1,i2,i3,i4,i5,i6;
let g0,g1,g2,g3,g4,g5,g6;
let renderCnt = 0;

//TODO: move all device/ system ID components into seperate service lookup config file!


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

let dataWidth = 50; // #samples 100ms * 100 = 10s
let updateRate = 33;
let timeIndex = 0;

//const manager = new BleManager();

export default class RawDataStream extends PureComponent {
  static displayName = 'DataStream';

  constructor(props) {
    super(props);
    //manager =  this.props.manager;
    this.state = {
      //values: [0], //initialize for
      r0values: [{x: 0, y: 0}],
      i0values: [{x: 0, y: 0}],
      g0values: [{x: 0, y: 0}],
      r1values: [{x: 0, y: 0}],
      i1values: [{x: 0, y: 0}],
      g1values: [{x: 0, y: 0}],
      r2values: [{x: 0, y: 0}],
      i2values: [{x: 0, y: 0}],
      g2values: [{x: 0, y: 0}],
      r3values: [{x: 0, y: 0}],
      i3values: [{x: 0, y: 0}],
      g3values: [{x: 0, y: 0}],
      r4values: [{x: 0, y: 0}],
      i4values: [{x: 0, y: 0}],
      g4values: [{x: 0, y: 0}],
      r5values: [{x: 0, y: 0}],
      i5values: [{x: 0, y: 0}],
      g5values: [{x: 0, y: 0}],
      r6values: [{x: 0, y: 0}],
      i6values: [{x: 0, y: 0}],
      g6values: [{x: 0, y: 0}],
      marker: {
        enabled: true,
        digits: 2,
        backgroundTint: processColor('teal'),
        markerColor: processColor('#F0C0FF8C'),
        textColor: processColor('white'),
      },
      deviceLIST: [],
      device: {
        connected: false,  
        name: null,
        id: null,
        rssi: null,
        batt_lvl: null,
        heart_rate: null,
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
        ax_val: null,
        ay_val: null,
        az_val: null,
        gx_val: null,
        gy_val: null,
        gz_val: null,
        dev_info: {
            manufact_name: null,
            model_num: null,
            hardware_version: null,
            firmware_version: null,
            system_id: null,
        },
      },
    };
  }


  // getOrientation = () => {
  //   if (this.refs.rootView) {
  //     if (Dimensions.get('window').width < Dimensions.get('window').height) {
  //       this.setState({ orientation: 'portrait' });
  //     } else {
  //       this.setState({ orientation: 'landscape' });
  //     }
  //   }
  // };


  next(r0values, i0values, g0values) {
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
          }
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

  r0shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.r0_val;
    return temp;
  }
  i0shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    //console.log(temp);
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.device.i0_val; //replace last element with new data
    return temp;
  }
  g0shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.g0_val;
    //temp.concat(this.state.device.g0_val);
    return temp;
  }
  r1shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.r1_val;
    return temp;
  }
  i1shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    //console.log(temp);
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.device.i1_val; //replace last element with new data
    return temp;
  }
  g1shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.g1_val;
    //temp.concat(this.state.device.g0_val);
    return temp;
  }
  r2shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.r2_val;
    return temp;
  }
  i2shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    //console.log(temp);
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.device.i2_val; //replace last element with new data
    return temp;
  }
  g2shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.g2_val;
    //temp.concat(this.state.device.g0_val);
    return temp;
  }
  r3shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.r3_val;
    return temp;
  }
  i3shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    //console.log(temp);
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.device.i3_val; //replace last element with new data
    return temp;
  }
  g3shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.g3_val;
    //temp.concat(this.state.device.g0_val);
    return temp;
  }
  r4shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.r4_val;
    return temp;
  }
  i4shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    //console.log(temp);
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.device.i4_val; //replace last element with new data
    return temp;
  }
  g4shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.g4_val;
    //temp.concat(this.state.device.g0_val);
    return temp;
  }
  r5shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.r5_val;
    return temp;
  }
  i5shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    //console.log(temp);
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.device.i5_val; //replace last element with new data
    return temp;
  }
  g5shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.g5_val;
    //temp.concat(this.state.device.g0_val);
    return temp;
  }
  r6shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.r6_val;
    return temp;
  }
  i6shiftData(values) {
    let temp = values.slice(); //turns temp into array of all elements
    //console.log(temp);
    temp.shift();//removes first element from temp array
    temp[temp.length] = this.state.device.i6_val; //replace last element with new data
    return temp;
  }
  g6shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp[temp.length] = this.state.device.g6_val;
    //temp.concat(this.state.device.g0_val);
    return temp;
  }

  componentDidMount() {
    manager.enable(); //enable hardware bluetooth stack
    const subscription = manager.onStateChange(bleState => {
    if (bleState === 'PoweredOn') {
        //console.log("scanning devices");
        this.scanDevices(); //start scanning for devices immediately
            //test r0 value length, as it is first and must be present
    if (this.state.r0values.length >= dataWidth) {
      // https://github.com/PhilJay/MPAndroidChart/issues/2450
      // MpAndroidChart 3.0.2 will crash when data entry list is empty.

      this.refs.rawChart.highlights([]);
      //shift values left continually
      /**Only update the channels that are present in BLE broadcast!**/
      if(BLEconfig.deviceSetup.NUM_PPG == 1){
        this.setState({
          r0values: this.r0shiftData(this.state.r0values),
          i0values: this.i0shiftData(this.state.i0values),
          g0values: this.g0shiftData(this.state.g0values),
        }); 
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 2){
        this.setState({
          r0values: this.r0shiftData(this.state.r0values),
          i0values: this.i0shiftData(this.state.i0values),
          g0values: this.g0shiftData(this.state.g0values),
          r1values: this.r1shiftData(this.state.r1values),
          i1values: this.i1shiftData(this.state.i1values),
          g1values: this.g1shiftData(this.state.g1values),
        }); 
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 3){
        this.setState({
          r0values: this.r0shiftData(this.state.r0values),
          i0values: this.i0shiftData(this.state.i0values),
          g0values: this.g0shiftData(this.state.g0values),
          r1values: this.r1shiftData(this.state.r1values),
          i1values: this.i1shiftData(this.state.i1values),
          g1values: this.g1shiftData(this.state.g1values),
          r2values: this.r2shiftData(this.state.r2values),
          i2values: this.i2shiftData(this.state.i2values),
          g2values: this.g2shiftData(this.state.g2values),
        }); 
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 4){
        this.setState({
          r0values: this.r0shiftData(this.state.r0values),
          i0values: this.i0shiftData(this.state.i0values),
          g0values: this.g0shiftData(this.state.g0values),
          r1values: this.r1shiftData(this.state.r1values),
          i1values: this.i1shiftData(this.state.i1values),
          g1values: this.g1shiftData(this.state.g1values),
          r2values: this.r2shiftData(this.state.r2values),
          i2values: this.i2shiftData(this.state.i2values),
          g2values: this.g2shiftData(this.state.g2values),
          r3values: this.r3shiftData(this.state.r3values),
          i3values: this.i3shiftData(this.state.i3values),
          g3values: this.g3shiftData(this.state.g3values),
        }); 
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 5){
        this.setState({
          r0values: this.r0shiftData(this.state.r0values),
          i0values: this.i0shiftData(this.state.i0values),
          g0values: this.g0shiftData(this.state.g0values),
          r1values: this.r1shiftData(this.state.r1values),
          i1values: this.i1shiftData(this.state.i1values),
          g1values: this.g1shiftData(this.state.g1values),
          r2values: this.r2shiftData(this.state.r2values),
          i2values: this.i2shiftData(this.state.i2values),
          g2values: this.g2shiftData(this.state.g2values),
          r3values: this.r3shiftData(this.state.r3values),
          i3values: this.i3shiftData(this.state.i3values),
          g3values: this.g3shiftData(this.state.g3values),
          r4values: this.r4shiftData(this.state.r4values),
          i4values: this.i4shiftData(this.state.i4values),
          g4values: this.g4shiftData(this.state.g4values),
        }); 
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 6){
        this.setState({
          r0values: this.r0shiftData(this.state.r0values),
          i0values: this.i0shiftData(this.state.i0values),
          g0values: this.g0shiftData(this.state.g0values),
          r1values: this.r1shiftData(this.state.r1values),
          i1values: this.i1shiftData(this.state.i1values),
          g1values: this.g1shiftData(this.state.g1values),
          r2values: this.r2shiftData(this.state.r2values),
          i2values: this.i2shiftData(this.state.i2values),
          g2values: this.g2shiftData(this.state.g2values),
          r3values: this.r3shiftData(this.state.r3values),
          i3values: this.i3shiftData(this.state.i3values),
          g3values: this.g3shiftData(this.state.g3values),
          r4values: this.r4shiftData(this.state.r4values),
          i4values: this.i4shiftData(this.state.i4values),
          g4values: this.g4shiftData(this.state.g4values),
          r5values: this.r5shiftData(this.state.r5values),
          i5values: this.i5shiftData(this.state.i5values),
          g5values: this.g5shiftData(this.state.g5values),
        }); 
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 7){
        this.setState({
          r0values: this.r0shiftData(this.state.r0values),
          i0values: this.i0shiftData(this.state.i0values),
          g0values: this.g0shiftData(this.state.g0values),
          r1values: this.r1shiftData(this.state.r1values),
          i1values: this.i1shiftData(this.state.i1values),
          g1values: this.g1shiftData(this.state.g1values),
          r2values: this.r2shiftData(this.state.r2values),
          i2values: this.i2shiftData(this.state.i2values),
          g2values: this.g2shiftData(this.state.g2values),
          r3values: this.r3shiftData(this.state.r3values),
          i3values: this.i3shiftData(this.state.i3values),
          g3values: this.g3shiftData(this.state.g3values),
          r4values: this.r4shiftData(this.state.r4values),
          i4values: this.i4shiftData(this.state.i4values),
          g4values: this.g4shiftData(this.state.g4values),
          r5values: this.r6shiftData(this.state.r5values),
          i5values: this.i6shiftData(this.state.i5values),
          g5values: this.g6shiftData(this.state.g5values),
          r6values: this.r6shiftData(this.state.r6values),
          i6values: this.i6shiftData(this.state.i6values),
          g6values: this.g6shiftData(this.state.g6values),
        }); 
      }
    } else {
      
      /**Only mount the channels that are present in the BLE broadcast/ configured!**/
      if(BLEconfig.deviceSetup.NUM_PPG == 1){
        this.setState({
          r0values: this.state.r0values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            x: timeIndex,
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 2){
        this.setState({
          r0values: this.state.r0values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            x: timeIndex,
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            x: timeIndex,
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 3){
        this.setState({
          r0values: this.state.r0values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            x: timeIndex,
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            x: timeIndex,
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            x: timeIndex,
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 4){
        this.setState({
          r0values: this.state.r0values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            x: timeIndex,
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            x: timeIndex,
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            x: timeIndex,
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            x: timeIndex,
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 5){
        this.setState({
          r0values: this.state.r0values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            x: timeIndex,
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            x: timeIndex,
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            x: timeIndex,
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            x: timeIndex,
            y: 300,
          }),
          r4values: this.state.r4values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i4values: this.state.i4values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g4values: this.state.g4values.concat({
            x: timeIndex,
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 6){
        this.setState({
          r0values: this.state.r0values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            x: timeIndex,
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            x: timeIndex,
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            x: timeIndex,
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            x: timeIndex,
            y: 300,
          }),
          r4values: this.state.r4values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i4values: this.state.i4values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g4values: this.state.g4values.concat({
            x: timeIndex,
            y: 300,
          }),
          r5values: this.state.r5values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i5values: this.state.i5values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g5values: this.state.g5values.concat({
            x: timeIndex,
            y: 300,
          }),
        });
      }
      if(BLEconfig.deviceSetup.NUM_PPG == 7){
        this.setState({
          r0values: this.state.r0values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i0values: this.state.i0values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g0values: this.state.g0values.concat({
            x: timeIndex,
            y: 300,
          }),
          r1values: this.state.r1values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i1values: this.state.i1values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g1values: this.state.g1values.concat({
            x: timeIndex,
            y: 300,
          }),
          r2values: this.state.r2values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i2values: this.state.i2values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g2values: this.state.g2values.concat({
            x: timeIndex,
            y: 300,
          }),
          r3values: this.state.r3values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i3values: this.state.i3values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g3values: this.state.g3values.concat({
            x: timeIndex,
            y: 300,
          }),
          r4values: this.state.r4values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i4values: this.state.i4values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g4values: this.state.g4values.concat({
            x: timeIndex,
            y: 300,
          }),
          r5values: this.state.r5values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i5values: this.state.i5values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g5values: this.state.g5values.concat({
            x: timeIndex,
            y: 300,
          }),
          r6values: this.state.r6values.concat({
            x: timeIndex,
            y: 1600,
          }),
          i6values: this.state.i6values.concat({
            x: timeIndex,
            y: 1000,
          }),
          g6values: this.state.g6values.concat({
            x: timeIndex,
            y: 300,
          }),
        });
      }
    }
    //ms timer implementation
    this.interval = setInterval(() => {
      // if(timeIndex == 1000){
      //   timeIndex = 0;
      // }else{
        timeIndex = timeIndex+updateRate;
        /**Only mount the channels that are present in the BLE broadcast/ configured!**/
        if(BLEconfig.deviceSetup.NUM_PPG == 1){
          this.setState({
            device: {
              r0_val : r0,
              i0_val: i0,
              g0_val : g0
            }
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 2){
          this.setState({
            device: {
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
            }
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 3){
          this.setState({
            device: {
              r0_val : r0,
              i0_val: i0,
              g0_val : g0,
              r1_val : r1,
              i1_val: i1,
              g1_val : g1,
              r2_val : r2,
              i2_val: i2,
              g2_val : g2,
            }
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 4){
          this.setState({
            device: {
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
            }
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 5){
          this.setState({
            device: {
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
            }
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 6){
          this.setState({
            device: {
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
            }
          });
        }
        if(BLEconfig.deviceSetup.NUM_PPG == 7){
          this.setState({
            device: {
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
            }
          });
        }
        //console.log(this.state.device.r0_val);
      // }
    }, updateRate);
    }
    if (bleState === 'PoweredOff') {
        //turn on ble
        manager.enable();
    }
    }, true);

  }

  componentWillUnmount() {
      //disconnect from device
      clearInterval(this.interval);
  }

  scanDevices(){
    manager.startDeviceScan(
      
      //[BLEconfig.devID]
      [BLEconfig.channelSID], //only scan for red service being advertised
        ScanOptions,
        //This function is called for EVERY scanned device!
        (error,device) => {
            if (error) {
                console.log(error.message);
                return;
              }
            if(device.name == 'HemoFlux'){
                manager.stopDeviceScan(); //device found
                //console.log('connecting to device..');
                this.connectToDevice(device);
            }

        }
    );

  }

  async connectToDevice(device){
    //console.log(device.name);
    await device.connect();
    this.setState({
        device: {
            connected: true
        }
    });
    //console.log('connected '+device.id);

    this.getServAndChar(device);
    // this.getServAndChar(device);

  }

  async getServAndChar(device){
    await device.discoverAllServicesAndCharacteristics();
    //TODO: look/handle timeouts on async await options for handling error
    //and handle if they do not exist/ for NUM_PPG configured in json
    // r0 = await device.readCharacteristicForService(BLEconfig.channelSID,BLEconfig.channelCID.r0);
    // i0 = await device.readCharacteristicForService(BLEconfig.channelSID,BLEconfig.channelCID.i0);
    // g0 = await device.readCharacteristicForService(BLEconfig.channelSID,BLEconfig.channelCID.g0);
    if(BLEconfig.deviceSetup.NUM_PPG == 1){
        let r0subscribe = await device.monitorCharacteristicForService(
          BLEconfig.channelSID,
          BLEconfig.channelCID.r0,
          (error, chr) => {
            let basesixfour = chr.value;
            let basedec= getDecFrom64(basesixfour);
            r0 = basedec;
              if(this.state.r0values.length >= dataWidth){
                  this.setState({
                    r0values: this.r0shiftData(this.state.r0values),
                  });
              }else{
                this.setState({
                  r0values: this.state.r0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
            }
      ); //subscription to BLE char
      let i0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.i0,
          (error, chr) => {
            let basesixfour = chr.value;
            let basedec= getDecFrom64(basesixfour);
            i0 = basedec;
              if(this.state.i0values.length >= dataWidth){
                  this.setState({
                    i0values: this.i0shiftData(this.state.i0values),
                  });
              }else{
                this.setState({
                  i0values: this.state.i0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
          }
      ); //subscription to BLE char
      let g0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.g0,
          (error, chr) => {
            let basesixfour = chr.value;
            let basedec= getDecFrom64(basesixfour);
            g0 = basedec;
                if(this.state.g0values.length >= dataWidth){
                    this.setState({
                      g0values: this.g0shiftData(this.state.g0values),
                    });
                }else{
                  this.setState({
                    g0values: this.state.g0values.concat({
                      x: timeIndex,
                      y: basedec
                    })
                  })
                }
          }
      ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 2){
      let r0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    let i0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    let g0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 3){
      let r0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    let i0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    let g0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 4){
      let r0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    let i0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    let g0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 5){
      let r0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    let i0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    let g0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r4,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r4 = basedec;
          if(this.state.r4values.length >= dataWidth){
              this.setState({
                r4values: this.r4shiftData(this.state.r4values),
              });
          }else{
            this.setState({
              r4values: this.state.r4values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i4 = basedec;
            if(this.state.i4values.length >= dataWidth){
                this.setState({
                  i4values: this.i4shiftData(this.state.i4values),
                });
            }else{
              this.setState({
                i4values: this.state.i4values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g4 = basedec;
              if(this.state.g4values.length >= dataWidth){
                  this.setState({
                    g4values: this.g4shiftData(this.state.g4values),
                  });
              }else{
                this.setState({
                  g4values: this.state.g4values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 6){
      let r0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    let i0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    let g0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r4,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r4 = basedec;
          if(this.state.r4values.length >= dataWidth){
              this.setState({
                r4values: this.r4shiftData(this.state.r4values),
              });
          }else{
            this.setState({
              r4values: this.state.r4values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i4 = basedec;
            if(this.state.i4values.length >= dataWidth){
                this.setState({
                  i4values: this.i4shiftData(this.state.i4values),
                });
            }else{
              this.setState({
                i4values: this.state.i4values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g4 = basedec;
              if(this.state.g4values.length >= dataWidth){
                  this.setState({
                    g4values: this.g4shiftData(this.state.g4values),
                  });
              }else{
                this.setState({
                  g4values: this.state.g4values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r5subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r5,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r5 = basedec;
          if(this.state.r5values.length >= dataWidth){
              this.setState({
                r5values: this.r5shiftData(this.state.r5values),
              });
          }else{
            this.setState({
              r5values: this.state.r5values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i5subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i5 = basedec;
            if(this.state.i5values.length >= dataWidth){
                this.setState({
                  i5values: this.i5shiftData(this.state.i5values),
                });
            }else{
              this.setState({
                i5values: this.state.i5values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g5subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g5 = basedec;
              if(this.state.g5values.length >= dataWidth){
                  this.setState({
                    g5values: this.g5shiftData(this.state.g5values),
                  });
              }else{
                this.setState({
                  g5values: this.state.g5values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }
    if(BLEconfig.deviceSetup.NUM_PPG == 7){
      let r0subscribe = await device.monitorCharacteristicForService(
        BLEconfig.channelSID,
        BLEconfig.channelCID.r0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          r0 = basedec;
            if(this.state.r0values.length >= dataWidth){
                this.setState({
                  r0values: this.r0shiftData(this.state.r0values),
                });
            }else{
              this.setState({
                r0values: this.state.r0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
          }
    ); //subscription to BLE char
    let i0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i0 = basedec;
            if(this.state.i0values.length >= dataWidth){
                this.setState({
                  i0values: this.i0shiftData(this.state.i0values),
                });
            }else{
              this.setState({
                i0values: this.state.i0values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char
    let g0subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g0,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g0 = basedec;
              if(this.state.g0values.length >= dataWidth){
                  this.setState({
                    g0values: this.g0shiftData(this.state.g0values),
                  });
              }else{
                this.setState({
                  g0values: this.state.g0values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r1,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r1 = basedec;
          if(this.state.r1values.length >= dataWidth){
              this.setState({
                r1values: this.r1shiftData(this.state.r1values),
              });
          }else{
            this.setState({
              r1values: this.state.r1values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i1 = basedec;
            if(this.state.i1values.length >= dataWidth){
                this.setState({
                  i1values: this.i1shiftData(this.state.i1values),
                });
            }else{
              this.setState({
                i1values: this.state.i1values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g1subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g1,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g1 = basedec;
              if(this.state.g1values.length >= dataWidth){
                  this.setState({
                    g1values: this.g1shiftData(this.state.g1values),
                  });
              }else{
                this.setState({
                  g1values: this.state.g1values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r2,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r2 = basedec;
          if(this.state.r2values.length >= dataWidth){
              this.setState({
                r2values: this.r2shiftData(this.state.r2values),
              });
          }else{
            this.setState({
              r2values: this.state.r2values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i2 = basedec;
            if(this.state.i2values.length >= dataWidth){
                this.setState({
                  i2values: this.i2shiftData(this.state.i2values),
                });
            }else{
              this.setState({
                i2values: this.state.i2values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g2subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g2,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g2 = basedec;
              if(this.state.g2values.length >= dataWidth){
                  this.setState({
                    g2values: this.g2shiftData(this.state.g2values),
                  });
              }else{
                this.setState({
                  g2values: this.state.g2values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r3,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r3 = basedec;
          if(this.state.r3values.length >= dataWidth){
              this.setState({
                r3values: this.r3shiftData(this.state.r3values),
              });
          }else{
            this.setState({
              r3values: this.state.r3values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i3 = basedec;
            if(this.state.i3values.length >= dataWidth){
                this.setState({
                  i3values: this.i3shiftData(this.state.i3values),
                });
            }else{
              this.setState({
                i3values: this.state.i3values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g3subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g3,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g3 = basedec;
              if(this.state.g3values.length >= dataWidth){
                  this.setState({
                    g3values: this.g3shiftData(this.state.g3values),
                  });
              }else{
                this.setState({
                  g3values: this.state.g3values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r4,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r4 = basedec;
          if(this.state.r4values.length >= dataWidth){
              this.setState({
                r4values: this.r4shiftData(this.state.r4values),
              });
          }else{
            this.setState({
              r4values: this.state.r4values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i4 = basedec;
            if(this.state.i4values.length >= dataWidth){
                this.setState({
                  i4values: this.i4shiftData(this.state.i4values),
                });
            }else{
              this.setState({
                i4values: this.state.i4values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g4subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g4,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g4 = basedec;
              if(this.state.g4values.length >= dataWidth){
                  this.setState({
                    g4values: this.g4shiftData(this.state.g4values),
                  });
              }else{
                this.setState({
                  g4values: this.state.g4values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r5subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r5,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r5 = basedec;
          if(this.state.r5values.length >= dataWidth){
              this.setState({
                r5values: this.r5shiftData(this.state.r5values),
              });
          }else{
            this.setState({
              r5values: this.state.r5values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i5subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i5 = basedec;
            if(this.state.i5values.length >= dataWidth){
                this.setState({
                  i5values: this.i5shiftData(this.state.i5values),
                });
            }else{
              this.setState({
                i5values: this.state.i5values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g5subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g5,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g5 = basedec;
              if(this.state.g5values.length >= dataWidth){
                  this.setState({
                    g5values: this.g5shiftData(this.state.g5values),
                  });
              }else{
                this.setState({
                  g5values: this.state.g5values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    let r6subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.r6,
       (error, chr) => {
         let basesixfour = chr.value;
         let basedec= getDecFrom64(basesixfour);
         r6 = basedec;
          if(this.state.r6values.length >= dataWidth){
              this.setState({
                r6values: this.r6shiftData(this.state.r6values),
              });
          }else{
            this.setState({
              r6values: this.state.r6values.concat({
                x: timeIndex,
                y: basedec
              })
            })
          }
        }
  ); //subscription to BLE char

    let i6subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.i6,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          i6 = basedec;
            if(this.state.i6values.length >= dataWidth){
                this.setState({
                  i6values: this.i6shiftData(this.state.i6values),
                });
            }else{
              this.setState({
                i6values: this.state.i6values.concat({
                  x: timeIndex,
                  y: basedec
                })
              })
            }
        }
    ); //subscription to BLE char

    let g6subscribe = await device.monitorCharacteristicForService(
      BLEconfig.channelSID,
      BLEconfig.channelCID.g6,
        (error, chr) => {
          let basesixfour = chr.value;
          let basedec= getDecFrom64(basesixfour);
          g6 = basedec;
              if(this.state.g6values.length >= dataWidth){
                  this.setState({
                    g6values: this.g6shiftData(this.state.g6values),
                  });
              }else{
                this.setState({
                  g6values: this.state.g6values.concat({
                    x: timeIndex,
                    y: basedec
                  })
                })
              }
        }
    ); //subscription to BLE char
    }

    //TODO
    //handle removing subscriptions etc.
  }

  


  render() {
    //console.log("render: "+renderCnt);
    //++renderCnt;
    const {r0values, i0values, g0values, device} = this.state;
    const config = this.next(r0values, i0values, g0values);
    if(device.r0_val != null){
      return (
        <View style={styles.body}>
          <View style={styles.graph}>
              <LineChart
                data={config.data}
                xAxis={config.xAxis}
                style={styles.container}
                marker={this.state.marker}
                ref="rawChart"
              />
          </View>
        </View>
      );
    }
    else{
      return(
        <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.rowItemBold}>
            <Text>loading...</Text>
          </View>
        </View>
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
      height: '90%'
    },
    graph: {
      width: '100%',
      height: '50%'
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
      width: '33%',
      flexDirection: 'row'
    },
  });
