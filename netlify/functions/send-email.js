const { Resend } = require("resend");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { to, subject, html } = JSON.parse(event.body);

  try {
    const { data, error } = await resend.emails.send({
      from: "events@nickthelegend.tech",
      to,
      subject,
      html,
    });

    if (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
