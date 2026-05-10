import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <span className="text-xl font-bold text-purple-600">TravelLoop</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/trips" className="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                  My Trips
                </Link>
                <Link to="/create-trip" className="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                  Create
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-600">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-purple-600 px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}