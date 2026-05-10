import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-white">
      {/* Hero with floating shapes */}
      <div className="relative overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute right-20 top-40 w-48 h-48 bg-indigo-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-200 rounded-full opacity-30 blur-3xl"></div>

        <div className="max-w-5xl mx-auto px-4 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>✈️</span> Plan your perfect trip
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            TravelLoop
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create beautiful itineraries, track your budget, manage packing lists, and document your adventures.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-200 btn-press"
            >
              Start Planning Free
            </Link>
            <Link
              to="/cities"
              className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all hover:border-gray-300 btn-press"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🗺️', title: 'Itinerary Builder', desc: 'Plan stops, dates, and activities for each destination' },
            { icon: '💰', title: 'Budget Tracker', desc: 'Keep track of all expenses and stay on budget' },
            { icon: '📝', title: 'Travel Journal', desc: 'Document memories with notes from your trip' },
          ].map((item, i) => (
            <div
              key={i}
              className="stagger-item bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to start your journey?</h2>
          <p className="text-purple-100 mb-6">Join travelers planning their dream trips</p>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Made with ❤️ for travelers</p>
        </div>
      </footer>
    </div>
  );
}