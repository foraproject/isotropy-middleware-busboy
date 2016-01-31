/* @flow */
export type IncomingMessage = {
  removeListener: (name: string) => void;
  removeAllListeners: (name: string) => void;
  on: (name: string, fn: Function) => void;
  pipe: (dest: any) => void;
  headers: Object;
  httpVersion: string;
  method: string;
  trailers: Object;
  setTimeout: (msecs: number, callback: Function) => void;
  statusCode: number;
  url: string;
  files: any;
  body: any;
}

export type ServerResponse = {
  writeHead: (code: number, headers: Object) => void;
  write: (data: string) => void;
  end: () => void;
}
