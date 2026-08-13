import { createContext, useContext } from 'react';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

const BadgeContext = createContext({
  themed: false,
});

const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadgeContext must be used within an Announcement');
  }
  return context;
};

export const Announcement = ({
  variant = 'outline',
  themed = false,
  className,
  ...props
}) => (
  <BadgeContext.Provider value={{ themed }}>
    <Badge
      variant={variant}
      className={cn(
        'max-w-full gap-2 rounded-full bg-white/90 backdrop-blur-md px-3 py-0.5 font-medium shadow-sm transition-all border border-slate-200/80 inline-flex items-center',
        'hover:shadow-md cursor-pointer',
        themed && 'border-slate-300/60',
        className
      )}
      {...props}
    />
  </BadgeContext.Provider>
);

export const AnnouncementTag = ({
  className,
  ...props
}) => {
  const { themed } = useBadgeContext();

  return (
    <div
      className={cn(
        '-ml-2.5 shrink-0 truncate rounded-full bg-[#0B0D10]/10 px-2.5 py-1 text-xs font-semibold',
        themed && 'bg-white/70',
        className
      )}
      {...props}
    />
  );
};

export const AnnouncementTitle = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex items-center gap-1.5 truncate py-1 text-xs font-medium', className)}
    {...props}
  />
);
