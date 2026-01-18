import { useState, useEffect, SetStateAction } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Calendar, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import Cookies from "js-cookie";

export function LeaveApplication() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [needsSubstitute, setNeedsSubstitute] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<string>("");
  const [substitute, setSubstitute] = useState<string>("");
  const [handoverNotes, setHandoverNotes] = useState<string>("");

  // ✅ Dynamic leave types from backend
  const [leaveTypes, setLeaveTypes] = useState<{ _id: string; type: string; balance?: number; leaveid?: string }[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [colleagues, setColleagues] = useState<{ _id: string; name: string; department?: string; role?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/viewleavetype");
        setLeaveTypes(res.data);
      } catch (err) {
        console.error("Error fetching leave types:", err);
        setError("Failed to fetch leave types");
      }
    };

    const fetchLeaveBalances = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/employee/leave-balances", {
          withCredentials: true
        });
        setLeaveBalances(res.data.leaveBalances || []);
      } catch (err) {
        console.error("Error fetching leave balances:", err);
        setError("Failed to fetch leave balances");
      }
    };

   const fetchColleagues = async () => {
  try {
    const res = await axios.get("http://localhost:5000/view_substitutes", {
      withCredentials: true, // ✅ send cookies
    });
    setColleagues(res.data);
  } catch (err) {
    console.error("Error fetching colleagues:", err);
    setError("Failed to fetch colleagues");
  }
};

    // Check if editing a draft
    const draftData = sessionStorage.getItem('editingDraft');
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        setEditingDraftId(draft._id || null);
        setSelectedLeaveType(draft.leaveType || "");
        if (draft.startDate) setStartDate(new Date(draft.startDate));
        if (draft.endDate) setEndDate(new Date(draft.endDate));
        setReason(draft.reason || "");
        setContactInfo(draft.contactInfo || "");
        setNeedsSubstitute(draft.needsSubstitute || false);
        setSubstitute(draft.substitute || "");
        setHandoverNotes(draft.handoverNotes || "");
        // Clear the draft data after loading
        sessionStorage.removeItem('editingDraft');
      } catch (err) {
        console.error("Error loading draft data:", err);
      }
    }

    Promise.all([fetchLeaveTypes(), fetchLeaveBalances(), fetchColleagues()]).finally(() => setLoading(false));
  }, []);

  const calculateDays = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?\d{1,3})?[6-9]\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  const handleSubmit = async () => {
    if (!selectedLeaveType || !startDate || !endDate || !reason || !contactInfo) {
      alert("Please fill in all required fields!");
      return;
    }

    // Validate that dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (start < today) {
      alert("Start date cannot be in the past!");
      return;
    }

    if (end < today) {
      alert("End date cannot be in the past!");
      return;
    }

    if (end < start) {
      alert("End date must be after or equal to start date!");
      return;
    }

    // Validate emergency contact number
    if (!validatePhoneNumber(contactInfo)) {
      alert("Please enter a valid emergency contact number (10 digits, starting with 6-9)");
      return;
    }

    try {
      const employeeName = Cookies.get("username") || "";
      const employeeId = Cookies.get("userId") || "";
      const payload = {
        employeeName,
        employeeId,
        leavetype: selectedLeaveType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: calculateDays(),
        status: "pending",
        appliedDate: new Date().toISOString(),
        reason: reason || "",
        contactInfo: contactInfo || "",
        needsSubstitute: !!needsSubstitute,
        substitute: needsSubstitute ? substitute || "" : "",
        handoverNotes: needsSubstitute ? handoverNotes || "" : "",
      };

      // If editing a draft, update it instead of creating new
      if (editingDraftId) {
        const updateResponse = await axios.put(
          `http://localhost:5000/api/leaves/${editingDraftId}`,
          { ...payload, status: "pending" }
        );
        if (updateResponse.status === 200) {
          alert("Draft updated and submitted successfully!");
          // Reset form
          setEditingDraftId(null);
          setSelectedLeaveType("");
          setStartDate(undefined);
          setEndDate(undefined);
          setReason("");
          setContactInfo("");
          setNeedsSubstitute(false);
          setSubstitute("");
          setHandoverNotes("");
          return;
        }
      }

      const response = await axios.post("http://localhost:5000/addleave", payload);

      if (response.status === 200|| response.status === 201) {
        console.log("✅ Leave application submitted successfully!", response.data);
        console.log("📋 Submitted application status:", response.data?.status);
        
        // Trigger badge count update - dispatch multiple times for reliability
        console.log("🔄 Triggering badge update events...");
        window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'submitted', applicationId: response.data?._id } }));
        
        // Also trigger after delays to ensure backend has processed
        setTimeout(() => {
          console.log("🔄 Triggering badge update (1 second delay)...");
          window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'submitted', applicationId: response.data?._id } }));
        }, 1000);
        
        setTimeout(() => {
          console.log("🔄 Triggering badge update (2 second delay)...");
          window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'submitted', applicationId: response.data?._id } }));
        }, 2000);
        
        alert("Leave application submitted successfully!");
        // Reset form
        setSelectedLeaveType("");
        setStartDate(undefined);
        setEndDate(undefined);
        setReason("");
        setContactInfo("");
        setNeedsSubstitute(false);
        setSubstitute("");
        setHandoverNotes("");
      }
    } catch (err) {
      console.error("Error submitting leave application:", err);
      alert("Failed to submit leave application.");
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedLeaveType || !startDate || !endDate) {
      alert("Please fill in at least leave type and dates to save as draft!");
      return;
    }

    try {
      setSavingDraft(true);
      const employeeName = Cookies.get("username") || "";
      const employeeId = Cookies.get("userId") || "";
      const payload = {
        employeeName,
        employeeId,
        leavetype: selectedLeaveType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: calculateDays(),
        status: "draft",
        appliedDate: new Date().toISOString(),
        reason: reason || "",
        contactInfo: contactInfo || "",
        needsSubstitute: !!needsSubstitute,
        substitute: needsSubstitute ? substitute || "" : "",
        handoverNotes: needsSubstitute ? handoverNotes || "" : "",
      };

      // If editing existing draft, update it
      if (editingDraftId) {
        const updateResponse = await axios.put(
          `http://localhost:5000/api/leaves/${editingDraftId}`,
          { ...payload, status: "draft" }
        );
        if (updateResponse.status === 200) {
          alert("Draft updated successfully!");
          return;
        }
      }

      const response = await axios.post("http://localhost:5000/addleave", payload);

      if (response.status === 200 || response.status === 201) {
        alert("Draft saved successfully! You can continue editing and submit later.");
        // If this was a new draft, set the editing ID for future updates
        if (response.data?._id) {
          setEditingDraftId(response.data._id);
        }
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      alert("Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>{editingDraftId ? "Edit & Submit Draft" : "Apply for Leave"}</h2>
        <p className="text-muted-foreground">
          {editingDraftId ? "Complete your draft and submit for approval" : "Submit a new leave request for approval"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Leave Details</h3>

            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Leave Type */}
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select
                      value={selectedLeaveType}
                      onValueChange={(value: SetStateAction<string>) => setSelectedLeaveType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.length > 0 ? (
                          leaveTypes.map((type) => (
                            <SelectItem key={type._id} value={type._id}>
                              <div className="flex flex-col">
                                <span>{type.type}</span>
                                {type.balance !== undefined && (
                                  <span className="text-sm text-muted-foreground">{type.balance} days available</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No leave types found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {calculateDays()} day{calculateDays() !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Start and End Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {startDate ? format(startDate, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent 
                          mode="single" 
                          selected={startDate} 
                          onSelect={setStartDate} 
                          initialFocus
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {endDate ? format(endDate, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent 
                          mode="single" 
                          selected={endDate} 
                          onSelect={setEndDate} 
                          initialFocus
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (startDate) {
                              const start = new Date(startDate);
                              start.setHours(0, 0, 0, 0);
                              return date < today || date < start;
                            }
                            return date < today;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a brief explanation..."
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Emergency Contact Information</Label>
                  <Input
                    id="contactInfo"
                    placeholder="Phone number or email"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Substitute Assignment */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Work Coverage</h3>
              <div className="flex items-center space-x-2">
                <Switch id="substitute" checked={needsSubstitute} onCheckedChange={setNeedsSubstitute} />
                <Label htmlFor="substitute">Assign substitute</Label>
              </div>
            </div>

            {needsSubstitute && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="substitute">Select Substitute</Label>
                  <Select value={substitute} onValueChange={setSubstitute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a colleague" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleagues.length > 0 ? (
                        colleagues.map((colleague) => (
                          <SelectItem key={colleague._id} value={colleague._id}>
                            <div className="flex flex-col">
                              <span>{colleague.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {colleague.role ?? "Employee"} - {colleague.department ?? "General"}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No colleagues found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handoverNotes">Handover Notes</Label>
                  <Textarea
                    id="handoverNotes"
                    placeholder="Provide details for your substitute..."
                    rows={3}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </Card>

          <div className="flex space-x-4">
            <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90">
              <FileText className="h-4 w-4 mr-2" />
              Submit Application
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleSaveDraft}
              disabled={savingDraft || !selectedLeaveType || !startDate || !endDate}
            >
              {savingDraft ? "Saving..." : "Save as Draft"}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Your Leave Balances</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="space-y-3">
                {leaveBalances.length > 0 ? (
                  leaveBalances.map((balance) => (
                    <div key={balance.type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{balance.type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Used: {balance.used || 0} days
                          </span>
                          {balance.pending > 0 && (
                            <span className="text-xs text-orange-600">
                              Pending: {balance.pending} days
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-sm">
                          {balance.available || 0} days
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          of {balance.total || 0}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No leave balances available
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
