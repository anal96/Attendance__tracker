import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar, Clock, UserCheck, FileText, Plus, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Cookies from "js-cookie";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string | { _id: string; name?: string };
  assignedBy?: string | { _id: string; name?: string };
}

interface LeaveApplication {
  _id: string;
  leavetype?: { type: string } | string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

interface Handover {
  _id?: string;
  fromEmployee: string;
  fromEmployeeId: string;
  fromUserType?: string; // "manager" | "employee"
  toEmployee: string;
  toEmployeeId: string;
  startDate: string | Date;
  endDate: string | Date;
  tasks?: Task[] | string[]; // Array of task objects or IDs
  responsibilities: string[] | string; // Keep for backward compatibility
  approvedLeave?: LeaveApplication | string; // Leave object or ID
  handoverNotes: string;
  status: "pending" | "active" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  department?: string;
}

interface DutyHandoverProps {
  userType?: "manager" | "employee";
}

export function DutyHandover({ userType }: DutyHandoverProps) {
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHandover, setEditingHandover] = useState<Handover | null>(null);
  const [currentUser, setCurrentUser] = useState<{ _id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    fromEmployeeId: "",
    toEmployeeId: "",
    startDate: new Date(),
    endDate: new Date(),
    tasks: [] as string[], // Array of task IDs
    responsibilities: "", // Keep for backward compatibility
    approvedLeave: "", // Leave ID
    handoverNotes: ""
  });

  // Determine user type from cookies if not provided
  const actualUserType = userType || Cookies.get("userType") || "manager";

  useEffect(() => {
    fetchCurrentUser();
    fetchTeamMembers();
    fetchHandovers();
    fetchAvailableTasks();
    fetchApprovedLeaves();
  }, []);

  // Refetch tasks and leaves when fromEmployeeId changes
  useEffect(() => {
    if (formData.fromEmployeeId) {
      fetchAvailableTasks();
      fetchApprovedLeaves();
    }
  }, [formData.fromEmployeeId]);

  const fetchCurrentUser = async () => {
    try {
      const userId = Cookies.get("userId");
      if (!userId) {
        console.error("No user ID found in cookies");
        return;
      }

      if (actualUserType === "manager") {
        // Fetch manager info from API
        try {
          const response = await axios.get("http://localhost:5000/api/manager/dashboard", {
            withCredentials: true
          });
          
          if (response.data.managerInfo) {
            setCurrentUser({
              _id: userId,
              name: response.data.managerInfo.name || Cookies.get("username") || "Manager"
            });
            setFormData(prev => ({
              ...prev,
              fromEmployeeId: userId
            }));
            return;
          }
        } catch (error) {
          console.error("Error fetching manager info:", error);
        }
      } else {
        // Fetch employee info from API
        try {
          const response = await axios.get("http://localhost:5000/api/employee/profile", {
            withCredentials: true
          });
          
          if (response.data) {
            setCurrentUser({
              _id: userId,
              name: response.data.name || Cookies.get("username") || "Employee"
            });
            setFormData(prev => ({
              ...prev,
              fromEmployeeId: userId
            }));
            return;
          }
        } catch (error) {
          console.error("Error fetching employee info:", error);
        }
      }

      // Fallback to cookies
      const userName = Cookies.get("username") || (actualUserType === "manager" ? "Manager" : "Employee");
      setCurrentUser({
        _id: userId,
        name: userName
      });
      setFormData(prev => ({
        ...prev,
        fromEmployeeId: userId
      }));
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      let response;
      if (actualUserType === "employee") {
        // For employees, fetch all other employees
        response = await axios.get("http://localhost:5000/api/employee/employees", {
          withCredentials: true
        });
        // Handle both array response and object with employees property
        let employees = [];
        if (Array.isArray(response.data)) {
          employees = response.data;
        } else if (response.data && Array.isArray(response.data.employees)) {
          employees = response.data.employees;
        }
        console.log("Fetched employees for duty handover:", employees.length, employees);
        setTeamMembers(employees);
      } else {
        // For managers, fetch team members
        response = await axios.get("http://localhost:5000/api/manager/team-members", {
          withCredentials: true
        });
        // Handle both array response and object with teamMembers property
        let members = [];
        if (Array.isArray(response.data)) {
          members = response.data;
        } else if (response.data && Array.isArray(response.data.teamMembers)) {
          members = response.data.teamMembers;
        }
        console.log("Fetched team members for duty handover:", members.length, members);
        setTeamMembers(members);
      }
    } catch (error) {
      console.error("Error fetching team members/employees:", error);
      try {
        const response = await axios.get("http://localhost:5000/view_employees", {
          withCredentials: true
        });
        const employees = response.data || [];
        // Filter to only show employees (exclude current user and managers for employee view)
        const filteredEmployees = actualUserType === "employee"
          ? employees.filter((emp: any) => emp.usertype === "employee" && emp._id !== Cookies.get("userId"))
          : employees.filter((emp: any) => emp.usertype === "employee");
        
        // Format employees to match expected structure
        const formattedEmployees = filteredEmployees.map((emp: any) => ({
          _id: emp._id || emp.id,
          name: emp.name || emp.email || emp.employeeId || 'Employee',
          email: emp.email || '',
          department: emp.department || ''
        }));
        console.log("Fetched employees from fallback endpoint:", formattedEmployees.length);
        setTeamMembers(formattedEmployees);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setTeamMembers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHandovers = async () => {
    try {
      // Use the unified endpoint that works for both managers and employees
      const response = await axios.get("http://localhost:5000/api/duty-handovers", {
        withCredentials: true
      });
      const handovers = response.data.handovers || [];
      console.log("Fetched duty handovers:", handovers.length, handovers);
      setHandovers(handovers);
    } catch (error) {
      console.error("Error fetching handovers:", error);
      setHandovers([]);
    }
  };

  const fetchAvailableTasks = async (employeeId?: string) => {
    try {
      const fromEmployeeId = employeeId || formData.fromEmployeeId || currentUser?._id || Cookies.get("userId");
      if (!fromEmployeeId) return;

      const response = await axios.get("http://localhost:5000/api/tasks", {
        withCredentials: true
      });
      
      const allTasks = Array.isArray(response.data) ? response.data : [];
      // Filter tasks assigned to the "from" employee (tasks they need to handover)
      const tasksForHandover = allTasks.filter((task: Task) => {
        const assignedToId = typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo;
        return assignedToId === fromEmployeeId && task.status !== 'completed';
      });
      
      console.log("Fetched available tasks for handover:", tasksForHandover.length);
      setAvailableTasks(tasksForHandover);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setAvailableTasks([]);
    }
  };

  const fetchApprovedLeaves = async (employeeId?: string) => {
    try {
      const fromEmployeeId = employeeId || formData.fromEmployeeId || currentUser?._id || Cookies.get("userId");
      if (!fromEmployeeId) return;

      // Fetch approved leaves for the "from" employee
      const response = await axios.get("http://localhost:5000/leave_applications_Employee", {
        withCredentials: true
      });
      
      const allLeaves = Array.isArray(response.data) ? response.data : [];
      // Filter only approved leaves
      const approved = allLeaves.filter((leave: LeaveApplication) => 
        leave.status === 'approved' && 
        (typeof leave.employeeId === 'object' ? leave.employeeId?._id : leave.employeeId) === fromEmployeeId
      );
      
      console.log("Fetched approved leaves:", approved.length);
      setApprovedLeaves(approved);
    } catch (error) {
      console.error("Error fetching approved leaves:", error);
      setApprovedLeaves([]);
    }
  };

  const handleCreateHandover = async () => {
    if (!formData.fromEmployeeId || !formData.toEmployeeId || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields!");
      return;
    }

    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(formData.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(formData.endDate);
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

    if (!currentUser) {
      alert("User information not loaded. Please refresh the page.");
      return;
    }

    try {
      const toEmployee = teamMembers.find(m => m._id === formData.toEmployeeId);

      const payload = {
        fromEmployeeId: formData.fromEmployeeId, // This is the user's ID
        fromEmployee: currentUser.name, // Use user's name
        toEmployeeId: formData.toEmployeeId,
        toEmployee: toEmployee?.name || "",
        startDate: format(formData.startDate, "yyyy-MM-dd"),
        endDate: format(formData.endDate, "yyyy-MM-dd"),
        tasks: formData.tasks, // Array of task IDs
        responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').filter(r => r.trim()) : [], // Keep for backward compatibility
        approvedLeave: formData.approvedLeave || undefined, // Leave ID
        handoverNotes: formData.handoverNotes,
        status: "pending"
      };

      // Use the unified endpoint that works for both managers and employees
      const response = await axios.post(
        "http://localhost:5000/api/duty-handover",
        payload,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Duty handover created successfully!");
        setIsCreateDialogOpen(false);
        resetForm();
        await fetchHandovers();
      }
    } catch (error: any) {
      console.error("Error creating handover:", error);
      alert(error.response?.data?.error || "Failed to create duty handover");
    }
  };

  const handleUpdateHandover = async () => {
    if (!editingHandover?._id) return;

    try {
      // Extract task IDs from tasks array (could be objects or IDs)
      const taskIds = editingHandover.tasks 
        ? (Array.isArray(editingHandover.tasks) 
          ? editingHandover.tasks.map(t => typeof t === 'object' ? t._id : t)
          : [])
        : [];

      // Extract approved leave ID
      const approvedLeaveId = editingHandover.approvedLeave
        ? (typeof editingHandover.approvedLeave === 'object' 
          ? editingHandover.approvedLeave._id 
          : editingHandover.approvedLeave)
        : undefined;

      const payload: any = {
        status: editingHandover.status,
        handoverNotes: editingHandover.handoverNotes,
        tasks: taskIds,
        approvedLeave: approvedLeaveId,
        responsibilities: Array.isArray(editingHandover.responsibilities) 
          ? editingHandover.responsibilities 
          : (editingHandover.responsibilities || "").split('\n').filter(r => r.trim())
      };

      // Include dates if they were changed
      if (editingHandover.startDate) {
        payload.startDate = typeof editingHandover.startDate === 'string' 
          ? editingHandover.startDate 
          : format(new Date(editingHandover.startDate), "yyyy-MM-dd");
      }
      if (editingHandover.endDate) {
        payload.endDate = typeof editingHandover.endDate === 'string' 
          ? editingHandover.endDate 
          : format(new Date(editingHandover.endDate), "yyyy-MM-dd");
      }

      // Include toEmployeeId if changed
      if (editingHandover.toEmployeeId) {
        payload.toEmployeeId = editingHandover.toEmployeeId;
        const toEmployee = teamMembers.find(m => m._id === editingHandover.toEmployeeId);
        if (toEmployee) {
          payload.toEmployee = toEmployee.name;
        }
      }

      const response = await axios.put(
        `http://localhost:5000/api/manager/duty-handover/${editingHandover._id}`,
        payload,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Handover updated successfully!");
        setIsEditDialogOpen(false);
        setEditingHandover(null);
        await fetchHandovers();
      }
    } catch (error: any) {
      console.error("Error updating handover:", error);
      alert(error.response?.data?.error || "Failed to update handover");
    }
  };

  const handleDeleteHandover = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this handover?")) return;

    try {
      // Use the unified endpoint that works for both managers and employees
      const response = await axios.delete(
        `http://localhost:5000/api/duty-handover/${id}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Handover deleted successfully!");
        await fetchHandovers();
      }
    } catch (error: any) {
      console.error("Error deleting handover:", error);
      alert(error.response?.data?.error || "Failed to delete handover");
    }
  };

  const resetForm = () => {
    const userId = currentUser?._id || Cookies.get("userId") || "";
    setFormData({
      fromEmployeeId: userId, // Keep user's ID
      toEmployeeId: "",
      startDate: new Date(),
      endDate: new Date(),
      tasks: [],
      responsibilities: "",
      approvedLeave: "",
      handoverNotes: ""
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-orange-600" />;
      case "active": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Helper function to render handover details (tasks, approved leave, responsibilities)
  const renderHandoverDetails = (handover: Handover) => (
    <>
      {handover.approvedLeave && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">Linked Approved Leave:</p>
          {typeof handover.approvedLeave === 'object' ? (
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {typeof handover.approvedLeave.leavetype === 'object' 
                ? handover.approvedLeave.leavetype?.type 
                : handover.approvedLeave.leavetype || 'Leave'} - {format(new Date(handover.approvedLeave.startDate), "MMM dd")} to {format(new Date(handover.approvedLeave.endDate), "MMM dd, yyyy")} ({handover.approvedLeave.days} days)
            </p>
          ) : (
            <p className="text-xs text-blue-700 dark:text-blue-300">Leave ID: {handover.approvedLeave}</p>
          )}
        </div>
      )}
      {handover.tasks && Array.isArray(handover.tasks) && handover.tasks.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Tasks:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {handover.tasks.map((task, idx) => {
              const taskTitle = typeof task === 'object' ? task.title : `Task ${idx + 1}`;
              const taskDesc = typeof task === 'object' ? task.description : null;
              return (
                <li key={idx}>
                  {taskTitle}
                  {taskDesc && <span className="text-xs ml-2">- {taskDesc}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {handover.responsibilities && (Array.isArray(handover.responsibilities) ? handover.responsibilities.length > 0 : handover.responsibilities) && (
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Additional Responsibilities:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {(Array.isArray(handover.responsibilities) 
              ? handover.responsibilities 
              : typeof handover.responsibilities === 'string' 
                ? handover.responsibilities.split('\n').filter(r => r.trim())
                : []).map((resp, idx) => (
              <li key={idx}>{resp}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  const pendingHandovers = handovers.filter(h => h.status === "pending");
  const activeHandovers = handovers.filter(h => h.status === "active");
  const completedHandovers = handovers.filter(h => h.status === "completed");

  // For employees, categorize handovers
  const currentUserId = currentUser?._id || Cookies.get("userId") || "";
  const receivedFromManager = handovers.filter(h => 
    h.toEmployeeId === currentUserId && h.fromUserType === "manager"
  );
  const receivedFromEmployee = handovers.filter(h => 
    h.toEmployeeId === currentUserId && h.fromUserType === "employee" && h.fromEmployeeId !== currentUserId
  );
  const sentByMe = handovers.filter(h => 
    h.fromEmployeeId === currentUserId
  );

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Duty Handover</h2>
          <p className="text-muted-foreground">
            {actualUserType === "employee" 
              ? "Manage work handovers to other employees" 
              : "Manage work handovers between team members"}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Handover
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold">{pendingHandovers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold">{activeHandovers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold">{completedHandovers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={actualUserType === "employee" ? "received" : "all"} className="space-y-6">
        <TabsList>
          {actualUserType === "employee" ? (
            <>
              <TabsTrigger value="received">Received ({receivedFromManager.length + receivedFromEmployee.length})</TabsTrigger>
              <TabsTrigger value="from-manager">From Manager ({receivedFromManager.length})</TabsTrigger>
              <TabsTrigger value="from-employee">From Employee ({receivedFromEmployee.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent by Me ({sentByMe.length})</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="all">All ({handovers.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingHandovers.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeHandovers.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedHandovers.length})</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {handovers.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">No handovers found.</p>
            </Card>
          ) : (
            handovers.map((handover) => (
              <Card key={handover._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{handover.fromEmployee} → {handover.toEmployee}</h3>
                      <Badge className={getStatusColor(handover.status)}>
                        {getStatusIcon(handover.status)}
                        <span className="ml-1">{handover.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                    </div>
                    {handover.approvedLeave && (
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">Linked Approved Leave:</p>
                        {typeof handover.approvedLeave === 'object' ? (
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            {typeof handover.approvedLeave.leavetype === 'object' 
                              ? handover.approvedLeave.leavetype?.type 
                              : handover.approvedLeave.leavetype || 'Leave'} - {format(new Date(handover.approvedLeave.startDate), "MMM dd")} to {format(new Date(handover.approvedLeave.endDate), "MMM dd, yyyy")} ({handover.approvedLeave.days} days)
                          </p>
                        ) : (
                          <p className="text-xs text-blue-700 dark:text-blue-300">Leave ID: {handover.approvedLeave}</p>
                        )}
                      </div>
                    )}
                    {handover.tasks && Array.isArray(handover.tasks) && handover.tasks.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Tasks:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {handover.tasks.map((task, idx) => {
                            const taskTitle = typeof task === 'object' ? task.title : `Task ${idx + 1}`;
                            const taskDesc = typeof task === 'object' ? task.description : null;
                            return (
                              <li key={idx}>
                                {taskTitle}
                                {taskDesc && <span className="text-xs ml-2">- {taskDesc}</span>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {handover.responsibilities && (Array.isArray(handover.responsibilities) ? handover.responsibilities.length > 0 : handover.responsibilities) && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Additional Responsibilities:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {(Array.isArray(handover.responsibilities) 
                            ? handover.responsibilities 
                            : typeof handover.responsibilities === 'string' 
                              ? handover.responsibilities.split('\n').filter(r => r.trim())
                              : []).map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {handover.handoverNotes && (
                      <div className="mt-3 p-3 !bg-gray-100 dark:!bg-gray-800/70 rounded-lg border-l-4 border-gray-300 dark:border-gray-600">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-semibold text-gray-900 dark:text-gray-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        setEditingHandover(handover);
                        setIsEditDialogOpen(true);
                        // Fetch tasks and leaves for this handover's fromEmployeeId
                        if (handover.fromEmployeeId) {
                          fetchAvailableTasks(handover.fromEmployeeId);
                          fetchApprovedLeaves(handover.fromEmployeeId);
                        }
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handover._id && handleDeleteHandover(handover._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Employee View - Received Handovers */}
        {actualUserType === "employee" && (
          <>
            <TabsContent value="received" className="space-y-4">
              {receivedFromManager.length === 0 && receivedFromEmployee.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No received handovers found.</p>
                </Card>
              ) : (
                <>
                  {receivedFromManager.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold">From Managers</h3>
                      </div>
                      {receivedFromManager.map((handover) => (
                        <Card key={handover._id} className="p-6 !bg-purple-50 dark:!bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100">From Manager</Badge>
                                <h3 className="font-medium text-foreground">{handover.fromEmployee} → You</h3>
                                <Badge className={getStatusColor(handover.status)}>
                                  {getStatusIcon(handover.status)}
                                  <span className="ml-1">{handover.status}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                              </div>
                              {handover.responsibilities && (Array.isArray(handover.responsibilities) ? handover.responsibilities.length > 0 : handover.responsibilities) && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium mb-1">Responsibilities:</p>
                                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {(Array.isArray(handover.responsibilities) 
                                      ? handover.responsibilities 
                                      : typeof handover.responsibilities === 'string' 
                                        ? handover.responsibilities.split('\n').filter(r => r.trim())
                                        : []).map((resp, idx) => (
                                      <li key={idx}>{resp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {handover.handoverNotes && (
                                <div className="mt-3 p-3 !bg-purple-100 dark:!bg-purple-800/70 rounded-lg border-l-4 border-purple-400 dark:border-purple-400">
                                  <p className="text-sm text-gray-900 dark:text-gray-100">
                                    <span className="font-semibold text-purple-900 dark:text-purple-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingHandover(handover);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  {receivedFromEmployee.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold">From Employees</h3>
                      </div>
                      {receivedFromEmployee.map((handover) => (
                        <Card key={handover._id} className="p-6 !bg-blue-50 dark:!bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">From Employee</Badge>
                                <h3 className="font-medium text-foreground">{handover.fromEmployee} → You</h3>
                                <Badge className={getStatusColor(handover.status)}>
                                  {getStatusIcon(handover.status)}
                                  <span className="ml-1">{handover.status}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                              </div>
                              {renderHandoverDetails(handover)}
                              {handover.handoverNotes && (
                                <div className="mt-3 p-3 !bg-blue-100 dark:!bg-blue-800/70 rounded-lg border-l-4 border-blue-400 dark:border-blue-400">
                                  <p className="text-sm text-gray-900 dark:text-gray-100">
                                    <span className="font-semibold text-blue-900 dark:text-blue-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingHandover(handover);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="from-manager" className="space-y-4">
              {receivedFromManager.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No handovers from managers.</p>
                </Card>
              ) : (
                receivedFromManager.map((handover) => (
                  <Card key={handover._id} className="p-6 !bg-purple-50 dark:!bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100">From Manager</Badge>
                          <h3 className="font-medium text-foreground">{handover.fromEmployee} → You</h3>
                          <Badge className={getStatusColor(handover.status)}>
                            {getStatusIcon(handover.status)}
                            <span className="ml-1">{handover.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                        </div>
                        {renderHandoverDetails(handover)}
                        {handover.handoverNotes && (
                          <div className="mt-3 p-3 !bg-purple-100 dark:!bg-purple-800/70 rounded-lg border-l-4 border-purple-400 dark:border-purple-400">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              <span className="font-semibold text-purple-900 dark:text-purple-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setEditingHandover(handover);
                            setIsEditDialogOpen(true);
                            // Fetch tasks and leaves for this handover's fromEmployeeId
                            if (handover.fromEmployeeId) {
                              fetchAvailableTasks(handover.fromEmployeeId);
                              fetchApprovedLeaves(handover.fromEmployeeId);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="from-employee" className="space-y-4">
              {receivedFromEmployee.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No handovers from employees.</p>
                </Card>
              ) : (
                receivedFromEmployee.map((handover) => (
                  <Card key={handover._id} className="p-6 !bg-blue-50 dark:!bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100">From Employee</Badge>
                          <h3 className="font-medium text-foreground">{handover.fromEmployee} → You</h3>
                          <Badge className={getStatusColor(handover.status)}>
                            {getStatusIcon(handover.status)}
                            <span className="ml-1">{handover.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                        </div>
                        {renderHandoverDetails(handover)}
                        {handover.handoverNotes && (
                          <div className="mt-3 p-3 !bg-blue-100 dark:!bg-blue-800/70 rounded-lg border-l-4 border-blue-400 dark:border-blue-400">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              <span className="font-semibold text-blue-900 dark:text-blue-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setEditingHandover(handover);
                            setIsEditDialogOpen(true);
                            // Fetch tasks and leaves for this handover's fromEmployeeId
                            if (handover.fromEmployeeId) {
                              fetchAvailableTasks(handover.fromEmployeeId);
                              fetchApprovedLeaves(handover.fromEmployeeId);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {sentByMe.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No handovers sent by you.</p>
                </Card>
              ) : (
                sentByMe.map((handover) => (
                  <Card key={handover._id} className="p-6 !bg-green-50 dark:!bg-green-900/30 border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">Sent by You</Badge>
                          <h3 className="font-medium text-foreground">You → {handover.toEmployee}</h3>
                          <Badge className={getStatusColor(handover.status)}>
                            {getStatusIcon(handover.status)}
                            <span className="ml-1">{handover.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                        </div>
                        {renderHandoverDetails(handover)}
                        {handover.handoverNotes && (
                          <div className="mt-3 p-3 !bg-green-100 dark:!bg-green-800/70 rounded-lg border-l-4 border-green-400 dark:border-green-400">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              <span className="font-semibold text-green-900 dark:text-green-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setEditingHandover(handover);
                            setIsEditDialogOpen(true);
                            // Fetch tasks and leaves for this handover's fromEmployeeId
                            if (handover.fromEmployeeId) {
                              fetchAvailableTasks(handover.fromEmployeeId);
                              fetchApprovedLeaves(handover.fromEmployeeId);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handover._id && handleDeleteHandover(handover._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </>
        )}

        {/* Manager View - Status Tabs */}
        {actualUserType === "manager" && (
          <>
            <TabsContent value="pending" className="space-y-4">
              {pendingHandovers.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No pending handovers.</p>
                </Card>
              ) : (
                pendingHandovers.map((handover) => (
                  <Card key={handover._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{handover.fromEmployee} → {handover.toEmployee}</h3>
                          <Badge className={getStatusColor(handover.status)}>
                            {getStatusIcon(handover.status)}
                            <span className="ml-1">{handover.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                        </div>
                        {renderHandoverDetails(handover)}
                        {handover.handoverNotes && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">Notes:</span> {handover.handoverNotes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setEditingHandover(handover);
                            setIsEditDialogOpen(true);
                            // Fetch tasks and leaves for this handover's fromEmployeeId
                            if (handover.fromEmployeeId) {
                              fetchAvailableTasks(handover.fromEmployeeId);
                              fetchApprovedLeaves(handover.fromEmployeeId);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handover._id && handleDeleteHandover(handover._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeHandovers.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No active handovers.</p>
                </Card>
              ) : (
                activeHandovers.map((handover) => (
                  <Card key={handover._id} className="p-6 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{handover.fromEmployee} → {handover.toEmployee}</h3>
                          <Badge className={getStatusColor(handover.status)}>
                            {getStatusIcon(handover.status)}
                            <span className="ml-1">{handover.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                        </div>
                        {handover.responsibilities && (Array.isArray(handover.responsibilities) ? handover.responsibilities.length > 0 : handover.responsibilities) && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Responsibilities:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {(Array.isArray(handover.responsibilities) 
                                ? handover.responsibilities 
                                : typeof handover.responsibilities === 'string' 
                                  ? handover.responsibilities.split('\n').filter(r => r.trim())
                                  : []).map((resp, idx) => (
                                <li key={idx}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {handover.handoverNotes && (
                          <div className="mt-3 p-3 !bg-blue-100 dark:!bg-blue-800/70 rounded-lg border-l-4 border-blue-400 dark:border-blue-400">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              <span className="font-semibold text-blue-900 dark:text-blue-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setEditingHandover(handover);
                            setIsEditDialogOpen(true);
                            // Fetch tasks and leaves for this handover's fromEmployeeId
                            if (handover.fromEmployeeId) {
                              fetchAvailableTasks(handover.fromEmployeeId);
                              fetchApprovedLeaves(handover.fromEmployeeId);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handover._id && handleDeleteHandover(handover._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedHandovers.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No completed handovers.</p>
                </Card>
              ) : (
                completedHandovers.map((handover) => (
                  <Card key={handover._id} className="p-6 border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{handover.fromEmployee} → {handover.toEmployee}</h3>
                          <Badge className={getStatusColor(handover.status)}>
                            {getStatusIcon(handover.status)}
                            <span className="ml-1">{handover.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>{format(new Date(handover.startDate), "MMM dd, yyyy")} - {format(new Date(handover.endDate), "MMM dd, yyyy")}</span>
                        </div>
                        {handover.responsibilities && (Array.isArray(handover.responsibilities) ? handover.responsibilities.length > 0 : handover.responsibilities) && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Responsibilities:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {(Array.isArray(handover.responsibilities) 
                                ? handover.responsibilities 
                                : typeof handover.responsibilities === 'string' 
                                  ? handover.responsibilities.split('\n').filter(r => r.trim())
                                  : []).map((resp, idx) => (
                                <li key={idx}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {handover.handoverNotes && (
                          <div className="mt-3 p-3 !bg-green-100 dark:!bg-green-800/70 rounded-lg border-l-4 border-green-400 dark:border-green-400">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              <span className="font-semibold text-green-900 dark:text-green-200">Notes:</span> <span className="dark:text-gray-200">{handover.handoverNotes}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            setEditingHandover(handover);
                            setIsEditDialogOpen(true);
                            // Fetch tasks and leaves for this handover's fromEmployeeId
                            if (handover.fromEmployeeId) {
                              fetchAvailableTasks(handover.fromEmployeeId);
                              fetchApprovedLeaves(handover.fromEmployeeId);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handover._id && handleDeleteHandover(handover._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Create Handover Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Duty Handover</DialogTitle>
            <DialogDescription>
              Assign work responsibilities from one team member to another
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From {actualUserType === "manager" ? "Manager" : "Employee"}</Label>
                <Input
                  value={currentUser?.name || "Loading..."}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">You ({actualUserType === "manager" ? "Manager" : "Employee"})</p>
              </div>
              <div className="space-y-2">
                <Label>To {actualUserType === "employee" ? "Employee" : "Employee"}</Label>
                <Select
                  value={formData.toEmployeeId}
                  onValueChange={(value) => setFormData({ ...formData, toEmployeeId: value })}
                  disabled={teamMembers.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      teamMembers.length === 0 
                        ? "No employees available" 
                        : `Select ${actualUserType === "employee" ? "employee" : "employee"}`
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.length === 0 ? (
                      <SelectItem value="no-employees" disabled>
                        No employees available
                      </SelectItem>
                    ) : (
                      teamMembers.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.name} {member.department ? `(${member.department})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {teamMembers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No employees found. Please check your connection or contact your administrator.
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent 
                      mode="single" 
                      selected={formData.startDate} 
                      onSelect={(date) => date && setFormData({ ...formData, startDate: date })} 
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
                      {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent 
                      mode="single" 
                      selected={formData.endDate} 
                      onSelect={(date) => date && setFormData({ ...formData, endDate: date })} 
                      initialFocus
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (formData.startDate) {
                          const start = new Date(formData.startDate);
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
            <div className="space-y-2">
              <Label>Select Tasks (Optional)</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                {availableTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks available for handover</p>
                ) : (
                  availableTasks.map((task) => (
                    <div key={task._id} className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id={`task-${task._id}`}
                        checked={formData.tasks.includes(task._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, tasks: [...formData.tasks, task._id] });
                          } else {
                            setFormData({ ...formData, tasks: formData.tasks.filter(id => id !== task._id) });
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`task-${task._id}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{task.title}</span>
                        {task.description && (
                          <span className="text-sm text-muted-foreground ml-2">- {task.description}</span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Due: {format(new Date(task.dueDate), "MMM dd, yyyy")})
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Select tasks that need to be handed over. Only non-completed tasks are shown.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Link Approved Leave (Optional)</Label>
              <Select
                value={formData.approvedLeave || undefined}
                onValueChange={(value) => setFormData({ ...formData, approvedLeave: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an approved leave (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {approvedLeaves.length === 0 ? (
                    <SelectItem value="no-leaves" disabled>
                      No approved leaves available
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="none">None</SelectItem>
                      {approvedLeaves.map((leave) => {
                        const leaveType = typeof leave.leavetype === 'object' ? leave.leavetype?.type : leave.leavetype;
                        return (
                          <SelectItem key={leave._id} value={leave._id}>
                            {leaveType || 'Leave'} - {format(new Date(leave.startDate), "MMM dd")} to {format(new Date(leave.endDate), "MMM dd, yyyy")} ({leave.days} days)
                          </SelectItem>
                        );
                      })}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link this handover to an approved leave application.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Additional Responsibilities (Optional - for backward compatibility)</Label>
              <Textarea
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                placeholder="Enter additional responsibilities, one per line (if not covered by tasks)..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Handover Notes</Label>
              <Textarea
                value={formData.handoverNotes}
                onChange={(e) => setFormData({ ...formData, handoverNotes: e.target.value })}
                placeholder="Add detailed notes for the handover..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateHandover}>Create Handover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Handover Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Duty Handover</DialogTitle>
            <DialogDescription>
              Update handover status and details
            </DialogDescription>
          </DialogHeader>
          {editingHandover && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm"><strong>From:</strong> {editingHandover.fromEmployee}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>To Employee</Label>
                  <Select
                    value={editingHandover.toEmployeeId}
                    onValueChange={(value) => {
                      const toEmployee = teamMembers.find(m => m._id === value);
                      setEditingHandover({ 
                        ...editingHandover, 
                        toEmployeeId: value,
                        toEmployee: toEmployee?.name || editingHandover.toEmployee
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingHandover.status}
                    onValueChange={(value) => setEditingHandover({ ...editingHandover, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {editingHandover.startDate ? format(new Date(editingHandover.startDate), "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent 
                        mode="single" 
                        selected={editingHandover.startDate ? new Date(editingHandover.startDate) : undefined} 
                        onSelect={(date) => date && setEditingHandover({ ...editingHandover, startDate: date.toISOString().split('T')[0] })} 
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
                        {editingHandover.endDate ? format(new Date(editingHandover.endDate), "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent 
                        mode="single" 
                        selected={editingHandover.endDate ? new Date(editingHandover.endDate) : undefined} 
                        onSelect={(date) => date && setEditingHandover({ ...editingHandover, endDate: date.toISOString().split('T')[0] })} 
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (editingHandover.startDate) {
                            const start = new Date(editingHandover.startDate);
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
              <div className="space-y-2">
                <Label>Select Tasks (Optional)</Label>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                  {availableTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks available for handover</p>
                  ) : (
                    availableTasks.map((task) => {
                      // Check if task is already selected in editingHandover
                      const taskIds = editingHandover.tasks 
                        ? (Array.isArray(editingHandover.tasks) 
                          ? editingHandover.tasks.map(t => typeof t === 'object' ? t._id : t)
                          : [])
                        : [];
                      const isChecked = taskIds.includes(task._id);
                      
                      return (
                        <div key={task._id} className="flex items-center space-x-2 py-2">
                          <input
                            type="checkbox"
                            id={`edit-task-${task._id}`}
                            checked={isChecked}
                            onChange={(e) => {
                              const currentTaskIds = editingHandover.tasks 
                                ? (Array.isArray(editingHandover.tasks) 
                                  ? editingHandover.tasks.map(t => typeof t === 'object' ? t._id : t)
                                  : [])
                                : [];
                              
                              if (e.target.checked) {
                                setEditingHandover({ 
                                  ...editingHandover, 
                                  tasks: [...currentTaskIds, task._id]
                                });
                              } else {
                                setEditingHandover({ 
                                  ...editingHandover, 
                                  tasks: currentTaskIds.filter(id => id !== task._id)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`edit-task-${task._id}`} className="flex-1 cursor-pointer">
                            <span className="font-medium">{task.title}</span>
                            {task.description && (
                              <span className="text-sm text-muted-foreground ml-2">- {task.description}</span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Due: {format(new Date(task.dueDate), "MMM dd, yyyy")})
                              </span>
                            )}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select tasks that need to be handed over. Only non-completed tasks are shown.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Link Approved Leave (Optional)</Label>
                <Select
                  value={editingHandover.approvedLeave 
                    ? (typeof editingHandover.approvedLeave === 'object' 
                      ? editingHandover.approvedLeave._id 
                      : editingHandover.approvedLeave)
                    : undefined}
                  onValueChange={(value) => setEditingHandover({ ...editingHandover, approvedLeave: value === "none" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an approved leave (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedLeaves.length === 0 ? (
                      <SelectItem value="no-leaves" disabled>
                        No approved leaves available
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="none">None</SelectItem>
                        {approvedLeaves.map((leave) => {
                          const leaveType = typeof leave.leavetype === 'object' ? leave.leavetype?.type : leave.leavetype;
                          return (
                            <SelectItem key={leave._id} value={leave._id}>
                              {leaveType || 'Leave'} - {format(new Date(leave.startDate), "MMM dd")} to {format(new Date(leave.endDate), "MMM dd, yyyy")} ({leave.days} days)
                            </SelectItem>
                          );
                        })}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Link this handover to an approved leave application.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Additional Responsibilities (Optional - for backward compatibility)</Label>
                <Textarea
                  value={Array.isArray(editingHandover.responsibilities) ? editingHandover.responsibilities.join('\n') : editingHandover.responsibilities || ""}
                  onChange={(e) => setEditingHandover({ ...editingHandover, responsibilities: e.target.value.split('\n').filter(r => r.trim()) })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Handover Notes</Label>
                <Textarea
                  value={editingHandover.handoverNotes || ""}
                  onChange={(e) => setEditingHandover({ ...editingHandover, handoverNotes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingHandover(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHandover}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}





