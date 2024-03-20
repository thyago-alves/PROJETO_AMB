var transformRequest = (url, resourceType) => {
  var isMapboxRequest =
    url.slice(8, 22) === "api.mapbox.com" ||
    url.slice(10, 26) === "tiles.mapbox.com";
  return {
    url: isMapboxRequest
      ? url.replace("?", "?pluginName=sheetMapper&")
      : url
  };
};
//Localização em tempo real
mapboxgl.accessToken = 'pk.eyJ1IjoiZmFicmljaW91ZnBpIiwiYSI6ImNsYjJodmQ1NTA0ajQ0MG9qaXMwZHp2bXAifQ.5knMPS6FF-K7P5Qhct2WiQ';
const coordinates = document.getElementById('coordinates');
navigator.geolocation.getCurrentPosition( function(position) {

    var lng = position.coords.longitude;
    var lat = position.coords.latitude;

mapboxgl.accessToken = mapboxgl.accessToken;

    sessionStorage.setItem("lng", lng);
    sessionStorage.setItem("lat", lat);

const map = new mapboxgl.Map({

    style:'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat], //longitude, latitude

    zoom: 15.5,
    transformRequest: transformRequest,
    container:'map',
    antialias:false,
    attributionControl:false,



});
//Criando pontos no mapa com caixa de descrição
$(document).ready(function () {
  $.ajax({
    type: "GET",
    //YOUR TURN: Replace with csv export link
    url: 'https://docs.google.com/spreadsheets/d/1EVUEXzNCTt_j-HggblN_Lk5s0XtUUwYZOcqjNoacL3A/gviz/tq?tqx=out:csv&sheet=Sheet1',
    dataType: "text",
    success: function (csvData) { makeGeoJSON(csvData); }
});

function makeGeoJSON(csvData) {
csv2geojson.csv2geojson(csvData, {
  latfield: 'Latitude',
  lonfield: 'Longitude',
  delimiter: ','
}, function (err, data) {
  map.on('load', function () {

    //Add the the layer to the map
    map.addLayer({
      'id': 'csvData',
      'type': 'circle',
      'source': {
        'type': 'geojson',
        'data': data
      },
      'paint': {
        'circle-radius': 5,
        'circle-color': "purple"
      }
    });


    // When a click event occurs on a feature in the csvData layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'csvData', function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice();

      //set popup text
      //You can adjust the values of the popup to match the headers of your CSV.
      // For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV.
      var description = `<h3>` + e.features[0].properties.Name + `</h3>` + `<h4>` + `<b>` + `Address: ` + `</b>` + e.features[0].properties.Address + `</h4>` + `<h4>` + `<b>` + `Phone: ` + `</b>` + e.features[0].properties.Phone + `</h4>`;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      //add Popup to map

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'csvData', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
      map.getCanvas().style.cursor = '';
    });

    var bbox = turf.bbox(data);
    map.fitBounds(bbox, { padding: 50 });

      });

    });
  };
});
//.................................

const marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat([lng, lat])
    .addTo(map);
 
function onDragEnd() {
const lngLat = marker.getLngLat();
    coordinates.style.display = 'block';
    coordinates.innerHTML = `Longitude: ${lngLat.lng}<br />Latitude: ${lngLat.lat}`;
    info.innerHTML = `${lngLat.lng}`;
    info2.innerHTML = `${lngLat.lat}`;
}
 
marker.on('dragend', onDragEnd);






//Pegar a data local do computador

var today = new Date();
var dy = today.getDate();
var mt = today.getMonth()+1;
var yr = today.getFullYear();
document.getElementById('id_01').value= dy+"/"+mt+"/"+yr;


//icone de caregando
const button =  document.querySelector('button[id=btn_rodar]');

const addloading = () => {
    
    button.innerHTML = '<img src="load-icon-png-27.png" class="loading">';
}

const removeloading = () => {
    button.innerHTML = 'Enviar';
}


//para inserir no banco de dados
const handleSubmit = (event) => {
    event.preventDefault();

    addloading();

    const Cadastrante = document.querySelector('input[name=Cadastrante]').value;

    const Data = document.querySelector('input[name=Data]').value;

    const Tamanho_do_Buraco = document.querySelector('select[name=Tamanho_do_Buraco]').value;

    const Tipo_de_Cobertura = document.querySelector('select[name=Tipo_de_Cobertura]').value;

    const Imagem = document.querySelector('input[name=Imagem]').value;

    const Longitude = document.querySelector('span[name=Longitude]').value;

    const Latitude = document.querySelector('span[name=Latitude]').value;

    fetch('https://api.sheetmonkey.io/form/dfjpp2KHdcsG6xowNqs1Aw', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cadastrante, Data, Tamanho_do_Buraco, Tipo_de_Cobertura, Longitude: lng, Latitude: lat, Imagem}),
    }).then(() => removeloading()).then(() => alert('Dados Salvos'));
}

document.querySelector('form').addEventListener('submit', handleSubmit);


//Barra de pesquisa
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: {
    color: 'orange',
},
    language: 'pt-BR',
    mapboxgl: mapboxgl
});



map.addControl(geocoder);

map.addControl(new mapboxgl.NavigationControl(),'top-left'); // Ferramenta de zoom
map.addControl(new mapboxgl.FullscreenControl(), 'top-left'); // Ferramenta de expandir a tela
map.addControl( // Add geolocate control to the map.
new mapboxgl.GeolocateControl({
positionOptions: {
    enableHighAccuracy: true
},
trackUserLocation: true, // When active the map will receive updates to the device's location as it changes.
showUserHeading: true // Draw an arrow next to the location dot to indicate which direction the device is heading.
}), 'top-left'

    );
});
