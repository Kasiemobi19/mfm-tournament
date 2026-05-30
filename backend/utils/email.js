const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Sender address — must be a verified domain in Resend, OR use onboarding@resend.dev for testing
const FROM_ADDRESS = process.env.EMAIL_FROM || 'MFM Tournament <onboarding@resend.dev>';

// ─── PLAYER CONFIRMATION EMAIL ────────────────────────────────────────────────

async function sendConfirmationEmail({
    playerName,
    email,
    confirmationNumber,
    teamName,
    tournamentDate = 'Friday, July 11, 2026',
    tournamentTime = '1:00 PM'
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: email,
            subject: `✅ MFM Region 1 Tournament — Registration Confirmed (#${confirmationNumber})`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f4f4;">
                    <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; margin-top:20px;">
                        <div style="background:#1a5276; padding:24px; text-align:center;">
                            <h1 style="color:#fff; margin:0; font-size:22px;">⚽ MFM Region 1 Soccer Tournament</h1>
                            <p style="color:#aed6f1; margin:6px 0 0;">Player Registration Confirmed</p>
                        </div>
                        <div style="padding:30px;">
                            <h2 style="color:#1a5276;">Registration Successful! 🎉</h2>
                            <p>Dear <strong>${playerName}</strong>,</p>
                            <p>You're officially registered for the MFM Region 1 Soccer Tournament. See your details below.</p>

                            <div style="background:#eaf2ff; border-left:4px solid #1a5276; padding:16px; border-radius:4px; margin:20px 0;">
                                <p style="margin:4px 0;"><strong>Confirmation #:</strong> ${confirmationNumber}</p>
                                <p style="margin:4px 0;"><strong>Team:</strong> ${teamName}</p>
                                <p style="margin:4px 0;"><strong>Date:</strong> ${tournamentDate}</p>
                                <p style="margin:4px 0;"><strong>Kick-off:</strong> ${tournamentTime}</p>
                            </div>

                            <h3 style="color:#1a5276;">What's Next?</h3>
                            <ul>
                                <li>Attend team practices as scheduled by your captain</li>
                                <li>Arrive at the venue <strong>30 minutes</strong> before kick-off</li>
                                <li>Bring valid ID and your confirmation number on tournament day</li>
                            </ul>

                            <p>We look forward to seeing you on the pitch!</p>
                            <p><strong>— MFM Region 1 Tournament Committee</strong></p>
                        </div>
                        <div style="background:#f4f4f4; padding:16px; text-align:center; font-size:12px; color:#888;">
                            This is an automated confirmation. Please do not reply to this email.
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('Resend error (player):', error);
            throw new Error(error.message);
        }

        console.log('Player confirmation sent:', data.id);
        return { success: true, messageId: data.id };

    } catch (err) {
        console.error('sendConfirmationEmail failed:', err);
        throw err;
    }
}

// ─── VOLUNTEER CONFIRMATION EMAIL ─────────────────────────────────────────────

async function sendVolunteerRegistrationEmail({
    firstName,
    lastName,
    email,
    phone,
    branch,
    roles = [],
    confirmationNumber,
    tournamentDate = 'Friday, July 11, 2026',
    tournamentTime = '1:00 PM'
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: email,
            subject: `✅ MFM Region 1 Tournament — Volunteer Registration Confirmed (#${confirmationNumber})`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f4f4;">
                    <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; margin-top:20px;">
                        <div style="background:#1a5276; padding:24px; text-align:center;">
                            <h1 style="color:#fff; margin:0; font-size:22px;">⚽ MFM Region 1 Soccer Tournament</h1>
                            <p style="color:#aed6f1; margin:6px 0 0;">Volunteer Registration Confirmed</p>
                        </div>
                        <div style="padding:30px;">
                            <h2 style="color:#1a5276;">Thank You for Volunteering! 🙌</h2>
                            <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                            <p>Your volunteer registration has been received. Here are your details:</p>

                            <div style="background:#eaf2ff; border-left:4px solid #1a5276; padding:16px; border-radius:4px; margin:20px 0;">
                                <p style="margin:4px 0;"><strong>Confirmation #:</strong> ${confirmationNumber}</p>
                                <p style="margin:4px 0;"><strong>Branch:</strong> ${branch}</p>
                                <p style="margin:4px 0;"><strong>Role(s):</strong> ${roles.join(', ')}</p>
                                <p style="margin:4px 0;"><strong>Phone:</strong> ${phone}</p>
                                <p style="margin:4px 0;"><strong>Date:</strong> ${tournamentDate}</p>
                                <p style="margin:4px 0;"><strong>Time:</strong> ${tournamentTime}</p>
                            </div>

                            <p>Your assignment will be confirmed by the tournament coordinator closer to the date.</p>
                            <p><strong>— MFM Region 1 Tournament Committee</strong></p>
                        </div>
                        <div style="background:#f4f4f4; padding:16px; text-align:center; font-size:12px; color:#888;">
                            This is an automated confirmation. Please do not reply to this email.
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('Resend error (volunteer):', error);
            throw new Error(error.message);
        }

        console.log('Volunteer confirmation sent:', data.id);
        return { success: true, messageId: data.id };

    } catch (err) {
        console.error('sendVolunteerRegistrationEmail failed:', err);
        throw err;
    }
}

module.exports = {
    sendConfirmationEmail,
    sendVolunteerRegistrationEmail
};
