require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const os = require("os");
const qrcode = require("qrcode-terminal");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const app = express();
const server = http.createServer(app);

// Enable CORS for cross-device network connections
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // Listen on all network interfaces

// Configure Session Middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if serving over HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);

// Share session state with Socket.IO connections
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Authentication Middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect("/login");
}

// Routes
app.get("/login", (req, res) => {
  if (req.session?.authenticated) {
    return res.redirect("/admin");
  }
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const envUsername = process.env.ADMIN_USERNAME;
  const envHash = process.env.ADMIN_PASSWORD_HASH;

  if (username === envUsername && envHash) {
    const isMatch = await bcrypt.compare(password, envHash);
    if (isMatch) {
      req.session.authenticated = true;
      req.session.username = username;
      return res.redirect("/admin");
    }
  }

  res.redirect("/login?error=invalid");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Protected Admin Console Route
app.get("/admin", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Public Display Screen Route
app.get("/display", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "display.html"));
});

app.get("/", (req, res) => {
  res.redirect("/display");
});

// In-memory notification history buffer (max 20)
let history = [];

// Socket.IO Logic with Authorization Checks
io.on("connection", (socket) => {
  const sessionData = socket.request.session;
  const isAuthenticated = sessionData && sessionData.authenticated;

  console.log("Client connected:", socket.id, "from", socket.handshake.address, "| Authenticated:", !!isAuthenticated);

  // Send current history buffer to newly connected display screens
  socket.emit("history", history);

  socket.on("send-notification", (data) => {
    if (!isAuthenticated) {
      return socket.emit("error-msg", "Unauthorized: Admin login required.");
    }

    const notification = {
      id: Date.now(),
      title: data.title || "Announcement",
      message: data.message || "",
      type: data.type || "info", // info | success | warning | urgent
      time: new Date().toLocaleTimeString(),
    };

    history.unshift(notification);
    history = history.slice(0, 20);

    // Broadcast to all connected displays and admins
    io.emit("notification", notification);
    io.emit("new-notification", notification); // Dual-compatibility event
    console.log("Notification sent:", notification);
  });

  socket.on("clear-notifications", () => {
    if (!isAuthenticated) {
      return socket.emit("error-msg", "Unauthorized: Admin login required.");
    }

    history = [];
    io.emit("cleared");
    io.emit("clear-display"); // Dual-compatibility event
    console.log("Display history cleared by admin.");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Retrieve local IPv4 network address
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

// Start Server
server.listen(PORT, HOST, () => {
  const ips = getLocalIPs();

  console.log("\n=== Hackathon Broadcast — running ===\n");
  console.log(`On this machine:`);
  console.log(`  Admin panel:    http://localhost:${PORT}/admin`);
  console.log(`  Display screen: http://localhost:${PORT}/display`);

  if (ips.length === 0) {
    console.log(`\nNo network IP detected — other devices won't be able to connect.`);
    console.log(`Make sure you're connected to WiFi/LAN, then restart the server.`);
  } else {
    console.log(`\nFrom other devices on the same network:`);
    ips.forEach((ip) => {
      console.log(`  Admin panel:    http://${ip}:${PORT}/admin`);
      console.log(`  Display screen: http://${ip}:${PORT}/display`);
    });

    console.log(`\nScan to open the login / admin panel on a phone:`);
    qrcode.generate(`http://${ips[0]}:${PORT}/admin`, { small: true });
  }

  console.log(`\nMake sure your firewall allows incoming connections on port ${PORT}.\n`);
});