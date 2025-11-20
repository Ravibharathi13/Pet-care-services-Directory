import { Outlet } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useUser } from "./contexts/UserContext";
import Navigation from "./components/Navigation";

export default function App(){
  const { isAuthenticated, loading } = useUser();
  const hasTracked = useRef(false);

  // Track visitor analytics only for authenticated users, once per session
  useEffect(() => {
    if (isAuthenticated && !loading && !hasTracked.current) {
      const trackVisit = async () => {
        try {
          await fetch('https://pet-care-services-directory-server.onrender.com/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          hasTracked.current = true;
        } catch (error) {
          console.log('Analytics tracking failed:', error);
        }
      };

      trackVisit();
    }
  }, [isAuthenticated, loading]);

  return (
    <div className="app">
      <Navigation />
      <Outlet />
    </div>
  );
}
