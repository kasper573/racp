import { ComponentProps, ComponentType } from "react";
import { Tooltip } from "@mui/material";
import {
  useRemoteState,
  UseRemoteStateProps,
} from "../../lib/hooks/useRemoteState";
import { CommonForm } from "./CommonForm";
import { ProgressButton } from "./ProgressButton";
import { LoadingIndicator } from "./LoadingIndicator";

export type CommonRemoteFormProps<T> = UseRemoteStateProps<T> &
  Omit<ComponentProps<typeof CommonForm>, "children"> & {
    children: ComponentType<{
      value: T;
      onChange: (value: T) => void;
      error?: unknown;
    }>;
  };

export function CommonRemoteForm<T>({
  children: FormControls,
  query,
  mutation,
  ...props
}: CommonRemoteFormProps<T>) {
  const {
    localState,
    setLocalState,
    uploadLatestState,
    isDownloading,
    isUploading,
    hasUnsavedChanges,
    error: rawError,
  } = useRemoteState<T>({
    query,
    mutation,
  });

  const error = rawError?.data ?? rawError;

  return (
    <CommonForm
      error={error}
      onSubmit={(e) => {
        e.preventDefault();
        uploadLatestState();
      }}
      isLoading={isUploading}
      buttonComponent={(buttonProps) => (
        <Tooltip title={hasUnsavedChanges ? "" : "You have no unsaved changes"}>
          <div>
            <ProgressButton {...buttonProps} disabled={!hasUnsavedChanges} />
          </div>
        </Tooltip>
      )}
      {...props}
    >
      {isDownloading && <LoadingIndicator variant="linear" />}
      {localState !== undefined && (
        <FormControls
          value={localState}
          onChange={setLocalState}
          error={error}
        />
      )}
    </CommonForm>
  );
}
