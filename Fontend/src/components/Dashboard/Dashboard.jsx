import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const mockUpcoming = [
  {
    id: "1",
    topic: "AI in Healthcare",
    scheduledTime: "2024-06-12T10:00:00.000Z",
    participants: 4,
    aiParticipants: 2,
    status: "upcoming",
    category: "Technology",
  },
  {
    id: "2",
    topic: "Future of Remote Work",
    scheduledTime: "2024-06-15T14:00:00.000Z",
    participants: 1,
    aiParticipants: 3,
    status: "upcoming",
    category: "Business",
  },
];

const mockPast = [
  {
    id: "3",
    topic: "Sustainable Energy Solutions",
    date: "2024-06-01",
    feedback: "Great participation! Try to be more concise.",
    reportId: "rpt1",
    rating: 4.5,
    participants: 5,
  },
  {
    id: "4",
    topic: "Digital Transformation",
    date: "2024-05-28",
    feedback: "Excellent discussion flow and insights.",
    reportId: "rpt2",
    rating: 4.8,
    participants: 7,
  },
];

const mockInvites = [
  {
    id: "5",
    email: "bob@example.com",
    sessionTopic: "AI in Healthcare",
    status: "Accepted",
    date: "2024-06-10",
  },
  {
    id: "6",
    email: "sarah@example.com",
    sessionTopic: "Future of Remote Work",
    status: "Pending",
    date: "2024-06-11",
  },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "badge-success";
      case "Pending":
        return "badge-warning";
      case "Declined":
        return "badge-error";
      default:
        return "badge-info";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-screen-2xl mx-auto py-16 px-6 sm:px-12 lg:px-20">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening with your AI Group Discussion sessions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SessionList sessions={mockUpcoming} formatDate={formatDate} />
          </div>
          <div className="space-y-6">
            <ProfileCard user={user} />
            <RecentActivity />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <PastSessions sessions={mockPast} />
          <InviteHistory
            invites={mockInvites}
            getStatusColor={getStatusColor}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, emoji, color }) => (
  <div className="card card-hover p-6">
    <div className="flex items-center">
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ProfileCard = ({ user }) => (
  <div className="card p-6">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-lg">
          {user.name?.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="ml-3">
        <h3 className="font-semibold text-gray-900">{user.name}</h3>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
    </div>
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          AI API Key
        </label>
        <div className="relative">
          <input
            type="password"
            value="sk-xxxxxx"
            className="input-field pr-10"
            readOnly
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            👁️
          </button>
        </div>
      </div>
      <Link to="/profile" className="btn-secondary w-full text-center">
        Edit Profile
      </Link>
    </div>
  </div>
);

const SessionList = ({ sessions, formatDate }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
      <Link to="/session/create" className="btn-primary text-sm">
        Create New Session
      </Link>
    </div>
    {sessions.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🗕️</div>
        <p className="text-gray-500 mb-4">No upcoming sessions scheduled</p>
        <Link to="/session/create" className="btn-primary">
          Schedule Your First Session
        </Link>
      </div>
    ) : (
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className="card card-hover p-4 slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="badge badge-info">{session.category}</span>
                  <span className="text-sm text-gray-500">
                    • {formatDate(session.scheduledTime)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {session.topic}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>👥 {session.participants} participants</span>
                  <span>🤖 {session.aiParticipants} AI</span>
                </div>
              </div>
              <Link
                to={`/session/${session.id}`}
                className="btn-primary text-sm ml-4"
              >
                Join Session
              </Link>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RecentActivity = () => (
  <div className="card p-6">
    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-3">
      <ActivityDot color="green" text='Session "AI in Healthcare" scheduled' />
      <ActivityDot color="blue" text="Bob accepted your invite" />
      <ActivityDot color="purple" text="Feedback report generated" />
    </div>
  </div>
);

const ActivityDot = ({ color, text }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

const PastSessions = ({ sessions }) => (
  <div className="card p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-6">
      Past Sessions & Feedback
    </h2>
    {sessions.length === 0 ? (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-500">No past sessions yet</p>
      </div>
    ) : (
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{session.topic}</h3>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">{session.rating}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {session.date} • {session.participants} participants
            </div>
            <p className="text-sm text-green-700 mb-2">{session.feedback}</p>
            <Link
              to={`/report/${session.reportId}`}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View Detailed Report →
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
);

const InviteHistory = ({ invites, getStatusColor }) => (
  <div className="card p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-6">Invite History</h2>
    {invites.length === 0 ? (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📧</div>
        <p className="text-gray-500">No invites sent yet</p>
      </div>
    ) : (
      <div className="space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900">{invite.email}</div>
              <div className="text-sm text-gray-600">
                Session: {invite.sessionTopic}
              </div>
              <div className="text-xs text-gray-500">{invite.date}</div>
            </div>
            <span className={`badge ${getStatusColor(invite.status)}`}>
              {invite.status}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Dashboard;
