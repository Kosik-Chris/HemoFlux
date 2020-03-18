import React, {Component} from 'react';
import {StyleSheet, processColor, Dimensions, View, Text} from 'react-native';

import {LineChart} from 'react-native-charts-wrapper';
import { BleManager, ScanMode, Service } from 'react-native-ble-plx';
import { getDecFrom64 } from '../utility/DecFrom64';
import BLEconfig from '../../files/bleConfig';
let ScanOptions = { scanMode: ScanMode.LowLatency };
let deviceList = new Map(); //holder for all device

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
let updateRate = 16; //time in ms to update graph
let valIndex = 0;

const manager = new BleManager();

export default class DataStream extends Component {
  static displayName = 'DataStream';

  constructor(props) {
    super(props);
    this.state = {
      //values: [0], //initialize for
      values: [{x: 0, y: 0}],
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
        red0_val: null,
        red1_val: null,
        red2_val: null,
        ir_val: null,
        green_val: null,
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

  logMapElements(value, key, map) {
    console.log(key + value.name);
  }


  next(values, colorIndex) {
    return {
      data: {
        dataSets: [
          {
            values: values,
            //time: time,
            label: 'data..',

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
    temp.concat(this.state.red0_val);
    return temp;
  }

  componentDidMount() {
    manager.enable(); //enable hardware bluetooth stack
    const subscription = manager.onStateChange(state => {
    if (state === 'PoweredOn') {
        this.scanDevices(); //start scanning for devices immediately
    }
    if (state === 'PoweredOff') {

    }
    }, true);

  }

  componentWillUnmount() {
      //disconnect from device
  }

  scanDevices(){
    manager.startDeviceScan(
        [BLEconfig.redSID], //only scan for red service being advertised
        ScanOptions,
        //This function is called for EVERY scanned device!
        (error,device) => {
            if (error) {
                console.log(error.message);
                return;
              }
            if(device.name == 'PPG_SYS'){
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

  }

  async getServAndChar(device){
    let redService, red0CHAR, red1CHAR, red2CHAR;
    let irService, ir0CHAR, ir1CHAR, ir2CHAR;
    let grService, gr0CHAR, gr1CHAR, gr2CHAR;
    await device.discoverAllServicesAndCharacteristics();
    const services = await device.services(); //array of services
    //console.log(services);
    services.forEach(element => {
        //console.log(element.uuid);
        if(element.uuid == BLEconfig.redSID){
            //this element is correct service
            redService = element;
            //console.log(element.uuid);
        }
    });
    //console.log(redService.uuid);
    const chars = await redService.characteristics(); //array of chars
    //console.log(chars);
    chars.forEach(element => {
        if(element.uuid == red0CharID){
            console.log('uuid: '+element.uuid+' readable?: '+element.isReadable);
            red0CHAR = element;
        }
    });
        let value = await device.monitorCharacteristicForService(
            BLEconfig.redSID,
            BLEconfig.red0CharID,
            (error, chr) => {
                let basesixfour = chr.value;
                let basedec= getDecFrom64(basesixfour);
                console.log('0th: '+ basedec);
                this.setState({
                    device: {
                        red0_val: basedec
                    }
                });
            }
        ); //promise returns char with update value

        let value1 = await device.monitorCharacteristicForService(
          BLEconfig.redSID,
          BLEconfig.red1CharID,
            (error, chr) => {
                let basesixfour = chr.value;
                let basedec = getDecFrom64(basesixfour);
                console.log('1st: '+ basedec);
            }
        ); //promise returns char with update value

        let value2 = await device.monitorCharacteristicForService(
          BLEconfig.redSID,
          BLEconfig.red2CharID,
            (error, chr) => {
                let basesixfour = chr.value;
                let basedec = getDecFrom64(basesixfour);
                console.log('2nd: '+ basedec);
            }
        ); //promise returns char with update value
    


  }
  



  render() {
    const {values, colorIndex, device} = this.state;
    const config = this.next(values, colorIndex);
        return (
            <View style={styles.body}>
              <View style={styles.headerRow}>
                <View style={styles.rowItemBold}>
                  <Text>Red 0 Value: {device.red0_val}</Text>
                </View>
              </View>
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
      height: '90%'
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
