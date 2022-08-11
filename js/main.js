let map = L.map('map', {
  //L是Leaflet框架的名字，有可能會與其他框架衝突
  //map函式('設定在#map',{先定位在center這個座標,zoom定位在16})
  center: [25.00144398527068, 121.51330907919525],
  zoom: 16,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //OSM的圖磚資料.addTo加入到(map裡面去)
  attribution:
    //右下角資訊
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// let greenIcon = new L.Icon({
//   //製作綠色icon
//   iconUrl:
//     'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//   shadowUrl:
//     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41],
// });

let markers = new L.MarkerClusterGroup().addTo(map); //新增一個marker圖層，專門用來放群組

let xhr = new XMLHttpRequest();
//開啟網路請求
xhr.open(
  'get',
  'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json',
  true
);
xhr.send(null);
xhr.onload = function () {
  let data = JSON.parse(xhr.responseText).features;
  for (let i = 0; data.length > i; i++) {
    let iconColor;
    if (data[i].properties.mask_adult === 0) {
      iconColor = redIcon;
    } else {
      iconColor = greenIcon;
    }
    markers.addLayer(
      L.marker(
        [data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]],
        { icon: iconColor }
      ).bindPopup(
        '<h1>' +
          data[i].properties.name +
          '</h1>' +
          '<p>成人口罩數量' +
          data[i].properties.mask_adult +
          '</p>'
      )
    );
  }
  map.addLayer(markers);
};

// let date = new Date();
// let day = date.getDay();

// //星期轉成中文
// function changeChinese(day) {
//   let today = document.querySelector('.today span');
//   switch (day) {
//     case 1:
//       today.textContent = '一';
//       break;
//     case 2:
//       today.textContent = '二';
//       break;
//     case 3:
//       today.textContent = '三';
//       break;
//     case 4:
//       today.textContent = '四';
//       break;
//     case 5:
//       today.textContent = '五';
//       break;
//     case 6:
//       today.textContent = '六';
//       break;
//     case 7:
//       today.textContent = '日';
//       break;
//   }
// }

// //今日日期
// function thisDate() {
//   let thisDate = document.getElementById('thisDate');
//   thisDate.textContent =
//     date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
// }

// //現在時間
// function currentTime() {
//   document.getElementById('currentTime').textContent = moment().format('LTS');
//   setTimeout('currentTime()', 1000); //每秒呼叫一次功能
// }

// //選擇城市
// function selectCountry(e) {
//   markers.clearLayers();

//   let data = JSON.parse(xhr.responseText).features;
//   let select = e.target.value;
//   let pharmacy = document.querySelector('.pharmacy');
//   let town = document.getElementById('town');
//   let townOption = '';
//   let str = '';

//   for (let i = 0; i < data.length; i++) {
//     let content = `
//           <li class="card">
//             <h3 class="card__name">${data[i].properties.name}</h2>
//             <p class="card__add">${data[i].properties.address}</p>
//             <p class="card__tel">${data[i].properties.phone}</p>
//             <p class="card__open">${data[i].properties.note}</p>
//             <div class="card__maskNum">
//               <div class="card__maskNum__adult bgc-adult">
//                 <p>成人口罩</p>
//                 <p>${data[i].properties.mask_adult}</p>
//               </div>
//               <div class="card__maskNum__child bgc-child">
//                 <p>兒童口罩</p>
//                 <p>${data[i].properties.mask_child}</p>
//               </div>
//             </div>
//           </li>
//     `;
//     let townContent = `<option>${data[i].properties.town}</option>;`;
//     if (data[i].properties.county === select) {
//       let iconColor;
//       if (data[i].properties.mask_adult === 0) {
//         iconColor = redIcon;
//       } else {
//         iconColor = greenIcon;
//       }
//       markers.addLayer(
//         L.marker(
//           [data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]],
//           { icon: iconColor }
//         ).bindPopup(
//           '<h1>' +
//             data[i].properties.name +
//             '</h1>' +
//             '<p>成人口罩數量' +
//             data[i].properties.mask_adult +
//             '</p>'
//         )
//       );

//       townOption += townContent;
//       str += content;
//     }
//   }
//   map.addLayer(markers);
//   town.innerHTML = townOption;
//   pharmacy.innerHTML = str;

//   //刪除option重複選項
//   $(function () {
//     $('#town').focus(function () {
//       $('select option').each(function () {
//         text = $(this).text();
//         if ($('select option:contains(' + text + ')').length > 1)
//           $('select option:contains(' + text + '):gt(0)').remove();
//       });
//     });
//   });
// }
// country.addEventListener('change', selectCountry);

// function selectTown(e) {
//   let data = JSON.parse(xhr.responseText).features;
//   let select = e.target.value;
//   let pharmacy = document.querySelector('.pharmacy');
//   let str = '';
//   for (let i = 0; i < data.length; i++) {
//     let content = `
//           <li class="card">
//             <h3 class="card__name">${data[i].properties.name}</h2>
//             <p class="card__add">${data[i].properties.address}</p>
//             <p class="card__tel">${data[i].properties.phone}</p>
//             <p class="card__open">${data[i].properties.note}</p>
//             <div class="card__maskNum">
//               <div class="card__maskNum__adult bgc-adult">
//                 <p>成人口罩</p>
//                 <p>${data[i].properties.mask_adult}</p>
//               </div>
//               <div class="card__maskNum__child bgc-child">
//                 <p>兒童口罩</p>
//                 <p>${data[i].properties.mask_child}</p>
//               </div>
//             </div>
//           </li>
//     `;
//     if (select === data[i].properties.town) {
//       str += content;
//     }
//   }
//   pharmacy.innerHTML = str;
// }
// town.addEventListener('change', selectTown);

// //預設執行
// function init() {
//   changeChinese(day);
//   thisDate();
//   canBuy();
//   currentTime();
// }
// init();

// //單一marker，設定它的座標
// L.marker([25.00144398527068, 121.51330907919525], { icon: greenIcon })
//   //將這個座標放到對應的地圖裡
//   .addTo(map)
//   //針對這個marker加上html進去
//   .bindPopup('<h1>四號公園</h1>')
//   //預設開啟
//   .openPopup();
