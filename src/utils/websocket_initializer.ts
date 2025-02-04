let websocket: WebSocket | null = null;
let isManuallyClosed = false; // Prevents unwanted reconnections

export const initializeWebSocket = (url: string): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    if (websocket) {
      console.log("WebSocket already initialized.");
      return resolve(websocket);
    }

    websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log("✅ WebSocket connection established");
      isManuallyClosed = false; // Reset manual close flag
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

      if (!isManuallyClosed) {
        setTimeout(() => {
          console.log("🔄 Reconnecting WebSocket...");
          initializeWebSocket(url).catch(console.error);
        }, 3000); // Retry connection after 3 seconds
      }
    };
  });
};

// ✅ Function to manually close WebSocket (prevents auto-reconnect)
export const closeWebSocket = () => {
  if (websocket) {
    isManuallyClosed = true;
    websocket.close();
    websocket = null;
    console.log("🔌 WebSocket manually closed.");
  }
};

// ✅ Function to get the current WebSocket instance
export const getWebSocket = (): WebSocket | null => {
  return websocket;
};
