import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to prevent browser back/forward navigation within the dashboard.
 * If navigation is detected, it triggers logout and redirects to home.
 * 
 * @param {Function} logoutFn - The logout function to execute.
 */
const usePreventNavigation = (logoutFn) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add an extra entry to the history stack to capture the back button action
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = (event) => {
      // When the user clicks the back button, this event is fired.
      // We immediately trigger the logout and redirect.
      console.warn('Navigation attempt detected in protected area. Logging out...');
      
      if (logoutFn) {
        logoutFn();
      }
      
      // Force redirect to home page
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [logoutFn, navigate]);
};

export default usePreventNavigation;


