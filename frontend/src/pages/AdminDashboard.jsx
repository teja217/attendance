import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CalendarStats from '../components/CalendarStats';

const AdminDashboard = () => {
  const { user, logout, API_URL } = useContext(AuthContext);
  
  // Dashboard stats and lists state
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalLogs: 0, presentToday: 0, todayString: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Create User form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, attendanceRes] = await Promise.all([
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/attendance/all`)
      ]);
      setUsers(usersRes.data);
      setLogs(attendanceRes.data.logs);
      setStats(attendanceRes.data.stats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name || !email || !password) {
      setFormError('All fields are required');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/users`, {
        name,
        email,
        password,
        role
      });
      setFormSuccess(`User "${res.data.name}" created successfully!`);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('employee');
      // Refresh user lists and stats
      fetchDashboardData();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(null);
      }
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };


  const formatTimestamp = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">⏱️ Attendance Portal</div>
        <div className="nav-user">
          <span className="nav-role-badge admin">Admin: {user.name}</span>
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
            
            {/* Left Column: Stats & Add User Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Stats Panel */}
              <div className="card">
                <h2 className="card-title">Stats Overview</h2>
                <div className="stats-row" style={{ gridTemplateColumns: '1fr', margin: '0' }}>
                  <div className="stat-card" style={{ marginBottom: '1rem' }}>
                    <div className="stat-lbl">Registered Employees</div>
                    <div className="stat-val">{users.filter(u => u.role === 'employee').length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-lbl">Present Today ({stats.todayString})</div>
                    <div className="stat-val" style={{ color: 'var(--success-color)' }}>{stats.presentToday}</div>
                  </div>
                </div>
              </div>

              {/* Create User Card */}
              <div className="card">
                <h2 className="card-title">Register Employee</h2>
                {formError && <div className="alert alert-danger">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                <form onSubmit={handleCreateUser}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. rahul@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="e.g. TempPass123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      className="form-control"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Create Account
                  </button>
                </form>
              </div>

              {/* Employee list */}
              <div className="card">
                <h2 className="card-title">Employees Directory</h2>
                <div className="action-list">
                  {users.map((u) => (
                    <div 
                      className={`action-item ${selectedUser && selectedUser._id === u._id ? 'active-item' : ''}`}
                      key={u._id}
                      style={{ 
                        borderLeft: selectedUser && selectedUser._id === u._id ? '4px solid var(--primary-color)' : '1px solid var(--panel-border)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div 
                        onClick={() => u.role === 'employee' ? setSelectedUser(u) : null}
                        style={{ cursor: u.role === 'employee' ? 'pointer' : 'default', flexGrow: 1 }}
                        title={u.role === 'employee' ? "Click to view attendance calendar" : ""}
                      >
                        <div style={{ fontWeight: '600' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {u.email} ({u.role}) {u.role === 'employee' ? '🔍' : ''}
                        </div>
                      </div>
                      {u._id !== user._id && (
                        <button
                          className="action-btn-del"
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Attendance Log History & Calendar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {selectedUser && (
                <div className="card">
                  <div className="card-title">
                    <span>Attendance Calendar: {selectedUser.name}</span>
                    <button 
                      onClick={() => setSelectedUser(null)} 
                      className="calendar-nav-btn" 
                      style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                    >
                      Clear Selection
                    </button>
                  </div>
                  <CalendarStats 
                    attendanceLogs={logs.filter(log => (log.user?._id === selectedUser._id || log.user === selectedUser._id))} 
                    createdAt={selectedUser.createdAt} 
                  />
                </div>
              )}

              <div className="card">
                <h2 className="card-title">Attendance Logs</h2>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Check-in Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            No attendance logs available yet.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log._id}>
                            <td style={{ fontWeight: '500' }}>{log.user?.name || 'Deleted User'}</td>
                            <td>{log.user?.email || 'N/A'}</td>
                            <td>{log.dateString}</td>
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

            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;

