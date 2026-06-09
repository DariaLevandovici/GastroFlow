import { Link } from 'react-router';
import { useApp } from '../../context/AppContext';

export function Footer() {
  const { t } = useApp();

  return (
    <footer className="bg-[#0d0d0d] border-t border-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">{t.footer.aboutTitle}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t.footer.aboutText}
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">{t.footer.contactTitle}</h3>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>{t.footer.email}</li>
              <li>{t.footer.phone}</li>
              <li>{t.footer.address}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">{t.footer.quickLinksTitle}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/reservation" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.reservation}
                </Link>
              </li>
              <li>
                <Link to="/order" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.orderOnline}
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.menu}
                </Link>
              </li>
              <li>
                <Link to="/career" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.career}
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.feedback}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">{t.footer.termsTitle}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-500 hover:text-white text-sm transition-colors">
                  {t.footer.cookiePolicy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 text-center">
          <p className="text-gray-600 text-sm">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
