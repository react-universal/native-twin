import { useEffect, useMemo, useRef } from 'react';
import { Strong, View } from '@universal-labs/primitives';
import clsx from 'clsx';
import type dayjs from 'dayjs';
import { Picker } from '../../picker';

function range(size: number, startAt = 0) {
  return Array(size)
    .fill(null)
    .map((v, i) => i + startAt);
}

function parseTimeSegment(segment: number) {
  if (segment < 10) return `0${segment}`;
  return String(segment);
}

interface ITimeListProps {
  selectedTime: dayjs.Dayjs;
  onChangeHour(hour: string): void;
  onChangeMinutes(hour: string): void;
  show: boolean;
  onClose(): void;
}

const TimeList = ({
  selectedTime,
  onChangeHour,
  onChangeMinutes,
  show,
  onClose,
}: ITimeListProps) => {
  const timeListRef = useRef<HTMLElement>();
  const selectedValues = useMemo(() => {
    const selectedHour = selectedTime.format('HH');
    const selectedMinutes = selectedTime.format('mm');
    return {
      selectedHour,
      selectedMinutes,
    };
  }, [selectedTime]);
  const hourList = useMemo(
    () =>
      range(24).map((item) => ({
        label: parseTimeSegment(item),
        value: parseTimeSegment(item),
      })),
    [],
  );
  const minutesList = useMemo(
    () =>
      range(12).map((item) => ({
        label: parseTimeSegment(item * 5),
        value: parseTimeSegment(item * 5),
      })),
    [],
  );

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (timeListRef?.current && show && !timeListRef.current.contains(event.target)) {
        // console.log('REF: ', timeListRef?.current);
        onClose();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [timeListRef, show, onClose]);

  return (
    <View
      ref={timeListRef}
      className={clsx(
        'absolute z-50 flex-row items-center gap-2',
        'rounded-lg bg-gray-100',
        'px-2 py-1',
        show ? 'animate-slide-down flex' : 'hidden opacity-0',
      )}
    >
      <View>
        <Picker
          label='hour'
          onChangeValue={onChangeHour}
          value={selectedValues.selectedHour}
          options={hourList}
        />
      </View>
      <Strong className='text-lg'>:</Strong>
      <View>
        <Picker
          label='minutes'
          onChangeValue={onChangeMinutes}
          value={selectedValues.selectedMinutes}
          options={minutesList}
        />
      </View>
    </View>
  );
};

export { TimeList };
