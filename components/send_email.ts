// supabase/functions/send-location-change-email/index.js
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  'https://velagnrotxuqhiczsczz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw'
);

const RESEND_API_KEY = 're_aQYSkDpD_9unpLPe4xdbqzSiktiDwHYHM';
const RESEND_API_URL = 'https://api.resend.com/emails';

async function sendEmail(to, subject, text) {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'eshwar4202@gmail.com', // Using your requested email
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${await response.text()}`);
  }

  return response.json();
}

// Export as a handler function (for typical Node.js server use)
exports.handler = async (req, res) => {
  try {
    // Parse the incoming request body
    const { email, newLocation, oldLocation } = req.body;

    // Validate input
    if (!email || !newLocation || !oldLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format the email content
    const emailSubject = 'New Login Location Detected';
    const emailBody = `
      Dear User,

      We noticed a login from a new location:
      
      New Location:
      Latitude: ${newLocation.latitude}
      Longitude: ${newLocation.longitude}
      Time: ${newLocation.timestamp || 'Unknown'}

      Previous Location:
      Latitude: ${oldLocation.latitude}
      Longitude: ${oldLocation.longitude}
      Time: ${oldLocation.timestamp || 'Unknown'}

      If this wasn't you, please secure your account immediately by:
      1. Changing your password
      2. Contacting our support team at support@yourdomain.com

      Regards,
      Your App Team
    `;

    // Send the email using Resend
    await sendEmail(email, emailSubject, emailBody);

    // Optionally log this event in Supabase
    const { error: logError } = await supabaseAdmin
      .from('location_change_logs')
      .insert({
        user_email: email,
        new_location: newLocation,
        old_location: oldLocation,
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Failed to log location change:', logError);
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error in email function:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
};
