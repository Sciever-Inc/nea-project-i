import { useSelector } from "react-redux";
import { RootState } from "../redux/app/store";

export default function useLoginState() {
  const login = useSelector((state: RootState) => state?.login);
  console.log()
  const isLoggedIn =
    login?.status === "loaded" &&
    // login?.data?.userDetails &&
    login?.data?.tokens;
  return {
    status: login?.status ?? "none",
    // userDetails: login?.data?.userDetails ?? null,
    tokens: login?.data?.tokens ?? null,
    isLoggedIn: !!isLoggedIn,
  };
}
