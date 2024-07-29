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

export async function postRequest(reqUrl: string, data: Record<string, any>, agentSp?: string) {
  const res = await req(reqUrl, {
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