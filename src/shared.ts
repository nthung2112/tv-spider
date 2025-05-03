const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

export async function getRequest<T>(
  reqUrl: string,
  headers?: Record<string, string>,
  withRaw = false
) {
  const res = await req<T>(reqUrl, {
    method: "get",
    headers: {
      "User-Agent": UA,
      ...headers,
    },
  });
  if (withRaw) {
    return res;
  }

  return res.content;
}

export async function postRequest<T>(
  reqUrl: string,
  data: Record<string, any>,
  headers?: Record<string, string>
) {
  const res = await req<T>(reqUrl, {
    method: "post",
    postType: "form",
    headers: {
      "User-Agent": UA,
      "x-requested-with": "XMLHttpRequest",
      ...headers,
    },
    data,
  });
  return res.content;
}

export function getStringBetween(str: string, startChar: string, endChar: string) {
  const start = str.indexOf(startChar);
  const end = str.indexOf(endChar, start + startChar.length + 1);
  return start !== -1 && end !== -1 ? str.substring(start + startChar.length, end) : null;
}

function isArrayLike<T extends Record<string, any>>(item: T | T[]): item is T[] {
  if (Array.isArray(item)) {
    return true;
  }
  if (
    typeof item !== "object" ||
    !Object.prototype.hasOwnProperty.call(item, "length") ||
    typeof item.length !== "number" ||
    item.length < 0
  ) {
    return false;
  }
  for (let i = 0; i < item.length; i++) {
    if (!(i in item)) {
      return false;
    }
  }
  return true;
}

function mapArray<T, K>(items: T[], callback: (item: T, index: any) => K) {
  const results = [] as K[];
  for (let i = 0; i < items.length; i++) {
    results.push(callback(items[i], i));
  }
  return results;
}

export function lodashMap<T extends Record<string, any>, K>(
  items: T | T[],
  iteratee: (value: any, index: any) => K
) {
  if (isArrayLike(items)) {
    return mapArray(items, iteratee);
  }

  return Object.keys(items).map((key) => iteratee(items[key], key));
}

export function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

export function groupBy<T>(arr: T[], fn: ((item: T) => any) | string) {
  return arr.reduce<Record<string, T[]>>((prev, curr) => {
    const groupKey = typeof fn === "string" ? getValue(curr, fn) : fn(curr);
    const group = prev[groupKey] || [];
    group.push(curr);
    return { ...prev, [groupKey]: group };
  }, {});
}

type GetFieldType<Obj, Path> = Path extends `${infer Left}.${string}`
  ? Left extends keyof Obj
    ? Obj[Left]
    : undefined
  : Path extends keyof Obj
  ? Obj[Path]
  : undefined;

export function getValue<TData, TPath extends string, TDefault = GetFieldType<TData, TPath>>(
  data: TData,
  path: TPath,
  defaultValue?: TDefault
): GetFieldType<TData, TPath> | TDefault {
  const value = path
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce<GetFieldType<TData, TPath>>((value, key) => (value as any)?.[key], data as any);

  return value !== undefined ? value : (defaultValue as TDefault);
}
