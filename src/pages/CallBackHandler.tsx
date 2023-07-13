import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState } from "../redux/app/store";
import loginSlice, { fetchUser } from "../redux/features/login/LoginSlice";
import { useHistory } from "react-router-dom";

export default function CallbackHandler() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const dispatch = useDispatch();
  const navigate = useHistory();

  useEffect(() => {
    localStorage.setItem("sgs:access-token", params?.get("access_token") || "");
    if (params?.get("access_token")) {
      dispatch(
        loginSlice?.actions?.receive_token_data({
          access_token: params?.get("access_token") ?? "",
        })
      );
      dispatch(
        fetchUser({
          access_token: params?.get("access_token") ?? "",
        })
      );
    }
  }, [params, dispatch]);

  const userDetails = useSelector(
    (state: RootState) => state?.login?.data?.tokens
  );

  useEffect(() => {
    if (userDetails?.access_token) {
      navigate.push("/");
    }
  }, [navigate, userDetails]);

  return null;
}
