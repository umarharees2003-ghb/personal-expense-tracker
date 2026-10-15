import React from 'react';

export function RequestStatus({ loading, error, onRetry, empty, emptyAction }) {
  if (loading) return <div className="request-state" role="status"><span className="loading-spinner" /> Loading…</div>;
  if (error) return <div className="request-state request-error" role="alert"><span>{error}</span>{onRetry && <button className="button-quiet" onClick={onRetry}>Try again</button>}</div>;
  if (empty) return <div className="request-state">{empty}{emptyAction}</div>;
  return null;
}
