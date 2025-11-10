import { Resend } from "resend";

const RESEND_API_KEY = "re_dwWdAvt2_GwgbnBtFjNtB3X9cjjEsb2w5";
const resend = new Resend(RESEND_API_KEY);

export const sendEmail = async (
  to: string,
  subject: string,
  message: string,
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "EventStellar <onboarding@resend.dev>",
      to: [to],
      subject,
      html: `<p>${message}</p>`,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    console.log("📧 Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
};
