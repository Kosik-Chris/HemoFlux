/*
  PPG_SYS
  By: CASSS, Christopher J. Kosik & Jose I. Rodriguez-Labra
  Date: February 20th, 2020
  Version: 0.0.1

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
//#define DEBUG
//#define SUCKIT
#define MAX_NUM_PPG 7 //8 -1 (i2c gyro/accel)
#define NUM_PPG 3
#define MAX_CHAR_HANDLE 25 //max number chars per service
#define HARDWARE_VERSION "V1.0"
#define FIRMWARE_VERSION "V1.0"
#define MANUFACTURE_NAME "CASSS"
#define MODEL_NUM "Foot-V1.0"

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

#include "MAX30105.h"
#include "I2Cdev.h"
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
    #include "Wire.h"
#endif

#define TCAADDR 0x70
static BLEUUID RED_SERV_UUID(BLEUUID("0265204d-6cfd-4be7-8548-25f0f941b794"));
#define REDCHAR_0_CHAR_UUID "050447d6-8ac9-4bd8-b004-0a5fe425029a"
#define REDCHAR_1_CHAR_UUID "59eb1a6f-9839-483d-90aa-511b96585820"
#define REDCHAR_2_CHAR_UUID "031edcf6-02c9-4267-a657-91eacd0febc8"
//#define REDCHAR_3_CHAR_UUID "2733431b-0e59-4f38-8cb4-33b3f6bb8795"
//#define REDCHAR_4_CHAR_UUID "3bb2770d-89a0-45ac-8aad-ca1a7ad9fe3e"
//#define REDCHAR_5_CHAR_UUID "67051d05-68ac-4748-840b-b835600f2ad7"
//#define REDCHAR_6_CHAR_UUID "f9c35962-b1d1-40a8-8766-0d9e6f1fb1ea"

static BLEUUID IR_SERV_UUID(BLEUUID("a9e81533-d3b4-4b20-9c34-6d817942b69a"));
#define IRCHAR_0_CHAR_UUID "654859cc-9a09-453f-b87a-8493f0fc1890"
#define IRCHAR_1_CHAR_UUID "ec402230-01bb-4013-85a2-82df61e7b869"
#define IRCHAR_2_CHAR_UUID "392e2b46-ac60-4807-a329-016c65f09a28"
//#define IRCHAR_3_CHAR_UUID "2dd4bab3-1416-425f-a12f-ebaf5f9fe4ab"
//#define IRCHAR_4_CHAR_UUID "6813e7f7-6c85-460a-9715-c096c7c8a61f"
//#define IRCHAR_5_CHAR_UUID "8844f336-3974-45c3-b582-c3369baf3f27"
//#define IRCHAR_6_CHAR_UUID "fdbddd27-6328-4cc1-bb0d-666a1b4fb8eb"

static BLEUUID GREEN_SERV_UUID(BLEUUID("08fcbfeb-ea38-4085-9800-cd03ff14f2a0"));
#define GREENCHAR_0_CHAR_UUID "686af018-8d13-4dd0-afe1-fecbdd054219"
#define GREENCHAR_1_CHAR_UUID "711c47c2-3b96-4fee-ace5-fad82ea2f41b"
#define GREENCHAR_2_CHAR_UUID "e344ff91-2d0c-43fe-bf4c-41bf78047cdf"
//#define GREENCHAR_3_CHAR_UUID "8b98cdf7-838e-4d0e-bdc8-1f17ab49c32d"
//#define GREENCHAR_4_CHAR_UUID "39261629-11a6-4daf-b8bc-f928de195e93"
//#define GREENCHAR_5_CHAR_UUID "fd9770fd-4073-4fb7-b7ad-3efd232113b8"
//#define GREENCHAR_6_CHAR_UUID "9704c035-f804-4e29-bace-14b8d0a4ec77"

static BLEUUID HR_SERV_UUID(BLEUUID((uint16_t)0x180D));//Hr serv uuid
static BLEUUID HR_CHAR_UUID(BLEUUID((uint16_t)0x2A37)); //Hr char uuid

static BLEUUID BATT_SERV_UUID(BLEUUID((uint16_t)0x180F));// Batt serv uuid
static BLEUUID BATT_CHAR_UUID(BLEUUID((uint16_t)0x2A19)); //Batt level char uuid

static BLEUUID DEVINFO_SERV_UUID(BLEUUID((uint16_t)0x180A));// Batt serv uuid
static BLEUUID MANUFACT_CHAR_UUID(BLEUUID((uint16_t)0x2A29));// manufacture string
static BLEUUID MODELNUM_CHAR_UUID(BLEUUID((uint16_t)0x2A24));// model number string
static BLEUUID HARDWAREV_CHAR_UUID(BLEUUID((uint16_t)0x2A27));//hardware version string
static BLEUUID FIRMWAREV_CHAR_UUID(BLEUUID((uint16_t)0x2A26));//firmware version string
static BLEUUID SYSTEMID_CHAR_UUID(BLEUUID((uint16_t)0x2A23));//unique ID within mesh of n devices

//MAX30105 particleSensor;
MAX30105 ppg0,ppg1,ppg2;
static int SYSTEM_ID =  1;

//***DECLARE BLE Server, Services, and Characterisitcs for reference
  char serverName [] = "PPG_SYS"; 
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

  tcaselect(0);
  // Initialize sensor
  if(ppg0.begin(Wire, I2C_SPEED_FAST) == false) //Use default I2C port, 400kHz speed
  {
    //Serial.println("MAX30105 was not found. Please check wiring/power. ");
    while (1);
  }
  tcaselect(1);
  if(ppg1.begin(Wire, I2C_SPEED_FAST) == false) //Use default I2C port, 400kHz speed
  {
    //Serial.println("MAX30105 was not found. Please check wiring/power. ");
    while (1);
  }
  tcaselect(2);
  if(ppg2.begin(Wire, I2C_SPEED_FAST) == false) //Use default I2C port, 400kHz speed
  {
    Serial.println("MAX30105 was not found. Please check wiring/power. ");
    while (1);
  }

  //Setup to sense up to 18 inches, max LED brightness
  byte ledBrightness = 0xFF; //Options: 0=Off to 255=50mA
  byte sampleAverage = 1; //Options: 1, 2, 4, 8, 16, 32
  byte ledMode = 3; //Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
  int sampleRate = 400; //Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
  int pulseWidth = 69; //Options: 69, 118, 215, 411
  int adcRange = 16384; //Options: 2048, 4096, 8192, 16384
  
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


   tcaselect(0);
        ppg0.check(); //Check the sensor, read up to 3 samples //i2c burst read
        while (ppg0.available()) //do we have new data? //loop around i2c burst read
        {
          #ifdef DEBUG 
            samplesTaken++;
          #endif DEBUG 
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
     #ifdef DEBUG   
      }
     
    
      long endTime = micros();
    
      Serial.print("Hz[");
      Serial.print((float)samplesTaken / ((endTime - startTime) / 1000000.0), 2);
      Serial.print("]");
      Serial.println();
     #endif

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
