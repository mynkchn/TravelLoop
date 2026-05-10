import { useState, useEffect } from 'react';
import { cities } from '../lib/api';

export default function CitySearch() {
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    cities.popular(20)
      .then(setAllCities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await cities.search({ q: search, country: country || undefined, limit: 50 });
      setAllCities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore Cities</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cities..."
            className="px-4 py-2.5 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Filter by country..."
            className="px-4 py-2.5 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {allCities.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500">
          No cities found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCities.map((city) => (
            <div key={city.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl">🌆</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{city.name}</h3>
                  <p className="text-gray-500 text-sm">{city.country}</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {city.cost_index}x cost
                </span>
              </div>
              {city.description && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{city.description}</p>
              )}
              {city.region && (
                <p className="text-gray-400 text-xs mt-2">📍 {city.region}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}