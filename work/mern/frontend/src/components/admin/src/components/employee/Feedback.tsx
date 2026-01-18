import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import { useCookies } from "react-cookie";
import axios from "axios";

interface FeedbackSubmission {
  _id: string;
  type: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  submittedAt: string;
  respondedAt?: string;
  response?: string;
}

export function Feedback() {
  const [cookies] = useCookies(["userId", "username"]);
  const [type, setType] = useState("suggestion");
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/feedback/my-feedback", {
        withCredentials: true,
      });
      setSubmittedFeedbacks(response.data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setSubmittedFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        "http://localhost:5000/api/feedback/submit",
        {
          type,
          category,
          subject: subject.trim(),
          message: message.trim(),
        },
        { withCredentials: true }
      );

      if (response.data) {
        alert("Feedback submitted successfully!");
        setSubject("");
        setMessage("");
        setType("suggestion");
        setCategory("general");
        fetchFeedbacks(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      alert(error.response?.data?.error || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "complaint":
        return "bg-red-100 text-red-800";
      case "suggestion":
        return "bg-blue-100 text-blue-800";
      case "appreciation":
        return "bg-green-100 text-green-800";
      case "question":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <MessageSquare className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Submit Feedback</h1>
          <p className="text-muted-foreground">Share your thoughts, suggestions, or concerns with management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">New Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Feedback Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="appreciation">Appreciation</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="workplace">Workplace</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter feedback subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your feedback in detail..."
                rows={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Submitted Feedbacks */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">My Feedback History</h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Loading feedback history...</p>
            </div>
          ) : submittedFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p>No feedback submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {submittedFeedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getTypeColor(feedback.type)}>
                          {feedback.type}
                        </Badge>
                        <Badge className={getStatusColor(feedback.status)}>
                          {feedback.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{feedback.subject}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {feedback.category} • {new Date(feedback.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{feedback.message}</p>
                    </div>
                  </div>
                  {feedback.response && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">
                          Response ({new Date(feedback.respondedAt || "").toLocaleDateString()})
                        </span>
                      </div>
                      <p className="text-sm text-green-700">{feedback.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

