/* ============================================================
   NIROG DISHA – Doctor Directory Script
   Loads all doctors from data.json and renders them with
   search, filters, pagination, and profile modals.
   ============================================================ */

'use strict';

// ─── STATE ───────────────────────────────────────────────────
let allDoctors = [];         // raw data from JSON
let filteredDoctors = [];    // after search + filters
let allChemists = [];        // raw chemist data from JSON
let filteredChemists = [];   // chemists after shared filters
let currentPage = 1;
const PER_PAGE = 24;
let chemistCurrentPage = 1;
const CHEMISTS_PER_PAGE = 9;
let activeLocType = 'all';   // 'all' | 'Urban' | 'Rural'
let chemistsLoaded = false;

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSkeletons();
  renderChemistSkeletons();
  loadDoctors();
  loadChemists();
  initScrollBehavior();
  initSearchInput();
});

async function loadDoctors() {
  try {
    if (typeof window.doctorData === 'undefined') {
      throw new Error('doctorData not loaded. Ensure doctor.js is included.');
    }
    const raw = window.doctorData;

    // Normalise and clean the data
    allDoctors = raw
      .filter(d => d['Doctor Name.'] && d['Doctor Name.'].trim() !== '')
      .map((d, i) => ({
        srNo:           d['Sr.No.'] || String(i + 1),
        name:           (d['Doctor Name.'] || '').trim(),
        qualification:  (d['Doctor Qualification'] || '').trim(),
        address:        (d['Address_1'] || '').trim(),
        block:          (d['Block_1'] || '').trim(),
        pinCode:        (d['Pin Code_1'] || '').trim(),
        contact:        (d['Contact No_1'] || '').trim(),
        email:          (d['E-mail ID'] || '').trim(),
        compounderName: (d['Compounder Name'] || '').trim(),
        compounderContact: (d['Contact Number'] || '').trim(),
        tu:             (d['TU'] || '').trim(),
        dmc:            (d['DMC'] || '').trim(),
        locationType:   (d['Location_Type'] || '').trim(),
        duplicate:      (d['Duplicate'] || '').trim(),
      }));

    filteredDoctors = [...allDoctors];

    buildFilterOptions();
    updateStats();
    updateBadge();
    renderDoctors();
  } catch (err) {
    console.error(err);
    document.getElementById('doctorsGrid').innerHTML = `
      <div class="no-results" style="display:block">
        <div class="no-results-icon">⚠️</div>
        <h3>Could not load doctor data</h3>
        <p>Make sure doctor.js is included in index.html</p>
      </div>`;
  }
}

// ─── SKELETON LOADER ─────────────────────────────────────────
function renderSkeletons() {
  const grid = document.getElementById('doctorsGrid');
  grid.innerHTML = Array.from({ length: 12 }, () => `
    <div class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-header-lines">
          <div class="skeleton-line tall"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
      <div class="skeleton-detail-grid">
        <div><div class="skeleton-line xs"></div><div class="skeleton-line med"></div></div>
        <div><div class="skeleton-line xs"></div><div class="skeleton-line med"></div></div>
      </div>
      <div class="skeleton-line" style="width:95%"></div>
      <div class="skeleton-footer">
        <div class="skeleton-badge"></div>
        <div class="skeleton-btn"></div>
      </div>
    </div>
  `).join('');
}

function renderChemistSkeletons() {
  const list = document.getElementById('chemistsList');
  if (!list) return;
  list.innerHTML = Array.from({ length: 6 }, () => `
    <div class="skeleton-card">
      <div class="skeleton-line xs" style="width:30px"></div>
      <div class="skeleton-line tall" style="margin-top:8px"></div>
      <div class="skeleton-line med"></div>
      <div class="skeleton-line" style="width:90%"></div>
      <div class="skeleton-detail-grid">
        <div><div class="skeleton-line xs"></div><div class="skeleton-line short"></div></div>
        <div><div class="skeleton-line xs"></div><div class="skeleton-line short"></div></div>
      </div>
    </div>
  `).join('');
}

async function loadChemists() {
  try {
    if (typeof window.chemistData === 'undefined') {
      throw new Error('chemistData not loaded. Ensure chemist_data.js is included.');
    }
    const raw = window.chemistData;

    allChemists = raw
      .filter(c => c['Name of the outlet'] && c['Name of the outlet'].trim() !== '')
      .map((c, i) => ({
        srNo:         (c['S.N'] || String(i + 1)).trim(),
        outlet:       (c['Name of the outlet'] || '').trim(),
        providerName: (c['Provider Name.'] || '').trim(),
        address:      (c['Address'] || '').trim(),
        block:        (c['Block'] || '').trim(),
        pinCode:      (c['Pin Code'] || '').trim(),
        contact:      (c['Contact No.'] || '').trim(),
        email:        (c['E-mail ID'] || '').trim(),
      }));

    chemistsLoaded = true;
    filterChemists();
  } catch (err) {
    chemistsLoaded = true;
    console.error(err);
    renderChemistError();
  }
}

// ─── FILTER DROPDOWNS ────────────────────────────────────────
function buildFilterOptions() {
  const blocks    = [...new Set(allDoctors.map(d => d.block).filter(Boolean))].sort();
  const dmcs      = [...new Set(allDoctors.map(d => d.dmc).filter(Boolean))].sort();
  const tus       = [...new Set(allDoctors.map(d => d.tu).filter(Boolean))].sort();

  populateSelect('blockFilter', blocks);
  populateSelect('dmcFilter', dmcs);
  populateSelect('tuFilter', tus);
}

function populateSelect(id, options) {
  const sel = document.getElementById(id);
  options.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt;
    el.textContent = opt;
    sel.appendChild(el);
  });
}

// ─── STATS ───────────────────────────────────────────────────
function updateStats() {
  const urban   = allDoctors.filter(d => d.locationType.toLowerCase() === 'urban').length;
  const rural   = allDoctors.filter(d => d.locationType.toLowerCase() === 'rural').length;
  const blocks  = new Set(allDoctors.map(d => d.block).filter(Boolean)).size;
  const hosps   = new Set(allDoctors.map(d => d.dmc).filter(Boolean)).size;

  animateCount('stat-total',     allDoctors.length);
  animateCount('stat-urban',     urban);
  animateCount('stat-rural',     rural);
  animateCount('stat-blocks',    blocks);
  animateCount('stat-hospitals', hosps);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 60);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) clearInterval(interval);
  }, 20);
}

function updateBadge() {
  const el = document.getElementById('total-count-badge');
  if (el) el.textContent = `${allDoctors.length} Doctors`;
}

// ─── SEARCH ──────────────────────────────────────────────────
let searchDebounceTimer = null;

function initSearchInput() {
  const input   = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');

  input.addEventListener('input', () => {
    clearBtn.classList.toggle('visible', input.value.length > 0);
    // Debounced suggestions
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      showSearchSuggestions(input.value);
    }, 150);
    applyFilters();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      hideSuggestions();
      applyFilters();
    }
    if (e.key === 'Escape') hideSuggestions();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1);
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.length > 0) {
      showSearchSuggestions(input.value);
    } else {
      showRecentSearches();
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    hideSuggestions();
    applyFilters();
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    const container = document.querySelector('.search-box-container');
    if (container && !container.contains(e.target)) hideSuggestions();
  });
}

function triggerSearch() {
  applyFilters();
}

function filterChemists() {
  if (!chemistsLoaded) return;

  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const block = document.getElementById('blockFilter').value.toLowerCase();

  filteredChemists = allChemists
    .filter(chemist => {
      if (block && !chemist.block.toLowerCase().includes(block)) return false;

      if (query) {
        const haystack = [
          chemist.outlet,
          chemist.providerName,
          chemist.address,
          chemist.block,
          chemist.pinCode,
          chemist.contact,
          chemist.email
        ].join(' ').toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    })
    .sort((a, b) => parseInt(a.srNo, 10) - parseInt(b.srNo, 10));

  chemistCurrentPage = 1;
  renderChemists();
}

// ─── APPLY FILTERS ───────────────────────────────────────────
function applyFilters() {
  const query   = document.getElementById('searchInput').value.toLowerCase().trim();
  const block   = document.getElementById('blockFilter').value.toLowerCase();
  const dmc     = document.getElementById('dmcFilter').value.toLowerCase();
  const tu      = document.getElementById('tuFilter').value.toLowerCase();
  const sort    = document.getElementById('sortFilter').value;

  filteredDoctors = allDoctors.filter(doc => {
    // Location type quick filter
    if (activeLocType !== 'all') {
      if (doc.locationType.toLowerCase() !== activeLocType.toLowerCase()) return false;
    }

    // Block filter
    if (block && doc.block.toLowerCase() !== block) return false;

    // DMC filter
    if (dmc && doc.dmc.toLowerCase() !== dmc) return false;

    // TU filter
    if (tu && doc.tu.toLowerCase() !== tu) return false;

    // Text search
    if (query) {
      const haystack = [
        doc.name, doc.qualification, doc.address,
        doc.block, doc.dmc, doc.tu, doc.contact,
        doc.pinCode, doc.compounderName, doc.email
      ].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  // Sort
  if (sort === 'name') {
    filteredDoctors.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'block') {
    filteredDoctors.sort((a, b) => a.block.localeCompare(b.block));
  } else {
    filteredDoctors.sort((a, b) => parseInt(a.srNo) - parseInt(b.srNo));
  }

  currentPage = 1;
  renderDoctors();
  filterChemists();
  updateActiveFilterCount();
}

function filterLocationType(type, btn) {
  activeLocType = type;
  document.querySelectorAll('.qf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function resetFilters() {
  activeLocType = 'all';
  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearch').classList.remove('visible');
  document.getElementById('blockFilter').value = '';
  document.getElementById('dmcFilter').value = '';
  document.getElementById('tuFilter').value = '';
  document.getElementById('sortFilter').value = 'srno';
  document.querySelectorAll('.qf-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.qf-btn').classList.add('active');
  filteredDoctors = [...allDoctors];
  currentPage = 1;
  renderDoctors();
  filterChemists();
}

// ─── RENDER CARDS ────────────────────────────────────────────
function renderDoctors() {
  const grid     = document.getElementById('doctorsGrid');
  const noRes    = document.getElementById('noResults');
  const resCount = document.getElementById('resultsCount');

  const total = filteredDoctors.length;
  const start = (currentPage - 1) * PER_PAGE;
  const end   = Math.min(start + PER_PAGE, total);
  const page  = filteredDoctors.slice(start, end);

  if (total === 0) {
    grid.innerHTML = '';
    noRes.style.display = 'block';
    resCount.innerHTML = 'No results found';
    document.getElementById('paginationWrapper').style.display = 'none';
    return;
  }

  noRes.style.display = 'none';
  resCount.innerHTML = `Showing <strong>${start + 1}–${end}</strong> of <strong>${total}</strong> doctors`;

  grid.innerHTML = page.map(doc => buildCard(doc)).join('');

  renderPagination(total);
  document.getElementById('paginationWrapper').style.display = total > PER_PAGE ? 'flex' : 'none';
}

function buildCard(doc) {
  const locClass  = getLocClass(doc.locationType);
  const locLabel  = doc.locationType || 'N/A';
  const isFemale  = isFemaleDoctor(doc.name);
  const avatarCls = isFemale ? 'female-avatar' : '';
  const avatarEmj = isFemale ? '👩‍⚕️' : '👨‍⚕️';

  const contactHtml = doc.contact
    ? `<a href="tel:${doc.contact}" class="contact-chip" onclick="event.stopPropagation()">
         📞 ${doc.contact}
       </a>`
    : '';

  const hasAddress = doc.address && doc.address.length > 0;
  const hasBlock   = doc.block && doc.block.length > 0;
  const hasDMC     = doc.dmc && doc.dmc.length > 0;
  const hasTU      = doc.tu && doc.tu.length > 0;

  return `
    <div class="doctor-card" onclick="openProfile(this.getAttribute('data-doc'))" data-doc="${escHtml(JSON.stringify(doc))}" id="card-${doc.srNo}">
      <span class="doctor-num">#${doc.srNo}</span>
      <div class="doctor-card-top">
        <div class="doctor-avatar ${avatarCls}">${avatarEmj}</div>
        <div class="doctor-main-info">
          <div class="doctor-name">Dr. ${escHtml(doc.name)}</div>
          <div class="doctor-qual">${escHtml(doc.qualification) || 'Qualification not specified'}</div>
        </div>
      </div>

      ${contactHtml ? `<div class="doctor-contact-row">${contactHtml}</div>` : ''}

      <div class="doctor-card-details">
        ${hasDMC ? `
        <div class="detail-item">
          <span class="di-icon">🏥</span>
          <div>
            <span class="di-label">DMC / Hospital</span>
            <span class="di-val">${escHtml(doc.dmc)}</span>
          </div>
        </div>` : ''}
        ${hasBlock ? `
        <div class="detail-item">
          <span class="di-icon">🗺️</span>
          <div>
            <span class="di-label">Block / Area</span>
            <span class="di-val">${escHtml(doc.block)}</span>
          </div>
        </div>` : ''}
        ${hasAddress ? `
        <div class="detail-item" style="grid-column: 1 / -1">
          <span class="di-icon">📍</span>
          <div>
            <span class="di-label">Address</span>
            <span class="di-val">${escHtml(doc.address)}${doc.pinCode ? ` – ${doc.pinCode}` : ''}</span>
          </div>
        </div>` : ''}
        ${hasTU ? `
        <div class="detail-item">
          <span class="di-icon">🏢</span>
          <div>
            <span class="di-label">TU</span>
            <span class="di-val">${escHtml(doc.tu)}</span>
          </div>
        </div>` : ''}
      </div>

      <div class="doctor-card-footer">
        <span class="loc-badge ${locClass}">${locLabel}</span>
        <button class="view-profile-btn">View Profile →</button>
      </div>
    </div>
  `;
}

// ─── PROFILE MODAL ───────────────────────────────────────────
function renderChemists() {
  const list = document.getElementById('chemistsList');
  const empty = document.getElementById('chemistsEmpty');
  const count = document.getElementById('chemistResultsCount');
  const paginationWrapper = document.getElementById('chemistPaginationWrapper');

  if (!list || !empty || !count || !paginationWrapper) return;

  const total = filteredChemists.length;
  const overall = allChemists.length;

  if (overall === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    count.textContent = 'No chemist data available.';
    paginationWrapper.style.display = 'none';
    return;
  }

  if (total === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    count.innerHTML = `Showing <strong>0</strong> of <strong>${overall}</strong> chemists`;
    paginationWrapper.style.display = 'none';
    return;
  }

  const start = (chemistCurrentPage - 1) * CHEMISTS_PER_PAGE;
  const end = Math.min(start + CHEMISTS_PER_PAGE, total);
  const page = filteredChemists.slice(start, end);

  empty.style.display = 'none';
  count.innerHTML = `Showing <strong>${start + 1}–${end}</strong> of <strong>${total}</strong> chemists`;

  list.innerHTML = page.map(chemist => buildChemistCard(chemist)).join('');
  
  renderChemistPagination(total);
  paginationWrapper.style.display = total > CHEMISTS_PER_PAGE ? 'flex' : 'none';
}

function buildChemistCard(chemist) {
  const hasAddress = chemist.address && chemist.address.length > 0;
  const hasProvider = chemist.providerName && chemist.providerName.length > 0;
  const hasContact = chemist.contact && chemist.contact.length > 0;
  const hasEmail = chemist.email && chemist.email.length > 0;
  const primaryPhone = getPrimaryPhone(chemist.contact);

  return `
    <article class="chemist-card" onclick="openProfile(this.getAttribute('data-doc'), 'chemist')" data-doc="${escHtml(JSON.stringify(chemist))}" style="cursor: pointer;">
      <div class="chemist-card-top">
        <div class="chemist-main-info">
          <span class="chemist-num">#${escHtml(chemist.srNo)}</span>
          <h3 class="chemist-name">${escHtml(chemist.outlet)}</h3>
          <p class="chemist-provider">${hasProvider ? escHtml(chemist.providerName) : 'Provider not specified'}</p>
        </div>
      </div>

      <div class="chemist-details">
        ${hasAddress ? `
        <div class="chemist-detail">
          <span class="chemist-label">Address</span>
          <span class="chemist-value">${escHtml(chemist.address)}</span>
        </div>` : ''}
        ${hasContact ? `
        <div class="chemist-detail">
          <span class="chemist-label">Contact</span>
          <span class="chemist-value">${escHtml(chemist.contact)}</span>
        </div>` : ''}
        ${hasEmail ? `
        <div class="chemist-detail">
          <span class="chemist-label">Email</span>
          <span class="chemist-value">${escHtml(chemist.email)}</span>
        </div>` : ''}
        <div class="chemist-detail chemist-detail-split">
          <div>
            <span class="chemist-label">Block</span>
            <span class="chemist-value">${escHtml(chemist.block) || 'N/A'}</span>
          </div>
          <div>
            <span class="chemist-label">Pin Code</span>
            <span class="chemist-value">${escHtml(chemist.pinCode) || 'N/A'}</span>
          </div>
        </div>
      </div>

      ${(hasContact || hasEmail) ? `
      <div class="chemist-actions">
        ${primaryPhone ? `<a href="tel:${primaryPhone}" class="chemist-action">Call</a>` : ''}
        ${hasEmail ? `<a href="mailto:${escHtml(chemist.email)}" class="chemist-action secondary">Email</a>` : ''}
      </div>` : ''}
    </article>
  `;
}

function renderChemistError() {
  const list = document.getElementById('chemistsList');
  const empty = document.getElementById('chemistsEmpty');
  const count = document.getElementById('chemistResultsCount');

  if (!list || !empty || !count) return;

  list.innerHTML = '';
  empty.style.display = 'block';
  empty.innerHTML = `
    <h3>Could not load chemists</h3>
    <p>Make sure chemist_data.js is included in index.html.</p>
  `;
  count.textContent = 'Chemist data unavailable.';
}

function openProfile(doc, type = 'doctor') {
  if (typeof doc === 'string') {
    try { doc = JSON.parse(doc); } catch(e) { return; }
  }

  const isFemale = type === 'doctor' && isFemaleDoctor(doc.name);

  // Determine specific names based on type
  const name = type === 'doctor' ? 'Dr. ' + doc.name : doc.outlet;
  const qual = type === 'doctor' ? doc.qualification : doc.providerName || 'Chemist';
  const avatar = type === 'doctor' ? (isFemale ? '👩‍⚕️' : '👨‍⚕️') : '🏪';
  const badge = type === 'doctor' ? doc.locationType : 'Chemist';

  document.getElementById('modalName').textContent        = name;
  document.getElementById('modalQualification').textContent = qual || 'Not specified';
  document.getElementById('modalBadge').textContent       = badge || 'N/A';
  document.getElementById('modalAvatar').textContent      = avatar;

  // Shared fields
  document.getElementById('mAddress').textContent     = doc.address    || 'N/A';
  document.getElementById('mBlock').textContent       = doc.block      || 'N/A';
  document.getElementById('mPin').textContent         = doc.pinCode    || 'N/A';
  document.getElementById('mContact').textContent     = doc.contact    || 'Not available';
  document.getElementById('mEmail').textContent       = doc.email      || 'Not available';

  // Doctor specific fields
  const showForDoctor = type === 'doctor' ? '' : 'none';
  document.getElementById('mi-dmc').style.display = showForDoctor;
  document.getElementById('mi-tu').style.display = showForDoctor;
  document.getElementById('mi-location').style.display = showForDoctor;
  document.getElementById('mi-compounder').style.display = showForDoctor;
  document.getElementById('mi-comp-contact').style.display = showForDoctor;
  
  if (type === 'doctor') {
    document.getElementById('mDMC').textContent         = doc.dmc        || 'N/A';
    document.getElementById('mTU').textContent          = doc.tu         || 'N/A';
    document.getElementById('mLocation').textContent    = doc.locationType || 'N/A';
    document.getElementById('mCompounder').textContent  = doc.compounderName    || 'N/A';
    document.getElementById('mCompContact').textContent = doc.compounderContact || 'N/A';
  }

  // Maps Integration
  const fullAddress = [doc.address, doc.block, 'Patna', 'Bihar', doc.pinCode].filter(Boolean).join(', ');
  const encodedAddress = encodeURIComponent(fullAddress);
  
  const mapFrame = document.getElementById('modalMapFrame');
  if (mapFrame) {
    mapFrame.src = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }
  
  const directionsBtn = document.getElementById('modalDirectionsBtn');
  if (directionsBtn) {
    directionsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  }

  // Action buttons
  const callBtn      = document.getElementById('modalCallBtn');
  const whatsappBtn  = document.getElementById('modalWhatsappBtn');

  if (doc.contact) {
    callBtn.href     = `tel:${doc.contact}`;
    whatsappBtn.href = `https://wa.me/91${doc.contact.replace(/\D/g,'')}`;
    callBtn.style.display    = '';
    whatsappBtn.style.display = '';
  } else {
    callBtn.style.display    = 'none';
    whatsappBtn.style.display = 'none';
  }

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalBtn();
}

function closeModalBtn() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalBtn();
});

// ─── PAGINATION ──────────────────────────────────────────────
function renderPagination(total) {
  const totalPages  = Math.ceil(total / PER_PAGE);
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const pageNums    = document.getElementById('pageNumbers');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // Build page numbers with ellipsis
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  pageNums.innerHTML = pages.map(p =>
    p === '...'
      ? `<span class="page-num ellipsis">…</span>`
      : `<button class="page-num ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`
  ).join('');
}

function changePage(dir) {
  const totalPages = Math.ceil(filteredDoctors.length / PER_PAGE);
  const next = currentPage + dir;
  if (next >= 1 && next <= totalPages) {
    currentPage = next;
    renderDoctors();
    scrollToGrid();
  }
}

function goToPage(n) {
  currentPage = n;
  renderDoctors();
  scrollToGrid();
}

function scrollToGrid() {
  const grid = document.querySelector('.doctors-section');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── CHEMIST PAGINATION ──────────────────────────────────────
function renderChemistPagination(total) {
  const totalPages = Math.ceil(total / CHEMISTS_PER_PAGE);
  const prevBtn = document.getElementById('chemistPrevBtn');
  const nextBtn = document.getElementById('chemistNextBtn');
  const pageNums = document.getElementById('chemistPageNumbers');

  if (!prevBtn || !nextBtn || !pageNums) return;

  prevBtn.disabled = chemistCurrentPage === 1;
  nextBtn.disabled = chemistCurrentPage === totalPages;

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (chemistCurrentPage > 3) pages.push('...');
    for (let i = Math.max(2, chemistCurrentPage - 1); i <= Math.min(totalPages - 1, chemistCurrentPage + 1); i++) {
      pages.push(i);
    }
    if (chemistCurrentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  pageNums.innerHTML = pages.map(p =>
    p === '...'
      ? `<span class="page-num ellipsis">…</span>`
      : `<button class="page-num ${p === chemistCurrentPage ? 'active' : ''}" onclick="goToChemistPage(${p})">${p}</button>`
  ).join('');
}

function changeChemistPage(dir) {
  const totalPages = Math.ceil(filteredChemists.length / CHEMISTS_PER_PAGE);
  const next = chemistCurrentPage + dir;
  if (next >= 1 && next <= totalPages) {
    chemistCurrentPage = next;
    renderChemists();
    scrollToChemistSection();
  }
}

function goToChemistPage(n) {
  chemistCurrentPage = n;
  renderChemists();
  scrollToChemistSection();
}

function scrollToChemistSection() {
  const section = document.querySelector('.chemist-section');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── SCROLL BEHAVIOR ─────────────────────────────────────────
function initScrollBehavior() {
  const scrollTopBtn = document.getElementById('scrollTop');
  const navbar       = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    scrollTopBtn.classList.toggle('visible', y > 400);

    // Shrink navbar on scroll
    if (y > 50) {
      navbar.style.background = 'rgba(15,23,42,0.99)';
    } else {
      navbar.style.background = 'rgba(15,23,42,0.97)';
    }
  });
}

// ─── HELPERS ─────────────────────────────────────────────────
function getLocClass(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('rural'))  return 'rural';
  if (t.includes('urban'))  return 'urban';
  return 'uphc';
}

const femaleIndicators = [
  'neelam','anjali','smita','kumari','mamta','sangeeta','usha','madhu',
  'nishita','ranjana','veena','anita','renuka','pammy','nuzhat','khalda',
  'jaymala','archana','heema','suman','dependra','dipanwita','sangeeta',
  'rachna','rani','priya','sunita','rekha','pooja','asha','meena',
  'laxmi','poonam','shreya','kavita','nasim','alpi'
];

function isFemaleDoctor(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return femaleIndicators.some(ind => lower.includes(ind));
}

function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── REVIEWS SYSTEM ──────────────────────────────────────────
function getPrimaryPhone(contact) {
  if (!contact) return '';

  const match = contact.match(/\+?\d[\d\s/-]{6,}\d/);
  if (!match) return '';

  return match[0].split('/')[0].replace(/[^\d+]/g, '');
}

const REVIEWS_KEY = 'nirogdisha_reviews';
let selectedRating = 0;

// Default reviews for first-time visitors
const defaultReviews = [
  {
    name: 'Rahul Kumar',
    rating: 5,
    text: 'Amazing platform! Found a great doctor near my area in Patna within minutes. The search and filter features are really helpful.',
    date: '2026-04-20T10:30:00'
  },
  {
    name: 'Priya Singh',
    rating: 4,
    text: 'Very useful directory for finding doctors in Patna. The profile details are comprehensive and having the contact numbers readily available is a huge plus.',
    date: '2026-04-18T14:15:00'
  },
  {
    name: 'Mohammed Irfan',
    rating: 5,
    text: 'Best healthcare directory I have come across for Patna. Covers both urban and rural areas which is really important for people from blocks.',
    date: '2026-04-15T09:45:00'
  },
  {
    name: 'Sneha Kumari',
    rating: 4,
    text: 'The WhatsApp integration is very convenient. I was able to connect with the doctor quickly. Great initiative for Patna residents!',
    date: '2026-04-12T16:20:00'
  }
];

function getReviews() {
  const stored = localStorage.getItem(REVIEWS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(defaultReviews));
  return defaultReviews;
}

function saveReviews(reviews) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

function initReviews() {
  initStarRating();
  initReviewForm();
  renderReviews();
}

function initStarRating() {
  const stars = document.querySelectorAll('.star-input');
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value);
      stars.forEach(s => {
        s.classList.toggle('hover', parseInt(s.dataset.value) <= val);
      });
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      stars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
      });
    });
  });
}

function initReviewForm() {
  document.getElementById('submitReviewBtn').addEventListener('click', () => {
    const name = document.getElementById('reviewName').value.trim();
    const text = document.getElementById('reviewText').value.trim();

    if (!name || !text || selectedRating === 0) {
      alert('Please fill in your name, select a rating, and write a review.');
      return;
    }

    const review = {
      name,
      rating: selectedRating,
      text,
      date: new Date().toISOString()
    };

    const reviews = getReviews();
    reviews.unshift(review);
    saveReviews(reviews);

    // Reset form
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    document.querySelectorAll('.star-input').forEach(s => s.classList.remove('active'));

    // Show success and close modal
    const success = document.getElementById('reviewSuccess');
    success.classList.add('show');
    setTimeout(() => {
      success.classList.remove('show');
      closeReviewModalBtn();
    }, 1500);

    renderReviews();
  });
}

function renderReviews() {
  const list = document.getElementById('reviewsList');
  const reviews = getReviews();
  
  updateReviewSummary(reviews);

  if (reviews.length === 0) {
    list.innerHTML = `
      <div class="no-reviews">
        <div class="no-reviews-icon">💬</div>
        <h4>No reviews yet</h4>
        <p>Be the first to share your experience!</p>
      </div>`;
    return;
  }

  list.innerHTML = reviews.map(r => {
    const initial = r.name.charAt(0).toUpperCase();
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const dateStr = formatReviewDate(r.date);

    return `
      <div class="review-card">
        <div class="review-card-header">
          <div class="review-avatar">${escHtml(initial)}</div>
          <div class="review-author-info">
            <div class="review-author-name">${escHtml(r.name)}</div>
            <div class="review-date">${dateStr}</div>
          </div>
          <div class="review-stars">${stars}</div>
        </div>
        <div class="review-text">${escHtml(r.text)}</div>
      </div>`;
  }).join('');
}

function updateReviewSummary(reviews) {
  const total = reviews.length;
  document.getElementById('totalReviewsCountDisplay').textContent = total === 1 ? '1 review' : `${total} reviews`;
  
  if (total === 0) {
    document.getElementById('avgRatingDisplay').textContent = '0.0';
    document.getElementById('avgStarsDisplay').textContent = '☆☆☆☆☆';
    document.getElementById('ratingBarsContainer').innerHTML = '';
    return;
  }
  
  // Calculate average
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = (sum / total).toFixed(1);
  document.getElementById('avgRatingDisplay').textContent = avg;
  
  // Update stars based on average
  const roundedAvg = Math.round(avg);
  document.getElementById('avgStarsDisplay').textContent = '★'.repeat(roundedAvg) + '☆'.repeat(5 - roundedAvg);
  
  // Calculate distribution
  const counts = {5:0, 4:0, 3:0, 2:0, 1:0};
  reviews.forEach(r => {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  });
  
  // Render bars
  let barsHtml = '';
  for (let i = 5; i >= 1; i--) {
    const pct = ((counts[i] / total) * 100).toFixed(0);
    barsHtml += `
      <div class="rating-bar-row">
        <span>${i} ★</span>
        <div class="rating-bar-track">
          <div class="rating-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span>${pct}%</span>
      </div>`;
  }
  document.getElementById('ratingBarsContainer').innerHTML = barsHtml;
}

function formatReviewDate(iso) {
  try {
    const d = new Date(iso);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-IN', options);
  } catch {
    return '';
  }
}

// ─── REVIEW MODAL TOGGLES ────────────────────────────────────
function openReviewModal() {
  document.getElementById('reviewModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeReviewModal(e) {
  if (e.target === document.getElementById('reviewModalOverlay')) {
    closeReviewModalBtn();
  }
}

function closeReviewModalBtn() {
  document.getElementById('reviewModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ─── INIT REVIEWS ON LOAD ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReviews();
});

// expose for inline onclick
window.openProfile      = openProfile;
window.closeModal       = closeModal;
window.closeModalBtn    = closeModalBtn;
window.applyFilters     = applyFilters;
window.filterLocationType = filterLocationType;
window.resetFilters     = resetFilters;
window.changePage       = changePage;
window.goToPage         = goToPage;
window.triggerSearch    = triggerSearch;
window.openReviewModal  = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.closeReviewModalBtn = closeReviewModalBtn;
window.findNearMe       = findNearMe;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleFilterPanel = toggleFilterPanel;

// ─── GEOLOCATION ─────────────────────────────────────────────
async function findNearMe() {
  const btn = document.querySelector('.near-me-btn');
  const origText = btn.innerHTML;
  btn.innerHTML = '⏳ Locating...';
  btn.disabled = true;

  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    btn.innerHTML = origText;
    btn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude, longitude } = pos.coords;
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await resp.json();
      
      const postcode = data.address.postcode;
      const suburb = data.address.suburb || data.address.neighbourhood || data.address.village;
      
      if (postcode) {
        document.getElementById('searchInput').value = postcode;
      } else if (suburb) {
        document.getElementById('searchInput').value = suburb;
      } else {
        alert("Couldn't find precise location details.");
      }
      
      document.getElementById('clearSearch').classList.add('visible');
      applyFilters();
    } catch (e) {
      console.error(e);
      alert('Failed to determine your location. Please ensure you are connected to the internet.');
    } finally {
      btn.innerHTML = origText;
      btn.disabled = false;
    }
  }, (err) => {
    alert('Location access denied or unavailable. Please enable location services.');
    btn.innerHTML = origText;
    btn.disabled = false;
  }, {
    timeout: 10000,
    enableHighAccuracy: true
  });
}

// ─── AUTHENTICATION SYSTEM (MOCK WITH LOCALSTORAGE) ──────────
const USERS_KEY = 'nirogdisha_users';
const CURRENT_USER_KEY = 'nirogdisha_current_user';

let authStep = 1; // 1 = Email, 2 = Password
let tempEmail = '';

function initAuth() {
  updateNavbarAuthState();
}

function updateNavbarAuthState() {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  const authNavButtons = document.getElementById('authNavButtons');
  const userProfileMenu = document.getElementById('userProfileMenu');
  const navUserName = document.getElementById('navUserName');
  const navUserAvatar = document.getElementById('navUserAvatar');

  if (currentUser) {
    authNavButtons.style.display = 'none';
    userProfileMenu.style.display = 'flex';
    navUserName.textContent = currentUser.email.split('@')[0];
    navUserAvatar.textContent = currentUser.email.charAt(0).toUpperCase();
  } else {
    authNavButtons.style.display = 'flex';
    userProfileMenu.style.display = 'none';
  }
}

let isLoginMode = true;

function openAuthModal() {
  // Reset form state
  isLoginMode = true;
  document.getElementById('authName').value = '';
  document.getElementById('authEmail').value = '';
  document.getElementById('authPassword').value = '';
  
  document.getElementById('nameGroup').style.display = 'none';
  document.getElementById('authName').removeAttribute('required');
  document.getElementById('authModalTitle').textContent = 'Log in';
  document.getElementById('authModalSub').textContent = 'Welcome back! Please enter your details.';
  document.getElementById('authSubmitBtn').textContent = 'Log in';
  document.getElementById('authSwitchText').textContent = "Don't have an account?";
  document.getElementById('authSwitchLink').textContent = "Create account";
  
  document.getElementById('authErrorMsg').textContent = '';
  document.getElementById('authModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function toggleAuthMode(e) {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  document.getElementById('authErrorMsg').textContent = '';
  
  if (isLoginMode) {
    document.getElementById('nameGroup').style.display = 'none';
    document.getElementById('authName').removeAttribute('required');
    document.getElementById('authModalTitle').textContent = 'Log in';
    document.getElementById('authModalSub').textContent = 'Welcome back! Please enter your details.';
    document.getElementById('authSubmitBtn').textContent = 'Log in';
    document.getElementById('authSwitchText').textContent = "Don't have an account?";
    document.getElementById('authSwitchLink').textContent = "Create account";
  } else {
    document.getElementById('nameGroup').style.display = 'block';
    document.getElementById('authName').setAttribute('required', 'true');
    document.getElementById('authModalTitle').textContent = 'Create an account';
    document.getElementById('authModalSub').textContent = 'Please fill in your details to sign up.';
    document.getElementById('authSubmitBtn').textContent = 'Create account';
    document.getElementById('authSwitchText').textContent = "Already have an account?";
    document.getElementById('authSwitchLink').textContent = "Log in";
  }
}

function closeAuthModal(e) {
  if (e.target === document.getElementById('authModalOverlay')) {
    closeAuthModalBtn();
  }
}

function closeAuthModalBtn() {
  document.getElementById('authModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function handleSocialLogin(provider) {
  // Mock social login
  const mockUser = { email: `user@${provider.toLowerCase()}.com` };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser));
  updateNavbarAuthState();
  closeAuthModalBtn();
  alert(`Successfully logged in with ${provider}!`);
}

function handleLogout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  updateNavbarAuthState();
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('authName').value.trim();
  const emailInput = document.getElementById('authEmail').value.trim().toLowerCase();
  const passwordInput = document.getElementById('authPassword').value;
  const errorMsg = document.getElementById('authErrorMsg');
  
  errorMsg.textContent = '';

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');

  if (!emailInput) {
    errorMsg.textContent = 'Please enter a valid email or phone number.';
    return;
  }

  if (passwordInput.length < 6) {
    errorMsg.textContent = 'Password must be at least 6 characters.';
    return;
  }

  if (isLoginMode) {
    // Login flow
    if (users[emailInput]) {
      if (users[emailInput].password === passwordInput) {
        // Success
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email: emailInput, name: users[emailInput].name }));
        updateNavbarAuthState();
        closeAuthModalBtn();
      } else {
        errorMsg.textContent = 'Incorrect password. Please try again.';
      }
    } else {
      errorMsg.textContent = 'Account not found. Please create an account.';
    }
  } else {
    // Signup flow
    if (users[emailInput]) {
      errorMsg.textContent = 'An account with this email/phone already exists.';
      return;
    }
    
    users[emailInput] = { password: passwordInput, name: nameInput };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email: emailInput, name: nameInput }));
    updateNavbarAuthState();
    closeAuthModalBtn();
  }
}

// Add init to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

// Expose Auth functions
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.closeAuthModalBtn = closeAuthModalBtn;
window.handleSocialLogin = handleSocialLogin;
window.handleLogout = handleLogout;
window.handleAuthSubmit = handleAuthSubmit;
window.toggleAuthMode = toggleAuthMode;

// ─── MOBILE MENU TOGGLE ─────────────────────────────────────
function toggleMobileMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburgerBtn');
  nav.classList.toggle('open');
  btn.classList.toggle('active');
}

// ─── FILTER PANEL TOGGLE (MOBILE) ────────────────────────────
function toggleFilterPanel() {
  const panel = document.getElementById('filtersPanel');
  panel.classList.toggle('open');
}

function updateActiveFilterCount() {
  const block = document.getElementById('blockFilter').value;
  const dmc   = document.getElementById('dmcFilter').value;
  const tu    = document.getElementById('tuFilter').value;
  const sort  = document.getElementById('sortFilter').value;
  let count = 0;
  if (block) count++;
  if (dmc) count++;
  if (tu) count++;
  if (sort !== 'srno') count++;
  if (activeLocType !== 'all') count++;

  const badge = document.getElementById('activeFilterCount');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }
}

// ─── SMART SEARCH SUGGESTIONS ────────────────────────────────
const RECENT_SEARCHES_KEY = 'nirogdisha_recent_searches';
let activeSuggestionIndex = -1;

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'); }
  catch { return []; }
}

function saveRecentSearch(term) {
  if (!term || term.length < 2) return;
  let recent = getRecentSearches();
  recent = recent.filter(r => r.toLowerCase() !== term.toLowerCase());
  recent.unshift(term);
  if (recent.length > 5) recent = recent.slice(0, 5);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  hideSuggestions();
}

function showRecentSearches() {
  const recent = getRecentSearches();
  const container = document.getElementById('searchSuggestions');
  if (!container || recent.length === 0) { hideSuggestions(); return; }

  let html = '<div class="suggestion-category">Recent Searches</div>';
  recent.forEach(term => {
    html += `
      <div class="suggestion-item" onclick="selectSuggestion('${escHtml(term)}')">
        <div class="suggestion-icon recent">🕐</div>
        <div class="suggestion-text">
          <div class="suggestion-name">${escHtml(term)}</div>
        </div>
      </div>`;
  });
  html += `<div class="suggestions-footer"><button class="clear-recent-btn" onclick="clearRecentSearches()">Clear recent</button></div>`;

  container.innerHTML = html;
  container.classList.add('visible');
  activeSuggestionIndex = -1;
}

function showSearchSuggestions(query) {
  const container = document.getElementById('searchSuggestions');
  if (!container) return;

  query = query.trim().toLowerCase();
  if (query.length < 2) {
    showRecentSearches();
    return;
  }

  const suggestions = [];
  const seen = new Set();

  // Doctors
  allDoctors.forEach(doc => {
    if (suggestions.length >= 8) return;
    const name = doc.name.toLowerCase();
    if (name.includes(query) && !seen.has('doc-' + name)) {
      seen.add('doc-' + name);
      suggestions.push({
        type: 'doctor', icon: '👨‍⚕️', iconClass: 'doctor',
        name: 'Dr. ' + doc.name, meta: doc.qualification || doc.block,
        value: doc.name
      });
    }
  });

  // DMC / Hospital
  const dmcs = [...new Set(allDoctors.map(d => d.dmc).filter(Boolean))];
  dmcs.forEach(dmc => {
    if (suggestions.length >= 8) return;
    if (dmc.toLowerCase().includes(query) && !seen.has('dmc-' + dmc.toLowerCase())) {
      seen.add('dmc-' + dmc.toLowerCase());
      suggestions.push({
        type: 'hospital', icon: '🏥', iconClass: 'hospital',
        name: dmc, meta: 'Hospital / DMC',
        value: dmc
      });
    }
  });

  // Blocks / Locations
  const blocks = [...new Set(allDoctors.map(d => d.block).filter(Boolean))];
  blocks.forEach(block => {
    if (suggestions.length >= 8) return;
    if (block.toLowerCase().includes(query) && !seen.has('block-' + block.toLowerCase())) {
      seen.add('block-' + block.toLowerCase());
      suggestions.push({
        type: 'location', icon: '📍', iconClass: 'location',
        name: block, meta: 'Block / Area',
        value: block
      });
    }
  });

  // Chemists
  allChemists.forEach(ch => {
    if (suggestions.length >= 8) return;
    const outlet = ch.outlet.toLowerCase();
    if (outlet.includes(query) && !seen.has('ch-' + outlet)) {
      seen.add('ch-' + outlet);
      suggestions.push({
        type: 'chemist', icon: '💊', iconClass: 'chemist',
        name: ch.outlet, meta: ch.providerName || ch.block,
        value: ch.outlet
      });
    }
  });

  if (suggestions.length === 0) {
    container.innerHTML = '<div class="suggestion-empty">No suggestions found for "<strong>' + escHtml(query) + '</strong>"</div>';
    container.classList.add('visible');
    return;
  }

  // Group by type
  const grouped = {};
  const labels = { doctor: 'Doctors', hospital: 'Hospitals', location: 'Locations', chemist: 'Chemists' };
  suggestions.forEach(s => {
    if (!grouped[s.type]) grouped[s.type] = [];
    grouped[s.type].push(s);
  });

  let html = '';
  for (const [type, items] of Object.entries(grouped)) {
    html += `<div class="suggestion-category">${labels[type] || type}</div>`;
    items.forEach(s => {
      const highlighted = highlightMatch(s.name, query);
      html += `
        <div class="suggestion-item" onclick="selectSuggestion('${escHtml(s.value)}')">
          <div class="suggestion-icon ${s.iconClass}">${s.icon}</div>
          <div class="suggestion-text">
            <div class="suggestion-name">${highlighted}</div>
            ${s.meta ? `<div class="suggestion-meta">${escHtml(s.meta)}</div>` : ''}
          </div>
        </div>`;
    });
  }

  container.innerHTML = html;
  container.classList.add('visible');
  activeSuggestionIndex = -1;
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escHtml(text);
  const before = escHtml(text.slice(0, idx));
  const match  = escHtml(text.slice(idx, idx + query.length));
  const after  = escHtml(text.slice(idx + query.length));
  return `${before}<mark>${match}</mark>${after}`;
}

function selectSuggestion(value) {
  const input = document.getElementById('searchInput');
  input.value = value;
  document.getElementById('clearSearch').classList.add('visible');
  saveRecentSearch(value);
  hideSuggestions();
  applyFilters();
}

function hideSuggestions() {
  const container = document.getElementById('searchSuggestions');
  if (container) container.classList.remove('visible');
  activeSuggestionIndex = -1;
}

function navigateSuggestions(dir) {
  const container = document.getElementById('searchSuggestions');
  if (!container || !container.classList.contains('visible')) return;
  const items = container.querySelectorAll('.suggestion-item');
  if (items.length === 0) return;

  items.forEach(it => it.classList.remove('active'));
  activeSuggestionIndex += dir;
  if (activeSuggestionIndex >= items.length) activeSuggestionIndex = 0;
  if (activeSuggestionIndex < 0) activeSuggestionIndex = items.length - 1;

  items[activeSuggestionIndex].classList.add('active');
  items[activeSuggestionIndex].scrollIntoView({ block: 'nearest' });

  // If user presses Enter on an active item
  const activeItem = items[activeSuggestionIndex];
  const onclick = activeItem.getAttribute('onclick');
  // Update keydown handler to use this
  const input = document.getElementById('searchInput');
  input.onkeydown = (e) => {
    if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      activeItem.click();
    }
  };
}

// expose new search functions
window.selectSuggestion = selectSuggestion;
window.clearRecentSearches = clearRecentSearches;
