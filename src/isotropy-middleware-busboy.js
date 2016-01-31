/* @flow */
import busboy from "isotropy-busboy";

import type { FilePartType, FieldPartType, PartType } from "isotropy-busboy";
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

function addPart<TPart: PartType, TValue>(obj: Object, part: TPart, getValue: (i: TPart) => TValue) {
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
  let _part: ?PartType;
  while(_part = (await getPart())) {
    if (_part != null) {
      switch(_part.type) {
        case "field": {
          const part: FieldPartType = _part;
          req.body = req.body || {};
          addPart(req.body, part, p => p.value);
          break;
        }
        case "file": {
          const part: FilePartType = _part;
          req.files = req.files || {};
          const file = await streamToPromise(part.file);
          addPart(
            req.files,
            part,
            (p) => {
              return {
                fieldname: part.fieldname,
                filename: part.filename,
                file,
                transferEncoding: part.transferEncoding,
                mimeType: part.mimeType
              };
            }
          );
          break;
        }
      }
    } else {
      break;
    }
  }
}
