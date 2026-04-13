const sessions = {};
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  try {
    const body = req.body;

    const chatId = body.message?.chat?.id;
    const text = body.message?.text;

    if (!chatId) return res.status(200).end();

    let reply = "";

    // первый контакт
    if (text === "/start") {
      reply = "Санаторий открыт 🙂 Сливай сюда всё, что происходит. Я разберу.";
    } 
    
    // логика диалога
    else if (text) {
      const t = text.toLowerCase();

      if (t.includes("нет денег")) {
        reply = "Окей. Давай честно — ты сейчас не зарабатываешь или не знаешь, как?";
      } 
      else if (t.includes("не получается")) {
        reply = "Где именно стоп? Люди? Контент? Или уже пробовала и не зашло?";
      } 
      else if (t.includes("никто не отвечает")) {
        reply = "Ты пишешь первым или ждёшь? Как сейчас вообще диалог начинаешь?";
      } 
      else if (t.includes("команда")) {
        reply = "Сколько человек сейчас в команде и сколько реально делают?";
      } 
      else {
        reply = "Ок. Раскрути чуть подробнее. Где именно затык?";
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
