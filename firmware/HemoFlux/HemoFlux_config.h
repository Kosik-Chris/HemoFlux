//#define DEBUG
//#define OUTPUT_READABLE_ACCELGYRO
//#define PPG_DEBUG
//#define HRDEBUG
#define GYRODEBUG
#define TXDELAY 30
#define MAX_NUM_PPG 7 //8 -1 (i2c gyro/accel)
#define NUM_PPG 1
#define MAX_CHAR_HANDLE 100 //max number chars per service
#define HARDWARE_VERSION "V0.0.2"
#define FIRMWARE_VERSION "V0.0.2"
#define MANUFACTURE_NAME "CASSS"
#define MODEL_NUM "1"
#define BATTLVLPIN 34

#define TCAADDR 0x70
#define MPUADDR 0x69

//Setup to sense up to 18 inches, max LED brightness
#define ledBrightness 0xFF //Options: 0=Off to 255=50mA
#define sampleAverage 1 //Options: 1, 2, 4, 8, 16, 32
#define ledMode 3 //Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
#define sampleRate 400 //Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
#define pulseWidth 69 //Options: 69, 118, 215, 411
#define adcRange 16384 //Options: 2048, 4096, 8192, 16384

//BLE DEFINITIONS
#define CHANNEL_SERV_UUID BLEUUID("0265204d-6cfd-4be7-8548-25f0f941b794")
#define REDCHAR_0_CHAR_UUID "050447d6-8ac9-4bd8-b004-0a5fe425029a"
#define REDCHAR_1_CHAR_UUID "59eb1a6f-9839-483d-90aa-511b96585820"
#define REDCHAR_2_CHAR_UUID "031edcf6-02c9-4267-a657-91eacd0febc8"
#define REDCHAR_3_CHAR_UUID "2733431b-0e59-4f38-8cb4-33b3f6bb8795"
#define REDCHAR_4_CHAR_UUID "3bb2770d-89a0-45ac-8aad-ca1a7ad9fe3e"
#define REDCHAR_5_CHAR_UUID "67051d05-68ac-4748-840b-b835600f2ad7"
#define REDCHAR_6_CHAR_UUID "f9c35962-b1d1-40a8-8766-0d9e6f1fb1ea"

//#define IR_SERV_UUID BLEUUID("a9e81533-d3b4-4b20-9c34-6d817942b69a")
#define IRCHAR_0_CHAR_UUID "654859cc-9a09-453f-b87a-8493f0fc1890"
#define IRCHAR_1_CHAR_UUID "ec402230-01bb-4013-85a2-82df61e7b869"
#define IRCHAR_2_CHAR_UUID "392e2b46-ac60-4807-a329-016c65f09a28"
#define IRCHAR_3_CHAR_UUID "2dd4bab3-1416-425f-a12f-ebaf5f9fe4ab"
#define IRCHAR_4_CHAR_UUID "6813e7f7-6c85-460a-9715-c096c7c8a61f"
#define IRCHAR_5_CHAR_UUID "8844f336-3974-45c3-b582-c3369baf3f27"
#define IRCHAR_6_CHAR_UUID "fdbddd27-6328-4cc1-bb0d-666a1b4fb8eb"

//#define GREEN_SERV_UUID BLEUUID("08fcbfeb-ea38-4085-9800-cd03ff14f2a0")
#define GREENCHAR_0_CHAR_UUID "686af018-8d13-4dd0-afe1-fecbdd054219"
#define GREENCHAR_1_CHAR_UUID "711c47c2-3b96-4fee-ace5-fad82ea2f41b"
#define GREENCHAR_2_CHAR_UUID "e344ff91-2d0c-43fe-bf4c-41bf78047cdf"
#define GREENCHAR_3_CHAR_UUID "8b98cdf7-838e-4d0e-bdc8-1f17ab49c32d"
#define GREENCHAR_4_CHAR_UUID "39261629-11a6-4daf-b8bc-f928de195e93"
#define GREENCHAR_5_CHAR_UUID "fd9770fd-4073-4fb7-b7ad-3efd232113b8"
#define GREENCHAR_6_CHAR_UUID "9704c035-f804-4e29-bace-14b8d0a4ec77"

#define HR_SERV_UUID BLEUUID((uint16_t)0x180D)
#define HR_CHAR_UUID BLEUUID((uint16_t)0x2A37)

#define BATT_SERV_UUID BLEUUID((uint16_t)0x180F)
#define BATT_CHAR_UUID BLEUUID((uint16_t)0x2A19)

#define DEVINFO_SERV_UUID BLEUUID((uint16_t)0x180A)
#define MANUFACT_CHAR_UUID BLEUUID((uint16_t)0x2A29)
#define MODELNUM_CHAR_UUID BLEUUID((uint16_t)0x2A24)
#define HARDWAREV_CHAR_UUID BLEUUID((uint16_t)0x2A27)
#define FIRMWAREV_CHAR_UUID BLEUUID((uint16_t)0x2A26)
#define SYSTEMID_CHAR_UUID BLEUUID((uint16_t)0x2A23)

#define DIMENSIONS_SERV_UUID BLEUUID("40940496-19d7-4c8f-9057-f87bb56c6210") //service to hold orientation and accel vectors
#define AX_CHAR_UUID "9f0f16e4-3a52-4669-9f6f-6415083429de"
#define AY_CHAR_UUID "b3a77cdb-5015-4ccd-abbf-0fde8541b75d"
#define AZ_CHAR_UUID "07c4d47a-e25b-416a-a39f-14727cb9d062"
#define GX_CHAR_UUID "d1b604bf-351c-444c-98d0-49a200bcb7e4"
#define GY_CHAR_UUID "bd19e5d0-2a47-4407-b7ab-6d6f20b15bd7"
#define GZ_CHAR_UUID "852b8b8d-3a64-4733-996b-b0f55452f592"

//IMU calibration
#define imu_buffersize 1000     //Amount of readings used to average, make it higher to get more precision but sketch will be slower  (default:1000)
#define acel_deadzone 8          //Acelerometer error allowed, make it lower to get more precision, but sketch may not converge  (default:8)
#define giro_deadzone 1
