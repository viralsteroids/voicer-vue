const { defineConfig } = require('@vue/cli-service')
module.exports = {
  devServer: {
    host: '0.0.0.0',           // Accept connections from any IP address
    allowedHosts: 'all',        // Allow requests from any host
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',  // Use auto WebSocket URL for hot-reloading
    },
  },
};