'use client'
import React, { createContext, useContext, useState, useRef } from "react";

type SerialContextType = {
  port: SerialPort | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  send: (data: string) => Promise<void>;
  latestData: string;
  latestDataParsed: ParsedPackage | null;
  isConnected: boolean;
};

const SerialContext = createContext<SerialContextType | null>(null);

export const useSerial = () => {
  const ctx = useContext(SerialContext);
  if (!ctx) throw new Error("useSerial must be used inside SerialProvider");
  return ctx;
};

interface ParsedPackage {
  key: string;
  value: string;
  time?: number | null;
};

export const SerialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [latestData, setLatestData] = useState("");
  const [latestDataParsed, setLatestDataParsed] = useState<ParsedPackage | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const readLoopActive = useRef(false);

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const parsePackage = (input: string) => {
    const PREFIX = "__ARDUINO_NODE_PKG__:";

    if (!input.startsWith(PREFIX)) return null;

    const payload = input.slice(PREFIX.length);
    const match = payload.match(/^\{\[(\d+)\];\("([^"]+)":"([^"]+)"\)\}$/);

    if (!match) return null;

    const [, timeStr, key, value] = match;

    const parsed = {
      key,
      value,
      time: Number(timeStr),
    };

    console.log("[parse] ✅", parsed);
    return parsed;
  };

  const connect = async () => {
    console.log("[serial] 🔌 connect()");

    if (!("serial" in navigator)) {
      alert("Web Serial not supported");
      return;
    }

    if (isConnected) return;

    try {
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 9600 });

      const reader = selectedPort.readable!.getReader();
      const writer = selectedPort.writable!.getWriter();

      readerRef.current = reader;
      writerRef.current = writer;

      setPort(selectedPort);
      setIsConnected(true);
      readLoopActive.current = true;

      let buffer = "";

      console.log("[serial] 🚀 read loop start");

      (async () => {
        try {
          while (readLoopActive.current) {
            const { value, done } = await reader.read();

            if (done) break;

            if (value) {
              const decoded = decoder.decode(value, { stream: true });

              console.log("[serial] 📥 raw:", value);
              console.log("[serial] 🔤 decoded:", decoded);

              buffer += decoded;
              const MAX_LENGTH = 1000;

              setLatestData(prev => {
                const next = prev + decoded;
                return next.length > MAX_LENGTH
                  ? next.slice(-MAX_LENGTH)
                  : next;
              });

              const PREFIX = "__ARDUINO_NODE_PKG__:";
              let start;

              while ((start = buffer.indexOf(PREFIX)) !== -1) {
                const end = buffer.indexOf("}", start);

                if (end === -1) break;

                const packet = buffer.slice(start, end + 1);
                console.log("[serial] 📦 packet:", packet);

                const parsed = parsePackage(packet);
                if (parsed) {
                  setLatestDataParsed(parsed);
                }

                buffer = buffer.slice(end + 1);
              }
            }
          }
        } catch (err) {
          console.error("[serial] ❌ read error:", err);
        }
      })();

    } catch (err) {
      console.error("[serial] ❌ connect error:", err);
    }
  };

  const disconnect = async () => {
    console.log("[serial] 🔌 disconnect()");

    if (!port) return;

    try {
      readLoopActive.current = false;

      await readerRef.current?.cancel();
      readerRef.current?.releaseLock();
      readerRef.current = null;

      await writerRef.current?.close();
      writerRef.current?.releaseLock();
      writerRef.current = null;

      await port.close();
    } catch (err) {
      console.error("[serial] ❌ disconnect error:", err);
    } finally {
      setPort(null);
      setIsConnected(false);
    }
  };

  const send = async (data: string) => {
    console.log("[serial] 📤 send:", data);

    if (!writerRef.current) return;

    try {
      const encoded = encoder.encode(data);
      await writerRef.current.write(encoded);
    } catch (err) {
      console.error("[serial] ❌ send error:", err);
    }
  };

  return (
    <SerialContext.Provider
      value={{
        port,
        connect,
        disconnect,
        send,
        latestData,
        latestDataParsed,
        isConnected
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};


