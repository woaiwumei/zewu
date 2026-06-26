// 全局当前筛选状态
let currentFilter = 'all';

// === 页面加载 ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  console.log('PROJECT_DATA exists?', typeof window.PROJECT_DATA !== 'undefined');
  
  const loader = document.getElementById('pageLoader');
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 800);

  initHeroSlider();
  initNavbar();
  initScrollReveal();
  initPortfolio();
  initLightbox();
  initFilters();
});

// === Hero 轮播 ===
function initHeroSlider() {
  const bgs = document.querySelectorAll('.hero-bg');
  let current = 0;
  
  bgs[0].classList.add('active');
  
  bgs.forEach(bg => {
    const img = new Image();
    const src = bg.style.backgroundImage.slice(5, -2);
    img.src = src;
  });
  
  setInterval(() => {
    bgs[current].classList.remove('active');
    current = (current + 1) % bgs.length;
    bgs[current].classList.add('active');
  }, 5000);
}

// === 导航栏滚动 ===
function initNavbar() {
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        const offset = 80; // 导航栏高度
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}

// === 滚动显示动画 ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

function observeReveals(elements) {
  elements.forEach(el => revealObserver.observe(el));
}

function initScrollReveal() {
  observeReveals(document.querySelectorAll('.reveal'));
}

// === 项目渲染（按类别分组） ===
function initPortfolio() {
  const container = document.getElementById('portfolioContainer') || document.getElementById('portfolioGrid');
  console.log('initPortfolio called, container:', container);
  console.log('PROJECT_DATA exists?', typeof window.PROJECT_DATA !== 'undefined');
  
  if (!container || !window.PROJECT_DATA) {
    console.error('Missing container or PROJECT_DATA');
    return;
  }
  
  const { categories, projects } = PROJECT_DATA;
  console.log('Categories:', categories.length, 'Projects:', projects.length);
  
  categories.forEach((cat, catIdx) => {
    console.log('Processing category', catIdx, ':', cat.id);
    const catProjects = projects.filter(p => p.category === cat.id);
    console.log('  catProjects.length:', catProjects.length);
    if (catProjects.length === 0) {
      console.log('  -> skipped (no projects)');
      return;
    }
    
    const section = document.createElement('div');
    section.className = 'category-section';
    section.dataset.category = cat.id;
    
    section.innerHTML = `
      <div class="category-header reveal">
        <div class="category-title-group">
          <h3>${cat.name}</h3>
          <span>${cat.nameEn}</span>
        </div>
        <div class="category-count">${catProjects.length} 个项目</div>
      </div>
      <div class="portfolio-grid" data-category="${cat.id}"></div>
    `;
    
    const grid = section.querySelector('.portfolio-grid');
    console.log('  grid found:', !!grid);
    
    catProjects.forEach((project, index) => {
      try {
        const card = createProjectCard(project, index);
        grid.appendChild(card);
      } catch (e) {
        console.error('Error creating card for', project.id, e);
      }
    });
    
    console.log('  Before appendChild, container children:', container.children.length);
    container.appendChild(section);
    console.log('  After appendChild, container children:', container.children.length);
  });
  
  // 观察新创建的动态元素
  observeReveals(container.querySelectorAll('.reveal'));
  
  initLazyLoad();
  
  console.log('Final cards count:', document.querySelectorAll('.project-card').length);
  console.log('Final sections count:', document.querySelectorAll('.category-section').length);
}

function createProjectCard(project, index) {
  const card = document.createElement('div');
  card.className = 'project-card reveal';
  card.dataset.category = project.category;
  card.dataset.projectId = project.id;
  
  const hasVideo = project.video;
  const firstImage = getProjectImagePath(project, 0);
  const videoPath = hasVideo ? getProjectVideoPath(project) : null;
  
  let mediaHTML = '';
  
  if (hasVideo && videoPath) {
    mediaHTML = `
      <video autoplay muted loop playsinline preload="metadata" poster="${firstImage}">
        <source src="${videoPath}" type="video/mp4">
      </video>
      <div class="video-indicator">&#9654;</div>
    `;
  } else {
    mediaHTML = `<img data-src="${firstImage}" alt="${project.name}" class="lazy-img" loading="lazy">`;
  }
  
  card.innerHTML = `
    <div class="media-wrap">
      ${mediaHTML}
      <div class="media-overlay"></div>
    </div>
    <div class="project-info">
      <div class="project-name">${project.name}</div>
      <div class="project-desc">${project.desc}</div>
    </div>
  `;
  
  card.addEventListener('click', () => {
    openLightbox(project);
  });
  
  return card;
}

function getCategoryName(categoryId) {
  const category = PROJECT_DATA.categories.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
}

// === 懒加载 ===
function initLazyLoad() {
  const images = document.querySelectorAll('.lazy-img');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.onload = () => img.classList.add('loaded');
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '100px 0px'
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// === 筛选功能 ===
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const container = document.getElementById('portfolioContainer');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      currentFilter = filter;
      
      const sections = container.querySelectorAll('.category-section');
      
      sections.forEach((section, secIdx) => {
        const category = section.dataset.category;
        const match = filter === 'all' || category === filter;
        
        if (match) {
          section.style.display = '';
          setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
          }, secIdx * 100);
          
          // 显示该section下的所有卡片
          const cards = section.querySelectorAll('.project-card');
          cards.forEach((card, idx) => {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, idx * 50);
          });
        } else {
          section.style.opacity = '0';
          section.style.transform = 'translateY(20px)';
          setTimeout(() => {
            section.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// === Lightbox ===
let currentLightboxProject = null;
let currentImageIndex = 0;

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });
  
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(project) {
  currentLightboxProject = project;
  currentImageIndex = 0;
  updateLightboxContent();
  
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightboxContent');
  
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  
  const video = content.querySelector('video');
  if (video) {
    video.pause();
    video.src = '';
  }
  
  currentLightboxProject = null;
}

function navigateLightbox(direction) {
  if (!currentLightboxProject) return;
  
  const total = currentLightboxProject.images.length + (currentLightboxProject.video ? 1 : 0);
  currentImageIndex = (currentImageIndex + direction + total) % total;
  updateLightboxContent();
}

function updateLightboxContent() {
  if (!currentLightboxProject) return;
  
  const content = document.getElementById('lightboxContent');
  const title = document.getElementById('lightboxTitle');
  const counter = document.getElementById('lightboxCounter');
  
  const { images, video, name } = currentLightboxProject;
  const totalItems = images.length + (video ? 1 : 0);
  
  const isVideoItem = video && currentImageIndex === 0;
  
  if (isVideoItem) {
    const videoPath = getProjectVideoPath(currentLightboxProject);
    content.innerHTML = `
      <video controls autoplay muted style="max-width:100%;max-height:85vh;">
        <source src="${videoPath}" type="video/mp4">
      </video>
    `;
  } else {
    const imgIndex = video ? currentImageIndex - 1 : currentImageIndex;
    const imgPath = getProjectImagePath(currentLightboxProject, imgIndex);
    content.innerHTML = `<img src="${imgPath}" alt="${name}" style="max-width:100%;max-height:85vh;display:block;">`;
  }
  
  title.textContent = name;
  counter.textContent = `${currentImageIndex + 1} / ${totalItems}`;
}
