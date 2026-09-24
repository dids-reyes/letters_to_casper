import {AiOutlinePushpin} from 'react-icons/ai';
import React, {useEffect, useRef, useState} from 'react';
import {render_base_url, api_key} from '../data/keys';
import './PinLetterDialog.css';
import PinThankYouDialog from './PinThankYouDialog';

export default function PinPaymentReturn({onConfirmed}) {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const token = params.get('pin_payment');
  const cancelled = params.has('pin_cancelled');
  const [dismissed, setDismissed] = useState(false);
  const [state, setState] = useState('checking');
  const [attempt, setAttempt] = useState(0);
  const onConfirmedRef = useRef(onConfirmed);
  onConfirmedRef.current = onConfirmed;
  useEffect(() => {
    if (!token) return undefined;
    let active = true, timer, count = 0;
    const controller = new AbortController();
    const check = async () => {
      count += 1;
      try {
        const response = await fetch(`${render_base_url}/api/pin-payment-status/${encodeURIComponent(token)}`, {
          method: 'POST', headers: {'x-api-key': api_key}, signal: controller.signal,
        });
        const data = await response.json();
        if (!active) return;
        if (response.ok && ['pinned', 'fulfilled'].includes(data.status)) {
          await onConfirmedRef.current?.();
          if (!active) return;
          setState(data.status);
          const url = new URL(window.location.href);
          url.searchParams.delete('pin_payment');
          window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
          return;
        }
        if (response.status === 400 || response.status === 404) { setState('unverified'); return; }
      } catch { if (!active) return; }
      if (count < 20) timer = setTimeout(check, 3000);
      else setState('pending');
    };
    setState('checking'); check();
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [token, attempt]);
  if (dismissed || (!token && !cancelled)) return null;
  if (!cancelled && ['pinned', 'fulfilled'].includes(state)) {
    return <PinThankYouDialog mode={state === 'pinned' ? 'pinned' : 'delivered'} onClose={() => setDismissed(true)} />;
  }
  const dismiss = () => {
    setDismissed(true);
    if (cancelled) {
      const url = new URL(window.location.href);
      url.searchParams.delete('pin_cancelled');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  };
  return <section className="pin-payment-return" role="status" aria-live="polite" aria-labelledby="pin-return-title">
    <span className="pin-return-icon" aria-hidden="true"><AiOutlinePushpin /></span>
    <span className="pin-return-brand">Letters to Casper</span>
    <h2 id="pin-return-title">{cancelled ? 'Maybe another time.' : state === 'checking' ? 'A little moment…' : 'Still waiting for confirmation.'}</h2>
    <p>{cancelled ? 'Checkout was cancelled. You can choose a letter to support whenever you’re ready.'
      : state === 'checking' ? 'Confirming your payment and refreshing the feed…'
      : 'We haven’t confirmed your payment yet. Please check again—there’s no need to pay twice.'}</p>
    {(cancelled || state !== 'checking') && <div className="pin-return-actions">
      <button type="button" aria-label="Dismiss payment status" onClick={dismiss}>{cancelled ? 'Back to the letters' : 'Dismiss'}</button>
      {!cancelled && token && ['pending', 'unverified'].includes(state) && <button type="button" onClick={() => setAttempt(value => value + 1)}>Check again</button>}
    </div>}
  </section>;
}
