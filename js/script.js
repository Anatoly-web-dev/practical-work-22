// плавный переход к разделу
document.addEventListener('click', (event) => {
	if (event.target.closest('.menu__link')) {
		event.preventDefault();
		const anchorAddress = event.target.getAttribute('href');
		const anchorTarget = document.querySelector(`${anchorAddress}`);
		const headerHeight = document.querySelector('.header').clientHeight;
		const scrollValue = anchorTarget.getBoundingClientRect().top + scrollY - headerHeight - 10;
		scrollTo({ behavior: "smooth", top: scrollValue });
	}
});