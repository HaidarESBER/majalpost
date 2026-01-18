import { Resend } from 'resend';
import { env } from '../config/env.js';

// Initialize Resend client lazily (only when API key is available)
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!env.RESEND_API_KEY) {
      throw new Error('Resend API key is not configured. Set RESEND_API_KEY environment variable.');
    }
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

// SMTP configuration (commented out - using Resend instead)
// import nodemailer from 'nodemailer';
// const transporter = nodemailer.createTransport({
//   host: env.SMTP_HOST,
//   port: env.SMTP_PORT,
//   secure: env.SMTP_PORT === 465, // true for 465, false for other ports
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASS,
//   },
//   connectionTimeout: 10000, // 10 seconds
//   greetingTimeout: 10000, // 10 seconds
//   socketTimeout: 10000, // 10 seconds
//   // Add TLS options for better compatibility
//   tls: {
//     rejectUnauthorized: false, // Allow self-signed certificates (for Railway compatibility)
//   },
// });

/**
 * Verify email configuration (Resend)
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    // Resend API key validation - if key is invalid, it will fail on first send
    // For now, just check if key exists
    if (!env.RESEND_API_KEY) {
      console.error('Resend API key not configured');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

/**
 * Send email helper function (using Resend)
 */
async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
  try {
    // Skip sending emails if Resend API key is not configured
    if (!env.RESEND_API_KEY) {
      console.log('Email not sent (Resend API key not configured):', { 
        to, 
        subject,
        hasApiKey: !!env.RESEND_API_KEY,
      });
      return;
    }

    console.log('Sending email via Resend...', { 
      to, 
      subject, 
      from: env.SMTP_FROM_EMAIL,
    });
    
    const resendClient = getResendClient();
    const { data, error } = await resendClient.emails.send({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log('Email sent successfully via Resend:', { 
      id: data?.id, 
      to, 
      subject 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Don't throw error to prevent breaking the main flow
    // Log it instead
  }
}

/**
 * Email template base HTML structure
 */
function getEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مجال بوست</title>
  <style>
    body {
      font-family: 'Arial', 'Tahoma', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #4a5568;
    }
    .header h1 {
      color: #2d3748;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #718096;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4a5568;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #2d3748;
    }
    .success {
      color: #2f855a;
    }
    .warning {
      color: #d69e2e;
    }
    .error {
      color: #c53030;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>مجال بوست</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>مع تحيات فريق مجال بوست</p>
      <p><a href="${env.FRONTEND_URL}">${env.FRONTEND_URL}</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
  const content = `
    <h2>مرحباً ${userName}!</h2>
    <p>نشكرك على انضمامك إلى مجتمع مجال بوست.</p>
    <p>نحن سعداء بأن تكون جزءاً من منصتنا الإعلامية المستقلة التي تركز على القضايا البيئية والاجتماعية والاقتصادية.</p>
    <p>يمكنك الآن:</p>
    <ul>
      <li>استكشاف مقالاتنا المتنوعة</li>
      <li>التفاعل مع المحتوى</li>
      <li>التقدم بطلب للمشاركة كمحرر إذا رغبت</li>
    </ul>
    <p>نتمنى لك تجربة ممتعة معنا!</p>
    <p style="text-align: center;">
      <a href="${env.FRONTEND_URL}" class="button">زيارة الموقع</a>
    </p>
  `;

  await sendEmail(
    userEmail,
    'مرحباً بك في مجال بوست',
    getEmailTemplate(content)
  );
}

/**
 * Send contributor application approval email
 */
export async function sendContributorApprovalEmail(
  userEmail: string,
  userName: string,
  reviewNotes?: string
): Promise<void> {
  const content = `
    <h2 class="success">تهانينا ${userName}!</h2>
    <p>نود إعلامك بأن طلبك للانضمام كمحرر في مجال بوست <strong>تم قبوله</strong>.</p>
    <p>يمكنك الآن البدء بكتابة ومشاركة مقالاتك مع مجتمعنا.</p>
    ${reviewNotes ? `<p><strong>ملاحظات من فريق المراجعة:</strong></p><p>${reviewNotes}</p>` : ''}
    <p style="text-align: center;">
      <a href="${env.FRONTEND_URL}/my-articles/new" class="button">ابدأ بكتابة مقال</a>
    </p>
  `;

  await sendEmail(
    userEmail,
    'تم قبول طلبك كمحرر في مجال بوست',
    getEmailTemplate(content)
  );
}

/**
 * Send contributor application rejection email
 */
export async function sendContributorRejectionEmail(
  userEmail: string,
  userName: string,
  reviewNotes?: string
): Promise<void> {
  const content = `
    <h2>عذراً ${userName}</h2>
    <p>نود إعلامك بأن طلبك للانضمام كمحرر في مجال بوست <strong>لم يتم قبوله</strong> في الوقت الحالي.</p>
    ${reviewNotes ? `<p><strong>ملاحظات من فريق المراجعة:</strong></p><p>${reviewNotes}</p>` : ''}
    <p>يمكنك المحاولة مرة أخرى في المستقبل أو التواصل معنا إذا كان لديك أي استفسارات.</p>
    <p style="text-align: center;">
      <a href="${env.FRONTEND_URL}/become-contributor" class="button">التقديم مرة أخرى</a>
    </p>
  `;

  await sendEmail(
    userEmail,
    'قرار بشأن طلبك كمحرر في مجال بوست',
    getEmailTemplate(content)
  );
}

/**
 * Send article pending review email
 */
export async function sendArticlePendingReviewEmail(
  userEmail: string,
  userName: string,
  articleTitle: string,
  articleSlug: string
): Promise<void> {
  const content = `
    <h2 class="warning">مقالك قيد المراجعة</h2>
    <p>مرحباً ${userName},</p>
    <p>تم إرسال مقالك "<strong>${articleTitle}</strong>" للمراجعة من قبل فريق التحرير.</p>
    <p>سنقوم بمراجعته في أقرب وقت ممكن وسنخبرك بنتيجة المراجعة.</p>
    <p>يمكنك متابعة حالة مقالك من خلال <a href="${env.FRONTEND_URL}/my-articles">صفحة مقالاتي</a>.</p>
    <p style="text-align: center;">
      <a href="${env.FRONTEND_URL}/my-articles" class="button">متابعة مقالاتي</a>
    </p>
  `;

  await sendEmail(
    userEmail,
    `مقالك "${articleTitle}" قيد المراجعة`,
    getEmailTemplate(content)
  );
}

/**
 * Send article approval email
 */
export async function sendArticleApprovalEmail(
  userEmail: string,
  userName: string,
  articleTitle: string,
  articleSlug: string
): Promise<void> {
  const content = `
    <h2 class="success">تهانينا ${userName}!</h2>
    <p>تم <strong>نشر مقالك</strong> "<strong>${articleTitle}</strong>" بنجاح على منصة مجال بوست.</p>
    <p>يمكنك الآن مشاركته مع مجتمعنا ومتابعة التفاعل معه.</p>
    <p style="text-align: center;">
      <a href="${env.FRONTEND_URL}/article/${articleSlug}" class="button">عرض المقال</a>
    </p>
  `;

  await sendEmail(
    userEmail,
    `تم نشر مقالك "${articleTitle}"`,
    getEmailTemplate(content)
  );
}

/**
 * Send article rejection/needs fixes email
 */
export async function sendArticleRejectionEmail(
  userEmail: string,
  userName: string,
  articleTitle: string,
  articleSlug: string,
  reviewNotes?: string
): Promise<void> {
  const content = `
    <h2 class="error">مقالك يحتاج إلى تعديلات</h2>
    <p>مرحباً ${userName},</p>
    <p>نود إعلامك بأن مقالك "<strong>${articleTitle}</strong>" يحتاج إلى بعض التعديلات قبل النشر.</p>
    ${reviewNotes ? `<p><strong>ملاحظات من فريق المراجعة:</strong></p><p>${reviewNotes}</p>` : ''}
    <p>يرجى مراجعة الملاحظات وإجراء التعديلات المطلوبة ثم إعادة إرسال المقال للمراجعة.</p>
    <p style="text-align: center;">
      <a href="${env.FRONTEND_URL}/my-articles" class="button">تعديل المقال</a>
    </p>
  `;

  await sendEmail(
    userEmail,
    `مقالك "${articleTitle}" يحتاج إلى تعديلات`,
    getEmailTemplate(content)
  );
}
