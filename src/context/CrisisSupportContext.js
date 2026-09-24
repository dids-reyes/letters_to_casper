import React, {createContext, useContext, useState, useCallback, useEffect, useRef} from 'react';
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
  const activeChecksRef = useRef(new Set());

  useEffect(() => () => {
    activeChecksRef.current.clear();
  }, []);

  const openCrisisModal = useCallback((details = null) => {
    setCrisisDetails(details);
    setIsCrisisModalOpen(true);
  }, []);

  const closeCrisisModal = useCallback(() => {
    setIsCrisisModalOpen(false);
  }, []);

  const triggerBackgroundCrisisCheck = useCallback(({letterId, burnKey} = {}) => {
    if (!letterId || !burnKey) {
      return;
    }

    const checkId = `${letterId}:${burnKey}`;
    if (activeChecksRef.current.has(checkId)) return;
    activeChecksRef.current.add(checkId);

    // Run asynchronously in the provider; never block submission or navigation.
    (async () => {
      try {
        // Covers three model attempts, two one-minute retry cooldowns, and
        // provider/network overhead without blocking any user interaction.
        const deadline = Date.now() + (5 * 60 * 1000);
        while (activeChecksRef.current.has(checkId) && Date.now() < deadline) {
          const response = await fetch(
            `${render_url}/${encodeURIComponent(letterId)}/analysis-status?burnKey=${encodeURIComponent(burnKey)}`,
            {headers: api_key ? {'x-api-key': api_key} : {}},
          );
          if (!response.ok) return;

          const data = await response.json();
          if (!data.pending) {
            if (data.crisis?.requiresSupport === true) {
              setCrisisDetails(data.crisis);
              setIsCrisisModalOpen(true);
            }
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      } catch (err) {
        // Quiet failure: do not throw runtime exceptions or alert the user
      } finally {
        activeChecksRef.current.delete(checkId);
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
