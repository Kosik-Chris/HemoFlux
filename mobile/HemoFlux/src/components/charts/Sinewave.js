import React, {Component} from 'react';
import {StyleSheet, processColor} from 'react-native';

import {LineChart} from 'react-native-charts-wrapper';

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

export default class Sinewave extends Component {
  static displayName = 'Sinewave';

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
    };
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

  componentDidMount() {
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
