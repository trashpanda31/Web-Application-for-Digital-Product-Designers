const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.send('Auth route работает!');
});

module.exports = router; // Должно быть именно `module.exports = router;`
