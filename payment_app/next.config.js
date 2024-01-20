const withPWA = require("next-pwa")({
  dest: "public",
  register: true, // Register the PWA service worker
});
module.exports = withPWA({
});
