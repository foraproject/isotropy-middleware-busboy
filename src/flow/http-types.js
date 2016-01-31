/* @flow */
export type IncomingMessage = {
  headers: Object;
  httpVersion: string;
  method: string;
  trailers: Object;
  setTimeout: (msecs: number, callback: Function) => void;
  statusCode: number;
  url: string;
  href: any,
  pathname: any,
  search: any,
  query: any  
}

export type ServerResponse = {
  writeHead: (code: number, headers: Object) => void;
  write: (data: string) => void;
  end: () => void;
}
