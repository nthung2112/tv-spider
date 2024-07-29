// src/shared.ts
var UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
async function getRequest(reqUrl, agentSp) {
  const res = await req(reqUrl, {
    method: "get",
    headers: {
      "User-Agent": agentSp || UA
    }
  });
  return res.content;
}

// src/sites/danet.ts
var url = "https://danet.vn";
var siteKey = "";
var siteType = 0;
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;
}
async function homeVod() {
  const results = JSON.parse(
    await getRequest(`${url}/api/movie-playlists/133/movies?limit=20&page=1`)
  ).results;
  const list = results.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: `${item.title}`,
      vod_pic: item.poster,
      vod_remarks: item.quality
    };
  });
  return JSON.stringify({
    list
  });
}
async function home(filter) {
  const results = JSON.parse(
    await getRequest(`${url}/api/movie-playlists?limit=10&module_id=2&page=1`)
  ).results;
  const classes = _.map(results, (item) => ({
    type_id: item.id,
    type_name: item.name
  }));
  return JSON.stringify({
    class: classes,
    filters: {}
  });
}
async function category(tid, pg, filter, extend) {
  console.log(`Category page: tid=${tid}, pg=${pg}, filter=${filter}, extend=${extend}`);
}
async function detail(id) {
  console.log(`Detail page with id: ${id}`);
}
async function play(flag, id, vipFlags) {
  console.log(`Play page: flag=${flag}, id=${id}, flags=${vipFlags}`);
}
async function search(key, quick, pg) {
  console.log(`Search page: wd=${key}, quick=${quick}`);
}
function __jsEvalReturn() {
  return {
    init,
    home,
    homeVod,
    category,
    detail,
    play,
    search
  };
}
export {
  __jsEvalReturn
};
