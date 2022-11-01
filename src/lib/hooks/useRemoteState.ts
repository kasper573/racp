import { useEffect, useMemo, useState } from "react";
import { isEqual as isDeepEqual } from "lodash";
import { useReinitializingState } from "./useReinitializingState";
import { useBlockNavigation } from "./useBlockNavigation";

export interface UseRemoteStateProps<T> {
  query: () => { data?: T; isLoading: boolean; error?: any };
  mutation: () => {
    mutateAsync: (data: T) => Promise<unknown>;
    isLoading: boolean;
    error?: any;
  };
  isEqual?: (a?: T, b?: T) => boolean;
  navigationWarningMessage?: string;
}

export function useRemoteState<T>({
  query: useQuery,
  mutation: useMutation,
  isEqual = isDeepEqual,
  navigationWarningMessage = "You have unsaved changes. Are you sure you want to leave?",
}: UseRemoteStateProps<T>) {
  const {
    data: remoteState,
    error: queryError,
    isLoading: isDownloading,
  } = useQuery();

  const {
    mutateAsync: uploadState,
    error: mutationError,
    isLoading: isUploading,
  } = useMutation();

  const remoteError = mutationError || queryError;
  const [isDirty, setIsDirty] = useState(false);
  const [localState, setLocalState] = useReinitializingState(
    remoteState,
    !isDirty
  );
  const [localError, setLocalError] = useReinitializingState(remoteError);

  useEffect(() => setLocalError(undefined), [localState, setLocalError]);

  async function uploadLatestState() {
    try {
      await uploadState(localState!);
      setIsDirty(false);
    } catch {
      // Ignore errors
    }
  }

  function setLocalStateAndMarkDirty(state: T) {
    setLocalState(state);
    setIsDirty(true);
  }

  const hasUnsavedChanges = useMemo(
    () => isDirty && !isEqual(localState, remoteState),
    [isDirty, isEqual, localState, remoteState]
  );

  useBlockNavigation(hasUnsavedChanges, navigationWarningMessage);

  return {
    localState,
    setLocalState: setLocalStateAndMarkDirty,
    uploadLatestState,
    isDownloading,
    isUploading,
    hasUnsavedChanges,
    error: localError,
  };
}
