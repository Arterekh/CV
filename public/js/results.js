window.onload = function () {
  loadSubmissions();

  document.getElementById('refresh-btn').addEventListener('click', loadSubmissions);
};

var subjectLabels = {
  question:   'Вопрос',
  suggestion: 'Предложение',
  complaint:  'Жалоба',
  other:      'Другое'
};

var subjectClasses = {
  question:   'badge-question',
  suggestion: 'badge-suggestion',
  complaint:  'badge-complaint',
  other:      'badge-other'
};

var facultyLabels = {
  economics:       'Экономический факультет',
  management:      'Факультет управления',
  law:             'Юридический факультет',
  social_sciences: 'Факультет социальных наук',
  computer_science:'Факультет компьютерных наук',
  humanities:      'Факультет гуманитарных наук'
};

function formatDate(dateStr) {
  var date = new Date(dateStr);
  return date.toLocaleString('ru-RU', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadSubmissions() {
  var container = document.getElementById('results-container');
  container.innerHTML = '<p class="results-status">Загрузка...</p>';

  try {
    var response = await fetch('/api/submissions');
    var result = await response.json();

    if (!result.success) {
      container.innerHTML = '<p class="results-status results-error">Ошибка загрузки данных.</p>';
      return;
    }

    if (result.data.length === 0) {
      container.innerHTML = '<p class="results-status">Заявок пока нет.</p>';
      return;
    }

    var table = document.createElement('table');
    table.className = 'results-table';

    var thead = document.createElement('thead');
    thead.innerHTML =
      '<tr>' +
        '<th>#</th>' +
        '<th>Имя</th>' +
        '<th>Email</th>' +
        '<th>Факультет</th>' +
        '<th>Тема</th>' +
        '<th>Сообщение</th>' +
        '<th>Дата</th>' +
      '</tr>';
    table.appendChild(thead);

    var tbody = document.createElement('tbody');

    result.data.forEach(function (item, index) {
      var tr = document.createElement('tr');
      var badgeClass = subjectClasses[item.subject] || 'badge-other';
      var subjectLabel = subjectLabels[item.subject] || escapeHtml(item.subject);
      var facultyLabel = facultyLabels[item.faculty] || escapeHtml(item.faculty);

      tr.innerHTML =
        '<td>' + (index + 1) + '</td>' +
        '<td>' + escapeHtml(item.name) + '</td>' +
        '<td>' + escapeHtml(item.email) + '</td>' +
        '<td>' + facultyLabel + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + subjectLabel + '</span></td>' +
        '<td class="msg-cell">' + escapeHtml(item.message) + '</td>' +
        '<td>' + formatDate(item.createdAt) + '</td>';

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);

  } catch (err) {
    container.innerHTML =
      '<p class="results-status results-error">' +
      'Не удалось загрузить данные. Убедитесь, что сервер запущен.' +
      '</p>';
  }
}
