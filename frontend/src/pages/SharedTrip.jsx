import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trips } from '../lib/api';

export default function SharedTrip() {
  const { slug } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    trips.publicBySlug(slug)
      .then(setTrip)
      .catch(() => setError('This trip is not available or has been made private.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Trip not found'}
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-purple-600 hover:text-purple-700">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mb-4">
          ✨ Public Trip
        </span>
        <h1 className="text-4xl font-bold text-gray-900">{trip.name}</h1>
        {trip.description && (
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{trip.description}</p>
        )}
        <div className="flex items-center justify-center gap-4 mt-4 text-gray-500">
          {trip.start_date && (
            <span>📅 {new Date(trip.start_date).toLocaleDateString()}</span>
          )}
          {trip.end_date && <span>→ {new Date(trip.end_date).toLocaleDateString()}</span>}
          <span>💰 ${trip.total_budget}</span>
        </div>
      </div>

      {/* Timeline */}
      {trip.stops?.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          This trip has no destinations yet.
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-purple-200" />

          <div className="space-y-6">
            {trip.stops?.map((stop, index) => (
              <div key={stop.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-8 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">
                  {index + 1}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{stop.city?.name || 'Unknown'}</h3>
                      <p className="text-gray-500">{stop.city?.country}</p>
                    </div>
                    {stop.arrival_date && (
                      <span className="text-sm text-gray-500">
                        {new Date(stop.arrival_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {stop.notes && (
                    <p className="text-gray-600 text-sm mt-2">📝 {stop.notes}</p>
                  )}

                  <div className="flex gap-3 mt-2 text-sm text-gray-500">
                    {stop.accommodation_cost > 0 && <span>🏨 ${stop.accommodation_cost}</span>}
                    {stop.transport_cost > 0 && <span>🚗 ${stop.transport_cost}</span>}
                    {stop.meal_cost > 0 && <span>🍽️ ${stop.meal_cost}</span>}
                  </div>

                  {stop.stop_activities?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-1">Planned Activities:</p>
                      <div className="space-y-1">
                        {stop.stop_activities.map((sa) => (
                          <div key={sa.id} className="text-sm text-gray-600">
                            {sa.scheduled_time && <span className="mr-2">{sa.scheduled_time}</span>}
                            {sa.activity?.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-500 text-sm">Created with TravelLoop</p>
        <Link to="/signup" className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block">
          Create your own trip →
        </Link>
      </div>
    </div>
  );
}