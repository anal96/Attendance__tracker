import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckCircle, XCircle, Clock, AlertTriangle, Calendar, UserCheck, Edit, Save, Search } from "lucide-react";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: "present" | "absent" | "late" | "on_leave" | "wfh" | "early_leave";
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  project: string;
  email?: string;
  employeeId?: string;
  _id?: string;
  shift?: "day" | "night";
}

export function TeamAttendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (teamMembers.length > 0) {
      fetchMonthlyStats();
    }
  }, [teamMembers]);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, teamMembers]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/manager/team-members", {
        withCredentials: true,
      });
      // Map the response to match TeamMember interface
      const mappedData = Array.isArray(response.data) ? response.data.map((member: any) => ({
        id: member._id || member.id,
        _id: member._id || member.id,
        name: member.name || '',
        role: member.role || 'employee',
        status: member.status || 'active',
        checkIn: member.checkIn || '',
        checkOut: member.checkOut || '',
        notes: member.notes || '',
        project: member.project || member.department || '',
        email: member.email || '',
        employeeId: member.employeeId || '',
        shift: member.shift || 'day'
      })) : [];
      setTeamMembers(mappedData);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = teamMembers;
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMembers(filtered);
  };

  const updateMemberStatus = async (memberId: string, status: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/team-members/${memberId}/status`,
        { status },
        { withCredentials: true }
      );
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating member status:", error);
    }
  };

  const updateMemberTime = async (memberId: string, type: "checkIn" | "checkOut", time: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/team-members/${memberId}/time`,
        { [type]: time },
        { withCredentials: true }
      );
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating member time:", error);
    }
  };

  const updateMemberShift = async (memberId: string, shift: "day" | "night") => {
    try {
      await axios.put(
        `http://localhost:5000/api/manager/update-employee-shift/${memberId}`,
        { shift },
        { withCredentials: true }
      );
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating member shift:", error);
      alert("Failed to update shift. Please try again.");
    }
  };

  const updateMemberNotes = async (memberId: string, notes: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/team-members/${memberId}/notes`,
        { notes },
        { withCredentials: true }
      );
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating member notes:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = lastDayOfMonth.toISOString().split('T')[0];

      const response = await axios.get(
        `http://localhost:5000/api/manager/monthly-attendance?startDate=${startDate}&endDate=${endDate}`,
        { withCredentials: true }
      );

      const stats: Record<string, any> = {};
      if (response.data && response.data.employees) {
        response.data.employees.forEach((emp: any) => {
          const memberId = teamMembers.find(m => m._id === emp.employeeId || m.id === emp.employeeId)?.id || emp.employeeId;
          if (memberId && emp.stats) {
            stats[memberId] = emp.stats;
          }
        });
      }

      setMonthlyStats(stats);
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "late":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "on_leave":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "wfh":
        return <UserCheck className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-orange-100 text-orange-800";
      case "on_leave":
        return "bg-blue-100 text-blue-800";
      case "wfh":
        return "bg-purple-100 text-purple-800";
      case "half_day_leave":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) return;
    // Implement bulk action logic
    setBulkAction("");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Attendance</h1>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mark_present">Mark as Present</SelectItem>
                <SelectItem value="mark_absent">Mark as Absent</SelectItem>
                <SelectItem value="mark_late">Mark as Late</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleBulkAction} disabled={!bulkAction}>
              Apply
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No team members found</div>
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(member.status)}
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.project}</p>
                        {member.shift && (
                          <Badge className={member.shift === "night" ? "bg-indigo-100 text-indigo-800 text-xs mt-1" : "bg-yellow-100 text-yellow-800 text-xs mt-1"}>
                            {member.shift === "night" ? "Night Shift" : "Day Shift"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  {editingMember === member.id ? (
                    <div className="space-y-3">
                      <Select 
                        value={member.status} 
                        onValueChange={(value) => updateMemberStatus(member.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="wfh">Work From Home</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {(member.status === "present" || member.status === "late" || member.status === "wfh") && (
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Check In"
                            value={member.checkIn || ""}
                            onChange={(e) => updateMemberTime(member.id, "checkIn", e.target.value)}
                          />
                          <Input
                            placeholder="Check Out"
                            value={member.checkOut || ""}
                            onChange={(e) => updateMemberTime(member.id, "checkOut", e.target.value)}
                          />
                        </div>
                      )}
                      
                      <Select 
                        value={member.shift || "day"} 
                        onValueChange={(value: "day" | "night") => updateMemberShift(member._id || member.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day Shift</SelectItem>
                          <SelectItem value="night">Night Shift</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Textarea
                        placeholder="Notes (optional)"
                        value={member.notes || ""}
                        onChange={(e) => updateMemberNotes(member.id, e.target.value)}
                        rows={2}
                      />
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => setEditingMember(null)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge className={getStatusColor(member.status)}>
                        {member.status === "half_day_leave" ? "Half Day Leave" :
                         member.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      
                      {member.checkIn && (
                        <div className="text-sm">
                          <p><span className="font-medium">In:</span> {member.checkIn}</p>
                          {member.checkOut && <p><span className="font-medium">Out:</span> {member.checkOut}</p>}
                        </div>
                      )}
                      
                      {member.notes && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {member.notes}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Weekly Attendance Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Employee</th>
                    <th className="text-center p-2">Mon</th>
                    <th className="text-center p-2">Tue</th>
                    <th className="text-center p-2">Wed</th>
                    <th className="text-center p-2">Thu</th>
                    <th className="text-center p-2">Fri</th>
                    <th className="text-center p-2">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.slice(0, 6).map((member) => (
                    <tr key={member.id} className="border-b">
                      <td className="p-2 font-medium">{member.name}</td>
                      <td className="text-center p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="text-center p-2">
                        <Badge className="bg-primary/10 text-primary">95%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6 text-lg font-semibold">Monthly Attendance Overview</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading monthly data...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No team members found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Employee ID</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-center p-3">Shift</th>
                      <th className="text-center p-3">Present</th>
                      <th className="text-center p-3">Absent</th>
                      <th className="text-center p-3">Late</th>
                      <th className="text-center p-3">Early Leave</th>
                      <th className="text-center p-3">On Leave</th>
                      <th className="text-center p-3">WFH</th>
                      <th className="text-center p-3">Total Days</th>
                      <th className="text-center p-3">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => {
                      const stats = monthlyStats[member.id] || {
                        present: 0,
                        absent: 0,
                        late: 0,
                        earlyLeave: 0,
                        onLeave: 0,
                        wfh: 0,
                        totalDays: 0,
                        attendanceRate: 0
                      };
                      return (
                        <tr key={member.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-mono text-xs">{member.employeeId || member.id.substring(0, 8)}</td>
                          <td className="p-3 font-medium">{member.name}</td>
                          <td className="p-3">{member.email || "N/A"}</td>
                          <td className="p-3 text-center">
                            <Badge className={member.shift === "night" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"}>
                              {member.shift === "night" ? "Night" : "Day"}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-green-100 text-green-800">{stats.present}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-red-100 text-red-800">{stats.absent}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-orange-100 text-orange-800">{stats.late}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-yellow-100 text-yellow-800">{stats.earlyLeave}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-blue-100 text-blue-800">{stats.onLeave}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-purple-100 text-purple-800">{stats.wfh}</Badge>
                          </td>
                          <td className="p-3 text-center font-medium">{stats.totalDays}</td>
                          <td className="p-3 text-center">
                            <Badge className={stats.attendanceRate >= 90 ? "bg-green-100 text-green-800" : stats.attendanceRate >= 70 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                              {stats.attendanceRate}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Attendance Trends & Insights</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>Trend analysis will be available soon</p>
              <p className="text-sm mt-2">Based on historical attendance data</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TeamAttendance;
