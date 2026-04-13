export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text;

  if (!chatId) return res.status(200).end();

  // ответ
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: "Санаторий на связи 🙂 Напиши, что у тебя происходит.",
    }),
  });

  return res.status(200).end();
}
