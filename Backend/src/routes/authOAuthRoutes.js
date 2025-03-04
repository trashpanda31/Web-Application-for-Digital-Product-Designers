import express from 'express';
import passport from 'passport';

const router = express.Router();

// ✅ Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(`http://localhost:5000/dashboard?accessToken=${req.user.accessToken}&refreshToken=${req.user.refreshToken}`);
    }
);

// ✅ GitLab OAuth
router.get('/gitlab', passport.authenticate('gitlab', { scope: ['read_user'] }));

router.get('/gitlab/callback',
    passport.authenticate('gitlab', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(`http://localhost:5000/dashboard?accessToken=${req.user.accessToken}&refreshToken=${req.user.refreshToken}`);
    }
);

export default router;
