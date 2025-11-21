/**
 * Test Email Configuration Script
 * Run this to test if your email setup is working
 * 
 * Usage: node test-email.js your-test-email@gmail.com
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Get test email from command line argument
const testEmail = process.argv[2];

if (!testEmail) {
  console.log('❌ Please provide a test email address');
  console.log('Usage: node test-email.js your-email@gmail.com');
  process.exit(1);
}

console.log('🔍 Testing Email Configuration...\n');

// Step 1: Check environment variables
console.log('Step 1: Checking .env configuration...');
if (!process.env.EMAIL_USER) {
  console.log('❌ EMAIL_USER not found in .env file');
  console.log('   Please configure EMAIL_USER in .env file');
  process.exit(1);
}
if (!process.env.EMAIL_PASSWORD) {
  console.log('❌ EMAIL_PASSWORD not found in .env file');
  console.log('   Please configure EMAIL_PASSWORD in .env file');
  process.exit(1);
}

console.log('✅ EMAIL_USER:', process.env.EMAIL_USER);
console.log('✅ EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured*** (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'NOT SET');
console.log('✅ APP_URL:', process.env.APP_URL || 'http://localhost:4200');
console.log();

// Step 2: Create transporter
console.log('Step 2: Creating email transporter...');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
console.log('✅ Transporter created');
console.log();

// Step 3: Verify connection
console.log('Step 3: Verifying connection to Gmail...');
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Connection failed!');
    console.log('   Error:', error.message);
    console.log();
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure 2-Step Verification is enabled on your Gmail');
    console.log('   2. Generate an App Password (not your regular Gmail password)');
    console.log('   3. Go to: https://myaccount.google.com/apppasswords');
    console.log('   4. Update EMAIL_PASSWORD in .env with the App Password');
    console.log('   5. Remove any spaces from the App Password');
    process.exit(1);
  } else {
    console.log('✅ Connection successful! Gmail is ready to send emails');
    console.log();
    
    // Step 4: Send test email
    console.log('Step 4: Sending test email to', testEmail, '...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: '🎉 SipStop Email Test - Success!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Email Test Successful!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Great News!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your SipStop email configuration is working correctly! 🎉
            </p>
            <p style="color: #666; line-height: 1.6;">
              This test email was sent from: <strong>${process.env.EMAIL_USER}</strong>
            </p>
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Configuration Details:</h3>
              <p style="margin: 5px 0; color: #666;">✅ Email Service: Gmail</p>
              <p style="margin: 5px 0; color: #666;">✅ Sender: ${process.env.EMAIL_USER}</p>
              <p style="margin: 5px 0; color: #666;">✅ Test Date: ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #666; line-height: 1.6;">
              Your email notifications are now ready to use!
            </p>
            <ul style="color: #666; line-height: 1.8;">
              <li>Welcome emails will be sent when users sign up</li>
              <li>Order confirmations will be sent when orders are placed</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:4200" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;">
                Go to SipStop
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>This is a test email from SipStop Application</p>
          </div>
        </div>
      `
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('❌ Failed to send test email!');
        console.log('   Error:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log();
        console.log('🎉 SUCCESS! Check your inbox at:', testEmail);
        console.log('   (Check spam folder if you don\'t see it)');
        console.log();
        console.log('Your email notifications are working! 🚀');
        process.exit(0);
      }
    });
  }
});



