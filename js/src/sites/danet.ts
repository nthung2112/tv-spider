import { getRequest } from '../shared';

const url = 'https://danet.vn';

let siteKey = '';
let siteType = 0;

async function init(cfg: { skey: string; stype: number }): Promise<void> {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}

async function homeVod(): Promise<Stringified<VodData>> {
  const results = JSON.parse(
    await getRequest<string>(`${url}/api/movie-playlists/133/movies?limit=20&page=1`)
  ).results;

  const list = results.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: `${item.title}`,
      vod_pic: item.poster,
      vod_remarks: item.quality,
    };
  });

  return JSON.stringify({
    list,
  });
}

async function home(filter: boolean): Promise<Stringified<HomeData>> {
  const results = JSON.parse(
    await getRequest<string>(`${url}/api/movie-playlists?limit=10&module_id=2&page=1`)
  ).results;

  const classes = results.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return JSON.stringify({
    class: classes,
    filters: {},
  });
}

async function category(
  tid: string,
  page: number,
  filter: boolean,
  extend: Record<string, string>
): Promise<Stringified<CategoryData>> {
  let matches = [];
  if (tid) {
    matches = JSON.parse(
      await getRequest<string>(`${url}/api/movie-playlists/${tid}/movies?limit=20&page=1`)
    ).results;
  }

  const total = matches.length;
  const list = matches.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: item.title,
      vod_pic: item.poster,
      vod_remarks: item.quality,
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
  const data = JSON.parse(await getRequest<string>(`${url}/api/movies/${id}`));
  const episodes = JSON.parse(
    await getRequest<string>(`${url}/api/movies/${id}/episodes?limit=50&page=1`)
  ).results;

  const vod = {
    vod_id: data.uid,
    vod_pic: data.poster,
    vod_name: data.title,
    vod_play_from: 'Danet',
    vod_play_url: '',
    vod_director: data.movie_directors.map((d) => d.name).join(','),
    vod_area: data.movie_country ? data.movie_country.name : '',
    vod_actor: '',
    vod_year: data.release_year,
    vod_content: data.summary,
  };

  vod.vod_play_url = episodes.map((d) => `${d.title}$${data.uid}-${d.uid}`).join('#');

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag: string, id: string, vipFlags: string[]): Promise<Stringified<PlayData>> {
  const [movieId, episodeId] = id.split('-');

  const streams = JSON.parse(
    await getRequest<string>(`${url}/api/movies/${movieId}/episodes/${episodeId}/locations`)
  ).streams;

  const link = streams?.[0]?.file_location;
  return JSON.stringify({
    parse: 0,
    url: link,
  });
}

async function search(key: string, quick: boolean, pg: string): Promise<Stringified<VodData>> {
  const results = JSON.parse(
    await getRequest<string>(`${url}/api/movies?limit=20&page=1&q=${key}`)
  ).results;

  const list = results.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: item.title,
      vod_pic: item.poster,
      vod_remarks: item.quality,
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
