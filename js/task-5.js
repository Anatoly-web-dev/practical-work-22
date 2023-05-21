document.addEventListener('DOMContentLoaded', chatStart); // запускается после полной загрузки HTML
function chatStart() {
	const sendBtn = document.querySelector('.btn_send');
	const geoBtn = document.querySelector('.btn_geolocation');
	sendBtn.addEventListener('click', sendMessage); // при отправке сообщения
	geoBtn.addEventListener('click', sendGeolocation); // при получении геоданных
	// создаем новое соединение с сервером и отслеживаем его события
	let websocket = new WebSocket('wss://echo-ws-service.herokuapp.com/');
	websocket.addEventListener('open', () => { // соединение открыто 
		showConnectStatus('установлено', 'green'); // показываем статус
	});
	websocket.addEventListener('message', (event) => { // сообщение получено
		showContent(event.data); // выводим его на экран
		// выводит полученные с сервера данные на экран
		function showContent(message) {
			const chatOutput = document.querySelector('.chat__output');
			let html;
			if (message.includes('www' || 'http')) {
				html = `<p class="chat__sent-message completed"> <a href="${message}"
				target="_blank">Посмотреть местоположение</a></p>`;
			} else if (message.includes('Ошибка' || 'error')) {
				html = `<p class="chat__sent-message error">${message}</p>`
			} else { // выводим на экран введенное в инпут сообщение
				html = `<p class="chat__sent-message">${message}</p>
				<p class="chat__get-message">${message}</p>`;
			}
			chatOutput.insertAdjacentHTML('beforeend', html); // выводим соответствующее сообщение на экран
		}
	});
	websocket.addEventListener('close', () => { // соединение закрыто
		showConnectStatus('закрыто', 'red'); // показываем статус
		websocket = null;
	});
	websocket.addEventListener('error', () => { // ошибка соединения 
		showConnectStatus('не установлено', 'red'); // показываем статус
	});
	// отправляет введенное сообщение на сервер 
	function sendMessage() {
		let inputField = document.querySelector('.control-panel__input');
		if (inputField.value !== '' && websocket) { // если инпут не пустой
			websocket.send(inputField.value); // отправляем сообщение
			showConnectStatus('сообщение получено', 'green'); // показываем статус
			inputField.value = ''; // очищаем инпут
		}
	}
	// запрашивает геоданные, отправляет серверу
	function sendGeolocation() {
		if ('geolocation' in navigator && websocket) { // если браузер поддерживает определение геолокации
			navigator.geolocation.getCurrentPosition(completed, error, { enableHighAccuracy: true });
			// если пользователь согласен предоставить координаты
			function completed(data) { // конструируем и отправляем ссылку на сервер
				const url = new URL('https://www.openstreetmap.org');
				url.searchParams.set('mlat', data.coords.latitude);
				url.searchParams.set('mlon', data.coords.longitude);
				websocket.send(url);
			}
			// если пользователь отказался отправляем на сервер сообщение
			function error(data) {
				websocket.send(`Ошибка! Координаты не получены :(<br>Причина: ${data.message}`);
			}
			showConnectStatus('сообщение получено', 'green'); // показываем статус 
		} else { // передаем сообщение об ошибке на сервер 
			if (websocket) {
				websocket.send('Ошибка! Браузер не поддерживает геолокацию :(');
				showConnectStatus('сообщение получено', 'green'); // показываем статус 
			}
		}
	}
	// показывает текущий статус соединения 
	function showConnectStatus(text, color) {
		const statusOutput = document.querySelector('.chat__status-output');
		const html = `<p>Состояние соединения: <span class="color-${color}"> ${text}</span></p>`;
		statusOutput.innerHTML = html;
	}
}