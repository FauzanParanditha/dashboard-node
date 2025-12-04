let websocket: WebSocket | null = null;
let isManuallyClosed = false; // ❌ Prevents unwanted reconnections
let shouldReconnect = true; // ✅ Controls whether WebSocket should reconnect

export const initializeWebSocket = (
  url: string,
  forceReconnect = false,
): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    if (websocket && !forceReconnect) {
      console.log("⚠️ WebSocket already initialized.");
      return resolve(websocket);
    }

    if (!shouldReconnect) {
      console.log("🚫 WebSocket will not reconnect (successPayment).");
      return reject(new Error("WebSocket reconnection is disabled."));
    }

    console.log("🛠️ Initializing WebSocket connection...");

    websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log("✅ WebSocket connection established");
      isManuallyClosed = false; // ✅ Reset manual close flag
      resolve(websocket as WebSocket);
    };

    websocket.onmessage = (event) => {
      console.log(`📩 Received message: ${event.data}`);
    };

    websocket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      reject(error);
    };

    websocket.onclose = () => {
      console.log("⚠️ WebSocket connection closed");

      if (!isManuallyClosed && shouldReconnect) {
        setTimeout(() => {
          console.log("🔄 Reconnecting WebSocket...");
          initializeWebSocket(url, true).catch(console.error);
        }, 3000);
      }
    };
  });
};

// ✅ Function to manually close WebSocket (prevents auto-reconnect)
export const closeWebSocket = () => {
  if (websocket) {
    isManuallyClosed = true;
    shouldReconnect = false; // ❌ Stop future reconnect attempts
    websocket.close();
    websocket = null;
    console.log("🔌 WebSocket manually closed.");
  }
};

// ✅ Function to re-enable WebSocket reconnection (after `cancelPayment`)
export const enableWebSocketReconnect = () => {
  console.log("🔄 WebSocket reconnect enabled.");
  shouldReconnect = true;
};

// ✅ Function to get the current WebSocket instance
export const getWebSocket = (): WebSocket | null => {
  return websocket;
};
