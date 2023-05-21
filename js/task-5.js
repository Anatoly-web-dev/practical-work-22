document.addEventListener('DOMContentLoaded', chatStart);

function chatStart() {
	const chatOutput = document.querySelector('.chat__output');
	const apiUri = 'wss://echo-ws-service.herokuapp.com/';
	const inputField = document.querySelector('.control-panel__input');
	const chatHint = document.querySelector('.chat__hint');
	const sendBtn = document.querySelector('.btn_send');
	const geoBtn = document.querySelector('.btn_geolocation');

	sendBtn.addEventListener('click', sendMessage);
	geoBtn.addEventListener('click', sendGeolocation);

	let websocket = new WebSocket(apiUri); // создаем новое соединение с сервером

	websocket.addEventListener('open', () => { //  соединение открыто
		showConnectStatus('установлено', 'green'); // показываем статус
		if (chatHint) chatHint.remove(); // удаляем подсказку с экрана
	});

	websocket.addEventListener('message', (event) => { // сообщение получено
		showContent(event.data);
		// выводит полученные с сервера данные на экран
		function showContent(message) {
			let html, type;
			if (event.data.includes('www' || 'http')) {
				type === 'link'; // выводим на экран ссылку на местоположение
				html = `<p class="chat__sent-message completed"> <a href="${message}"
					target="_blank">Посмотреть местоположение</a></p>`;
			} else if (event.data.includes('Ошибка!')) {
				type === 'error'; // выводим сообщение об ошибке получения геоданных 
				html = `<p class="chat__sent-message error">${message}</p>`
			} else { // выводим на экран введенное в инпут сообщение
				type === 'double';
				html = `<p class="chat__sent-message">${message}</p>
					<p class="chat__get-message">${message}</p>`;
			}
			// выводим соответствующее сообщение на экран
			chatOutput.insertAdjacentHTML('beforeend', html);
		}
	});

	// отправляет введенное сообщение серверу 
	function sendMessage() {
		if (inputField.value !== '') { // если инпут не пустой
			websocket.send(inputField.value); // отправляем сообщение
			showConnectStatus('сообщение получено', 'green'); // показываем статус
			inputField.value = ''; // очищаем инпут
		}
	}

	// запрашивает геоданные, отправляет серверу
	function sendGeolocation() {
		if ('geolocation' in navigator) { // если браузер поддерживает определение геолокации
			const options = { enableHighAccuracy: true }; // для более точного поиска
			navigator.geolocation.getCurrentPosition(completed, error, options);

			function completed(data) { // если пользователь дал согласие
				const lat = data.coords.latitude;
				const long = data.coords.longitude;
				const url = new URL('https://www.openstreetmap.org'); // конструируем url
				url.searchParams.set('mlat', lat);
				url.searchParams.set('mlon', long);
				websocket.send(url); // отправляем сообщение на сервер
				showConnectStatus('сообщение получено', 'green'); // показываем статус
			}

			function error(data) { // если пользователь отказался
				const errorText = `Ошибка! Не удалось получить координаты:( <br>  
							Причина: ${data.message}`;
				websocket.send(errorText); // отправляем на сервер сообщение
				showConnectStatus('сообщение получено', 'green'); // показываем статус
			}

		} else { // передаем сообщение об ошибке 
			const errorText = 'Ошибка! Браузер не поддерживает геолокацию :(';
			websocket.send(errorText); // отправляем сообщение на сервер
			showConnectStatus('сообщение получено', 'green'); // показываем статус
		}
	}

	// показывает текущий статус соединения 
	function showConnectStatus(text, color) {
		const statusOutput = document.querySelector('.chat__status-output');
		const html = `<p>Состояние соединения: <span class="color-${color}"> ${text}</span></p>`;
		statusOutput.innerHTML = html;
	}

	websocket.addEventListener('close', () => { // соединение закрыто
		showConnectStatus('закрыто', 'red'); // показываем статус
		chatOutput.innerHTML = ''; // очищаем экран с собщениями
		const hintHtml = chatHint.outerHTML; // выводим подсказку вновь
		chatOutput.innerHTML = hintHtml;
	});

	websocket.addEventListener('error', () => { // ошибки соединения
		showConnectStatus('ошибка! не установлено', 'red'); // показываем статус
	});
}