import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CalendarStats from '../components/CalendarStats';

const EmployeeDashboard = () => {
  const { user, logout, API_URL } = useContext(AuthContext);
  
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, absentDays: 0, attendanceRate: "0" });
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  // Get local date string YYYY-MM-DD
  const getLocalDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/attendance/my`);
      const { history: logs, stats: s } = res.data;
      
      setHistory(logs);
      setStats(s);

      // Check if user already marked attendance for today
      const todayStr = getLocalDateString();
      const todayLog = logs.find(log => log.dateString === todayStr);
      
      if (todayLog) {
        setCheckedInToday(true);
        const checkInD = new Date(todayLog.timestamp);
        setCheckInTime(checkInD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setCheckedInToday(false);
        setCheckInTime('');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleMarkAttendance = async () => {
    if (checkedInToday || marking) return;
    
    setMarking(true);
    try {
      const todayStr = getLocalDateString();
      await axios.post(`${API_URL}/attendance/mark`, {
        dateString: todayStr,
        status: 'present'
      });
      // Refresh dashboard info
      await fetchAttendanceData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error marking attendance');
    } finally {
      setMarking(false);
    }
  };

  const formatTimestamp = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">⏱️ Attendance Portal</div>
        <div className="nav-user">
          <span className="nav-role-badge employee">Employee: {user.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loader" style={{ margin: '0 auto' }}></div>
          </div>
        ) : (
          <div className="dashboard-grid">
            
            {/* Left Column: Action Check In & Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Check-in Card */}
              <div className="card">
                <h2 className="card-title" style={{ justifyContent: 'center' }}>Daily Status Check-in</h2>
                <div className="check-in-section">
                  <button
                    className={`attendance-circle-btn ${checkedInToday ? 'circle-marked' : 'circle-not-marked'}`}
                    onClick={handleMarkAttendance}
                    disabled={checkedInToday || marking}
                  >
                    {marking ? (
                      <span>Logging...</span>
                    ) : checkedInToday ? (
                      <>
                        <span>Checked In</span>
                        <span className="attendance-btn-time">at {checkInTime}</span>
                      </>
                    ) : (
                      <span>Check In</span>
                    )}
                  </button>
                  <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                    {checkedInToday
                      ? "Awesome! Your attendance is recorded for today."
                      : "Tap the button above to record your attendance for today."}
                  </p>
                </div>
              </div>

              {/* Stats Card */}
              <div className="card">
                <h2 className="card-title">My Performance</h2>
                <div className="stats-row" style={{ gridTemplateColumns: '1fr 1fr', margin: '0', gap: '1rem' }}>
                  <div className="stat-card">
                    <div className="stat-lbl">Present Days</div>
                    <div className="stat-val" style={{ color: 'var(--success-color)' }}>{stats.presentDays}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-lbl">Attendance Rate</div>
                    <div className="stat-val" style={{ color: 'var(--primary-color)' }}>{stats.attendanceRate}%</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Personal Attendance History Table & Calendar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="card">
                <h2 className="card-title">Attendance History</h2>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check-in Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            No attendance records found. Click Check In to start!
                          </td>
                        </tr>
                      ) : (
                        history.map((log) => (
                          <tr key={log._id}>
                            <td style={{ fontWeight: '500' }}>{log.dateString}</td>
                            <td>{formatTimestamp(log.timestamp)}</td>
                            <td>
                              <span className={`status-badge ${log.status}`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h2 className="card-title">Attendance Calendar</h2>
                <CalendarStats attendanceLogs={history} createdAt={user.createdAt} />
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeDashboard;

