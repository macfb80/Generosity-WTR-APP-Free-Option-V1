import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Calendar, MapPin, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthModal = ({ onClose, onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const response = await axios.post(`${API}/auth/register`, {
          email,
          password,
          name,
          dob,
          zip_code: zipCode
        });

        toast.success('Account created successfully!');
        onLogin(response.data.user, response.data.token);
      } else {
        // Sign In
        const response = await axios.post(`${API}/auth/login`, {
          email,
          password
        });

        onLogin(response.data.user, response.data.token);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(
        error.response?.data?.detail || 
        (isSignUp ? 'Failed to create account' : 'Invalid credentials')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      // Redirect to Google OAuth using window.location.origin for deployment compatibility
      window.location.href = `${window.location.origin}/api/auth/google`;
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to initialize Google sign-in');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-secondary/20 p-6 flex items-center justify-between rounded-t-3xl z-10">
            <div>
              <h2 className="font-sans text-2xl font-bold text-text-primary">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="font-body text-sm text-text-secondary mt-1">
                {isSignUp ? 'Join Generosity WTR' : 'Sign in to continue'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
            >
              <X className="w-6 h-6 text-text-primary" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {isSignUp && (
              <>
                {/* Name */}
                <div>
                  <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                    Zip Code
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                      placeholder="10001"
                      maxLength="10"
                      className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-sm font-semibold text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength="8"
                  className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-secondary/30 rounded-xl text-text-primary font-body focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {isSignUp && (
                <p className="font-body text-xs text-text-muted mt-2">
                  At least 8 characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-body font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white font-body text-text-muted">or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 bg-white border-2 border-secondary/30 hover:border-primary/30 hover:bg-primary/5 rounded-xl font-body font-semibold transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            {/* Toggle Sign In/Up */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-body text-sm text-text-secondary hover:text-primary transition-colors"
              >
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <span className="font-semibold text-primary">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
