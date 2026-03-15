window.onload = function () {
  initMap();
  initChat();
};

// ─────────────────────────────────────────────
// MAP
// ─────────────────────────────────────────────
function initMap() {
  // HSE MIEM campus: Строченовский пер., 4, Moscow
  var miemCoords = ol.proj.fromLonLat([37.6222, 55.7285]);

  var markerFeature = new ol.Feature({
    geometry: new ol.geom.Point(miemCoords)
  });

  markerFeature.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({ color: '#e74c3c' }),
        stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
      })
    })
  );

  var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [markerFeature]
    })
  });

  new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({ source: new ol.source.OSM() }),
      vectorLayer
    ],
    view: new ol.View({
      center: miemCoords,
      zoom: 16
    })
  });
}

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────
function initChat() {
  var chatWidget   = document.getElementById('chat-widget');
  var toggleBtn    = document.getElementById('chat-toggle');
  var toggleIcon   = document.getElementById('chat-toggle-icon');
  var closeBtn     = document.getElementById('chat-close');
  var chatWindow   = document.getElementById('chat-window');
  var messagesEl   = document.getElementById('chat-messages');
  var chatInput    = document.getElementById('chat-input');
  var sendBtn      = document.getElementById('chat-send');
  var voiceBtn     = document.getElementById('chat-voice');

  var isRecording  = false;
  var recordTimer  = null;

  // ── Keyword → replies map ──
  var keywordReplies = {
    'привет': [
      'Привет! Рад видеть тебя на моей странице!',
      'Привет! Чем могу помочь?',
      'Здравствуй! Добро пожаловать!'
    ],
    'здравствуй': [
      'Здравствуй! Как дела?',
      'Привет! Рад общению!'
    ],
    'вшэ': [
      'ВШЭ — один из лучших университетов России!',
      'Я горжусь тем, что учусь в Высшей школе экономики.',
      'ВШЭ входит в топ-100 лучших университетов мира по версии QS!'
    ],
    'миэм': [
      'МИЭМ ВШЭ — это факультет прикладной математики и IT.',
      'На МИЭМ отличные преподаватели и интересные проекты!'
    ],
    'учёба': [
      'Учиться на четвёртом курсе непросто, но очень интересно!',
      'Стараюсь совмещать учёбу с работой над проектами.'
    ],
    'учеба': [
      'Учиться на четвёртом курсе непросто, но очень интересно!',
      'Стараюсь совмещать учёбу с работой.'
    ],
    'математика': [
      'Прикладная математика — моя специальность!',
      'Математика — основа всего в IT.'
    ],
    'проект': [
      'Я работаю над несколькими проектами параллельно с учёбой.',
      'Расскажи подробнее о своём проекте — возможно смогу помочь!'
    ],
    'контакт': [
      'Вы можете написать мне через форму обратной связи на странице «Обратная связь».',
      'Мой email: aiterekhov_1@edu.hse.ru'
    ],
    'помощь': [
      'Чем могу помочь? Уточни вопрос!',
      'Я постараюсь ответить как можно скорее.'
    ],
    'стипендия': [
      'Да, я получаю академическую стипендию!',
      'Хорошая успеваемость — залог стипендии.'
    ],
    'пока': [
      'До свидания! Заходи ещё!',
      'Пока! Было приятно пообщаться!'
    ],
    'спасибо': [
      'Пожалуйста! Всегда рад помочь.',
      'Не за что! Обращайся ещё.'
    ],
    'работа': [
      'Я успешно совмещаю учёбу с работой.',
      'Работа — отличный способ применить знания на практике!'
    ]
  };

  var defaultReplies = [
    'Интересный вопрос! Напишите мне на почту для подробного ответа.',
    'Спасибо за сообщение! Постараюсь ответить в ближайшее время.',
    'Хороший вопрос! Свяжитесь со мной через форму обратной связи.',
    'Спасибо за интерес! Напишите мне на email: aiterekhov_1@edu.hse.ru',
    'Я ценю ваш вопрос! К сожалению, сейчас не могу дать развёрнутый ответ.'
  ];

  // ── Helpers ──
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getBotReply(text) {
    var lower = text.toLowerCase();
    for (var keyword in keywordReplies) {
      if (lower.indexOf(keyword) !== -1) {
        return pickRandom(keywordReplies[keyword]);
      }
    }
    return pickRandom(defaultReplies);
  }

  function appendMessage(text, type) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function sendUserMessage() {
    var text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = '';

    // Delayed bot reply to feel natural
    setTimeout(function () {
      appendMessage(getBotReply(text), 'bot');
    }, 600);
  }

  // ── Toggle open / close ──
  toggleBtn.addEventListener('click', function () {
    var hidden = chatWindow.classList.contains('chat-hidden');
    chatWindow.classList.toggle('chat-hidden');
    toggleIcon.textContent = hidden ? '\u2715' : '\uD83D\uDCAC';

    if (hidden) {
      // Greet on first open
      if (messagesEl.children.length === 0) {
        appendMessage('Здравствуйте! Я Артём. Задайте мне любой вопрос!', 'bot');
      }
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', function () {
    chatWindow.classList.add('chat-hidden');
    toggleIcon.textContent = '\uD83D\uDCAC';
  });

  // ── Send on button click or Enter key ──
  sendBtn.addEventListener('click', sendUserMessage);

  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      sendUserMessage();
    }
  });

  // ── Fake voice message ──
  voiceBtn.addEventListener('click', function () {
    if (isRecording) return;

    isRecording = true;
    voiceBtn.classList.add('recording');

    // Show live recording indicator
    var indicator = appendMessage('\uD83C\uDFA4 Запись...', 'user voice-recording');

    recordTimer = setTimeout(function () {
      // Replace indicator with finalised voice bubble
      indicator.textContent = '\uD83C\uDFA4 Голосовое сообщение (0:02)';
      indicator.className = 'chat-msg user';

      voiceBtn.classList.remove('recording');
      isRecording = false;

      // Bot responds to voice
      setTimeout(function () {
        var voiceReplies = [
          'Голосовое сообщение получено! Для удобства лучше написать текстом.',
          'Спасибо за голосовое! Напишите вопрос текстом, и я отвечу.',
          'Услышал ваше сообщение! Напишите текстом — так мне проще ответить.'
        ];
        appendMessage(pickRandom(voiceReplies), 'bot');
      }, 600);
    }, 2000);
  });
}
