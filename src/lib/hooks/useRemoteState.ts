import { useCallback, useMemo } from "react";
import { isEqual as isDeepEqual } from "lodash";
import { useReinitializingState } from "./useReinitializingState";
import { useBlockNavigation } from "./useBlockNavigation";

export interface UseRemoteStateProps<T> {
  query: () => { data?: T; isLoading: boolean };
  mutation: () => {
    mutate: (data: T) => void;
    isLoading: boolean;
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
  const { data: remoteState } = useQuery();
  const { mutate: uploadState, isLoading: isUploading } = useMutation();
  const [localState, setLocalState] = useReinitializingState(remoteState);
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
    isUploading,
    isDirty,
  };
}
