import { createContext, useContext } from 'react';
import type dayjs from '../i18n/dayjs';

interface ICalendarContext {
  calendar: plugin.CalendarSets<string>;
  months: dayjs.MonthNames;
  currentSet: {
    monthWeeks: plugin.Sets<string>;
    weekDays: dayjs.WeekdayNames;
  };
  getDayForDate: (day: string) => number | '-';
  setNextMonth: () => void;
  setPrevMonth: () => void;
}

// @ts-ignore
export const CalendarContext = createContext<ICalendarContext>();

export const useCalendarContext = () => useContext(CalendarContext);
