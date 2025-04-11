const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

// Submit result
router.post('/', async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get results for a user
router.get('/:userId', async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate('quizId', 'title')
      .sort({ submittedAt: 1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
