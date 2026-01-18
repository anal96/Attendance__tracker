import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { MessageSquare, Search, Filter, CheckCircle, Clock, AlertCircle, Send, TrendingUp, Users, MessageCircle } from "lucide-react";
import { useCookies } from "react-cookie";
import axios from "axios";

interface Feedback {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    employeeId?: string;
  };
  type: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  submittedAt: string;
  respondedAt?: string;
  response?: string;
  respondedBy?: {
    _id: string;
    name: string;
  };
}

export function FeedbackManagement() {
  const [cookies] = useCookies(["userId", "userType"]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, searchTerm, filterType, filterStatus]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/feedback/all", {
        withCredentials: true,
      });
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    let filtered = [...feedbacks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (fb) =>
          fb.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((fb) => fb.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((fb) => fb.status === filterStatus);
    }

    setFilteredFeedbacks(filtered);
  };

  const handleRespond = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponse(feedback.response || "");
    setIsResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !response.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `http://localhost:5000/api/feedback/${selectedFeedback._id}/respond`,
        {
          response: response.trim(),
          status: "resolved",
        },
        { withCredentials: true }
      );

      alert("Response submitted successfully!");
      setIsResponseDialogOpen(false);
      setSelectedFeedback(null);
      setResponse("");
      fetchFeedbacks(); // Refresh the list
    } catch (error: any) {
      console.error("Error submitting response:", error);
      alert(error.response?.data?.error || "Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/feedback/${feedbackId}/status`,
        { status },
        { withCredentials: true }
      );
      fetchFeedbacks(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.error || "Failed to update status. Please try again.");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_review":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === "pending").length,
    inReview: feedbacks.filter((f) => f.status === "in_review").length,
    resolved: feedbacks.filter((f) => f.status === "resolved").length,
    suggestions: feedbacks.filter((f) => f.type === "suggestion").length,
    complaints: feedbacks.filter((f) => f.type === "complaint").length,
  };

  const pendingFeedbacks = filteredFeedbacks.filter((f) => f.status === "pending");
  const inReviewFeedbacks = filteredFeedbacks.filter((f) => f.status === "in_review");
  const resolvedFeedbacks = filteredFeedbacks.filter((f) => f.status === "resolved");

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <MessageSquare className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Feedback Management</h1>
          <p className="text-muted-foreground">View and manage employee feedback</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Review</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.inReview}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-semibold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
              <SelectItem value="appreciation">Appreciation</SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchFeedbacks}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Feedback List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredFeedbacks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingFeedbacks.length})</TabsTrigger>
          <TabsTrigger value="in_review">In Review ({inReviewFeedbacks.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedFeedbacks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderFeedbackList(filteredFeedbacks)}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {renderFeedbackList(pendingFeedbacks)}
        </TabsContent>

        <TabsContent value="in_review" className="space-y-4">
          {renderFeedbackList(inReviewFeedbacks)}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {renderFeedbackList(resolvedFeedbacks)}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Respond to feedback from {selectedFeedback?.employeeId?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(selectedFeedback.type)}>
                    {selectedFeedback.type}
                  </Badge>
                  <Badge className={getStatusColor(selectedFeedback.status)}>
                    {selectedFeedback.status.replace("_", " ")}
                  </Badge>
                </div>
                <h3 className="font-semibold">{selectedFeedback.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedFeedback.category} • {new Date(selectedFeedback.submittedAt).toLocaleDateString()}
                </p>
                <p className="text-sm">{selectedFeedback.message}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">Your Response *</Label>
                <Textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response..."
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResponseDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={submitting || !response.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderFeedbackList(feedbackList: Feedback[]) {
    if (loading) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Loading feedback...</p>
        </div>
      );
    }

    if (feedbackList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2" />
          <p>No feedback found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {feedbackList.map((feedback) => (
          <Card key={feedback._id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(feedback.type)}>{feedback.type}</Badge>
                  <Badge className={getStatusColor(feedback.status)}>
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(feedback.status)}
                      <span>{feedback.status.replace("_", " ")}</span>
                    </span>
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{feedback.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    From: {feedback.employeeId?.name} ({feedback.employeeId?.email})
                    {feedback.employeeId?.employeeId && ` • ID: ${feedback.employeeId.employeeId}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {feedback.category} • {new Date(feedback.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-sm">{feedback.message}</p>

                {feedback.response && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">
                        Response {feedback.respondedBy?.name && `by ${feedback.respondedBy.name}`}
                        {feedback.respondedAt && ` (${new Date(feedback.respondedAt).toLocaleDateString()})`}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">{feedback.response}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {feedback.status !== "resolved" && feedback.status !== "closed" && (
                  <Button
                    size="sm"
                    onClick={() => handleRespond(feedback)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                )}

                {feedback.status === "pending" && (
                  <Select
                    value={feedback.status}
                    onValueChange={(value) => handleUpdateStatus(feedback._id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {feedback.status === "in_review" && (
                  <Select
                    value={feedback.status}
                    onValueChange={(value) => handleUpdateStatus(feedback._id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
}

