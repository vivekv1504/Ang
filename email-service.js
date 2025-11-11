const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email service error:', error);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

/**
 * Send welcome email to new users
 */
async function sendWelcomeEmail(userEmail, userName) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Welcome to SipStop! 🥤',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to SipStop!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${userName}! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining SipStop, your one-stop destination for premium beverages!
          </p>
          <p style="color: #666; line-height: 1.6;">
            We're excited to have you as part of our community. Start exploring our collection of refreshing drinks and enjoy exclusive offers!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:4200'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;">
              Start Shopping
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Cheers,<br/>
            <strong>The SipStop Team</strong>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${userEmail}:`, error);
    return false;
  }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(userEmail, userName, orderDetails) {
  const { orderNumber, items, total, shippingAddress, paymentMethod } = orderDetails;

  // Safely handle shipping address with defaults
  const address = shippingAddress || {};
  const street = address.street || 'N/A';
  const city = address.city || 'N/A';
  const state = address.state || '';
  const zipCode = address.zipCode || '';
  const country = address.country || 'N/A';

  // Build items HTML
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.product.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.product.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Order Confirmation - ${orderNumber} 📦`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for your order! We've received it and are getting it ready for delivery.
          </p>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Order Number</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">${orderNumber}</p>
          </div>

          <h3 style="color: #333; margin-top: 30px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 5px; overflow: hidden;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr style="background: #f0f0f0;">
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; color: #667eea; font-size: 18px;">$${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin: 30px 0;">
            <h3 style="color: #333;">Shipping Address</h3>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0; color: #666;">${street}</p>
              <p style="margin: 5px 0; color: #666;">${city}${state ? ', ' + state : ''} ${zipCode}</p>
              <p style="margin: 5px 0; color: #666;">${country}</p>
            </div>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #333;">Payment Method</h3>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <p style="margin: 0; color: #666;">${paymentMethod || 'N/A'}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:4200'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;">
              View Order Status
            </a>
          </div>

          <p style="color: #666; line-height: 1.6;">
            You'll receive a shipping confirmation email once your order is on its way.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br/>
            <strong>The SipStop Team</strong>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>If you have questions, please contact our support team.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${userEmail} for order ${orderNumber}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending order confirmation email to ${userEmail}:`, error);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail
};

