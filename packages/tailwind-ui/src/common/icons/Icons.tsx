import { useMemo } from 'react';
import { styled } from '@universal-labs/core';
import AddUserIcon from './svgs/AddUserIcon';
import BookIcon from './svgs/BookIcon';
import CalendarIcon from './svgs/CalendarIcon';
import CalendarTodayIcon from './svgs/CalendarTodayIcon';
import CallIcon from './svgs/CallIcon';
import ChatBubblesIcon from './svgs/ChatBubblesIcon';
import CheckboxBlankIcon from './svgs/CheckboxBlankIcon';
import CheckboxFilledIcon from './svgs/CheckboxFilledIcon';
import ChevronBackIcon from './svgs/ChevronBackIcon';
import ChevronDownIcon from './svgs/ChevronDownIcon';
import ClockIcon from './svgs/ClockIcon';
import CloseIcon from './svgs/CloseIcon';
import EditIcon from './svgs/EditIcon';
import EyeIcon from './svgs/EyeIcon';
import EyeOffIcon from './svgs/EyeOffIcon';
import HomeIcon from './svgs/HomeIcon';
import ListIcon from './svgs/ListIcon';
import LockClosedIcon from './svgs/LockClosedIcon';
import LoginIcon from './svgs/LoginIcon';
import LogoutIcon from './svgs/LogoutIcon';
import MapIcon from './svgs/MapIcon';
import MenuIcon from './svgs/MenuIcon';
import MultipleUsersIcon from './svgs/MultipleUsersIcon';
import PhoneIcon from './svgs/PhoneIcon';
import ProfileIcon from './svgs/ProfileIcon';
import SendMessageIcon from './svgs/SendMessageIcon';
import SettingsIcon from './svgs/SettingsIcon';
import TrashIcon from './svgs/TrashIcon';

const sizes = {
  sm: '16',
  md: '20',
  lg: '30',
  xl: '40',
  '2xl': '50',
  '3xl': '60',
  '4xl': '80',
};
type ValuesOf<T extends any[]> = T[number];

type TIcons = [
  'chat-bubbles',
  'profile',
  'settings',
  'add-user',
  'multiple-users',
  'calendar',
  'edit',
  'clock',
  'home',
  'close',
  'menu',
  'logout',
  'login',
  'today',
  'trash',
  'list',
  'call',
  'map',
  'book',
  'lock-closed',
  'chevron-down',
  'chevron-back',
  'checkbox-blank',
  'checkbox-filled',
  'eye',
  'eye-off',
  'send-message',
  'phone',
];
export type TIconNames = ValuesOf<TIcons>;

interface IIconProps {
  name: TIconNames;
  color?: string;
  size?: keyof typeof sizes;
}

const StyledAppIcons = ({ name, size = 'md', color, ...props }: IIconProps) => {
  const iconSize = sizes[size];
  const Icon = useMemo(() => {
    if (name === 'chat-bubbles') {
      return ChatBubblesIcon;
    }
    if (name === 'trash') {
      return TrashIcon;
    }
    if (name === 'chevron-back') {
      return ChevronBackIcon;
    }
    if (name === 'chevron-down') {
      return ChevronDownIcon;
    }
    if (name === 'book') {
      return BookIcon;
    }
    if (name === 'phone') {
      return PhoneIcon;
    }
    if (name === 'send-message') {
      return SendMessageIcon;
    }
    if (name === 'edit') {
      return EditIcon;
    }
    if (name === 'checkbox-blank') {
      return CheckboxBlankIcon;
    }
    if (name === 'checkbox-filled') {
      return CheckboxFilledIcon;
    }
    if (name === 'lock-closed') {
      return LockClosedIcon;
    }
    if (name === 'call') {
      return CallIcon;
    }
    if (name === 'list') {
      return ListIcon;
    }
    if (name === 'today') {
      return CalendarTodayIcon;
    }
    if (name === 'logout') {
      return LogoutIcon;
    }
    if (name === 'login') {
      return LoginIcon;
    }
    if (name === 'settings') {
      return SettingsIcon;
    }
    if (name === 'home') {
      return HomeIcon;
    }
    if (name === 'profile') {
      return ProfileIcon;
    }
    if (name === 'clock') {
      return ClockIcon;
    }
    if (name === 'calendar') {
      return CalendarIcon;
    }
    if (name === 'eye') {
      return EyeIcon;
    }
    if (name === 'eye-off') {
      return EyeOffIcon;
    }
    if (name === 'add-user') {
      return AddUserIcon;
    }
    if (name === 'multiple-users') {
      return MultipleUsersIcon;
    }
    if (name === 'close') {
      return CloseIcon;
    }
    if (name === 'menu') {
      return MenuIcon;
    }
    if (name === 'map') {
      return MapIcon;
    }
    return HomeIcon;
  }, [name]);
  return <Icon width={iconSize} height={iconSize} color={color} {...props} />;
};

export const AppIcons = styled(StyledAppIcons);
