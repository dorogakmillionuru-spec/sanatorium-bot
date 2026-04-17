export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(200).send("ok");
    }
  
    const event = req.body;
  
    if (event.event === "payment.succeeded") {
      const payment = event.object;
  
      const chatId = payment.metadata?.chatId;
  
      if (chatId) {
        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Оплата прошла ✅\nВот твой код: 12345",
          }),
        });
      }
    }
  
    res.status(200).send("ok");
  }
