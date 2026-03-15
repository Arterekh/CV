const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact — save a form submission to MongoDB
router.post('/contact', async (req, res) => {
  try {
    const { name, email, faculty, subject, message } = req.body;

    if (!name || !email || !faculty || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Все обязательные поля должны быть заполнены.'
      });
    }

    const contact = new Contact({ name, email, faculty, subject, message });
    await contact.save();

    return res.status(201).json({
      success: true,
      message: 'Сообщение успешно сохранено.'
    });
  } catch (err) {
    console.error('Error saving contact:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера. Попробуйте позже.'
    });
  }
});

// GET /api/submissions — retrieve all submissions, newest first
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error fetching submissions:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Ошибка сервера.'
    });
  }
});

module.exports = router;
