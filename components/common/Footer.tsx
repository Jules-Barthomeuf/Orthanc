"use client";

export function Footer() {
  return (
    <footer className="border-t border-gold-400/10 bg-dark-900 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <h3 className="font-display text-xl font-bold text-gold-400 mb-4 tracking-wider">
              ORTHANC
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed">
              The sovereign vault for ultra-luxury real estate investment analysis.
            </p>
          </div>
          <div>
            <h4 className="label-luxury text-gold-400/70 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-dark-400">
              <li>
                <a href="#" className="hover:text-gold-400 transition">
                  For Agents
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400 transition">
                  For Investors
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400 transition">
                  Features
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="label-luxury text-gold-400/70 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-dark-400">
              <li>
                <a href="#" className="hover:text-gold-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400 transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="label-luxury text-gold-400/70 mb-4">Contact</h4>
            <p className="text-sm text-dark-400">hello@orthanc.com</p>
          </div>
        </div>
        <div className="gold-line mb-8"></div>
        <div className="text-center text-xs text-dark-500 tracking-wider">
          <p>&copy; {new Date().getFullYear()} ORTHANC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
