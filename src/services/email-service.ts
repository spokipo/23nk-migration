import { ContactFormSubmissions } from '@/entities';

/**
 * Email Service for sending notifications to site owner
 * This service handles sending email notifications when form submissions are received
 */
export class EmailService {
  private static readonly SITE_OWNER_EMAIL = 'info@upcyclecorsets.com';

  /**
   * Sends an email notification to the site owner when a new form submission is received
   * @param submission - The form submission data
   */
  static async sendSubmissionNotification(submission: ContactFormSubmissions): Promise<void> {
    try {
      // Format the email body with all submission details
      const emailBody = this.formatEmailBody(submission);

      // Call the backend API endpoint to send the email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.SITE_OWNER_EMAIL,
          subject: `New Contact Form Submission${submission.selectedCorset ? ` - ${submission.selectedCorset}` : ''}`,
          html: emailBody,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw - we don't want form submission to fail if email fails
    }
  }

  /**
   * Formats the submission data into an HTML email body
   */
  private static formatEmailBody(submission: ContactFormSubmissions): string {
    const formatValue = (value: string | undefined) => value || 'Not provided';

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #E9D8A6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #333; font-size: 24px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #C9B037; font-size: 14px; }
            .field-value { color: #333; font-size: 14px; margin-top: 5px; padding: 10px; background-color: #F5E6CA; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>

            <div class="field">
              <div class="field-label">Full Name</div>
              <div class="field-value">${formatValue(submission.fullName)}</div>
            </div>

            <div class="field">
              <div class="field-label">Country</div>
              <div class="field-value">${formatValue(submission.country)}</div>
            </div>

            <div class="field">
              <div class="field-label">Preferred Contact Method</div>
              <div class="field-value">${formatValue(submission.preferredContactMethod)}</div>
            </div>

            <div class="field">
              <div class="field-label">Contact Details</div>
              <div class="field-value">${formatValue(submission.contactDetails)}</div>
            </div>

            ${submission.selectedCorset ? `
            <div class="field">
              <div class="field-label">Selected Corset</div>
              <div class="field-value">${formatValue(submission.selectedCorset)}</div>
            </div>
            ` : ''}

            <div class="field">
              <div class="field-label">Message</div>
              <div class="field-value">${formatValue(submission.message)?.replace(/\n/g, '<br>')}</div>
            </div>

            <div class="footer">
              <p>Submission ID: ${submission._id}</p>
              <p>Submitted on: ${submission._createdDate ? new Date(submission._createdDate).toLocaleString() : 'Unknown'}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
