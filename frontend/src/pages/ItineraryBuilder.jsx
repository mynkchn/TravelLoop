import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { trips, stops, cities } from '../lib/api';
import { useToast } from '../components/Toast';
import { PageLoader, EmptyState } from '../components/Loading';

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [allStops, setAllStops] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    Promise.all([trips.get(tripId), stops.list(tripId), cities.popular(20)])
      .then(([tripData, stopsData, citiesData]) => {
        setTrip(tripData);
        setAllStops(stopsData);
        setPopularCities(citiesData);
      })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [tripId, navigate]);

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const results = await cities.search({ q: query, limit: 10 });
      setSearchResults(results);
    } catch (err) { console.error(err); }
  };

  const handleAddStop = async (cityId) => {
    try {
      const newStop = await stops.create(tripId, { city_id: cityId, order_index: allStops.length });
      setAllStops([...allStops, newStop]);
      setShowModal(false);
      setSearch('');
      setSearchResults([]);
      showSuccess('City added!');
    } catch (err) { showError(err.message); }
  };

  const handleEditStop = (stop) => {
    setSelectedStop(stop);
    setEditForm({
      arrival_date: stop.arrival_date?.split('T')[0] || '',
      departure_date: stop.departure_date?.split('T')[0] || '',
      accommodation_cost: stop.accommodation_cost || '',
      transport_cost: stop.transport_cost || '',
      meal_cost: stop.meal_cost || '',
      notes: stop.notes || '',
    });
  };

  const handleSaveStop = async () => {
    try {
      const updated = await stops.update(selectedStop.id, {
        arrival_date: editForm.arrival_date || null,
        departure_date: editForm.departure_date || null,
        accommodation_cost: parseFloat(editForm.accommodation_cost) || 0,
        transport_cost: parseFloat(editForm.transport_cost) || 0,
        meal_cost: parseFloat(editForm.meal_cost) || 0,
        notes: editForm.notes || null,
      });
      setAllStops(allStops.map((s) => (s.id === selectedStop.id ? updated : s)));
      setSelectedStop(null);
      showSuccess('Stop updated!');
    } catch (err) { showError(err.message); }
  };

  const handleDeleteStop = async (stopId) => {
    if (!confirm('Remove this city?')) return;
    try {
      await stops.delete(stopId);
      setAllStops(allStops.filter((s) => s.id !== stopId));
      setSelectedStop(null);
      showSuccess('City removed');
    } catch (err) { showError(err.message); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={`/trips/${tripId}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-purple-600 text-sm mb-4">
        ← Back to Trip
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{trip?.name}</h1>
          <p className="text-gray-500 mt-1">Plan your itinerary</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg btn-press"
        >
          + Add City
        </button>
      </div>

      {/* Stops list */}
      {allStops.length === 0 ? (
        <EmptyState
          icon="🌆"
          title="No cities yet"
          message="Add cities to build your itinerary"
          action={
            <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
              Add Your First City
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {allStops.map((stop, index) => (
            <div key={stop.id} className="stagger-item bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{stop.city?.name || 'Unknown'}</h3>
                <span className="text-gray-500 text-sm">{stop.city?.country}</span>
                {stop.arrival_date && (
                  <p className="text-gray-400 text-sm">
                    {new Date(stop.arrival_date).toLocaleDateString()}
                    {stop.departure_date && ` → ${new Date(stop.departure_date).toLocaleDateString()}`}
                  </p>
                )}
                <div className="flex gap-3 mt-1 text-sm text-gray-500">
                  {stop.accommodation_cost > 0 && <span>🏨 ${stop.accommodation_cost}</span>}
                  {stop.transport_cost > 0 && <span>🚗 ${stop.transport_cost}</span>}
                  {stop.meal_cost > 0 && <span>🍽️ ${stop.meal_cost}</span>}
                </div>
              </div>
              <button
                onClick={() => handleEditStop(stop)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all btn-press"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add City Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add City</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search cities..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                autoFocus
              />
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleAddStop(city.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-purple-50 border border-gray-100 hover:border-purple-200 transition-all"
                    >
                      <span className="font-medium text-gray-900">{city.name}</span>
                      <span className="text-gray-500 ml-2">- {city.country}</span>
                    </button>
                  ))}
                </div>
              ) : search.length >= 2 ? (
                <p className="text-gray-500 text-center py-4">No cities found</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm mb-2">Popular cities:</p>
                  {popularCities.slice(0, 8).map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleAddStop(city.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-purple-50 border border-gray-100 hover:border-purple-200 transition-all"
                    >
                      <span className="font-medium text-gray-900">{city.name}</span>
                      <span className="text-gray-500 ml-2">- {city.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Stop Modal */}
      {selectedStop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit {selectedStop.city?.name}</h2>
              <button onClick={() => setSelectedStop(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival</label>
                  <input type="date" value={editForm.arrival_date} onChange={(e) => setEditForm({ ...editForm, arrival_date: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                  <input type="date" value={editForm.departure_date} onChange={(e) => setEditForm({ ...editForm, departure_date: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accom ($)</label>
                  <input type="number" value={editForm.accommodation_cost} onChange={(e) => setEditForm({ ...editForm, accommodation_cost: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transport ($)</label>
                  <input type="number" value={editForm.transport_cost} onChange={(e) => setEditForm({ ...editForm, transport_cost: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meals ($)</label>
                  <input type="number" value={editForm.meal_cost} onChange={(e) => setEditForm({ ...editForm, meal_cost: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveStop} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all btn-press">
                  Save Changes
                </button>
                <button onClick={() => handleDeleteStop(selectedStop.id)} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-all">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}