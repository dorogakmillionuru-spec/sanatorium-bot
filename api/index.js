export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  try {
    const body = req.body;

    const chatId = body.message?.chat?.id;
    const text = body.message?.text;

    if (!chatId) return res.status(200).end();

    let reply = "Санаторий на связи 🙂 Напиши, что у тебя происходит.";

    if (text) {
      const t = text.toLowerCase();

      if (t.includes("не получается")) {
        reply = "Где именно стоп? Опиши, разберём.";
      } else if (t.includes("нет денег")) {
        reply = "Окей. Давай честно — ты сейчас не зарабатываешь или не знаешь, как?";
      } else if (t.includes("команда")) {
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
  } catch (e) {
    console.log("ERROR:", e);
    return res.status(200).end();
  }
}
