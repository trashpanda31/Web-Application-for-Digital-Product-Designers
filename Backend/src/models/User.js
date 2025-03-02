import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        username: { type: String, required: true, unique: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: function() { return !this.isOAuth; } },
        googleId: { type: String, sparse: true },  // ✅ НЕ unique
        gitlabId: { type: String, sparse: true },  // ✅ НЕ unique
        isOAuth: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
