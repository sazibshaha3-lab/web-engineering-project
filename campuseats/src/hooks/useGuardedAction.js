import { useRef, useState } from "react";

// Prevents the same mutation firing twice from a rapid double-click.
// While one call is in flight, further calls are ignored until it
// resolves. `busyKey` lets a single hook instance guard several rows
// in a table (e.g. "approve-r7") while still reporting which one is busy.
export default function useGuardedAction(delay = 450) {
  const [busyKey, setBusyKey] = useState(null);
  const runningRef = useRef(false);

  function run(key, action) {
    if (runningRef.current) return;
    runningRef.current = true;
    setBusyKey(key);
    setTimeout(() => {
      action();
      runningRef.current = false;
      setBusyKey(null);
    }, delay);
  }

  return { busyKey, run };
}
