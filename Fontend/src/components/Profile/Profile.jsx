import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: [],
    apiKey: '',
    bio: '',
    experience: 'beginner'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const navigate = useNavigate();

  const interestOptions = [
    { value: 'Technology', icon: '💻' },
    { value: 'Business', icon: '💼' },
    { value: 'Healthcare', icon: '🏥' },
    { value: 'Education', icon: '📚' },
    { value: 'Environment', icon: '🌱' },
    { value: 'Politics', icon: '🏛️' },
    { value: 'Science', icon: '🔬' },
    { value: 'Arts', icon: '🎨' },
    { value: 'Sports', icon: '⚽' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to group discussions' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience with discussions' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced discussion participant' }
  ];

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        interests: parsedUser.interests || [],
        apiKey: parsedUser.apiKey || '',
        bio: parsedUser.bio || '',
        experience: parsedUser.experience || 'beginner'
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Mock API call - replace with actual API
      console.log('Updating profile:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.includes('successfully') ? '✅' : '⚠️'}
              </span>
              {message}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button type="button" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Change Photo
                  </button>
                </div>

                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">👤</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter your email"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">📧</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Tell us about yourself, your background, and what interests you..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will help us match you with relevant discussion topics.
                  </p>
                </div>

                {/* Experience Level */}
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {experienceLevels.map(level => (
                      <label 
                        key={level.value} 
                        className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.experience === level.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="experience"
                          value={level.value}
                          checked={formData.experience === level.value}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-0.5"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
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
                    {interestOptions.map(interest => (
                      <label 
                        key={interest.value} 
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.interests.includes(interest.value)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest.value)}
                          onChange={() => handleInterestChange(interest.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm">{interest.icon}</span>
                        <span className="ml-1 text-sm text-gray-700">{interest.value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                    AI API Key (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      id="apiKey"
                      name="apiKey"
                      value={formData.apiKey}
                      onChange={handleChange}
                      className="input-field pr-12"
                      placeholder="Enter your OpenAI API key"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      <span className="text-gray-400 hover:text-gray-600">
                        {showApiKey ? '🙈' : '👁️'}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is stored securely and used only for AI features in group discussions.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sessions Created</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sessions Joined</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Participants</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Rating</span>
                  <span className="font-medium">4.6 ⭐</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  📅 Schedule New Session
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  📊 View Reports
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  ⚙️ Account Settings
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors">
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