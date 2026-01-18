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

export function ManagerLeaveApplication() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [needsSubstitute, setNeedsSubstitute] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<string>("");
  const [substitute, setSubstitute] = useState<string>("");
  const [handoverNotes, setHandoverNotes] = useState<string>("");

  // ✅ Dynamic data
  const [leaveTypes, setLeaveTypes] = useState<{ _id: string; type: string; balance?: number; leaveid?: string }[]>([]);
  const [substitutes, setSubstitutes] = useState<{ _id: string; name: string; department?: string; role?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Manager details from cookies
  const managerName = Cookies.get("username") || "";
  const managerId = Cookies.get("userId") || "";

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

    const fetchSubstitutes = async () => {
      try {
        // ✅ Managers can choose any employee as substitute
        const res = await axios.get("http://localhost:5000/view_employees", {
          withCredentials: true,
        });
        setSubstitutes(res.data);
      } catch (err) {
        console.error("Error fetching substitutes:", err);
        setError("Failed to fetch substitutes");
      }
    };

    Promise.all([fetchLeaveTypes(), fetchSubstitutes()]).finally(() => setLoading(false));
  }, []);

  const calculateDays = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const handleSubmit = async () => {
    if (!selectedLeaveType || !startDate || !endDate || !reason || !contactInfo) {
      alert("Please fill in all required fields!");
      return;
    }

    // Validate dates
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
      alert("End date must be on or after start date!");
      return;
    }

    try {
      const payload = {
        employeeName: managerName,
        employeeId: managerId,
        leavetype: selectedLeaveType,
        startDate,
        endDate,
        days: calculateDays(),
        status: "pending",
        appliedDate: new Date().toISOString(),
        reason,
        contactInfo,
        needsSubstitute: !!needsSubstitute,
        substitute: needsSubstitute ? substitute || "" : "",
        handoverNotes: needsSubstitute ? handoverNotes || "" : "",
      };

      const response = await axios.post("http://localhost:5000/addleave", payload);

      if (response.status === 200 || response.status === 201) {
        alert("Manager leave application submitted successfully!");
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

  return (
    <div className="space-y-6">
      <div>
        <h2>Manager Leave Application</h2>
        <p className="text-muted-foreground">Submit a new leave request for managerial approval</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
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

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
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
                    <p className="text-xs text-muted-foreground">
                      Cannot select past dates
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date *</Label>
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
                    <p className="text-xs text-muted-foreground">
                      Must be on or after start date
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Textarea
                    id="reason"
                    placeholder="Provide a brief explanation..."
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
                <Label htmlFor="substitute">Assign Substitute</Label>
              </div>
            </div>

            {needsSubstitute && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="substitute">Select Substitute</Label>
                  <Select value={substitute} onValueChange={setSubstitute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {substitutes.length > 0 ? (
                        substitutes.map((colleague) => (
                          <SelectItem key={colleague._id} value={colleague._id}>
                            <div className="flex flex-col">
                              <span>{colleague.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {colleague.department ?? "General"}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No substitutes found
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
            <Button variant="outline" className="flex-1">
              Save as Draft
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
                {leaveTypes.map((type) => (
                  <div key={type._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{type.type}</p>
                      <p className="text-xs text-muted-foreground">{type.leaveid || "—"}</p>
                    </div>
                    <Badge variant="secondary">{type.balance ?? 0} days</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
