import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { trips, budget } from '../lib/api';
import { useToast } from '../components/Toast';
import { PageLoader, Spinner } from '../components/Loading';

export default function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('itinerary');
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    Promise.all([trips.get(tripId), budget.get(tripId).catch(() => null)])
      .then(([tripData, budgetData]) => {
        setTrip(tripData);
        setBudgetData(budgetData);
      })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [tripId, navigate]);

  const handleShare = async () => {
    try {
      const result = await trips.share(tripId);
      setTrip({ ...trip, is_public: true, public_slug: result.public_slug });
      showSuccess('Trip is now public!');
    } catch (err) {
      showError('Failed to share trip');
    }
  };

  const handleUnshare = async () => {
    try {
      await trips.unshare(tripId);
      setTrip({ ...trip, is_public: false });
      showSuccess('Trip is now private');
    } catch (err) {
      showError('Failed to unshare trip');
    }
  };

  if (loading) return <PageLoader />;
  if (!trip) return null;

  const totalSpent = budgetData
    ? budgetData.transport_total + budgetData.accommodation_total + budgetData.meals_total + budgetData.activities_total
    : 0;

  const tabs = [
    { key: 'itinerary', label: 'Itinerary', icon: '🗺️' },
    { key: 'budget', label: 'Budget', icon: '💰' },
    { key: 'checklist', label: 'Packing', icon: '📦' },
    { key: 'notes', label: 'Notes', icon: '📝' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link to="/trips" className="inline-flex items-center gap-1 text-gray-500 hover:text-purple-600 text-sm mb-4">
        ← Back to My Trips
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
          <span className="text-6xl">✈️</span>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
              <p className="text-gray-500 mt-1">{trip.description || 'No description'}</p>
            </div>
            <div className="flex gap-2">
              {trip.is_public ? (
                <button onClick={handleUnshare} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all btn-press">
                  Make Private
                </button>
              ) : (
                <button onClick={handleShare} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all hover:shadow-lg btn-press">
                  Share Trip
                </button>
              )}
              <Link
                to={`/trips/${tripId}/itinerary`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all btn-press"
              >
                Edit
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {trip.start_date && (
              <span className="flex items-center gap-1">📅 {new Date(trip.start_date).toLocaleDateString()}{trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}</span>
            )}
            <span className="flex items-center gap-1">💰 Budget: ${trip.total_budget}</span>
            <span className="flex items-center gap-1">📍 {trip.stops?.length || 0} cities</span>
            {trip.is_public && <span className="text-green-600">🌐 Public</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
              tab === t.key
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'itinerary' && (
          <div>
            {trip.stops?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">🗺️</div>
                <p className="text-gray-500 mb-4">No cities added to your itinerary yet.</p>
                <Link to={`/trips/${tripId}/itinerary`} className="inline-block px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                  Add Cities
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trip.stops?.map((stop, index) => (
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
                    </div>
                    {stop.stop_activities?.length > 0 && (
                      <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {stop.stop_activities.length} activities
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'budget' && budgetData && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Budget', value: `$${budgetData.total_budget}`, color: 'gray' },
                { label: 'Estimated', value: `$${budgetData.total_estimated.toFixed(0)}`, color: 'purple' },
                { label: 'Spent', value: `$${totalSpent.toFixed(0)}`, color: 'gray' },
                { label: 'Remaining', value: `$${budgetData.remaining.toFixed(0)}`, color: budgetData.remaining >= 0 ? 'green' : 'red' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <div className="text-gray-500 text-sm">{item.label}</div>
                  <div className={`text-2xl font-bold ${
                    item.color === 'purple' ? 'text-purple-600' :
                    item.color === 'green' ? 'text-green-600' :
                    item.color === 'red' ? 'text-red-600' : 'text-gray-900'
                  }`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🚗', label: 'Transport', value: budgetData.transport_total },
                { icon: '🏨', label: 'Accommodation', value: budgetData.accommodation_total },
                { icon: '🍽️', label: 'Meals', value: budgetData.meals_total },
                { icon: '🎯', label: 'Activities', value: budgetData.activities_total },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <div className="text-gray-500 text-sm">{item.label}</div>
                    <div className="font-semibold text-gray-900">${item.value.toFixed(0)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to={`/trips/${tripId}/budget`} className="text-purple-600 hover:text-purple-700 font-medium">
                View detailed breakdown →
              </Link>
            </div>
          </div>
        )}

        {tab === 'checklist' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">Manage your packing list</p>
            <Link to={`/trips/${tripId}/checklist`} className="inline-block px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
              Open Packing List
            </Link>
          </div>
        )}

        {tab === 'notes' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">Document your trip memories</p>
            <Link to={`/trips/${tripId}/notes`} className="inline-block px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
              Open Travel Journal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}