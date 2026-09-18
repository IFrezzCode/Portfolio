// #region Sprache

/* sprache */
window.setLanguage = function (lang) {
  document.documentElement.lang = lang;

  document.getElementById('lang-de').classList.toggle('active', lang === 'de');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  requestAnimationFrame(() => window.updateSubpointGeometry?.());
  requestAnimationFrame(() => window.updateNavigationLayout?.());
};

const browserLanguage = navigator.language;

if (window.location.hash === '#skills') {
  document.documentElement.style.scrollBehavior = 'auto';
}

if (browserLanguage.startsWith('de')) {
  setLanguage('de');
} else {
  setLanguage('en');
}

// #endregion

// #region Navigation und Scrollverhalten

/* Navi Home */

// Der Skills-Link springt ohne Scrollanimation direkt an den Sektionsanfang.
document.querySelectorAll('a[href="#skills"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const skills = document.getElementById('skills');
    if (!skills) return;
    event.preventDefault();
    skills.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.replaceState(null, '', '#skills');
    updateNavbar();
  });
});

const navbar = document.querySelector('.NaviBar');
const menuButton = navbar?.querySelector('.MenuButton');
const hero = document.querySelector('.hero');
const heroScrollStop = document.querySelector('.hero-scroll-stop');

function setMenuOpen(isOpen) {
  if (!navbar?.classList.contains('compact')) isOpen = false;
  navbar?.classList.toggle('open', isOpen);
  menuButton?.setAttribute('aria-expanded', String(isOpen));
  menuButton?.setAttribute(
    'aria-label',
    isOpen ? 'Navigation schließen' : 'Navigation öffnen',
  );
}

function updateNavigationLayout() {
  if (!navbar) return;

  const navigation = navbar.querySelector('.NaviBox');
  if (!navigation) return;

  const measurement = navigation.cloneNode(true);
  measurement.classList.add('nav-measure');
  measurement.style.fontSize = getComputedStyle(navbar).fontSize;
  measurement
    .querySelectorAll('[id]')
    .forEach((element) => element.removeAttribute('id'));
  document.body.append(measurement);

  const requiredWidth = Array.from(measurement.children).reduce(
    (total, item) => total + item.getBoundingClientRect().width,
    0,
  );
  const availableWidth = Math.min(1200, window.innerWidth - 40);
  measurement.remove();

  const shouldBeCompact = requiredWidth > availableWidth;
  navbar.classList.toggle('compact', shouldBeCompact);
  if (!shouldBeCompact) setMenuOpen(false);
}

window.updateNavigationLayout = updateNavigationLayout;

menuButton?.setAttribute('aria-expanded', 'false');
menuButton?.addEventListener('click', () => {
  if (!navbar?.classList.contains('compact')) return;
  setMenuOpen(!navbar.classList.contains('open'));
});

navbar?.querySelectorAll('.NaviBox a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

window.addEventListener('resize', updateNavigationLayout, { passive: true });
window.addEventListener('load', updateNavigationLayout);
document.fonts?.ready.then(updateNavigationLayout);
updateNavigationLayout();

function updateNavbar() {
  const heroHeight = heroScrollStop?.offsetHeight || hero?.offsetHeight || 0;
  const collapsePoint = heroHeight + 100;

  if (window.scrollY > collapsePoint) {
    navbar.classList.add('collapsed');
  } else {
    navbar.classList.remove('collapsed');
    navbar.classList.remove('open');
  }

  if (hero) {
    // Der Hero bleibt fest stehen und wird durch die erste Scroll-Strecke ausgeblendet.
    const fadeDistance = Math.max(heroHeight * 0.8, 1);
    const scrollProgress = Math.min(window.scrollY / fadeDistance, 1);
    document.documentElement.style.setProperty(
      '--hero-scroll-progress',
      scrollProgress,
    );
    document.body.classList.toggle('hero-scrolled', scrollProgress >= 0.7);
  }
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// #endregion

// #region 3D-Hero

async function initHero() {
  const canvas = document.querySelector('.hero-canvas');
  if (!hero || !canvas) return;
  if (!window.WebGLRenderingContext) {
    hero.classList.add('is-ready');
    return;
  }
  if (
    window.location.hash === '#skills' &&
    window.scrollY >= (heroScrollStop?.offsetHeight || 0) - 1
  ) {
    return;
  }

  try {
    const GaussianSplats3D =
      await import('https://esm.sh/@mkkellogg/gaussian-splats-3d@0.4.6');
    const isMobile = window.matchMedia('(max-width: 700px)').matches;
    const orbitRadius = isMobile ? 6 : 5.3;
    // Keep the camera on the visible half of the model: never cross to its exterior.
    const minOrbitPitch = -Math.PI / 2 + 0.12;
    const maxOrbitPitch = -0.12;
    const orbitPitch = (minOrbitPitch + maxOrbitPitch) / 2;
    const pitchRange = maxOrbitPitch - minOrbitPitch;
    const orbitCenter = { x: 0.714, y: 2.071, z: -1.801 };
    const startHeight = Math.sin(orbitPitch) * orbitRadius;
    const startDepth = Math.cos(orbitPitch) * orbitRadius;
    canvas.remove();

    const viewer = new GaussianSplats3D.Viewer({
      rootElement: hero,
      cameraUp: [0, 1, 0],
      initialCameraPosition: [
        orbitCenter.x,
        orbitCenter.y + startHeight,
        orbitCenter.z + startDepth,
      ],
      initialCameraLookAt: [orbitCenter.x, orbitCenter.y, orbitCenter.z],
      useBuiltInControls: false,
      sharedMemoryForWorkers: false,
      antialiased: false,
      ignoreDevicePixelRatio: true,
      renderMode: GaussianSplats3D.RenderMode.OnChange,
      halfPrecisionCovariancesOnGPU: true,
      freeIntermediateSplatData: true,
      sphericalHarmonicsDegree: 2,
      sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant,
    });

    viewer.renderer.domElement.classList.add('hero-canvas');
    await viewer.addSplatScene('assets/3D/videowerkstatt1.ksplat', {
      showLoadingUI: false,
      progressiveLoad: false,
      splatAlphaRemovalThreshold: 1,
      position: [-3, 0, 2],
      // Turn it around so the top view opens in the intended orientation.
      rotation: [0, 1, 0, 0],
      scale: [5, 5, 5],
    });
    viewer.start();
    hero.classList.add('has-webgl');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add('is-ready'));
    });

    const targetCamera = {
      x: orbitCenter.x,
      y: orbitCenter.y + startHeight,
      z: orbitCenter.z + startDepth,
    };
    window.addEventListener(
      'pointermove',
      (event) => {
        const horizontal = event.clientX / window.innerWidth - 0.5;
        const vertical = event.clientY / window.innerHeight - 0.5;
        // ±90° horizontally (180° total); vertically stay within one hemisphere.
        const yaw = horizontal * Math.PI;
        const pitch = orbitPitch - vertical * pitchRange;
        const horizontalRadius = Math.cos(pitch) * orbitRadius;

        targetCamera.x = orbitCenter.x + Math.sin(yaw) * horizontalRadius;
        targetCamera.y = orbitCenter.y + Math.sin(pitch) * orbitRadius;
        targetCamera.z = orbitCenter.z + Math.cos(yaw) * horizontalRadius;
      },
      { passive: true },
    );

    let heroActive = true;
    const updateCamera = () => {
      viewer.camera.position.x +=
        (targetCamera.x - viewer.camera.position.x) * 0.06;
      viewer.camera.position.y +=
        (targetCamera.y - viewer.camera.position.y) * 0.06;
      viewer.camera.position.z +=
        (targetCamera.z - viewer.camera.position.z) * 0.06;
      viewer.camera.lookAt(orbitCenter.x, orbitCenter.y, orbitCenter.z);
      if (heroActive) requestAnimationFrame(updateCamera);
    };
    updateCamera();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !heroActive) {
        heroActive = true;
        viewer.start();
        updateCamera();
      } else if (!entry.isIntersecting && heroActive) {
        heroActive = false;
        viewer.stop();
      }
    });
    visibilityObserver.observe(heroScrollStop);
  } catch (error) {
    console.error('Das 3D-Objekt konnte nicht geladen werden.', error);
    hero.classList.add('is-ready');
  }
}

window.addEventListener(
  'load',
  () => {
    setTimeout(() => {
      if (
        window.location.hash === '#skills' &&
        heroScrollStop &&
        window.scrollY >= heroScrollStop.offsetHeight - 1
      ) {
        const loadHeroWhenApproached = () => {
          if (window.scrollY >= heroScrollStop.offsetHeight - 1) return;
          window.removeEventListener('scroll', loadHeroWhenApproached);
          initHero();
        };
        window.addEventListener('scroll', loadHeroWhenApproached, {
          passive: true,
        });
        return;
      }
      initHero();
    }, 500);
  },
  { once: true },
);

// #endregion

// #region Arbeitsprozess und Scrollanimationen

/* Home: Prozessschritte beim Scrollen einblenden */
const revealElements = document.querySelectorAll('.reveal-on-scroll');
const subpointElements = document.querySelectorAll('.work-step__subpoints li');
const processSteps = document.querySelectorAll('.work-step[data-step]');
const processBackgrounds = document.querySelectorAll(
  '.work-process__background[data-background-step]',
);

function showProcessBackground(stepNumber) {
  processBackgrounds.forEach((background) => {
    background.classList.toggle(
      'is-active',
      background.dataset.backgroundStep === stepNumber,
    );
  });
}

window.updateSubpointGeometry = function () {
  document.querySelectorAll('.work-step').forEach((step) => {
    const node = step.querySelector('.work-step__node');
    if (!node) return;
    const subpoints = Array.from(
      step.querySelectorAll('.work-step__subpoints li'),
    ).filter((subpoint) => subpoint.offsetParent !== null);
    if (!subpoints.length) return;

    subpoints.forEach((subpoint) => {
      subpoint.style.setProperty('--branch-offset-y', '0px');
    });

    const nodeRect = node.getBoundingClientRect();
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    const isOddStep = Number(step.dataset.step) % 2 === 1;
    const naturalGeometry = subpoints.map((subpoint) => {
      const rect = subpoint.getBoundingClientRect();
      const anchorX = isOddStep ? rect.left : rect.right;
      return {
        subpoint,
        outwardDistance: Math.max(
          isOddStep ? anchorX - nodeCenterX : nodeCenterX - anchorX,
          1,
        ),
        verticalDistance: rect.top + rect.height / 2 - nodeCenterY,
      };
    });

    const angleSpreadAt = (offset) => {
      const lastIndex = naturalGeometry.length - 1;
      const angles = naturalGeometry.map((geometry, index) => {
        const progress = lastIndex ? index / lastIndex : 0.5;
        const verticalOffset = (progress * 2 - 1) * offset;
        return Math.atan2(
          geometry.verticalDistance + verticalOffset,
          geometry.outwardDistance,
        );
      });
      return angles.at(-1) - angles[0];
    };

    const targetSpread = Math.PI / 2;
    let lowerOffset = 0;
    let upperOffset = 32;
    while (angleSpreadAt(upperOffset) < targetSpread && upperOffset < 512) {
      upperOffset *= 2;
    }
    for (let iteration = 0; iteration < 14; iteration += 1) {
      const middleOffset = (lowerOffset + upperOffset) / 2;
      if (angleSpreadAt(middleOffset) < targetSpread) {
        lowerOffset = middleOffset;
      } else {
        upperOffset = middleOffset;
      }
    }

    const lastIndex = subpoints.length - 1;
    subpoints.forEach((subpoint, index) => {
      const progress = lastIndex ? index / lastIndex : 0.5;
      const verticalOffset = (progress * 2 - 1) * upperOffset;
      subpoint.style.setProperty(
        '--branch-offset-y',
        `${verticalOffset.toFixed(2)}px`,
      );
    });

    subpoints.forEach((subpoint) => {
      const subpointRect = subpoint.getBoundingClientRect();
      const anchorX = isOddStep ? subpointRect.left : subpointRect.right;
      const subpointCenterY = subpointRect.top + subpointRect.height / 2;
      const horizontalDistance = anchorX - nodeCenterX;
      const verticalDistance = subpointCenterY - nodeCenterY;
      const branchLength = Math.hypot(horizontalDistance, verticalDistance);
      const branchAngle = isOddStep
        ? Math.atan2(verticalDistance, horizontalDistance)
        : Math.atan2(-verticalDistance, -horizontalDistance);

      subpoint.style.setProperty(
        '--branch-length',
        `${branchLength.toFixed(2)}px`,
      );
      subpoint.style.setProperty('--branch-angle', `${branchAngle}rad`);
    });
  });
};

window.updateSubpointGeometry();
window.addEventListener('load', window.updateSubpointGeometry, { once: true });
window.addEventListener('resize', window.updateSubpointGeometry, {
  passive: true,
});
document.fonts?.ready.then(window.updateSubpointGeometry);

if ('ResizeObserver' in window) {
  const processGeometryObserver = new ResizeObserver(() => {
    window.updateSubpointGeometry();
  });
  document.querySelectorAll('.work-process__network').forEach((network) => {
    processGeometryObserver.observe(network);
  });
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const subpointObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        window.setTimeout(window.updateSubpointGeometry, 700);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  subpointElements.forEach((element) => subpointObserver.observe(element));

  const backgroundObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showProcessBackground(entry.target.dataset.step);
      });
    },
    { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
  );

  processSteps.forEach((step) => backgroundObserver.observe(step));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
  subpointElements.forEach((element) => {
    element.classList.add('is-visible');
  });
}

// #endregion

// #region Projekt-Vorschaubilder

/* Projekte: Vorschaubild neben dem Mauszeiger */
const projectPreview = document.querySelector('.projekt-hover-preview');
const projectPreviewImage = projectPreview?.querySelector('img');
const projectSummaries = document.querySelectorAll(
  '.projekt summary[data-hover-src]',
);
let activeProjectSummary = null;

function hideProjectPreview() {
  activeProjectSummary = null;
  projectPreview?.classList.remove('is-visible');
}

function positionProjectPreview(event) {
  if (!projectPreview) return;
  const gap = 22;
  const bounds = projectPreview.getBoundingClientRect();
  let x = event.clientX + gap;
  let y = event.clientY + gap;

  if (x + bounds.width > window.innerWidth - 12) {
    x = event.clientX - bounds.width - gap;
  }
  y = Math.min(y, window.innerHeight - bounds.height - 12);
  y = Math.max(12, y);

  projectPreview.style.setProperty('--preview-x', `${x}px`);
  projectPreview.style.setProperty('--preview-y', `${y}px`);
}

projectSummaries.forEach((summary) => {
  const project = summary.closest('details');

  summary.addEventListener('pointerenter', (event) => {
    if (!projectPreview || !projectPreviewImage || project?.open) return;
    activeProjectSummary = summary;
    projectPreviewImage.src = summary.dataset.hoverSrc;
    positionProjectPreview(event);
    projectPreview.classList.add('is-visible');
  });

  summary.addEventListener('pointermove', (event) => {
    if (activeProjectSummary !== summary || project?.open) return;
    positionProjectPreview(event);
  });

  summary.addEventListener('pointerleave', hideProjectPreview);
  summary.addEventListener('click', hideProjectPreview);
  project?.addEventListener('toggle', () => {
    if (project.open) hideProjectPreview();
  });
});

// #endregion
