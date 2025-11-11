# 🎉 New Features Guide - SipStop Application

This guide covers the two major features that have been added to the SipStop application:
1. **Email Notifications** 📧
2. **User Profiles** 👤

---

## 📧 Email Notifications

### Overview
The application now sends automated email notifications to users when they:
- **Create a new account** (Welcome Email)
- **Place an order** (Order Confirmation Email)

### Implementation Details

#### 1. Email Service (`email-service.js`)
A dedicated Node.js module that handles all email operations using Nodemailer.

**Features:**
- Welcome emails with branded HTML templates
- Order confirmation emails with complete order details
- Professional email design with gradient headers
- Error handling and logging

#### 2. Backend Integration (`server.js`)
The backend server has been updated to send emails automatically:

**POST `/api/users` (Signup)**
- Creates user account
- Sends welcome email asynchronously
- Doesn't block the response if email fails

**POST `/api/orders` (Order Placement)**
- Saves order to database
- Retrieves user information
- Sends order confirmation email with order details

### Setup Instructions

#### Step 1: Create `.env` File
Copy the content from `ENV_TEMPLATE.txt` and create a new file named `.env` in the sipstop directory:

```bash
# In the sipstop directory
touch .env
```

Add the following content:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
APP_URL=http://localhost:4200
```

#### Step 2: Get Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** > **2-Step Verification** (enable if not already)
3. Go to **Security** > **App passwords**
4. Select **Mail** and generate a password
5. Copy the 16-character password (no spaces)
6. Paste it in your `.env` file as `EMAIL_PASSWORD`

#### Step 3: Test Email Service

Start your backend server:

```bash
node server.js
```

You should see:
```
✅ Email service is ready to send messages
```

#### Step 4: Test the Feature

**Test Welcome Email:**
1. Go to the signup page
2. Create a new account
3. Check your email inbox for the welcome email

**Test Order Confirmation:**
1. Login as a customer
2. Add products to cart
3. Complete checkout
4. Check your email for the order confirmation

### Email Templates

#### Welcome Email
- Gradient purple header with "Welcome to SipStop!"
- Personalized greeting with user's name
- Call-to-action button to start shopping
- Professional footer

#### Order Confirmation Email
- Order number prominently displayed
- Complete order details in a table format
- Shipping address
- Payment method
- Total amount with currency formatting
- Link to view order status

### Troubleshooting

**Problem: Emails not sending**
- Check that your `.env` file exists and has correct credentials
- Verify your Gmail App Password is correct
- Check server console for error messages
- Ensure 2-Step Verification is enabled on your Google account

**Problem: "Email service error" in console**
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Try generating a new App Password
- Check your internet connection

### Alternative Email Services

If you prefer not to use Gmail, you can easily switch to other providers:

**SendGrid:**
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

**Mailgun:**
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASSWORD
  }
});
```

---

## 👤 User Profiles

### Overview
Users can now view and edit their profile information including:
- Personal information (name, email, phone)
- Address details (street, city, state, ZIP, country)
- Role information (read-only)

### Implementation Details

#### 1. Profile Component (`/src/app/components/profile/`)
A new standalone Angular component with:
- **TypeScript (`profile.ts`)**: Component logic with form handling
- **HTML (`profile.html`)**: Beautiful, responsive UI
- **CSS (`profile.css`)**: Modern styling with gradient header
- **Tests (`profile.spec.ts`)**: Unit tests

#### 2. User Model Extension
The User interface has been extended to include:
```typescript
interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'owner';
  phone?: string;           // NEW
  address?: {               // NEW
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}
```

#### 3. AuthService Updates
New methods added to `auth.ts`:
- `updateUserProfile(userId, updatedData)`: Updates user profile via API or localStorage
- `updateUserProfileLocally(userId, updatedData)`: Fallback for offline updates

#### 4. Backend API
New endpoint in `server.js`:
```
PUT /api/users/:id
```
- Updates user profile data
- Prevents role and ID changes
- Validates and saves to JSON file

### Features

#### View Profile
- Display all user information in a clean, organized layout
- Read-only fields for email and role
- Sections for Personal Information and Address

#### Edit Profile
- Click "Edit Profile" button to enable editing
- All fields except email and role become editable
- Real-time form validation

#### Save Changes
- Click "Save Changes" to update profile
- Shows "Saving..." indicator during update
- Success message on successful update
- Error handling with user-friendly messages

#### Navigation
- Profile button in main navigation bar (both admin and customer)
- "Go Back" button returns to appropriate dashboard
- Integrated with Angular routing and auth guards

### User Experience

#### For Customers
1. Login to your account
2. Click **👤 Profile** button in the top navigation
3. View your profile information
4. Click **Edit Profile** to make changes
5. Update any fields as needed
6. Click **Save Changes** to update
7. Use **Go Back** or **Cancel** to return

#### For Admin/Owner
1. Login to admin account
2. Click **👤 Profile** button in the top navigation
3. Same features as customers
4. Returns to admin dashboard when going back

### Security Features

- **Email Protection**: Email cannot be changed (prevents account hijacking)
- **Role Protection**: User role cannot be modified from profile
- **Authentication**: Profile route protected by auth guard
- **Backend Validation**: Server prevents role/ID changes
- **Session Management**: Updates sync with current session

### UI Features

- **Responsive Design**: Works perfectly on mobile and desktop
- **Modern Styling**: Gradient headers, smooth animations
- **Form Validation**: Required field indicators
- **Loading States**: Visual feedback during save operations
- **Success/Error Messages**: Clear communication with icons
- **Disabled State**: Read-only fields clearly marked

### Profile Data Storage

#### With Backend (server.js running)
- Data saved to `users.json` file
- Atomic file writes with verification
- Synchronizes across sessions

#### Without Backend (Offline)
- Data saved to browser localStorage
- Available only on current device
- Persists between sessions on same browser

---

## 🚀 Getting Started

### Prerequisites
```bash
cd /Users/vinvivek/Angular-Task/sipstop
npm install
```

### Run the Application

**Terminal 1 - Backend Server:**
```bash
node server.js
```

**Terminal 2 - Angular App:**
```bash
npm start
```

### Testing the Features

1. **Create Account** → Receive welcome email
2. **Login** → Access your dashboard
3. **Click Profile** → View/Edit your information
4. **Place Order** → Receive confirmation email

---

## 📝 File Changes Summary

### New Files Created
1. `email-service.js` - Email service with Nodemailer
2. `ENV_TEMPLATE.txt` - Environment variables template
3. `src/app/components/profile/profile.ts` - Profile component
4. `src/app/components/profile/profile.html` - Profile template
5. `src/app/components/profile/profile.css` - Profile styles
6. `src/app/components/profile/profile.spec.ts` - Profile tests

### Modified Files
1. `server.js` - Added email integration and PUT /api/users/:id endpoint
2. `package.json` - Added nodemailer and dotenv dependencies
3. `src/app/models/user.ts` - Extended User interface
4. `src/app/services/auth.ts` - Added profile update methods
5. `src/app/app.routes.ts` - Added profile route
6. `src/app/components/admin-dashboard/admin-dashboard.html` - Added profile button
7. `src/app/components/admin-dashboard/admin-dashboard.css` - Added profile button styles
8. `src/app/components/customer-products/customer-products.html` - Added profile button
9. `src/app/components/customer-products/customer-products.css` - Added profile button styles

---

## 🎨 Screenshots & UI

### Email Templates
- **Welcome Email**: Purple gradient header, personalized greeting, CTA button
- **Order Confirmation**: Order details table, shipping info, payment method

### Profile Page
- **Header**: Purple gradient with profile icon and "My Profile" title
- **Personal Info Section**: Name, email, phone, role
- **Address Section**: Full address fields
- **Edit Mode**: All editable fields become active
- **Actions**: Cancel and Save Changes buttons

---

## 🔧 Maintenance

### Updating Email Templates
Edit `email-service.js` and modify the HTML in:
- `sendWelcomeEmail()` function
- `sendOrderConfirmationEmail()` function

### Changing Email Provider
Update the transporter configuration in `email-service.js`

### Adding Profile Fields
1. Update User interface in `models/user.ts`
2. Add fields to profile HTML template
3. Include fields in the save logic
4. Update backend validation if needed

---

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify `.env` file configuration
3. Ensure backend server is running
4. Check network connectivity
5. Review the troubleshooting section

---

## 🎉 Congratulations!

Your SipStop application now has:
- ✅ Professional email notifications
- ✅ Complete user profile management
- ✅ Beautiful, responsive UI
- ✅ Secure backend implementation
- ✅ Comprehensive error handling

Happy coding! 🚀

