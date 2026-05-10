import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { trips } from '../lib/api';
import { SkeletonList, EmptyState, Spinner } from '../components/Loading';

export default function Dashboard() {
  const { user } = useAuth();
  const [myTrips, setMyTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([trips.list(), trips.public()])
      .then(([mine, publicData]) => {
        setMyTrips(mine);
        setPublicTrips(publicData.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}! 👋
        </h1>
        <p className="text-gray-500 mt-2">What adventure are you planning next?</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { to: '/create-trip', icon: '➕', title: 'New Trip', desc: 'Start planning' },
          { to: '/trips', icon: '🗺️', title: 'My Trips', desc: `${myTrips.length} trips` },
          { to: '/cities', icon: '🌍', title: 'Explore', desc: 'Find destinations' },
        ].map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="stagger-item bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group card-hover"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="font-semibold text-gray-900">{item.title}</div>
            <div className="text-sm text-gray-500">{item.desc}</div>
          </Link>
        ))}
      </div>

      {/* My trips */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Recent Trips</h2>
          {myTrips.length > 0 && (
            <Link to="/trips" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View all →
            </Link>
          )}
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : myTrips.length === 0 ? (
          <EmptyState
            icon="🗺️"
            title="No trips yet"
            message="Create your first trip to start planning your adventure"
            action={
              <Link to="/create-trip" className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700">
                Create Your First Trip
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTrips.slice(0, 3).map((trip, i) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="stagger-item bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all card-hover"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{trip.name}</h3>
                  {trip.is_public && (
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {trip.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">📍 {trip.destination_count}</span>
                  <span className="flex items-center gap-1">💰 ${trip.total_budget}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Public trips */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Explore Public Trips</h2>
        {loading ? (
          <SkeletonList count={3} />
        ) : publicTrips.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No public trips available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicTrips.map((trip, i) => (
              <Link
                key={trip.id}
                to={`/shared/${trip.public_slug}`}
                className="stagger-item bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all card-hover"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{trip.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                  {trip.description || 'No description'}
                </p>
                <div className="text-sm text-gray-400">📍 {trip.destination_count} cities</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}