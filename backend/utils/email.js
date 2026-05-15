const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendEmail(emailData) {
    try {
        let htmlContent;
        let subject;
        
        // Check if this is a volunteer email or player email
        if (emailData.volunteerName) {
            // VOLUNTEER EMAIL
            subject = emailData.subject || '✅ MFM Tournament - Volunteer Registration Confirmed';
            htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #1a472a; color: white; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; }
                        .confirmation-box { background: white; border-left: 4px solid #2ecc71; padding: 20px; margin: 20px 0; }
                        .info-row { margin: 10px 0; }
                        .label { font-weight: bold; color: #1a472a; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚽ MFM Region 1 Soccer Tournament</h1>
                            <p>Volunteer Registration Confirmed</p>
                        </div>
                        <div class="content">
                            <h2>Thank You for Volunteering!</h2>
                            <p>Dear ${emailData.volunteerName},</p>
                            <p>Your volunteer registration has been confirmed. We're grateful for your service!</p>
                            
                            <div class="confirmation-box">
                                <div class="info-row">
                                    <span class="label">Confirmation Number:</span> ${emailData.confirmationNumber}
                                </div>
                                <div class="info-row">
                                    <span class="label">Branch:</span> ${emailData.branch}
                                </div>
                                <div class="info-row">
                                    <span class="label">Roles:</span> ${emailData.roles}
                                </div>
                                <div class="info-row">
                                    <span class="label">Tournament Date:</span> ${emailData.tournamentDate}
                                </div>
                                <div class="info-row">
                                    <span class="label">Time:</span> ${emailData.tournamentTime}
                                </div>
                            </div>
                            
                            <h3>Your Availability:</h3>
                            <ul>
                                <li>Setup (day before): <strong>${emailData.availableSetup}</strong></li>
                                <li>Tournament day: <strong>${emailData.availableTournament}</strong></li>
                                <li>Cleanup (after): <strong>${emailData.availableCleanup}</strong></li>
                            </ul>
                            
                            <p>You will receive more details about volunteer assignments closer to the tournament date.</p>
                            
                            <p>Thank you for your commitment to serving!</p>
                            
                            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                                If you have any questions, please contact the tournament coordinator.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        } else {
            // PLAYER EMAIL
            subject = emailData.subject || '⚽ MFM Tournament - Player Registration Confirmed';
            htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #1a472a; color: white; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; }
                        .confirmation-box { background: white; border-left: 4px solid #2ecc71; padding: 20px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚽ MFM Region 1 Soccer Tournament</h1>
                            <p>Player Registration Confirmed</p>
                        </div>
                        <div class="content">
                            <h2>Registration Successful!</h2>
                            <p>Dear ${emailData.playerName},</p>
                            <p>Your registration has been confirmed.</p>
                            
                            <div class="confirmation-box">
                                <strong>Confirmation Number:</strong> ${emailData.confirmationNumber}<br>
                                <strong>Team:</strong> ${emailData.teamName}<br>
                                <strong>Tournament Date:</strong> ${emailData.tournamentDate}<br>
                                <strong>Time:</strong> ${emailData.tournamentTime}
                            </div>
                            
                            <p>We look forward to seeing you at the tournament!</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        }
        
        const info = await transporter.sendMail({
            from: `"MFM Tournament" <${process.env.EMAIL_USER}>`,
            to: emailData.to,
            subject: subject,
            html: htmlContent
        });
        
        console.log('📧 Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
}

module.exports = sendEmail;
