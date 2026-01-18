import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Download, LogIn, LogOut, UserX } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";

export function ManagerAttendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<string>("current");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [todayStatus, setTodayStatus] = useState<any>({
    hasRecord: false,
    checkInTime: null,
    checkOutTime: null,
    status: null,
    workedHours: 0,
    isLate: false,
    isEarlyLeave: false
  });
  const [loading, setLoading] = useState(false);
  const [isAbsentDialogOpen, setIsAbsentDialogOpen] = useState(false);
  const [absentNotes, setAbsentNotes] = useState("");
  const [isLateDialogOpen, setIsLateDialogOpen] = useState(false);
  const [lateReason, setLateReason] = useState("");
  const [isEarlyLeaveDialogOpen, setIsEarlyLeaveDialogOpen] = useState(false);
  const [earlyLeaveReason, setEarlyLeaveReason] = useState("");
  const [currentMonthData, setCurrentMonthData] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalWorkingDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    leavesDays: 0,
    attendanceRate: 0,
    averageHours: 0
  });
  const [loadingData, setLoadingData] = useState(true);

  // Function to get browser location with high accuracy
  const getBrowserLocation = () => {
    return new Promise<any>((resolve) => {
      if (!navigator.geolocation) {
        console.log('📍 Browser geolocation not supported - will use IP geolocation (no permission required)');
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        console.log('⏱️ Geolocation timeout - will use IP geolocation (no permission required)');
        resolve(null);
      }, 11000); // Longer timeout for high accuracy location

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📍 Got browser location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          // Reverse geocode to get address
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(res => res.json())
            .then(data => {
              const locationParts = [];
              if (data.city) locationParts.push(data.city);
              if (data.principalSubdivision) locationParts.push(data.principalSubdivision);
              if (data.countryName) locationParts.push(data.countryName);
              const location = locationParts.length > 0 ? locationParts.join(', ') : `${latitude}, ${longitude}`;
              console.log(`✅ Browser location resolved: ${location}`);
              resolve({
                location: location,
                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy
              });
            })
            .catch(err => {
              console.error('Error reverse geocoding:', err);
              // Fallback to coordinates only
              resolve({
                location: `${latitude}, ${longitude}`,
                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy
              });
            });
        },
        (error) => {
          clearTimeout(timeout);
          if (error.code === 1) {
            console.log('📍 Location permission denied - will use IP geolocation (no permission required)');
          } else if (error.code === 2) {
            console.log('📍 Location unavailable - will use IP geolocation (no permission required)');
          } else if (error.code === 3) {
            console.log('📍 Location request timeout - will use IP geolocation (no permission required)');
          } else {
            console.log(`📍 Browser geolocation not available (${error.message}) - will use IP geolocation (no permission required)`);
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true, // Always use high accuracy for better location
          timeout: 10000, // Longer timeout to allow time for high accuracy location
          maximumAge: 0 // Always get fresh location, don't use cached
        }
      );
    });
  };

  // Update time and date every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's attendance status
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  // Fetch attendance data when month selection changes
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

  const fetchAttendanceData = async () => {
    try {
      setLoadingData(true);
      const today = new Date();
      let startDate, endDate;

      switch (selectedMonth) {
        case 'current':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'last':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case 'last-3':
          startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const [recordsRes, summaryRes, monthlyRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/attendance/records?startDate=${startDateStr}&endDate=${endDateStr}`, {
          withCredentials: true
        }),
        axios.get(`http://localhost:5000/api/attendance/summary?period=${selectedMonth}`, {
          withCredentials: true
        }),
        axios.get(`http://localhost:5000/api/attendance/monthly-stats?year=${today.getFullYear()}`, {
          withCredentials: true
        })
      ]);

      setCurrentMonthData(recordsRes.data.records || []);
      setAttendanceSummary(summaryRes.data || attendanceSummary);
      setMonthlyStats(monthlyRes.data.monthlyStats || []);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/attendance/today", {
        withCredentials: true
      });
      setTodayStatus(response.data);
    } catch (error) {
      console.error("Error fetching today's status:", error);
      setTodayStatus({
        hasRecord: false,
        checkInTime: null,
        checkOutTime: null,
        status: null,
        workedHours: 0,
        isLate: false,
        isEarlyLeave: false
      });
    }
  };

  const handleCheckIn = async () => {
    try {
      // Check if check-in will be late (after 9:15 AM)
      const now = new Date();
      const checkInHour = now.getHours();
      const checkInMinute = now.getMinutes();
      const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15);

      // If late, show dialog to get reason
      if (isLate) {
        setIsLateDialogOpen(true);
        return;
      }

      // If not late, proceed with check-in
      await performCheckIn("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to check in";
      alert(errorMessage);
    }
  };

  const performCheckIn = async (reason: string) => {
    try {
      setLoading(true);
      
      // Always try to get browser location with high accuracy (REQUIRED for accurate logging)
      const browserLocation = await Promise.race([
        getBrowserLocation(),
        new Promise(resolve => setTimeout(() => resolve(null), 11500)) // Max 11.5 second wait
      ]);
      
      const response = await axios.post("http://localhost:5000/api/attendance/checkin", 
        { 
          lateReason: reason,
          location: browserLocation?.location || null,
          latitude: browserLocation?.latitude || null,
          longitude: browserLocation?.longitude || null,
          accuracy: browserLocation?.accuracy || null
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      alert(response.data.message || "Check-in successful!");
      setIsLateDialogOpen(false);
      setLateReason("");
      await fetchTodayStatus();
      await fetchAttendanceData();
      
      // Dispatch custom event to notify App component to refresh attendance status
      window.dispatchEvent(new CustomEvent('attendanceChanged'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to check in";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      // Check if check-out will be early (before 5:00 PM)
      const now = new Date();
      const checkOutHour = now.getHours();
      const checkOutMinute = now.getMinutes();
      const isEarly = checkOutHour < 17; // Before 5:00 PM

      // If early, show dialog to get reason
      if (isEarly) {
        setIsEarlyLeaveDialogOpen(true);
        return;
      }

      // If not early, proceed with check-out
      await performCheckOut("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to check out";
      alert(errorMessage);
    }
  };

  const performCheckOut = async (reason: string) => {
    try {
      setLoading(true);
      
      // Always try to get browser location with high accuracy (REQUIRED for accurate logging)
      const browserLocation = await Promise.race([
        getBrowserLocation(),
        new Promise(resolve => setTimeout(() => resolve(null), 11500)) // Max 11.5 second wait
      ]);
      
      const response = await axios.post("http://localhost:5000/api/attendance/checkout", 
        { 
          earlyLeaveReason: reason,
          location: browserLocation?.location || null,
          latitude: browserLocation?.latitude || null,
          longitude: browserLocation?.longitude || null,
          accuracy: browserLocation?.accuracy || null
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      alert(response.data.message || `Check-out successful! Hours worked: ${response.data.workedHours?.toFixed(2) || 0}`);
      setIsEarlyLeaveDialogOpen(false);
      setEarlyLeaveReason("");
      await fetchTodayStatus();
      await fetchAttendanceData();
      
      // Dispatch custom event to notify App component to refresh attendance status
      window.dispatchEvent(new CustomEvent('attendanceChanged'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to check out";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async () => {
    setIsAbsentDialogOpen(true);
  };

  const handleAbsentSubmit = async () => {
    try {
      setLoading(true);
      
      // Always try to get browser location with high accuracy (REQUIRED for accurate logging)
      const browserLocation = await Promise.race([
        getBrowserLocation(),
        new Promise(resolve => setTimeout(() => resolve(null), 11500)) // Max 11.5 second wait
      ]);
      
      const response = await axios.post("http://localhost:5000/api/attendance/mark-absent", 
        { 
          notes: absentNotes || "",
          location: browserLocation?.location || null,
          latitude: browserLocation?.latitude || null,
          longitude: browserLocation?.longitude || null,
          accuracy: browserLocation?.accuracy || null
        },
        { 
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      alert("Marked as absent successfully!");
      setIsAbsentDialogOpen(false);
      setAbsentNotes("");
      await fetchTodayStatus();
      await fetchAttendanceData();
      
      // Dispatch custom event to notify App component to refresh attendance status
      window.dispatchEvent(new CustomEvent('attendanceChanged'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to mark absent";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string | Date | null) => {
    if (!timeString) return "-";
    const date = typeof timeString === 'string' ? new Date(timeString) : timeString;
    return date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatHours = (hours: number) => {
    if (!hours || hours === 0) return "0h 0m";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-orange-100 text-orange-800",
      early_leave: "bg-yellow-100 text-yellow-800",
      half_day_leave: "bg-purple-100 text-purple-800",
      weekend: "bg-gray-100 text-gray-800",
      holiday: "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent": return <XCircle className="h-4 w-4 text-red-600" />;
      case "late": return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "early_leave": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "half_day_leave": return <AlertTriangle className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Attendance Record</h2>
          <p className="text-muted-foreground">Track your daily attendance and work hours</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
              <SelectItem value="last-3">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Today's Attendance Card with Time/Date and Buttons */}
      <Card className="p-6 border-2 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time and Date Display */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Time & Date</h3>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-3xl font-bold text-primary">{currentTime}</p>
                  <p className="text-sm text-muted-foreground">{currentDate}</p>
                </div>
              </div>
            </div>

            {/* Today's Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Today's Attendance Status</h3>
              <div className="space-y-2">
                {todayStatus?.hasRecord ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Shift:</span>
                      <Badge className={todayStatus.shift === "night" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"}>
                        {todayStatus.shift === "night" ? "Night Shift" : "Day Shift"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge className={getStatusColor(todayStatus.status || "")}>
                        {todayStatus.status === "half_day_leave" ? "Half Day Leave" :
                         todayStatus.status?.charAt(0).toUpperCase() + todayStatus.status?.slice(1).replace(/_/g, ' ') || "Not marked"}
                        {todayStatus.isLate && " (Late)"}
                        {todayStatus.isEarlyLeave && " (Early Leave)"}
                      </Badge>
                    </div>
                    {todayStatus.notes && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{todayStatus.notes}</p>
                      </div>
                    )}
                    {todayStatus.checkInTime && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Check-in:</span>
                        <span className="text-sm font-semibold">{formatTime(todayStatus.checkInTime)}</span>
                      </div>
                    )}
                    {todayStatus.checkOutTime && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Check-out:</span>
                        <span className="text-sm font-semibold">{formatTime(todayStatus.checkOutTime)}</span>
                      </div>
                    )}
                    {todayStatus.workedHours > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Hours Worked:</span>
                        <span className="text-sm font-semibold">{formatHours(todayStatus.workedHours)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">No attendance marked for today</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">Mark Attendance</h3>
            <div className="space-y-3">
              <Button
                onClick={handleCheckIn}
                disabled={!!todayStatus?.checkInTime || todayStatus?.status === "absent" || loading}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-700"
                size="lg"
                type="button"
                style={{ 
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
              >
                <LogIn className="h-5 w-5 mr-2" />
                {loading ? "Processing..." : "Check In"}
              </Button>

              <Button
                onClick={handleCheckOut}
                disabled={!todayStatus?.checkInTime || !!todayStatus?.checkOutTime || loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-700"
                size="lg"
                type="button"
                style={{ 
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
              >
                <LogOut className="h-5 w-5 mr-2" />
                {loading ? "Processing..." : "Check Out"}
              </Button>

              <Button
                onClick={handleMarkAbsent}
                disabled={!!todayStatus?.checkInTime || todayStatus?.status === "absent" || loading}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-700"
                size="lg"
                type="button"
                style={{ 
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
              >
                <UserX className="h-5 w-5 mr-2" />
                {loading ? "Processing..." : "Mark Absent"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Absence Reason Dialog */}
      <Dialog open={isAbsentDialogOpen} onOpenChange={setIsAbsentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mark as Absent</DialogTitle>
            <DialogDescription>
              Please provide a reason for your absence (optional). This information will be recorded in your attendance record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="absent-reason">Reason for Absence</Label>
              <Textarea
                id="absent-reason"
                placeholder="Enter reason for absence (optional)..."
                value={absentNotes}
                onChange={(e) => setAbsentNotes(e.target.value)}
                className="min-h-[100px]"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAbsentDialogOpen(false);
                setAbsentNotes("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAbsentSubmit}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
              style={{ 
                backgroundColor: '#dc2626',
                color: '#ffffff'
              }}
            >
              {loading ? "Processing..." : "Mark Absent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Late Check-in Reason Dialog */}
      <Dialog open={isLateDialogOpen} onOpenChange={setIsLateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Late Check-in - Reason Required</DialogTitle>
            <DialogDescription>
              You are checking in late. Please provide a reason for your late arrival. This will be visible to your manager and admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="late-reason">Reason for Late Arrival <span className="text-red-600">*</span></Label>
              <Textarea
                id="late-reason"
                placeholder="Enter reason for late arrival (required)..."
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                className="min-h-[100px]"
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This reason will be shared with your manager and admin for attendance tracking.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsLateDialogOpen(false);
                setLateReason("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => performCheckIn(lateReason)}
              disabled={loading || !lateReason.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              style={{ 
                backgroundColor: '#ea580c',
                color: '#ffffff'
              }}
            >
              {loading ? "Processing..." : "Check In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Early Leave Reason Dialog */}
      <Dialog open={isEarlyLeaveDialogOpen} onOpenChange={setIsEarlyLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Early Leave - Reason Required</DialogTitle>
            <DialogDescription>
              You are leaving early. Please provide a reason for your early departure. This will be visible to your manager and admin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="early-leave-reason">Reason for Early Leave <span className="text-red-600">*</span></Label>
              <Textarea
                id="early-leave-reason"
                placeholder="Enter reason for early leave (required)..."
                value={earlyLeaveReason}
                onChange={(e) => setEarlyLeaveReason(e.target.value)}
                className="min-h-[100px]"
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This reason will be shared with your manager and admin for attendance tracking.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEarlyLeaveDialogOpen(false);
                setEarlyLeaveReason("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => performCheckOut(earlyLeaveReason)}
              disabled={loading || !earlyLeaveReason.trim()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              style={{ 
                backgroundColor: '#ca8a04',
                color: '#ffffff'
              }}
            >
              {loading ? "Processing..." : "Check Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-semibold">{attendanceSummary.attendanceRate}%</p>
              <p className="text-sm text-green-600">This month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-primary/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Present Days</p>
              <p className="text-2xl font-semibold">{attendanceSummary.presentDays}</p>
              <p className="text-sm text-primary">of {attendanceSummary.totalWorkingDays} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Avg Hours/Day</p>
              <p className="text-2xl font-semibold">{attendanceSummary.averageHours}</p>
              <p className="text-sm text-orange-600">hours</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Late Arrivals</p>
              <p className="text-2xl font-semibold">{attendanceSummary.lateDays}</p>
              <p className="text-sm text-red-600">this month</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList>
          <TabsTrigger value="daily">Daily Records</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">
              {selectedMonth === "current" ? "Current Month" : 
               selectedMonth === "last" ? "Last Month" :
               selectedMonth === "last-3" ? "Last 3 Months" :
               "This Year"} - Daily Attendance
            </h3>
            {loadingData ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading attendance records...</p>
              </div>
            ) : currentMonthData.length > 0 ? (
              <div className="space-y-3">
                {currentMonthData.map((record, index) => (
                  <div key={record.date || index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium">{formatDate(record.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.status === "weekend" || record.status === "holiday" ? 
                           (record.status === "weekend" ? "Weekend" : "Holiday") : 
                           record.status === "absent" ? `Absent${record.reason ? ` - ${record.reason}` : ""}` :
                           `${record.checkIn} - ${record.checkOut}`}
                        </p>
                        {record.status === "late" && record.reason && (
                          <div className="mt-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-orange-900 mb-1 uppercase tracking-wide">Late Arrival Reason</p>
                                <p className="text-sm text-orange-800 leading-relaxed">{record.reason.replace('Late Reason: ', '')}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {record.status === "early_leave" && record.reason && record.reason.includes("Early Leave Reason:") && (
                          <div className="mt-2 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 shadow-sm">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-yellow-900 mb-1 uppercase tracking-wide">Early Leave Reason</p>
                                <p className="text-sm text-yellow-800 leading-relaxed">{record.reason.split('Early Leave Reason:')[1]?.trim() || record.reason.replace('Early Leave Reason: ', '')}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {record.status === "half_day_leave" && record.reason && (
                          <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-purple-900 mb-1 uppercase tracking-wide">Half Day Leave Reason</p>
                                <p className="text-sm text-purple-800 leading-relaxed">
                                  {record.reason.includes("Reason:") 
                                    ? record.reason.split("Reason:")[1]?.trim() || record.reason.replace("Half day leave: Checked in after Check-in End Time - Reason: ", "").replace("Half day leave: Checked in after Check-in End Time", "")
                                    : record.reason.replace("Half day leave: Checked in after Check-in End Time", "").trim() || record.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {record.status !== "weekend" && record.status !== "holiday" && record.status !== "absent" && record.hours > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatHours(record.hours)}</p>
                          <p className="text-xs text-muted-foreground">worked</p>
                        </div>
                      )}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status === "half_day_leave" ? "Half Day Leave" :
                         record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1).replace(/_/g, ' ') : "Unknown"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No attendance records found for this period.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          {loadingData ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading weekly data...</p>
            </div>
          ) : (
            <Card className="p-6">
              <h3 className="mb-6">Weekly Attendance Overview</h3>
              <div className="space-y-4">
                {(() => {
                  // Get last 4 weeks of data
                  const today = new Date();
                  const weeks = [];
                  for (let i = 0; i < 4; i++) {
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - (today.getDay() + 7 * i));
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);
                    
                    const weekStartStr = weekStart.toISOString().split('T')[0];
                    const weekEndStr = weekEnd.toISOString().split('T')[0];
                    
                    const weekRecords = currentMonthData.filter(record => {
                      const recordDate = new Date(record.date);
                      return recordDate >= weekStart && recordDate <= weekEnd;
                    });
                    
                    const present = weekRecords.filter(r => r.status === 'present' || r.status === 'late').length;
                    const absent = weekRecords.filter(r => r.status === 'absent').length;
                    const late = weekRecords.filter(r => r.status === 'late').length;
                    const totalHours = weekRecords.reduce((sum, r) => sum + (r.hours || 0), 0);
                    
                    weeks.push({
                      week: `Week ${4 - i}`,
                      startDate: weekStartStr,
                      endDate: weekEndStr,
                      present,
                      absent,
                      late,
                      totalHours: totalHours.toFixed(1),
                      days: weekRecords.length
                    });
                  }
                  
                  return weeks.reverse().map((week, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{week.week}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                            {new Date(week.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {week.days > 0 ? Math.round((week.present / week.days) * 100) : 0}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Present</p>
                          <p className="font-medium text-green-600">{week.present} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Absent</p>
                          <p className="font-medium text-red-600">{week.absent} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Late</p>
                          <p className="font-medium text-orange-600">{week.late} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hours</p>
                          <p className="font-medium">{week.totalHours}h</p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          {loadingData ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading monthly statistics...</p>
            </div>
          ) : monthlyStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No monthly statistics available yet.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Monthly Attendance Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="present" fill="#22c55e" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                  <Bar dataKey="late" fill="#f97316" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Monthly Statistics</h3>
              <div className="space-y-4">
                {monthlyStats.slice(-3).map((month) => (
                  <div key={month.month} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{month.month} {new Date().getFullYear()}</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {Math.round((month.present / (month.present + month.absent)) * 100)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Present</p>
                        <p className="font-medium text-green-600">{month.present} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Absent</p>
                        <p className="font-medium text-red-600">{month.absent} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Hours</p>
                        <p className="font-medium">{month.hours}h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {loadingData ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading trends data...</p>
            </div>
          ) : monthlyStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No trends data available yet.</p>
            </div>
          ) : (
          <>
          <Card className="p-6">
            <h3 className="mb-6">Attendance Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#22c55e" 
                  strokeWidth="3"
                  name="Present Days"
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3b82f6" 
                  strokeWidth="2"
                  name="Total Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">↑ 5%</div>
              <p className="text-sm text-muted-foreground">Attendance improvement</p>
              <p className="text-xs text-muted-foreground">vs last quarter</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{attendanceSummary.averageHours}h</div>
              <p className="text-sm text-muted-foreground">Average daily hours</p>
              <p className="text-xs text-muted-foreground">this year</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">{attendanceSummary.attendanceRate}%</div>
              <p className="text-sm text-muted-foreground">Overall attendance</p>
              <p className="text-xs text-muted-foreground">year to date</p>
            </Card>
          </div>
          </>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h3 className="mb-6">Calendar View</h3>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-100 rounded border-2 border-green-500"></div>
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-100 rounded border-2 border-red-500"></div>
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-100 rounded border-2 border-orange-500"></div>
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-100 rounded border-2 border-blue-500"></div>
                  <span className="text-sm">Leave</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-100 rounded border-2 border-gray-400"></div>
                  <span className="text-sm">Weekend/Holiday</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span className="font-medium">
                      {currentMonthData.filter(r => {
                        const recordDate = new Date(r.date);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return recordDate >= weekAgo && (r.status === "present" || r.status === "late");
                      }).length}/5 days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="font-medium">{attendanceSummary.presentDays}/{attendanceSummary.totalWorkingDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Best Streak</span>
                    <span className="font-medium">
                      {(() => {
                        let maxStreak = 0;
                        let currentStreak = 0;
                        currentMonthData.forEach(r => {
                          if (r.status === "present" || r.status === "late") {
                            currentStreak++;
                            maxStreak = Math.max(maxStreak, currentStreak);
                          } else {
                            currentStreak = 0;
                          }
                        });
                        return maxStreak;
                      })()} days
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




