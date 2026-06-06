import nodemailer from 'nodemailer';

// Create a Nodemailer transporter.
// If environment variables are missing, it will output email notifications to the console.
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: { user, pass },
    });
  }
  return null; // Fallback to console logging
};

// Send email helper
export const sendConfirmationEmail = async (appointment, customMessage = '') => {
  const transporter = getTransporter();
  const customerEmail = appointment.customer?.email;
  const customerName = appointment.customer?.name;
  const serviceName = appointment.service?.name;
  const price = appointment.service?.price;
  const duration = appointment.service?.duration;
  const date = appointment.date;
  const time = appointment.timeSlot;

  if (!customerEmail) {
    console.log('Skipping email send: customer email missing.');
    return;
  }

  const subject = `LuxeCut & Spa: Appointment Update (${serviceName})`;
  
  const textContent = `
    Hello ${customerName},

    ${customMessage || `Thank you for booking with LuxeCut & Spa! Your appointment is registered.`}

    Booking Details:
    - Service: ${serviceName}
    - Date: ${date}
    - Time Slot: ${time}
    - Duration: ${duration} mins
    - Price: ₹${price}
    - Status: ${appointment.status}

    If you need to reschedule or cancel, please log in to your profile on our website.
    
    Best regards,
    The LuxeCut Team
  `;

  const htmlContent = `
    <div style="font-family: 'DM Sans', sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #D4AF37;">
      <h2 style="color: #D4AF37; text-align: center; font-family: 'Playfair Display', serif; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">LuxeCut & Spa</h2>
      <p>Hello <strong>${customerName}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.5;">
        ${customMessage || `Thank you for booking with LuxeCut & Spa! Your appointment details are shown below.`}
      </p>
      
      <div style="background-color: #1a1a1a; padding: 20px; border-radius: 6px; border-left: 4px solid #D4AF37; margin: 20px 0;">
        <h3 style="color: #D4AF37; margin-top: 0;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse; color: #e0e0e0;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Service:</td>
            <td style="padding: 6px 0;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Date:</td>
            <td style="padding: 6px 0;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Time Slot:</td>
            <td style="padding: 6px 0;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Duration:</td>
            <td style="padding: 6px 0;">${duration} minutes</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Price:</td>
            <td style="padding: 6px 0; color: #D4AF37; font-weight: bold;">₹${price}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Status:</td>
            <td style="padding: 6px 0;">
              <span style="background-color: #D4AF37; color: #000000; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                ${appointment.status}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 14px; color: #a0a0a0; text-align: center; margin-top: 30px;">
        To manage your booking, cancel, or reschedule, log in to your account.
      </p>
      <div style="text-align: center; margin-top: 20px;">
        <span style="font-size: 12px; color: #666;">This is an automated message from LuxeCut & Spa.</span>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"LuxeCut & Spa" <no-reply@luxecut.com>',
        to: customerEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✉️ Email notification successfully sent to ${customerEmail}`);
    } catch (error) {
      console.error(`❌ Error sending real email to ${customerEmail}:`, error.message);
    }
  } else {
    // Elegant dev logging console fallback
    console.log('\n======================================================');
    console.log(`✉️  DEV EMAIL EMULATION TO: ${customerEmail}`);
    console.log(`👉  SUBJECT: ${subject}`);
    console.log(`👉  MESSAGE: ${customMessage || 'Booking Confirmation'}`);
    console.log(`👉  DETAILS: ${serviceName} on ${date} at ${time} (₹${price}, status: ${appointment.status})`);
    console.log('======================================================\n');
  }
};

// Send reminder (e.g. 1 hour before reminder)
export const sendReminderEmail = async (appointment) => {
  await sendConfirmationEmail(
    appointment,
    `⚠️ REMINDER: Your appointment with LuxeCut & Spa is scheduled in 1 hour. We look forward to seeing you!`
  );
};
