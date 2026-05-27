//SE DEBEN INSTALAR LAS SIGUIENTES LIBRERIAS EN EL IDE DE ARDUINO:
//- MFRC522 by GithubCommunity (https://github.com/miguelbalboa/rfid)
//- ArduinoJson by Benoit Blanchon (https://github.com/bblanchon/ArduinoJson)

#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define SS_PIN 5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);

String tagData = "";

String stationName = "Preregistro"; //<----------------------- E S T A C I Ó N
//POR AHORA LA URL APUNTA A UN SERVIDOR LOCAL, SE DEBE CAMBIAR POR LA URL PUBLICA CUANDO SE SUBA EL PROYECTO A PRODUCCION
//TAMBIEN SE DEBERA CONFIGURAR LOS PERMISOS DE CORS EN EL BACKEND PARA PERMITIR PETICIONES DESDE EL ESP32 Y SOLO DESDE EL ESP32, PARA EVITAR USO INDEBIDO DE LA API

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://YOUR_SERVER_IP:3001/api/rfid/scan";

// --------------------------------------------------
// Separador visual
// --------------------------------------------------

void printSeparator() {

  Serial.println();
  Serial.println("--------------------------------");
  Serial.println();
}

// --------------------------------------------------
// CONECTAR WIFI
// --------------------------------------------------

void conectarWifi() {
  Serial.print("Conectando a WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi conectado. IP: " + WiFi.localIP().toString());
  printSeparator();
}

// --------------------------------------------------
// ENVIAR ESCANEO A LA API
// --------------------------------------------------

void enviarEscaneo(String tagId) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sin WiFi, reconectando...");
    conectarWifi();
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<128> doc;
  doc["tagId"]    = tagId;
  doc["readerId"] = stationName; // usa el nombre de estacion como readerId
  doc["etapa"]    = stationName; // cada lector fisico tiene su etapa fija

  String body;
  serializeJson(doc, body);
  Serial.println("Enviando a API: " + body);

  int httpCode = http.POST(body);

  if (httpCode == 200) {
    Serial.println("✓ Scan enviado correctamente");
  } else {
    Serial.println("✗ Error HTTP: " + String(httpCode));
  }

  http.end();
}

// --------------------------------------------------
// Esperar tarjeta
// --------------------------------------------------

void waitCard() {
  while ( !rfid.PICC_IsNewCardPresent() || 
          !rfid.PICC_ReadCardSerial() 
        ) { delay(100); } 
          
  Serial.println("Tarjeta detectada"); 
  // OBTENER TIPO DESPUES DE LEER 
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak); 
  Serial.print("Tipo detectado: "); 
  Serial.println( rfid.PICC_GetTypeName(piccType) );
}



// --------------------------------------------------
// ESCRIBIR DATOS
// --------------------------------------------------

void writeData(String data) {

  MFRC522::StatusCode status;

  byte page = 4;

  Serial.println("Escribiendo NTAG213...");

  // BUFFER LIMPIO
  byte fullBuffer[144];

  for (int i = 0; i < 144; i++) {

    fullBuffer[i] = 0x00;
  }

  // COPIAR STRING
  data.getBytes(fullBuffer, 144);

  // ESCRIBIR 4 BYTES POR PAGINA
  for (int i = 0; i < 144; i += 4) {

    byte writeBuffer[4];

    for (int j = 0; j < 4; j++) {

      writeBuffer[j] = fullBuffer[i + j];
    }

    status =
      rfid.MIFARE_Ultralight_Write(
        page,
        writeBuffer,
        4
      );

    if (status != MFRC522::STATUS_OK) {

      Serial.print("Error escritura pagina ");
      Serial.println(page);

      return;
    }

    Serial.print("Pagina escrita: ");
    Serial.println(page);

    page++;
  }

  Serial.println();
  Serial.println("WRITE completado");

  Serial.println();
  Serial.println("Contenido guardado:");
  Serial.println(data);

  rfid.PICC_HaltA();

  printSeparator();

}


// --------------------------------------------------
// LEER DATOS
// --------------------------------------------------

void readData() {

  MFRC522::StatusCode status;

  byte buffer[18];
  byte size = sizeof(buffer);

  String result = "";

  Serial.println("Leyendo NTAG213...");

  // LEER PAGINAS
  for (byte page = 4; page < 40; page += 4) {

    status =
      rfid.MIFARE_Read(
        page,
        buffer,
        &size
      );

    if (status != MFRC522::STATUS_OK) {

      Serial.print("Error lectura pagina ");
      Serial.println(page);

      return;
    }

    // 16 BYTES POR LECTURA
    for (int i = 0; i < 16; i++) {

      char c = (char)buffer[i];

      if (isPrintable(c)) {

        result += c;
      }
    }
  }

  Serial.println();
  Serial.println("READ completado");

  Serial.println();
  Serial.println("Contenido leido:");
  Serial.println(result);

  rfid.PICC_HaltA();

  printSeparator();
}

// --------------------------------------------------
// LISTEN MODE
// --------------------------------------------------

void listenMode() {

  Serial.println();
  Serial.println("LISTEN MODE iniciado");
  Serial.println("Presiona ENTER para salir...");
  Serial.println();

  String lastRead = "";

  while (true) {

    // SALIR CON ENTER
    if (Serial.available()) {

      String exitCommand =
        Serial.readStringUntil('\n');

      exitCommand.trim();

      Serial.println();
      Serial.println("LISTEN detenido");

      printSeparator();

      return;
    }

    // DETECTAR TARJETA
    if (
      rfid.PICC_IsNewCardPresent() &&
      rfid.PICC_ReadCardSerial()
    ) {

      MFRC522::StatusCode status;

      byte buffer[18];
      byte size = sizeof(buffer);

      String result = "";

      // LEER PAGINAS
      for (byte page = 4; page < 40; page += 4) {

        status =
          rfid.MIFARE_Read(
            page,
            buffer,
            &size
          );

        if (status != MFRC522::STATUS_OK) {

          Serial.print("Error lectura pagina ");
          Serial.println(page);

          rfid.PICC_HaltA();

          return;
        }

        for (int i = 0; i < 16; i++) {

          char c = (char)buffer[i];

          if (isPrintable(c)) {

            result += c;
          }
        }
      }

      // EVITAR SPAM DE MISMA TARJETA
      if (result != lastRead) {

        Serial.println("--------------------------------");

        Serial.println("TAG DETECTADO:");

        Serial.println(result);

        Serial.println("--------------------------------");

        lastRead = result;
        enviarEscaneo(result);
      }

      rfid.PICC_HaltA();

      delay(1000);
    }
  }
}


// --------------------------------------------------
// RESET TARJETA
// --------------------------------------------------

void resetCard() {

  MFRC522::StatusCode status;

  byte emptyPage[4];

  // PAGINA VACIA
  for (int i = 0; i < 4; i++) {

    emptyPage[i] = 0x00;
  }

  Serial.println("Borrando NTAG213...");

  for (byte page = 4; page < 40; page++) {

    status =
      rfid.MIFARE_Ultralight_Write(
        page,
        emptyPage,
        4
      );

    if (status != MFRC522::STATUS_OK) {

      Serial.print("Error borrando pagina ");
      Serial.println(page);

      return;
    }

    Serial.print("Pagina borrada: ");
    Serial.println(page);
  }

  Serial.println();
  Serial.println("RESET completado");

  Serial.println("Tag limpio");

  rfid.PICC_HaltA();

  printSeparator();
}

// --------------------------------------------------
// SETUP
// --------------------------------------------------

void setup() {

  Serial.begin(115200);

  SPI.begin();

  rfid.PCD_Init();


  Serial.println("=======================================================");
  Serial.print("|                 ESTACION: ");
  Serial.print(stationName);

  // ESPACIADO AUTOMATICO
  int spaces =
    28 - stationName.length();

  for (int i = 0; i < spaces; i++) {

    Serial.print(" ");
  }

  Serial.println("|");
  Serial.println("=======================================================");
  Serial.println("|  Comandos:                                           |");
  Serial.println("|  LISTEN --> Lectura constante de datos               |"); 
  Serial.println("|  WRITE ---> Sobreescribir en tarjeta                 |");
  Serial.println("|  READ ----> Lectura de la información en la tarjeta  |");
  Serial.println("|  UPDATE --> Actualizar el contenido en una tarjeta   |");
  Serial.println("|  RESET ---> Borra los datos dentro de una tarjeta    |");
  Serial.println("|  RESTART -> Reiniciar el Módulo ESP32 (pruebas)      |");
  Serial.println("=======================================================");

  printSeparator();
  conectarWifi();
}

// --------------------------------------------------
// LOOP
// --------------------------------------------------

void loop() {

  if (Serial.available()) {

    String command =
      Serial.readStringUntil('\n');

    command.trim();

    // --------------------------------

    if (command == "LISTEN") {

      printSeparator();

      listenMode();
    }

    // --------------------------------

    else if (command == "WRITE") {

      printSeparator();

      Serial.println("Ingresa el contenido:");

      while (!Serial.available()) {}

      tagData =
        Serial.readStringUntil('\n');

      tagData.trim();

      Serial.println();
      Serial.println("Acerca tarjeta para WRITE");

      waitCard();

      writeData(tagData);
    }

    // --------------------------------

    else if (command == "READ") {

      printSeparator();

      Serial.println("Acerca tarjeta para READ");

      waitCard();

      readData();
    }

    // --------------------------------

    else if (command == "UPDATE") {

      printSeparator();

      Serial.println("Ingresa nuevo contenido:");

      while (!Serial.available()) {}

      tagData =
        Serial.readStringUntil('\n');

      tagData.trim();

      Serial.println();
      Serial.println("Acerca tarjeta para UPDATE");

      waitCard();

      writeData(tagData);
    }

    // --------------------------------

    else if (command == "RESET") {

      printSeparator();

      Serial.println("Acerca tarjeta para RESET");

      waitCard();

      resetCard();
    }

    // --------------------------------

    else if (command == "RESTART") {

      printSeparator();

      Serial.println("Reiniciando ESP32...");

      delay(1000);

      ESP.restart();
    }

    // --------------------------------

    else {

      Serial.println("Comando no valido");

      printSeparator();
    }
  }
}