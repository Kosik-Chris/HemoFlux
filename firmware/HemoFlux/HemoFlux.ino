/*
  PPG_SYS
  By: CASSS, Christopher J. Kosik & Jose I. Rodriguez-Labra
  Date: February 20th, 2020
  Version: 0.0.2

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
#include "I2Cdev.h"
#include "HemoFlux_config.h"
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
    #include "Wire.h"
#endif

#define TCAADDR 0x70
//static BLEUUID RED_SERV_UUID(BLEUUID("0265204d-6cfd-4be7-8548-25f0f941b794"));


//static BLEUUID IR_SERV_UUID(BLEUUID("a9e81533-d3b4-4b20-9c34-6d817942b69a"));

//static BLEUUID GREEN_SERV_UUID(BLEUUID("08fcbfeb-ea38-4085-9800-cd03ff14f2a0"));

//static BLEUUID HR_SERV_UUID(BLEUUID((uint16_t)0x180D));//Hr serv uuid
//static BLEUUID HR_CHAR_UUID(BLEUUID((uint16_t)0x2A37)); //Hr char uuid
//
//static BLEUUID BATT_SERV_UUID(BLEUUID((uint16_t)0x180F));// Batt serv uuid
//static BLEUUID BATT_CHAR_UUID(BLEUUID((uint16_t)0x2A19)); //Batt level char uuid
//
//static BLEUUID DEVINFO_SERV_UUID(BLEUUID((uint16_t)0x180A));// Batt serv uuid
//static BLEUUID MANUFACT_CHAR_UUID(BLEUUID((uint16_t)0x2A29));// manufacture string
//static BLEUUID MODELNUM_CHAR_UUID(BLEUUID((uint16_t)0x2A24));// model number string
//static BLEUUID HARDWAREV_CHAR_UUID(BLEUUID((uint16_t)0x2A27));//hardware version string
//static BLEUUID FIRMWAREV_CHAR_UUID(BLEUUID((uint16_t)0x2A26));//firmware version string
//static BLEUUID SYSTEMID_CHAR_UUID(BLEUUID((uint16_t)0x2A23));//unique ID within mesh of n devices

//MAX30105 particleSensor;
MAX30105 ppg0,ppg1,ppg2,ppg3,ppg4,ppg5,ppg6; //TODO: find better allocation technique
const int battLvlPin = 34;
int battLvl = 0;
static int SYSTEM_ID =  1;

//***DECLARE BLE Server, Services, and Characterisitcs for reference
  char serverName [] = "HemoFlux"; 
  BLEServer *ppgServer; 
  BLEService *redService,*irService,*greenService,*battService,*hrService,*devinfoService; 
  BLECharacteristic *red0Char,*red1Char,*red2Char; 
  BLECharacteristic *ir0Char,*ir1Char,*ir2Char; 
  BLECharacteristic *green0Char,*green1Char,*green2Char; 
  BLECharacteristic *battChar,*hrChar;
  BLECharacteristic *manufactChar,*modelnumChar,*hardwareChar,*firmwareChar,*systemidChar;

  BLEAdvertising *pAdvertising; 
//***END DECLARE BLE Server, Services, and Characteristics for reference


//**BLE TX/RX VARS
// uint8_t tempRed [4];
// uint8_t tempIr [4];
// uint8_t tempGreen [4];
 uint8_t tempRed0[4],tempRed1[4],tempRed2[4];
 uint8_t tempIr0[4],tempIr1[4],tempIr2[4];
 uint8_t tempGreen0[4],tempGreen1[4],tempGreen2[4];
//**END BLE TX/RX VARS

void tcaselect(uint8_t);

void initBLE(char[]);



void setup() {
  Serial.begin(115200);
  while(!Serial);
  // join I2C bus (I2Cdev library doesn't do this automatically)
  #if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
      Wire.begin();
  #elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
      Fastwire::setup(400, true);
  #endif

  int cpuSpeed = getCpuFrequencyMhz();

  //setup the MAX30105 that are attached, and IMU
  

  tcaselect(0);
  // Initialize sensor
  if(ppg0.begin(Wire, I2C_SPEED_FAST) == false) //Use default I2C port, 400kHz speed
  {
    while (1);
  }
  tcaselect(1);
  if(ppg1.begin(Wire, I2C_SPEED_FAST) == false) //Use default I2C port, 400kHz speed
  {
    while (1);
  }
  tcaselect(2);
  if(ppg2.begin(Wire, I2C_SPEED_FAST) == false) //Use default I2C port, 400kHz speed
  {
    while (1);
  }
  
 tcaselect(0);
  ppg0.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange); //Configure sensor with these settings
  tcaselect(1);
  ppg1.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange); //Configure sensor with these settings
  tcaselect(2);
  ppg2.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange); //Configure sensor with these settings
  tcaselect(0);
    if(state == 1){
     initBLE(serverName); 
  }

}

void loop() {

   long startTime = micros();
   tcaselect(0);
        ppg0.check(); //Check the sensor, read up to 3 samples //i2c burst read
        while (ppg0.available()) //do we have new data? //loop around i2c burst read
        {
          uint32_t data_red = ppg0.getFIFORed();
          uint32_t data_ir = ppg0.getFIFOIR();
          uint32_t data_green = ppg0.getFIFOGreen();
    
          //tx the data
          //TODO: shift this into another thread/ process &|| core..
    
          //begin with LSB
          tempRed0[0] = data_red>>24;
          tempRed0[1] = data_red>>16;
          tempRed0[2] = data_red>>8;
          tempRed0[3] = data_red;
    
          tempIr0[0] = data_ir>>24;
          tempIr0[1] = data_ir>>16;
          tempIr0[2] = data_ir>>8;
          tempIr0[3] = data_ir;
    
          tempGreen0[0] = data_green>>24;
          tempGreen0[1] = data_green>>16;
          tempGreen0[2] = data_green>>8;
          tempGreen0[3] = data_green;

          red0Char->setValue(tempRed0,4);
          ir0Char->setValue(tempIr0,4);
          green0Char->setValue(tempGreen0,4);
          red0Char->notify();
          ir0Char->notify();
          green0Char->notify();
          
          
          ppg0.nextSample(); //We're finished with this sample so move to next sample
        }
    
      tcaselect(1);
      ppg1.check();
      while (ppg1.available()) //do we have new data? //loop around i2c burst read
        {
          uint32_t data_red = ppg1.getFIFORed();
          uint32_t data_ir = ppg1.getFIFOIR();
          uint32_t data_green = ppg1.getFIFOGreen();
    
          //tx the data
          //TODO: shift this into another thread/ process &|| core..
    
          //begin with LSB
          tempRed1[0] = data_red>>24;
          tempRed1[1] = data_red>>16;
          tempRed1[2] = data_red>>8;
          tempRed1[3] = data_red;
    
          tempIr1[0] = data_ir>>24;
          tempIr1[1] = data_ir>>16;
          tempIr1[2] = data_ir>>8;
          tempIr1[3] = data_ir;
    
          tempGreen1[0] = data_green>>24;
          tempGreen1[1] = data_green>>16;
          tempGreen1[2] = data_green>>8;
          tempGreen1[3] = data_green;

          red1Char->setValue(tempRed1,4);
          ir1Char->setValue(tempIr1,4);
          green1Char->setValue(tempGreen1,4);
          red1Char->notify();
          ir1Char->notify();
          green1Char->notify();
          
          ppg1.nextSample(); //We're finished with this sample so move to next sample
        }

      tcaselect(2);
      ppg2.check();
      while (ppg2.available()) //do we have new data? //loop around i2c burst read
        {
          uint32_t data_red = ppg2.getFIFORed();
          uint32_t data_ir = ppg2.getFIFOIR();
          uint32_t data_green = ppg2.getFIFOGreen();
    
          //tx the data
          //TODO: shift this into another thread/ process &|| core..
    
          //begin with LSB
          tempRed2[0] = data_red>>24;
          tempRed2[1] = data_red>>16;;
          tempRed2[2] = data_red>>8;
          tempRed2[3] = data_red;
    
          tempIr2[0] = data_ir>>24;
          tempIr2[1] = data_ir>>16;
          tempIr2[2] = data_ir>>8;
          tempIr2[3] = data_ir;
    
          tempGreen2[0] = data_green>>24;
          tempGreen2[1] = data_green>>16;
          tempGreen2[2] = data_green>>8;
          tempGreen2[3] = data_green;

          red2Char->setValue(tempRed2,4);
          ir2Char->setValue(tempIr2,4);
          green2Char->setValue(tempGreen2,4);
          red2Char->notify();
          ir2Char->notify();
          green2Char->notify();
             
          ppg2.nextSample(); //We're finished with this sample so move to next sample
        }

        battLvl = analogRead(battLvlPin);
        battChar->setValue(battLvl);
        battChar->notify();
        long endTime = micros();
        Serial.print("Hz[");
        Serial.print(1 / ((endTime - startTime) / 1000000.0), 2);
        Serial.print("]");
        Serial.println(" ");

        delay(40);

}

/**
 * Function controls 1-8 i2c multiplexer
 */
void tcaselect(uint8_t i){
  if (i > 7) return;
 
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
 * This function initializes our BLE Services and characteristic 
 * TODO: Shift all data into single characteristic potentially. Analyze performance later
 */
void initBLE(char serverName []){
  BLEDevice::init(serverName);
  ppgServer = BLEDevice::createServer();
  ppgServer->setCallbacks(new ServerCallbacks());
  battService = ppgServer->createService(BATT_SERV_UUID);
  hrService = ppgServer->createService(HR_SERV_UUID);
  
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
  red0Char = redService->createCharacteristic(
                                         REDCHAR_0_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  red0Char->addDescriptor(new BLE2902());
  red1Char = redService->createCharacteristic(
                                         REDCHAR_1_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  red1Char->addDescriptor(new BLE2902());
  red2Char = redService->createCharacteristic(
                                         REDCHAR_2_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  red2Char->addDescriptor(new BLE2902());
  
  ir0Char = irService->createCharacteristic(
                                         IRCHAR_0_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  ir0Char->addDescriptor(new BLE2902());
  ir1Char = irService->createCharacteristic(
                                         IRCHAR_1_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  ir1Char->addDescriptor(new BLE2902());
  ir2Char = irService->createCharacteristic(
                                         IRCHAR_2_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  ir2Char->addDescriptor(new BLE2902());        

  green0Char = greenService->createCharacteristic(
                                         GREENCHAR_0_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  green0Char->addDescriptor(new BLE2902());
  green1Char = greenService->createCharacteristic(
                                         GREENCHAR_1_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  green1Char->addDescriptor(new BLE2902());
  green2Char = greenService->createCharacteristic(
                                         GREENCHAR_2_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
  green2Char->addDescriptor(new BLE2902());

  battChar = battService->createCharacteristic(
                                             BATT_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ
                                            );
  hrChar = hrService->createCharacteristic(
                                             HR_CHAR_UUID,
                                             BLECharacteristic::PROPERTY_READ |
                                             BLECharacteristic::PROPERTY_WRITE |
                                             BLECharacteristic::PROPERTY_NOTIFY
                                             );
  hrChar->addDescriptor(new BLE2902());   

  redService->start();irService->start();greenService->start();
  battService->start(); hrService->start(); devinfoService->start();
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
