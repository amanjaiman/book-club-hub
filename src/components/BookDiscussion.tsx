import { useState } from 'react';
import { useBookClub } from '../contexts/BookClubContext';
import { format } from 'date-fns';

export default function BookDiscussion() {
  const { currentBook, addDiscussionTopic, stopReading } = useBookClub();
  const [newTopic, setNewTopic] = useState('');

  if (!currentBook || currentBook.status !== 'reading') {
    return null;
  }

  const nextMeeting = currentBook.meetings
    .filter(m => new Date(`${m.date}T${m.startTime}`) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    addDiscussionTopic(newTopic.trim());
    setNewTopic('');
  };

  return (
    <div className="space-y-8">
      <div className="glass-card">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              Currently Reading
            </h2>
            <h3 className="text-xl font-medium text-surface-900 mb-4">{currentBook.title}</h3>
          </div>
          <button onClick={stopReading} className="btn-surface">
            Stop Reading
          </button>
        </div>

        {nextMeeting && (
          <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <h4 className="text-sm font-medium text-primary-900 mb-1">Next Meeting</h4>
            <p className="text-lg font-medium text-primary-700">
              {format(new Date(nextMeeting.date), 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-primary-600">
              {nextMeeting.startTime} - {nextMeeting.endTime}
              {nextMeeting.location && ` • ${nextMeeting.location}`}
            </p>
            {nextMeeting.notes && (
              <p className="mt-2 text-sm text-primary-600">{nextMeeting.notes}</p>
            )}
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-medium text-surface-700 mb-2">All Meetings</h4>
          <div className="space-y-2">
            {currentBook.meetings.map((meeting, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  meeting === nextMeeting
                    ? 'bg-primary-50 border-primary-100'
                    : 'bg-white/50 border-surface-200/50'
                }`}
              >
                <p className="font-medium text-surface-900">
                  {format(new Date(`${meeting.date}T${meeting.startTime}`), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-surface-600">
                  {meeting.startTime} - {meeting.endTime}
                  {meeting.location && ` • ${meeting.location}`}
                </p>
                {meeting.notes && (
                  <p className="mt-1 text-sm text-surface-500">{meeting.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          Discussion Topics
        </h3>

        <form onSubmit={handleAddTopic} className="flex gap-3 mb-6">
          <input
            type="text"
            className="input flex-1"
            placeholder="Add a discussion topic..."
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            Add Topic
          </button>
        </form>

        <div className="space-y-4">
          {currentBook.discussionTopics.length === 0 ? (
            <p className="text-surface-500 text-center py-8">
              No discussion topics yet. Be the first to add one!
            </p>
          ) : (
            currentBook.discussionTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-surface-200/50"
              >
                <p className="text-surface-900 mb-2">{topic.text}</p>
                <p className="text-sm text-surface-500">
                  Added {format(new Date(topic.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 