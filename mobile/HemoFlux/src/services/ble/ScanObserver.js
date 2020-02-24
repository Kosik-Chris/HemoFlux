/**
 *
 * This function scans all broadcasting ble packets and devices for services etc.
 * The scan rate and filters can be set by the user through the interface and then
 * passed into a chart style depending on data selected.
 *
 * Ideal for observer broadcasting relationships passively listening and displaying devices
 */
import getDecFrom64 from '../ble/utility/DecFrom64';

// export function scanObserverValues(manager,filter, ScanOptions,deviceList,device) {
//     //Important that proper BLEdevicemanger object is sent into function
//     console.log('starting scan..');
//     manager.startDeviceScan(
//       [filter],
//       ScanOptions,
//       //This function is called for EVERY scanned device!
//       (error, device) => {
//         if (error) {
//           console.log(error.message);
//           console.log('error');
//           return;
//         }

//         try {
//           //add device to the device map with id as key, device object as value

//           console.log(device.id); //look at MAC

//           if (!deviceList.has(device.id)) {
//             deviceList.set(device.id, device);
//             this.setState({
//               deviceLIST: this.state.deviceLIST.concat([
//                 {
//                   name: device.name,
//                   id: device.id,
//                   rssi: device.rssi,
//                   mtu: device.mtu,
//                   manufactureData: device.manufactureData,
//                   serviceData: device.serviceData,
//                   serviceUUIDs: device.serviceUUIDs,
//                   localName: device.localName,
//                   txPowerLevel: device.txPowerLevel,
//                   solicitedServiceUUIDs: device.solicitedServiceUUIDs,
//                   isConnectable: null, //IOS ONLY
//                   overflowServiceUUIDs: false, //IOS ONLY
//                   services: device.services,
//                 }
//               ]),
//             });
//           }

//           if (deviceList.has(device.id)) {
//             for (var i = 0; i < this.state.deviceLIST.length; i++) {
//               if (this.state.deviceLIST[i].id === device.id) {
//                 this.state.deviceLIST[i] = {
//                   name: device.name,
//                   id: device.id,
//                   rssi: device.rssi,
//                   mtu: device.mtu,
//                   manufactureData: device.manufactureData,
//                   serviceData: device.serviceData,
//                   serviceUUIDs: device.serviceUUIDs,
//                   localName: device.localName,
//                   txPowerLevel: device.txPowerLevel,
//                   solicitedServiceUUIDs: device.solicitedServiceUUIDs,
//                   isConnectable: null, //IOS ONLY
//                   overflowServiceUUIDs: false, //IOS ONLY
//                   services: device.services,
//                 };
//               }
//             }
//           }

//           this.setState({
//             device: {
//               name: device.name,
//               id: device.id,
//               rssi: device.rssi,
//               mtu: device.mtu,
//               manufactureData: device.manufactureData,
//               serviceData: device.serviceData,
//               serviceUUIDs: device.serviceUUIDs,
//               localName: device.localName,
//               txPowerLevel: device.txPowerLevel,
//               solicitedServiceUUIDs: device.solicitedServiceUUIDs,
//               isConnectable: null, //IOS ONLY
//               overflowServiceUUIDs: false, //IOS ONLY
//               services: device.services,
//             },
//           });

//           //get hex (ascii) values for each character
//           //tx packet always only care about first 3 chars ignore = on x64

//           let decVal = getDecFrom64(
//             device.manufactureData.charCodeAt(0),
//             device.manufactureData.charCodeAt(1),
//             device.manufactureData.charCodeAt(2)
//           );
//           console.log(decVal);

//         } catch (error) {
//           console.log(error.message);
//         }
//       }
//     );
//   }
