window.onload = function () {
  var form = document.getElementById('contactForm');
  var successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var faculty = document.getElementById('faculty').value;
    var subjectEl = document.querySelector('input[name="subject"]:checked');
    var message = document.getElementById('message').value.trim();
    var privacy = document.getElementById('privacy').checked;

    if (!name || !email || !faculty || !subjectEl || !message || !privacy) {
      alert('Пожалуйста, заполните все обязательные поля!');
      return;
    }

    var subject = subjectEl.value;

    try {
      var response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, faculty, subject, message })
      });

      var result = await response.json();

      if (result.success) {
        successMessage.style.display = 'block';
        form.reset();
        setTimeout(function () {
          successMessage.style.display = 'none';
        }, 5000);
      } else {
        alert(result.error || 'Произошла ошибка. Попробуйте ещё раз.');
      }
    } catch (err) {
      alert('Не удалось отправить сообщение. Проверьте соединение с сервером.');
    }
  });
};
