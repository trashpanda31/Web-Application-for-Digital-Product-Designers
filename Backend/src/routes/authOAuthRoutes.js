import express from 'express';
import passport from 'passport';

const router = express.Router();

// ✅ Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.json({ message: 'Google authentication successful', user: req.user });
    }
);

// ✅ GitLab OAuth
router.get('/gitlab', passport.authenticate('gitlab', { scope: ['read_user'] }));

router.get('/gitlab/callback',
    passport.authenticate('gitlab', { failureRedirect: '/' }),
    (req, res) => {
        res.json({ message: 'GitLab authentication successful', user: req.user });
    }
);

export default router;
