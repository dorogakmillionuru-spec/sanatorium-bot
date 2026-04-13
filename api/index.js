export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text;

  if (!chatId) return res.status(200).end();

  let reply = "Санаторий на связи 🙂 Напиши, что у тебя происходит.";

  if (text) {
    if (text.toLowerCase().includes("не получается")) {
      reply = "Где именно стоп? Опиши, разберём.";
    } else if (text.toLowerCase().includes("нет денег")) {
      reply = "Окей. Давай честно — ты сейчас не зарабатываешь или не знаешь, как?";
    } else if (text.toLowerCase().includes("команда")) {
      reply = "Команда не строится сама. Что ты сейчас делаешь для набора?";
    }
  }

  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply,
    }),
  });

  return res.status(200).end();
}
