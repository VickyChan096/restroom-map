let _map;
let _markers;
let _userPosition;
let _selectedCity = '選擇區域';
let _selectedType2 = '廁所類型';
let _selectCity = document.getElementById('selectCity');
let _selectType2 = document.getElementById('selectType2');
let _allData = []; //用來裝全部資料
const _sideBtn = document.getElementById('sideBtn');
initial();

// 預設執行
function initial() {
  map();
  time();
  getData();
  getUserPosition();
}

// 製作icon
function makeIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // leaflet-color-markers
  // 參考：https://github.com/pointhi/leaflet-color-markers
}
const blueIcon = makeIcon('blue');
const redIcon = makeIcon('red');
const goldIcon = makeIcon('gold');
const greenIcon = makeIcon('green');

// 取得使用者的位置資訊
// 檢查瀏覽器是否支援 Geolocation API
function getUserPosition() {
  if (navigator.geolocation) {
    // 定義成功的回呼函式
    // 將畫面中心移到user位置
    // 建立user位置的icon
    function showPosition(position) {
      _map.setView([position.coords.latitude, position.coords.longitude]);

      let userIcon = new L.Icon({
        iconUrl:
          'https://d1s6fstvea5cci.cloudfront.net/content/themes/vtnz/resources/assets/images/pulse_dot.gif',
        iconSize: [50, 50],
      });

      L.marker([position.coords.latitude, position.coords.longitude], {
        icon: userIcon,
      })
        .addTo(_map)
        .bindPopup('您目前位置')
        .openPopup();
    }

    // 定義失敗的回呼函式
    function showError() {
      alert('抱歉，現在無法取的您的地理位置。');
    }

    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert('抱歉，您的裝置不支援定位功能。');
  }

  // 透過 Geolocation 取得使用者的位置資訊
  // 參考：https://luffy.website/2020/02/15/mask-map-share/#%E9%80%8F%E9%81%8E-Geolocation-%E5%8F%96%E5%BE%97%E4%BD%BF%E7%94%A8%E8%80%85%E7%9A%84%E4%BD%8D%E7%BD%AE%E8%B3%87%E8%A8%8A
}

// 側邊收合
function closeInfo() {
  const container = document.getElementById('container');
  container.classList.toggle('containerHide');
  _sideBtn.classList.toggle('sideBtnHide');
}
_sideBtn.addEventListener('click', closeInfo);

// 建立初始化地圖
function map() {
  // L是Leaflet框架的名字，有可能會與其他框架衝突
  // Ｌ.map('設定在#map',{定位在center這個座標, zoom定位在18, 是否顯示預設的縮放按鈕})
  _map = L.map('map', {
    center: [24.992421, 121.301045],
    zoom: 18,
    zoomControl: false,
  });

  // L.titleLayer(OSM的免費圖磚資料,{地圖右下角資訊,最小Zoom尺寸}).addTo加入到(map裡面去)
  // 來源：https://www.openstreetmap.org/#map=7/23.611/120.768
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    minZoom: 8,
  }).addTo(_map);

  // zoom按鈕置右
  L.control
    .zoom({
      position: 'topright',
    })
    .addTo(_map);

  // 新增群組圖層
  _markers = new L.MarkerClusterGroup().addTo(_map);
}

// onclick，查看廁所位置
// panTo/flyTo 可移動到經緯度位置
function getToToilet(event) {
  let lat = event.target.dataset.lat;
  let lon = event.target.dataset.lon;

  _map.flyTo([lat, lon]);
}

// 現在日期＋時間，每秒呼叫一次
function time() {
  let date = new Date();
  let thisDate = document.getElementById('thisDate');

  thisDate.textContent =
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  document.getElementById('thisTime').textContent = moment().format('LTS');
  setTimeout('time()', 1000);

  // moment.js
  // 來源：https://momentjs.com/
}

// 取得全部資料
// 設定loading畫面
function getData() {
  let loading = document.getElementById('loading');
  let allPromise = [];

  // 此open data單次呈現最多一千筆，下一千筆需改網址參數
  // 桃園市列管公廁共3554筆資料
  // for (let i = 0; i < 4; i++) {
  for (let i = 0; i < 1; i++) {
    let offset = i * 1000;
    allPromise.push(xhrData(offset));
  }

  // Promise.all 等待全部資料回來之後進行then
  // result 是一個陣列，是每一次push進來的資料
  Promise.all(allPromise).then((result) => {
    result.forEach((item) => {
      _allData = _allData.concat(item);
    });

    // 渲染map
    // 產生區域選項
    // 關閉loading畫面
    renderMap(_allData);
    cityOption(_allData);
    loading.classList.remove('showLoading');
  });
}

// 用promise , 資料取得後resolve回傳
function xhrData(offset) {
  const promise = new Promise((resolve, reject) => {
    // 測試版api
    let url = 'https://vickychan096.github.io/restroom-map/js/open-data.json';

    // 政府版api
    // let url =
    //   'https://data.epa.gov.tw/api/v2/fac_p_16?api_key=e8dd42e6-9b8b-43f8-991e-b3dee723a52d&limit=1000&sort=ImportDate%20desc&offset=' +
    //   offset +
    //   '&format=json';

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

// 渲染map
function renderMap(data) {
  let list = document.querySelector('.main__card');
  let str = '';

  // container內容
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
              <a class="btn" data-type="${data[i].type2}" data-lat="${data[i].latitude}" data-lon="${data[i].longitude}" onclick="getToToilet(event)">地圖位置</a>
              <a class="btn" href="https://www.google.com.tw/maps/dir//${data[i].country}${data[i].address}" target="blank">前往廁所</a>
            </div>
          </div>
          <div class="card__info">
            <p>${data[i].type2}</p>
            <h5>${data[i].type}</h5>
          </div>
        </li>
      `;
    str += content;
  }
  list.innerHTML = str;

  // map的點
  // 每渲染一次，清除之前的點
  _markers.clearLayers();

  for (let i = 0; data.length > i; i++) {
    let iconColor;
    let popColor;

    if (data[i].type2 === '男廁所') {
      iconColor = blueIcon;
      popColor = 'blue';
    } else if (data[i].type2 === '女廁所') {
      iconColor = redIcon;
      popColor = 'red';
    } else {
      iconColor = goldIcon;
      popColor = 'gold';
    }

    _markers.addLayer(
      L.marker([data[i].latitude, data[i].longitude], {
        icon: iconColor,
      }).bindPopup(
        `
        <div class="popBox">
          <div class="popBox__title">
            <div class="popBox__title__type2 ${popColor}">${data[i].type2}</div>
            <div class="popBox__title__name">${data[i].name}</div>
          </div>
          <div class="popBox__add">${data[i].address}</div>
          <a class="popBox__btn" href="https://www.google.com.tw/maps/dir//${data[i].country}${data[i].address}" target="blank">前往廁所</a>
        </div>
        `
      )
    );
  }
  _map.addLayer(_markers);
}

// 產生區域選項
function cityOption(data) {
  let city = '<option value="選擇區域">選擇區域</option>';
  let cityList = data.map((item) => {
    return item.city;
  });

  let distinctCity = [...new Set(cityList)];

  for (let i = 0; i < distinctCity.length; i++) {
    let cityContent = `<option value="${distinctCity[i]}">${distinctCity[i]}</option>`;
    city += cityContent;
  }

  _selectCity.innerHTML = city;
}

// change選擇區域
_selectCity.addEventListener('change', function (e) {
  _selectedCity = e.target.value;
  filterData();
});

// change廁所類型
_selectType2.addEventListener('change', function (e) {
  _selectedType2 = e.target.value;
  filterData();
});

// 依條件重新渲染map
function filterData() {
  let result = _allData;

  if (_selectedCity !== '選擇區域') {
    result = result.filter((item) => {
      return item.city === _selectedCity;
    });
  }

  if (_selectedType2 !== '廁所類型') {
    result = result.filter((item) => {
      return item.type2 === _selectedType2;
    });
  }

  renderMap(result);
}