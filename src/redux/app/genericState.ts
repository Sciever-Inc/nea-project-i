export interface GenericState<T> {
  data: T;
  error: Error | undefined;
  status: "none" | "loading" | "loaded" | "error";
}
