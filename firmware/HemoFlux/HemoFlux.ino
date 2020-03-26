/*
  PPG_SYS
  By: CASSS, Christopher J. Kosik & Jose I. Rodriguez-Labra
  Date: February 20th, 2020
  Version: 0.0.3

  Based on Neil Kolban example for IDF.
  Credit to Rui Santos on his amazing blog and info on multicore coding for esp32: https://randomnerdtutorials.com/esp32-dual-core-arduino-ide/
  As per original sketch see the following site for genereating unique 128 bit numbers..
  See the following for generating UUIDs:
  https://www.uuidgenerator.net
  
  Reference:
  https://github.com/sparkfun/MAX30105_Breakout
  
 *  State control diagram:
 *  Overview: 
 *  dev_state determines master state of HemoFlux embedded system post setup  
 *  conn_state defines wireless connection state control
 *  
 *  dev_state => 
 *  0: Read first 100 imu values and discard 
 *  1: Calculate initial offsets to calibrate IMU
 *  2: Final calibration of imu sensors, final offsets attached
 *  3: IMU ready
 *  
 *  4: Battery connected only
 *  5: USB connected only
 *  6: Battery & USB connected
 *  
 *  conn_state => 
 *  0 : no connections + no broadcasting 
 *  1 : BLE advertising 
 *  2 : BLE connected,
 *  3 : wifi connecting 
 *  4 : wifi connected,
 *  5 : current wifi AP config 
 *  6 : WIFI station config,
 *  TODO: expand more to include combinations etc. 
 *  TODO: define state control in seperate header
 */
 uint8_t conn_state = 1; // 8 bit state control by default set to 0 for sleep, 1 for BLE setup and more SEE STATE DIAGRAM
 uint8_t dev_state = 0;

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include "MAX30105.h"
#include <I2Cdev.h>
#include <MPU6050.h>
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
    #include "Wire.h"
#endif
#include "HemoFlux_config.h"

//***DECLARE BLE Server, Services, and Characterisitcs for reference
  char serverName [] = "HemoFlux"; 
  BLEServer *ppgServer;
  BLEService *channelService,*battService,*hrService,*devinfoService,*dimensionsService; //*irService,*greenService,

  BLECharacteristic *redChars[NUM_PPG];
  BLECharacteristic *irChars[NUM_PPG];
  BLECharacteristic *greenChars[NUM_PPG];
  BLECharacteristic *battChar,*hrChar;
  BLECharacteristic *manufactChar,*modelnumChar,*hardwareChar,*firmwareChar,*systemidChar;
  BLECharacteristic *axChar,*ayChar,*azChar,*gxChar,*gyChar,*gzChar;

  BLEAdvertising *pAdvertising; 
//***END DECLARE BLE Server, Services, and Characteristics for reference

//all i2c devices
MAX30105 ppgCollection[NUM_PPG];
MPU6050 imu; 

int mean_ax,mean_ay,mean_az,mean_gx,mean_gy,mean_gz,state=0;
int ax_offset,ay_offset,az_offset,gx_offset,gy_offset,gz_offset; 


void tSelect(uint8_t);
void initBLE(char[]);

int BATTLVL = 0;
int SYSTEM_ID = 1;

//TODO: clean up/ structure for yaw/pitch/ roll etc. Look at: MPU6050_6Axis_MotionApps20.h
int16_t ax, ay, az; //accel 3 holder variables per dimension
int16_t gx, gy, gz; //gyro 3 holder variables per dimension

void setup() {
  Serial.begin(115200);
  while(!Serial);
  // join I2C bus (I2Cdev library doesn't do this automatically)
  #if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
      Wire.begin();
  #elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
      Fastwire::setup(400, true);
  #endif

  //setup the MAX30105 that are attached, and IMU
  for(int i=0;i<NUM_PPG; i++){
    tSelect(i); //select slot in i2c multi
    if(ppgCollection[i].begin(Wire, I2C_SPEED_FAST) == false){
      //we could not connect/no device at this location/ some i2c error.\
      //TODO: error detect lines on multiplex (graceful hardware error handling)
      //we need to attempt to see if there are other possible locations we can attach this sensor object
       #ifdef DEBUG
        Serial.print("FATAL ERROR at TCASE. Check wiring");
       #endif 
      while(1);
    }
  }
  //move to reserved i2c slot and initilize
  tSelect(MAX_NUM_PPG);
  imu.initialize();
  // verify connection
    Serial.println("Testing device connections...");
    Serial.println(imu.testConnection() ? "MPU6050 connection successful" : "MPU6050 connection failed");
  
  //initialize MAX30105 with paramaters
  for(int i=0;i<NUM_PPG; i++){
     ppgCollection[i].setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
  }

  //disconnected, state machine set to advertise servies, should be default state
  if(conn_state == 1){
    //initialize server);
   initBLE(serverName); 
  }

  //TODO: Lots of fine tune continual tune of imu should be done and tested
  //calibrate (PI tune) imu
  //offsets chosen based off of MPU_raw example. 0 offset updated by functions
  imu.setXAccelOffset(0); //-76 
  imu.setYAccelOffset(0); //-2359
  imu.setZAccelOffset(0); //1688
  imu.setXGyroOffset(0); //220
  imu.setYGyroOffset(0); //76
  imu.setZGyroOffset(0); //-85
}

/**
 * This class handles the event of connecting or disconnecting with BLE via bool variable outside
 * of current state variable 
 */
class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* server) {
      #ifdef DEBUG
      Serial.println("Device connected.");
      #endif
            conn_state= 2;
          };
       
    void onDisconnect(BLEServer* server) {
      #ifdef DEBUG
      Serial.println("No Device connected");   
      #endif
            conn_state = 1;
          };
};

void loop() {
  if(dev_state == 0){
    //initial setup
    #ifdef DEBUG
      Serial.println("\nReading sensors for first time...");
    #endif
    meansensors();
    dev_state++;
    delay(200);
  }
  if(dev_state == 1){
    //calculating offset stage
    #ifdef DEBUG
        Serial.println("\nCalculating offsets...");
    #endif    
    calibration();
    dev_state++;
    //delay(200);
  }
  if(dev_state == 2){
    //set the calculated offsets
    meansensors();
    #ifdef DEBUG
      Serial.println("\nFINISHED!");
    #endif
    dev_state++;
    //delay(200);  
  }
  if(conn_state == 2 && dev_state >= 3){
  //iterate through PPG, check if available, dequeue FIFO, set BLE char value, notify BLE char, advance FIFO tail pointer
  //BLE connected and sensors have finished calibration
    #ifdef DEBUG
      long startTime = micros();
    #endif
    for(int i=0; i<NUM_PPG; i++){
          tSelect(i);
          ppgCollection[i].check(); //Check the sensor, read up to 3 samples //i2c burst read
          while (ppgCollection[i].available()){
            uint32_t data_r = ppgCollection[i].getFIFORed();
            uint32_t data_i = ppgCollection[i].getFIFOIR();
            uint32_t data_g = ppgCollection[i].getFIFOGreen();
            
            redChars[i]->setValue((uint8_t*) &data_r,4);   
            irChars[i]->setValue((uint8_t*) &data_i,4);    
            greenChars[i]->setValue((uint8_t*) &data_g,4); 
            redChars[i]->notify(); 
            irChars[i]->notify();
            greenChars[i]->notify();
            ppgCollection[i].nextSample(); //We're finished with this sample so move to next sample
          }
       }
        tSelect(MAX_NUM_PPG);
        double temp = imu.getTemperature();
        imu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
        axChar->setValue((uint8_t*) &ax,2);
        ayChar->setValue((uint8_t*) &ay,2);
        azChar->setValue((uint8_t*) &az,2);
        gxChar->setValue((uint8_t*) &gx,2);
        gyChar->setValue((uint8_t*) &gy,2);
        gzChar->setValue((uint8_t*) &gz,2);
        axChar->notify(); ayChar->notify(); azChar->notify();
        gxChar->notify(); gyChar->notify(); gzChar->notify();

        BATTLVL = analogRead(BATTLVLPIN);
        battChar->setValue(BATTLVL);
        battChar->notify();
        #ifdef DEBUG
        long endTime = micros();
          Serial.print("Hz[");
          Serial.print(1 / ((endTime - startTime) / 1000000.0), 2);
          Serial.print("]");
          Serial.println(" ");
        #endif
    #ifdef OUTPUT_READABLE_ACCELGYRO
        // display tab-separated accel/gyro x/y/z values
        Serial.print("a/g:\t");
        Serial.print(ax); Serial.print("\t");
        Serial.print(ay); Serial.print("\t");
        Serial.print(az); Serial.print("\t");
        Serial.print(gx); Serial.print("\t");
        Serial.print(gy); Serial.print("\t");
        Serial.println(gz);
    #endif
        delay(40);
  }
 

}

/**
 * Function controls 1-8 i2c multiplexer, selects proper SCL and SDA data lines
 */
void tSelect(uint8_t i){
  if (i > MAX_NUM_PPG) return;
 
  Wire.beginTransmission(TCAADDR);
  Wire.write(1 << i);
  Wire.endTransmission();  
}


/*
 * This function initializes our BLE Services and characteristics. Each channel is given its own characteristic
 */
void initBLE(char serverName []){
  BLEDevice::init(serverName);
  BLEDevice::setPower((esp_power_level_t)ESP_PWR_LVL_P7);
  ppgServer = BLEDevice::createServer();
  ppgServer->setCallbacks(new ServerCallbacks());
  battService = ppgServer->createService(BATT_SERV_UUID);

  battChar = battService->createCharacteristic(
                                             BATT_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ
                                            );
  Serial.println("settings up dimensions");
  dimensionsService = ppgServer->createService(DIMENSIONS_SERV_UUID,MAX_CHAR_HANDLE);
  Serial.println("dimensions setup");
  axChar = dimensionsService->createCharacteristic(
                                             AX_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             );
  ayChar = dimensionsService->createCharacteristic(
                                             AY_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             );
  azChar = dimensionsService->createCharacteristic(
                                             AZ_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             );   
  gxChar = dimensionsService->createCharacteristic(
                                             GX_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             );
  gyChar = dimensionsService->createCharacteristic(
                                             GY_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             ); 
  gzChar = dimensionsService->createCharacteristic(
                                             GZ_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             );                                                                                                                                                                                    
                                            
  hrService = ppgServer->createService(HR_SERV_UUID);
  hrChar = hrService->createCharacteristic(
                                             HR_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_WRITE |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             );
  hrChar->addDescriptor(new BLE2902());
  
  devinfoService = ppgServer->createService(DEVINFO_SERV_UUID);
  manufactChar = devinfoService->createCharacteristic(
                                         MANUFACT_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ
                                         );
  manufactChar->setValue(MANUFACTURE_NAME);
  modelnumChar = devinfoService->createCharacteristic(
                                         MODELNUM_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ
                                         );
  modelnumChar->setValue(MODEL_NUM);
  hardwareChar = devinfoService->createCharacteristic(
                                         HARDWAREV_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ
                                         );
  hardwareChar->setValue(HARDWARE_VERSION);
  firmwareChar = devinfoService->createCharacteristic(
                                         FIRMWAREV_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ
                                         );
  firmwareChar->setValue(FIRMWARE_VERSION);                                                                                    
  systemidChar = devinfoService->createCharacteristic(
                                         SYSTEMID_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ
                                         );
  systemidChar->setValue(SYSTEM_ID);
  
  channelService = ppgServer->createService(CHANNEL_SERV_UUID,MAX_CHAR_HANDLE);

  for(int i=0; i< NUM_PPG; i++){
    //local variables for UUID's needed per channel
    char *rUUID, *iUUID, *gUUID;
    
    //select the correct UUIDs per PPG
    switch(i){
      case 0:
        rUUID = REDCHAR_0_CHAR_UUID;
        iUUID = IRCHAR_0_CHAR_UUID;
        gUUID = GREENCHAR_0_CHAR_UUID;
      break;
      case 1:
        rUUID = REDCHAR_1_CHAR_UUID;
        iUUID = IRCHAR_1_CHAR_UUID;
        gUUID = GREENCHAR_1_CHAR_UUID;
      break;
      case 2:
        rUUID = REDCHAR_2_CHAR_UUID;
        iUUID = IRCHAR_2_CHAR_UUID;
        gUUID = GREENCHAR_2_CHAR_UUID;
      break;
      case 3:
        rUUID = REDCHAR_3_CHAR_UUID;
        iUUID = IRCHAR_3_CHAR_UUID;
        gUUID = GREENCHAR_3_CHAR_UUID;
      break;
      case 4:
        rUUID = REDCHAR_4_CHAR_UUID;
        iUUID = IRCHAR_4_CHAR_UUID;
        gUUID = GREENCHAR_4_CHAR_UUID;
      break;
      case 5:
        rUUID = REDCHAR_5_CHAR_UUID;
        iUUID = IRCHAR_5_CHAR_UUID;
        gUUID = GREENCHAR_5_CHAR_UUID;
      break;
      case 6:
        rUUID = REDCHAR_6_CHAR_UUID;
        iUUID = IRCHAR_6_CHAR_UUID;
        gUUID = GREENCHAR_6_CHAR_UUID;
      break;
      default:
      //by default initialize 0 errror!?!
        rUUID = REDCHAR_0_CHAR_UUID;
        iUUID = IRCHAR_0_CHAR_UUID;
        gUUID = GREENCHAR_0_CHAR_UUID;
    }
    //create characteristic with selected UUID with properties set, add descriptor for help
    redChars[i] = channelService->createCharacteristic(
                                         rUUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
      );
    irChars[i] = channelService->createCharacteristic(
                                         iUUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
      );
    greenChars[i] = channelService->createCharacteristic(
                                         gUUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
      ); 
  }

  //start BLE services
  channelService->start();
  battService->start(); hrService->start(); devinfoService->start(); dimensionsService->start();
  //advertise services and configure advertising settings
  pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(CHANNEL_SERV_UUID);
  pAdvertising->addServiceUUID(BATT_SERV_UUID);
  pAdvertising->addServiceUUID(HR_SERV_UUID);
  pAdvertising->addServiceUUID(DIMENSIONS_SERV_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

}

/*
 * This function means imu values for calibration.
 * CREDIT: https://wired.chillibasket.com/2015/01/calibrating-mpu6050/
 */
void meansensors(){
  long i=0,buff_ax=0,buff_ay=0,buff_az=0,buff_gx=0,buff_gy=0,buff_gz=0;

  while (i<(imu_buffersize+101)){
    // read raw accel/gyro measurements from device
    imu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    
    if (i>100 && i<=(imu_buffersize+100)){ //First 100 measures are discarded
      buff_ax=buff_ax+ax;
      buff_ay=buff_ay+ay;
      buff_az=buff_az+az;
      buff_gx=buff_gx+gx;
      buff_gy=buff_gy+gy;
      buff_gz=buff_gz+gz;
    }
    if (i==(imu_buffersize+100)){
      mean_ax=buff_ax/imu_buffersize;
      mean_ay=buff_ay/imu_buffersize;
      mean_az=buff_az/imu_buffersize;
      mean_gx=buff_gx/imu_buffersize;
      mean_gy=buff_gy/imu_buffersize;
      mean_gz=buff_gz/imu_buffersize;
    }
    i++;
    delay(2); //Needed so we don't get repeated measures
  }
}

/*
 * This function sets the offsets of the imu after averaging.
 * CREDIT: https://wired.chillibasket.com/2015/01/calibrating-mpu6050/
 */
void calibration(){
  ax_offset=-mean_ax/8;
  ay_offset=-mean_ay/8;
  az_offset=(16384-mean_az)/8;

  gx_offset=-mean_gx/4;
  gy_offset=-mean_gy/4;
  gz_offset=-mean_gz/4;
  while (1){
    int ready=0;
    imu.setXAccelOffset(ax_offset);
    imu.setYAccelOffset(ay_offset);
    imu.setZAccelOffset(az_offset);

    imu.setXGyroOffset(gx_offset);
    imu.setYGyroOffset(gy_offset);
    imu.setZGyroOffset(gz_offset);

    meansensors();
    
    #ifdef DEBUG
    Serial.println("...");
    #endif
    
    if (abs(mean_ax)<=acel_deadzone) ready++;
    else ax_offset=ax_offset-mean_ax/acel_deadzone;

    if (abs(mean_ay)<=acel_deadzone) ready++;
    else ay_offset=ay_offset-mean_ay/acel_deadzone;

    if (abs(16384-mean_az)<=acel_deadzone) ready++;
    else az_offset=az_offset+(16384-mean_az)/acel_deadzone;

    if (abs(mean_gx)<=giro_deadzone) ready++;
    else gx_offset=gx_offset-mean_gx/(giro_deadzone+1);

    if (abs(mean_gy)<=giro_deadzone) ready++;
    else gy_offset=gy_offset-mean_gy/(giro_deadzone+1);

    if (abs(mean_gz)<=giro_deadzone) ready++;
    else gz_offset=gz_offset-mean_gz/(giro_deadzone+1);

    if (ready==6) break;
  }
}
