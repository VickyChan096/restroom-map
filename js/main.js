let _map;
let _markers;

//製作icon
let blueIcon = new L.Icon({
  //製作藍色icon
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
let redIcon = new L.Icon({
  //製作紅色icon
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
let goldIcon = new L.Icon({
  //製作金色icon
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

init();

//預設執行
function init() {
  map();
  time();
  getData();
  // canBuy();
}

//側邊收合按鈕
const sideBtn = document.getElementById('sideBtn');
function closeInfo() {
  const container = document.querySelector('.container');
  container.classList.toggle('containerHide');
  sideBtn.classList.toggle('sideBtnHide');
}
sideBtn.addEventListener('click', closeInfo);

function map() {
  //map函式('設定在#map',{先定位在center這個座標,zoom定位在16})
  _map = L.map('map', {
    //L是Leaflet框架的名字，有可能會與其他框架衝突
    center: [24.915052, 121.186335],
    zoom: 16,
    //zoom按鈕置右
    zoomControl: false,
  });

  //OSM的圖磚資料.addTo加入到(map裡面去)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      //右下角資訊
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(_map);

  //zoom按鈕置右
  L.control
    .zoom({
      position: 'topright',
    })
    .addTo(_map);

  //新增一個marker圖層，用來放群組
  _markers = new L.MarkerClusterGroup().addTo(_map);
}

//時間
function time() {
  let date = new Date();
  //現在日期
  let thisDate = document.getElementById('thisDate');
  thisDate.textContent =
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  //現在時間
  document.getElementById('thisTime').textContent = moment().format('LTS');
  //每秒呼叫一次功能
  setTimeout('time()', 1000);
}

let allData = []; //用來裝全部資料
//取得全部資料
function getData() {
  let allPromise = [];
  //因此open data單次呈現最多一千筆，下一千筆需改網址參數
  //桃園市列管公廁共3554筆資料
  for (let i = 0; i < 4; i++) {
    let offset = i * 1000;
    allPromise.push(xhrData(offset));
  }

  //Promise.all 可以等待全部Promise回來之後才動作
  //Promise.race 任何陣列傳入參數的Promise，就會到下一步去(但只有該筆資料)
  Promise.race(allPromise).then((result) => {
    //result 是一個array是每一次的資料
    result.forEach((item) => {
      allData = allData.concat(item);
    });
    renderMap(allData);
  });
}

//用promise , 資料取得後resolve回傳
function xhrData(offset) {
  const promise = new Promise((resolve, reject) => {
    let url =
      'https://data.epa.gov.tw/api/v2/fac_p_16?api_key=e8dd42e6-9b8b-43f8-991e-b3dee723a52d&limit=1000&sort=ImportDate%20desc&offset=' +
      offset +
      '&format=json';

    let xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.send(null);
    xhr.onload = function () {
      if (xhr.status == 200) {
        let data = JSON.parse(xhr.responseText).records;
        resolve(data);
      } else {
        reject();
      }
    };
  });
  return promise;
}

function renderMap(data) {
  let list = document.querySelector('.main__card');
  let str = '';
  for (i = 0; i < data.length; i++) {
    let content = `
        <li class="card">
          <div class="card__name">
            <img src="images/location.png">
            <h3>${data[i].name}</h3>
          </div>
          <div class="card__content">
            <div class="card__content__arrow"></div>
            <p class="card__content__add">${data[i].address}</p>
            <div class="card__content__btn">
              <a class="btn">查看位置</a>
              <a class="btn">複製地址</a>
            </div>
          </div>
          <div class="card__info">
            <h5>${data[i].type2}</h5>
            <p>${data[i].type}</p>
          </div>
        </li>
      `;
    str += content;
  }
  list.innerHTML = str;

  //地圖設點
  for (let i = 0; data.length > i; i++) {
    let iconColor;
      if (data[i].type2 === '男廁所') {
        iconColor = blueIcon;
      } else if (data[i].type2 === '女廁所') {
        iconColor = redIcon;
      } else {
        iconColor = goldIcon;
      }
    _markers.addLayer(
      L.marker([data[i].latitude, data[i].longitude], {
        icon: iconColor,
      }).bindPopup(
        `
        <div class="popBox">
          <div class="popBox__title">
            <div class="popBox__title__type2 blue">${data[i].type2}</div>
            <div class="popBox__title__name">${data[i].name}</div>
          </div>
          <div class="popBox__add">${data[i].address}</div>
          <div class="popBox__btn">複製地址</div>
        </div>
        `
      )
    );
  }
  _map.addLayer(_markers);
}

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

// //單一marker，設定它的座標
// L.marker([25.00144398527068, 121.51330907919525], { icon: greenIcon })
//   //將這個座標放到對應的地圖裡
//   .addTo(map)
//   //針對這個marker加上html進去
//   .bindPopup('<h1>四號公園</h1>')
//   //預設開啟
//   .openPopup();
