import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const FeedbackReport = () => {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const generateReport = async () => {
      try {
        // Mock data - replace with actual API call
        const mockTranscript = [
          {
            speaker: "Alice",
            text: "I think AI can never replace emotional intelligence.",
            timestamp: "14:00:05",
            duration: 8,
          },
          {
            speaker: "Bob",
            text: "True, but AI is good at data processing.",
            timestamp: "14:00:13",
            duration: 6,
          },
          {
            speaker: "AI Assistant - Sarah",
            text: "That's an interesting point. AI excels at pattern recognition and automation.",
            timestamp: "14:00:19",
            duration: 12,
          },
          {
            speaker: "Alice",
            text: "But what about creativity and human intuition?",
            timestamp: "14:00:31",
            duration: 7,
          },
          {
            speaker: "Bob",
            text: "AI can generate creative content too.",
            timestamp: "14:00:38",
            duration: 5,
          },
          {
            speaker: "Carol",
            text: "I believe the key is collaboration between AI and humans.",
            timestamp: "14:00:43",
            duration: 10,
          },
        ];

        const mockParticipants = [
          {
            id: "1",
            name: "Alice",
            type: "human",
            avatar: "👩‍💼",
            talkTime: 35,
            contributions: 8,
            avgResponseTime: 3.2,
          },
          {
            id: "2",
            name: "Bob",
            type: "human",
            avatar: "👨‍💻",
            talkTime: 25,
            contributions: 6,
            avgResponseTime: 4.1,
          },
          {
            id: "3",
            name: "Carol",
            type: "human",
            avatar: "👩‍🎓",
            talkTime: 20,
            contributions: 4,
            avgResponseTime: 5.8,
          },
          {
            id: "4",
            name: "AI Assistant - Sarah",
            type: "ai",
            avatar: "🤖",
            talkTime: 20,
            contributions: 5,
            avgResponseTime: 2.1,
          },
        ];

        // Simulate API call to generate report
        const response = await axios.post("/api/ai/analyze-session", {
          transcript: mockTranscript,
          participants: mockParticipants,
          sessionId: sessionId,
        });

        setReport(response.data);
      } catch (error) {
        console.error("Error generating report:", error);
        // Fallback mock data
        setReport({
          sessionInfo: {
            topic: "Impact of AI on Future Employment",
            duration: "45 minutes",
            date: "2024-01-15",
            participants: 4,
          },
          analysis: {
            overallPerformance: {
              talkTime: 85,
              relevance: 9,
              originality: 8,
              clarity: 7,
              confidence: 8,
              engagement: 8.5,
              listening: 7.5,
            },
            participantBreakdown: [
              {
                name: "Alice",
                type: "human",
                avatar: "👩‍💼",
                talkTime: 35,
                contributions: 8,
                avgResponseTime: 3.2,
                strengths: ["Good engagement", "Clear communication"],
                improvements: ["Speak more slowly", "Provide more examples"],
              },
              {
                name: "Bob",
                type: "human",
                avatar: "👨‍💻",
                talkTime: 25,
                contributions: 6,
                avgResponseTime: 4.1,
                strengths: ["Relevant points", "Good listening"],
                improvements: ["Speak more clearly", "Engage more with others"],
              },
              {
                name: "Carol",
                type: "human",
                avatar: "👩‍🎓",
                talkTime: 20,
                contributions: 4,
                avgResponseTime: 5.8,
                strengths: ["Thoughtful insights", "Good timing"],
                improvements: [
                  "Participate more actively",
                  "Build on others' points",
                ],
              },
              {
                name: "AI Assistant - Sarah",
                type: "ai",
                avatar: "🤖",
                talkTime: 20,
                contributions: 5,
                avgResponseTime: 2.1,
                strengths: ["Quick responses", "Relevant insights"],
                improvements: [
                  "Allow more human interaction",
                  "Provide deeper analysis",
                ],
              },
            ],
            personalizedTips: [
              "Speak more clearly and at a moderate pace",
              "Use more specific examples to support your points",
              "Try to engage more with other participants",
              "Consider varying your vocabulary for better impact",
              "Practice active listening and building on others' ideas",
            ],
            summary:
              "The discussion focused on AI's role in replacing human capabilities, particularly emotional intelligence and creativity. Participants explored both the limitations and potential of AI in various domains. The conversation was well-balanced with good participation from all members.",
            keyInsights: {
              strengths: [
                "Good engagement with the topic",
                "Relevant examples provided",
                "Active participation in discussion",
                "Respectful interaction between participants",
              ],
              improvements: [
                "Speak more clearly and slowly",
                "Provide more specific examples",
                "Engage more with other participants",
                "Allow more time for others to respond",
              ],
            },
            communicationMetrics: {
              totalWords: 245,
              avgWordsPerMinute: 120,
              interruptions: 2,
              topicStickiness: 85,
              responseQuality: 8.2,
            },
          },
        });
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [sessionId]);

  const downloadPDF = () => {
    // Mock PDF download - implement with jsPDF or similar
    const element = document.createElement("a");
    const file = new Blob(["GD Feedback Report"], { type: "application/pdf" });
    element.href = URL.createObjectURL(file);
    element.download = `gd-report-${sessionId}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: "Group Discussion Feedback Report",
        text: "Check out my group discussion feedback report!",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      toast.textContent = "Report link copied!";
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Generating your comprehensive feedback report...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-screen-2xl mx-auto py-16 px-6 sm:px-12 lg:px-20">
        {/* Header */}
        <div className="mb-12 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Feedback Report
              </h1>
              <p className="text-gray-600">
                Detailed analysis of your group discussion performance
              </p>
            </div>
            <Link to="/" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Session Info Card */}
        <div className="card p-10 mb-12">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Topic</div>
              <div className="font-semibold text-gray-900">
                {report?.sessionInfo?.topic}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-gray-900">
                {report?.sessionInfo?.duration}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="font-semibold text-gray-900">
                {report?.sessionInfo?.date}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Participants</div>
              <div className="font-semibold text-gray-900">
                {report?.sessionInfo?.participants}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-white rounded-xl p-2 mb-12 shadow-md">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "participants", label: "Participants", icon: "👥" },
            { id: "analysis", label: "Analysis", icon: "🔍" },
            { id: "insights", label: "Insights", icon: "💡" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-12">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              {/* Overall Performance Metrics */}
              <div className="card p-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Overall Performance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {Object.entries(
                    report?.analysis?.overallPerformance || {}
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl"
                    >
                      <div className="text-3xl font-bold text-indigo-600">
                        {typeof value === "number" && key !== "talkTime"
                          ? `${value}/10`
                          : `${value}%`}
                      </div>
                      <div className="text-base text-gray-600 mt-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication Metrics */}
              <div className="card p-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Communication Metrics
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">
                      {report?.analysis?.communicationMetrics?.totalWords}
                    </div>
                    <div className="text-sm text-gray-600">Total Words</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        report?.analysis?.communicationMetrics
                          ?.avgWordsPerMinute
                      }
                    </div>
                    <div className="text-sm text-gray-600">Words/Minute</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">
                      {report?.analysis?.communicationMetrics?.topicStickiness}%
                    </div>
                    <div className="text-sm text-gray-600">Topic Focus</div>
                  </div>
                </div>
              </div>

              {/* Discussion Summary */}
              <div className="card p-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Discussion Summary
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {report?.analysis?.summary}
                </p>
              </div>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <div className="space-y-6">
              {report?.analysis?.participantBreakdown?.map(
                (participant, index) => (
                  <div key={index} className="card p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                        {participant.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {participant.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            participant.type === "ai"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {participant.type === "ai" ? "AI Assistant" : "Human"}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                          {participant.talkTime}%
                        </div>
                        <div className="text-sm text-gray-600">Talk Time</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                          {participant.contributions}
                        </div>
                        <div className="text-sm text-gray-600">
                          Contributions
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                          {participant.avgResponseTime}s
                        </div>
                        <div className="text-sm text-gray-600">
                          Avg Response
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {participant.strengths?.map((strength, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-green-600 flex items-center"
                            >
                              <span className="mr-2">✅</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2">
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {participant.improvements?.map((improvement, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-orange-600 flex items-center"
                            >
                              <span className="mr-2">💡</span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              {/* Personalized Tips */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Personalized Tips for Improvement
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
                  <ul className="space-y-3">
                    {report?.analysis?.personalizedTips?.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-600 mr-3 mt-1">💡</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {report?.analysis?.keyInsights?.strengths?.map(
                      (strength, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 bg-green-50 rounded-lg"
                        >
                          <span className="text-green-600 mr-2">✅</span>
                          <span className="text-green-700">{strength}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {report?.analysis?.keyInsights?.improvements?.map(
                      (improvement, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 bg-orange-50 rounded-lg"
                        >
                          <span className="text-orange-600 mr-2">🎯</span>
                          <span className="text-orange-700">{improvement}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === "insights" && (
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  AI-Generated Insights
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Communication Style
                    </h4>
                    <p className="text-blue-700">
                      Your communication style shows good engagement and
                      relevance. Consider varying your pace and providing more
                      specific examples to enhance clarity.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Content Quality
                    </h4>
                    <p className="text-green-700">
                      Your contributions were relevant and well-thought-out. You
                      demonstrated good understanding of the topic and provided
                      valuable insights.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      Interaction Patterns
                    </h4>
                    <p className="text-purple-700">
                      You showed good listening skills and built on others'
                      points effectively. Consider engaging more actively with
                      quieter participants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={downloadPDF}
            className="flex-1 btn-primary flex items-center justify-center"
          >
            📄 Download PDF Report
          </button>
          <button
            onClick={shareReport}
            className="flex-1 btn-secondary flex items-center justify-center"
          >
            📤 Share Report
          </button>
          <Link
            to="/session/create"
            className="flex-1 btn-success flex items-center justify-center"
          >
            🎤 Schedule New Session
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
