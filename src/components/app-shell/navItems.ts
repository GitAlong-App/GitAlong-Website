import { Compass, Heart, MessageCircle, Settings2, User } from 'lucide-react';

/** The four main app tabs (mirrors the mobile BottomNav). */
export const APP_NAV_ITEMS = [
  { to: '/app/discover', label: 'Discover', icon: Compass, badge: false },
  { to: '/app/messages', label: 'Messages', icon: MessageCircle, badge: true },
  { to: '/app/activity', label: 'Activity', icon: Heart, badge: false },
  { to: '/app/profile', label: 'Profile', icon: User, badge: false },
] as const;

/** Desktop sidebar extras. */
export const APP_SECONDARY_ITEMS = [{ to: '/app/settings', label: 'Settings', icon: Settings2, badge: false }] as const;
