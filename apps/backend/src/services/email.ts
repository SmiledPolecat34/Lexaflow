import { env } from '../config/env.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!env.BREVO_API_KEY) {
    console.warn('⚠️ Email service not configured (BREVO_API_KEY missing)');
    console.log('📧 Would send email to:', options.to);
    console.log('   Subject:', options.subject);
    return true; // Don't fail in development
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: env.EMAIL_FROM_NAME,
          email: env.EMAIL_FROM,
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email send failed:', error);
      return false;
    }

    console.log('✅ Email sent to:', options.to);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

// Email templates
export function getWelcomeEmailTemplate(firstName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Welcome to LexaFlow!</h1>
        </div>
        <div class="content">
          <p>Hello${firstName ? ` ${firstName}` : ''},</p>
          <p>Welcome to LexaFlow! We're excited to help you on your English learning journey.</p>
          <p>With LexaFlow, you can:</p>
          <ul>
            <li>📚 Take interactive exercises tailored to your level</li>
            <li>📖 Learn grammar and conjugation with AI-powered lessons</li>
            <li>🏆 Track your progress and earn badges</li>
            <li>🔥 Build streaks to stay motivated</li>
          </ul>
          <p>Ready to get started?</p>
          <a href="${env.FRONTEND_URL}/dashboard" class="button">Start Learning</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LexaFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPasswordResetTemplate(resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
          <p>You requested to reset your password.</p>
          <p>Click the button below to create a new password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LexaFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
