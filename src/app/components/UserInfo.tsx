import { useAppDispatch, useAppSelector } from "../store";
import { auth, selectAuthenticatedUser } from "../slices/auth";

export function UserInfo() {
  const user = useAppSelector(selectAuthenticatedUser);
  const dispatch = useAppDispatch();
  return (
    <>
      <p>Signed in as {user?.username}</p>
      <button onClick={() => dispatch(auth.actions.logout())}>Sign out</button>
    </>
  );
}
