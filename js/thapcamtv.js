import { _ } from './lib/cat.js';
import { showDateText } from './lib/similarity.js';

let url = 'https://api.thapcam.xyz';
let siteKey = '';
let siteType = 0;

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

async function request(reqUrl, agentSp) {
  let res = await req(reqUrl, {
    method: 'get',
    headers: {
      'User-Agent': agentSp || UA,
    },
  });
  return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}

async function home(filter) {
  const data = JSON.parse(await request(url + '/api/match/featured/mt')).data;
  const featured = JSON.parse(await request(url + '/api/match/featured')).data;
  const filterObj = {};
  const groupByStatus = _.groupBy(data, (item) =>
    featured.some((f) => f.id === item.id) ? 'featured' : item.match_status
  );
  const mappingType = {
    featured: 'Nổi bật',
    live: 'Đang diễn ra',
    pending: 'Sắp diễn ra',
  };
  const orders = {
    featured: 0,
    live: 1,
    pending: 2,
  };

  let classes = Object.entries(groupByStatus)
    .map(([typeId, matches]) => {
      const tours = _.groupBy(
        matches.sort((a, b) => b.tournament.priority - a.tournament.priority),
        'tournament.name'
      );
      let tag = {
        key: 'tag',
        name: 'Type',
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
        type_id: typeId,
        type_name: mappingType[typeId] || 'Không xác định',
      };
    })
    .sort((a, b) => orders[a.type_id] - orders[b.type_id]);

  return JSON.stringify({
    class: classes,
    filters: filterObj,
  });
}

async function homeVod() {
  const matches = JSON.parse(await request(url + '/api/match/featured')).data;

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

async function category(tid, pg, filter, extend) {
  let matches = [];
  if (tid === 'featured') {
    matches = JSON.parse(await request(url + '/api/match/featured')).data;
  } else {
    matches = JSON.parse(await request(url + '/api/match/featured/mt')).data;

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
    total: total,
    list: list,
  });
}

async function detail(id) {
  const meta = JSON.parse(await request(url + `/api/match/${id}`)).data;
  const data = JSON.parse(await request(url + `/api/match/${id}/meta`)).data;

  const awayName = meta.away ? `${meta.scores.away} ${meta.away.name}` : '';
  const homeName = awayName ? `${meta.home.name} ${meta.scores.home}` : `${meta.home.name}`;

  const vod = {
    vod_id: id,
    vod_pic: meta.tournament.logo,
    vod_name: [homeName, awayName].filter(Boolean).join(' - '),
    vod_play_from: !_.isEmpty(data.play_urls) ? 'ThapCamTV' : '',
    vod_play_url: !_.isEmpty(data.play_urls)
      ? data.play_urls.map((item) => `${item.name}$${item.url}`).join('#')
      : '',
    vod_remarks: meta.tournament.name,
    vod_actor: data.commentators ? data.commentators.map((c) => c.name).join(' vs ') : '',
    vod_content: meta.name,
  };

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag, id, flags) {
  return JSON.stringify({
    parse: 0,
    url: id,
  });
}

async function search(wd, quick) {
  const data = JSON.parse(await request(url + `/api/match/featured/mt`)).data;

  const matches = data.filter((m) => m.name.toLowerCase().includes(wd.toLowerCase()));

  let list = _.map(matches, (item) => {
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
    init: init,
    home: home,
    homeVod: homeVod,
    category: category,
    detail: detail,
    play: play,
    search: search,
  };
}
