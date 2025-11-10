const { Resend } = require("resend");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { to, subject, html } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: "events@nickthelegend.tech",
      to,
      subject,
      html,
    });

    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
