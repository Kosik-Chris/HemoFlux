import React, {Component} from 'react';
import {StyleSheet, processColor, Dimensions, View, Text, Platform} from 'react-native';

import {LineChart} from 'react-native-charts-wrapper';
import { BleManager, ScanMode, Service } from 'react-native-ble-plx';
import { getDecFrom64 } from '../utility/DecFrom64';
import BLEconfig from '../../files/bleConfig';

let ScanOptions = { scanMode: ScanMode.LowLatency };
let deviceList = new Map(); //holder for all device
let r0,r1,r2,r3,r4,r5,r6;
let i0,i1,i2,i3,i4,i5,i6;
let g0,g1,g2,g3,g4,g5,g6;

//TODO: move all device/ system ID components into seperate service lookup config file!


const colors = [
  processColor('red'),
  processColor('blue'),
  processColor('green'),
  processColor('yellow'),
  processColor('purple'),
  processColor('pink'),
];

let dataWidth = 50; // #samples 100ms * 100 = 10s
let updateRate = 33;
let timeIndex = 0;

const manager = new BleManager();

export default class DataStream extends Component {
  static displayName = 'DataStream';

  constructor(props) {
    super(props);
    this.state = {
      //values: [0], //initialize for
      r0values: [{x: 0, y: 0}],
      i0values: [{x: 0, y: 0}],
      g0values: [{x: 0, y: 0}],
      colorIndex: 0,
      marker: {
        enabled: true,
        digits: 2,
        backgroundTint: processColor('teal'),
        markerColor: processColor('#F0C0FF8C'),
        textColor: processColor('white'),
      },
      orientation: '',
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


  getOrientation = () => {
    if (this.refs.rootView) {
      if (Dimensions.get('window').width < Dimensions.get('window').height) {
        this.setState({ orientation: 'portrait' });
      } else {
        this.setState({ orientation: 'landscape' });
      }
    }
  };


  next(r0values, i0values, g0values, colorIndex) {
    return {
      data: {
        dataSets: [
          {
            values: r0values,
            //time: time,
            label: 'red',
            config: {
              drawValues: false, //draws values at points on graph
              color: colors[colorIndex],
              mode: 'CUBIC_BEZIER',
              drawCircles: false,
              lineWidth: 2,
            },
          },
          {
            values: i0values,
            //time: time,
            label: 'ir',
            config: {
              drawValues: false, //draws values at points on graph
              color: colors[colorIndex],
              mode: 'CUBIC_BEZIER',
              drawCircles: false,
              lineWidth: 2,
          },
        },
          {
            values: g0values,
            //time: time,
            label: 'green',
            config: {
              drawValues: false, //draws values at points on graph
              color: colors[colorIndex],
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

  componentDidMount() {
    manager.enable(); //enable hardware bluetooth stack
    const subscription = manager.onStateChange(bleState => {
    if (bleState === 'PoweredOn') {
        console.log("scanning devices");
        this.scanDevices(); //start scanning for devices immediately
    }
    if (bleState === 'PoweredOff') {
        //turn on ble
        manager.enable();
    }
    }, true);
    if (this.state.r0values.length >= dataWidth) {
      // https://github.com/PhilJay/MPAndroidChart/issues/2450
      // MpAndroidChart 3.0.2 will crash when data entry list is empty.

      this.refs.chart.highlights([]);
      //shift values left continually
      this.setState({
        //values: this.state.values,
        r0values: this.r0shiftData(this.state.r0values),
        colorIndex: 1,
      });
    } else {
      //Math.floor(Math.random() * 100 + 1)
      this.setState({
        r0values: this.state.r0values.concat({
          x: timeIndex,
          y: 0,
        }),
        colorIndex: 1, //(this.state.colorIndex + 1) % colors.length
      });
    }
    //ms timer implementation
    this.interval = setInterval(() => {
      // if(timeIndex == 1000){
      //   timeIndex = 0;
      // }else{
        timeIndex = timeIndex+updateRate;
        this.setState({
          device: {
            r0_val : r0,
            i0_val: i0,
            g0_val : g0
          }
        })
        console.log(this.state.device.r0_val);
      // }
    }, updateRate);

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
                console.log('connecting to device..');
                this.connectToDevice(device);
            }

        }
    );

  }

  async connectToDevice(device){
    console.log(device.name);
    await device.connect();
    this.setState({
        device: {
            connected: true
        }
    });
    console.log('connected '+device.id);

    this.getServAndChar(device);
    // this.getServAndChar(device);

  }

  async getServAndChar(device){
    await device.discoverAllServicesAndCharacteristics();
    // const services = await device.services(); //array of services


    // services.forEach(element => {
    //     //console.log(element.uuid);
    //     if(element.uuid == BLEconfig.channelSID){
    //         //this element is correct service
    //         channelService = element;
    //         //console.log(element.uuid);
    //     }
    // });
    //const chars = await channelService.characteristics(); //array of chars
    // //console.log(chars);
    // chars.forEach(element => {
    //     if(element.uuid == BLEconfig.channelCID.r0){
    //         //console.log('uuid: '+element.uuid+' readable?: '+element.isReadable);
    //         //red0C = element;
    //     }
    // });
    //TODO: look/handle timeouts on async await options for reading chars?
    //and handle if they do not exist/ for NUM_PPG configured in json
    // r0 = await device.readCharacteristicForService(BLEconfig.channelSID,BLEconfig.channelCID.r0);
    // i0 = await device.readCharacteristicForService(BLEconfig.channelSID,BLEconfig.channelCID.i0);
    // g0 = await device.readCharacteristicForService(BLEconfig.channelSID,BLEconfig.channelCID.g0);

        let r0subscribe = await device.monitorCharacteristicForService(
            BLEconfig.channelSID,
            BLEconfig.channelCID.r0,
             (error, chr) => {
               let basesixfour = chr.value;
               let basedec= getDecFrom64(basesixfour);
               r0 = basedec;
               //console.log(r0);
            //     this.setState({
            //               device: {
            //                   r0_val: basedec
            //               },
            //           });
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
                // this.setState({
                //     device: {
                //         i0_val: basedec
                //     },
                // });
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
                  // this.setState({
                  //     device: {
                  //         g0_val: basedec
                  //     },
                  // });
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

  



  render() {
    const {r0values, i0values, g0values, colorIndex, device} = this.state;
    const config = this.next(r0values, i0values, g0values, colorIndex);
    if(device.r0_val != null){
      return (
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={styles.rowItemBold}>
              <Text>Red 0 Value: {device.r0_val}</Text>
              <Text>Ir 0 Value: {device.i0_val}</Text>
              <Text>Green 0 Value: {device.g0_val}</Text>
            </View>
          </View>
          <View style={styles.graph}>
              <LineChart
                data={config.data}
                xAxis={config.xAxis}
                style={styles.container}
                marker={this.state.marker}
                ref="chart"
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
