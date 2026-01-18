import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { LogIn, LogOut, Clock, Calendar, Search, RefreshCw } from "lucide-react";
import { LoadingPage } from "../LoadingPage";

interface UserActivity {
  userId: string;
  name: string;
  email: string;
  employeeId?: string;
  usertype: string;
  department?: string;
  lastLogin: {
    timestamp: string;
    location?: string;
    ipAddress?: string;
  } | null;
  lastLogout: {
    timestamp: string;
    location?: string;
    ipAddress?: string;
  } | null;
  todayCheckIn: string | null;
  todayCheckOut: string | null;
  todayStatus: string;
  shift?: "day" | "night";
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    early_leave: number;
    on_leave: number;
    wfh: number;
  };
  totalDays: number;
}

export function TeamActivity() {
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUserActivity();
  }, []);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/manager/user-activity", {
        withCredentials: true
      });
      if (response.data && response.data.users) {
        setUserActivity(response.data.users);
      }
    } catch (error) {
      console.error("❌ Error fetching user activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivity = userActivity.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.employeeId && user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      case 'on_leave':
        return 'bg-blue-500';
      case 'wfh':
        return 'bg-purple-500';
      case 'early_leave':
        return 'bg-orange-500';
      case 'half_day_leave':
        return 'bg-purple-600';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Activity</h2>
          <p className="text-muted-foreground">View login, logout, check-in, check-out, and attendance data for your team</p>
        </div>
        <Button onClick={fetchUserActivity} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Activity Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Last Logout</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Today Status</TableHead>
              <TableHead>Absent (30d)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivity.length > 0 ? (
              filteredActivity.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-mono text-xs">
                    {user.employeeId || user.userId.substring(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={user.shift === "night" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"}>
                      {user.shift === "night" ? "Night" : "Day"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {user.lastLogin ? (
                      <div>
                        <div className="flex items-center gap-1">
                          <LogIn className="h-3 w-3 text-green-600" />
                          {new Date(user.lastLogin.timestamp).toLocaleString()}
                        </div>
                        {user.lastLogin.location && (
                          <div className="text-muted-foreground text-xs mt-1">
                            {user.lastLogin.location}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {user.lastLogout ? (
                      <div>
                        <div className="flex items-center gap-1">
                          <LogOut className="h-3 w-3 text-red-600" />
                          {new Date(user.lastLogout.timestamp).toLocaleString()}
                        </div>
                        {user.lastLogout.location && (
                          <div className="text-muted-foreground text-xs mt-1">
                            {user.lastLogout.location}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {user.todayCheckIn ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        {new Date(user.todayCheckIn).toLocaleTimeString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {user.todayCheckOut ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-orange-600" />
                        {new Date(user.todayCheckOut).toLocaleTimeString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.todayStatus)}>
                      {user.todayStatus === "half_day_leave" ? "Half Day Leave" :
                       user.todayStatus ? user.todayStatus.charAt(0).toUpperCase() + user.todayStatus.slice(1).replace(/_/g, ' ') : 'absent'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-red-600">
                      {user.attendanceStats?.absent || 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No team members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

