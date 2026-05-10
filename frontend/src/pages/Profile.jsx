import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { user } from '../lib/api';

export default function Profile() {
  const { user: authUser, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: authUser?.name || '',
    photo_url: authUser?.photo_url || '',
    language: authUser?.language || 'en',
  });

  // Password change state
  const [showPassword, setShowPassword] = useState(false);
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUser(form);
      setSuccess('Profile updated!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (passForm.new !== passForm.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (passForm.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await user.changePassword(passForm.old, passForm.new);
      setSuccess('Password changed!');
      setShowPassword(false);
      setPassForm({ old: '', new: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={authUser?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
            <input
              type="url"
              value={form.photo_url}
              onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            {showPassword ? 'Cancel' : 'Change'}
          </button>
        </div>

        {showPassword && (
          <form onSubmit={handlePassword}>
            <div className="mb-3">
              <input
                type="password"
                value={passForm.old}
                onChange={(e) => setPassForm({ ...passForm, old: e.target.value })}
                placeholder="Current password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                value={passForm.new}
                onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                placeholder="New password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={passForm.confirm}
                onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session</h2>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}