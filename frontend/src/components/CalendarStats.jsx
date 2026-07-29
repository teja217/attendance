import React, { useState } from 'react';

const CalendarStats = ({ attendanceLogs = [], createdAt }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get number of days in the current month
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

  // Get the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate date string format "YYYY-MM-DD"
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build calendar grid cells
  const renderDays = () => {
    const cells = [];
    const createdDateTime = createdAt ? new Date(createdAt).getTime() : 0;
    
    // Empty cells for padding before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateString(year, month, d);
      const cellDate = new Date(year, month, d);
      const cellDateTime = cellDate.getTime();
      
      const isFuture = cellDate.setHours(0,0,0,0) > today.setHours(0,0,0,0);
      const isToday = formatDateString(today.getFullYear(), today.getMonth(), today.getDate()) === dateStr;
      const isBeforeEmployment = createdAt && cellDateTime < new Date(createdAt).setHours(0,0,0,0);

      // Check attendance log
      const log = attendanceLogs.find(l => l.dateString === dateStr);
      const isPresent = log && log.status === 'present';
      
      // Determine day of week (0 = Sunday, 6 = Saturday)
      const dayOfWeek = new Date(year, month, d).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let statusClass = 'future';
      let title = `${d} ${monthNames[month]}: Future`;

      if (isBeforeEmployment) {
        statusClass = 'pre-employment';
        title = `${d} ${monthNames[month]}: Pre-employment`;
      } else if (isPresent) {
        statusClass = 'present';
        title = `${d} ${monthNames[month]}: Present`;
      } else if (isFuture) {
        statusClass = 'future';
      } else if (isToday) {
        statusClass = 'pending';
        title = `${d} ${monthNames[month]}: Today (Not marked)`;
      } else {
        // Past day
        if (isWeekend) {
          statusClass = 'weekend';
          title = `${d} ${monthNames[month]}: Weekend`;
        } else {
          statusClass = 'absent';
          title = `${d} ${monthNames[month]}: Absent`;
        }
      }

      cells.push(
        <div
          key={`day-${d}`}
          className={`calendar-day ${statusClass} ${isToday ? 'today' : ''}`}
          title={title}
        >
          <span className="day-number">{d}</span>
          <span className="day-dot"></span>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-btn">◀</button>
        <h3 className="calendar-title">{monthNames[month]} {year}</h3>
        <button onClick={handleNextMonth} className="calendar-nav-btn">▶</button>
      </div>

      <div className="calendar-grid-header">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {renderDays()}
      </div>

      <div className="calendar-legend">
        <div className="legend-item"><span className="legend-dot present"></span> Present</div>
        <div className="legend-item"><span className="legend-dot absent"></span> Absent</div>
        <div className="legend-item"><span className="legend-dot weekend"></span> Weekend</div>
        <div className="legend-item"><span className="legend-dot future"></span> Pending/Future</div>
      </div>
    </div>
  );
};

export default CalendarStats;
