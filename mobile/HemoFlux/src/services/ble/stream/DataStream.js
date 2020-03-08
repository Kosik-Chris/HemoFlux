import React, {Component} from 'react';
import {StyleSheet, processColor,Dimensions} from 'react-native';

import {LineChart} from 'react-native-charts-wrapper';
import { BleManager, ScanMode } from 'react-native-ble-plx';
import { getDecFrom64 } from '../utility/DecFrom64';
let ScanOptions = { scanMode: ScanMode.LowLatency };
let deviceList = new Map(); //holder for all device

const redServiceID = '0265204d-6cfd-4be7-8548-25f0f941b794';
const irServiceID = 'a9e81533-d3b4-4b20-9c34-6d817942b69a';
const greenServiceID = 'a9e81533-d3b4-4b20-9c34-6d817942b69a';

const colors = [
  processColor('red'),
  processColor('blue'),
  processColor('green'),
  processColor('yellow'),
  processColor('purple'),
  processColor('pink'),
];

let dataWidth = 50; // #samples 100ms * 100 = 10s
let updateRate = 16; //time in ms to update graph

//let values = [dataWidth]; //initialize array with datawidth holding
let valIndex = 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
});

export default class DataStream extends Component {
  static displayName = 'DataStream';

  constructor(props) {
    super(props);
    this.state = {
      //values: [0], //initialize for
      orientation: '',
      deviceLIST: [],
      device: {
        name: null,
        id: null,
        rssi: null,
        batt_lvl: null,
        heart_rate: null,
        dev_info: {
            manufact_name: null,
            model_num: null,
            hardware_version: null,
            firmware_version: null,
            system_id: null,
        },
        red_val: null,
        ir_val: null,
        green_val: null
      },
      values: [{x: 0, y: 0}],
      colorIndex: 0,
      marker: {
        enabled: true,
        digits: 2,
        backgroundTint: processColor('teal'),
        markerColor: processColor('#F0C0FF8C'),
        textColor: processColor('white'),
      },
    };
    this.manager = new BleManager();
  }

  next(values, colorIndex) {
    return {
      data: {
        dataSets: [
          {
            values: values,
            //time: time,
            label: 'Sine function',

            config: {
              drawValues: false, //draws values at points on graph
              color: colors[colorIndex],
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

  shiftData(values) {
    let temp = values.slice();
    //console.log(temp);
    temp.shift();
    temp.concat([Math.floor(Math.random() * 100 + 1)]);
    return temp;
  }

  getOrientation = () => {
    if (this.refs.rootView) {
      if (Dimensions.get('window').width < Dimensions.get('window').height) {
        this.setState({ orientation: 'portrait' });
      } else {
        this.setState({ orientation: 'landscape' });
      }
    }
  };

  logMapElements(value, key, map) {
    console.log(key + value.name);
  }

  componentDidMount() {
    this.getOrientation();
    this.manager.enable(); //enable hardware bluetooth stack
    Dimensions.addEventListener('change', () => {
        this.getOrientation(); //listen for changes on device orientation
      });
    const subscription = this.manager.onStateChange(state => {
    if (state === 'PoweredOn') {
        this.scanObserverValues(); //start scanning for devices immediately
    }
    if (state === 'PoweredOff') {

    }
    }, true);
    this.interval = setInterval(() => {
      if (this.state.values.length >= dataWidth) {
        // https://github.com/PhilJay/MPAndroidChart/issues/2450
        // MpAndroidChart 3.0.2 will crash when data entry list is empty.

        this.refs.chart.highlights([]);
        //shift values left continually
        this.setState({
          //values: this.state.values,
          values: this.shiftData(this.state.values),
          colorIndex: 1,
        });
      } else {
        this.setState({
          values: this.state.values.concat({
            x: valIndex,
            y: Math.floor(Math.random() * 100 + 1),
          }),
          colorIndex: 1, //(this.state.colorIndex + 1) % colors.length
        });
      }
      //this.shiftData(this.state.values);
      valIndex = valIndex + updateRate;
      //console.log(valIndex);
    }, updateRate);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  scanObserverValues(){
    this.manager.startDeviceScan(
        [redServiceID], //only scan for red service being advertised
        ScanOptions,
        //This function is called for EVERY scanned device!
        (error,device) => {
            if (error) {
                console.log(error.message);
                return;
              }
                console.log(device.isConnected);

        }
    )
  }

  render() {
    const {values, colorIndex} = this.state;
    const config = this.next(values, colorIndex);
    return (
      <LineChart
        data={config.data}
        xAxis={config.xAxis}
        style={styles.container}
        marker={this.state.marker}
        ref="chart"
      />
    );
  }
}
