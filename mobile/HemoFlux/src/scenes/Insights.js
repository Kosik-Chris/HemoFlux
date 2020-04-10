/**
 * @format
 * @flow
 *
 */ 

import React, {PureComponent, Component} from 'react';
import {StyleSheet, 
processColor, 
View, Text, TouchableOpacity, ScrollView, Platform, Button, 
Alert, Dimensions,} from 'react-native';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';
import {check, request, PERMISSIONS, RESULTS, openSettings} from 'react-native-permissions';
import RNFS, { exists } from 'react-native-fs';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import Mailer from 'react-native-mail';
import {
  getAvailableLocationProviders,
  getBuildId,
  getBrand,
  getBatteryLevel,
  getDeviceId,
  getDeviceType,
  getDeviceName,
  getIpAddress,
  getMacAddress,
  isBatteryCharging,
  isLandscape,
  isLocationEnabled,
  useBatteryLevel,
} from 'react-native-device-info';
import { createStackNavigator } from 'react-navigation-stack';
import Stock from '../components/charts/Stock';
import Sinewave from '../components/charts/Sinewave';
import RNFetchBlob from 'rn-fetch-blob';
import Piechart from '../components/charts/Piechart';
import Linkage from '../components/charts/Linkage';
import { SafeAreaView } from 'react-navigation';


let path = RNFS.DocumentDirectoryPath;
let extpath;
let dirData;
let file;
let fileList = new Map();
let fileListArr = [];

export default class Insights extends Component {

  constructor(props){
    super(props);

    this.state = {
      filename: '/test.csv',
      dataLoaded: false, //boolean if user has selected data to load from file or not for rendering graph
      isLoadModalVisible: false,
      isDeleteModalVisible: false,
      isEmailModalVisible: false,
      loadMode: false,
      deleteMode: false,
      emailMode: false
    }
  }

  async readFile(filename){
    if(await exists(path+filename)){
      console.log('exists');
      RNFS.readFile(path+filename, 'ascii')
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
    else{
      console.log('File DNE');
    }
  }

   async readdir(){
      await RNFS.readdir(path).then((success) => {
        console.log(success);
        dirData = success;
        // console.log('dirData set: '+dirData);
        for(var i=0; i< success.length; i++){
          if(!fileList.has(success[i])){
            //file is not in list, add it
            fileList.set(i,success[i]); //make the key the iteration tied to location?
          }
        }
        for(var i=0; i< fileList.size; i++){
          //console.log('FILELIST: '+fileList.get(i));
          fileListArr[i] = fileList.get(i); //now put map values into array
          console.log(fileListArr);
          console.log(fileListArr.length);
        }
        // return data;
      }).catch((err) => {
        console.log(err.message);
      });
    }

  async deleteFile(filename){
    if(await exists(path+filename)){
      RNFS.unlink(path+filename)
      .then((success) => {
        console.log('DELETED');
      })
      .catch((err) => {
        console.log(err.message);
      });
    }
    else{
      console.log('File DNE');
    }
  }

  async handleEmail(filename) {
    if(Platform.OS !== 'ios'){
      //SOLUTION CREDIT: https://github.com/chirag04/react-native-mail/issues/123
      //we must copy the file to external storage for android to be able to access it rather than internal app cache.
      try{
        let hasPermission = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (hasPermission !== 'granted') {
          handleError(i18n.t('error_accessing_storage'));
        }
        let hasPermissionread = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        if (hasPermissionread !== 'granted') {
          handleError(i18n.t('error_read_storage'));
        }
      }catch(error){
        console.warn(error);
      }
      
      extpath = `${RNFS.ExternalStorageDirectoryPath}`;
      RNFS.mkdir(extpath+'/HemoFlux');
      hemoPath = extpath+'/HemoFlux';
      try {
        await RNFS.copyFile(path+filename, hemoPath+filename);
        let fileChk = await exists(hemoPath+filename);
        console.log(fileChk);
        Mailer.mail({
          subject: 'HemoFlux data acquistion',
          recipients: ['user@gmail.com'],
          ccRecipients: ['user@gmail.com'],
          bccRecipients: ['user@gmail.com'],
          body: '<b>The latest data for: '+filename+'.</b>',
          isHTML: true,
          attachment: {
            path: hemoPath+filename,  // The absolute path of the file from which to read data.
            type: 'csv',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
            name: 'data.csv',   // Optional: Custom filename for attachment
          }
        }, (error, event) => {
          Alert.alert(
            error,
            event,
            [
              {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
              {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
            ],
            { cancelable: true }
          )
        });
      } catch(error) {
        console.log(error);
      }
    }
    console.log(Platform.OS);
    if(Platform.OS !== 'android'){
    let check = await exists(path+filename);
    console.log(check);
    Mailer.mail({
      subject: 'HemoFlux data acquistion',
      recipients: ['user@gmail.com'],
      ccRecipients: ['theboss@gmail.com'],
      bccRecipients: ['theboss@gmail.com'],
      body: '<b>The latest data for: '+filename+'.</b>',
      isHTML: true,
      attachment: {
        path: path+filename,  // The absolute path of the file from which to read data.
        type: 'csv',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
        name: 'data.csv',   // Optional: Custom filename for attachment
      }
    }, (error, event) => {
      Alert.alert(
        error,
        event,
        [
          {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
          {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
        ],
        { cancelable: true }
      )
    });
    }
  }

  toggleLoadModal = () => {
    this.setState({isLoadModalVisible: !this.state.isLoadModalVisible, loadMode: true});
    if(!this.state.isLoadModalVisible){
      //read dir
      this.readdir();
      console.log(dirData);
      //console.log(this.state.dirData);
      //this.readdir();
    }
  };

  toggleDeleteModal = () => {
    this.setState({isDeleteModalVisible: !this.state.isDeleteModalVisible, deleteMode: true});
  };

  toggleEmailModal = () => {
    this.setState({isEmailModalVisible: !this.state.isEmailModalVisible, emailMode: true});
  };

  //# pleb way of doing this... 
  setLoadedT = () => {
    this.setState({
      dataLoaded: true
    });
  }

  //# pleb way of doing this... 
  setLoadedF = () => {
    this.setState({
      dataLoaded: false
    });
  }

  componentWillUnmount(){
    fileListArr = []; //empty array
  }

  doFileAction = () =>{
    if(this.state.loadMode === true && this.state.deleteMode === false && this.state.emailMode === false){
      console.log("load Mode");
    }
    if(this.state.loadMode === false && this.state.deleteMode === true && this.state.emailMode === false){
      console.log("DeleteMode");
    }
    if(this.state.loadMode === false && this.state.deleteMode === false && this.state.emailMode === true){
      console.log("email Mode");
    }
    else{
      console.log("boolean error on doFileAction");
    }
  }

  render() {
    if(this.state.dataLoaded){
      console.log("data loadded");
    }
    
    if(!this.state.dataLoaded && fileListArr.length > 0){
      // console.log("fillArr longer than 0");
      // console.log("fillArr :"+fileListArr);
      let fileListRender = fileListArr.map((fileRender, i) => {
        //console.log("fillArr RESULT:"+fileListArr);
         return(
            <View key={i}>
              <Icon.Button name="file"
              onPress={this.doFileAction}
              >
                {fileRender}
              </Icon.Button>
            </View>
         );
      });

      return(
        <SafeAreaView>
          <View style={styles.body}>
            <Modal isVisible={this.state.isLoadModalVisible}
              hasBackdrop={true}
              backdropColor={'red'}
              backdropOpacity={0.3}
            >
              <View style={styles.sessionModal}>
              <View style={styles.modalBtnWrapper}>
                <Icon.Button 
                onPress={this.toggleLoadModal}
                backgroundColor="#1e1e1e"
                name="cog"
                >
                  Load files to display
                </Icon.Button> 
              </View>    
              </View>
            </Modal>
            <Modal isVisible={this.state.isDeleteModalVisible}
              hasBackdrop={true}
              backdropColor={'red'}
              backdropOpacity={0.3}
            >
              <View style={styles.sessionModal}>
              <View style={styles.modalBtnWrapper}>
                <Icon.Button 
                onPress={this.toggleDeleteModal}
                backgroundColor="#1e1e1e"
                name="trash"
                >
                  Load files to delete
                </Icon.Button> 
              </View>    
              </View>
            </Modal>
            <Modal isVisible={this.state.isEmailModalVisible}
              hasBackdrop={true}
              backdropColor={'red'}
              backdropOpacity={0.3}
            >
              <View style={styles.sessionModal}>
              <View style={styles.modalBtnWrapper}>
                <Icon.Button 
                onPress={this.toggleEmailModal}
                backgroundColor="#1e1e1e"
                name="inbox"
                >
                  Load files to email
                </Icon.Button> 
              </View>    
                </View>
            </Modal>
            {/* <View style={styles.graphContainer}>
               <Linkage style={{width: '100%', height: '50%'}}/>
            </View> */}
            <View>
                  {fileListRender}
            </View>
            <View style={styles.controlPanel}>
              <View style={styles.controlPanelRow}>
              {/* <Icon.Button backgroundColor="#e74d00" name="file-archive-o" onPress={() => {this.readFile(this.state.filename)}} title='READ'>Load File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="trash" onPress={() => {this.deleteFile(this.state.filename)}} title='DELETE'>Delete File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="mail-forward" onPress={() => {this.handleEmail(this.state.filename)}} title='EMAIL'>Email Data</Icon.Button> */}
              <Icon.Button backgroundColor="#e74d00" name="file-archive-o" onPress={this.toggleLoadModal} title='READ'>Load File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="trash" onPress={this.toggleDeleteModal} title='DELETE'>Delete File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="mail-forward" onPress={this.toggleEmailModal} title='EMAIL'>Email Data</Icon.Button>
              </View>
            </View>
          </View>
          </SafeAreaView>
      );
    }
    if(!this.state.dataLoaded && fileListArr.length === 0){
      console.log("fillArr = 0");
      return (
          <SafeAreaView>
          <View style={styles.body}>
            <Modal isVisible={this.state.isLoadModalVisible}
              hasBackdrop={true}
              backdropColor={'red'}
              backdropOpacity={0.3}
            >
              <View style={styles.sessionModal}>
              <View style={styles.modalBtnWrapper}>
                <Icon.Button 
                onPress={this.toggleLoadModal}
                backgroundColor="#1e1e1e"
                name="cog"
                >
                  Load files to display
                </Icon.Button> 
              </View>    
              </View>
            </Modal>
            <Modal isVisible={this.state.isDeleteModalVisible}
              hasBackdrop={true}
              backdropColor={'red'}
              backdropOpacity={0.3}
            >
              <View style={styles.sessionModal}>
              <View style={styles.modalBtnWrapper}>
                <Icon.Button 
                onPress={this.toggleDeleteModal}
                backgroundColor="#1e1e1e"
                name="trash"
                >
                 Load files to delete
                </Icon.Button> 
              </View>    
              </View>
            </Modal>
            <Modal isVisible={this.state.isEmailModalVisible}
              hasBackdrop={true}
              backdropColor={'red'}
              backdropOpacity={0.3}
            >
              <View style={styles.sessionModal}>
              <View style={styles.modalBtnWrapper}>
                <Icon.Button 
                onPress={this.toggleEmailModal}
                backgroundColor="#1e1e1e"
                name="inbox"
                >
                  Load files to email
                </Icon.Button> 
              </View>    
                </View>
            </Modal>
            {/* <View style={styles.graphContainer}>
               <Linkage style={{width: '100%', height: '50%'}}/>
            </View> */}
            <View style={styles.controlPanel}>
              <View style={styles.controlPanelRow}>
              {/* <Icon.Button backgroundColor="#e74d00" name="file-archive-o" onPress={() => {this.readFile(this.state.filename)}} title='READ'>Load File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="trash" onPress={() => {this.deleteFile(this.state.filename)}} title='DELETE'>Delete File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="mail-forward" onPress={() => {this.handleEmail(this.state.filename)}} title='EMAIL'>Email Data</Icon.Button> */}
              <Icon.Button backgroundColor="#e74d00" name="file-archive-o" onPress={this.toggleLoadModal} title='READ'>Load File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="trash" onPress={this.toggleDeleteModal} title='DELETE'>Delete File</Icon.Button>
              <Icon.Button backgroundColor="#e74d00" name="mail-forward" onPress={this.toggleEmailModal} title='EMAIL'>Email Data</Icon.Button>
              </View>
            </View>
          </View>
          </SafeAreaView>
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
    //flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'flex-start',
    flexDirection: 'column',
    height: '100%',
    width: '100%'
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
  controlPanel : {
    padding: 5,
    borderWidth: 2,
    width: '100%',
    height: Dimensions.get('window').height/15,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: '#e6e6e6'
  },
  controlPanelRow: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  sessionBtn : {
    width: '20%',
  },
  sessionBtnWrapper : {
    display: 'flex',
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'stretch',
    marginTop: 0,
  },
  graphContainer : {
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    width: '100%',
    height: '90%',
    top: 0
  },
  setupModal: {
    justifyContent: 'space-around'
  },
  sessionModal: {
    justifyContent: 'space-around',
  },
  modalBtnWrapper: {
    display: 'flex',
    marginLeft: 10,
    marginRight: 10,
    padding: 2,
    width: Dimensions.get('window').width/2
  },
  modalBtn: {

  }
});