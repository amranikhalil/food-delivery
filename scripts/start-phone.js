// Starts Expo for testing on a phone over Wi-Fi.
// - Puts this PC's Wi-Fi address in the QR code (not 127.0.0.1)
// - Builds the Android bundle right away, so Expo Go doesn't time out
// Usage (inside user-side or driver-app):  yarn start   (extra flags pass through, e.g. yarn start -c)
const os = require("os");
const http = require("http");
const { spawn } = require("child_process");

const PORT = Number(process.env.EXPO_PORT) || 8081;

function findLanIp() {
  const candidates = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family !== "IPv4" || a.internal || a.address.startsWith("169.254.")) continue;
      candidates.push({ name, address: a.address });
    }
  }
  const wifi = candidates.find((c) => /wi-?fi|wlan|wireless/i.test(c.name));
  return (wifi || candidates[0] || {}).address;
}

const ip = findLanIp();
if (!ip) {
  console.error("No Wi-Fi/network connection found. Connect to Wi-Fi and try again.");
  process.exit(1);
}
console.log(`\n> Using PC address ${ip} (phone must be on the same Wi-Fi)\n`);

const expo = spawn("npx", ["expo", "start", "--lan", "--port", String(PORT), ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: ip },
});
expo.on("exit", (code) => process.exit(code ?? 0));

// Wait for the server, then request the bundle once so it's ready before scanning.
const bundleUrl = `http://${ip}:${PORT}/index.bundle?platform=android&dev=true&hot=false&lazy=true`;

function warmUp(triesLeft) {
  http
    .get(`http://${ip}:${PORT}/status`, (res) => {
      res.resume();
      console.log("\n> Building the app for the phone, wait for 'ready to scan'...\n");
      http
        .get(bundleUrl, (b) => {
          b.resume();
          b.on("end", () => console.log("\n> Ready to scan: open Expo Go and scan the QR code above.\n"));
        })
        .on("error", () => {});
    })
    .on("error", () => {
      if (triesLeft > 0) setTimeout(() => warmUp(triesLeft - 1), 2000);
    });
}
warmUp(60);
