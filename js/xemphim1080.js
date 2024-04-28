import { load, _ } from './lib/cat.js';

let url = 'https://phim1080.in';
let siteKey = '';
let siteType = 0;

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

async function request(reqUrl, agentSp) {
  let res = await req(reqUrl, {
    method: 'get',
    headers: {
      'user-agent': agentSp || UA,
      referer: `${url}/loki`,
      'x-requested-with': 'XMLHttpRequest',
      Cookie: 'phimnhanh=%3D',
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
  const regex = /<meta\s+property="og:url"\s+content="([^"]*)"\s*\/>/;
  const match = html.match(regex);
  if (match) {
    url = match[1];
  }
}

async function home(filter) {
  const dulieu = {
    'Bảng xếp hạng': '/bang-xep-hang',
    'Phim đề cử': '/phim-de-cu',
    'Phim lẻ': '/phim-le',
    'Phim bộ': '/phim-bo',
    'Chiếu rạp': '/phim-chieu-rap',
    'Hôm nay xem gì': '/hom-nay-xem-gi',
    'Thể loại': 'the-loai',
    'Quốc gia': 'quoc-gia',
  };

  const theloai = {
    'Hành động': '/the-loai/hanh-dong',
    'Phiêu lưu': '/the-loai/phieu-luu',
    'Kinh dị': '/the-loai/kinh-di',
    'Tình cảm': '/the-loai/tinh-cam',
    'Hoạt hình': '/the-loai/hoat-hinh',
    'Võ thuật': '/the-loai/vo-thuat',
    'Hài hước': '/the-loai/hai-huoc',
    'Tâm lý': '/the-loai/tam-ly',
    'Viễn tưởng': '/the-loai/vien-tuong',
    'Thần thoại': '/the-loai/than-thoai',
    'Chiến tranh': '/the-loai/chien-tranh',
    'Cổ trang': '/the-loai/co-trang',
    'Âm nhạc': '/the-loai/am-nhac',
    'Hình sự': '/the-loai/hinh-su',
    'TV Show': '/the-loai/tv-show',
    'Khoa học': '/the-loai/khoa-hoc',
    'Tài liệu': '/the-loai/tai-lieu',
    Khác: '/the-loai/other',
    'Lịch sử': '/the-loai/lich-su',
    'Gia đình': '/the-loai/gia-dinh',
    'Thể thao': '/the-loai/the-thao',
    'Kiếm hiệp': '/the-loai/kiem-hiep',
    'Kịch tính': '/the-loai/kich-tinh',
    'Bí ẩn': '/the-loai/bi-an',
    'Tiểu sử': '/the-loai/tieu-su',
    'Thanh xuân': '/the-loai/thanh-xuan',
    'Học đường': '/the-loai/hoc-duong',
    'Huyền huyễn': '/the-loai/huyen-huyen',
    'Tiên hiệp': '/the-loai/tien-hiep',
    'Đam mỹ': '/the-loai/dam-my',
    'Trinh thám': '/the-loai/trinh-tham',
    'Gay căng': '/the-loai/gay-can',
    'Động vật': '/the-loai/dong-vat',
  };

  const quocgia = {
    'Trung Quốc': '/phim-trung-quoc',
    'Hàn Quốc': '/phim-han-quoc',
    'Đài Loan': '/phim-dai-loan',
    Mỹ: '/phim-my',
    'Châu Âu': '/phim-chau-au',
    'Nhật Bản': '/phim-nhat-ban',
    'Hồng Kông': '/phim-hong-kong',
    'Thái Lan': '/phim-thai-lan',
    'Châu Á': '/phim-chau-a',
    'Ấn Độ': '/phim-an-do',
    Pháp: '/phim-phap',
    Anh: '/phim-anh',
    Canada: '/phim-canada',
    Đức: '/phim-duc',
    'Tây Ban Nha': '/phim-tay-ban-nha',
    Nga: '/phim-nga',
    Úc: '/phim-uc',
    Khác: '/phim-khac',
  };

  const classes = _.map(dulieu, (key, label) => ({
    type_id: key,
    type_name: label,
  }));

  let filterObj = {
    'the-loai': [
      {
        key: 'tag',
        init: '/the-loai/hanh-dong',
        name: 'Type',
        value: _.map(theloai, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
    'quoc-gia': [
      {
        key: 'tag',
        init: '/phim-han-quoc',
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
  const html = await request(`${url}/hom-nay-xem-gi`);
  const $ = load(html);
  const items = $('.tray-content .tray-item');
  const videos = _.map(items, (item) => {
    if (!item.attribs.id) return;
    const img = $(item).find('img:first')[0];
    return {
      vod_id: item.attribs.id.replace('film-id-', '').replace('film-id-', ''),
      vod_name: $(item).find('.tray-item-title').text().trim(),
      vod_pic: img.attribs['data-src'],
      vod_remarks: $(item).find('.tray-film-likes').text().trim(),
    };
  }).filter(Boolean);

  return JSON.stringify({
    list: videos,
  });
}

async function category(tid, pg, filter, extend) {
  if (pg <= 0) pg = 1;
  let link = url;
  if (extend.tag || tid) {
    link = `${url}${extend.tag || tid}?page=${pg}`;
  }

  const html = await request(link);
  const $ = load(html);
  const items = $('.tray-left .tray-item');
  let videos = _.map(items, (item) => {
    if (!item.attribs.id) return;
    const img = $(item).find('img:first')[0];
    return {
      vod_id: item.attribs.id.replace('film-id-', '').replace('film-id-', ''),
      vod_name: $(item).find('.tray-item-title').text().trim(),
      vod_pic: img.attribs['data-src'],
      vod_remarks: $(item).find('.tray-film-likes').text().trim(),
    };
  }).filter(Boolean);

  const lastPage = $('.pagination li').eq(-2).text();
  const pgCount = lastPage ? parseInt(lastPage) : 1;
  return JSON.stringify({
    page: parseInt(pg),
    pagecount: pgCount,
    limit: 30,
    total: 30 * pgCount,
    list: videos,
  });
}

const decode_1080 = (e, t) => {
  let a = '';
  for (let i = 0; i < e.length; i++) {
    const r = e.charCodeAt(i);
    const o = r ^ t;
    a += String.fromCharCode(o);
  }
  return a;
};

async function detail(id) {
  const data = JSON.parse(await request(`${url}/api/v2/films/${id}`));
  let vod = {
    vod_id: id,
    vod_pic: data.poster,
    vod_remarks: data.time,
    vod_name: `${data.name} (${data.name_en || ''})`,
    vod_area: '',
    vod_lang: '',
    vod_actor: '',
    vod_year: data.year,
    vod_content: data.description,
    vod_play_from: 'Phim1080',
    vod_play_url: '',
  };

  const episodes = JSON.parse(await request(`${url}/api/v2/films/${id}/episodes?sort=name`));

  vod.vod_play_url = episodes.data.map((d) => `${d.full_name}$${id}/episodes/${d.id}`).join('#');

  return JSON.stringify({
    list: [vod],
  });
}

async function play(flag, urlId, flags) {
  const data = JSON.parse(await request(`${url}/api/v2/films/${urlId}`));
  const result = data.sources.m3u8.opt ? decode_1080(data.sources.m3u8.opt, 69).trim() : '';
  return JSON.stringify({
    parse: 0,
    url: result,
  });
}

async function search(wd, quick) {
  const videos = JSON.parse(await request(url + `/api/v2/search?q=${wd}&limit=20`)).data;

  const list = videos.map((item) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: item.thumbnail,
      vod_remarks: item.time,
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
