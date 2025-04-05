#define TRIG_PIN 5
#define ECHO_PIN 15
#define IR_SENSOR_PIN 4  // Changed from GPIO 0 to GPIO 4
#define LED_PIN 16       // LED Indicator
#include <WiFi.h>
#include <HTTPClient.h>

const *char ssid = Eshwar;
const *char passwd = pavethran42


int ir = 0;
int count2 = 0;

const *char url = "http://172.168.115.228/";

void setup() {
  Serial.begin(115200);

  pinMode(IR_SENSOR_PIN, INPUT);  // Use pull-up to avoid floating values
  pinMode(LED_PIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  WiFi.begin(ssid, password);

    Serial.print("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");
}

void loop() {

  ir = digitalRead(IR_SENSOR_PIN);
  
  if (ir == LOW) {  // Adjust logic if needed based on IR sensor behavior
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  // Ultrasonic Sensor Measurement
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // Timeout at 30ms
  float distance = duration * 0.0343 / 2;

  if (duration == 0) {
    Serial.println("Out of range or no echo received!");
  }
  else{
    if (distance < 15){
      Serial.println("car parked");
      status = "parked";
      if (count2 != 1){
        if (WiFi.status() == WL_CONNECTED) {
          HTTPClient http;
          http.begin(url+"?status="+status);
          http.get()
        }
      }
      count2 = 1;
    }
    else{
      Serial.println("lot free");
      status = "free";
      if (count2 != 2){
        if (WiFi.status() == WL_CONNECTED) {
          HTTPClient http;
          http.begin(url+"?status="+status);
          http.get()
        }
      }
      count2 = 2;
    }
  } 
  delay(500);
}
