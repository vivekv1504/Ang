# ⚡ Quick Setup Guide - New Features

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies (Already Done!)
```bash
cd /Users/vinvivek/Angular-Task/sipstop
npm install
```
✅ nodemailer and dotenv have been installed

### Step 2: Configure Email Service

#### Create `.env` file:
```bash
# In the sipstop directory, create a file named .env
touch .env
```

#### Add your email credentials to `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
APP_URL=http://localhost:4200
```

#### Get Gmail App Password:
1. Go to https://myaccount.google.com/
2. Click **Security** → Enable **2-Step Verification**
3. Click **Security** → **App passwords**
4. Select **Mail** → Generate password
5. Copy the 16-character password
6. Paste it in `.env` as EMAIL_PASSWORD

### Step 3: Start the Application

#### Terminal 1 - Start Backend:
```bash
cd /Users/vinvivek/Angular-Task/sipstop
node server.js
```

You should see:
```
✅ Email service is ready to send messages
🚀 SipStop Backend Server is running!
```

#### Terminal 2 - Start Angular:
```bash
cd /Users/vinvivek/Angular-Task/sipstop
npm start
```

### Step 4: Test the Features! 🎉

#### Test Email Notifications:
1. Go to http://localhost:4200
2. Click **Sign Up**
3. Create a new account
4. Check your email for welcome message! 📧
5. Login and place an order
6. Check email for order confirmation! 📦

#### Test User Profile:
1. Login to your account
2. Click **👤 Profile** button in navigation
3. View your profile information
4. Click **Edit Profile**
5. Update your information
6. Click **Save Changes**
7. See success message! ✨

---

## 🎯 What's New

### ✅ Email Notifications
- **Welcome Email**: Sent when users sign up
- **Order Confirmation**: Sent when orders are placed
- Professional HTML templates with your brand colors
- Includes order details, shipping info, and more

### ✅ User Profiles
- **View Profile**: See all your account information
- **Edit Profile**: Update name, phone, address
- **Secure**: Email and role cannot be changed
- **Beautiful UI**: Modern design with gradient headers
- **Accessible**: From both customer and admin dashboards

---

## 📁 New Files Created

- `email-service.js` - Email functionality
- `ENV_TEMPLATE.txt` - Configuration template
- `src/app/components/profile/*` - Profile component (4 files)
- `NEW_FEATURES_GUIDE.md` - Detailed documentation

---

## ⚠️ Important Notes

1. **Email Setup Required**: Without .env configuration, emails won't send (app will still work)
2. **Gmail Security**: Must use App Password, not regular password
3. **Backend Required**: For full functionality, keep server.js running
4. **Profile Access**: Available to both customers and admin/owner

---

## 🐛 Troubleshooting

**Emails not sending?**
- Check `.env` file exists and has correct values
- Verify App Password is correct (try generating a new one)
- Check server console for error messages

**Profile not saving?**
- Make sure backend server (node server.js) is running
- Check browser console for errors
- Verify you're logged in

**Can't access profile?**
- Make sure you're logged in
- Check that you're navigating from dashboard

---

## 📚 Need More Details?

See `NEW_FEATURES_GUIDE.md` for:
- Complete implementation details
- Advanced configuration options
- Alternative email providers
- Security features
- UI/UX details

---

## ✨ You're All Set!

Your SipStop application now has professional email notifications and user profile management!

**Happy testing!** 🎉

