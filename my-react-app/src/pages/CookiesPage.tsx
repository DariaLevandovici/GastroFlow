import { useApp } from '../context/AppContext';

export function CookiesPage() {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">{t.legal.cookiesTitle}</h1>
        <div className="bg-[#242424] rounded-2xl p-8 border border-gray-800 text-gray-300 space-y-4">
          <p>
            {t.legal.cookiesIntro}
          </p>
          <p>
            {t.legal.cookiesBody}
          </p>
        </div>
      </div>
    </div>
  );
}
