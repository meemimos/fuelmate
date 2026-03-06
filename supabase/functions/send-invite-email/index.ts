import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

interface RequestBody {
  email: string;
  inviteLink: string;
  groupName: string;
  invitedBy?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { email, inviteLink, groupName, invitedBy } = (await req.json()) as RequestBody;

    // Validate inputs
    if (!email || !inviteLink || !groupName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // For development, just return success if SMTP credentials aren't configured
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASSWORD');
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'noreply@fuelmate.app';

    if (!smtpHost || !smtpUser || !smtpPass) {
      // Log the invite for now (development mode)
      console.log(
        `[DEV MODE] Invitation email would be sent to: ${email}`,
        `Link: ${inviteLink}`
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email queued (dev mode)',
          link: inviteLink,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send real email
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: smtpHost,
      port: parseInt(smtpPort || '587'),
      username: smtpUser,
      password: smtpPass,
    });

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 30px; }
    .button { 
      background-color: #00e5a0; 
      color: #000;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      display: inline-block;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer { 
      margin-top: 40px; 
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're invited to ${groupName}!</h1>
      <p>${invitedBy || 'Someone'} invited you to join their group on FuelMate.</p>
    </div>
    
    <p>FuelMate helps groups coordinate fuel locks and track savings together.</p>
    
    <a href="${inviteLink}" class="button">Accept Invitation</a>
    
    <p>Or copy this link:</p>
    <p style="word-break: break-all;"><code>${inviteLink}</code></p>
    
    <div class="footer">
      <p>This invitation expires in 7 days.</p>
      <p><a href="https://fuelmate.app">Learn more about FuelMate</a></p>
    </div>
  </div>
</body>
</html>
    `;

    await client.send({
      from: senderEmail,
      to: email,
      subject: `Join ${groupName} on FuelMate`,
      html: emailBody,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
