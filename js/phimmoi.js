import { load, _ } from './lib/cat.js';

let url = 'https://phimmoichillv.net';
let siteKey = '';
let siteType = 0;

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

async function request(reqUrl, agentSp) {
  let res = await req(reqUrl, {
    method: 'get',
    headers: {
      'User-Agent': agentSp || UA,
      referer: url,
      'x-requested-with': 'XMLHttpRequest',
    },
  });
  return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
  siteKey = cfg.skey;
  siteType = cfg.stype;

  // Update domain changed
  const html = await request(`${url}`);
  const regex = /<base\s+href="([^"]*)"\s*\/>/;
  const match = html.match(regex);
  if (match) {
    url = match[1].slice(0, -1);
  }
}

async function home(filter) {
  const dulieu = {
    'Phim thịnh hành': '/list/phim-hot',
    'Phim bộ': '/list/phim-bo',
    'Phim lẻ': '/list/phim-le',
    'Phim HD': '/list/phim-hd',
    'Chiếu rạp': '/genre/phim-chieu-rap',
    'TOP IMDB': '/list/top-imdb',
    Netflix: '/list/phim-netflix',
    'Thuyết minh': '/genre/phim-thuyet-minh',
    'Thể loại': '/the-loai',
    'Quốc gia': '/quoc-gia',
  };

  const theloai = {
    'Hành động': '/genre/phim-hanh-dong',
    'Võ thuật': '/genre/phim-vo-thuat',
    'Tình cảm': '/genre/phim-tinh-cam',
    'Tâm lý': '/genre/phim-tam-ly',
    Hài: '/genre/phim-hai-huoc',
    'Hoạt hình': '/genre/phim-hoat-hinh',
    Anime: '/genre/phim-anime',
    'Phiêu lưu': '/genre/phim-phieu-luu',
    'Kinh dị': '/genre/phim-ma-kinh-di',
    'Hình sự': '/genre/phim-hinh-su',
    'Chiến tranh': '/genre/phim-chien-tranh',
    'Thần thoại': '/genre/phim-than-thoai',
    'Viễn tưởng': '/genre/phim-vien-tuong',
    'Cổ trang': '/genre/phim-co-trang',
    'Âm nhạc': '/genre/phim-am-nhac',
    'Thể thao': '/genre/phim-the-thao',
    'Truyền hình': '/genre/phim-truyen-hinh',
    'TV Show': '/genre/game-show',
    'Khoa học': '/genre/phim-khoa-hoc',
  };

  const quocgia = {
    'Âu Mỹ': '/country/phim-au-my',
    'Hàn Quốc': '/country/phim-han-quoc',
    'Trung Quốc': '/country/phim-trung-quoc',
    'Hồng Kông': '/country/phim-hong-kong',
    'Đài Loan': '/country/phim-dai-loan',
    'Nhật Bản': '/country/phim-nhat-ban',
    'Ấn Độ': '/country/phim-an-do',
    'Thái Lan': '/country/phim-thai-lan',
    'Nước Khác': '/country/phim-tong-hop',
  };

  const classes = _.map(dulieu, (key, label) => ({
    type_id: key,
    type_name: label,
  }));

  let filterObj = {
    '/the-loai': [
      {
        key: 'tag',
        init: '/genre/phim-hanh-dong',
        name: 'Type',
        value: _.map(theloai, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
    '/quoc-gia': [
      {
        key: 'tag',
        init: '/country/phim-au-my',
        name: 'Type',
        value: _.map(quocgia, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
  };

  return JSON.stringify({
    class: classes,
    filters: filterObj,
  });
}

async function homeVod() {
  const html = await request(`${url}/list/phim-hot`);
  const $ = load(html);
  const items = $('div#binlist ul li.item');
  const videos = _.map(items, (item) => {
    const img = $(item).find('img:first')[0];
    return {
      vod_id: $(item).find('a')[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs['data-cfsrc'] || img.attribs.src,
      vod_remarks: $(item).find('.label').text().trim(),
    };
  });
  return JSON.stringify({
    list: videos,
  });
}

async function category(tid, pg, filter, extend) {
  if (pg <= 0) pg = 1;
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}/${pg > 1 ? `page-${pg}` : ''}`;
  }

  const html = await request(link);
  const $ = load(html);
  const items = $('div#binlist ul li.item');
  let videos = _.map(items, (item) => {
    const img = $(item).find('img:first')[0];
    return {
      vod_id: $(item).find('a')[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs['data-cfsrc'] || img.attribs.src,
      vod_remarks: $(item).find('.label').text().trim(),
    };
  });
  const lastPage = $('.pagination > ul li').eq(-2).text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  return JSON.stringify({
    page: parseInt(pg),
    pagecount: pgCount,
    limit: videos.length,
    total: videos.length * pgCount,
    list: videos,
  });
}

async function detail(id) {
  const html = await request(id);
  const $ = load(html);
  const playDetailUrl = $('ul a.btn-see')[0].attribs['href'].replace('/info/', '/xem/');
  let vod = {
    vod_id: id,
    vod_pic: $('#detail-page > div.film-info > div.image > img')[0].attribs['src'],
    vod_remarks: $('ul.block-film > li:nth-child(1) > span').text().trim(),
    vod_name: $('.film-info h1').text().trim(),
    vod_area: '',
    vod_lang: '',
    vod_actor: '',
    vod_director: '',
    vod_content: $('.film-info #film-content').text(),
    vod_play_from: ['PMFAST', 'PMHLS', 'PMPRO', 'PMBK'].join('$$$'),
    vod_play_url: _.times(4, () => `Full$${playDetailUrl}`).join('$$$'),
  };

  const children = $('ul.block-film li').children();
  for (let i = 0; i < children.length; i++) {
    const element = children.eq(i);
    if (element.text().includes('Diễn viên:')) {
      vod.vod_actor = children.eq(i + 1).text();
    }

    if (element.text().includes('Đạo diễn:')) {
      vod.vod_director = children.eq(i + 1).text();
    }

    if (element.text().includes('Quốc gia:')) {
      vod.vod_area = children.eq(i + 1).text();
    }

    if (element.text().includes('Ngôn ngữ:')) {
      vod.vod_lang = element.text();
    }
  }

  const htmlXem = await request(playDetailUrl);
  const $X = load(htmlXem);
  const listItem = $X('#list_episodes li a');
  if (listItem.length > 0) {
    const allItem = _.map(listItem, (item) => `${$X(item).text().trim()}$${item.attribs.href}`);
    const allUrl = allItem.join('#');

    vod.vod_play_url = [allUrl, allUrl, allUrl, allUrl].join('$$$');
  }

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag, id, flags) {
  let playUrl = '';
  if (id) {
    const matches = id.match(/pm(\d+)/);
    let res = await req(`${url}/chillsplayer.php`, {
      method: 'post',
      headers: {
        'User-Agent': UA,
        referer: url,
        'x-requested-with': 'XMLHttpRequest',
      },
      data: { qcao: matches[1] },
      postType: 'form',
    });

    if (res.content.includes('iniPlayers')) {
      const key = res.content.match(/iniPlayers\("([^"]+)"/)[1];
      const mapping = {
        PMFAST: `https://dash.motchills.net/raw/${key}/index.m3u8`,
        PMHLS: `https://sotrim.topphimmoi.org/raw/${key}/index.m3u8`,
        PMPRO: `https://dash.megacdn.xyz/raw/${key}/index.m3u8`,
        PMBK: `https://dash.megacdn.xyz/dast/${key}/index.m3u8`,
      };

      playUrl = mapping[flag];
    }
  }

  return JSON.stringify({
    parse: 0,
    url: playUrl,
  });
}

async function search(wd, quick) {
  const html = await request(url + '/tim-kiem/' + wd.replace(' ', '+'));
  const $ = load(html);
  const items = $('div#binlist ul li.item');
  let videos = _.map(items, (item) => {
    const img = $(item).find('img:first')[0];
    return {
      vod_id: $(item).find('a')[0].attribs.href,
      vod_name: img.attribs.alt,
      vod_pic: img.attribs['data-cfsrc'] || img.attribs.src,
      vod_remarks: $(item).find('.label').text().trim(),
    };
  });
  return JSON.stringify({
    list: videos,
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
