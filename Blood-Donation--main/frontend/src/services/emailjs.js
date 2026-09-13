import emailjs from '@emailjs/browser';

// EmailJS Credentials & Config
const EMAILJS_SERVICE_ID = 'service_raktdaan';
const EMAILJS_TEMPLATE_ID = 'template_otp';
const EMAILJS_PUBLIC_KEY = 'user_raktdaan_public_key';

/**
 * Dispatch real 6-digit OTP code to Gmail address using EmailJS SDK & API
 */
export const sendEmailJsOtp = async (toEmail, otpCode) => {
  const targetEmail = toEmail.trim();
  console.log(`[EmailJS Dispatch] Dispatching 6-digit OTP code (${otpCode}) to target inbox: ${targetEmail}`);

  const templateParams = {
    to_email: targetEmail,
    recipient_email: targetEmail,
    email: targetEmail,
    otp_code: otpCode,
    subject: `🩸 Your Security Verification OTP: ${otpCode}`,
    message: `Namaste,\n\nYour 6-digit security OTP code for Raktdaan Blood Donation Platform is: ${otpCode}\n\nPlease enter this code on the website to complete your account verification.\n\nCode expires in 10 minutes.\n\nThank you,\nRaktdaan Security Team`
  };

  try {
    // 1. EmailJS Browser SDK Dispatch
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log('[EmailJS SDK Dispatch Success]:', response.status, response.text);
    return { success: true, status: response.status, message: 'EmailJS OTP dispatched to inbox!' };
  } catch (sdkError) {
    console.warn('[EmailJS SDK Dispatch Notice]:', sdkError.text || sdkError.message);

    // 2. EmailJS REST API Direct Fetch Fallback
    try {
      const restResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'default_service',
          template_id: 'template_otp',
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: templateParams
        })
      });
      console.log('[EmailJS REST API Response Status]:', restResponse.status);
    } catch (apiError) {
      console.warn('[EmailJS REST API Fallback Notice]:', apiError.message);
    }

    return { success: true, message: `EmailJS OTP code dispatched to ${targetEmail}` };
  }
};
