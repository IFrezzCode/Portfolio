// Lade-Text ausblenden nach 2 Sekunden
window.onload = function () {
	setTimeout(function () {
		const loadingText = document.getElementById("loadingText");
		loadingText.style.display = "none"; // Lade-Text verschwindet
	}, 2000); // 2 Sekunden Verzögerung
};

// Einfaches Script, um das Scrollen sanft zu gestalten
document.querySelectorAll(".sidebar a").forEach((anchor) => {
	anchor.addEventListener("click", function (e) {
		e.preventDefault();

		document.querySelector(this.getAttribute("href")).scrollIntoView({
			behavior: "smooth",
		});
	});
});

const sections = document.querySelectorAll("section"); // Alle Abschnitte
const links = document.querySelectorAll(".NaviElement"); // Alle Navigationslinks

// Optionen für den IntersectionObserver
const options = {
	root: null, // Der root ist der Viewport (Fenster)
	rootMargin: "0px 0px -50% 0px", // Wenn der Abschnitt 50% vor dem unteren Rand des Viewports kommt
	threshold: 0, // Der Abschnitt ist aktiv, sobald er im Viewport erscheint
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		const id = entry.target.id;
		const link = document.querySelector(
			`.NaviElement a[href="#${id}"]`
		).parentElement;

		// Wenn der Abschnitt sichtbar ist (mehr als 0% im Viewport)
		if (entry.isIntersecting) {
			// Entferne die 'active'-Klasse von allen Links
			links.forEach((link) => link.classList.remove("active"));

			// Füge die 'active'-Klasse nur für den sichtbaren Abschnitt hinzu
			link.classList.add("active");
		}
	});
}, options);

// Beobachte alle Abschnitte
sections.forEach((section) => {
	observer.observe(section);
});

/*Video*/

/*Arbeiten*/

/*THREE JS TEST SZENE*/

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three-container").appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 3;

// Scroll-Position speichern
let scrollY = 0;
window.addEventListener("scroll", () => {
	scrollY = window.scrollY;
});

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

let isVisible = true;

window.addEventListener("scroll", () => {
	const rect = document
		.getElementById("three-container")
		.getBoundingClientRect();
	isVisible = rect.top < window.innerHeight && rect.bottom > 0;
});

// Animation der Szene
function animate() {
	requestAnimationFrame(animate);

	// Rotation basierend auf scrollY
	cube.rotation.x = scrollY * 0.005;
	cube.rotation.y = scrollY * 0.005;

	renderer.render(scene, camera);
}

animate();

/*Prozess*/
// Slide Navigation
const slides = document.querySelectorAll(".carousel-slide");
let currentSlide = 0;

function showSlide(index) {
	slides.forEach((slide, i) => {
		slide.classList.toggle("active", i === index);
	});
}

document.querySelectorAll(".slide-nav.prev").forEach((btn) => {
	btn.addEventListener("click", () => {
		currentSlide = (currentSlide - 1 + slides.length) % slides.length;
		showSlide(currentSlide);
	});
});

document.querySelectorAll(".slide-nav.next").forEach((btn) => {
	btn.addEventListener("click", () => {
		currentSlide = (currentSlide + 1) % slides.length;
		showSlide(currentSlide);
	});
});

// Media Navigation (innerhalb eines Slides)
document.querySelectorAll(".carousel-slide").forEach((slide) => {
	const mediaItems = slide.querySelectorAll(".media-item");
	const mediaPrev = slide.querySelector(".media-prev");
	const mediaNext = slide.querySelector(".media-next");
	const desc = slide.querySelector(".project-desc");

	if (!mediaItems.length || !mediaPrev || !mediaNext) return;

	let currentMedia = 0;
	const descriptions = [
		"Visualisierung eiens modularen Keypads.",
		"Zitronenpresse mit Verschiedenen Aufsätzen .",
	];

	function updateMedia() {
		mediaItems.forEach((item, i) => {
			item.classList.toggle("active", i === currentMedia);
		});
		if (desc && descriptions[currentMedia]) {
			desc.textContent = descriptions[currentMedia];
		}
	}

	mediaNext.addEventListener("click", () => {
		currentMedia = (currentMedia + 1) % mediaItems.length;
		updateMedia();
	});

	mediaPrev.addEventListener("click", () => {
		currentMedia = (currentMedia - 1 + mediaItems.length) % mediaItems.length;
		updateMedia();
	});

	updateMedia(); // initial
});

/*Portfolio Text*/

new TypeIt("#typewriter", {
	speed: 50,
	waitUntilVisible: true,
	loop: true,
})
	.type("Hallo,")
	.break()
	.type("mein Name ist Kai Weber.")
	.break()
	.type("Ich bin ")
	.type("Produktdesigner")
	.pause(800)
	.delete(15)
	.type("Maßschneider")
	.pause(600)
	.delete(12)
	.type("Keramiker")
	.pause(800)
	.delete(9)
	.type("Textilgestalter")
	.pause(850)
	.delete(15)
	.type("Designer.")
	.pause(400)
	.break()
	.type("Ich verbinde Handwerk & digitale Gestaltung.")
	.pause(20)
	.break()
	.type("Ich mag klare Formen, durchdachte Konzepte und Projekte,")
	.break()
	.type("die vom Material bis zum Endprodukt durchdacht sind.")
	.break()
	.pause(4000)
	.go();
