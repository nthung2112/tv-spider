var b="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";async function l(t,n){return(await req(t,{method:"get",headers:{"User-Agent":b,...n}})).content}function S(t){if(Array.isArray(t))return!0;if(typeof t!="object"||!Object.prototype.hasOwnProperty.call(t,"length")||typeof t.length!="number"||t.length<0)return!1;for(let n=0;n<t.length;n++)if(!(n in t))return!1;return!0}function v(t,n){let a=[];for(let e=0;e<t.length;e++)a.push(n(t[e],e));return a}function y(t,n){return S(t)?v(t,n):Object.keys(t).map(a=>n(t[a],a))}function m(t){return t==null||typeof t=="object"&&Object.keys(t).length===0||typeof t=="string"&&t.trim().length===0}function h(t,n){return t.reduce((a,e)=>{let s=typeof n=="string"?x(e,n):n(e),u=a[s]||[];return u.push(e),{...a,[s]:u}},{})}function x(t,n,a){let e=n.split(/[.[\]]/).filter(Boolean).reduce((s,u)=>s?.[u],t);return e!==void 0?e:a}function d(t){return new Date(t).toLocaleString("vi-VN",{hour:"numeric",minute:"numeric",day:"2-digit",month:"2-digit"})}var g="https://q.thapcamn.xyz",M="",w=0;async function O(t){M=t.skey,w=t.stype}async function L(t){let n=JSON.parse(await l(`${g}/api/match/featured/mt`)).data,a=JSON.parse(await l(`${g}/api/match/featured`)).data,e={},s=h(n,c=>a.some(i=>i.id===c.id)?"featured":c.match_status),u={featured:"N\u1ED5i b\u1EADt",live:"\u0110ang di\u1EC5n ra",pending:"S\u1EAFp di\u1EC5n ra"},o={featured:0,live:1,pending:2},r=Object.entries(s).map(([c,i])=>{let T=h(i.sort((f,_)=>_.tournament.priority-f.tournament.priority),"tournament.name"),p={key:"tag",name:"Type",init:"",value:Object.entries(T).map(([f])=>({n:f,v:f}))};return p.value.length>0&&(p.init=p.value[0].v,e[c]=[p]),{id:c,name:u[c]||"Kh\xF4ng x\xE1c \u0111\u1ECBnh"}}).sort((c,i)=>o[c.id]-o[i.id]);return JSON.stringify({class:[{id:"xemlai",name:"Xem l\u1EA1i"}].concat(r),filters:e})}async function $(){let n=JSON.parse(await l(g+"/api/match/featured")).data.sort((a,e)=>e.tournament.priority-a.tournament.priority).map(a=>({vod_id:a.id,vod_name:a.name,vod_pic:a.tournament.logo,vod_remarks:d(a.timestamp)}));return JSON.stringify({list:n})}async function R(t,n,a,e){let s=[];if(t==="xemlai"){let r=JSON.parse(await l(`${g}/api/news/thapcam/list/xemlai/${n}`)).data,c=r.list.map(i=>({vod_id:`${i.id}_${t}`,vod_name:i.name,vod_pic:i.feature_image,vod_remarks:d(i.updated_at)}));return JSON.stringify({page:r.page,pagecount:Math.round(r.total/r.limit),limit:r.limit,total:r.total,list:c})}t==="featured"?s=JSON.parse(await l(g+"/api/match/featured")).data:(s=JSON.parse(await l(g+"/api/match/featured/mt")).data,t&&(s=s.filter(r=>r.match_status===t))),e.tag&&(s=s.filter(r=>r.tournament.name===e.tag));let u=s.length,o=s.sort((r,c)=>c.tournament.priority-r.tournament.priority).map(r=>({vod_id:`${r.id}_${t}`,vod_name:r.name,vod_pic:r.tournament.logo,vod_remarks:d(r.timestamp)}));return JSON.stringify({page:1,pagecount:1,limit:u,total:u,list:o})}async function P(t){let[n,a]=t.split("_");if(a==="xemlai"){let i=JSON.parse(await l(`${g}/api/news/thapcam/detail/${n}`)).data;return JSON.stringify({list:[{vod_id:n,vod_pic:i.feature_image,vod_name:i.name,vod_play_from:"ThapCamTV",vod_play_url:`Full$${i.video_url}`,vod_remarks:d(i.updated_at),vod_content:i.content}]})}let e=JSON.parse(await l(`${g}/api/match/${n}`)).data,s=e.away?`${e.scores.away} ${e.away.name}`:"",u=s?`${e.home.name} ${e.scores.home}`:`${e.home.name}`,o=e.fansites?.[0]?.stream_links||[],r=e.fansites?.[0]?.blv||[],c={vod_id:n,vod_pic:e.tournament.logo,vod_name:[u,s].filter(Boolean).join(" - "),vod_play_from:m(o)?"":"ThapCamTV",vod_play_url:m(o)?"":o.map(i=>`${i.name}$${i.url}`).join("#"),vod_remarks:e.tournament.name,vod_actor:r.map(i=>i.name).join(" vs "),vod_content:e.name};return JSON.stringify({list:[c]})}async function C(t,n,a){return JSON.stringify({parse:0,url:n})}async function N(t,n,a){let s=JSON.parse(await l(g+"/api/match/featured/mt")).data.filter(o=>o.name.toLowerCase().includes(t.toLowerCase())),u=y(s,o=>({vod_id:o.id,vod_name:o.name,vod_pic:o.tournament.logo,vod_remarks:o.date}));return JSON.stringify({list:u})}function B(){return{init:O,home:L,homeVod:$,category:R,detail:P,play:C,search:N}}export{B as __jsEvalReturn};
