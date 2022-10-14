import { ComponentProps, ComponentType } from "react";
import { Tooltip } from "@mui/material";
import {
  useRemoteState,
  UseRemoteStateProps,
} from "../../lib/hooks/useRemoteState";
import { CommonForm } from "./CommonForm";
import { ProgressButton } from "./ProgressButton";

export type CommonRemoteFormProps<T> = UseRemoteStateProps<T> &
  Omit<ComponentProps<typeof CommonForm>, "children"> & {
    children: ComponentType<{ value: T; onChange: (value: T) => void }>;
  };

export function CommonRemoteForm<T>({
  children: FormControls,
  query,
  mutation,
  ...props
}: CommonRemoteFormProps<T>) {
  const { localState, setLocalState, uploadLatestState, isUploading, isDirty } =
    useRemoteState<T>({
      query,
      mutation,
    });

  return (
    <CommonForm
      onSubmit={(e) => {
        e.preventDefault();
        uploadLatestState();
      }}
      isLoading={isUploading}
      buttonComponent={(buttonProps) => (
        <Tooltip title={isDirty ? "" : "You have no unsaved changes"}>
          <div>
            <ProgressButton {...buttonProps} disabled={!isDirty} />
          </div>
        </Tooltip>
      )}
      {...props}
    >
      {localState !== undefined && (
        <FormControls value={localState} onChange={setLocalState} />
      )}
    </CommonForm>
  );
}
