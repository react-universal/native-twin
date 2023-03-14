import { useMemo, useState } from 'react';
import dayjs from '@medico/universal/i18n/dayjs';

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
