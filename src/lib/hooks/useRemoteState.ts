import { useCallback, useMemo } from "react";
import { isEqual as isDeepEqual } from "lodash";
import { useReinitializingState } from "./useReinitializingState";
import { useBlockNavigation } from "./useBlockNavigation";

export interface UseRemoteStateProps<T> {
  query: any;
  mutation: any;
  isEqual?: (a: T, b: T) => boolean;
  navigationWarningMessage?: string;
}

export function useRemoteState<T>({
  query: useQuery,
  mutation: useMutation,
  isEqual = isDeepEqual,
  navigationWarningMessage = "You have unsaved changes. Are you sure you want to leave?",
}: UseRemoteStateProps<T>) {
  const { data: remoteState } = useQuery();
  const { mutate: uploadState, isUploading } = useMutation();
  const [localState, setLocalState] = useReinitializingState<T>(remoteState);
  const uploadLatestState = useCallback(
    () => uploadState(localState),
    [localState, uploadState]
  );
  const isDirty = useMemo(
    () => !isEqual(localState, remoteState),
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
