const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
    ? '/voicer-vue/'  // Замените 'voicer-vue' на имя вашего репозитория на GitHub
    : '/',
  devServer: {
    host: '0.0.0.0',           // Accept connections from any IP address
    allowedHosts: 'all',        // Allow requests from any host
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',  // Use auto WebSocket URL for hot-reloading
    },
  },
});
