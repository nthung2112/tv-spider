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
  vod_remarks?: string;
  vod_play_from?: string;
  vod_play_url?: string;
  vod_director?: string;
  vod_area?: string;
  vod_actor?: string;
  vod_year?: string;
  vod_content?: string;
}

interface VodData {
  list: VodItem[];
}

interface ClassItem {
  id: string;
  name: string;
}

interface FilterValueItem {
  v: string;
  n: string;
}

interface FilterItem {
  key: string;
  init: string;
  name: string;
  value: FilterValueItem[];
}

interface HomeData {
  class: ClassItem[];
  filters: Record<string, FilterItem[]>;
}

interface PlayData {
  parse: number;
  url: string;
}

interface CategoryData {
  page: number;
  pagecount: number;
  limit: number;
  total: number;
  list: VodItem[];
}
