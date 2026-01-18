import { useEffect, useState, useCallback, useMemo } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toaster } from "./components/ui/sonner";
// Admin Components
import { DashboardOverview } from "./components/DashboardOverview";
import { UserManagement } from "./components/UserManagement";
import { LeavePolicies } from "./components/LeavePolicies";
import { LeaveTypes } from "./components/Leavetype";
import { LeaveApplications } from "./components/LeaveApplications";
import { Reports } from "./components/Reports";
import { UserLogs } from "./components/admin/UserLogs";
import { UserActivityLog } from "./components/admin/UserActivityLog";
import { AttendanceTimeSettings } from "./components/admin/AttendanceTimeSettings";
// Employee Components
import { EmployeeDashboard } from "./components/employee/EmployeeDashboard";
import { LeaveApplication } from "./components/employee/LeaveApplication";
import { MyApplications } from "./components/employee/MyApplications";
import { AttendanceRecord } from "./components/employee/AttendanceRecord";
import { LeaveBalance } from "./components/employee/LeaveBalance";
import { WFHRegistration } from "./components/employee/WFHRegistration";
// Manager Components
import { ManagerDashboard } from "./components/manager/ManagerDashboard";
import TeamLeaveRequests from "./components/manager/TeamLeaveRequests";
import { TeamAttendance } from "./components/manager/TeamAttendance";
import { TeamActivity } from "./components/manager/TeamActivity";
import { WorkflowManagement } from "./components/manager/WorkflowManagement";
import { TeamReports } from "./components/manager/TeamReports";
import { ManagerAttendance } from "./components/manager/ManagerAttendance";
import { DutyHandover } from "./components/manager/DutyHandover";
import { TeamWFH } from "./components/manager/TeamWFH";
import { EmployeeTaskManagement } from "./components/employee/EmployeeTaskManagement";
import { LeaveBalance as ManagerLeaveBalance } from "./components/employee/LeaveBalance";
import { Feedback } from "./components/employee/Feedback";
import { FeedbackManagement } from "./components/admin/FeedbackManagement";
import { WFHManagement } from "./components/admin/WFHManagement";
// Global Components

import { LogOut as LogOutIcon, AlertTriangle } from "lucide-react";
import { CookiesProvider } from "react-cookie";
import { Notifications } from "./components/Notifications";
import { Profile } from "./components/Profile";
import { Settings as SettingsComponent } from "./components/Settings";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NetworkErrorHandler } from "./components/NetworkErrorHandler";
import { DashboardLoginLoading } from "./components/DashboardLoginLoading";
import { DashboardLogoutLoading } from "./components/DashboardLogoutLoading";
import Cookies from "js-cookie";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  Bell, 
  Settings,
  Shield,
  Sun,
  Moon,
  User,
  Calendar,
  Clock,
  Plus,
  History,
  PieChart,
  UserCheck,
  TrendingUp,
  Briefcase,
  Monitor,
  MessageSquare,
  MapPin
} from "lucide-react";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      {/* ✅ Wrap your entire app inside CookiesProvider */}
      <CookiesProvider>
        <ErrorBoundary>
          <NetworkErrorHandler>
        <AppContent />
        <Toaster />
          </NetworkErrorHandler>
        </ErrorBoundary>
      </CookiesProvider>
    </ThemeProvider>
  );
}
function AppContent() {
  const [activeView, setActiveView] = useState("dashboard");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeProfilePic, setEmployeeProfilePic] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  // const [userType, setUserType] = useState<"admin" | "employee" | "manager">("admin");
  const [userType, setUserType] = useState("employee"); // default
  const [loading, setLoading] = useState(true); // Initial loading for dashboard
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [managerPendingRequestsCount, setManagerPendingRequestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

useEffect(() => {
  const getCookie = (name: string) => {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
      const [key, value] = cookie.split('=');
        if (key.trim() === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

    // Check all cookies to see what's available
    const allCookies = document.cookie;
    console.log("🍪 All cookies:", allCookies);

  const cookieUserType = getCookie("userType");
    const cookieUserId = getCookie("userId");
    const cookieUsername = getCookie("username");
    const cookieEmail = getCookie("email");
    
    console.log("🍪 Cookie check - userType:", cookieUserType, "userId:", cookieUserId, "username:", cookieUsername, "email:", cookieEmail);
    
    // If userType cookie exists, user is logged in - show dashboard immediately
    if (cookieUserType) {
      console.log("✅ User is logged in (cookie found) - showing dashboard immediately");
      setUserType(cookieUserType);
      
      // Set loading to false immediately so dashboard renders
      setLoading(false);
      setLoadingProfile(false);
      
      // Use cookies for immediate display
      const name = cookieUsername || Cookies.get("username") || (cookieUserType === "admin" ? "Admin User" : "");
      const email = cookieEmail || Cookies.get("email") || (cookieUserType === "admin" ? "admin@company.com" : "");
      setEmployeeName(name);
      setEmployeeEmail(email);
      
      // Check if this is a fresh login (has justLoggedIn flag)
      const urlParams = new URLSearchParams(window.location.search);
      const urlJustLoggedIn = urlParams.get("justLoggedIn");
      let sessionJustLoggedIn = sessionStorage.getItem("justLoggedIn");
      let localJustLoggedIn = localStorage.getItem("justLoggedIn");
      
      // If URL parameter exists but flags don't, set them now (they might have been lost)
      if (urlJustLoggedIn === "true" && (!sessionJustLoggedIn || !localJustLoggedIn)) {
        console.log("🔄 URL flag found but storage flags missing - restoring them");
        sessionStorage.setItem("justLoggedIn", "true");
        localStorage.setItem("justLoggedIn", "true");
        sessionJustLoggedIn = "true";
        localJustLoggedIn = "true";
      }
      
      const justLoggedIn = urlJustLoggedIn === "true" || sessionJustLoggedIn === "true" || localJustLoggedIn === "true";
      
      console.log("🔍 First check - justLoggedIn:", justLoggedIn, "URL:", urlJustLoggedIn, "session:", sessionJustLoggedIn, "local:", localJustLoggedIn);
      
      if (justLoggedIn) {
        // Fresh login - show loading page
        console.log("✅ Fresh login detected - showing loading page");
        setLoading(true);
        setLoadingProfile(true);
        
        // Ensure flags are set in storage (they might have been lost during redirect)
        // This is critical because sessionStorage might not persist across different ports
        if (!sessionJustLoggedIn) {
          sessionStorage.setItem("justLoggedIn", "true");
          console.log("💾 Restored sessionStorage flag");
        }
        if (!localJustLoggedIn) {
          localStorage.setItem("justLoggedIn", "true");
          console.log("💾 Restored localStorage flag");
        }
        
        // DON'T remove flags here - let fetchEmployeeProfile handle it after showing loading page
        // Clean up URL parameter only (keep sessionStorage/localStorage flags for fetchEmployeeProfile)
        if (urlJustLoggedIn === "true") {
          window.history.replaceState({}, "", window.location.pathname);
        }
      } else {
        // Reload - dashboard already set to render (loading = false)
        console.log("🔄 Reload detected - dashboard will render immediately");
      }
    } else {
      // No userType cookie - user is not logged in
      console.log("❌ No userType cookie - user not logged in, redirecting to login");
    window.location.href = "http://localhost:3001/login";
    }

    // Listen for navigation events from child components
    const handleNavigate = (event: CustomEvent) => {
      if (event.detail?.view) {
        setActiveView(event.detail.view);
      }
    };

    window.addEventListener('navigateToView', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigateToView', handleNavigate as EventListener);
    };
}, []);

  // Prevent browser back/forward navigation when logged in (like live validation)
  useEffect(() => {
    // Only enable after page is fully loaded and user is authenticated
    if (!userType || loading || loadingProfile) {
      console.log("⏸️ Navigation protection paused - userType:", userType, "loading:", loading, "loadingProfile:", loadingProfile);
      return; // Don't block if not logged in, still loading, or profile loading
    }

    console.log("⏳ Waiting to enable navigation protection...");

    // Wait a bit to ensure page is fully rendered
    const enableProtection = setTimeout(() => {
      console.log("🔒 Navigation protection enabled - user is logged in");

      // Create a history entry that we can detect
      const dashboardState = { 
        page: 'dashboard', 
        preventBack: true,
        timestamp: Date.now()
      };

      // Replace current history entry and push new ones to create a barrier
      window.history.replaceState(dashboardState, '', window.location.href);
      window.history.pushState(dashboardState, '', window.location.href);
      window.history.pushState(dashboardState, '', window.location.href);

      // Handle browser back/forward button clicks (popstate event)
      const handlePopState = (event: PopStateEvent) => {
        console.log("🚫 Browser back/forward button detected - preventing navigation");
        
        // Immediately push forward to prevent navigation
        window.history.pushState(dashboardState, '', window.location.href);
        window.history.pushState(dashboardState, '', window.location.href);
        window.history.pushState(dashboardState, '', window.location.href);
        
        // Force a small delay and push again to ensure it sticks
        setTimeout(() => {
          window.history.pushState(dashboardState, '', window.location.href);
          window.history.pushState(dashboardState, '', window.location.href);
          // Also force reload to dashboard if somehow navigated away
          if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
            window.location.href = 'http://localhost:3000';
          }
        }, 10);
      };

      // Monitor and maintain history barrier (like live validation) - less frequent
      const navigationMonitor = setInterval(() => {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const currentHost = window.location.hostname;
        const currentPort = window.location.port;
        
        // If navigated to login/register page or different port, force redirect back
        if (currentPath.includes('/login') || currentPath.includes('/register') || 
            (currentPort && currentPort !== '3000' && currentPort !== '')) {
          console.log("🔄 Detected navigation to login/register or different port - redirecting to dashboard");
          window.location.href = 'http://localhost:3000';
          return;
        }
        
        // Maintain history barrier - but less aggressively
        if (window.history.length < 2) {
          window.history.pushState(dashboardState, '', window.location.href);
        }
      }, 500); // Check every 500ms (less aggressive)

      // Handle hash changes
      const handleHashChange = () => {
        console.log("🚫 Hash change detected - preventing");
        window.history.pushState(dashboardState, '', window.location.href);
        window.history.pushState(dashboardState, '', window.location.href);
      };

      // Listen for all navigation events
      window.addEventListener('popstate', handlePopState);
      window.addEventListener('hashchange', handleHashChange);

      // Store cleanup function
      (window as any).__navigationCleanup = () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('hashchange', handleHashChange);
        clearInterval(navigationMonitor);
        console.log("🔓 Navigation protection disabled");
      };
    }, 500); // Wait 500ms after page load to enable protection

    return () => {
      clearTimeout(enableProtection);
      if ((window as any).__navigationCleanup) {
        (window as any).__navigationCleanup();
        delete (window as any).__navigationCleanup;
      }
    };
  }, [userType, loading, loadingProfile]);

  // Fetch employee profile data for header
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!userType) return;
      
      // Check if this is a fresh login by checking the flags directly (not loading state)
      // This is more reliable than checking loading state which might be stale
      const urlParams = new URLSearchParams(window.location.search);
      const urlJustLoggedIn = urlParams.get("justLoggedIn");
      let sessionJustLoggedIn = sessionStorage.getItem("justLoggedIn");
      let localJustLoggedIn = localStorage.getItem("justLoggedIn");
      
      // If URL parameter exists but storage flags don't, restore them
      if (urlJustLoggedIn === "true" && (!sessionJustLoggedIn || !localJustLoggedIn)) {
        console.log("🔄 fetchEmployeeProfile - URL flag found but storage flags missing - restoring them");
        sessionStorage.setItem("justLoggedIn", "true");
        localStorage.setItem("justLoggedIn", "true");
        sessionJustLoggedIn = "true";
        localJustLoggedIn = "true";
      }
      
      const isFreshLogin = urlJustLoggedIn === "true" || sessionJustLoggedIn === "true" || localJustLoggedIn === "true";
      
      console.log("📥 Fetching profile - isFreshLogin:", isFreshLogin, "URL:", urlJustLoggedIn, "session:", sessionJustLoggedIn, "local:", localJustLoggedIn, "current loading:", loading);
      
      // If it's a fresh login, ensure loading stays true (don't override if already true)
      if (isFreshLogin) {
        console.log("✅ Fresh login - ensuring loading stays true");
        if (!loading) {
          setLoading(true);
        }
        if (!loadingProfile) {
          setLoadingProfile(true);
        }
      } else {
        // For reload, ensure loading is false only if it's not already a fresh login
        // Don't override if loading was set to true by first check
        if (loading && !sessionJustLoggedIn && !localJustLoggedIn && !urlJustLoggedIn) {
          console.log("🔄 Reload - ensuring loading is false");
          setLoading(false);
          setLoadingProfile(false);
        } else {
          console.log("🔄 Reload - keeping current loading state:", loading);
        }
      }
      
      try {
        console.log("Fetching profile for userType:", userType);
        const response = await axios.get("http://localhost:5000/api/employee/profile", {
          withCredentials: true
        });
        console.log("Profile response:", response.data);
        // Use name directly from API response (it should have the name from DB)
        const name = response.data.name?.trim() || Cookies.get("username") || (userType === "admin" ? "Admin User" : "Employee");
        const email = response.data.email || Cookies.get("email") || (userType === "admin" ? "admin@company.com" : "");
        
        console.log("Setting profile - name:", name, "email:", email, "profilePic:", response.data.profilePic);
        setEmployeeName(name);
        setEmployeeEmail(email);
        setEmployeeProfilePic(response.data.profilePic || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to cookies if API fails
        const cookieName = Cookies.get("username") || (userType === "admin" ? "Admin User" : "");
        const cookieEmail = Cookies.get("email") || (userType === "admin" ? "admin@company.com" : "");
        console.log("Using cookies - name:", cookieName, "email:", cookieEmail);
        setEmployeeName(cookieName);
        setEmployeeEmail(cookieEmail);
        } finally {
          setLoadingProfile(false);
          // Only show loading delay if this is a fresh login (not a reload)
          if (isFreshLogin) {
            console.log("⏳ Fresh login - waiting 1200ms before hiding loading");
            // Remove the flag now that we've used it
            sessionStorage.removeItem("justLoggedIn");
            localStorage.removeItem("justLoggedIn");
            // Clean up URL parameter
            if (urlJustLoggedIn === "true") {
              window.history.replaceState({}, "", window.location.pathname);
            }
            // Hide loading after profile is loaded (with delay for smooth transition)
            setTimeout(() => {
              console.log("✅ Hiding loading page after delay");
              setLoading(false);
            }, 1200); // Longer delay to show loading page
          } else {
            // For reloads, ensure loading is false so dashboard can render immediately
            console.log("🔄 Reload - keeping loading false, dashboard should render");
            setLoading(false);
          }
        }
    };

    // Fetch profile immediately (no delay needed for reloads)
    fetchEmployeeProfile();
  }, [userType]);

  // Fetch attendance status for security check (for employees and managers)
  const fetchAttendanceStatus = useCallback(async () => {
    if (!loading && (userType === "employee" || userType === "manager")) {
      try {
        const response = await axios.get("http://localhost:5000/api/attendance/today", {
          withCredentials: true
        });
        setAttendanceStatus(response.data);
      } catch (error) {
        console.error("Error fetching attendance status:", error);
        setAttendanceStatus(null);
      }
    }
  }, [userType, loading]);

  // Global navigation handler for dashboard quick actions
  useEffect(() => {
    const handleNavigateEvent = (e: Event) => {
      const custom = e as CustomEvent<{ view?: string }>;
      const targetView = custom.detail?.view;
      if (typeof targetView === "string" && targetView.length > 0) {
        setActiveView(targetView);
      }
    };
    window.addEventListener('navigateToView', handleNavigateEvent as EventListener);
    return () => {
      window.removeEventListener('navigateToView', handleNavigateEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAttendanceStatus();
      // Refresh attendance status every 30 seconds
      const interval = setInterval(fetchAttendanceStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchAttendanceStatus, loading]);

  // Refresh attendance status when navigating to/from attendance page
  useEffect(() => {
    if (!loading && (userType === "employee" || userType === "manager")) {
      fetchAttendanceStatus();
    }
  }, [activeView, fetchAttendanceStatus, userType, loading]);

  // Refresh manager dashboard when navigating to it
  useEffect(() => {
    if (userType === "manager" && activeView === "dashboard") {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshDashboard'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeView, userType]);

  // Listen for custom event when attendance changes (check-in/check-out)
  useEffect(() => {
    const handleAttendanceChange = () => {
      fetchAttendanceStatus();
    };

    window.addEventListener('attendanceChanged', handleAttendanceChange);
    return () => {
      window.removeEventListener('attendanceChanged', handleAttendanceChange);
    };
  }, [fetchAttendanceStatus]);

  // Handle logout with security check
  const handleLogout = async () => {
    // Security check: For employees and managers - prevent logout if checked in but not checked out
    if ((userType === "employee" || userType === "manager") && attendanceStatus) {
      const isCheckedIn = attendanceStatus.checkInTime && !attendanceStatus.checkOutTime;
      
      if (isCheckedIn) {
        // Show security dialog
        setShowSecurityDialog(true);
        return;
      }
    }

    // Safe to logout
    performLogout();
  };

  // Function to get real-time location from browser (optional, non-blocking)
  // If permission denied or unavailable, returns null and backend will use IP geolocation
  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('📍 Browser geolocation not supported - will use IP geolocation (no permission required)');
        resolve(null);
        return;
      }

      // Quick timeout - don't wait too long
      const timeout = setTimeout(() => {
        console.log('⏱️ Geolocation timeout - will use IP geolocation (no permission required)');
        resolve(null);
      }, 11000); // Longer timeout for high accuracy location

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📍 Got browser location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(res => res.json())
            .then(data => {
              const locationParts = [];
              if (data.city) locationParts.push(data.city);
              if (data.principalSubdivision) locationParts.push(data.principalSubdivision);
              if (data.countryName) locationParts.push(data.countryName);
              const location = locationParts.length > 0 ? locationParts.join(', ') : `${latitude}, ${longitude}`;
              console.log(`✅ Browser location resolved: ${location}`);
              // Return object with location string and coordinates
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
          // Don't log as error - permission denied is expected, will use IP geolocation
          console.log(`📍 Browser geolocation not available (${error.message}) - will use IP geolocation (no permission required)`);
          resolve(null); // Return null, backend will use IP geolocation
        },
        {
          enableHighAccuracy: true, // Always use high accuracy for better location
          timeout: 10000, // Longer timeout to allow time for high accuracy location
          maximumAge: 0 // Always get fresh location, don't use cached
        }
      );
    });
  };

  // Perform actual logout
  const performLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Always try to get browser location with high accuracy (REQUIRED for accurate logging)
      // If denied/unavailable, backend will automatically use IP geolocation (no permission required)
      // Please allow location permission when prompted for accurate location tracking
      const browserLocation = await Promise.race([
        getBrowserLocation(),
        new Promise(resolve => setTimeout(() => resolve(null), 11500)) // Max 11.5 second wait (slightly longer than geolocation timeout)
      ]);
      
      // Call logout API with location and coordinates
      await axios.post("http://localhost:5000/logout", {
        location: browserLocation?.location || null,
        latitude: browserLocation?.latitude || null,
        longitude: browserLocation?.longitude || null,
        accuracy: browserLocation?.accuracy || null
      }, {
        withCredentials: true
      });
    } catch (err) {
      console.error('Error calling logout API:', err);
      // Continue with logout even if API call fails
    }
    
    // Clear all cookies
    Cookies.remove("userId");
    Cookies.remove("userType");
    Cookies.remove("username");
    Cookies.remove("email");
    
    // Clear localStorage
    localStorage.removeItem("userType");
    
    // Clear all login flags to ensure next login is treated as fresh
    sessionStorage.removeItem("justLoggedIn");
    localStorage.removeItem("justLoggedIn");
    
    console.log("🚪 Logging out - cleared all cookies and flags");
    
    // Delay to show logout loading, then redirect
    setTimeout(() => {
      window.location.href = "http://localhost:3001/login";
    }, 1500); // Longer delay to show logout loading page
  };

  // Call hooks BEFORE any conditional returns (Rules of Hooks)





  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Fetch pending applications count for employee - MUST be before conditional return
  useEffect(() => {
    if (userType === "employee" && !loading) {
      const fetchPendingCount = async () => {
        try {
          console.log("🔄 Fetching pending applications count...");
          const response = await axios.get("http://localhost:5000/leave_applications_Employee", {
            withCredentials: true
          });
          console.log("📥 Response received:", response.data);
          if (response.data && Array.isArray(response.data)) {
            // Log all application statuses to debug
            console.log("📋 All application statuses:", response.data.map((app: any) => ({
              id: app._id,
              status: app.status,
              statusType: typeof app.status,
              statusLower: app.status?.toLowerCase(),
              leaveType: app.leaveType
            })));
            
            const pending = response.data.filter((app: any) => {
              const status = app.status?.toLowerCase() || '';
              const isPending = status === "pending";
              if (!isPending) {
                console.log(`⚠️ Application ${app._id} has status: "${app.status}" (not pending)`);
              }
              return isPending;
            }).length;
            
            console.log("📊 Pending applications count:", pending, "out of", response.data.length, "total applications");
            console.log("📋 Applications breakdown:", {
              pending: response.data.filter((app: any) => (app.status?.toLowerCase() || '') === "pending").length,
              approved: response.data.filter((app: any) => (app.status?.toLowerCase() || '') === "approved").length,
              rejected: response.data.filter((app: any) => (app.status?.toLowerCase() || '') === "rejected").length,
              draft: response.data.filter((app: any) => (app.status?.toLowerCase() || '') === "draft").length,
              cancelled: response.data.filter((app: any) => (app.status?.toLowerCase() || '') === "cancelled").length,
            });
            console.log("✅ Setting pendingApplicationsCount to:", pending);
            setPendingApplicationsCount(pending);
          } else {
            console.warn("⚠️ Invalid response format:", response.data);
            setPendingApplicationsCount(0);
          }
        } catch (error: any) {
          console.error("❌ Error fetching pending applications count:", error);
          console.error("Error details:", error.response?.data);
          setPendingApplicationsCount(0);
        }
      };
      
      // Initial fetch with a small delay to ensure userType is set
      const initialTimer = setTimeout(() => {
        fetchPendingCount();
      }, 100);
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      
      // Listen for application changes - use a more reliable approach
      const handleApplicationChange = (event?: Event) => {
        console.log("🔄 Application status changed event received, refreshing badge count...");
        // Add a small delay to ensure backend has processed the change
        setTimeout(() => {
          fetchPendingCount();
        }, 500);
      };
      
      // Listen to both custom event and storage events for more reliability
      window.addEventListener('applicationStatusChanged', handleApplicationChange);
      window.addEventListener('storage', handleApplicationChange);
      
      // Also listen for focus events to refresh when user returns to tab
      const handleFocus = () => {
        fetchPendingCount();
      };
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
        window.removeEventListener('applicationStatusChanged', handleApplicationChange);
        window.removeEventListener('storage', handleApplicationChange);
        window.removeEventListener('focus', handleFocus);
      };
    } else {
      // Reset count when not employee
      console.log("🔄 Not employee or still loading, resetting badge count");
      setPendingApplicationsCount(0);
      return () => {}; // Always return a cleanup function
    }
  }, [userType, loading]);

  // Fetch pending team leave requests count for manager
  useEffect(() => {
    if (userType === "manager" && !loading) {
      const fetchManagerPendingCount = async () => {
        try {
          console.log("🔄 Fetching manager pending team leave requests count...");
          const response = await axios.get("http://localhost:5000/leave_applications_Employee", {
            withCredentials: true
          });
          console.log("📥 Manager response received:", response.data);
          if (response.data && Array.isArray(response.data)) {
            const pending = response.data.filter((app: any) => {
              const status = (app.status || "").toLowerCase();
              return status === "pending";
            }).length;
            
            console.log("📊 Manager pending team requests count:", pending, "out of", response.data.length, "total requests");
            setManagerPendingRequestsCount(pending);
          } else {
            console.warn("⚠️ Invalid manager response format:", response.data);
            setManagerPendingRequestsCount(0);
          }
        } catch (error: any) {
          console.error("❌ Error fetching manager pending requests count:", error);
          setManagerPendingRequestsCount(0);
        }
      };
      
      // Initial fetch
      const initialTimer = setTimeout(() => {
        fetchManagerPendingCount();
      }, 100);
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchManagerPendingCount, 30000);
      
      // Listen for application changes
      const handleApplicationChange = (event?: Event) => {
        console.log("🔄 Manager: Application status changed, refreshing badge count...");
        setTimeout(() => {
          fetchManagerPendingCount();
        }, 500);
      };
      
      window.addEventListener('applicationStatusChanged', handleApplicationChange);
      window.addEventListener('focus', () => fetchManagerPendingCount());
      
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
        window.removeEventListener('applicationStatusChanged', handleApplicationChange);
      };
    } else {
      setManagerPendingRequestsCount(0);
      return () => {};
    }
  }, [userType, loading]);

  // Fetch unread notifications count for all user types
  useEffect(() => {
    if (!loading) {
      const fetchUnreadNotificationsCount = async () => {
        try {
          const userId = document.cookie.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];
          if (!userId) return;
          
          console.log("🔄 Fetching unread notifications count...");
          const response = await axios.get(`http://localhost:5000/notifications/${userId}`, {
            withCredentials: true
          });
          
          if (response.data && Array.isArray(response.data)) {
            const unreadCount = response.data.filter((notif: any) => !notif.read).length;
            console.log("📬 Unread notifications count:", unreadCount, "out of", response.data.length, "total notifications");
            setUnreadNotificationsCount(unreadCount);
          }
        } catch (error: any) {
          console.error("❌ Error fetching unread notifications count:", error);
          setUnreadNotificationsCount(0);
        }
      };
      
      // Initial fetch
      const initialTimer = setTimeout(() => {
        fetchUnreadNotificationsCount();
      }, 100);
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadNotificationsCount, 30000);
      
      // Listen for notification changes
      const handleNotificationChange = () => {
        console.log("🔄 Notification changed, refreshing count...");
        setTimeout(() => {
          fetchUnreadNotificationsCount();
        }, 500);
      };
      
      window.addEventListener('notificationChanged', handleNotificationChange);
      window.addEventListener('focus', () => fetchUnreadNotificationsCount());
      
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
        window.removeEventListener('notificationChanged', handleNotificationChange);
      };
    }
  }, [loading]);

  // Refresh badge count when navigating to my-applications
  useEffect(() => {
    if (userType === "employee" && activeView === "my-applications" && !loading) {
      // Trigger a refresh of the badge count with a small delay
      console.log("🔄 Navigating to my-applications, refreshing badge count...");
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'navigate' } }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeView, userType, loading]);

  // Create employee menu items with dynamic badge - use useMemo to ensure it updates
  // MUST be before conditional return to follow Rules of Hooks
  const employeeMenuItems = useMemo(() => {
    // Ensure we have a valid number
    const count = typeof pendingApplicationsCount === 'number' ? pendingApplicationsCount : 0;
    const badgeValue = count > 0 ? count.toString() : null;
    console.log("🏷️ Updating employee menu items with badge count:", count, "badge value:", badgeValue, "type:", typeof badgeValue);
    console.log("🔢 Badge will show:", count > 0, "because count is:", count);
    const items = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "apply-leave", label: "Apply for Leave", icon: Plus },
      { 
        id: "my-applications", 
        label: "My Applications", 
        icon: ClipboardList, 
        badge: badgeValue
      },
      { id: "attendance", label: "Attendance", icon: Clock },
      { id: "wfh-registration", label: "WFH Registration", icon: MapPin },
      { id: "leave-balance", label: "Leave Balance", icon: PieChart },
      { id: "duty-handover", label: "Duty Handover", icon: FileText },
      { id: "task-management", label: "My Tasks", icon: Briefcase },
      { id: "feedback", label: "Feedback", icon: MessageSquare },
    ];
    const myAppsItem = items.find(item => item.id === "my-applications");
    console.log("📋 Employee menu items created:", {
      id: myAppsItem?.id,
      label: myAppsItem?.label,
      badge: myAppsItem?.badge,
      badgeType: typeof myAppsItem?.badge,
      willShow: myAppsItem?.badge !== null && myAppsItem?.badge !== undefined && myAppsItem?.badge !== ""
    });
    return items;
  }, [pendingApplicationsCount]);

  // Create manager menu items with dynamic badge - use useMemo to ensure it updates
  // MUST be before conditional return to follow Rules of Hooks
  const managerMenuItems = useMemo(() => {
    const count = typeof managerPendingRequestsCount === 'number' ? managerPendingRequestsCount : 0;
    const badgeValue = count > 0 ? count.toString() : null;
    console.log("🏷️ Updating manager menu items with badge count:", count, "badge value:", badgeValue);
    return [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "apply-leave", label: "Apply for Leave", icon: Plus },
      { id: "mark-attendance", label: "Mark Attendance", icon: UserCheck },
      { id: "duty-handover", label: "Duty Handover", icon: FileText },
      { id: "leave-balance", label: "Leave Balance", icon: Calendar },
      { 
        id: "team-requests", 
        label: "Team Leave Requests", 
        icon: ClipboardList, 
        badge: badgeValue
      },
      { id: "team-attendance", label: "Team Attendance", icon: UserCheck },
      { id: "team-activity", label: "Team Activity", icon: History },
      { id: "team-wfh", label: "Team WFH", icon: MapPin },
      { id: "workflow", label: "Task Management", icon: Briefcase },
      { id: "team-reports", label: "Team Reports", icon: BarChart3 },
      { id: "feedback", label: "Feedback", icon: MessageSquare },
    ];
  }, [managerPendingRequestsCount]);

  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "user-logs", label: "User Activity Logs", icon: History },
    { id: "user-activity", label: "User Activity", icon: Calendar },
    { id: "attendance-time-settings", label: "Attendance Time Settings", icon: Clock },
    { id: "policy_types", label: "Leave Policy Types", icon: FileText },
    { id: "policies", label: "Leave Policies", icon: FileText },
    { id: "applications", label: "Leave Applications", icon: ClipboardList, badge: "12" },
    { id: "wfh-management", label: "WFH Management", icon: MapPin },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  const menuItems = userType === "admin" ? adminMenuItems : 
                   userType === "employee" ? employeeMenuItems : managerMenuItems;

  const renderContent = () => {
    // Global views that work across all user types
    if (activeView === "settings") {
      return <SettingsComponent />;
    }
    if (activeView === "notifications") {
      return <Notifications />;
    }
    if (activeView === "profile") {
      return <Profile />;
    }

    if (userType === "admin") {
      switch (activeView) {
        case "dashboard":
          return <DashboardOverview />;
        case "users":
          return <UserManagement />;
        case "user-logs":
          return <UserLogs />;
        case "user-activity":
          return <UserActivityLog />;
        case "attendance-time-settings":
          return <AttendanceTimeSettings />;
        case "policy_types":
          return <LeaveTypes />;
        case "policies":
          return <LeavePolicies />;
        case "applications":
          return <LeaveApplications />;
        case "wfh-management":
          return <WFHManagement />;
        case "reports":
          return <Reports />;
        case "feedback":
          return <FeedbackManagement />;
        default:
          return <DashboardOverview />;
      }
    } else if (userType === "employee") {
      switch (activeView) {
        case "dashboard":
          return <EmployeeDashboard onNavigate={setActiveView} />;
        case "apply-leave":
          return <LeaveApplication />;
        case "my-applications":
          return <MyApplications />;
        case "attendance":
          return <AttendanceRecord />;
        case "wfh-registration":
          return <WFHRegistration />;
        case "leave-balance":
          return <LeaveBalance />;
        case "duty-handover":
          return <DutyHandover userType="employee" />;
        case "task-management":
          return <EmployeeTaskManagement />;
        case "feedback":
          return <Feedback />;
        default:
          return <EmployeeDashboard onNavigate={setActiveView} />;
      }
    } else {
      switch (activeView) {
        case "dashboard":
          return <ManagerDashboard />;
        case "apply-leave":
          return <LeaveApplication />;
        case "mark-attendance":
          return <ManagerAttendance />;
        case "duty-handover":
          return <DutyHandover userType="manager" />;
        case "leave-balance":
          return <ManagerLeaveBalance />;
        case "team-requests":
          return <TeamLeaveRequests />;
        case "team-attendance":
          return <TeamAttendance />;
        case "team-activity":
          return <TeamActivity />;
        case "team-wfh":
          return <TeamWFH />;
        case "workflow":
          return <WorkflowManagement />;
        case "team-reports":
          return <TeamReports />;
        case "feedback":
          return <FeedbackManagement />;
        default:
          return <ManagerDashboard />;
      }
    }
  };



  // Show different loading pages for dashboard load vs logout
  console.log("🎨 Render check - loading:", loading, "isLoggingOut:", isLoggingOut, "userType:", userType);
  
  if (isLoggingOut) {
    console.log("🚪 Rendering logout loading page");
    return <DashboardLogoutLoading message="Logging out..." />;
  }
  
  if (loading) {
    console.log("⏳ Rendering login loading page");
    return <DashboardLoginLoading message="Logging in..." />;
  }
  
  console.log("✅ Rendering dashboard content");

  return (
    
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-6">
            <div className="flex items-center space-x-3">
              
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                {userType === "admin" ? <Shield className="h-6 w-6" /> : 
                 userType === "employee" ? <User className="h-6 w-6" /> : <Briefcase className="h-6 w-6" />}
              </div>
              <div>
                <h2 className="font-semibold">
                  {userType === "admin" ? "Admin Dashboard" : 
                   userType === "employee" ? "Employee Portal" : "Manager Console"}
                </h2>
                <p className="text-sm text-muted-foreground">Leave & Attendance</p>
              </div>
            </div>
            {/* <div className="mt-4">
              <Select value={userType} onValueChange={(value: "admin" | "employee" | "manager") => {
                setUserType(value);
                setActiveView("dashboard");
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Dashboard</SelectItem>
                  <SelectItem value="employee">Employee Portal</SelectItem>
                  <SelectItem value="manager">Manager Console</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </SidebarHeader>
          
          <SidebarContent className="px-4">
            <SidebarMenu className="space-y-2 mt-4">
              {menuItems.map((item) => {
                // More explicit badge check
                const hasBadge = item.badge !== null && 
                                item.badge !== undefined && 
                                item.badge !== "" && 
                                item.badge !== "0" &&
                                item.badge !== 0;
                const showBadge = Boolean(hasBadge);
                
                if (item.id === "my-applications") {
                  console.log("🔍 Rendering my-applications menu item:", { 
                    badge: item.badge, 
                    badgeType: typeof item.badge,
                    hasBadge,
                    showBadge, 
                    pendingCount: pendingApplicationsCount,
                    userType: userType,
                    menuItemsLength: menuItems.length,
                    isEmployeeMenu: menuItems === employeeMenuItems,
                    fullItem: item
                  });
                  console.log("🎯 Badge rendering decision:", {
                    "item.badge exists": item.badge !== null && item.badge !== undefined,
                    "item.badge !== '0'": item.badge !== "0",
                    "item.badge !== 0": item.badge !== 0,
                    "item.badge !== ''": item.badge !== "",
                    "hasBadge": hasBadge,
                    "showBadge": showBadge,
                    "Will render badge?": showBadge && item.badge
                  });
                }
                return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    className={`w-full justify-start ${
                      activeView === item.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                      {showBadge && item.badge && (
                        <Badge className="ml-auto bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                          {String(item.badge)}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            <div className="mt-8 pt-4 border-t">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setActiveView("notifications")}
                    className={`w-full justify-start ${
                      activeView === "notifications" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <Badge className="ml-auto bg-red-100 text-red-800">
                        {unreadNotificationsCount}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setActiveView("settings")}
                    className={`w-full justify-start ${
                      activeView === "settings" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={toggleTheme}
                    className="w-full justify-start hover:bg-accent"
                  >
                    {getThemeIcon()}
                    <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                    onClick={handleLogout}
                      className="w-full justify-start hover:bg-accent text-red-600"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="flex h-16 items-center px-6 space-x-4">
              <SidebarTrigger />
              <div className="flex-1" />
              {/* Security Reminder Badge for Checked-In Employees */}
              {(userType === "employee" || userType === "manager") && attendanceStatus && attendanceStatus.checkInTime && !attendanceStatus.checkOutTime && (
                <Badge variant="destructive" className="mr-2 animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Checked In - Remember to Check Out
                </Badge>
              )}
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 px-0 relative"
                  onClick={() => setActiveView("notifications")}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotificationsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </Badge>
                  )}
                </Button>
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded-md p-2 transition-colors"
                  onClick={() => setActiveView("profile")}
                >
                  {employeeProfilePic ? (
                    <img 
                      src={`http://localhost:5000${employeeProfilePic}`} 
                      alt={employeeName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                  <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {userType === "admin" ? "A" : userType === "employee" ? (employeeName ? employeeName.charAt(0).toUpperCase() : "E") : "M"}
                  </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">
  {userType === "admin"
    ? "Admin User"
    : userType === "employee"
    ? employeeName || "Employee"
    : userType === "manager"
    ? employeeName || "Manager"
    : "User"}
</p>

<p className="text-xs text-muted-foreground">
  {userType === "admin"
    ? "admin@company.com"
    : userType === "employee"
    ? employeeEmail || "employee@company.com"
    : userType === "manager"
    ? employeeEmail || "manager@company.com"
    : "user@company.com"}
</p>

                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 bg-muted/30">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Security Dialog for Logout Prevention */}
      <AlertDialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDialogTitle>Security Alert: Cannot Logout</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              <div className="space-y-3">
                <p className="font-semibold text-red-600">
                  ⚠️ For security reasons, you cannot logout while you are checked in.
                </p>
                <p>
                  You have checked in today but have not checked out yet. Please check out from the {userType === "manager" ? "Mark Attendance" : "Attendance"} page before logging out.
                </p>
                {attendanceStatus?.checkInTime && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <strong>Check-in Time:</strong> {new Date(attendanceStatus.checkInTime).toLocaleString()}
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  This security measure ensures accurate attendance tracking and prevents unauthorized access.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSecurityDialog(false)}>
              I Understand
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSecurityDialog(false);
                setActiveView("attendance");
              }}
              className="bg-primary"
            >
              Go to Attendance Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
