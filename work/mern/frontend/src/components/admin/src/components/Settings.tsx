import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useTheme } from "./ThemeProvider";
import { toast } from "sonner";
import { User, Bell, Shield, Palette, Globe, Monitor, Moon, Sun, Save, RefreshCw, Lock, HelpCircle, Download, FileText } from "lucide-react";
import Cookies from "js-cookie";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [userType, setUserType] = useState<string>("employee");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    employeeId: "",
    address: ""
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "America/New_York",
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    leaveReminders: true
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordLastChanged: ""
  });

  // Get user type from cookies
  useEffect(() => {
    const userTypeFromCookie = Cookies.get("userType") || "employee";
    setUserType(userTypeFromCookie);
  }, []);

  // Handle user manual download
  const downloadUserManual = async () => {
    setIsLoading(true);
    const fileName = `${userType}-user-manual.pdf`;
    
    try {
      // Generate PDF from backend API
      const apiUrl = `http://localhost:5000/api/manuals/${userType}-user-manual`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        setIsLoading(false);
        toast.error(
          `Failed to generate user manual. Please try again or contact your system administrator.`,
          { duration: 8000 }
        );
        return;
      }
      
      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setIsLoading(false);
      toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} User Manual downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading manual:", error);
      setIsLoading(false);
      toast.error(
        `Unable to download user manual. Please try again or contact your system administrator.`,
        { duration: 8000 }
      );
    }
  };

  // Fetch user profile and settings from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch profile data
        const profileResponse = await axios.get("http://localhost:5000/api/employee/profile", {
          withCredentials: true
        });
        const profileData = profileResponse.data;
        
        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
          department: profileData.department || "",
          position: profileData.qualification || "",
          phone: profileData.phone?.toString() || "",
          employeeId: profileData.employeeId || "",
          address: profileData.address || ""
        });

        // Fetch settings
        const settingsResponse = await axios.get("http://localhost:5000/api/user/settings", {
          withCredentials: true
        });
        const settingsData = settingsResponse.data;
        
        if (settingsData.preferences) {
          setPreferences({
            language: settingsData.preferences.language || "en",
            timezone: settingsData.preferences.timezone || "America/New_York",
            emailNotifications: settingsData.preferences.emailNotifications !== undefined 
              ? settingsData.preferences.emailNotifications 
              : true,
            pushNotifications: settingsData.preferences.pushNotifications !== undefined 
              ? settingsData.preferences.pushNotifications 
              : true,
            weeklyReports: settingsData.preferences.weeklyReports !== undefined 
              ? settingsData.preferences.weeklyReports 
              : true,
            leaveReminders: settingsData.preferences.leaveReminders !== undefined 
              ? settingsData.preferences.leaveReminders 
              : true
          });
        }

        if (settingsData.security) {
          setSecurity({
            twoFactorAuth: settingsData.security.twoFactorAuth || false,
            sessionTimeout: settingsData.security.sessionTimeout || "30",
            passwordLastChanged: settingsData.security.passwordLastChanged || ""
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings. Using defaults.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?\d{1,3})?[6-9]\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  const saveProfile = async () => {
    // Validate phone number if provided
    if (profile.phone && !validatePhoneNumber(profile.phone)) {
      toast.error("Please enter a valid phone number (10 digits, starting with 6-9)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put("http://localhost:5000/api/user/settings/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        qualification: profile.position,
        address: profile.address
      }, {
        withCredentials: true
      });
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put("http://localhost:5000/api/user/settings/preferences", {
        language: preferences.language,
        timezone: preferences.timezone,
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        weeklyReports: preferences.weeklyReports,
        leaveReminders: preferences.leaveReminders
      }, {
        withCredentials: true
      });
      
      toast.success("Preferences saved successfully!");
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error(error.response?.data?.error || "Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppearanceSettings = async () => {
    setIsLoading(true);
    try {
      // Save only timezone (appearance-related), language should be saved separately via savePreferences
      // Theme is saved automatically by ThemeProvider to localStorage
      const response = await axios.put("http://localhost:5000/api/user/settings/preferences", {
        timezone: preferences.timezone,
        // Keep existing notification preferences
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        weeklyReports: preferences.weeklyReports,
        leaveReminders: preferences.leaveReminders
      }, {
        withCredentials: true
      });
      
      toast.success("Appearance settings saved successfully!");
    } catch (error: any) {
      console.error("Error updating appearance settings:", error);
      toast.error(error.response?.data?.error || "Failed to save appearance settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSecurity = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put("http://localhost:5000/api/user/settings/security", {
        twoFactorAuth: security.twoFactorAuth,
        sessionTimeout: security.sessionTimeout
      }, {
        withCredentials: true
      });
      
      toast.success("Security settings updated successfully!");
    } catch (error: any) {
      console.error("Error updating security settings:", error);
      toast.error(error.response?.data?.error || "Failed to update security settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put("http://localhost:5000/api/user/settings/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });
      
      toast.success("Password changed successfully!");
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Update password last changed date
      setSecurity({
        ...security,
        passwordLastChanged: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.error || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    // Theme is saved automatically by ThemeProvider to localStorage
    toast.success("Theme updated successfully!");
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={profile.employeeId}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={profile.department} onValueChange={(value) => setProfile({...profile, department: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position/Qualification</Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile({...profile, position: e.target.value})}
                  placeholder="e.g., Senior Developer, B.Tech"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
              />
              {profile.phone && !/^(\+?\d{1,3})?[6-9]\d{9}$/.test(profile.phone.replace(/[\s\-\(\)]/g, '')) && (
                <p className="text-xs text-red-500">Please enter a valid phone number (10 digits, starting with 6-9)</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                placeholder="Enter your address"
              />
            </div>
            
            <Button 
              onClick={saveProfile} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure how and when you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => setPreferences({...preferences, emailNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive browser notifications</p>
              </div>
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => setPreferences({...preferences, pushNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Get weekly attendance summaries</p>
              </div>
              <Switch
                checked={preferences.weeklyReports}
                onCheckedChange={(checked) => setPreferences({...preferences, weeklyReports: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Leave Reminders</Label>
                <p className="text-sm text-muted-foreground">Reminders for upcoming leave</p>
              </div>
              <Switch
                checked={preferences.leaveReminders}
                onCheckedChange={(checked) => setPreferences({...preferences, leaveReminders: checked})}
              />
            </div>

            <Button 
              onClick={savePreferences} 
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Preferences
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance & Language
            </CardTitle>
            <CardDescription>
              Customize your interface preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Theme changes will be applied immediately across the application.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Language preference is saved with notification preferences.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={preferences.timezone} onValueChange={(value) => setPreferences({...preferences, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={saveAppearanceSettings} 
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <div className="flex items-center gap-2">
                {security.twoFactorAuth && <Badge variant="secondary">Enabled</Badge>}
                <Switch
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Session Timeout</Label>
              <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({...security, sessionTimeout: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                {security.passwordLastChanged 
                  ? `Last changed: ${security.passwordLastChanged}`
                  : "Password has not been changed since account creation"}
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
            
            {/* Password Change Dialog */}
            {showPasswordDialog && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowPasswordDialog(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      });
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <Button variant="outline" className="w-full" onClick={saveSecurity} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </>
              )}
            </Button>

            <Separator />

            <Button variant="outline" className="w-full">
              Download Account Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage your settings quickly with these actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              onClick={() => {
                saveProfile();
                savePreferences();
                saveSecurity();
              }}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving All...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={async () => {
                if (confirm("Are you sure you want to reset all settings to defaults? This cannot be undone.")) {
                  setIsLoading(true);
                  try {
                    // Reset preferences to defaults
                    await axios.put("http://localhost:5000/api/user/settings/preferences", {
                      language: "en",
                      timezone: "America/New_York",
                      emailNotifications: true,
                      pushNotifications: true,
                      weeklyReports: true,
                      leaveReminders: true
                    }, { withCredentials: true });
                    
                    // Reset security to defaults
                    await axios.put("http://localhost:5000/api/user/settings/security", {
                      twoFactorAuth: false,
                      sessionTimeout: "30"
                    }, { withCredentials: true });
                    
                    setPreferences({
                      language: "en",
                      timezone: "America/New_York",
                      emailNotifications: true,
                      pushNotifications: true,
                      weeklyReports: true,
                      leaveReminders: true
                    });
                    
                    setSecurity({
                      twoFactorAuth: false,
                      sessionTimeout: "30",
                      passwordLastChanged: security.passwordLastChanged
                    });
                    
                    setTheme('system');
                    toast.success("All settings have been reset to defaults!");
                  } catch (error: any) {
                    console.error("Error resetting settings:", error);
                    toast.error("Failed to reset settings. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current Theme</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {theme === 'light' && <Sun className="h-4 w-4" />}
              {theme === 'dark' && <Moon className="h-4 w-4" />}
              {theme === 'system' && <Monitor className="h-4 w-4" />}
              <span className="capitalize">{theme} theme is active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </CardTitle>
          <CardDescription>
            Download user manuals and documentation to understand all features of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">
                  {userType === "admin" && "Admin Dashboard User Manual"}
                  {userType === "manager" && "Manager Dashboard User Manual"}
                  {userType === "employee" && "Employee Dashboard User Manual"}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive guide covering all features, functions, and workflows for the{" "}
                  <span className="font-medium capitalize">{userType}</span> dashboard. 
                  Learn how to use every feature effectively.
                </p>
                <Button 
                  onClick={downloadUserManual}
                  className="w-full sm:w-auto"
                  variant="default"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download {userType.charAt(0).toUpperCase() + userType.slice(1)} User Manual (PDF)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">What's included in the manual:</p>
                <ul className="mt-1 space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Complete dashboard overview and navigation</li>
                  <li>Step-by-step guides for all features</li>
                  <li>Screenshots and illustrations</li>
                  <li>Tips and best practices</li>
                  <li>Troubleshooting common issues</li>
                  <li>Keyboard shortcuts and quick actions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Note:</strong> The user manual is specific to your role (
              <span className="font-medium capitalize">{userType}</span>). 
              It contains detailed explanations of all functions available in your dashboard.
            </p>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Important:</strong> If the PDF cannot be downloaded, it means the manual hasn't been created yet. 
              Please contact your system administrator to add the user manual PDF files to the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}