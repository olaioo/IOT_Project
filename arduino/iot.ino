#include "ArduinoJson.h"

#define LED_PIN 13
#define BUTTON_PIN 12

String meuId="1";
int led_state = LOW;
int button_state = LOW;

String incomingByte = 0; // for incoming serial data
StaticJsonDocument<200> jsonLeitura;
StaticJsonDocument<200> jsonEscrita;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  jsonEscrita["id"]=meuId;
  
    Serial.begin(9600); // opens serial port, sets data rate to 9600 bps
}

void changeLedState(int state){
  if  (led_state == state){
    return;
  }
  
  led_state = state;
 
  digitalWrite(LED_PIN, led_state);
  escreverJson(String(led_state));
}

void escreverJson(String valor){
  jsonEscrita["value"]=valor;
  serializeJson(jsonEscrita, Serial);
  Serial.println();
}

void lerJson(String incomingByte){
     DeserializationError error = deserializeJson(jsonLeitura, incomingByte);
      // Test if parsing succeeds.
      if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.c_str());
        return;
      }
}

void loop() {
  // send data only when you receive data:
  if (Serial.available() > 0) {
    // read the incoming byte:
    String incomingByte = Serial.readString();
    lerJson(incomingByte);
    String id=jsonLeitura["id"];
    String value=jsonLeitura["value"];
    if(id.equals(meuId)){
      if (value.equals("0")){
        changeLedState(LOW);
      }
      if (value.equals("1")){
        changeLedState(HIGH);
      }
    }
  }
  
  // put your main code here, to run repeatedly:
  if (digitalRead(BUTTON_PIN) == HIGH){
    if (button_state == LOW){     
      changeLedState(!led_state);
      button_state = HIGH;
      delay(100);
    }
  }
  else if (button_state == HIGH){      
      button_state = LOW;
      delay(100);
  }
}
