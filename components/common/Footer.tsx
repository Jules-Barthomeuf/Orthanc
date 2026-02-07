"use client";

export function Footer() {
  return (
    <footer className="border-t border-gold-900 bg-luxury-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold gradient-text mb-4">ORTHANC</h3>
            <p className="text-gray-400 text-sm">
              The private vault for ultra-luxury real estate investment.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gold-400">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-gold-400">
                  For Agents
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400">
                  For Clients
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400">
                  Features
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gold-400">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-gold-400">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold-400">
                  Terms
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gold-400">Contact</h4>
            <p className="text-sm text-gray-400">hello@orthanc.com</p>
          </div>
        </div>
        <div className="border-t border-gold-900 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 ORTHANC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
