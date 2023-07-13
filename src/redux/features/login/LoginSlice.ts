import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GenericState } from "../../app/genericState";

interface ILocationType {
  municipality: {
    id: number;
    name: string;
    district: {
      id: number;
      name: string;
    };
  };
  area: {
    id: number;
    area_name: string;
  };
  street: {
    id: number;
    street_name: string;
  };
}
interface LoginState
  extends GenericState<{
    tokens?: {
      access_token: string;
      refresh_token?: string;
    };
    userDetails?: {
      address: string | null;
      created_at: string;
      email: string;
      email_verified_at: string;
      id: number;
      name: string;
      phone_no: number | null;
      profile_pic: string | null;
      location: ILocationType;
      gender?: string | null;
      roles: {
        id: number;
        parent_id: number;
        display_name: string;
        name: string;
        created_at: string;
        updated_at: string;
      }[];
      tenant_id: string;
      updated_at: string;
    } | null;
  } | null> {}

const initialState: LoginState = {
  data: null,
  error: undefined,
  status: "none",
};

export const fetchUser = createAction<
  | {
      access_token: string;
    }
  | undefined
>("LOGIN_REQUEST");

export const logoutUser = createAction("LOGOUT");

const loginSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    get_user_data: (state) => {
      state.status = "loading";
      state.data = state.data ?? null;
      state.error = undefined;
    },
    receive_token_data: (
      state,
      action: PayloadAction<{
        access_token: string;
      }>
    ) => {
      state.status = "loaded";
      state.data = {
        userDetails: state?.data?.userDetails,
        tokens: action.payload,
      };
      state.error = undefined;
    },
    success_user_data: (state, action: PayloadAction<any>) => {
      state.status = "loaded";
      state.data = {
        tokens: state?.data?.tokens,
        userDetails: action.payload,
      };
      state.error = undefined;
    },
    error_user_data: (state, action: PayloadAction<Error>) => {
      state.status = "error";
      state.error = action.payload;
    },
    logout_data: (state) => {
      state.data = null;
      state.status = "none";
      state.error = undefined;
    },
  },
});

export default loginSlice;
