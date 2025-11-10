const EMAIL_API_URL = "https://email-send-omega.vercel.app";

export const sendEmail = async (
  to: string,
  subject: string,
  message: string,
) => {
  try {
    const response = await fetch(`${EMAIL_API_URL}/api/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html: `<p>${message}</p>`,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Email API error:", result.error);
      return { success: false, error: result.error };
    }

    console.log("📧 Email sent successfully:", result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
};
