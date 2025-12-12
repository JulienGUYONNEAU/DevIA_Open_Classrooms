const slides = [
	{
		"image":"./assets/images/slideshow/slide1.jpg",
		"tagLine":"Impressions tous formats <span>en boutique et en ligne</span>"
	},
	{
		"image":"./assets/images/slideshow/slide2.jpg",
		"tagLine":"Tirages haute définition grand format <span>pour vos bureaux et events</span>"
	},
	{
		"image":"./assets/images/slideshow/slide3.jpg",
		"tagLine":"Grand choix de couleurs <span>de CMJN aux pantones</span>"
	},
	{
		"image":"./assets/images/slideshow/slide4.png",
		"tagLine":"Autocollants <span>avec découpe laser sur mesure</span>"
	}
]

const carousel_dots = document.querySelector('.dots');
const dots_number = slides.length;
let current_slide = 0;

const arrow_left = document.getElementById('arrow_left');
const arrow_right = document.getElementById('arrow_right');

arrow_left.addEventListener('click', function(){
	if (current_slide==0) {
		current_slide = dots_number-1;
	} else {
		current_slide--;
	}
	updateSlide();
});

arrow_right.addEventListener('click', function(){
	if (current_slide==dots_number-1) {
		current_slide = 0;
	} else {
		current_slide++;
	}
	updateSlide();
});

function createDots(){
	for (let index = 0; index < dots_number; index++) {
		const dot = document.createElement('span');
		dot.classList.add('dot');
		carousel_dots.appendChild(dot);
	}
}

function activeDotUpdate() {
	const dots = document.querySelectorAll('.dot');
	dots.forEach(dot => dot.classList.remove('dot_selected'));
	dots[current_slide].classList.add('dot_selected');
}

const banner_img = document.getElementById('banner_img');
const banner_txt = document.getElementById('banner_txt');

function updateSlide() {
	banner_img.src = slides[current_slide].image;
	banner_txt.innerHTML = slides[current_slide].tagLine;

	activeDotUpdate();
}

createDots();
updateSlide();
