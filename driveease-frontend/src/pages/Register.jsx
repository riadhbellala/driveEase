import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import carLogo from '../assets/carlogo.png';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (data.session) {
      navigate('/cars');
    } else {
      setMessage('Registration successful! Please check your email to confirm your account.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-cover bg-center bg-no-repeat font-body overflow-hidden selection:bg-[#E8542E] selection:text-white"
         style={{ backgroundImage: "url('/images/auth_bg.png')" }}>
      
      {/* Light Gradient Overlay for subtle contrast & readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-white/10 to-transparent pointer-events-none" />

      {/* TOP LEFT BRAND LOGO (Matching Reference Photo) */}
      <div className="relative z-20">
        <Link to="/" className="inline-flex items-center group">
          <img src={carLogo} alt="DriveEase Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-lg" />
        </Link>
      </div>

      {/* MAIN CONTAINER: FLOATING REGISTER CARD */}
      <div className="relative z-20 w-full max-w-[1280px] mx-auto my-auto py-8 flex items-center justify-start">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[440px] space-y-6"
        >
          {/* WHITE CARD */}
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] shadow-2xl border border-white/80 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1.5">
              <h1 className="font-display font-bold text-3xl text-[#0B0D10] tracking-tight">
                Create Account
              </h1>
              <p className="text-sm font-body text-[#0B0D10]/55">
                Please enter your details to register
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message Banner */}
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-xl text-center"
              >
                {message}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0B0D10]/70 font-body">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 border border-[#D8D4C8] rounded-xl text-sm font-body text-[#0B0D10] bg-white focus:outline-none focus:border-[#0B0D10] focus:ring-1 focus:ring-[#0B0D10] transition-all placeholder:text-[#0B0D10]/30 shadow-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0B0D10]/70 font-body">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 border border-[#D8D4C8] rounded-xl text-sm font-body text-[#0B0D10] bg-white focus:outline-none focus:border-[#0B0D10] focus:ring-1 focus:ring-[#0B0D10] transition-all placeholder:text-[#0B0D10]/30 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0B0D10]/70 font-body">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3.5 border border-[#D8D4C8] rounded-xl text-sm font-body text-[#0B0D10] bg-white focus:outline-none focus:border-[#0B0D10] focus:ring-1 focus:ring-[#0B0D10] transition-all placeholder:text-[#0B0D10]/30 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Submit Button (Matching Reference Photo Dark Button) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-[#353945] hover:bg-[#0B0D10] text-white font-display font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Under-Card Link */}
          <div className="text-center">
            <p className="text-xs font-body text-white/90 drop-shadow-md">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-white hover:underline underline-offset-4 transition-all"
              >
                Sign in
              </Link>
            </p>
          </div>

        </motion.div>
      </div>

      {/* FOOTER COPYRIGHT */}
      <div className="relative z-20 text-center sm:text-left">
        <p className="text-[11px] font-body text-white/70 drop-shadow-sm">
          © {new Date().getFullYear()} DriveEase Luxury Rentals. All rights reserved.
        </p>
      </div>

    </div>
  );
}

export default Register;
