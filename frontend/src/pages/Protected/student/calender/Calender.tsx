import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar: React.FC<{
  onDateSelect?: (date: Date) => void;
  initialDate?: Date;
  selectedDate?: Date | null;
}> = ({
  onDateSelect,
  initialDate = new Date(),
  selectedDate = null,
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  // Generate days in the month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Days from previous month to fill initial week
    const startingDay = firstDay.getDay();

    const days = [];

    // Previous month's days
    for (let i = 0; i < startingDay; i++) {
      const prevMonthDay = new Date(year, month, -startingDay + i + 1);
      days.push({
        date: prevMonthDay,
        currentMonth: false,
      });
    }

    // Current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i);
      days.push({
        date: day,
        currentMonth: true,
      });
    }

    // Next month's days to complete grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        currentMonth: false,
      });
    }

    return days;
  };

  // Month navigation
  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const days = generateCalendarDays(currentDate);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1 &&
      date2 &&
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Is today's date
  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <center>
      <div className="bg-white rounded-lg shadow-md p-4 w-80">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="font-semibold text-lg">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
          {weekdays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => day.currentMonth && onDateSelect?.(day.date)}
              className={`
              p-2 rounded-full text-sm 
              ${!day.currentMonth ? "text-gray-300" : "text-gray-800"}
              ${isToday(day.date) ? "bg-blue-100 font-bold" : ""}
              ${
                selectedDate && isSameDay(day.date, selectedDate)
                  ? "bg-blue-500 text-white"
                  : ""
              }
              ${day.currentMonth ? "hover:bg-blue-100" : ""}
              ${day.currentMonth ? "cursor-pointer" : "cursor-default"}
            `}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
      </div>
    </center>
  );
};

export default Calendar;
