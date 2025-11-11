# 📧 Email Notification Setup Guide

## ⚠️ IMPORTANT: Email notifications will NOT work until you complete this setup!

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. **Go to Google Account:** https://myaccount.google.com/
2. **Enable 2-Step Verification** (if not already enabled):
   - Click **Security** (left sidebar)
   - Scroll to **2-Step Verification**
   - Click **Get Started** and follow instructions
   
3. **Generate App Password:**
   - Go back to **Security**
   - Scroll to **2-Step Verification** section
   - Click **App passwords** (at the bottom)
   - Select:
     - App: **Mail**
     - Device: **Other (Custom name)** → Type "SipStop"
   - Click **Generate**
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure .env File

1. **Open the `.env` file** in the `sipstop` directory:
   ```bash
   cd /Users/vinvivek/Angular-Task/sipstop
   nano .env
   # or use any text editor
   ```

2. **Replace the placeholder values:**
   ```env
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   APP_URL=http://localhost:4200
   ```

   **Example:**
   ```env
   EMAIL_USER=john.doe@gmail.com
   EMAIL_PASSWORD=xyzw abcd efgh ijkl
   APP_URL=http://localhost:4200
   ```

3. **Save the file** (Ctrl+O, Enter, Ctrl+X for nano)

### Step 3: Restart Your Server

**IMPORTANT:** You must restart the backend server after configuring .env!

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
node server.js
```

You should see:
```
✅ Email service is ready to send messages
🚀 SipStop Backend Server is running!
```

### Step 4: Test Email Notifications

1. **Go to your app:** http://localhost:4200
2. **Click Sign Up**
3. **Create a new test account:**
   - Name: Test User
   - Email: your-email@gmail.com (use YOUR email to receive it)
   - Password: test123
   - Role: Customer
4. **Submit the form**
5. **Check your email inbox!** 📬

---

## 🔍 Troubleshooting

### Issue 1: "Email service error" in console

**Problem:** Invalid credentials or 2-Step Verification not enabled

**Solution:**
1. Verify 2-Step Verification is enabled
2. Generate a new App Password
3. Copy it exactly (no spaces if the password doesn't have them)
4. Update `.env` file
5. Restart server

### Issue 2: No error but no email received

**Problem:** Email might be in Spam or wrong email address

**Solution:**
1. Check your **Spam/Junk folder**
2. Verify EMAIL_USER in `.env` is correct
3. Check server console for "📧 Welcome email sent to..." message
4. Try with a different email address

### Issue 3: "Authentication failed" error

**Problem:** Using regular password instead of App Password

**Solution:**
1. You MUST use an App Password (16 characters)
2. NOT your regular Gmail password
3. Follow Step 1 above to generate App Password

### Issue 4: Server shows "⚠️ Email service error"

**Problem:** .env file not loaded or wrong format

**Solution:**
1. Verify `.env` file exists in sipstop directory
2. Check there are no extra spaces or quotes
3. Restart the server
4. Check console for error details

---

## 📝 Current .env File Location

```
/Users/vinvivek/Angular-Task/sipstop/.env
```

You can edit it with:
```bash
cd /Users/vinvivek/Angular-Task/sipstop
nano .env
# or
code .env  # if using VS Code
# or
open -e .env  # if using TextEdit on Mac
```

---

## 🧪 Test Commands

### Check if .env file exists:
```bash
cd /Users/vinvivek/Angular-Task/sipstop
cat .env
```

### Test email service manually:
```bash
cd /Users/vinvivek/Angular-Task/sipstop
node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER); console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');"
```

### View server logs:
```bash
# Start server with full logging
node server.js
# Watch for these messages:
# ✅ Email service is ready to send messages
# 📧 Welcome email sent to user@email.com
# OR
# ❌ Failed to send welcome email to user@email.com: [error details]
```

---

## 📧 What Emails Are Sent?

### 1. Welcome Email (Signup)
- **Trigger:** User creates new account
- **To:** User's email address
- **Subject:** "Welcome to SipStop! 🥤"
- **Contains:** 
  - Personalized greeting
  - Welcome message
  - "Start Shopping" button
  - Professional gradient design

### 2. Order Confirmation Email (Order Placed)
- **Trigger:** User completes checkout
- **To:** User's email address
- **Subject:** "Order Confirmation - [Order Number] 📦"
- **Contains:**
  - Order number
  - Complete order details (items, prices)
  - Shipping address
  - Payment method
  - Total amount
  - Professional table layout

---

## 🔐 Security Notes

1. **Never commit .env file to Git** (it's already in .gitignore)
2. **Keep your App Password secret**
3. **Don't share your .env file**
4. **Revoke App Password** if compromised:
   - Go to https://myaccount.google.com/
   - Security → App passwords
   - Remove the password

---

## 🎯 Alternative: Using SendGrid (Recommended for Production)

If you want better email deliverability:

1. **Sign up for SendGrid:** https://sendgrid.com/ (Free tier: 100 emails/day)

2. **Get API Key:**
   - Dashboard → Settings → API Keys
   - Create API Key
   - Copy the key

3. **Update email-service.js:**
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.sendgrid.net',
     port: 587,
     auth: {
       user: 'apikey',
       pass: process.env.SENDGRID_API_KEY
     }
   });
   ```

4. **Update .env:**
   ```env
   SENDGRID_API_KEY=your-api-key-here
   APP_URL=http://localhost:4200
   ```

---

## ✅ Verification Checklist

Before testing, ensure:
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] `.env` file created and configured
- [ ] EMAIL_USER is your Gmail address
- [ ] EMAIL_PASSWORD is the App Password (16 chars)
- [ ] Server restarted after configuring .env
- [ ] Server shows "✅ Email service is ready"

---

## 💡 Pro Tips

1. **Use a test Gmail account** for development
2. **Check spam folder** - first emails often go there
3. **Whitelist sender** by adding to contacts
4. **Monitor server console** for email logs
5. **Test with your own email** to verify immediately

---

## 📞 Still Not Working?

If you've followed all steps and it still doesn't work:

1. **Check server console** for exact error message
2. **Verify .env values** with no extra spaces/quotes
3. **Try a different Gmail account**
4. **Check Gmail's "Less secure app access"** (though App Passwords should work)
5. **Consider using SendGrid** for production

---

## 🎉 Success Indicators

When working correctly, you'll see:

**In Server Console:**
```
✅ Email service is ready to send messages
📧 Welcome email sent to user@email.com
```

**In Your Inbox:**
- Beautiful welcome email with purple gradient
- Professional design
- Personalized with user's name
- "Start Shopping" button

---

**Now configure your .env file and restart the server!** 🚀

