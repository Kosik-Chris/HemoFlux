
// I2Cdev and MPU6050 must be installed as libraries, or else the .cpp/.h files
// for both classes must be in the include path of your project
#include "I2Cdev.h"
#include "MPU6050.h"
#include "MAX30105.h"

MAX30105 particleSensor1;
MAX30105 particleSensor2;
#define TCAADDR 0x70
unsigned long tim;

uint32_t IRValue;
// Arduino Wire library is required if I2Cdev I2CDEV_ARDUINO_WIRE implementation
// is used in I2Cdev.h
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
    #include "Wire.h"
#endif

MPU6050 accelgyro;
//MPU6050 accelgyro(0x69); // <-- use for AD0 high


int16_t ax, ay, az;
int16_t gx, gy, gz;

#define OUTPUT_READABLE_ACCELGYRO //Slow tab separated UART

//#define OUTPUT_BINARY_ACCELGYRO //Fast, hard to parse

#define LED_PIN 13

void tcaselect(uint8_t i) {
  if (i > 7) return;
 
  Wire.beginTransmission(TCAADDR);
  Wire.write(1 << i);
  Wire.endTransmission();  
}

void setup() {
    // join I2C bus (I2Cdev library doesn't do this automatically)
    #if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
        Wire.begin();
    #elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
        Fastwire::setup(400, true);
    #endif

    Serial.begin(38400);

    // initialize device
    Serial.println("Initializing I2C devices...");
    accelgyro.initialize();

    // verify connection
    Serial.println("Testing device connections...");
    Serial.println(accelgyro.testConnection() ? "MPU6050 connection successful" : "MPU6050 connection failed");

    // use the code below to change accel/gyro offset values
    
    Serial.println("Updating internal sensor offsets...");
//    accelgyro.setXAccelOffset(16957);
//    accelgyro.setYAccelOffset(-370);
//    accelgyro.setZAccelOffset(423);



    tcaselect(0);
    delay(10);
    
    // Initialize sensor 1
    if (particleSensor1.begin() == false)
    {
      Serial.println("MAX30105 was not found. Please check wiring/power. ");
      while (1);
    }
  
    particleSensor1.setup(); //Configure sensor. Use 6.4mA for LED drive
    //--------------------------------------------------------------------------
    tcaselect(1);
    delay(10);
    // Initialize sensor2
    if (particleSensor2.begin() == false)
    {
      Serial.println("MAX30105 was not found. Please check wiring/power. ");
      while (1);
    }
  
    particleSensor2.setup(); //Configure sensor. Use 6.4mA for LED drive
    tcaselect(2);
}

void loop() {
    // read raw accel/gyro measurements from device
    
    tcaselect(2);
    accelgyro.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    double temp = accelgyro.getTemperature();
  
    tcaselect(0);
    IRValue = particleSensor1.getIR();
//    Serial.print(IRValue); Serial.print(" ");
    
    tcaselect(1);
    IRValue = particleSensor2.getIR();
//    Serial.print(IRValue); Serial.print(" ");

    tcaselect(0);
    IRValue = particleSensor1.getIR();
//    Serial.print(IRValue); Serial.print(" ");

    #ifdef OUTPUT_READABLE_ACCELGYRO
        // display tab-separated accel/gyro x/y/z values
        Serial.print((temp)/340 + 36.53); Serial.print(" ");
//        Serial.print(ax); Serial.print(" ");
//        Serial.print(ay); Serial.print(" ");
//        Serial.print(az); Serial.print(" ");
    #endif
    Serial.println(particleSensor1.readTemperature());
//    Serial.println(millis()-tim);
    tim=millis();

    #ifdef OUTPUT_BINARY_ACCELGYRO
        Serial.write((uint8_t)(ax >> 8)); Serial.write((uint8_t)(ax & 0xFF));
        Serial.write((uint8_t)(ay >> 8)); Serial.write((uint8_t)(ay & 0xFF));
        Serial.write((uint8_t)(az >> 8)); Serial.write((uint8_t)(az & 0xFF));
        Serial.write((uint8_t)(gx >> 8)); Serial.write((uint8_t)(gx & 0xFF));
        Serial.write((uint8_t)(gy >> 8)); Serial.write((uint8_t)(gy & 0xFF));
        Serial.write((uint8_t)(gz >> 8)); Serial.write((uint8_t)(gz & 0xFF));
    #endif


}
