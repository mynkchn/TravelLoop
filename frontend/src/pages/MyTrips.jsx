import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trips } from '../lib/api';
import { useToast } from '../components/Toast';
import { SkeletonList, EmptyState } from '../components/Loading';

export default function MyTrips() {
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    trips.list()
      .then(setAllTrips)
      .catch(() => showError('Failed to load trips'))
      .finally(() => setLoading(false));
  }, [showError]);

  const filteredTrips = allTrips.filter((trip) => {
    if (filter === 'public') return trip.is_public;
    if (filter === 'private') return !trip.is_public;
    return true;
  });

  const handleDelete = async (tripId, e) => {
    e.preventDefault();
    if (!confirm('Delete this trip? This cannot be undone.')) return;

    try {
      await trips.delete(tripId);
      setAllTrips(allTrips.filter((t) => t.id !== tripId));
      showSuccess('Trip deleted');
    } catch (err) {
      showError('Failed to delete trip');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500 mt-1">Manage and organize your adventures</p>
        </div>
        <Link
          to="/create-trip"
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-200 btn-press"
        >
          + Create Trip
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'all', label: 'All', count: allTrips.length },
          { key: 'public', label: 'Public', count: allTrips.filter((t) => t.is_public).length },
          { key: 'private', label: 'Private', count: allTrips.filter((t) => !t.is_public).length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === f.key
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-75">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Trips grid */}
      {loading ? (
        <SkeletonList count={6} />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title={filter === 'all' ? 'No trips yet' : `No ${filter} trips`}
          message={filter === 'all' ? 'Create your first trip to start planning' : `You don't have any ${filter} trips yet`}
          action={
            filter === 'all' && (
              <Link to="/create-trip" className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700">
                Create Your First Trip
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip, i) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="stagger-item bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all card-hover group block relative"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-t-2xl flex items-center justify-center">
                <span className="text-5xl">✈️</span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{trip.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    trip.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {trip.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {trip.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>📍 {trip.destination_count} cities</span>
                  <span>💰 ${trip.total_budget}</span>
                </div>
                {trip.start_date && (
                  <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                    📅 {new Date(trip.start_date).toLocaleDateString()}
                    {trip.end_date && ` → ${new Date(trip.end_date).toLocaleDateString()}`}
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(trip.id, e)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-lg shadow-sm"
                title="Delete trip"
              >
                🗑️
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}