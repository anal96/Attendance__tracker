import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { UserCheck, Users, AlertTriangle, CheckCircle, Clock, ArrowRight, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useCookies } from "react-cookie";

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedBy: { _id: string; name: string; usertype: string };
  assignedTo: { _id: string; name: string };
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "on_hold";
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function WorkflowManagement() {
  const [cookies] = useCookies(["userType", "userId"]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  
  // Get user type from cookies
  const userType = cookies.userType || "manager";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    notes: ""
  });

  useEffect(() => {
    console.log('WorkflowManagement useEffect - userType:', userType, 'userId:', cookies.userId);
    if (cookies.userId) {
      fetchTasks();
      fetchTeamMembers();
    }
  }, [userType, cookies.userId]);

  // Debug: Log teamMembers when it changes
  useEffect(() => {
    console.log('Team members updated:', teamMembers.length, teamMembers);
  }, [teamMembers]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tasks', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Get current userType from cookies
      const currentUserType = cookies.userType || userType;
      
      if (!currentUserType) {
        console.error('No user type found in cookies');
        setTeamMembers([]);
        return;
      }
      
      let endpoint = '';
      
      // Fetch employees based on user type
      if (currentUserType === 'manager') {
        // Managers fetch their team members
        endpoint = 'http://localhost:5000/api/manager/team-members';
      } else if (currentUserType === 'employee') {
        // Employees fetch all other employees (excluding themselves)
        endpoint = 'http://localhost:5000/api/employee/employees';
      } else {
        console.error('Invalid user type:', currentUserType);
        setTeamMembers([]);
        return;
      }
      
      console.log('Fetching employees from:', endpoint, 'for userType:', currentUserType);
      
      const response = await fetch(endpoint, { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error('Response is not JSON');
      }
      
      const responseData = await response.json();
      console.log('Team members API response:', responseData);
      
      // Handle different response structures (for backward compatibility)
      let employeesArray = [];
      if (Array.isArray(responseData)) {
        employeesArray = responseData;
      } else if (responseData.teamMembers && Array.isArray(responseData.teamMembers)) {
        employeesArray = responseData.teamMembers;
      } else if (responseData.employees && Array.isArray(responseData.employees)) {
        employeesArray = responseData.employees;
      } else {
        console.error('Unexpected response structure:', responseData);
        setTeamMembers([]);
        return;
      }
      
      console.log('Team members array:', employeesArray);
      console.log('Team members count:', employeesArray.length);
      
      // Format members to ensure correct structure with proper IDs
      const formattedMembers = employeesArray.map(member => ({
        _id: (member._id && member._id.toString()) || member.id || '',
        name: member.name || member.displayName || 'Unknown',
        email: member.email || '',
        department: member.department || '',
        employeeId: member.employeeId || ''
      })).filter(member => member._id && member._id !== ''); // Filter out any invalid entries
      
      console.log('Formatted team members:', formattedMembers);
      console.log('Setting team members count:', formattedMembers.length);
      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title || !formData.assignedTo) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([data.task, ...tasks]);
        resetForm();
        setIsCreateDialogOpen(false);
        fetchTasks(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          dueDate: editingTask.dueDate,
          notes: editingTask.notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map(t => t._id === editingTask._id ? data.task : t));
        setEditingTask(null);
        setIsEditDialogOpen(false);
        fetchTasks(); // Refresh
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t._id !== taskId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      dueDate: "",
      notes: ""
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800",
      in_progress: "bg-primary/10 text-primary",
      completed: "bg-green-100 text-green-800",
      on_hold: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-orange-600" />;
      case "in_progress": return <UserCheck className="h-4 w-4 text-[#42c488]" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "on_hold": return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-orange-100 text-orange-800",
      low: "bg-blue-100 text-blue-800"
    };
    return colors[priority as keyof typeof colors];
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = !filterEmployee || filterEmployee === "all" || task.assignedTo._id === filterEmployee;
    const matchesPriority = !filterPriority || filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesEmployee && matchesPriority;
  });

  const activeTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const onHoldTasks = filteredTasks.filter(t => t.status === 'on_hold');
  const highPriorityTasks = filteredTasks.filter(t => t.priority === 'high' && t.status !== 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Task Management</h2>
          <p className="text-muted-foreground">Manage work assignments and project continuity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
            {pendingTasks.length} Pending
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {activeTasks.length} Active
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label>Task Title *</Label>
                  <Input
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter task description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign To *</Label>
                  <Select value={formData.assignedTo} onValueChange={(val) => setFormData({ ...formData, assignedTo: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder={teamMembers.length > 0 ? "Select team member" : "Loading employees..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No employees available</div>
                      ) : (
                        teamMembers.map(member => {
                          const currentUserId = cookies.userId;
                          const isCurrentUser = member._id === currentUserId;
                          return (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name} {isCurrentUser ? '(You)' : ''} {member.department ? `(${member.department})` : ''}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  {teamMembers.length === 0 && !loading && (
                    <p className="text-xs text-muted-foreground">No employees found. Please check your permissions.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Overview - Original Design Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-[#42c488]/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Active Tasks</p>
              <p className="text-2xl font-semibold">{activeTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Pending Setup</p>
              <p className="text-2xl font-semibold">{pendingTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-muted-foreground">High Priority</p>
              <p className="text-2xl font-semibold">{highPriorityTasks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Team Members</p>
              <p className="text-2xl font-semibold">{teamMembers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm">Search Tasks</Label>
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Filter by Employee</Label>
            <Select value={filterEmployee || "all"} onValueChange={setFilterEmployee}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Filter by Priority</Label>
            <Select value={filterPriority || "all"} onValueChange={setFilterPriority}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assignments">Task Assignments</TabsTrigger>
          <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
          <TabsTrigger value="active">Active Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Tasks */}
            <Card className="p-6">
              <h3 className="mb-4">Active Tasks</h3>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground text-center py-4">Loading...</p>
                ) : activeTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active tasks</p>
                ) : (
                  activeTasks.map((task) => (
                    <div key={task._id} className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.title}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-[#42c488] font-medium">{task.assignedTo.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTask(task);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </Badge>
                        )}
                      </div>
                      {task.notes && (
                        <div className="mt-2 p-2 bg-primary/5 rounded text-sm text-muted-foreground">
                          {task.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Pending Tasks */}
            <Card className="p-6">
              <h3 className="mb-4">Pending Setup</h3>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground text-center py-4">Loading...</p>
                ) : pendingTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending tasks</p>
                ) : (
                  pendingTasks.map((task) => (
                    <div key={task._id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.title}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-orange-700 font-medium">{task.assignedTo.name}</span>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={async () => {
                            try {
                              const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                  ...task,
                                  status: 'in_progress'
                                })
                              });
                              if (response.ok) {
                                fetchTasks();
                              }
                            } catch (error) {
                              console.error('Error updating task:', error);
                            }
                          }}
                        >
                          Start Task
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTask(task);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      {task.notes && (
                        <div className="mt-3 p-2 bg-orange-100 rounded text-sm">
                          <span className="font-medium">Notes:</span> {task.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">All Pending Tasks</h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : pendingTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending tasks</p>
              ) : (
                pendingTasks.map((task) => (
                  <div key={task._id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">{task.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-orange-700 font-medium">{task.assignedTo.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTask(task);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                      </p>
                    )}
                    {task.notes && (
                      <div className="mt-2 p-2 bg-orange-100 rounded text-sm">
                        <span className="font-medium">Notes:</span> {task.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">All Active Tasks</h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : activeTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active tasks</p>
              ) : (
                activeTasks.map((task) => (
                  <div key={task._id} className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-[#42c488]" />
                        <span className="font-medium">{task.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[#42c488] font-medium">{task.assignedTo.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTask(task);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                      </p>
                    )}
                    {task.notes && (
                      <div className="mt-2 p-2 bg-primary/5 rounded text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {task.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Completed Tasks</h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : completedTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No completed tasks</p>
              ) : (
                completedTasks.map((task) => (
                  <div key={task._id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium line-through">{task.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-green-700 font-medium">{task.assignedTo.name}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground">
                        Completed: {format(new Date(task.updatedAt), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label>Task Title</Label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editingTask.status} onValueChange={(val) => setEditingTask({ ...editingTask, status: val as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editingTask.priority} onValueChange={(val) => setEditingTask({ ...editingTask, priority: val as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editingTask.notes}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleUpdateTask}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkflowManagement;