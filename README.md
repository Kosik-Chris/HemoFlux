# HemoFlux
Wearable Photoplethysmography for blood flow analysis.

Example Streaming of Red, Infrared, and green wavelength values to Note 9 Android device:

![Android Note 9 mobile app Gif](https://github.com/Kosik-Chris/HemoFlux/tree/master/documents/Note9_BetaStream.gif?raw=true)



## Introduction
The Aim of this project is to create a pseudo realtime embedded device for streaming of sensor values to a smart phone or computer (referred to as client).

The device is intended to be placed on patients extremity with premapped PPG node locations and perform sensor fusion for feature extraction focused on determining blood flow and correlated data.

## Implementation

The Primary Mechanism for acheiving this is Bluetooth Low Energy with our embedded device running as the server allowing various clients to connect. The device also supports 2.4GHz wifi for future extensions.

The mobile application is currently implemented through **React Native** (NON EXPO). The Firmware is currently implemented using Arduino Core, with provided SparkFun Library for I2C communication with MAX3010X chips. 

How to install:

Partitioned into 3 segments: board files (easy eda source), ESP32 firmware, Xplat mobile app

### How to install mobile app:

1. Open HemoFlux folder under mobile
2. Install react-native-cli https://www.npmjs.com/package/react-native-cli
3. (recommended) install yarn
4. run npm i/ yarn from root
5. run react-native start from root and react-native run-android
6. Ensure to check your permissions on your phone before running.

### How to install firmware:

1. Open HemoFlux.ino under /firmware/HemoFlux
2. Install I2Cdev as a library
3. **IMPORTANT** currently modified part of the Arduino Core for ESP32 package => BLECharacteristic.cpp. All that is modified is the reversing of the order of bytes set. Will change this in future updates so the client will interpret but this was the "prototype quick solution". The modified file is included in the documents folder.

### Hardware setup

This is (currently) a very very easy project to implement on your breadboard and get working. Additionally, see the schematics under board directory for details.

![earlyBreadboard.jpg](https://github.com/Kosik-Chris/HemoFlux/tree/master/documents/earlyBreadboard.jpg?raw=true)

### Further Aims of this project

1. Animate and annotate a 3D model to realize better blood flow feature extraction

### Current issues/work

1. React Native RAM consumption is dangerously high, performance issues for real time streaming. Performance analysis (starting with code/ algorithm implementation) is the starting point for further work.
2. Fixing working file output/ app local information
3. Implementing feature extraction Matlab work into javascript/ C code
4. Refactoring main BLE streaming into graph code into maintainable format.
5. Continued hardware debugging, currently random disconnects while running firmware.
6. Migration away from Arduino to Espressif, possible migration from React Native to purely native applications.
