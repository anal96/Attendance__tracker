import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  usertype: "employee" | "manager" | "admin";
  department?: string;
  status: "active" | "inactive";
  joinDate: string;
  age?: number;
  qualification?: string;
  experience?: string;
  phone?: string;
  address?: string;
  employeeId?: string;
  shift?: "day" | "night";
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/viewusers");
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    qualification: "",
    experience: "",
    phone: "",
    address: "",
    usertype: "",
    department: "",
    shift: "day" as "day" | "night",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = formData.usertype === "manager" 
        ? "http://localhost:5000/addmanager" 
        : "http://localhost:5000/register";
      
      const response = await axios.post(endpoint, formData);
      
      if (response.status === 200 || response.status === 201) {
        alert("✅ User added successfully!");
        setIsAddUserOpen(false);
        resetForm();
        fetchUsers();
      }
    } catch (err: any) {
      console.error("❌ Error during registration:", err);
      alert(err.response?.data?.message || "Error adding user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't pre-fill password
      age: user.age?.toString() || "",
      qualification: user.qualification || "",
      experience: user.experience || "",
      phone: user.phone || "",
      address: user.address || "",
      usertype: user.usertype || "",
      department: user.department || "",
      shift: user.shift || "day",
    });
    setIsEditUserOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData: any = { ...formData };
      // Remove password if empty
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/update-user/${editingUser._id}`,
        updateData
      );

      if (response.status === 200) {
        alert("✅ User updated successfully!");
        setIsEditUserOpen(false);
        setEditingUser(null);
        resetForm();
        fetchUsers();
      }
    } catch (err: any) {
      console.error("❌ Error updating user:", err);
      alert(err.response?.data?.message || "Error updating user");
    }
  };

  const handleView = async (user: User) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/user/${user._id}`);
      if (response.data) {
        setViewingUser(response.data);
        setIsViewUserOpen(true);
      }
    } catch (err: any) {
      console.error("❌ Error fetching user details:", err);
      setViewingUser(user);
      setIsViewUserOpen(true);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const response = await axios.delete(`http://localhost:5000/delete_user/${id}`);
      if (response.status === 200) {
        alert("✅ User deleted successfully!");
        fetchUsers();
      }
    } catch (err: any) {
      console.error("❌ Error deleting user:", err);
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/toggle-user-status/${user._id}`
      );
      if (response.status === 200) {
        alert(`✅ User status updated to ${response.data.user.status}`);
        fetchUsers();
      }
    } catch (err: any) {
      console.error("❌ Error toggling status:", err);
      alert(err.response?.data?.message || "Error updating user status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      age: "",
      qualification: "",
      experience: "",
      phone: "",
      address: "",
      usertype: "",
      department: "",
      shift: "day",
    });
  };

  // 🔹 Filtering logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.usertype === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    if (role === "manager") return "bg-purple-100 text-purple-800";
    if (role === "admin") return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>User Management</h2>
          <p className="text-muted-foreground">Manage employee and manager accounts</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new employee or manager account</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" placeholder="Enter age" value={formData.age} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" name="qualification" placeholder="Enter qualification" value={formData.qualification} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input id="experience" name="experience" placeholder="Enter experience" value={formData.experience} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="Enter phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usertype">Role *</Label>
                <Select value={formData.usertype} onValueChange={(value: string) => setFormData({ ...formData, usertype: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value: string) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" placeholder="Enter address" value={formData.address} onChange={handleChange} />
              </div>

              <DialogFooter className="col-span-2 mt-4">
                <Button variant="outline" type="button" onClick={() => {
                  setIsAddUserOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-mono text-xs">{user.employeeId || user._id.substring(0, 8)}</TableCell>
                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.usertype)}>{user.usertype}</Badge>
                    </TableCell>
                    <TableCell>{user.department || "N/A"}</TableCell>
                    <TableCell>
                      {user.usertype === "employee" ? (
                        <Badge className={user.shift === "night" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"}>
                          {user.shift === "night" ? "Night" : "Day"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.joinDate ? new Date(user.joinDate).toLocaleDateString("en-CA") : "N/A"}
                    </TableCell>
                      <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(user)} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleToggleStatus(user)}
                          title={`Toggle Status (Current: ${user.status})`}
                        >
                          {user.status === "active" ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(user._id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input id="edit-name" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input id="edit-email" name="email" type="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input id="edit-password" name="password" type="password" placeholder="Enter new password" value={formData.password} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input id="edit-age" name="age" type="number" placeholder="Enter age" value={formData.age} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-qualification">Qualification</Label>
                <Input id="edit-qualification" name="qualification" placeholder="Enter qualification" value={formData.qualification} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-experience">Experience</Label>
                <Input id="edit-experience" name="experience" placeholder="Enter experience" value={formData.experience} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" name="phone" placeholder="Enter phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-usertype">Role *</Label>
                <Select value={formData.usertype} onValueChange={(value: string) => setFormData({ ...formData, usertype: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select value={formData.department} onValueChange={(value: string) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.usertype === "employee" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-shift">Shift</Label>
                  <Select value={formData.shift} onValueChange={(value: "day" | "night") => setFormData({ ...formData, shift: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Shift</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea id="edit-address" name="address" placeholder="Enter address" value={formData.address} onChange={handleChange} />
              </div>

              <DialogFooter className="col-span-2 mt-4">
                <Button variant="outline" type="button" onClick={() => {
                  setIsEditUserOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user information</DialogDescription>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <p className="font-mono text-sm">{viewingUser.employeeId || viewingUser._id.substring(0, 8)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{viewingUser.name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{viewingUser.email || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <Badge className={getRoleColor(viewingUser.usertype)}>{viewingUser.usertype}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p>{viewingUser.department || "N/A"}</p>
                </div>
                {viewingUser.usertype === "employee" && (
                  <div>
                    <Label className="text-muted-foreground">Shift</Label>
                    <Badge className={viewingUser.shift === "night" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"}>
                      {viewingUser.shift === "night" ? "Night" : "Day"}
                    </Badge>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(viewingUser.status)}>{viewingUser.status}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Age</Label>
                  <p>{viewingUser.age || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{viewingUser.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Qualification</Label>
                  <p>{viewingUser.qualification || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p>{viewingUser.experience || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Address</Label>
                  <p>{viewingUser.address || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Join Date</Label>
                  <p>{viewingUser.joinDate ? new Date(viewingUser.joinDate).toLocaleDateString("en-CA") : "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewUserOpen(false)}>
              Close
            </Button>
            {viewingUser && (
              <Button onClick={() => {
                setIsViewUserOpen(false);
                handleEdit(viewingUser);
              }}>
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;
