// смена иконки внутри кнопки
const btnWithIcon = document.querySelector('.btn_with-icon');
const btnIcons = document.querySelectorAll('.btn__icon');
if (btnWithIcon && btnIcons.length > 0) {
	btnWithIcon.addEventListener('click', () => {
		btnIcons.forEach(elem => elem.classList.toggle('btn__icon_active'));
	});
}