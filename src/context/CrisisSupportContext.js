import React, {createContext, useContext, useState, useCallback} from 'react';
import {render_url, api_key} from '../data/keys';

const CrisisSupportContext = createContext({
  isCrisisModalOpen: false,
  crisisDetails: null,
  openCrisisModal: () => {},
  closeCrisisModal: () => {},
  triggerBackgroundCrisisCheck: () => {},
});

export const useCrisisSupport = () => useContext(CrisisSupportContext);

export const CrisisSupportProvider = ({children}) => {
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [crisisDetails, setCrisisDetails] = useState(null);

  const openCrisisModal = useCallback((details = null) => {
    setCrisisDetails(details);
    setIsCrisisModalOpen(true);
  }, []);

  const closeCrisisModal = useCallback(() => {
    setIsCrisisModalOpen(false);
  }, []);

  const triggerBackgroundCrisisCheck = useCallback((message) => {
    if (typeof message !== 'string' || !message.trim()) {
      return;
    }

    // Run asynchronously in the background; never block UI or navigation
    (async () => {
      try {
        const response = await fetch(`${render_url}/crisis-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(api_key ? {'x-api-key': api_key} : {}),
          },
          body: JSON.stringify({message: message.trim()}),
        });

        if (!response.ok) {
          // Quiet failure
          return;
        }

        const data = await response.json();
        if (data && data.requiresSupport === true) {
          setCrisisDetails(data);
          setIsCrisisModalOpen(true);
        }
      } catch (err) {
        // Quiet failure: do not throw runtime exceptions or alert the user
      }
    })();
  }, []);

  return (
    <CrisisSupportContext.Provider
      value={{
        isCrisisModalOpen,
        crisisDetails,
        openCrisisModal,
        closeCrisisModal,
        triggerBackgroundCrisisCheck,
      }}
    >
      {children}
    </CrisisSupportContext.Provider>
  );
};

export default CrisisSupportContext;

