import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitLabStrategy } from 'passport-gitlab2';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../services/authService.js';

dotenv.config();

passport.serializeUser((user, done) => {
    if (!user || !user._id) {
        return done(new Error("User ID is missing"));
    }
    done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return done(new Error("User not found"));
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ✅ Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "https://localhost:443/api/auth/google/callback",
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

        if (!user) {
            user = new User({
                username: email.split('@')[0],
                firstName: profile.name?.givenName || 'John',
                lastName: profile.name?.familyName || 'Doe',
                email,
                googleId: profile.id,
                isOAuth: true
            });
        }

        // ✅ Генерируем токены
        user.refreshToken = generateRefreshToken(user._id);
        await user.save();

        user.accessToken = generateAccessToken(user._id);
        return done(null, user);
    } catch (err) {
        console.error('Google OAuth Error:', err);
        return done(err, null);
    }
}));

// ✅ GitLab OAuth
passport.use(new GitLabStrategy({
    clientID: process.env.GITLAB_CLIENT_ID,
    clientSecret: process.env.GITLAB_CLIENT_SECRET,
    callbackURL: 'https://localhost:443/api/auth/gitlab/callback',
    scope: ['read_user']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : profile.email || `gitlab_${profile.id}@domain.com`;

        let user = await User.findOne({ $or: [{ gitlabId: profile.id }, { email }] });

        if (!user) {
            user = new User({
                username: profile.username || `gitlab_${profile.id}`,
                firstName: profile.name?.split(' ')[0] || 'GitLab',
                lastName: profile.name?.split(' ')[1] || 'User',
                email,
                gitlabId: profile.id,
                isOAuth: true
            });
        }

        // ✅ Генерируем токены
        user.refreshToken = generateRefreshToken(user._id);
        await user.save();

        user.accessToken = generateAccessToken(user._id);
        return done(null, user);
    } catch (err) {
        console.error('GitLab OAuth Error:', err);
        return done(err);
    }
}));

export default passport;
