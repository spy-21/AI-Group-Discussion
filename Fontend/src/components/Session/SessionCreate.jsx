import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SessionCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    topic: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    participantConfig: "2ai2real",
    category: "Technology",
    maxParticipants: "4",
  });
  const [created, setCreated] = useState(false);
  const [sessionLink, setSessionLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user token
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Create session with backend
      const sessionData = {
        topic: form.topic,
        description: form.description,
        category: form.category,
        date: form.date,
        time: form.time,
        duration: form.duration,
        participantConfig: form.participantConfig,
        maxParticipants: form.maxParticipants,
        createdBy: user.id,
      };

      const response = await fetch(
        "http://localhost:5000/api/sessions/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sessionData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const result = await response.json();

      // Store session data in localStorage for the SessionRoom to access
      localStorage.setItem(
        `session_${result.session.id}`,
        JSON.stringify(sessionData)
      );

      setCreated(true);
      setSessionLink(window.location.origin + "/session/" + result.session.id);
      setLoading(false);
    } catch (error) {
      console.error("Error creating session:", error);
      setLoading(false);
    }
  };

  const getParticipantSummary = () => {
    const configs = {
      "2ai2real": { ai: 2, real: 2 },
      "1ai3real": { ai: 1, real: 3 },
      "3ai1real": { ai: 3, real: 1 },
      "4real": { ai: 0, real: 4 },
    };
    return configs[form.participantConfig] || { ai: 2, real: 2 };
  };

  const summary = getParticipantSummary();

  const categories = [
    { value: "Technology", icon: "💻", color: "blue" },
    { value: "Business", icon: "💼", color: "green" },
    { value: "Healthcare", icon: "🏥", color: "red" },
    { value: "Education", icon: "📚", color: "purple" },
    { value: "Environment", icon: "🌱", color: "emerald" },
    { value: "Politics", icon: "🏛️", color: "indigo" },
    { value: "Science", icon: "🔬", color: "cyan" },
    { value: "Arts", icon: "🎨", color: "pink" },
    { value: "Sports", icon: "⚽", color: "orange" },
  ];

  const participantConfigs = [
    {
      value: "2ai2real",
      title: "Balanced Discussion",
      description: "2 AI + 2 Real Users",
      detail: "Perfect balance for diverse perspectives",
      icon: "⚖️",
    },
    {
      value: "1ai3real",
      title: "Human-Focused",
      description: "1 AI + 3 Real Users",
      detail: "More human interaction with AI support",
      icon: "👥",
    },
    {
      value: "3ai1real",
      title: "AI-Enhanced",
      description: "3 AI + 1 Real User",
      detail: "Deep AI insights with human guidance",
      icon: "🤖",
    },
    {
      value: "4real",
      title: "Human Only",
      description: "4 Real Users",
      detail: "Pure human discussion experience",
      icon: "👤",
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionLink);
    // Show toast notification
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    toast.textContent = "Session link copied!";
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  if (created) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session Created!
            </h2>
            <p className="text-gray-600 mb-6">
              Your group discussion session is ready to go.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Share this link with participants:
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={sessionLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  navigate(`/session/${sessionLink.split("/").pop()}`)
                }
                className="w-full btn-primary"
              >
                🚀 Join Session Now
              </button>
              <button
                onClick={() => setCreated(false)}
                className="w-full btn-secondary"
              >
                ➕ Create Another Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🎤</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Group Discussion
          </h1>
          <p className="text-gray-600">
            Set up a new AI-powered group discussion session
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discussion Topic *
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="e.g., Impact of AI on Future Employment"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <label
                        key={category.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          form.category === category.value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={form.category === category.value}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div className="ml-2 text-center">
                          <div className="text-lg">{category.icon}</div>
                          <div className="text-xs text-gray-600">
                            {category.value}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date, Time & Duration */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>

                {/* Participant Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Participant Configuration
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {participantConfigs.map((config) => (
                      <label
                        key={config.value}
                        className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                          form.participantConfig === config.value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="participantConfig"
                          value={config.value}
                          checked={form.participantConfig === config.value}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-1"
                        />
                        <div className="ml-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{config.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {config.title}
                              </div>
                              <div className="text-sm text-gray-600">
                                {config.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {config.detail}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Session...
                      </div>
                    ) : (
                      "🎤 Create Discussion Session"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Session Summary
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {summary.ai + summary.real} Total
                  </div>
                  <div className="text-sm text-gray-600">Participants</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {summary.ai}
                    </div>
                    <div className="text-xs text-gray-600">AI 🤖</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {summary.real}
                    </div>
                    <div className="text-xs text-gray-600">Real 👤</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{form.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{form.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                💡 Tips for Great Discussions
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span>🎯</span>
                  <span>Choose a clear, focused topic</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>⏰</span>
                  <span>Set realistic time limits</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>👥</span>
                  <span>Balance AI and human participants</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>📝</span>
                  <span>Provide context in description</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  📋 View Previous Sessions
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  📊 Session Templates
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  ⚙️ Session Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCreate;
