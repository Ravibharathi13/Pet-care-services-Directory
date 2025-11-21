import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Admin from '../models/Admin.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'super_secret_key_123',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://pet-care-services-directory-client.onrender.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if admin already exists with this Google ID
    let admin = await Admin.findOne({ googleId: profile.id });
    
    if (admin) {
      // Update last login
      admin.lastLogin = new Date();
      await admin.save();
      return done(null, admin);
    }
    
    // Check if admin exists with same email
    admin = await Admin.findOne({ email: profile.emails[0].value });
    
    if (admin) {
      // Link Google account to existing admin
      admin.googleId = profile.id;
      admin.authProvider = 'google';
      admin.profilePicture = profile.photos[0]?.value;
      admin.lastLogin = new Date();
      await admin.save();
      return done(null, admin);
    }
    
    // Create new admin (only if email is from allowed domain)
    const allowedDomains = ['petcare.com', 'gmail.com']; // Add your allowed domains
    const emailDomain = profile.emails[0].value.split('@')[1];
    
    if (!allowedDomains.includes(emailDomain)) {
      return done(null, false, { message: 'Email domain not authorized for admin access' });
    }
    
    admin = new Admin({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      authProvider: 'google',
      profilePicture: profile.photos[0]?.value,
      lastLogin: new Date()
    });
    
    await admin.save();
    return done(null, admin);
    
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((admin, done) => {
  done(null, admin._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const admin = await Admin.findById(id);
    done(null, admin);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
