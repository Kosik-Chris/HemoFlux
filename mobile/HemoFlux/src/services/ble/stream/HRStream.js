/**
 * @format
 * @flow
 * 
 * This component renders all HR broadcasted value
 */

import React, {PureComponent} from 'react';
import {StyleSheet, processColor, View, Text, Platform} from 'react-native';

import {LineChart} from 'react-native-charts-wrapper';
import { getDecFrom64 } from '../utility/DecFrom64';
import BLEconfig from '../../files/bleConfig';

//Intermediate variables for holding received values from tx
let hr;
let hrsubscribe;
let renderCnt = 0;

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
//let dataWidth = 10; 
// let updateRate = 30; 
let timeIndex = 0;

/**
 * Pure component for rendering raw channels.
 * Receives Device (connected state enforced by parent) object as a prop to manipulate
 */
export default class HRDataStream extends PureComponent {
  
  constructor(props) {
    super(props);
    this.state = {
      //the array of values for each channel
      hrvalues: [{x: 0, y: 2200}],
      marker: {
        enabled: true,
        digits: 2,
        backgroundTint: processColor('teal'),
        markerColor: processColor('#F0C0FF8C'),
        textColor: processColor('white'),
      },
      heart_rate: null,
    };
  }

/**
 * This function attaches and formats the value arrays to the rendered graph. 
 * TODO: dynamically handle based off of NUM_PPG
 * @param {*} hrvalues 
 */
  next(hrvalues) {
      return {
        data: {
          dataSets: [
            {
              values: hrvalues,
              //time: time,
              label: 'heart-rate',
              config: {
                drawValues: false, //draws values at points on graph
                color: colors[0],
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

  /**
   * Each shift function handles a different array:
   * create copy and slice the values, shift the array over, assing new X variables to last ele in array
   * return coped array
   * @param {*} values 
   */
  hrshiftData(values) {
    let temp = values.slice(); //both x and y get sliced
    temp.shift(); //both x and y get shifted
    temp[temp.length] = this.state.heart_rate;
    return temp;
  }

  /**
   * Called when component is initialized (after constructor) to mount channels
   */
  componentDidMount() {
    if(this.props.device.name != null){

    this.subscribeToChannels();
    if (this.state.hrvalues.length >= this.props.dataWidth) {
      console.log("some mount error..");
    } 
    if(this.state.hrvalues.length >= 1 && this.state.hrvalues.length < this.props.dataWidth && this.state.hrvalues!= null) {
        console.log("some mount error..");
    }
    if(this.state.hrvalues < 1 || this.state.hrvalues == null){
      //this.refs.rawChart.highlights([]);
            // https://github.com/PhilJay/MPAndroidChart/issues/2450
      // MpAndroidChart 3.0.2 will crash when data entry list is empty.
      console.log("origin mount");
      
      /**Only mount the channels that are present in the BLE broadcast/ configured!**/
        this.setState({
            hrvalues: this.state.hrvalues.concat({
            y: 1600,
          }),
        });
    }
    //ms timer implementation
    this.interval = setInterval(() => {
        timeIndex = timeIndex+this.props.updateRate;
        /**Only mount the channels that are present in the BLE broadcast/ configured!**/
          this.setState({
              heart_rate : hr,
          });
    }, this.props.updateRate);
    }
  }
  /**
   * Called when component is removed. Remove all subscriptions and Async tasks 
   */
  componentWillUnmount() {
      clearInterval(this.interval); //clear update interval
      //unsubscribe from channels
      hrsubscribe.remove();
  }

/**
 * Function subscribes to the characteristics of the BLE device based on configured PPG
 */
  async subscribeToChannels(){
    await this.props.device.discoverAllServicesAndCharacteristics();
        hrsubscribe = await this.props.device.monitorCharacteristicForService(
          BLEconfig.heartRateSID,
          BLEconfig.heartRateCID,
          (error, chr) => {
            let basesixfour = chr.value;
            let basedec= getDecFrom64(basesixfour);
            hr = basedec;
              if(this.state.hrvalues.length >= this.props.dataWidth){
                  this.setState({
                    hrvalues: this.hrshiftData(this.state.hrvalues),
                  });
              }else{
                this.setState({
                  hrvalues: this.state.hrvalues.concat({
                    y: basedec
                  })
                })
              }
            }
      ); //subscription to BLE char
  }

  
  render() {
    //console.log("render: "+renderCnt);
    //++renderCnt;
    const {hrvalues} = this.state;
    const config = this.next(hrvalues);
    if(this.state.heart_rate != null){
      return (
        // <View style={styles.body}>
          // <Text style={styles.graphTitle}>Raw Channel Data</Text>
              <LineChart
                data={config.data}
                xAxis={config.xAxis}
                style={styles.container}
                marker={this.state.marker}
                ref="hrChart"
              />
        // </View>
      );
    }
    else{
      return(
        // <View style={styles.body}>
        // <View style={styles.headerRow}>
          <View style={styles.rowItemBold}>
            <Text>loading...</Text>
          </View>
        // </View>
        // </View>
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
      width: '33%',
      flexDirection: 'row'
    },
  });
