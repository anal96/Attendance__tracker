import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Edit, 
  Camera,
  Award,
  Clock,
  TrendingUp,
  Target
} from "lucide-react";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phoneError, setPhoneError] = useState("");
  
  // Debug: Log when editing state changes
  useEffect(() => {
    console.log("Profile editing state:", isEditing);
  }, [isEditing]);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    employeeId: "",
    joinDate: "",
    location: "",
    manager: "",
    bio: "",
    skills: [],
    profilePic: ""
  });

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // If phone is empty, it's valid (optional field)
    if (!phone || phone.trim() === "") {
      setPhoneError("");
      return true;
    }
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it has at least 10 digits (standard phone number length)
    if (digitsOnly.length < 10) {
      setPhoneError("Phone number must contain at least 10 digits");
      return false;
    }
    
    // Check if it has more than 15 digits (ITU-T E.164 max length)
    if (digitsOnly.length > 15) {
      setPhoneError("Phone number cannot exceed 15 digits");
      return false;
    }
    
    // Check for valid format (allows digits, spaces, dashes, parentheses, plus sign)
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    
    setPhoneError("");
    return true;
  };

  const [stats, setStats] = useState([
    { label: "Total Leave Days", value: "0", description: "Annual allocation" },
    { label: "Used Leave Days", value: "0", description: "This year" },
    { label: "Attendance Rate", value: "0%", description: "Last 3 months" },
    { label: "Years at Company", value: "0", description: "Since joining" }
  ]);

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/employee/profile", { withCredentials: true }),
          axios.get("http://localhost:5000/api/employee/stats", { withCredentials: true })
        ]);

        const profileData = profileRes.data;
        const statsData = statsRes.data;

        // Get manager name
        let managerName = "";
        try {
          const dashboardRes = await axios.get("http://localhost:5000/api/employee/dashboard", { withCredentials: true });
          managerName = dashboardRes.data.manager?.name || "";
        } catch (err) {
          console.error("Error fetching manager:", err);
        }

        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone?.toString() || "",
          department: profileData.department || "",
          position: profileData.qualification || "",
          employeeId: profileData.employeeId || "",
          joinDate: profileData.joinDate || "",
          location: profileData.address || "",
          manager: managerName,
          bio: `${profileData.qualification || ""} with ${profileData.experience || 0} years of experience.`,
          skills: profileData.qualification ? [profileData.qualification] : [],
          profilePic: profileData.profilePic || ""
        });

        setStats([
          { label: "Total Leave Days", value: statsData.totalLeaveDays?.toString() || "0", description: "Annual allocation" },
          { label: "Used Leave Days", value: statsData.usedLeaveDays?.toString() || "0", description: "This year" },
          { label: "Attendance Rate", value: `${statsData.attendanceRate || 0}%`, description: "Last 3 months" },
          { label: "Years at Company", value: statsData.yearsAtCompany?.toString() || "0", description: "Since joining" }
        ]);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    // Validate phone number before saving
    if (!validatePhoneNumber(profile.phone)) {
      return; // Don't proceed if validation fails
    }

    try {
      await axios.put("http://localhost:5000/api/employee/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.location
      }, { withCredentials: true });

      alert("Profile updated successfully!");
      setIsEditing(false);
      setPhoneError(""); // Clear error on success
      // Refresh the page to update header
      window.location.reload();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to update profile";
      if (errorMessage.includes("phone")) {
        setPhoneError(errorMessage);
      }
      alert(errorMessage);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await axios.post("http://localhost:5000/api/employee/profile-picture", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile({ ...profile, profilePic: response.data.profilePic });
      alert("Profile picture updated successfully!");
      // Refresh the page to update header
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to upload profile picture");
    }
  };

  const achievements = [
    { title: "Perfect Attendance", description: "No absences for 3 months", icon: Award, color: "text-yellow-500" },
    { title: "Team Player", description: "Collaborated on 15+ projects", icon: Target, color: "text-blue-500" },
    { title: "Early Bird", description: "Consistently on time", icon: Clock, color: "text-green-500" },
    { title: "Growth Mindset", description: "Completed 5 training courses", icon: TrendingUp, color: "text-purple-500" }
  ];

  const recentActivity = [
    { action: "Applied for annual leave", date: "Oct 2, 2024", status: "Pending" },
    { action: "Completed safety training", date: "Sep 28, 2024", status: "Completed" },
    { action: "Updated emergency contact", date: "Sep 25, 2024", status: "Updated" },
    { action: "Submitted timesheet", date: "Sep 20, 2024", status: "Approved" }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and view your statistics.</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
          <Edit className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile.profilePic ? `http://localhost:5000${profile.profilePic}` : "/placeholder-avatar.jpg"} 
                    alt={profile.name} 
                  />
                  <AvatarFallback className="text-xl">
                    {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <input
                      id="profile-pic-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicUpload}
                    />
                  <Button 
                    size="sm" 
                      type="button"
                      className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full p-0 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-lg z-50"
                      style={{ 
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px'
                      }}
                      onClick={() => {
                        const input = document.getElementById('profile-pic-upload');
                        if (input) {
                          input.click();
                        }
                      }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  </>
                )}
              </div>
            </div>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>{profile.position}</CardDescription>
            <Badge variant="secondary" className="w-fit mx-auto">
              ID: {profile.employeeId}
            </Badge>
            {isEditing && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => document.getElementById('profile-pic-upload')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Profile Picture
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{profile.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Reports to {profile.manager}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium">Bio</Label>
              {isEditing ? (
                <textarea 
                  className="w-full mt-1 p-2 text-sm border rounded-md resize-none"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium">Skills</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Your contact details and emergency information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <span className="text-sm">{profile.name || "Not set"}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  ) : (
                    <span className="text-sm">{profile.email}</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <div className="flex-1">
                    <Input
                      id="phone"
                        type="tel"
                      value={profile.phone}
                        onChange={(e) => {
                          setProfile({...profile, phone: e.target.value});
                          // Clear error when user starts typing
                          if (phoneError) {
                            setPhoneError("");
                          }
                        }}
                        onBlur={() => {
                          // Validate on blur
                          validatePhoneNumber(profile.phone);
                        }}
                        placeholder="e.g., +1 (555) 123-4567 or 5551234567"
                        className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {phoneError && (
                        <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional. If provided, enter at least 10 digits. Format: +1 (555) 123-4567
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm">{profile.phone || "Not set"}</span>
                  )}
                </div>
              </div>
            </CardContent>
            
            {isEditing && (
              <CardContent className="pt-0">
                <Button className="w-full" onClick={handleSaveProfile}>Save Changes</Button>
              </CardContent>
            )}
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Your Statistics</CardTitle>
              <CardDescription>
                Overview of your performance and attendance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center space-y-2">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="font-medium">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Leave Usage Progress</span>
                    <span>
                      {stats[0].value !== "0" && stats[1].value !== "0" 
                        ? Math.round((parseInt(stats[1].value) / parseInt(stats[0].value)) * 100)
                        : 0}% used
                    </span>
                  </div>
                  <Progress 
                    value={stats[0].value !== "0" && stats[1].value !== "0" 
                      ? (parseInt(stats[1].value) / parseInt(stats[0].value)) * 100
                      : 0} 
                    className="w-full" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Goal Achievement</span>
                    <span>85% complete</span>
                  </div>
                  <Progress value={85} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Your accomplishments and milestones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <achievement.icon className={`h-8 w-8 ${achievement.color}`} />
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent actions and updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    <Badge 
                      variant={activity.status === 'Pending' ? 'secondary' : 
                               activity.status === 'Completed' ? 'default' : 'outline'}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}