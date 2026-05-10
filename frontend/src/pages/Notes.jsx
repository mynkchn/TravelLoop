import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { notes } from '../lib/api';

export default function Notes() {
  const { tripId } = useParams();
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    notes.list(tripId)
      .then(setAllNotes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleOpen = (note = null) => {
    if (note) {
      setEditingNote(note);
      setForm({ title: note.title || '', content: note.content });
    } else {
      setEditingNote(null);
      setForm({ title: '', content: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;

    try {
      if (editingNote) {
        const updated = await notes.update(editingNote.id, { title: form.title || null, content: form.content });
        setAllNotes(allNotes.map((n) => (n.id === editingNote.id ? updated : n)));
      } else {
        const newNote = await notes.create(tripId, { title: form.title || null, content: form.content });
        setAllNotes([newNote, ...allNotes]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    try {
      await notes.delete(noteId);
      setAllNotes(allNotes.filter((n) => n.id !== noteId));
    } catch (err) {
      alert(err.message);
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={`/trips/${tripId}`} className="text-purple-600 hover:text-purple-700 text-sm">
        ← Back to Trip
      </Link>
      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Travel Journal</h1>
        <button onClick={() => handleOpen()} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
          + New Note
        </button>
      </div>

      {allNotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">No journal entries yet.</p>
          <button onClick={() => handleOpen()} className="inline-block px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
            Write Your First Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {allNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {note.title && <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>}
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-gray-400 text-sm mt-3">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleOpen(note)} className="text-gray-400 hover:text-purple-600">✏️</button>
                  <button onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingNote ? 'Edit Note' : 'New Journal Entry'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title (optional)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write about your trip..."
                rows={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}