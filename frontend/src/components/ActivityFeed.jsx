import React, { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext.jsx';

export default function ActivityFeed() {
  const { recentActivity } = useRealtime();
  const [filter, setFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'student:registered':
        return '👤';
      case 'entry:created':
        return '📝';
      case 'entry:statusChanged':
        return '✅';
      case 'comment:added':
        return '💬';
      case 'task:assigned':
        return '📋';
      case 'schedule:created':
      case 'schedule:updated':
        return '📅';
      default:
        return '🔔';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'student:registered':
        return 'text-blue-600';
      case 'entry:created':
        return 'text-purple-600';
      case 'entry:statusChanged':
        return 'text-green-600';
      case 'comment:added':
        return 'text-pink-600';
      case 'task:assigned':
        return 'text-orange-600';
      case 'schedule:created':
      case 'schedule:updated':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredActivity = filter === 'all' 
    ? recentActivity 
    : recentActivity.filter(a => a.type === filter);

  const activityTypes = [
    { value: 'all', label: 'All Activity' },
    { value: 'student:registered', label: 'New Students' },
    { value: 'entry:created', label: 'New Entries' },
    { value: 'entry:statusChanged', label: 'Status Changes' },
    { value: 'comment:added', label: 'Feedback' },
    { value: 'task:assigned', label: 'Tasks' },
    { value: 'schedule:created', label: 'Schedules' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {filteredActivity.length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronDown
            size={20}
            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <>
          {/* Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No activity yet</p>
              </div>
            ) : (
              filteredActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xl ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
