import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export const WelcomeBanner = () => {
  const [greeting, setGreeting] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const displayName = user?.firstName || user?.username || 'there';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 p-8 text-white shadow-lg">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {displayName}! 👋
        </h1>
        <p className="text-primary-100 text-lg">
          {today}
        </p>
        <p className="text-primary-200 text-sm mt-2">
          Your AI-powered schedule is optimized and ready
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
    </div>
  );
};
