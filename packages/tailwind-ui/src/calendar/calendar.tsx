import { useCallback } from 'react';
import { useCalendarSet } from '@medico/universal/hooks/useCalendarSet';
import dayjs from '@medico/universal/i18n/dayjs';
import { Picker } from '@medico/universal/picker';
import { colors } from '@medico/universal/tailwind';
import { View, Span } from '@universal-labs/primitives';
import { AppIcons, Button } from '../common';

interface ICalendarViewProps {
  onPressDay: (day: string) => void;
  disablePastDays?: boolean;
}

const CalendarView = ({ onPressDay, disablePastDays = false }: ICalendarViewProps) => {
  const { months, currentSet, getDayForDate, setNextMonth, setPrevMonth, calendar } =
    useCalendarSet();
  const isDisabledDay = useCallback(
    (day: string) => {
      if (day === '') return true;
      if (disablePastDays) {
        return dayjs(day).isBefore(new Date());
      }
      return false;
    },
    [disablePastDays],
  );
  return (
    <View className='w-full bg-gray-300'>
      <View className='w-full items-center justify-center bg-white py-5 px-5'>
        <Picker
          label='Select Month'
          onChangeValue={() => {}}
          value={''}
          options={months.map((item) => ({
            label: item,
            value: item,
          }))}
        />
        {/* <select className='rounded-lg py-1 px-3 text-lg'>
          {months.map((item) => (
            <option key={`select-month-${item}`}>{item}</option>
          ))}
        </select> */}
        <View className='w-full max-w-screen-sm flex-row justify-between'>
          <Button onPress={setPrevMonth} className='mx-5 w-1/12 max-w-xs px-4'>
            <AppIcons name='chevron-back' className='stroke-gray-50' color={colors.gray[50]} />
          </Button>
          <View className='items-center justify-center'>
            <Span className='text-lg font-bold'>{months[calendar.$month]}</Span>
          </View>
          <Button onPress={setNextMonth} className='mx-5 w-1/12 max-w-xs px-4'>
            <AppIcons
              name='chevron-back'
              className='rotate-180 stroke-gray-50'
              color={colors.gray[50]}
            />
          </Button>
        </View>
        <View className='mt-2 w-full max-w-screen-sm flex-row'>
          {currentSet.weekDays.map((item) => (
            <View key={`select-week-day-${item}`} className='flex-1 basis-[21%]'>
              <Span className='text-center'>{item}</Span>
            </View>
          ))}
        </View>
        <View className='w-full max-w-screen-sm'>
          {currentSet.monthWeeks.map((week, index) => (
            <View key={`week-select-${week.length}-${index}`} className='flex-1 flex-row'>
              {week.map((day, dayIndex) => (
                <Button
                  key={`week-day-${day}-${week.length}-${dayIndex}-${index}`}
                  className={`
                  bg-primary-100 my-1 mx-1 h-10 flex-1 basis-[21%] items-center justify-center px-2
                  ${isDisabledDay(day) && 'bg-gray-500'}
                  `}
                  onPress={() => onPressDay(day)}
                  isDisabled={isDisabledDay(day)}
                >
                  <Span className='text-white'>{getDayForDate(day)}</Span>
                </Button>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export { CalendarView };
