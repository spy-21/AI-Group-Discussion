import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interests: [],
    apiKey: "",
    bio: "",
    experience: "beginner",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const navigate = useNavigate();

  const interestOptions = [
    { value: "Technology", icon: "💻" },
    { value: "Business", icon: "💼" },
    { value: "Healthcare", icon: "🏥" },
    { value: "Education", icon: "📚" },
    { value: "Environment", icon: "🌱" },
    { value: "Politics", icon: "🏛️" },
    { value: "Science", icon: "🔬" },
    { value: "Arts", icon: "🎨" },
    { value: "Sports", icon: "⚽" },
  ];

  const experienceLevels = [
    {
      value: "beginner",
      label: "Beginner",
      description: "New to group discussions",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Some experience with discussions",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Experienced discussion participant",
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        interests: parsedUser.interests || [],
        apiKey: parsedUser.apiKey || "",
        bio: parsedUser.bio || "",
        experience: parsedUser.experience || "beginner",
      });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Mock API call
      console.log("Saving profile:", formData);
      await new Promise((res) => setTimeout(res, 1000));

      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage("Profile updated successfully!");
    } catch {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-screen-xl mx-auto py-20 px-8 sm:px-20 lg:px-32">
        {/* Logout Button */}
        <div className="mb-16 fade-in relative">
          <button
            onClick={handleLogout}
            className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 absolute right-0 top-0"
          >
            🚪 Logout
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.includes("successfully")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {message.includes("successfully") ? "✅" : "⚠️"}
              </span>
              {message}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-16">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card p-16 mt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {formData.name
                        ? formData.name.charAt(0).toUpperCase()
                        : "👤"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Change Photo
                  </button>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {experienceLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.experience === level.value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="experience"
                          value={level.value}
                          checked={formData.experience === level.value}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 mt-0.5"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium">
                            {level.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {level.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interests
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                          formData.interests.includes(option.value)
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(option.value)}
                          onChange={() => handleInterestChange(option.value)}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="ml-2">{option.icon}</span>
                        <span className="ml-1 text-sm">{option.value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label
                    htmlFor="apiKey"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      id="apiKey"
                      name="apiKey"
                      value={formData.apiKey}
                      onChange={handleChange}
                      className="input-field pr-12"
                      placeholder="Enter your API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-2"
                    >
                      {showApiKey ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-3"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Account Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Sessions Created</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions Joined</span>
                  <span>8</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Participants</span>
                  <span>24</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Rating</span>
                  <span>4.6 ⭐</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50">
                  📅 Schedule New Session
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50">
                  📊 View Reports
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50">
                  ⚙️ Account Settings
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50">
                  ❓ Help & Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
