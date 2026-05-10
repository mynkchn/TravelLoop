import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { checklist } from '../lib/api';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'toiletries', 'other'];

export default function PackingChecklist() {
  const { tripId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('other');

  useEffect(() => {
    checklist.list(tripId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const item = await checklist.create(tripId, { item_name: newItem, category: newCategory });
      setItems([...items, item]);
      setNewItem('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggle = async (item) => {
    try {
      const updated = await checklist.update(item.id, { is_packed: !item.is_packed });
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await checklist.delete(itemId);
      setItems(items.filter((i) => i.id !== itemId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all items?')) return;
    try {
      await checklist.reset(tripId);
      setItems(items.map((i) => ({ ...i, is_packed: false })));
    } catch (err) {
      alert(err.message);
    }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});

  const packedCount = items.filter((i) => i.is_packed).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/trips/${tripId}`} className="text-purple-600 hover:text-purple-700 text-sm">
        ← Back to Trip
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-6">Packing Checklist</h1>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Packing Progress</span>
          <span className="font-medium">{packedCount} / {items.length} items</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="h-2 rounded-full bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && <p className="text-green-600 text-sm mt-2">All packed! ✈️</p>}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex gap-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
          Add
        </button>
      </form>

      {/* Items */}
      {items.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          No items yet
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const catItems = grouped[cat];
            if (!catItems.length) return null;
            return (
              <div key={cat} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 capitalize">
                    {cat === 'clothing' && '👕'}{cat === 'documents' && '📄'}{cat === 'electronics' && '🔌'}{cat === 'toiletries' && '🧴'}{cat === 'other' && '📦'} {cat}
                  </h3>
                  <span className="text-sm text-gray-500">{catItems.filter((i) => i.is_packed).length}/{catItems.length}</span>
                </div>
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.is_packed ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                        }`}
                      >
                        {item.is_packed && <span className="text-white text-xs">✓</span>}
                      </button>
                      <span className={`flex-1 ${item.is_packed ? 'line-through text-gray-400' : ''}`}>
                        {item.item_name}
                      </span>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6 text-center">
          <button onClick={handleReset} className="text-gray-500 hover:text-gray-700 text-sm">
            Reset all items
          </button>
        </div>
      )}
    </div>
  );
}