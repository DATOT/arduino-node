#ifndef INCLUDEpublicarduino_nodearduino_nodeh_
#define INCLUDEpublicarduino_nodearduino_nodeh_

#ifndef NO_ARDUINO_NODE

static uint8_t simpleChecksum(const String& key, long value) {
  uint8_t c = 0;
  for (size_t i = 0; i < key.length(); i++) c ^= key[i];
  c ^= (value & 0xFF);
  c ^= ((value >> 8) & 0xFF);
  c ^= ((value >> 16) & 0xFF);
  c ^= ((value >> 24) & 0xFF);
  return c;
}

// escape quotes
static String escapeKey(const String& key) {
  String out = "";
  for (size_t i = 0; i < key.length(); i++) {
    char c = key[i];
    if (c == '"') out += "\\\"";
    else out += c;
  }
  return out;
}

void sendNodePacket(const String& key, long value, bool flush = true) {
  String safeKey = escapeKey(key);

  Serial.print("__ARDUINO_NODE_PKG__:{[");
  Serial.print(millis());
  Serial.print("];(\"key\":\"");
  Serial.print(safeKey);
  Serial.print("\",\"value\":");
  Serial.print(value);
  Serial.print(",\"checksum\":");
  Serial.print(simpleChecksum(key, value));
  Serial.print(")}\n");

  if (flush) Serial.flush();
}

// overload for float
void sendNodePacket(const String& key, float value, bool flush = true) {
  Serial.print("__ARDUINO_NODE_PKG__:{[");
  Serial.print(millis());
  Serial.print("];(\"key\":\"");
  Serial.print(escapeKey(key));
  Serial.print("\",\"value\":");
  Serial.print(value, 6);
  Serial.print(")}\n");

  if (flush) Serial.flush();
}

#else

// disabled build
inline void sendNodePacket(const String&, long, bool = true) {}
inline void sendNodePacket(const String&, float, bool = true) {}

#endif

#endif  // INCLUDEpublicarduino_nodearduino_node.h_
