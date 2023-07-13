import { call, put, takeLatest, takeLeading } from "redux-saga/effects";
import { getUserData } from "services/userService";
import loginSlice, { fetchUser, logoutUser } from "./LoginSlice";

function* fetchSaga(action: ReturnType<typeof fetchUser>): object {
  yield put(loginSlice.actions.get_user_data());

  try {
    const response = yield call(
      getUserData,
      action?.payload?.access_token ?? undefined
    );
    yield put(loginSlice.actions.success_user_data(response.data));
  } catch (e) {
    yield put(loginSlice.actions.error_user_data(e as Error));
  }
}

function* logoutSaga(action: ReturnType<typeof logoutUser>): object {
  try {
    localStorage.removeItem("sgs:access-token");
    localStorage.removeItem("sgs:refresh-token");
    yield put(loginSlice.actions.logout_data());
  } catch (e) {
    yield put(loginSlice.actions.error_user_data(e as Error));
  }
}

function* loginSaga() {
  yield takeLatest(fetchUser.type, fetchSaga);
  yield takeLeading(logoutUser.type, logoutSaga);
}

export default loginSaga;
