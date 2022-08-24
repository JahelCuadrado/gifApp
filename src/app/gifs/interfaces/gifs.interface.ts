// To parse this data:
//
//   import { Convert, SearchGifsResponse } from "./file";
//
//   const searchGifsResponse = Convert.toSearchGifsResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SearchGifsResponse {
  data:       Gif[];
  pagination: Pagination;
  meta:       Meta;
}

export interface Gif {
  type:                       Type;
  id:                         string;
  url:                        string;
  slug:                       string;
  bitly_gif_url:              string;
  bitly_url:                  string;
  embed_url:                  string;
  username:                   string;
  source:                     string;
  title:                      string;
  rating:                     Rating;
  content_url:                string;
  source_tld:                 string;
  source_post_url:            string;
  is_sticker:                 number;
  import_datetime:            Date;
  trending_datetime:          string;
  images:                     Images;
  user?:                      User;
  analytics_response_payload: string;
  analytics:                  Analytics;
}

export interface Analytics {
  onload:  Onclick;
  onclick: Onclick;
  onsent:  Onclick;
}

export interface Onclick {
  url: string;
}

export interface Images {
  original:                 FixedHeight;
  downsized:                The480_WStill;
  downsized_large:          The480_WStill;
  downsized_medium:         The480_WStill;
  downsized_small:          DownsizedSmall;
  downsized_still:          The480_WStill;
  fixed_height:             FixedHeight;
  fixed_height_downsampled: FixedHeight;
  fixed_height_small:       FixedHeight;
  fixed_height_small_still: The480_WStill;
  fixed_height_still:       The480_WStill;
  fixed_width:              FixedHeight;
  fixed_width_downsampled:  FixedHeight;
  fixed_width_small:        FixedHeight;
  fixed_width_small_still:  The480_WStill;
  fixed_width_still:        The480_WStill;
  looping:                  Looping;
  original_still:           The480_WStill;
  original_mp4:             DownsizedSmall;
  preview:                  DownsizedSmall;
  preview_gif:              The480_WStill;
  preview_webp:             The480_WStill;
  "480w_still":             The480_WStill;
  hd?:                      DownsizedSmall;
}

export interface The480_WStill {
  height: string;
  width:  string;
  size:   string;
  url:    string;
}

export interface DownsizedSmall {
  height:   string;
  width:    string;
  mp4_size: string;
  mp4:      string;
}

export interface FixedHeight {
  height:    string;
  width:     string;
  size:      string;
  url:       string;
  mp4_size?: string;
  mp4?:      string;
  webp_size: string;
  webp:      string;
  frames?:   string;
  hash?:     string;
}

export interface Looping {
  mp4_size: string;
  mp4:      string;
}

export enum Rating {
  G = "g",
  PG = "pg",
}

export enum Type {
  GIF = "gif",
}

export interface User {
  avatar_url:    string;
  banner_image:  string;
  banner_url:    string;
  profile_url:   string;
  username:      string;
  display_name:  string;
  description:   string;
  instagram_url: string;
  website_url:   string;
  is_verified:   boolean;
}

export interface Meta {
  status:      number;
  msg:         string;
  response_id: string;
}

export interface Pagination {
  total_count: number;
  count:       number;
  offset:      number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toSearchGifsResponse(json: string): SearchGifsResponse {
      return cast(JSON.parse(json), r("SearchGifsResponse"));
  }

  public static searchGifsResponseToJson(value: SearchGifsResponse): string {
      return JSON.stringify(uncast(value, r("SearchGifsResponse")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
  if (key) {
      throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
  }
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
      typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
      typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
      if (typeof typ === typeof val) return val;
      return invalidValue(typ, val, key);
  }

  function transformUnion(typs: any[], val: any): any {
      // val must validate against one typ in typs
      const l = typs.length;
      for (let i = 0; i < l; i++) {
          const typ = typs[i];
          try {
              return transform(val, typ, getProps);
          } catch (_) {}
      }
      return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
      if (cases.indexOf(val) !== -1) return val;
      return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
      // val must be an array with no invalid elements
      if (!Array.isArray(val)) return invalidValue("array", val);
      return val.map(el => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
      if (val === null) {
          return null;
      }
      const d = new Date(val);
      if (isNaN(d.valueOf())) {
          return invalidValue("Date", val);
      }
      return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
      if (val === null || typeof val !== "object" || Array.isArray(val)) {
          return invalidValue("object", val);
      }
      const result: any = {};
      Object.getOwnPropertyNames(props).forEach(key => {
          const prop = props[key];
          const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
          result[prop.key] = transform(v, prop.typ, getProps, prop.key);
      });
      Object.getOwnPropertyNames(val).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(props, key)) {
              result[key] = transform(val[key], additional, getProps, key);
          }
      });
      return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
      if (val === null) return val;
      return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === "object" && typ.ref !== undefined) {
      typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
      return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
          : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
          : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  "SearchGifsResponse": o([
      { json: "data", js: "data", typ: a(r("Datum")) },
      { json: "pagination", js: "pagination", typ: r("Pagination") },
      { json: "meta", js: "meta", typ: r("Meta") },
  ], false),
  "Datum": o([
      { json: "type", js: "type", typ: r("Type") },
      { json: "id", js: "id", typ: "" },
      { json: "url", js: "url", typ: "" },
      { json: "slug", js: "slug", typ: "" },
      { json: "bitly_gif_url", js: "bitly_gif_url", typ: "" },
      { json: "bitly_url", js: "bitly_url", typ: "" },
      { json: "embed_url", js: "embed_url", typ: "" },
      { json: "username", js: "username", typ: "" },
      { json: "source", js: "source", typ: "" },
      { json: "title", js: "title", typ: "" },
      { json: "rating", js: "rating", typ: r("Rating") },
      { json: "content_url", js: "content_url", typ: "" },
      { json: "source_tld", js: "source_tld", typ: "" },
      { json: "source_post_url", js: "source_post_url", typ: "" },
      { json: "is_sticker", js: "is_sticker", typ: 0 },
      { json: "import_datetime", js: "import_datetime", typ: Date },
      { json: "trending_datetime", js: "trending_datetime", typ: "" },
      { json: "images", js: "images", typ: r("Images") },
      { json: "user", js: "user", typ: u(undefined, r("User")) },
      { json: "analytics_response_payload", js: "analytics_response_payload", typ: "" },
      { json: "analytics", js: "analytics", typ: r("Analytics") },
  ], false),
  "Analytics": o([
      { json: "onload", js: "onload", typ: r("Onclick") },
      { json: "onclick", js: "onclick", typ: r("Onclick") },
      { json: "onsent", js: "onsent", typ: r("Onclick") },
  ], false),
  "Onclick": o([
      { json: "url", js: "url", typ: "" },
  ], false),
  "Images": o([
      { json: "original", js: "original", typ: r("FixedHeight") },
      { json: "downsized", js: "downsized", typ: r("The480_WStill") },
      { json: "downsized_large", js: "downsized_large", typ: r("The480_WStill") },
      { json: "downsized_medium", js: "downsized_medium", typ: r("The480_WStill") },
      { json: "downsized_small", js: "downsized_small", typ: r("DownsizedSmall") },
      { json: "downsized_still", js: "downsized_still", typ: r("The480_WStill") },
      { json: "fixed_height", js: "fixed_height", typ: r("FixedHeight") },
      { json: "fixed_height_downsampled", js: "fixed_height_downsampled", typ: r("FixedHeight") },
      { json: "fixed_height_small", js: "fixed_height_small", typ: r("FixedHeight") },
      { json: "fixed_height_small_still", js: "fixed_height_small_still", typ: r("The480_WStill") },
      { json: "fixed_height_still", js: "fixed_height_still", typ: r("The480_WStill") },
      { json: "fixed_width", js: "fixed_width", typ: r("FixedHeight") },
      { json: "fixed_width_downsampled", js: "fixed_width_downsampled", typ: r("FixedHeight") },
      { json: "fixed_width_small", js: "fixed_width_small", typ: r("FixedHeight") },
      { json: "fixed_width_small_still", js: "fixed_width_small_still", typ: r("The480_WStill") },
      { json: "fixed_width_still", js: "fixed_width_still", typ: r("The480_WStill") },
      { json: "looping", js: "looping", typ: r("Looping") },
      { json: "original_still", js: "original_still", typ: r("The480_WStill") },
      { json: "original_mp4", js: "original_mp4", typ: r("DownsizedSmall") },
      { json: "preview", js: "preview", typ: r("DownsizedSmall") },
      { json: "preview_gif", js: "preview_gif", typ: r("The480_WStill") },
      { json: "preview_webp", js: "preview_webp", typ: r("The480_WStill") },
      { json: "480w_still", js: "480w_still", typ: r("The480_WStill") },
      { json: "hd", js: "hd", typ: u(undefined, r("DownsizedSmall")) },
  ], false),
  "The480_WStill": o([
      { json: "height", js: "height", typ: "" },
      { json: "width", js: "width", typ: "" },
      { json: "size", js: "size", typ: "" },
      { json: "url", js: "url", typ: "" },
  ], false),
  "DownsizedSmall": o([
      { json: "height", js: "height", typ: "" },
      { json: "width", js: "width", typ: "" },
      { json: "mp4_size", js: "mp4_size", typ: "" },
      { json: "mp4", js: "mp4", typ: "" },
  ], false),
  "FixedHeight": o([
      { json: "height", js: "height", typ: "" },
      { json: "width", js: "width", typ: "" },
      { json: "size", js: "size", typ: "" },
      { json: "url", js: "url", typ: "" },
      { json: "mp4_size", js: "mp4_size", typ: u(undefined, "") },
      { json: "mp4", js: "mp4", typ: u(undefined, "") },
      { json: "webp_size", js: "webp_size", typ: "" },
      { json: "webp", js: "webp", typ: "" },
      { json: "frames", js: "frames", typ: u(undefined, "") },
      { json: "hash", js: "hash", typ: u(undefined, "") },
  ], false),
  "Looping": o([
      { json: "mp4_size", js: "mp4_size", typ: "" },
      { json: "mp4", js: "mp4", typ: "" },
  ], false),
  "User": o([
      { json: "avatar_url", js: "avatar_url", typ: "" },
      { json: "banner_image", js: "banner_image", typ: "" },
      { json: "banner_url", js: "banner_url", typ: "" },
      { json: "profile_url", js: "profile_url", typ: "" },
      { json: "username", js: "username", typ: "" },
      { json: "display_name", js: "display_name", typ: "" },
      { json: "description", js: "description", typ: "" },
      { json: "instagram_url", js: "instagram_url", typ: "" },
      { json: "website_url", js: "website_url", typ: "" },
      { json: "is_verified", js: "is_verified", typ: true },
  ], false),
  "Meta": o([
      { json: "status", js: "status", typ: 0 },
      { json: "msg", js: "msg", typ: "" },
      { json: "response_id", js: "response_id", typ: "" },
  ], false),
  "Pagination": o([
      { json: "total_count", js: "total_count", typ: 0 },
      { json: "count", js: "count", typ: 0 },
      { json: "offset", js: "offset", typ: 0 },
  ], false),
  "Rating": [
      "g",
      "pg",
  ],
  "Type": [
      "gif",
  ],
};
