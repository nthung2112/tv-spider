import "./src/wrapper/index.js";
import { getRequest } from "./src/shared";
import fs from "fs";

const url = "https://danet.vn";

function generateM3U8WithGroups(data) {
  let result = "";
  let previousGroup = null;

  data.forEach((channel, index) => {
    // Thêm dòng trắng nếu nhóm hiện tại khác nhóm trước đó và không phải là kênh đầu tiên
    if (previousGroup !== null && previousGroup !== channel.groupTitle) {
      result += "\n";
    }

    // Tạo nội dung cho kênh hiện tại
    const extinf = `#EXTINF:-1 group-title="Running man" tvg-logo="${channel.logo}",${channel.title}`;
    result += `${extinf}\n${channel.url}\n`;

    // Cập nhật nhóm trước đó
    previousGroup = channel.groupTitle;
  });

  return result.trim(); // Loại bỏ khoảng trắng cuối cùng
}

async function main() {
  const id = "1536893637";

  const result = [];
  const episodes = JSON.parse(
    await getRequest<string>(`${url}/api/movies/${id}/episodes?limit=50&page=1`)
  ).results;

  for (const episode of episodes) {
    const streams = JSON.parse(
      await getRequest<string>(`${url}/api/movies/${id}/episodes/${episode.uid}/locations`)
    ).streams;

    result.push({
      groupTitle: "Running man",
      title: episode.title,
      url: streams?.[0]?.file_location,
      logo: episode.screenshot,
      options: [],
    });
  }

  const m3u = generateM3U8WithGroups(result);

  fs.writeFileSync("./m3u/runningman.m3u", m3u);
}

main();
