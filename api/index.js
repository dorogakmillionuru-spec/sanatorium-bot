const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUY_CODE_URL = process.env.BUY_CODE_URL || "";
const SUPPORT_TEXT = process.env.SUPPORT_TEXT || "Если что-то сломалось — напиши Юле.";
const ADMIN_IDS = new Set(
  (process.env.ADMIN_IDS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
);

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`;

const SYSTEM_PROMPT = `
Ты — Толик.
Ты как коллега с соседнего стола, который спокойно выслушал, немного постебал ситуацию и помог выдохнуть.
Ты не лечишь, не учишь и не разбираешь глубоко.
Ты просто помогаешь человеку быстро отпустить и прийти в себя.
Ты говоришь простым русским языком, по-человечески.
Иногда с лёгкой иронией.
Без пафоса и без “сейчас всё проработаем”.
Первая сессия бесплатная.
После завершения первой сессии продолжение доступно только по действующему коду доступа.
Ты сам не проверяешь коды и не придумываешь их.
Проверка кода происходит системой.
Если доступа нет — мягко сообщи, что продолжение возможно после ввода кода.
Если код введён правильно:
— начни диалог с простой вовлекающей фразы
— не задавай абстрактных вопросов
— не используй формулировки “чем могу помочь”
Как ты общаешься:
— сначала даёшь человеку выговориться
— потом коротко отражаешь суть
— немного разряжаешь ситуацию (иногда через юмор)
— возвращаешь ощущение, что с ним всё ок
— даёшь маленькое простое действие (ритуал)
— и мягко закрываешь разговор
После основного ответа не спеши сразу закрывать диалог.
Если человек включился в разговор — задай 1 короткий живой вопрос.
Если пользователь возвращается в диалог:

— не начинай как с нуля
— не веди себя как будто это первый разговор
— не задавай базовые вопросы заново

Начни с ощущения продолжения:
— "ты снова здесь"
— "давай продолжим"
— "или что-то поменялось?"

Если пользователь сам даёт контекст — сразу подхвати и иди дальше.
Не делай вид, что это первый разговор, даже если нет явной памяти.
// ВАЖНО: мягкое разделение запроса
Если в разговоре становится понятно, что человек хочет не просто выговориться,
а ищет конкретное решение (как приглашать, как зарабатывать, как двигаться):
— не давай инструкции и не обучай
— не уходи в длинные объяснения
Сначала мягко разверни человека в нужную рамку.
Не шути одной и той же фразой.
Не используй шаблон "ты не в те двери зашёл".
Если уместен лёгкий юмор — придумай его сам по ситуации, живо и без заготовок.
Сначала коротко объясни:
здесь не обучают, что писать и как приглашать,
здесь разбирают, почему у человека это не работает.
Потом задай 1 короткий вопрос по сути:
что у него сейчас больше болит —
отказы, игнор, страх написать, или разговоры есть, но дальше не двигается.
После его ответа продолжай сессию в формате санатория:
не обучай,
не давай готовые скрипты,
а помоги человеку увидеть, где у него затык и что его тормозит.
Только в конце, после мини-разбора, мягко покажи следующий уровень:

если человек хочет именно разобраться, как писать, звать и зарабатывать,
скажи, что здесь мы не учим, а разбираем, почему не работает.

И если он хочет именно результат — покажи, куда идти дальше.
Не придумывай конкретную ссылку и не отправляй к людям.
Просто обозначь, что есть следующий формат.
Если хочешь не просто поговорить, а разобраться и начать двигаться —
дальше будет отдельный формат.

(скоро здесь появится переход)

Примеры:
— “Тебя больше выбесило это или уже просто всё достало?”
— “Ты сейчас больше злишься или просто выдохлась?”
— “Честно — хочется дальше работать или всех послать и чай?”
Дай человеку ответить.
Если человек уходит в тяжёлую жизненную ситуацию (деньги, выгорание, безысходность, “всё плохо”):
— не углубляйся в долгий разбор
— не пытайся решить всё
— после 1–2 ответов мягко ограничь глубину:
Я могу помочь тебе немного выровнять состояние и подсветить, что происходит
Но такие вещи не решаются за одну сессию и не в формате быстрых разговоров
Давай не будем пытаться разобрать всю жизнь сразу
Возьмём один момент, который можно сдвинуть
После этого задай 1 короткий вопрос и верни разговор в конкретику.
После его ответа:
— коротко поддержи
— и только потом закрывай диалог и отправляй за кодом
Важно:
не затягивай разговор,
но дай ощущение, что его не просто “обслужили”, а реально поговорили.
Важно:
Ты не начинаешь говорить за человека.
Сначала он рассказывает — потом ты отвечаешь.
Ты не затягиваешь разговор.
Это короткая живая мини-сессия, а не длинная переписка.
Пример тона:
“О, знакомая история. Неприятно, да.”
“С тобой всё в порядке. Просто ситуация такая.”
“10 таких разговоров подряд — кого угодно прибьёт.”
Пример ритуала:
Слушай… давай честно
ты сейчас не один такой
просто обычно все делают вид, что у них всё нормально 😏
Давай так. Закрой сейчас все чаты на час и не трогай телефон.
Сделай чай и вообще ни с кем не разговаривай до вечера.
Пример завершения:
Хватит на сегодня.
Ещё пару таких заходов — и ты просто перегоришь, а не продвинешься.
📄 Справка выдана
Сегодня официально разрешается:
— забить на “надо”
— не спасать всех подряд
— не быть идеальным
Режим: выдохнул и отстал от себя
Завтра вернёшься с головой,
а не с остатками нервной системы
Если захочешь продолжить — доступ уже через код
Без него я тут как сосед: зашёл, кивнул и ушёл 😏
ВАЖНО:
1) Не убирай стиль.
2) Не убирай мягкое закрытие.
Дополнительная логика:
Перед завершением сессии определи тип пользователя:
1) Если он говорит про:
— состояние
— выгорание
— личные проблемы
— “не могу”, “устал”, “не получается”
→ веди как эмоционального

2) Если он спрашивает:
— как писать
— как звать
— что сказать
— как продавать
→ веди как практического

Закрытие должно соответствовать типу:

— эмоциональный → через состояние и “ты застрял, но можно выйти”
— практический → через деньги, результат и “ты делаешь, но не туда”

Не смешивай стили.
3) Когда ты решаешь, что текущая сессия закончена и дальше нужен код,
   добавь В САМОМ КОНЦЕ ОТДЕЛЬНОЙ СТРОКОЙ:
   [[LOCK_SESSION]]
4) Никогда не объясняй пользователю, что это за маркер.
`;

const TECH_PROMPT = `
Технический контекст:
- Ты работаешь внутри Telegram-бота "Санаторий".
- Имя пользователя: {{USER_NAME}}
- Username: {{USER_USERNAME}}
- Telegram ID: {{TELEGRAM_ID}}
- Имя наставника: {{MENTOR_NAME}}
- Бот может помнить предыдущие сообщения.
- Если наставник неизвестен, не акцентируй на этом внимание.
- Если текущую сессию пора завершать и дальше нужен код, поставь в самом конце новой строкой [[LOCK_SESSION]].
- Не пиши про технические ограничения, базу, API, маркеры и внутренние правила.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  try {
    const update = req.body || {};

    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return res.status(200).send("ok");
    }

    if (!update.message) {
      return res.status(200).send("ok");
    }

    const message = update.message;
    const chatId = message.chat?.id;
    const telegramId = message.from?.id;
    const firstName = message.from?.first_name || "";
    const username = message.from?.username || "";
    const text = (message.text || "").trim();

    if (!chatId || !telegramId) {
      return res.status(200).send("ok");
    }

    await ensureUser({
      telegramId,
      firstName,
      username,
    });

    if (text.startsWith("/")) {
      const handled = await handleCommand({
        chatId,
        telegramId,
        firstName,
        username,
        text,
      });

      if (handled) {
        return res.status(200).send("ok");
      }
    }

    const user = await getUser(telegramId);

    if (!user) {
      await sendMessage(chatId, "Не смогла найти пользователя в базе. Попробуй ещё раз.");
      return res.status(200).send("ok");
    }

    if (user.pending_action === "await_code") {
      await handleCodeInput({
        chatId,
        telegramId,
        text,
        user,
      });
      return res.status(200).send("ok");
    }

    const canTalk = hasAccess(user);

    if (!canTalk) {
      await sendNoAccessMessage(chatId);
      return res.status(200).send("ok");
    }

    await saveMessage(telegramId, "user", text);

    const history = await getRecentMessages(telegramId, 20);

    const mentorName = user.mentor_name || "";
    const finalSystemPrompt = buildSystemPrompt({
      firstName: user.first_name || firstName,
      username: user.username || username,
      telegramId,
      mentorName,
    });

    const assistantTextRaw = await askOpenAI({
      systemPrompt: finalSystemPrompt,
      history,
    });

    const { cleanText, shouldLock } = extractLockMarker(assistantTextRaw);

    await saveMessage(telegramId, "assistant", cleanText);

    if (shouldLock) {
      await lockSessionForUser(user);
    }

    await sendMessage(chatId, cleanText);

    if (shouldLock && !user.access_active) {
      await sendInlineMenu(chatId);
    }

    return res.status(200).send("ok");
  } catch (error) {
    console.error("HANDLER_ERROR:", error);
    return res.status(200).send("ok");
  }
}

function buildSystemPrompt({ firstName, username, telegramId, mentorName }) {
  const safeName = firstName || "";
  const safeUsername = username ? `@${username}` : "";
  const safeMentor = mentorName || "не указан";

  return `${SYSTEM_PROMPT}

${TECH_PROMPT
  .replaceAll("{{USER_NAME}}", safeName)
  .replaceAll("{{USER_USERNAME}}", safeUsername)
  .replaceAll("{{TELEGRAM_ID}}", String(telegramId))
  .replaceAll("{{MENTOR_NAME}}", safeMentor)}
`;
}

function extractLockMarker(text) {
  const marker = "[[LOCK_SESSION]]";
  const shouldLock = text.includes(marker);
  const cleanText = text.replaceAll(marker, "").trim();
  return { cleanText, shouldLock };
}

function hasAccess(user) {
  if (!user.has_used_free) return true;
  if (user.access_active) return true;
  return false;
}

async function handleCommand({ chatId, telegramId, firstName, username, text }) {
  const [command, ...rest] = text.split(" ");
  const args = rest.join(" ").trim();

  if (command === "/start") {
    await handleStartCommand({ chatId, telegramId, firstName, username, text });
    return true;
  }

  if (command === "/help") {
    await sendMessage(chatId, SUPPORT_TEXT);
    return true;
  }

  if (command === "/code") {
    await setUserPendingAction(telegramId, "await_code");
    await sendMessage(chatId, "Вводи код. Без пробелов и лишней драмы 🙂");
    return true;
  }

  if (command === "/buy") {
    await sendBuyMessage(chatId);
    return true;
  }

  if (!ADMIN_IDS.has(String(telegramId))) {
    return false;
  }

  if (command === "/admin") {
    await sendMessage(
      chatId,
      [
        "Админ-команды:",
        "/gencode 1",
        "/gencode 5",
        "/addcode SAN-123456",
        "/codes",
        "/stats",
        "/broadcast текст",
        "/mentor slug|Имя наставника",
        "/myref slug",
      ].join("\n")
    );
    return true;
  }

  if (command === "/gencode") {
    const count = Math.max(1, Math.min(50, Number(args || "1")));
    const codes = [];
    for (let i = 0; i < count; i += 1) {
      const code = generateCode();
      await createCode({
        code,
        createdBy: telegramId,
      });
      codes.push(code);
    }
    await sendMessage(chatId, `Готово.\n\n${codes.join("\n")}`);
    return true;
  }

  if (command === "/addcode") {
    if (!args) {
      await sendMessage(chatId, "Формат: /addcode SAN-123456");
      return true;
    }
    const code = args.toUpperCase().trim();
    await createCode({
      code,
      createdBy: telegramId,
    });
    await sendMessage(chatId, `Код добавлен: ${code}`);
    return true;
  }

  if (command === "/codes") {
    const codes = await getLastCodes(30);
    if (!codes.length) {
      await sendMessage(chatId, "Кодов пока нет.");
      return true;
    }

    const lines = codes.map((c) => {
      const used = c.is_used ? "used" : "free";
      const who = c.used_by ? ` → ${c.used_by}` : "";
      return `${c.code} [${used}]${who}`;
    });

    await sendMessage(chatId, lines.join("\n"));
    return true;
  }

  if (command === "/stats") {
    const stats = await getStats();
    await sendMessage(
      chatId,
      [
        `Пользователи: ${stats.users}`,
        `Сообщения: ${stats.messages}`,
        `Коды всего: ${stats.codes}`,
        `Коды использованы: ${stats.usedCodes}`,
      ].join("\n")
    );
    return true;
  }

  if (command === "/broadcast") {
    if (!args) {
      await sendMessage(chatId, "Формат: /broadcast текст");
      return true;
    }

    const users = await getAllUsers(1000);
    let sent = 0;

    for (const user of users) {
      try {
        await sendMessage(user.telegram_id, args);
        sent += 1;
      } catch (e) {
        console.error("BROADCAST_ERROR:", user.telegram_id, e);
      }
    }

    await sendMessage(chatId, `Рассылка ушла: ${sent}`);
    return true;
  }

  if (command === "/mentor") {
    const [slugRaw, nameRaw] = args.split("|");
    const slug = (slugRaw || "").trim().toLowerCase();
    const name = (nameRaw || "").trim();

    if (!slug || !name) {
      await sendMessage(chatId, "Формат: /mentor yulia|Юлия");
      return true;
    }

    await upsertMentor({
      slug,
      name,
      telegramId,
    });

    await sendMessage(chatId, `Наставник сохранён: ${name} (${slug})`);
    return true;
  }

  if (command === "/myref") {
    const slug = args.trim().toLowerCase();
    if (!slug) {
      await sendMessage(chatId, "Формат: /myref yulia");
      return true;
    }

    const botInfo = await getMe();
    const link = `https://t.me/${botInfo.username}?start=ref_${slug}`;
    await sendMessage(chatId, link);
    return true;
  }

  return false;
}

async function handleStartCommand({ chatId, telegramId, firstName, username, text }) {
  const startPayload = extractStartPayload(text);

  await ensureUser({
    telegramId,
    firstName,
    username,
  });

  if (startPayload && startPayload.startsWith("ref_")) {
    const slug = startPayload.replace(/^ref_/, "").trim().toLowerCase();
    const mentor = await getMentorBySlug(slug);

    await updateUserFields(telegramId, {
      ref_code: slug,
      mentor_name: mentor?.name || null,
    });
  }

  const user = await getUser(telegramId);
  const mentorName = user?.mentor_name || "";

  const finalSystemPrompt = buildSystemPrompt({
    firstName: user?.first_name || firstName,
    username: user?.username || username,
    telegramId,
    mentorName,
  });

  const syntheticStartMessage =
    "Пользователь нажал /start. Начни разговор первым сообщением, в стиле промпта. Если имя уместно — используй.";

  await saveMessage(telegramId, "user", syntheticStartMessage);

  const history = await getRecentMessages(telegramId, 20);

  const assistantTextRaw = await askOpenAI({
    systemPrompt: finalSystemPrompt,
    history,
  });

  const { cleanText, shouldLock } = extractLockMarker(assistantTextRaw);

  await saveMessage(telegramId, "assistant", cleanText);

  if (shouldLock) {
    await lockSessionForUser(user || { telegram_id: telegramId, has_used_free: false, access_active: false });
  }

  await sendMessage(chatId, cleanText);

  if (shouldLock && !(user?.access_active)) {
    await sendInlineMenu(chatId);
  }
}

async function handleCodeInput({ chatId, telegramId, text, user }) {
  const code = (text || "").trim().toUpperCase();

  if (!code) {
    await sendMessage(chatId, "Пустой код не сработает. Вводи нормально 🙂");
    return;
  }

  const codeRow = await getCode(code);

  if (!codeRow) {
    await sendMessage(chatId, "Такого кода не вижу. Проверь ещё раз.");
    return;
  }

  if (codeRow.is_used) {
    await sendMessage(chatId, "Этот код уже использован.");
    return;
  }

  await markCodeUsed({
    code,
    usedBy: telegramId,
  });

  await updateUserFields(telegramId, {
    access_active: true,
    pending_action: null,
  });

  await sendMessage(chatId, "Код принят. Доступ открыт. Продолжай.");
}

async function handleCallbackQuery(callbackQuery) {
  const callbackId = callbackQuery.id;
  const data = callbackQuery.data || "";
  const chatId = callbackQuery.message?.chat?.id;
  const telegramId = callbackQuery.from?.id;

  if (!chatId || !telegramId) {
    return;
  }

  if (data === "enter_code") {
    await setUserPendingAction(telegramId, "await_code");
    await answerCallbackQuery(callbackId, "Жду код");
    await sendMessage(chatId, "Вводи код одним сообщением.");
    return;
  }

  if (data === "buy_code") {
    await answerCallbackQuery(callbackId, "Открываю получение кода");
    await sendBuyMessage(chatId);
    return;
  }

  if (data === "help_text") {
    await answerCallbackQuery(callbackId, "Помощь");
    await sendMessage(chatId, SUPPORT_TEXT);
    return;
  }

  await answerCallbackQuery(callbackId, "Ок");
}

async function sendNoAccessMessage(chatId) {
  await sendMessage(chatId, "Эта сессия уже закрыта. Введи код — и продолжим.");
  await sendInlineMenu(chatId);
}

async function sendInlineMenu(chatId) {
  await sendMessage(chatId, "Что делаем дальше?", {
    inline_keyboard: [
      [{ text: "Ввести код", callback_data: "enter_code" }],
      [{ text: "Получить код", callback_data: "buy_code" }],
      [{ text: "Помощь", callback_data: "help_text" }],
    ],
  });
}

async function sendBuyMessage(chatId) {
  await sendMessage(chatId, "Выбери пакет:", {
    inline_keyboard: [
      [{ text: "1 сессия — 390₽", callback_data: "buy_1" }],
      [{ text: "3 сессии — 790₽", callback_data: "buy_3" }],
      [{ text: "5 сессий — 1190₽", callback_data: "buy_5" }],
      [{ text: "10 сессий — 1990₽", callback_data: "buy_10" }],
    ],
  });

  await sendMessage(chatId, `Забрать код можно здесь:\n${BUY_CODE_URL}`);
}

async function askOpenAI({ systemPrompt, history }) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.9,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OPENAI_ERROR: ${err}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || "Сейчас не ответила. Попробуй ещё раз.";
  return text;
}

async function sendMessage(chatId, text, inlineKeyboard = null) {
  const body = {
    chat_id: chatId,
    text,
  };

  if (inlineKeyboard) {
    body.reply_markup = inlineKeyboard;
  }

  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TELEGRAM_SEND_ERROR: ${err}`);
  }
}

async function answerCallbackQuery(callbackQueryId, text) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
}

async function getMe() {
  const response = await fetch(`${TELEGRAM_API}/getMe`);
  const json = await response.json();
  return json.result;
}

function extractStartPayload(text) {
  const parts = text.split(" ");
  if (parts.length < 2) return "";
  return parts.slice(1).join(" ").trim();
}

function generateCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SAN-${rand}`;
}

async function ensureUser({ telegramId, firstName, username }) {
  const now = new Date().toISOString();

  await sbFetch(
    `/users?on_conflict=telegram_id`,
    {
      method: "POST",
      body: [
        {
          telegram_id: telegramId,
          first_name: firstName || null,
          username: username || null,
          updated_at: now,
        },
      ],
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
    }
  );
}

async function getUser(telegramId) {
  const rows = await sbFetch(
    `/users?telegram_id=eq.${encodeURIComponent(String(telegramId))}&select=*`
  );
  return rows[0] || null;
}

async function updateUserFields(telegramId, fields) {
  const payload = {
    ...fields,
    updated_at: new Date().toISOString(),
  };

  await sbFetch(
    `/users?telegram_id=eq.${encodeURIComponent(String(telegramId))}`,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

async function setUserPendingAction(telegramId, action) {
  await updateUserFields(telegramId, {
    pending_action: action,
  });
}

async function lockSessionForUser(user) {
  if (!user) return;

  if (!user.has_used_free) {
    await updateUserFields(user.telegram_id, {
      has_used_free: true,
      access_active: false,
    });
    return;
  }

  if (user.access_active) {
    await updateUserFields(user.telegram_id, {
      access_active: false,
    });
  }
}

async function saveMessage(telegramId, role, content) {
  await sbFetch(`/messages`, {
    method: "POST",
    body: [
      {
        telegram_id: telegramId,
        role,
        content,
      },
    ],
  });
}

async function getRecentMessages(telegramId, limit = 20) {
  const rows = await sbFetch(
    `/messages?telegram_id=eq.${encodeURIComponent(
      String(telegramId)
    )}&select=role,content,created_at&order=created_at.desc&limit=${limit}`
  );

  return rows.reverse();
}

async function createCode({ code, createdBy }) {
  await sbFetch(`/codes?on_conflict=code`, {
    method: "POST",
    body: [
      {
        code,
        created_by: createdBy || null,
        is_used: false,
      },
    ],
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
  });
}

async function getCode(code) {
  const rows = await sbFetch(
    `/codes?code=eq.${encodeURIComponent(code)}&select=*`
  );
  return rows[0] || null;
}

async function markCodeUsed({ code, usedBy }) {
  await sbFetch(`/codes?code=eq.${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: {
      is_used: true,
      used_by: usedBy,
      used_at: new Date().toISOString(),
    },
  });
}

async function getLastCodes(limit = 30) {
  return await sbFetch(
    `/codes?select=code,is_used,used_by,created_at&order=created_at.desc&limit=${limit}`
  );
}

async function upsertMentor({ slug, name, telegramId }) {
  await sbFetch(`/mentors?on_conflict=slug`, {
    method: "POST",
    body: [
      {
        slug,
        name,
        telegram_id: telegramId || null,
      },
    ],
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
  });
}

async function getMentorBySlug(slug) {
  const rows = await sbFetch(
    `/mentors?slug=eq.${encodeURIComponent(slug)}&select=*`
  );
  return rows[0] || null;
}

async function getAllUsers(limit = 1000) {
  return await sbFetch(`/users?select=telegram_id&order=created_at.asc&limit=${limit}`);
}

async function getStats() {
  const [users, messages, codes, usedCodes] = await Promise.all([
    sbFetch(`/users?select=id`, { countOnly: true }),
    sbFetch(`/messages?select=id`, { countOnly: true }),
    sbFetch(`/codes?select=code`, { countOnly: true }),
    sbFetch(`/codes?select=code&is_used=eq.true`, { countOnly: true }),
  ]);

  return {
    users: users.count,
    messages: messages.count,
    codes: codes.count,
    usedCodes: usedCodes.count,
  };
}

async function sbFetch(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body;
  const countOnly = options.countOnly || false;
  const customHeaders = options.headers || {};

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (countOnly) {
    headers.Prefer = "count=exact,head=true";
  }

  const response = await fetch(`${SUPABASE_REST}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`SUPABASE_ERROR ${method} ${path}: ${err}`);
  }

  if (countOnly) {
    const contentRange = response.headers.get("content-range") || "0/0";
    const count = Number(contentRange.split("/")[1] || 0);
    return { count };
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}
