import { getRequest, lodashMap } from '../shared';

let url = 'https://ophim1.com';
let siteKey = '';
let siteType = 0;

async function init(cfg: { skey: string; stype: number; ext?: string }): Promise<void> {
  siteKey = cfg.skey;
  siteKey = cfg.skey;
  siteType = cfg.stype;
}

async function home(filter: boolean): Promise<Stringified<HomeData>> {
  const dulieu = {
    'Phim Mới': '/danh-sach/phim-moi',
    'Phim Bộ': '/danh-sach/phim-bo',
    'Phim Lẻ': '/danh-sach/phim-le',
    'TV Shows': '/danh-sach/tv-shows',
    'Hoạt Hình': '/danh-sach/hoat-hinh',
    'Phim phụ đề': '/danh-sach/subteam',
    'Thể loại': 'the-loai',
    'Quốc gia': 'quoc-gia',
  };
  const theloai = {
    'Hành Động': '/the-loai/hanh-dong',
    'Tình Cảm': '/the-loai/tinh-cam',
    'Hài Hước': '/the-loai/hai-huoc',
    'Cổ Trang': '/the-loai/co-trang',
    'Tâm Lý': '/the-loai/tam-ly',
    'Hình Sự': '/the-loai/hinh-su',
    'Chiến Tranh': '/the-loai/chien-tranh',
    'Thể Thao': '/the-loai/the-thao',
    'Võ Thuật': '/the-loai/vo-thuat',
    'Viễn Tưởng': '/the-loai/vien-tuong',
    'Phiêu Lưu': '/the-loai/phieu-luu',
    'Khoa Học': '/the-loai/khoa-hoc',
    'Kinh Dị': '/the-loai/kinh-di',
    'Âm Nhạc': '/the-loai/am-nhac',
    'Thần Thoại': '/the-loai/than-thoai',
    'Tài Liệu': '/the-loai/tai-lieu',
    'Gia Đình': '/the-loai/gia-dinh',
    'Chính kịch': '/the-loai/chinh-kich',
    'Bí ẩn': '/the-loai/bi-an',
    'Học Đường': '/the-loai/hoc-duong',
    'Kinh Điển': '/the-loai/kinh-dien',
  };
  const quocgia = {
    'Trung Quốc': '/quoc-gia/trung-quoc',
    'Hàn Quốc': '/quoc-gia/han-quoc',
    'Nhật Bản': '/quoc-gia/nhat-ban',
    'Thái Lan': '/quoc-gia/thai-lan',
    'Âu Mỹ': '/quoc-gia/au-my',
    'Đài Loan': '/quoc-gia/dai-loan',
    'Hồng Kông': '/quoc-gia/hong-kong',
    'Ấn Độ': '/quoc-gia/an-do',
    Anh: '/quoc-gia/anh',
    Pháp: '/quoc-gia/phap',
    Canada: '/quoc-gia/canada',
    'Quốc Gia Khác': '/quoc-gia/quoc-gia-khac',
    Đức: '/quoc-gia/duc',
    'Tây Ban Nha': '/quoc-gia/tay-ban-nha',
    'Thổ Nhĩ Kỳ': '/quoc-gia/tho-nhi-ky',
    'Hà Lan': '/quoc-gia/ha-lan',
    Indonesia: '/quoc-gia/indonesia',
    Nga: '/quoc-gia/nga',
    Mexico: '/quoc-gia/mexico',
    'Ba lan': '/quoc-gia/ba-lan',
    Úc: '/quoc-gia/uc',
    'Thụy Điển': '/quoc-gia/thuy-dien',
    Malaysia: '/quoc-gia/malaysia',
    Brazil: '/quoc-gia/brazil',
    Philippines: '/quoc-gia/philippines',
    'Bồ Đào Nha': '/quoc-gia/bo-dao-nha',
    Ý: '/quoc-gia/y',
    'Đan Mạch': '/quoc-gia/dan-mach',
    UAE: '/quoc-gia/uae',
    'Na Uy': '/quoc-gia/na-uy',
    'Thụy Sĩ': '/quoc-gia/thuy-si',
    'Châu Phi': '/quoc-gia/chau-phi',
    'Nam Phi': '/quoc-gia/nam-phi',
    Ukraina: '/quoc-gia/ukraina',
    'Ả Rập Xê Út': '/quoc-gia/a-rap-xe-ut',
  };

  const classes = lodashMap(dulieu, (key, label) => ({
    id: key,
    name: label,
  }));

  const filterObj = {
    'the-loai': [
      {
        key: 'tag',
        init: '/the-loai/hanh-dong',
        name: 'Type',
        value: lodashMap(theloai, (key, label) => ({
          v: key,
          n: label,
        })),
      },
    ],
    'quoc-gia': [
      {
        key: 'tag',
        init: '/quoc-gia/au-my',
        name: 'Type',
        value: lodashMap(quocgia, (key, label) => ({
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

async function homeVod(): Promise<Stringified<VodData>> {
  const data = JSON.parse(await getRequest<string>(`${url}/danh-sach/phim-moi-cap-nhat`));

  const list = data.items.map((item: any) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: `${data.pathImage}${item.thumb_url}`,
      vod_remarks: item.year,
    };
  });

  return JSON.stringify({
    list,
  });
}

async function category(
  tid: string,
  page: string,
  filter: boolean,
  extend: Record<string, string>
): Promise<Stringified<CategoryData>> {
  if (!page) page = '1';
  const pg = parseInt(page);
  let link = url;

  if (extend.tag) {
    link = `${url}/v1/api${extend.tag}?page=${pg}`;
  } else if (tid) {
    link = `${url}/v1/api${tid}?page=${pg}`;
  }

  const data = JSON.parse(await getRequest<string>(link)).data;
  const list = data.items.map((item: any) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: `${data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.thumb_url}`,
      vod_remarks: item.episode_current,
    };
  });

  return JSON.stringify({
    page: data.params.pagination.currentPage,
    pagecount: Math.ceil(
      data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage
    ),
    limit: data.params.pagination.totalItemsPerPage,
    total: data.params.pagination.totalItemsPerPage,
    list,
  });
}

async function detail(id: string): Promise<Stringified<VodData>> {
  const data = JSON.parse(await getRequest<string>(`${url}/v1/api/phim/${id}`)).data;
  const vod = {
    vod_id: data.item.slug,
    vod_pic: data.seoOnPage.seoSchema.image,
    vod_remarks: data.item.episode_current,
    vod_name: `${data.item.name} (${data.item.origin_name})`,
    vod_area: data.item.country.map((c) => c.name).join(', '),
    vod_year: data.item.year,
    vod_director: data.item.director.join(', '),
    vod_actor: data.item.actor.join(', '),
    vod_content: data.item.content,
    vod_play_from: data.item.episodes.map((e) => e.server_name).join('$$$'),
    vod_play_url: data.item.episodes
      .map((e) => e.server_data.map((d) => `${d.name}$${d.link_m3u8}`).join('#'))
      .join('$$$'),
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

async function search(
  wd: string,
  quick?: boolean,
  pg?: string
): Promise<Stringified<CategoryData>> {
  const data = JSON.parse(
    await getRequest<string>(`${url}/v1/api/tim-kiem?keyword=${wd.replace(' ', '+')}`)
  ).data;

  const list = data.items.map((item: any) => {
    return {
      vod_id: item.slug,
      vod_name: item.name,
      vod_pic: `${data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.thumb_url}`,
      vod_remarks: item.episode_current,
    };
  });

  return JSON.stringify({
    page: data.params.pagination.currentPage,
    pagecount: Math.ceil(
      data.params.pagination.totalItems / data.params.pagination.totalItemsPerPage
    ),
    limit: data.params.pagination.totalItemsPerPage,
    total: data.params.pagination.totalItemsPerPage,
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
