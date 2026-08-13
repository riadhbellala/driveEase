import { Link } from 'react-router-dom';
import carLogo from '../assets/carlogo.png';

export function Footer() {
  return (
    <footer className="w-full bg-[#082925] text-[#E0F2EC] relative overflow-hidden font-body selection:bg-[#E8542E] selection:text-white">
      
      {/* ─── LUXURY CAR/ROAD TOP HERO SECTION ─── */}
      <div className="relative w-full min-h-[360px] sm:min-h-[420px] flex flex-col justify-end px-6 sm:px-12 md:px-16 pt-16 pb-8 overflow-hidden">
        
        {/* Background Image: Luxury Car on Scenic Highway (Matching website content) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/cta_road.png" 
            alt="DriveEase Luxury Car Road" 
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          {/* Smooth gradient overlay fading down into dark footer background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#082925]/60 to-[#082925]"></div>
        </div>

        {/* Left Headline matching the reference picture layout */}
        <div className="relative z-10 max-w-[1240px] w-full mx-auto pb-4">
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.08] max-w-xl drop-shadow-lg">
            Drive the <br />
            extraordinary
          </h2>
        </div>
      </div>

      {/* ─── BOTTOM MAIN FOOTER CONTENT (MATCHING LAYOUT IN PICTURE) ─── */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 sm:px-12 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* Bottom Left: Brand Logo, Copyright & Subtext */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <img 
                src={carLogo} 
                alt="DriveEase Logo" 
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105" 
              />
              <span className="font-display font-bold text-2xl tracking-tight text-white">driveease<span className="text-xs align-super opacity-60 font-body">™</span></span>
            </Link>

            <div className="space-y-0.5 pt-1 font-body text-xs text-[#A8C9C1]">
              <p>Copyright © {new Date().getFullYear()}</p>
              <p className="text-[11px] opacity-75">Unmatched luxury. Exceptional journey.</p>
            </div>
          </div>

          {/* Middle: 3 Vertical Columns separated by pipes '|' */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3 text-xs font-body">
            
            {/* Column 1 */}
            <div className="space-y-2.5">
              <Link to="/" className="flex items-center text-[#C4E5DC] hover:text-white transition-colors">
                <span className="text-[#72B095] font-bold mr-2">|</span> Home
              </Link>
              <Link to="/cars" className="flex items-center text-[#C4E5DC] hover:text-white transition-colors">
                <span className="text-[#72B095] font-bold mr-2">|</span> Fleet & Cars
              </Link>
            </div>

            {/* Column 2 */}
            <div className="space-y-2.5">
              <a href="#availability-search" className="flex items-center text-[#C4E5DC] hover:text-white transition-colors">
                <span className="text-[#72B095] font-bold mr-2">|</span> How it works
              </a>
              <Link to="/my-bookings" className="flex items-center text-[#C4E5DC] hover:text-white transition-colors">
                <span className="text-[#72B095] font-bold mr-2">|</span> My Bookings
              </Link>
            </div>

            {/* Column 3 */}
            <div className="space-y-2.5">
              <Link to="/cars" className="flex items-center text-[#C4E5DC] hover:text-white transition-colors">
                <span className="text-[#72B095] font-bold mr-2">|</span> VIP Services
              </Link>
              <Link to="/" className="flex items-center text-[#C4E5DC] hover:text-white transition-colors">
                <span className="text-[#72B095] font-bold mr-2">|</span> Privacy Policy
              </Link>
            </div>

          </div>

          {/* Right: Contact Us Button matching reference picture */}
          <div className="lg:col-span-3 flex justify-start lg:justify-end">
            <Link
              to="/cars"
              className="px-8 py-3.5 rounded-2xl bg-[#FFA69E] hover:bg-[#ff938a] text-[#082925] font-display font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-md"
            >
              CONTACT US
            </Link>
          </div>

        </div>

        {/* Horizontal Divider Line & Social Icons Row */}
        <div className="mt-8 pt-4 border-t border-[#1C4D46] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#A8C9C1]/60 font-body">
            DriveEase Luxury Car Rentals
          </p>

          <div className="flex items-center space-x-5 text-[#A8C9C1]">
            {/* Twitter / X */}
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

    </footer>
  );
}

export default Footer;
