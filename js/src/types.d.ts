import lodash from 'lodash';
declare const _ = lodash;

declare class Stringified<T> extends String {
  private ___stringified: T;
}

interface JSON {
  stringify<T>(
    value: T,
    replacer?: (key: string, value: any) => any,
    space?: string | number
  ): string & Stringified<T>;
  parse<T>(text: Stringified<T>, reviver?: (key: any, value: any) => any): T;
  parse(text: string, reviver?: (key: any, value: any) => any): any;
}

declare function req<T>(
  url: string,
  opt: any
): Promise<{
  code: number;
  headers: {};
  content: T;
}>;

interface VodItem {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
}

interface HomeVodFn {
  list: VodItem[];
}
