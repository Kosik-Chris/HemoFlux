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
 *  Current: 0 = no connections + no broadcasting (for sleep)
 *  1 = BLE advertising, 2 = BLE connected,
 *  3 = wifi connecting, 4 = wifi connected,
 *  5 = current wifi AP config, 6 = WIFI station config,
 *  TODO: expand more to include combinations etc. 
 *  (WIFI, ESPNOW, lora etc.) & their combinations and states
 *  
 *  Later on GPIO states can be stored later and state diagram will be defined
 *  in a header probably?
 */
 //TODO: update state ctrl
 uint8_t state = 1; // 8 bit state control by default set to 0 for sleep, 1 for BLE setup and more SEE STATE DIAGRAM

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
  BLEService *redService,*irService,*greenService,*battService,*hrService,*devinfoService;

  BLECharacteristic *redChars[NUM_PPG];
  BLECharacteristic *irChars[NUM_PPG];
  BLECharacteristic *greenChars[NUM_PPG];
  BLECharacteristic *battChar,*hrChar;
  BLECharacteristic *manufactChar,*modelnumChar,*hardwareChar,*firmwareChar,*systemidChar;

  BLEAdvertising *pAdvertising; 
//***END DECLARE BLE Server, Services, and Characteristics for reference

//all i2c devices
MAX30105 ppgCollection[NUM_PPG];
MPU6050 imu(0x69); // <-- use for AD0 high

void tSelect(uint8_t);
void initBLE(char[]);

int BATTLVL = 0;
int SYSTEM_ID = 1;

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
  tSelect(MAX_NUM_PPG+1);
  imu.initialize();
  
  //initialize MAX30105 with paramaters
  for(int i=0;i<NUM_PPG; i++){
     ppgCollection[i].setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
  }

  //disconnected, state machine set to advertise servies, should be default state
  if(state == 1){
    //initialize server);
   initBLE(serverName); 
  }

  //TODO: Lots of fine tune continual tune of imu should be done and tested
  //calibrate (PI tune) imu
  imu.setXAccelOffset(16957);
  imu.setYAccelOffset(-370);
  imu.setZAccelOffset(423);
}

void loop() {
  #ifdef DEBUG
   long startTime = micros();
   #endif
  //iterate through PPG, check if available, dequeue FIFO, set BLE char value, notify BLE char, advance FIFO tail pointer
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

        imu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
        double temp = imu.getTemperature();

        BATTLVL = analogRead(BATTLVLPIN);
        battChar->setValue(BATTLVL);
        battChar->notify();
        #ifdef DEBUG
        long endTime = micros();
        Serial.print("Hz[");
        Serial.print(1 / ((endTime - startTime) / 1000000.0), 2);
        Serial.print("]");
        Serial.println(" ");

        // display tab-separated accel/gyro x/y/z values
//        Serial.print((temp)/340 + 36.53); Serial.print(" ");
//        Serial.print(ax); Serial.print(" ");
//        Serial.print(ay); Serial.print(" ");
//        Serial.print(az); Serial.print(" ");
//        Serial.println();
//        Serial.print(gx); Serial.print(" ");
//        Serial.print(gy); Serial.print(" ");
//        Serial.print(gz); Serial.print(" ");
        
        #endif
        delay(40);

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

/**
 * This class handles the event of connecting or disconnecting with BLE via bool variable outside
 * of current state variable 
 */
class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* respServer) {
      #ifdef DEBUG
      Serial.println("Current state is 2");
      #endif
            state= 2;
          };
       
    void onDisconnect(BLEServer* respServer) {
      #ifdef DEBUG
      Serial.println("Current state is 1");   
      #endif
            state = 1;
          };
};

/*
 * This function initializes our BLE Services and characteristics. Each channel is given its own characteristic
 */
void initBLE(char serverName []){
  BLEDevice::init(serverName);
  ppgServer = BLEDevice::createServer();
  ppgServer->setCallbacks(new ServerCallbacks());
  battService = ppgServer->createService(BATT_SERV_UUID);

  battChar = battService->createCharacteristic(
                                             BATT_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ
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
  
  redService = ppgServer->createService(RED_SERV_UUID,MAX_CHAR_HANDLE);
  irService = ppgServer->createService(IR_SERV_UUID,MAX_CHAR_HANDLE);
  greenService = ppgServer->createService(GREEN_SERV_UUID,MAX_CHAR_HANDLE);

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
    redChars[i] = redService->createCharacteristic(
                                         rUUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
      );
    redChars[i]->addDescriptor(new BLE2902());
    irChars[i] = irService->createCharacteristic(
                                         iUUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
      );
    irChars[i]->addDescriptor(new BLE2902());
    greenChars[i] = greenService->createCharacteristic(
                                         gUUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
      );
    greenChars[i]->addDescriptor(new BLE2902());  
  }

  //start BLE services
  redService->start();irService->start();greenService->start();
  battService->start(); hrService->start(); devinfoService->start();
  
  //advertise services and configure advertising settings
  pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(RED_SERV_UUID);
  pAdvertising->addServiceUUID(IR_SERV_UUID);
  pAdvertising->addServiceUUID(GREEN_SERV_UUID);
  pAdvertising->addServiceUUID(BATT_SERV_UUID);
  pAdvertising->addServiceUUID(HR_SERV_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

}
