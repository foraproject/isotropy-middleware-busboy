/* @flow */
import busboy from "isotropy-busboy";

import type { BodyType, FormDataType, FormDataEntryType } from "isotropy-busboy";
import type { IncomingMessage, ServerResponse } from "./flow/http-types";
import type { Stream } from "./flow/stream";

function streamToPromise(stream: Stream) {
  const buffers = [];
  stream.on("data", (buffer) => buffers.push(buffer));
  return new Promise(function(resolve, reject) {
    stream.on("end", () => {
      var result = Buffer.concat(buffers);
      resolve(result);
    });
  });
}

function addPart<TPart: FormDataEntryType, TValue>(obj: Object, part: TPart, getValue: (i: TPart) => TValue) {
  if (typeof obj[part.fieldname] !== "undefined") {
    if (obj.hasOwnProperty(part.fieldname)) {
      if (obj[part.fieldname] instanceof Array) {
        obj[part.fieldname].push(getValue(part));
      } else {
        obj[part.fieldname] = [obj[part.fieldname]].concat(getValue(part));
      }
    }
  } else {
    obj[part.fieldname] = getValue(part);
  }
}

/*
  For files, we use a Buffer by default.
  TODO: We can try to pipe it out to a /tmp file later. This could be added as an option.
*/
export default async function(req: IncomingMessage, res: ServerResponse) : Promise {
  const getPart = busboy(req);
  let part: ?FormDataEntryType;
  while(part = (await getPart())) {
    if (part != null) {
      if (typeof part.filename !== "undefined") {
        req.files = req.files || {};
        const file = await streamToPromise((part.file : any));
        const filename = part.filename;
        const fieldname = part.fieldname;
        const transferEncoding = part.transferEncoding;
        const mimeType = part.mimeType;
        addPart(
          req.files,
          part,
          (p) => {
            return {
              fieldname,
              filename,
              file,
              transferEncoding,
              mimeType
            };
          }
        );
      } else {
        req.body = req.body || {};
        addPart(req.body, part, p => p.value);
      }
    } else {
      break;
    }
  }
}
