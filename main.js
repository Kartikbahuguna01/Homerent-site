/*
  Modern House homepage interactions
  - Hero headline and pointer parallax
  - Scroll-triggered reveals
  - Scroll-driven hero, orbit, rentals, and image effects
*/

/* ----------------------------------------
   Helpers and user motion preference
   ---------------------------------------- */

const prefersReducedMotion = matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));


/* ----------------------------------------
   Hero headline animation
   ---------------------------------------- */

const headline = document.getElementById('h1');
let headlineWordIndex = 0;

headline.innerHTML = headline.textContent
  .trim()
  .split(' ')
  .map(
    (word) =>
      '<span class="w"><span style="--i:' +
      headlineWordIndex++ +
      '">' +
      word +
      '</span></span>'
  )
  .join(' ');


/* ----------------------------------------
   Hero pointer parallax
   ---------------------------------------- */

const hero = document.getElementById('hero');
const heroPan = document.getElementById('pan');

if (!prefersReducedMotion) {
  hero.addEventListener('pointermove', (event) => {
    const heroBounds = hero.getBoundingClientRect();
    const pointerX = (event.clientX - heroBounds.left) / heroBounds.width - 0.5;
    const pointerY = (event.clientY - heroBounds.top) / heroBounds.height - 0.5;

    heroPan.style.transform =
      'translate(' + -pointerX * 28 + 'px,' + -pointerY * 18 + 'px)';
  });

  hero.addEventListener('pointerleave', () => {
    heroPan.style.transform = '';
  });
}


/* ----------------------------------------
   Scroll-triggered reveals
   ---------------------------------------- */

document.documentElement.classList.add('js');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -6% 0px',
  }
);

document.querySelectorAll('.rv, .mask, .draw').forEach((element) => {
  revealObserver.observe(element);
});


/* ----------------------------------------
   Scroll-driven element references
   ---------------------------------------- */

const statement = document.querySelector('.statement p');

statement.innerHTML = statement.textContent
  .trim()
  .split(' ')
  .map((word) => '<span>' + word + '</span>')
  .join(' ');

const statementWords = [...statement.children];
const parallaxImages = [...document.querySelectorAll('[data-par]')];
const progressBar = document.getElementById('bar');

const heroSide = document.querySelector('.side');
const heroNavigation = hero.querySelector('nav');

const orbit = document.getElementById('orbit');
const orbitRing = document.getElementById('ring');
const orbitTitle = document.getElementById('ot');
const orbitName = document.getElementById('on');
const orbitCount = document.getElementById('oc');
const orbitPanelCount = 8;
const orbitNames = [...orbitRing.children].map(
  (panel) => panel.firstChild.alt
);

const rentalCards = [...document.querySelectorAll('.rcard')];
const rentalDots = [...document.querySelectorAll('#dots i')];
const rentalNumber = document.getElementById('rn');
const rentalName = document.getElementById('rname');

let lastOrbitIndex = -1;
let lastRentalIndex = -1;
let isScrollUpdateQueued = false;


/* ----------------------------------------
   Scroll-driven updates
   ---------------------------------------- */

function updatePageOnScroll() {
  isScrollUpdateQueued = false;

  const viewportHeight = innerHeight;
  const scrollProgress = scrollY / (document.documentElement.scrollHeight - viewportHeight);

  updateProgressBar(scrollProgress);
  updateHero(viewportHeight);
  updateOrbit(viewportHeight);
  updateStatement(viewportHeight);
  updateRentals(viewportHeight);
  updateParallaxImages(viewportHeight);
}

function updateProgressBar(scrollProgress) {
  progressBar.style.transform =
    'scaleX(' + clamp(scrollProgress, 0, 1) + ')';
}

function updateHero(viewportHeight) {
  const heroProgress = clamp(scrollY / (viewportHeight * 0.85), 0, 1);

  if (prefersReducedMotion) {
    return;
  }

  hero.style.transform = 'scale(' + (1 - 0.12 * heroProgress) + ')';
  hero.style.borderRadius = 48 * heroProgress + 'px';
  headline.style.transform = 'translateY(' + -heroProgress * 70 + 'px)';
  headline.style.opacity = 1 - heroProgress * 0.85;
  heroSide.style.opacity = 1 - heroProgress * 1.7;
  heroNavigation.style.opacity = 1 - heroProgress * 1.4;
}

function updateOrbit(viewportHeight) {
  const orbitBounds = orbit.getBoundingClientRect();
  const orbitProgress = clamp(
    -orbitBounds.top / (orbit.offsetHeight - viewportHeight),
    0,
    1
  );
  const orbitAngle = prefersReducedMotion ? 0 : orbitProgress * 360;

  orbitRing.style.transform =
    'rotateX(-6deg) rotateY(' + -orbitAngle + 'deg)';
  orbitTitle.style.opacity = prefersReducedMotion
    ? 1
    : 1 - clamp(orbitProgress * 7 - 0.2, 0, 1) * 0.6;

  const activePanelIndex = Math.round(orbitAngle / 45) % orbitPanelCount;

  if (activePanelIndex === lastOrbitIndex) {
    return;
  }

  lastOrbitIndex = activePanelIndex;
  orbitName.textContent = orbitNames[activePanelIndex];
  orbitCount.textContent =
    activePanelIndex + 1 + ' / ' + orbitPanelCount;
}

function updateStatement(viewportHeight) {
  const statementBounds = statement.getBoundingClientRect();
  const statementProgress = clamp(
    (viewportHeight * 0.8 - statementBounds.top) /
      (statementBounds.height + viewportHeight * 0.2),
    0,
    1
  );

  statementWords.forEach((word, index) => {
    word.style.opacity = prefersReducedMotion
      ? 1
      : 0.16 +
        0.84 *
          clamp(
            statementProgress * (statementWords.length + 6) - index,
            0,
            1
          );
  });
}

function updateRentals(viewportHeight) {
  let closestCardIndex = 0;
  let closestCardDistance = Infinity;

  rentalCards.forEach((card, index) => {
    const cardBounds = card.getBoundingClientRect();
    const cardDistance = Math.abs(
      cardBounds.top + cardBounds.height / 2 - viewportHeight * 0.52
    );

    if (cardDistance < closestCardDistance) {
      closestCardDistance = cardDistance;
      closestCardIndex = index;
    }

    if (!prefersReducedMotion) {
      const cardFocus = 1 - clamp(cardDistance / (viewportHeight * 0.7), 0, 1);

      card.style.opacity = 0.3 + 0.7 * cardFocus;
      card.style.transform = 'scale(' + (0.94 + 0.06 * cardFocus) + ')';
    }
  });

  if (closestCardIndex === lastRentalIndex) {
    return;
  }

  lastRentalIndex = closestCardIndex;
  rentalNumber.textContent = String(closestCardIndex + 1).padStart(2, '0');
  rentalName.textContent = rentalCards[closestCardIndex].dataset.name;

  rentalDots.forEach((dot, index) => {
    dot.classList.toggle('on', index <= closestCardIndex);
  });
}

function updateParallaxImages(viewportHeight) {
  if (prefersReducedMotion) {
    return;
  }

  parallaxImages.forEach((image) => {
    const imageParentBounds = image.parentElement.getBoundingClientRect();
    const parallaxAmount =
      -(imageParentBounds.top +
        imageParentBounds.height / 2 -
        viewportHeight / 2) *
      parseFloat(image.dataset.par);

    image.style.transform =
      'translate3d(0,' + parallaxAmount + 'px,0)';
  });
}


/* ----------------------------------------
   Scroll and resize events
   ---------------------------------------- */

addEventListener(
  'scroll',
  () => {
    if (isScrollUpdateQueued) {
      return;
    }

    isScrollUpdateQueued = true;
    requestAnimationFrame(updatePageOnScroll);
  },
  { passive: true }
);

addEventListener('resize', updatePageOnScroll);
updatePageOnScroll();
