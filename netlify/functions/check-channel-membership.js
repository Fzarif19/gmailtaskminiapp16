
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error" })
    };
  }

  try {
    const { chatId, userId } = JSON.parse(event.body || "{}");

    if (!chatId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing chatId or userId" })
      };
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Telegram verification failed" })
      };
    }

    const status = result.result.status;
    const isMember = ["creator", "administrator", "member"].includes(status)
      || (status === "restricted" && result.result.is_member === true);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isMember })
    };
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" })
    };
  }
};
