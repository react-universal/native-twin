import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import calendarPlugin from 'dayjs-plugin-calendar-sets';
import DisBetween from 'dayjs/plugin/isBetween';
import DisToday from 'dayjs/plugin/isToday';
import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(DisBetween);
dayjs.extend(DisToday);
dayjs.extend(localeData);
dayjs.extend(calendarPlugin);

const useCalendarSet = () => {
  const calendar = useMemo(() => dayjs.calendarSets(), []);
  const [monthWeeks, setMonthWeeks] = useState(() => calendar.month());
  const months = useMemo(() => dayjs.months(), []);
  const weekDays = useMemo(() => dayjs.weekdaysMin(), []);
  const getDayForDate = (day: string) => {
    if (day === '') {
      return '-';
    }
    const date = dayjs(day);
    return date.isValid() ? date.get('date') : '-';
  };

  const setNextMonth = () => setMonthWeeks(calendar.next());
  const setPrevMonth = () => setMonthWeeks(calendar.prev());
  return {
    calendar,
    months,
    currentSet: {
      monthWeeks,
      weekDays,
    },
    getDayForDate,
    setNextMonth,
    setPrevMonth,
  };
};

export { useCalendarSet };
