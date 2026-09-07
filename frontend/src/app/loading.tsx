import React from 'react';
import { LoadingScreen } from '../components/LoadingScreen';

export default function Loading() {
  return <LoadingScreen message="Preparing Workspace..." submessage="Syncing latest task board & permissions" />;
}
