let websocket: WebSocket; // Initialize as null

export const initializeWebSocket = (url: string): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    websocket = new WebSocket(url); // Use the native WebSocket API

    websocket.onopen = () => {
      console.log("WebSocket connection established");
      resolve(websocket); // Resolve with the WebSocket instance
    };

    websocket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  });
};

// Function to get the current WebSocket instance
export const getWebSocket = (): WebSocket | null => {
  return websocket; // Return the WebSocket instance or null
};
