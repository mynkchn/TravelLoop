import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { budget } from '../lib/api';

export default function BudgetBreakdown() {
  const { tripId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    budget.get(tripId)
      .then(setData)
      .catch(() => setError('Failed to load budget'))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Failed to load budget'}
        </div>
      </div>
    );
  }

  const totalSpent = data.transport_total + data.accommodation_total + data.meals_total + data.activities_total;
  const percentUsed = data.total_budget > 0 ? (totalSpent / data.total_budget) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/trips/${tripId}`} className="text-purple-600 hover:text-purple-700 text-sm">
        ← Back to Trip
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-8">Budget Breakdown</h1>

      {/* Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-gray-500 text-sm">Total Budget</div>
            <div className="text-2xl font-bold text-gray-900">${data.total_budget}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm">Estimated</div>
            <div className="text-2xl font-bold text-purple-600">${data.total_estimated.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm">Spent</div>
            <div className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-sm">Remaining</div>
            <div className={`text-2xl font-bold ${data.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${data.remaining.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Budget Used</span>
            <span className="font-medium">{percentUsed.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                percentUsed > 100 ? 'bg-red-500' : percentUsed > 80 ? 'bg-yellow-500' : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl mb-1">🚗</div>
          <div className="text-gray-500 text-sm">Transport</div>
          <div className="font-bold text-gray-900">${data.transport_total.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl mb-1">🏨</div>
          <div className="text-gray-500 text-sm">Accommodation</div>
          <div className="font-bold text-gray-900">${data.accommodation_total.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl mb-1">🍽️</div>
          <div className="text-gray-500 text-sm">Meals</div>
          <div className="font-bold text-gray-900">${data.meals_total.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-gray-500 text-sm">Activities</div>
          <div className="font-bold text-gray-900">${data.activities_total.toFixed(2)}</div>
        </div>
      </div>

      {/* Per stop */}
      {data.per_stop?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Cost by City</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">City</th>
                  <th className="text-right py-2 font-medium text-gray-600">🚗</th>
                  <th className="text-right py-2 font-medium text-gray-600">🏨</th>
                  <th className="text-right py-2 font-medium text-gray-600">🍽️</th>
                  <th className="text-right py-2 font-medium text-gray-600">🎯</th>
                  <th className="text-right py-2 font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.per_stop.map((stop) => (
                  <tr key={stop.stop_id} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{stop.city}</td>
                    <td className="text-right py-2">${stop.transport.toFixed(2)}</td>
                    <td className="text-right py-2">${stop.accommodation.toFixed(2)}</td>
                    <td className="text-right py-2">${stop.meals.toFixed(2)}</td>
                    <td className="text-right py-2">${stop.activities.toFixed(2)}</td>
                    <td className="text-right py-2 font-bold">${stop.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}