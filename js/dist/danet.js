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
  const classes = results.map((item) => ({
    id: item.id,
    name: item.name
  }));
  return JSON.stringify({
    class: classes,
    filters: {}
  });
}
async function category(tid, page, filter, extend) {
  let matches = [];
  if (tid) {
    matches = JSON.parse(
      await getRequest(`${url}/api/movie-playlists/${tid}/movies?limit=20&page=1`)
    ).results;
  }
  const total = matches.length;
  const list = matches.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: item.title,
      vod_pic: item.poster,
      vod_remarks: item.quality
    };
  });
  return JSON.stringify({
    page: 1,
    pagecount: 1,
    limit: total,
    total,
    list
  });
}
async function detail(id) {
  const data = JSON.parse(await getRequest(`${url}/api/movies/${id}`));
  const episodes = JSON.parse(
    await getRequest(`${url}/api/movies/${id}/episodes?limit=50&page=1`)
  ).results;
  const vod = {
    vod_id: data.uid,
    vod_pic: data.poster,
    vod_name: data.title,
    vod_play_from: "Danet",
    vod_play_url: "",
    vod_director: data.movie_directors.map((d) => d.name).join(","),
    vod_area: data.movie_country ? data.movie_country.name : "",
    vod_actor: "",
    vod_year: data.release_year,
    vod_content: data.summary
  };
  vod.vod_play_url = episodes.map((d) => `${d.title}$${data.uid}-${d.uid}`).join("#");
  return JSON.stringify({
    list: [vod]
  });
}
async function play(flag, id, vipFlags) {
  const [movieId, episodeId] = id.split("-");
  const streams = JSON.parse(
    await getRequest(`${url}/api/movies/${movieId}/episodes/${episodeId}/locations`)
  ).streams;
  const link = streams?.[0]?.file_location;
  return JSON.stringify({
    parse: 0,
    url: link
  });
}
async function search(key, quick, pg) {
  const results = JSON.parse(
    await getRequest(`${url}/api/movies?limit=20&page=1&q=${key}`)
  ).results;
  const list = results.map((item) => {
    return {
      vod_id: item.uid,
      vod_name: item.title,
      vod_pic: item.poster,
      vod_remarks: item.quality
    };
  });
  return JSON.stringify({
    list
  });
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
