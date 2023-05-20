document.addEventListener('DOMContentLoaded', chatStart);

function chatStart() {
	// вешаем событие на весь документ, делегируем события
	document.addEventListener('click', (event) => {
		if (event.target.closest('.btn_send')) {
			showSendMessage(); // показываем сообщение
		}
		if (event.target.closest('.btn_geolocation')) {
			showGeolocation(); // показываем ссылку на местоположение
		}
	});
	// отправляет сообщение на сервер, выводит ответ на экран
	function showSendMessage() {
		const inputField = document.querySelector(
			'.control-panel__input'
		);
		if (inputField.value !== '') { // если инпут не пустой
			let message = inputField.value;
			startEvents(message, 'double'); // отправляем и выводим сообщение
			inputField.value = ''; // очищаем инпут
		}
	}
	// запрашивает геоданные и отправляет их на сервер, затем выводит на экран
	function showGeolocation() {
		if ('geolocation' in navigator) { // если браузер поддерживает определение геолокации
			const options = { enableHighAccuracy: true }; // для более точного поиска
			navigator.geolocation.getCurrentPosition( // запрашиваем геоданные
				completed, error, options
			);
		} else { // передаем сообщение об ошибке на сервер  и выводит его на экран
			const errorText = 'Браузер не поддерживает геолокацию :(';
			startEvents(errorText, 'error');
		}
		// если пользователь дал согласие на определение местоположения
		// отправляет данные на сервер и выводим на экран ссылку
		function completed(data) {
			const lat = (data.coords.latitude);
			const long = (data.coords.longitude);
			const url = new URL('https://www.openstreetmap.org'); // конструируем url
			url.searchParams.set('mlat', lat);
			url.searchParams.set('mlon', long);
			startEvents(url, 'link');
		}
		// передает на сервер сообщение об отказе пользователя предоставить
		// данные о местоположении и выводит его на экран
		function error(data) {
			const errorText = `Не удалось получить координаты
				 :( <br>  Причина: ${data.message}`;
			startEvents(errorText, 'error');
		}
	}
	// создаем новое соединение с сервером и выводит пользователю информацию
	function startEvents(sentMessage, type) {
		const chatOutput = document.querySelector('.chat__output'); // поле вывода
		const apiUri = 'wss://echo-ws-service.herokuapp.com/'; // адрес сервера
		let websocket = new WebSocket(apiUri); // создаем новое соединение с сервером
		const awaitMessage = `установка 
			<span class="points-animated">.</span>`;
		showConnectStatus(awaitMessage, 'white'); // показываем статус
		// если соединение установлено успешно
		websocket.addEventListener('open', () => {
			showConnectStatus('установлено', 'green'); // показываем статус
			websocket.send(sentMessage); // отправляем полученные от пользователя данные
			const chatHint = document.querySelector('.chat__hint');
			if (chatHint) chatHint.remove(); // удаляем подсказку с экрана
		});
		// если соединение закрыто сервером или клиентом 
		websocket.addEventListener('close', () => {
			showConnectStatus('закрыто', 'red'); // показываем статус
			websocket = null;
			chatOutput.innerHTML = ''; // очищаем экран с собщениями
		});
		// если сервер получил данные выводим ответ на экран
		websocket.addEventListener('message', (event) => {
			showConnectStatus('сообщение получено', 'green'); // показываем статус
			showContent(event.data, type); // выводим ответ на экран
		});
		// в случае ошибки соединения показываем статус 
		websocket.addEventListener('error', () => {
			showConnectStatus('ошибка! не установлено', 'red');
		});
		// выводит полученные с сервера данные на экран 
		function showContent(message, type) {
			let html;
			// выводим на экран введенное в инпут сообщение
			if (type == 'double') {
				html = `<p class="chat__sent-message">
					${message}</p> <p class="chat__get-message">
					${message}</p>`;
			}
			// выводим на экран ссылку на местоположение
			if (type == 'link') {
				html = `<p class="chat__sent-message completed">
					<a href="${message}" target="_blank">
					Посмотреть местоположение</a></p>`;
			}
			// выводим сообщение об ошибке получения геоданных
			if (type == 'error') {
				html = `<p class="chat__sent-message error">${message}</p>`
			}
			// выводим соответствующее сообщение на экран
			chatOutput.insertAdjacentHTML('beforeend', html);
		}
		// показывает текущий статус соединения 
		function showConnectStatus(text, color) {
			const statusOutput = document.querySelector(
				'.chat__status-output'
			);
			const html = `<p>Состояние соединения: 
				<span class="color-${color}"> ${text}</span></p>`;
			statusOutput.innerHTML = html;
		}
	}
}