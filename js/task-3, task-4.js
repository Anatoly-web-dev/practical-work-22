document.addEventListener('DOMContentLoaded', showUserInfo());

function showUserInfo() {
	// 				*** (Задание №3) ***
	const userInfoBtn = document.querySelector('.user-info__btn');
	const screenOutput = document.querySelector('.output');
	// ** получает размер экрана пользователя **
	function showScreenSize() {
		const title = 'Размеры экрана пользователя:';
		const message = `${screen.width} x ${screen.height}`;
		overwriteMessage(screenOutput, message, 'green', title);
	}
	// ** получает координаты местоположения **
	function showInformation() {
		showScreenSize();
		showAwaitingMessage(screenOutput); // выводит сообщение об ожидании
		if ('geolocation' in navigator) {
			const options = { enableHighAccuracy: true };
			navigator.geolocation.getCurrentPosition(getCoordinates, showErrorMessage, options);
		} else {
			showErrorMessage();
		}
		// выполняется, если НЕ удалось получить координаты
		function showErrorMessage(error) {
			const title = 'Информация о местоположении недоступна :(';
			const message = `Причина: ${error.message}`;
			overwriteMessage(screenOutput, message, 'red', title, 'output__row');
			deleteElement('.user-info__output');
		}
		// выполняется, выполняется, если удалось получить координаты
		function getCoordinates(data) {
			const title = 'Координаты местоположения пользователя:';
			const message = `Ш: ${data.coords.latitude}, 
				Д: ${data.coords.longitude}`;
			overwriteMessage(screenOutput, message, 'green', title);
			deleteElement('.user-info__output');
		}
	}
	// отображает в поле вывода размер экрана и координаты местоположения
	showContent(userInfoBtn, screenOutput, showInformation);

	// 				*** (Задание №4) ***
	const timezoneBtn = document.querySelector('.timezone__btn');
	const timezoneOutput = document.querySelector('.timezone__output');
	// ** получает информацию о временной зоне и местному времени **
	function showTimezoneInfo() {
		showAwaitingMessage(timezoneOutput); // выводит сообщение об ожидании
		if ('geolocation' in navigator) {
			const options = { enableHighAccuracy: true };
			navigator.geolocation.getCurrentPosition(getTimezoneInfo, showError, options);
		} else {
			showError();
		}
		// выполняется, если НЕ удалось получить координаты
		function showError(error) {
			const title = 'Информация о местоположении недоступна :(';
			const message = `Причина: ${error.message}`;
			overwriteMessage(timezoneOutput, message, 'red', title, 'output__row');
			deleteElement('.timezone__output');
		}
		// выполняется, если удалось получить координаты
		function getTimezoneInfo(data) {
			const latitude = data.coords.latitude; // получаем широту
			const longitude = data.coords.longitude; // получаем долготу
			sendRequest(latitude, longitude); // отправляем запрос
			deleteElement('.timezone__output'); // удаляем сообщение об ожидании
		}
		// отправляет запрос на timezoneAPI
		function sendRequest(lat, long) {
			const url = createUrl();
			fetch(url)
				.then(response => {
					if (!response.ok) return errorMessage(response);
					return response.json();
				}).then(data => {
					if (data && data.timezone && data['date_time_txt']) {
						const timezone = `${data.timezone}`;
						const date = `${data['date_time_txt']}`;
						overwriteMessage(
							timezoneOutput, timezone, 'green', 'Временная зона:'
						);
						overwriteMessage(
							timezoneOutput, date, 'green', 'Местные дата и время:'
						);
					}
				})
			// показывает сообщение при ошибки запроса
			function errorMessage(object) {
				const message = `Код ошибки: ${object.status}`;
				overwriteMessage(
					timezoneOutput, message, 'red', 'Ошибка запроса :('
				);
			}
			// конструирует url запроса
			function createUrl() {
				const url = new URL('https://api.ipgeolocation.io/timezone');
				url.searchParams.set('apiKey', '32bcd4a6e4b548968e7afcdb682ac679');
				url.searchParams.set('lat', lat);
				url.searchParams.set('long', long);
				return url;
			}
		}
	}
	// отображает в поле вывода временную зону и местные время и дату 
	showContent(timezoneBtn, timezoneOutput, showTimezoneInfo);

	/* 		*** Вспомогательные общие функции для задания 3 и 4 *** */
	// отображает полученную информацию пользователю в поле вывода
	function showContent(btn, output, func) {
		if (btn && output) {
			btn.addEventListener('click', () => {
				output.innerHTML = '';
				output.classList.add('output_active');
				func();
			});
		}
	}
	// перезаписывает сообщение в поле вывода
	function overwriteMessage(
		output, text, color, title, className = 'output__row'
	) {
		const textBlock = document.createElement('div');
		textBlock.classList.add(className);
		textBlock.innerHTML = `<h3 class='output__title'>${title}</h3>
				<p class="output__text color-${color}">${text}</p>`;
		output.append(textBlock);
	}
	// показывает сообщение об ожидании
	function showAwaitingMessage(output) {
		const title = 'Координаты местоположения пользователя:';
		const message = `Получаем координаты <span class="points-animated">.</span>`;
		overwriteMessage(output, message, 'white', title, 'await-message');
	}

	// удаляет элемент
	function deleteElement(selector) {
		document.querySelector(`${selector} .await-message`).remove();
	}
}