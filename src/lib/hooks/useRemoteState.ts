import { useCallback, useEffect, useMemo } from "react";
import { isEqual as isDeepEqual } from "lodash";
import { useReinitializingState } from "./useReinitializingState";
import { useBlockNavigation } from "./useBlockNavigation";

export interface UseRemoteStateProps<T> {
  query: () => { data?: T; isLoading: boolean; error?: any };
  mutation: () => {
    mutate: (data: T) => void;
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
    mutate: uploadState,
    error: mutationError,
    isLoading: isUploading,
  } = useMutation();

  const remoteError = mutationError || queryError;
  const [localState, setLocalState] = useReinitializingState(remoteState);
  const [localError, setLocalError] = useReinitializingState(remoteError);

  useEffect(() => setLocalError(undefined), [localState, setLocalError]);

  const uploadLatestState = useCallback(
    () => localState !== undefined && uploadState(localState),
    [localState, uploadState]
  );

  const isDirty = useMemo(
    () => localState !== undefined && !isEqual(localState, remoteState),
    [isEqual, localState, remoteState]
  );

  useBlockNavigation(isDirty, navigationWarningMessage);

  return {
    localState,
    setLocalState,
    uploadLatestState,
    uploadState,
    isDownloading,
    isUploading,
    isDirty,
    error: localError,
  };
}
