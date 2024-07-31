const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

export async function getRequest<T>(reqUrl: string, agentSp?: string) {
  const res = await req<T>(reqUrl, {
    method: 'get',
    headers: {
      'User-Agent': agentSp || UA,
    },
  });
  return res.content;
}

export async function postRequest<T>(reqUrl: string, data: Record<string, any>, agentSp?: string) {
  const res = await req<T>(reqUrl, {
    method: 'post',
    postType: 'form',
    headers: {
      'User-Agent': agentSp || UA,
      'x-requested-with': 'XMLHttpRequest',
    },
    data,
  });
  return res.content;
}

function isArrayLike<T extends Record<string, any>>(item: T | T[]): item is T[] {
  if (Array.isArray(item)) {
    return true;
  }
  if (
    typeof item !== 'object' ||
    !Object.prototype.hasOwnProperty.call(item, 'length') ||
    typeof item.length !== 'number' ||
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
