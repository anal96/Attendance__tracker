import React, { useState, useEffect } from "react";

export default function PrivacyPolicy({ isOpen, onClose }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark-mode') || 
             document.body.classList.contains('dark-mode');
    }
    return false;
  });

  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof document !== 'undefined') {
        setIsDarkMode(
          document.documentElement.classList.contains('dark-mode') || 
          document.body.classList.contains('dark-mode')
        );
      }
    };
    
    if (typeof document !== 'undefined') {
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      
      return () => observer.disconnect();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="privacy-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
        overflow: "auto"
      }}
    >
      <div 
        className={`privacy-modal-content ${isDarkMode ? 'dark-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
          color: isDarkMode ? "#e2e8f0" : "#0f172a",
          borderRadius: "16px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.2)",
          position: "relative"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="close-btn"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: isDarkMode ? "#94a3b8" : "#64748b",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = isDarkMode ? "#475569" : "#f1f5f9";
            e.target.style.color = isDarkMode ? "#e2e8f0" : "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = isDarkMode ? "#94a3b8" : "#64748b";
          }}
        >
          ×
        </button>

        {/* Content */}
        <div style={{ padding: "48px 40px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: isDarkMode ? "#e2e8f0" : "#0f172a",
            marginBottom: "8px",
            marginTop: "0"
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontSize: "14px",
            color: isDarkMode ? "#94a3b8" : "#64748b",
            marginBottom: "32px"
          }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div style={{ fontSize: "14px", lineHeight: "1.8", color: isDarkMode ? "#cbd5e1" : "#334155" }}>
            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                1. Introduction
              </h2>
              <p>
                Track.Manage.People ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our attendance management system.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                2. Information We Collect
              </h2>
              <p>We collect the following types of information:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
                <li><strong>Personal Information:</strong> Name, email address, phone number, age, qualification, experience, address, employee ID</li>
                <li><strong>Account Information:</strong> Username, password (encrypted), user type (employee, manager, admin)</li>
                <li><strong>Attendance Data:</strong> Check-in/check-out times, dates, location data (latitude, longitude, accuracy)</li>
                <li><strong>Leave Information:</strong> Leave applications, leave balances, leave history, approval status</li>
                <li><strong>Activity Logs:</strong> Login/logout timestamps, IP addresses, user agent information, location data</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                3. How We Use Your Information
              </h2>
              <p>We use the collected information for the following purposes:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
                <li>To provide and maintain our attendance management service</li>
                <li>To process and manage leave applications</li>
                <li>To generate attendance reports and analytics</li>
                <li>To verify your identity and prevent fraud</li>
                <li>To send notifications about leave approvals, rejections, and important updates</li>
                <li>To comply with legal obligations and enforce our policies</li>
                <li>To improve our services and user experience</li>
                <li>To monitor and analyze usage patterns</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                4. Location Data
              </h2>
              <p>
                We collect location data (GPS coordinates) when you check in or check out for attendance verification purposes. 
                This helps ensure accurate attendance tracking and prevents fraudulent check-ins.
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
                <li>Location data is collected only during check-in/check-out operations</li>
                <li>We use both browser geolocation (with your permission) and IP-based geolocation as a fallback</li>
                <li>Location data is stored securely and is accessible only to authorized administrators</li>
                <li>You can choose to deny location permission, but this may affect attendance verification</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                5. Data Sharing and Disclosure
              </h2>
              <p>We may share your information in the following circumstances:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
                <li><strong>With Your Organization:</strong> Your managers and administrators have access to your attendance and leave data for administrative purposes</li>
                <li><strong>Service Providers:</strong> We may share data with third-party service providers who assist in operating our service (e.g., email services, hosting providers)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale, your data may be transferred to the new entity</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                6. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure password storage using industry-standard hashing algorithms</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                7. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
                unless a longer retention period is required or permitted by law. Specifically:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
                <li>Account information is retained while your account is active</li>
                <li>Attendance records are retained for payroll and compliance purposes</li>
                <li>Leave applications and history are retained for administrative and legal purposes</li>
                <li>Activity logs are retained for security and audit purposes</li>
                <li>Upon account deletion, we will delete or anonymize your data in accordance with applicable laws</li>
              </ul>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                8. Your Rights
              </h2>
              <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>
              <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                To exercise these rights, please contact your system administrator or HR department.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                9. Cookies and Tracking Technologies
              </h2>
              <p>
                We use cookies and similar tracking technologies to maintain your session, remember your preferences, and improve our service. 
                You can control cookies through your browser settings, but disabling cookies may affect the functionality of the service.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                10. Children's Privacy
              </h2>
              <p>
                Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information 
                from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                11. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the 
                new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy 
                periodically for any changes.
              </p>
            </section>

            <section style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: isDarkMode ? "#e2e8f0" : "#0f172a",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                12. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact your system administrator 
                or HR department.
              </p>
            </section>

            <div style={{
              marginTop: "40px",
              padding: "20px",
              backgroundColor: isDarkMode ? "#334155" : "#f8fafc",
              borderRadius: "12px",
              border: `1px solid ${isDarkMode ? "#475569" : "#e2e8f0"}`
            }}>
              <p style={{
                fontSize: "13px",
                color: isDarkMode ? "#cbd5e1" : "#64748b",
                margin: "0",
                fontWeight: "600"
              }}>
                By using our service, you acknowledge that you have read and understood this Privacy Policy and agree to the collection 
                and use of your information as described herein.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



