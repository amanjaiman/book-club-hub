import { useState } from 'react';
import { useBookClub } from '../contexts/BookClubContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Meeting {
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  targetPage: number;
}

export default function BookSetup() {
  const { user } = useAuth();
  const { currentBook, updateBookSetup, startReading } = useBookClub();
  const [meetings, setMeetings] = useState<Meeting[]>(currentBook?.meetings || []);
  const [newMeeting, setNewMeeting] = useState<Meeting>({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '19:00',
    endTime: '20:00',
    location: '',
    notes: '',
    targetPage: currentBook?.pageCount || 0
  });

  if (!currentBook || currentBook.status !== 'setup' || !user) return null;

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMeetings = [...meetings, newMeeting].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setMeetings(updatedMeetings);
    updateBookSetup(currentBook.id, updatedMeetings);
    setNewMeeting({
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '19:00',
      endTime: '20:00',
      location: '',
      notes: '',
      targetPage: currentBook.pageCount
    });
  };

  const handleRemoveMeeting = (index: number) => {
    const updatedMeetings = meetings.filter((_, i) => i !== index);
    setMeetings(updatedMeetings);
    updateBookSetup(currentBook.id, updatedMeetings);
  };

  const canStartReading = meetings.length > 0;

  return (
    <div className="space-y-8">
      <div className="glass-card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              Setup Book Club Meetings
            </h2>
            <h3 className="text-xl font-medium text-surface-900">{currentBook.title}</h3>
          </div>
          {canStartReading && (
            <button onClick={startReading} className="btn-primary">
              Start Reading
            </button>
          )}
        </div>

        <form onSubmit={handleAddMeeting} className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                className="input"
                value={newMeeting.startTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="time"
                className="input"
                value={newMeeting.endTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                className="input"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="label">Target Page</label>
              <input
                type="number"
                className="input"
                min="1"
                max={currentBook.pageCount}
                value={newMeeting.targetPage}
                onChange={(e) => setNewMeeting({ ...newMeeting, targetPage: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input
              type="text"
              className="input"
              value={newMeeting.notes}
              onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
              placeholder="Optional meeting notes..."
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Add Meeting
          </button>
        </form>
      </div>

      {meetings.length > 0 && (
        <div className="glass-card">
          <h3 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            Scheduled Meetings
          </h3>
          <div className="space-y-4">
            {meetings.map((meeting, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-surface-200/50"
              >
                <div className="space-y-1">
                  <p className="font-medium text-surface-900">
                    {format(new Date(`${meeting.date}T${meeting.startTime}`), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-surface-600">
                    {meeting.startTime} - {meeting.endTime}
                    {meeting.location && ` • ${meeting.location}`}
                  </p>
                  {meeting.notes && (
                    <p className="text-sm text-surface-500">{meeting.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveMeeting(index)}
                  className="text-surface-400 hover:text-red-500 transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 