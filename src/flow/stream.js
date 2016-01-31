/* @flow */
export type Stream = {
  on: (event: string, cb: Function) => void;
}
