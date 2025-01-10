import { getRequest, groupBy, isEmpty, lodashMap } from '../shared';
import { showDateText } from '../util';

let url = 'https://q.thapcamn.xyz';
let siteKey = '';
let siteType = 0;

async function init(cfg: { skey: string; stype: number }): Promise<void> {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}

async function home(filter: boolean): Promise<Stringified<HomeData>> {
  const data = JSON.parse(await getRequest<string>(`${url}/api/match/featured/mt`)).data as any[];
  const featured = JSON.parse(await getRequest<string>(`${url}/api/match/featured`)).data as any[];
  const filterObj: Record<string, any> = {};
  const groupByStatus = groupBy(data, (item) =>
    featured.some((f) => f.id === item.id) ? 'featured' : item.match_status
  );
  const mappingType: Record<string, string> = {
    featured: 'Nổi bật',
    live: 'Đang diễn ra',
    pending: 'Sắp diễn ra',
  };

  const orders = {
    featured: 0,
    live: 1,
    pending: 2,
  };

  const classes = Object.entries(groupByStatus)
    .map(([typeId, matches]) => {
      const tours = groupBy(
        matches.sort((a, b) => b.tournament.priority - a.tournament.priority),
        'tournament.name'
      );
      const tag = {
        key: 'tag',
        name: 'Type',
        init: '',
        value: Object.entries(tours).map(([tourName]) => {
          return {
            n: tourName,
            v: tourName,
          };
        }),
      };

      if (tag.value.length > 0) {
        tag['init'] = tag.value[0].v;
        filterObj[typeId] = [tag];
      }

      return {
        id: typeId,
        name: mappingType[typeId] || 'Không xác định',
      };
    })
    .sort((a, b) => orders[a.id] - orders[b.id]);

  return JSON.stringify({
    class: classes,
    filters: filterObj,
  });
}

async function homeVod(): Promise<Stringified<VodData>> {
  const matches = JSON.parse(await getRequest<string>(url + '/api/match/featured')).data as any[];

  const list = matches
    .sort((a, b) => b.tournament.priority - a.tournament.priority)
    .map((item) => {
      return {
        vod_id: item.id,
        vod_name: item.name,
        vod_pic: item.tournament.logo,
        vod_remarks: showDateText(item.timestamp),
      };
    });
  return JSON.stringify({
    list: list,
  });
}

async function category(
  tid: string,
  pg: string,
  filter: boolean,
  extend: Record<string, string>
): Promise<Stringified<CategoryData>> {
  let matches = [];
  if (tid === 'featured') {
    matches = JSON.parse(await getRequest<string>(url + '/api/match/featured')).data as any[];
  } else {
    matches = JSON.parse(await getRequest<string>(url + '/api/match/featured/mt')).data as any[];

    if (tid) {
      matches = matches.filter((m) => m.match_status === tid);
    }
  }

  if (extend.tag) {
    matches = matches.filter((m) => m.tournament.name === extend.tag);
  }

  const total = matches.length;
  let list = matches
    .sort((a, b) => b.tournament.priority - a.tournament.priority)
    .map((item) => {
      return {
        vod_id: item.id,
        vod_name: item.name,
        vod_pic: item.tournament.logo,
        vod_remarks: showDateText(item.timestamp),
      };
    });

  return JSON.stringify({
    page: 1,
    pagecount: 1,
    limit: total,
    total,
    list,
  });
}

async function detail(id: string): Promise<Stringified<VodData>> {
  const meta = JSON.parse(await getRequest<string>(url + `/api/match/${id}`)).data as any;
  const data = JSON.parse(await getRequest<string>(url + `/api/match/${id}/meta`)).data as any;

  const awayName = meta.away ? `${meta.scores.away} ${meta.away.name}` : '';
  const homeName = awayName ? `${meta.home.name} ${meta.scores.home}` : `${meta.home.name}`;

  const vod = {
    vod_id: id,
    vod_pic: meta.tournament.logo,
    vod_name: [homeName, awayName].filter(Boolean).join(' - '),
    vod_play_from: isEmpty(data.play_urls) ? '' : 'ThapCamTV',
    vod_play_url: isEmpty(data.play_urls)
      ? ''
      : data.play_urls.map((item) => `${item.name}$${item.url}`).join('#'),
    vod_remarks: meta.tournament.name,
    vod_actor: data.commentators ? data.commentators.map((c) => c.name).join(' vs ') : '',
    vod_content: meta.name,
  };

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag: string, id: string, vipFlags: string[]): Promise<Stringified<PlayData>> {
  return JSON.stringify({
    parse: 0,
    url: id,
  });
}

async function search(wd: string, quick?: boolean, pg?: string): Promise<Stringified<VodData>> {
  const data = JSON.parse(await getRequest<string>(url + `/api/match/featured/mt`)).data as any[];

  const matches = data.filter((m) => m.name.toLowerCase().includes(wd.toLowerCase()));

  const list = lodashMap(matches, (item) => {
    return {
      vod_id: item.id,
      vod_name: item.name,
      vod_pic: item.tournament.logo,
      vod_remarks: item.date,
    };
  });

  return JSON.stringify({
    list,
  });
}

export function __jsEvalReturn() {
  return {
    init,
    home,
    homeVod,
    category,
    detail,
    play,
    search,
  };
}
