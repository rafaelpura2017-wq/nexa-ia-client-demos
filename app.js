const introScript =
  "Hola, vi tu negocio en Google Maps. Soy de NEXA IA y estoy preparando demos gratis para negocios que quieren responder mas rapido por WhatsApp y verse mas profesionales en internet. Te puedo mostrar una demo con el nombre de tu negocio?";

const company = {
  whatsapp: "573000000000"
};

const business = {
  name: "Barberia Estilo Fino",
  city: "Centro",
  phone: "+57 300 000 0000",
  address: "Carrera 12 #45-20",
  hours: "Lun a Sab, 9:00 a.m. - 8:00 p.m.",
  promo: "Corte + barba por $38.000 de lunes a jueves.",
  services: [
    { name: "Corte clasico", price: "$25.000", duration: "35 min" },
    { name: "Corte + barba", price: "$38.000", duration: "55 min" },
    { name: "Barba", price: "$18.000", duration: "25 min" },
    { name: "Cejas", price: "$8.000", duration: "10 min" }
  ],
  times: ["10:00 a.m.", "12:30 p.m.", "3:00 p.m.", "6:00 p.m."]
};

const assistantProfile = {
  name: "NEXA Barber IA",
  version: "1.0",
  role: "Asistente virtual para barberias y negocios con citas",
  promise: "Responde preguntas frecuentes, recomienda servicios, agenda citas y deja un resumen para seguimiento.",
  goals: [
    "Responder precios, horarios, ubicacion y promociones",
    "Guiar al cliente hacia una cita",
    "Capturar nombre y WhatsApp",
    "Pasar a una persona cuando el cliente lo pida"
  ],
  rules: [
    "No inventar precios, horarios ni direcciones",
    "Responder corto, claro y profesional",
    "Cerrar cada conversacion con una accion concreta",
    "Si no sabe algo, ofrecer pasar con una persona"
  ]
};

const state = {
  booking: null,
  lastSummary: "",
  isPersonalizedDemo: false
};

const elements = {
  chatWindow: document.querySelector("#chatWindow"),
  quickActions: document.querySelector("#quickActions"),
  composerForm: document.querySelector("#composerForm"),
  messageInput: document.querySelector("#messageInput"),
  businessForm: document.querySelector("#businessForm"),
  businessName: document.querySelector("#businessName"),
  businessCity: document.querySelector("#businessCity"),
  businessPhone: document.querySelector("#businessPhone"),
  businessAddress: document.querySelector("#businessAddress"),
  businessHours: document.querySelector("#businessHours"),
  businessPromo: document.querySelector("#businessPromo"),
  previewName: document.querySelector("#previewName"),
  chatBusinessName: document.querySelector("#chatBusinessName"),
  resetDemoButton: document.querySelector("#resetDemoButton"),
  bookingSummary: document.querySelector("#bookingSummary"),
  copySummaryButton: document.querySelector("#copySummaryButton"),
  demoTitle: document.querySelector("#demoTitle"),
  demoLead: document.querySelector("#demoLead"),
  demoLinkOutput: document.querySelector("#demoLinkOutput"),
  shareMessageOutput: document.querySelector("#shareMessageOutput"),
  copyDemoLinkButton: document.querySelector("#copyDemoLinkButton"),
  copyShareMessageButton: document.querySelector("#copyShareMessageButton"),
  assistantPromptOutput: document.querySelector("#assistantPromptOutput"),
  assistantConfigOutput: document.querySelector("#assistantConfigOutput"),
  copyAssistantPromptButton: document.querySelector("#copyAssistantPromptButton"),
  copyAssistantConfigButton: document.querySelector("#copyAssistantConfigButton"),
  headerWhatsappLink: document.querySelector("#headerWhatsappLink"),
  heroWhatsappLink: document.querySelector("#heroWhatsappLink"),
  contactWhatsappLink: document.querySelector("#contactWhatsappLink"),
  toast: document.querySelector("#toast")
};

function setPageMode() {
  const params = new URLSearchParams(window.location.search);
  const isAdmin = params.get("admin") === "1" || params.get("modo") === "admin";
  document.body.classList.toggle("admin-mode", isAdmin);
  document.body.classList.toggle("public-mode", !isAdmin);
}

function getParam(params, keys) {
  const key = keys.find((candidate) => params.has(candidate));
  return key ? params.get(key) : "";
}

function loadBusinessFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const values = {
    name: getParam(params, ["cliente", "negocio", "name"]),
    city: getParam(params, ["ciudad", "barrio", "city"]),
    phone: getParam(params, ["whatsapp", "telefono", "phone"]),
    address: getParam(params, ["direccion", "address"]),
    hours: getParam(params, ["horario", "hours"]),
    promo: getParam(params, ["promo", "promocion"])
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      business[key] = value;
    }
  });

  state.isPersonalizedDemo = Object.values(values).some(Boolean);
}

function applyBusinessToForm() {
  elements.businessName.value = business.name;
  elements.businessCity.value = business.city;
  elements.businessPhone.value = business.phone;
  elements.businessAddress.value = business.address;
  elements.businessHours.value = business.hours;
  elements.businessPromo.value = business.promo;
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[char];
  });
}

function scrollChatToBottom() {
  if (!elements.chatWindow) return;
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

function addMessage(type, text, extraClass = "") {
  const row = document.createElement("div");
  row.className = `message-row ${type} ${extraClass}`.trim();

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = escapeText(text);

  row.appendChild(bubble);
  elements.chatWindow.appendChild(row);
  scrollChatToBottom();
  return row;
}

function showTyping() {
  return addMessage("bot", "Escribiendo...", "typing");
}

function botReply(text, delay = 360) {
  const typing = showTyping();
  window.setTimeout(() => {
    typing.remove();
    addMessage("bot", text);
  }, delay);
}

function setQuickActions(actions) {
  elements.quickActions.innerHTML = "";
  actions.forEach((label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.message = label;
    button.textContent = label;
    elements.quickActions.appendChild(button);
  });
}

function serviceLine(service) {
  const duration = service.duration ? ` (${service.duration})` : "";
  return `- ${service.name}: ${service.price}${duration}`;
}

function pricesMessage() {
  const list = business.services.map(serviceLine).join("\n");
  return `Claro. Estos son nuestros servicios:\n${list}\n\nSi quieres, puedo ayudarte a reservar una cita ahora.`;
}

function locationMessage() {
  return `Estamos en ${business.address}, ${business.city}.\n\nSi quieres, tambien puedo ayudarte a separar una cita antes de venir.`;
}

function hoursMessage() {
  return `Nuestro horario es:\n${business.hours}\n\nHoy tenemos espacios disponibles.`;
}

function humanMessage() {
  return `Claro. Te puedo pasar con una persona del equipo.\n\nWhatsApp directo: ${business.phone}`;
}

function promoMessage() {
  return `${business.promo}\n\nQuieres que te ayude a reservar un espacio?`;
}

function recommendationMessage() {
  return "Si quieres verte mas completo, te recomiendo Corte + barba. Si buscas algo rapido, Corte clasico funciona muy bien.\n\nQuieres que te ayude a agendar?";
}

function paymentMessage() {
  return "Puedes confirmar el metodo de pago directamente con el equipo. Normalmente muchos negocios reciben efectivo, transferencia o pago digital.\n\nQuieres que te pase con una persona para confirmarlo?";
}

function durationMessage() {
  const list = business.services.map(serviceLine).join("\n");
  return `Duracion aproximada por servicio:\n${list}\n\nTe ayudo a reservar el horario que mejor te quede?`;
}

function greetingMessage() {
  return `Hola. Soy ${assistantProfile.name}, el asistente de ${business.name}.\n\nPuedo ayudarte con precios, horarios, ubicacion, promociones o agendar una cita. Que necesitas?`;
}

function startBooking() {
  state.booking = {
    step: "service",
    service: "",
    day: "",
    time: "",
    name: "",
    phone: ""
  };

  setQuickActions(business.services.map((service) => service.name));
  botReply("Perfecto. Que servicio quieres reservar?");
}

function findService(text) {
  const normalized = normalizeText(text);
  return business.services.find((service) => {
    const serviceName = normalizeText(service.name);
    return serviceName === normalized || normalized.includes(serviceName) || serviceName.includes(normalized);
  });
}

function serviceOptionsText() {
  return business.services.map((service) => service.name).join(", ");
}

function looksLikePhone(text) {
  return text.replace(/\D/g, "").length >= 7;
}

function processBooking(text) {
  const booking = state.booking;
  const normalized = normalizeText(text);

  if (normalized.includes("cancel")) {
    state.booking = null;
    setQuickActions(defaultQuickActions());
    botReply("Listo, cancele la reserva. Puedo ayudarte con precios, horarios, ubicacion o hablar con una persona.");
    return;
  }

  if (booking.step === "service") {
    const service = findService(text);
    if (!service) {
      botReply(`Te puedo ayudar con: ${serviceOptionsText()}.\n\nCual eliges?`);
      return;
    }

    booking.service = `${service.name} (${service.price})`;
    booking.step = "day";
    setQuickActions(["Hoy", "Manana", "Viernes", "Sabado"]);
    botReply(`Listo: ${booking.service}.\nQue dia te queda mejor?`);
    return;
  }

  if (booking.step === "day") {
    booking.day = text;
    booking.step = "time";
    setQuickActions(business.times);
    botReply(`Para ${booking.day} tengo estos horarios disponibles: ${business.times.join(", ")}.`);
    return;
  }

  if (booking.step === "time") {
    booking.time = text;
    booking.step = "name";
    setQuickActions(["Precios", "Horarios", "Ubicacion", "Hablar con humano"]);
    botReply("Perfecto. A que nombre dejo la cita?");
    return;
  }

  if (booking.step === "name") {
    booking.name = text;
    booking.step = "phone";
    botReply(`Gracias, ${booking.name}. Enviame tu numero de WhatsApp para confirmar la cita.`);
    return;
  }

  if (booking.step === "phone") {
    if (!looksLikePhone(text)) {
      botReply("Me puedes enviar un numero de WhatsApp valido para confirmar la cita?");
      return;
    }

    booking.phone = text;
    finishBooking();
  }
}

function finishBooking() {
  const booking = state.booking;
  state.lastSummary = [
    `Cliente: ${booking.name}`,
    `WhatsApp: ${booking.phone}`,
    `Servicio: ${booking.service}`,
    `Dia: ${booking.day}`,
    `Hora: ${booking.time}`,
    `Negocio: ${business.name}`,
    `Direccion: ${business.address}, ${business.city}`
  ].join("\n");

  elements.bookingSummary.className = "summary-card";
  elements.bookingSummary.textContent = state.lastSummary;

  botReply(
    `Cita pre-reservada.\n\n${booking.name}, te esperamos ${booking.day} a las ${booking.time} para ${booking.service}.\n\nDireccion: ${business.address}, ${business.city}.\nTe confirmamos por WhatsApp.`
  );

  state.booking = null;
  setQuickActions(defaultQuickActions());
}

function handleBotIntent(text) {
  const normalized = normalizeText(text);

  if (state.booking) {
    processBooking(text);
    return;
  }

  if (normalized === "hola" || normalized.includes("buenas") || normalized.includes("saludos")) {
    botReply(greetingMessage());
    return;
  }

  if (normalized.includes("duracion") || normalized.includes("demora") || normalized.includes("tiempo") || normalized.includes("tarda")) {
    botReply(durationMessage());
    return;
  }

  if (normalized.includes("precio") || normalized.includes("servicio") || normalized.includes("cuanto")) {
    botReply(pricesMessage());
    return;
  }

  if (normalized.includes("horario") || normalized.includes("abren") || normalized.includes("atienden")) {
    botReply(hoursMessage());
    return;
  }

  if (normalized.includes("ubicacion") || normalized.includes("direccion") || normalized.includes("donde")) {
    botReply(locationMessage());
    return;
  }

  if (normalized.includes("promo") || normalized.includes("oferta")) {
    botReply(promoMessage());
    return;
  }

  if (normalized.includes("recomienda") || normalized.includes("recomiendas") || normalized.includes("mejor") || normalized.includes("look")) {
    botReply(recommendationMessage());
    return;
  }

  if (normalized.includes("pago") || normalized.includes("tarjeta") || normalized.includes("efectivo") || normalized.includes("transferencia")) {
    botReply(paymentMessage());
    return;
  }

  if (normalized.includes("humano") || normalized.includes("persona") || normalized.includes("asesor")) {
    botReply(humanMessage());
    return;
  }

  if (normalized.includes("agenda") || normalized.includes("cita") || normalized.includes("reserv")) {
    startBooking();
    return;
  }

  botReply(
    "Puedo ayudarte con precios, horarios, ubicacion, promociones, recomendaciones o agendar una cita. Escribe lo que necesitas o toca una opcion."
  );
}

function sendUserMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;

  addMessage("user", cleanText);
  handleBotIntent(cleanText);
}

function readBusinessFromForm() {
  business.name = elements.businessName.value.trim() || "Barberia Estilo Fino";
  business.city = elements.businessCity.value.trim() || "Centro";
  business.phone = elements.businessPhone.value.trim() || "+57 300 000 0000";
  business.address = elements.businessAddress.value.trim() || "Carrera 12 #45-20";
  business.hours = elements.businessHours.value.trim() || "Lun a Sab, 9:00 a.m. - 8:00 p.m.";
  business.promo = elements.businessPromo.value.trim() || "Corte + barba por $38.000 de lunes a jueves.";
}

function syncBusinessToUi() {
  elements.previewName.textContent = business.name;
  elements.chatBusinessName.textContent = business.name;

  if (state.isPersonalizedDemo || document.body.classList.contains("admin-mode")) {
    elements.demoTitle.textContent = `${business.name}: asi podria atender un asistente IA`;
    elements.demoLead.textContent =
      `Prueba esta demo personalizada para ${business.name}. Toca precios, horarios, ubicacion o agenda una cita como si fueras cliente.`;
  } else {
    elements.demoTitle.textContent = "Prueba una demo de ejemplo";
    elements.demoLead.textContent =
      "Toca precios, horarios, ubicacion o agenda una cita como si fueras cliente. Esta misma experiencia se puede personalizar para tu negocio.";
  }

  updateShareTools();
  updateAssistantAssets();
  updateContactLinks();
}

function updateBusinessFromForm() {
  readBusinessFromForm();
  syncBusinessToUi();
  resetDemo(false);
  showToast("Demo actualizada");
}

function buildDemoLink() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "demo";

  const params = new URLSearchParams();
  params.set("cliente", business.name);
  params.set("ciudad", business.city);
  params.set("whatsapp", business.phone);
  params.set("direccion", business.address);
  params.set("horario", business.hours);
  params.set("promo", business.promo);

  url.search = params.toString();
  return url.toString();
}

function buildShareMessage() {
  return `Hola, te prepare una demo rapida para ${business.name}. Puedes probar como responderia ${assistantProfile.name} a precios, horarios, ubicacion y citas por WhatsApp:\n\n${buildDemoLink()}`;
}

function updateShareTools() {
  if (elements.demoLinkOutput) {
    elements.demoLinkOutput.value = buildDemoLink();
  }

  if (elements.shareMessageOutput) {
    elements.shareMessageOutput.value = buildShareMessage();
  }
}

function buildAssistantPrompt() {
  const services = business.services.map(serviceLine).join("\n");
  return [
    `Eres ${assistantProfile.name}, el asistente virtual de ${business.name}.`,
    "",
    "Objetivo principal:",
    assistantProfile.promise,
    "",
    "Datos del negocio:",
    `- Nombre: ${business.name}`,
    `- Ciudad o barrio: ${business.city}`,
    `- WhatsApp: ${business.phone}`,
    `- Direccion: ${business.address}`,
    `- Horario: ${business.hours}`,
    `- Promocion activa: ${business.promo}`,
    "",
    "Servicios:",
    services,
    "",
    "Tono:",
    "Habla en espanol claro, cercano y profesional. Responde como alguien que atiende bien por WhatsApp. Se breve, pero util.",
    "",
    "Reglas:",
    assistantProfile.rules.map((rule) => `- ${rule}`).join("\n"),
    "",
    "Flujo para agendar:",
    "1. Pregunta que servicio quiere reservar.",
    "2. Pregunta el dia.",
    `3. Ofrece estos horarios: ${business.times.join(", ")}.`,
    "4. Pide el nombre.",
    "5. Pide el numero de WhatsApp.",
    "6. Entrega resumen de la cita y aclara que sera confirmada por WhatsApp.",
    "",
    "Si el cliente pide una recomendacion:",
    "Sugiere Corte + barba para un cambio completo y Corte clasico si quiere algo rapido.",
    "",
    "Si no sabes algo:",
    `Di que puedes pasar el caso con una persona del equipo al WhatsApp ${business.phone}.`,
    "",
    "Mensaje inicial sugerido:",
    greetingMessage()
  ].join("\n");
}

function buildAssistantConfig() {
  return JSON.stringify(
    {
      assistantName: assistantProfile.name,
      version: assistantProfile.version,
      role: assistantProfile.role,
      business: {
        name: business.name,
        city: business.city,
        phone: business.phone,
        address: business.address,
        hours: business.hours,
        promo: business.promo
      },
      services: business.services,
      times: business.times,
      goals: assistantProfile.goals,
      rules: assistantProfile.rules,
      fallback: "Si no tienes la informacion, ofrece pasar con una persona del equipo."
    },
    null,
    2
  );
}

function updateAssistantAssets() {
  if (elements.assistantPromptOutput) {
    elements.assistantPromptOutput.value = buildAssistantPrompt();
  }

  if (elements.assistantConfigOutput) {
    elements.assistantConfigOutput.value = buildAssistantConfig();
  }
}

function defaultQuickActions() {
  return ["Precios", "Horarios", "Ubicacion", "Promo", "Agendar cita", "Humano"];
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
}

function updateContactLinks() {
  const message =
    `Hola, quiero una demo gratis de NEXA IA para mi negocio. Me interesa pagina web, chatbot o automatizacion.`;
  const href = buildWhatsAppUrl(message);
  [elements.headerWhatsappLink, elements.heroWhatsappLink, elements.contactWhatsappLink].forEach((link) => {
    if (link) {
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener";
    }
  });
}

function resetSummary() {
  state.lastSummary = "";
  elements.bookingSummary.className = "empty-state";
  elements.bookingSummary.textContent = "Todavia no hay una cita creada en esta demo.";
}

function resetDemo(showMessage = true) {
  state.booking = null;
  elements.chatWindow.innerHTML = "";
  resetSummary();
  setQuickActions(defaultQuickActions());
  addMessage(
    "bot",
    greetingMessage()
  );
  if (showMessage) {
    showToast("Demo reiniciada");
  }
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast(successMessage);
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 1800);
}

function wireCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyText(introScript, "Mensaje copiado"));
  });

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(`#${button.dataset.copyTarget}`);
      if (!target) return;
      copyText(target.textContent.trim(), "Mensaje copiado");
    });
  });
}

function wireDemo() {
  elements.composerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendUserMessage(elements.messageInput.value);
    elements.messageInput.value = "";
  });

  elements.quickActions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-message]");
    if (!button) return;
    sendUserMessage(button.dataset.message);
  });

  elements.businessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateBusinessFromForm();
  });

  elements.businessForm.addEventListener("input", () => {
    readBusinessFromForm();
    syncBusinessToUi();
  });

  elements.copySummaryButton.addEventListener("click", () => {
    if (!state.lastSummary) {
      showToast("Primero crea una cita");
      return;
    }

    copyText(state.lastSummary, "Resumen copiado");
  });

  elements.resetDemoButton.addEventListener("click", () => resetDemo());

  elements.copyDemoLinkButton.addEventListener("click", () => {
    readBusinessFromForm();
    syncBusinessToUi();
    copyText(buildDemoLink(), "Link copiado");
  });

  elements.copyShareMessageButton.addEventListener("click", () => {
    readBusinessFromForm();
    syncBusinessToUi();
    copyText(buildShareMessage(), "Mensaje copiado");
  });

  elements.copyAssistantPromptButton.addEventListener("click", () => {
    readBusinessFromForm();
    syncBusinessToUi();
    copyText(buildAssistantPrompt(), "Prompt copiado");
  });

  elements.copyAssistantConfigButton.addEventListener("click", () => {
    readBusinessFromForm();
    syncBusinessToUi();
    copyText(buildAssistantConfig(), "Configuracion copiada");
  });
}

setPageMode();
loadBusinessFromUrl();
applyBusinessToForm();
syncBusinessToUi();
wireCopyButtons();
wireDemo();
resetDemo(false);
