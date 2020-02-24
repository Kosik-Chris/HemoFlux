#include <Wire.h>
#include "MAX30105.h"

MAX30105 particleSensor1;
MAX30105 particleSensor2;
#define TCAADDR 0x70

uint32_t IRValue;
//#define debug Serial //Uncomment this line if you're using an Uno or ESP
//#define debug SerialUSB //Uncomment this line if you're using a SAMD21

void setup()
{
  tcaselect(0);
  delay(10);
  Serial.begin(9600);
  
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

}

void tcaselect(uint8_t i) {
  if (i > 7) return;
 
  Wire.beginTransmission(TCAADDR);
  Wire.write(1 << i);
  Wire.endTransmission();  
}

void loop()
{
  tcaselect(0);
  delay(10);
  IRValue = particleSensor1.getIR();
  Serial.print(IRValue);
  Serial.print(" ");

  
  tcaselect(1);
  delay(10);
  IRValue = particleSensor2.getIR();
  Serial.print(IRValue);
  Serial.println();


  
}
