import { getRequest } from '../shared';

const url = 'https://danet.vn';

let siteKey = '';
let siteType = 0;

async function init(cfg: { skey: string; stype: number }): Promise<void> {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}

async function homeVod() {
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

async function home(filter: boolean) {
  const results = JSON.parse(
    await getRequest<string>(`${url}/api/movie-playlists?limit=10&module_id=2&page=1`)
  ).results;

  const classes = _.map(results, (item) => ({
    type_id: item.id,
    type_name: item.name,
  }));

  return JSON.stringify({
    class: classes,
    filters: {},
  });
}

async function category(tid: string, pg: string, filter: boolean, extend: Record<string, string>) {
  // Implement category page logic with tid, pg, filter, and extend parameters
  console.log(`Category page: tid=${tid}, pg=${pg}, filter=${filter}, extend=${extend}`);
}

async function detail(id: string) {
  // Implement detail page logic with id parameter
  console.log(`Detail page with id: ${id}`);
}

async function play(flag: string, id: string, vipFlags: string[]) {
  // Implement play page logic with flag, id, and flags parameters
  console.log(`Play page: flag=${flag}, id=${id}, flags=${vipFlags}`);
}

async function search(key: string, quick: boolean, pg: string) {
  // Implement search page logic with wd and quick parameters
  console.log(`Search page: wd=${key}, quick=${quick}`);
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
