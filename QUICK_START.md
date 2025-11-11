# ⚡ Quick Start - Deploy in 3 Steps

## Step 1: Find Your IP Address

Run this command to find your IP:

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

**Windows:**
```bash
ipconfig | findstr IPv4
```

**Your IP will look like:** `192.168.1.100`

---

## Step 2: Update Configuration

Edit: `src/environments/environment.ts`

**Change line 9:**
```typescript
apiUrl: 'http://localhost:3000'
```

**To (use YOUR IP):**
```typescript
apiUrl: 'http://192.168.1.100:3000'
```

---

## Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm start
```

---

## ✅ Done!

**Access from your computer:**
```
http://localhost:4200
```

**Access from other devices (phones, tablets):**
```
http://YOUR_IP:4200
```

**Example:**
```
http://192.168.1.100:4200
```

---

## 🔥 If it doesn't work:

1. **Check Firewall:** Allow ports 3000 and 4200
2. **Same WiFi:** Make sure all devices are on same network
3. **Correct IP:** Verify you're using the right IP address

---

## 📖 Need more help?

See full guide: `DEPLOYMENT_GUIDE.md`

