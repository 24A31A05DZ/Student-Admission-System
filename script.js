// Smooth scroll for navbar links (anchors pointing to sections)
document.querySelectorAll('.navbar a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = this.getAttribute('href');
    if (target.startsWith('#')) {
      document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = target;
    }
  });
});

// alias functions matching requested API
function handleStudentLogin(email, password) { return loginStudent(email, password); }
function handleSchoolLogin(udise, password) { return loginSchool(udise, password); }

// ---------- localStorage helpers ----------
function getStored(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
function setStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// student management
function getStudents() { return getStored('students'); }
function saveStudents(list) { setStored('students', list); }
function registerStudent(student) {
  const list = getStudents();
  if (list.some(s => s.email === student.email || s.mobile === student.mobile)) {
    return false;
  }
  list.push(student);
  saveStudents(list);
  return true;
}
function loginStudent(email, password) {
  return getStudents().find(u => (u.email === email || u.mobile === email) && u.password === password);
}
function setCurrentStudent(email) { localStorage.setItem('currentStudent', email); }
function getCurrentStudent() { return localStorage.getItem('currentStudent'); }

// school management
function getSchools() { return getStored('schools'); }
function saveSchools(list) { setStored('schools', list); }
function registerSchool(school) {
  const list = getSchools();
  if (list.some(s => s.udise === school.udise)) {
    return false;
  }
  list.push(school);
  saveSchools(list);
  return true;
}
function loginSchool(udise, password) {
  return getSchools().find(s => s.udise === udise && s.password === password);
}
function setCurrentSchool(udise) { localStorage.setItem('currentSchool', udise); }
function getCurrentSchool() { return localStorage.getItem('currentSchool'); }

// application storage
function getApplications() { return getStored('applications'); }
function saveApplication(app) {
  const list = getApplications();
  list.push(app);
  setStored('applications', list);
}
function updateApplicationStatus(id, updates) {
  const list = getApplications();
  const idx = list.findIndex(a => a.id === id);
  if (idx > -1) {
    list[idx] = { ...list[idx], ...updates };
    setStored('applications', list);
    return true;
  }
  return false;
}

// ---------- homepage schools ----------
const TOP_SCHOOLS = [
  {id:1,name:'Aditya School', address:'Aditya Srinagar, Kakinada', board:'SSC', estab:'1984', founder:'R. Aditya', grades:'1-12', bus:true, hostel:true, features:'Bus and Hostel', reviews:['Established reputation','Good facilities'],
      description:'A well-established institution with a focus on holistic development.',
      facilities:['Smart classrooms','Computer labs','Science labs','Library','Playground','Bus transport','Hostel facility'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Interactive and activity-based learning with periodic assessments.',
      performance:'Consistently above district average.',
      achievements:['Best School Award 2019'],
      phone:'0891-1234567', email:'info@adityaschool.edu', admission:'Open', rating:4.2, googleMaps:'https://maps.google.com?q=Aditya+School+Kakinada',
      images:['assets/school-1.jpg','assets/school-1a.jpg','assets/school-1b.jpg']
  },
  {id:2,name:'Sri Chaitanya', address:'Santhi Nagar, Kakinada', board:'SSC', estab:'1986', founder:'Smt. Chaitanya Devi', grades:'1-12', bus:true, hostel:true, features:'Bus and Hostel', reviews:['Strong academics','Comfortable campus'],
      description:'Renowned for academic excellence and student support.',
      facilities:['Smart classrooms','Computer labs','Library','Playground','Bus transport','Hostel facility'],
      subjects:['Math','Science','English','Telugu'],
      methodology:'Blended learning with focus on critical thinking.',
      performance:'High pass percentage in board exams.',
      achievements:['State level Olympiad winners','Sports champions'],
      phone:'0891-7654321', email:'contact@srichaitanya.edu', admission:'Open', rating:4.5, googleMaps:'https://maps.google.com?q=Sri+Chaitanya+School+Kakinada',
      images:['assets/school-2.jpg','assets/school-2a.jpg','assets/school-2b.jpg']
  },
  {id:3,name:'Narayana', address:'Santhi Nagar, Kakinada', board:'CBSE', estab:'1979', bus:true, hostel:false, features:'Bus', grades:'1-12', reviews:['Competitive environment','High results'], images:['assets/school-3.jpg','assets/school-3b.jpg','assets/school-3c.jpg']},

  {id:4,name:'Lakshya', address:'ABD Road, Achampeta', board:'CBSE', estab:'2016', bus:true, hostel:true, features:'Bus and Hostel', grades:'1-12', reviews:['Modern infrastructure','Focused coaching'], images:['assets/school-4.jpg','assets/school-4a.jpg','assets/school-4b.jpg']},
  {id:5,name:'Delhi Public School', address:'Panasapadu, Kakinada', board:'CBSE', estab:'1949', bus:true, hostel:false, features:'Bus', grades:'1-12', reviews:['Historic institution','Wide alumni network'], images:['assets/school-5.jpg','assets/school-5a.jpg','assets/school-5b.jpg']},
  {id:6,name:'Bhashyam', address:'Santhi Nagar, Kakinada', board:'SSC', estab:'1993', bus:true, hostel:true, features:'Bus and Hostel', grades:'1-12', reviews:['Holistic education','Large campus'], images:['assets/school-6.jpg','assets/school-6a.jpg','assets/school-6b.jpg']},
  {id:7,name:'Ashram Public School', address:'Nagamalli Thota Junction', board:'CBSE', estab:'1987', bus:true, hostel:false, features:'Bus', grades:'1-12', reviews:['Tradition meets technology','Good discipline'], images:['assets/school-7.jpg','assets/school-7a.jpg','assets/school-7b.jpg']},
  {id:8,name:'Sri Prakash', address:'Near DMart, Kakinada', board:'CBSE', estab:'1977', bus:true, hostel:true, features:'Bus and Hostel', grades:'1-12', reviews:['Experienced faculty','Spacious classrooms'], images:['assets/school-8.jpg','assets/school-8a.jpg','assets/school-8b.jpg']},
  {id:9,name:'Sri Agastya', address:'Postal Colony, Kakinada', board:'CBSE', estab:'1989', bus:true, hostel:true, features:'Bus and Hostel', grades:'1-12', reviews:['Strong sports program','Caring staff'], images:['assets/school-9.jpg','assets/school-9a.jpg','assets/school-9b.jpg']},
  {id:10,name:'Dr KKR Gowtham', address:'Venkat Nagar, Kakinada', board:'SSC', estab:'2005', bus:true, hostel:false, features:'Bus', grades:'1-12', reviews:['Tech-forward curriculum','Friendly environment'], images:['assets/school-10.jpg','assets/school-10a.jpg','assets/school-10b.jpg']}
];

function renderHomeSchools() {
  const container = document.getElementById('schools-container');
  if (!container) return;
  container.innerHTML = '';
  TOP_SCHOOLS.forEach(s => {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
    const thumb = s.image || `assets/school-${s.id}.jpg`;
    col.innerHTML = `
      <div class="card h-100 shadow-sm hover-lift">
        <img src="${thumb}" class="card-img-top school-card-img" alt="${s.name}">
        <div class="card-body">
          <h5 class="card-title">${s.name}</h5>
          <p class="card-text small text-muted">${s.board} | ${s.address}</p>
          <p class="card-text">${s.features}</p>
          <a href="pages/school-details.html" class="btn btn-primary" onclick='selectSchool(${s.id})'>View Details</a>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}
function selectSchool(id) {
  const school = TOP_SCHOOLS.find(s => s.id === id);
  if (school) localStorage.setItem('selectedSchool', JSON.stringify(school));
}

document.addEventListener('DOMContentLoaded', () => {
  renderHomeSchools();
});

// ---------- school details page ----------
function loadSchoolDetails() {
  const container = document.getElementById('school-details-container');
  const s = JSON.parse(localStorage.getItem('selectedSchool') || '{}');
  if (!s.name) {
    container.innerHTML = '<p class="text-danger">No school selected. Please return to homepage.</p>';
    return;
  }

  // helper to convert a relative asset path into one that works from the details page
  function resolveImagePath(img) {
    if (!img) return img;
    // absolute URL or root-relative stays untouched
    if (/^(https?:)?\/\//.test(img) || img.startsWith('/')) return img;
    // otherwise page is in /pages/, so prefix ../
    return '../' + img;
  }

  // prepare image array and ensure exactly three slides
  let imgs = (s.images || []).slice();
  if (imgs.length < 3) {
    const filler = imgs[imgs.length - 1] || 'assets/placeholder.jpg';
    while (imgs.length < 3) imgs.push(filler);
  }

  const slides = imgs.map((img, idx) => `
      <div class="carousel-item ${idx===0? 'active' : ''}">
        <img src="${resolveImagePath(img)}" class="d-block carousel-img" alt="${s.name} image ${idx+1}">
      </div>
  `).join('');

  const listToHtml = arr => (arr||[]).map(i=>`<li>${i}</li>`).join('');
  const starRating = r => r ? `<p class="text-warning">${'★'.repeat(Math.round(r))}${'☆'.repeat(5-Math.round(r))}</p>` : '';

  container.innerHTML = `
    <div class="school-carousel-wrapper">
      <div id="schoolCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          ${slides}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#schoolCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#schoolCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <div class="container mt-5">
      <div class="school-header text-center mb-5">
        <h1>${s.name}</h1>
        <div class="school-meta">
          <p class="text-muted"><i class="fas fa-map-marker-alt"></i> ${s.address}</p>
          ${starRating(s.rating)}
        </div>
      </div>

      <section class="about-section mb-5">
        <h2 class="section-title">About ${s.name}</h2>
        <p class="about-description">${s.description||'No description available.'}</p>
      </section>

      <section class="school-info-section mb-5">
        <div class="info-grid">
          <div class="info-card">
            <h5><i class="fas fa-info-circle"></i> Basic Information</h5>
            <div class="info-content">
              <p><strong>Founded:</strong> ${s.estab}</p>
              <p><strong>Founder:</strong> ${s.founder||'N/A'}</p>
              <p><strong>Board:</strong> ${s.board}</p>
              <p><strong>Grades:</strong> ${s.grades}</p>
            </div>
          </div>
          <div class="info-card">
            <h5><i class="fas fa-phone"></i> Contact Information</h5>
            <div class="info-content">
              <p><strong>Phone:</strong> ${s.phone||'-'}</p>
              <p><strong>Email:</strong> ${s.email||'-'}</p>
              <p><strong>Address:</strong> ${s.address||'-'}</p>
              ${s.googleMaps?`<a href="${s.googleMaps}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">View on Map</a>`:''}\n            </div>
          </div>
          <div class="info-card">
            <h5><i class="fas fa-cog"></i> Facilities</h5>
            <div class="info-content">
              <ul class="facilities-list">${listToHtml(s.facilities)}</ul>
            </div>
          </div>
          <div class="info-card">
            <h5><i class="fas fa-book-open"></i> Academics</h5>
            <div class="info-content">
              <p><strong>Subjects:</strong> ${(s.subjects||[]).join(', ')}</p>
              <p><strong>Teaching Method:</strong> ${s.methodology||'-'}</p>
              <p><strong>Performance:</strong> ${s.performance||'-'}</p>
            </div>
          </div>
          <div class="info-card">
            <h5><i class="fas fa-trophy"></i> Achievements</h5>
            <div class="info-content">
              <ul class="achievements-list">${listToHtml(s.achievements)}</ul>
            </div>
          </div>
          <div class="info-card admission-card">
            <h5><i class="fas fa-user-graduate"></i> Admission</h5>
            <div class="info-content">
              <p class="admission-status"><strong>Status:</strong> <span class="badge ${s.admission === 'Open' ? 'bg-success' : 'bg-danger'}">${s.admission||'Closed'}</span></p>
              <a href="admission.html" class="btn btn-success mt-3" onclick="selectSchool(${s.id})">Apply Now</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

// ---------- student dashboard ----------
function loadStudentDashboard() {
  const email = getCurrentStudent();
  if (!email) { window.location.href = 'login.html'; return; }
  const student = getStudents().find(s=>s.email===email || s.mobile===email);
  if (student) document.getElementById('student-name').textContent = student.name;
  const apps = getApplications().filter(a => a.studentEmail === email);
  // fill stats
  document.getElementById('total-applied').textContent = apps.length;
  document.getElementById('under-review').textContent = apps.filter(a=>a.status==='Under Review').length;
  document.getElementById('admitted').textContent = apps.filter(a=>a.status==='Admitted').length;
  document.getElementById('enrolled').textContent = apps.filter(a=>a.status==='Enrolled').length;
  
  // populate table
  const tbody = document.querySelector('#student-apps-table tbody');
  tbody.innerHTML = '';
  apps.forEach(app => {
    let statusBadge = `<span class="badge badge-secondary px-3 py-2">${app.status}</span>`;
    if (app.status === 'Admitted') statusBadge = `<span class="badge badge-success px-3 py-2">Admitted</span>`;
    else if (app.status === 'Under Review') statusBadge = `<span class="badge badge-warning px-3 py-2">Under Review</span>`;
    else if (app.status === 'Enrolled') statusBadge = `<span class="badge badge-info px-3 py-2">Enrolled</span>`;

    let letterStatus = app.letter === 'Pending' ?
      `<button class="btn btn-sm btn-primary" onclick="openJoiningModal(${app.id})">Fill Now</button>` :
      app.letter;

    const row = `
      <tr>
        <td>${app.schoolName}</td>
        <td>${app.class}</td>
        <td>${app.date}</td>
        <td>${statusBadge}</td>
        <td>${app.testScore||'-'}</td>
        <td>${letterStatus}</td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="viewAppDetails(${app.id})">View Details</button></td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

window.openJoiningModal = function(id) {
  window.currentApplicationId = id;
  $('#confirmationModal').modal('show');
};

window.viewAppDetails = function(id) {
  const app = getApplications().find(a=>a.id===id);
  if (app) {
    alert('Application Details:\n' + JSON.stringify(app.details, null, 2));
  } else {
    alert('Application not found');
  }
};

window.submitJoiningForm = function() {
  if (!window.currentApplicationId) return;
  updateApplicationStatus(window.currentApplicationId, {letter:'Completed', status:'Enrolled'});
  alert('✅ Confirmation Letter Submitted Successfully!\nYour status is now "Enrolled"');
  $('#confirmationModal').modal('hide');
  window.currentApplicationId = null;
  loadStudentDashboard();
};

window.logout = function() {
  if (confirm('Logout?')) { logout(); }
};

// ---------- admin dashboard ----------
function loadAdminDashboard() {
  const udise = getCurrentSchool();
  if (!udise) { window.location.href = 'login.html'; return; }
  const school = getSchools().find(s => s.udise === udise);
  if (school) {
    document.querySelector('span.font-weight-bold').textContent = `${school.name} Dashboard`;
  }
  let apps = getApplications().filter(a => a.schoolId === school?.id);

  // update stats cards dynamically
  const total = apps.length;
  const admitted = apps.filter(a=>a.status==='Admitted').length;
  const rejected = apps.filter(a=>a.status==='Rejected').length;
  const pending = total - admitted - rejected;
  if (document.getElementById('total-apps')) document.getElementById('total-apps').textContent = total;
  if (document.getElementById('pending-apps')) document.getElementById('pending-apps').textContent = pending;
  if (document.getElementById('admitted-apps')) document.getElementById('admitted-apps').textContent = admitted;
  if (document.getElementById('rejected-apps')) document.getElementById('rejected-apps').textContent = rejected;

  document.getElementById('searchInput').addEventListener('keyup', function() {
    const term = this.value.toLowerCase();
    renderSchoolTable(apps.filter(a => getStudents().find(u=>u.email===a.studentEmail)?.name.toLowerCase().includes(term)));
  });
  renderSchoolTable(apps);
}

function renderSchoolTable(list) {
  const tbody = document.querySelector('#school-table tbody');
  tbody.innerHTML = '';
  list.forEach(a => {
    const student = getStudents().find(u => u.email === a.studentEmail) || {};
    const actions = `
      <button class="btn btn-sm btn-success mr-2" onclick="sendConfirmation(${a.id})">Send Confirmation</button>
      <button class="btn btn-sm btn-primary mr-2" onclick="changeStatus(${a.id})">Update Status</button>
      <button class="btn btn-sm btn-info" onclick="viewDetails(${a.id})">View</button>
    `;
    let statusClass = 'badge-secondary';
    if (a.status==='Admitted') statusClass='badge-success';
    else if (a.status==='Under Review') statusClass='badge-warning';
    else if (a.status==='Rejected') statusClass='badge-danger';
    else if (a.status==='Enrolled') statusClass='badge-info';
    const row = `
      <tr>
        <td>${student.name || 'N/A'}</td>
        <td>${a.class}</td>
        <td>${a.date}</td>
        <td>${a.testScore||'-'}</td>
        <td><span class="badge ${statusClass}">${a.status}</span></td>
        <td>${a.letter}</td>
        <td>${actions}</td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

window.sendConfirmation = function(id) {
  updateApplicationStatus(id, {letter:'Sent - Pending Fill'});
  alert('✅ Confirmation Letter sent');
  loadAdminDashboard();
};
window.viewDetails = function(id) {
  alert('📄 Show application details (id ' + id + ')');
};

window.changeStatus = function(id) {
  const options = ['Submitted','Entrance Test Pending','Test Completed','Under Review','Admitted','Rejected','Enrolled'];
  const newStatus = prompt('Enter new status for application (one of: ' + options.join(', ') + ')');
  if (newStatus && options.includes(newStatus)) {
    updateApplicationStatus(id, {status:newStatus});
    alert('Status updated to ' + newStatus);
    loadAdminDashboard();
  } else if (newStatus) {
    alert('Invalid status entered');
  }
};
window.logoutSchool = function() {
  if(confirm('Logout from School Dashboard?')){ logoutSchool(); }
};

// create sample schools if none exist
(function ensureSampleSchools(){
  let sch = getSchools();
  if (sch.length === 0) {
    TOP_SCHOOLS.forEach((s,i)=>{
      sch.push({name:s.name, udise:'UD'+(1000+i), email:s.email, password:'password', id:s.id});
    });
    saveSchools(sch);
  }
})();

// highlight active navbar link
function highlightActiveNav() {
  document.querySelectorAll('nav .nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href').split('#')[0];
    if (href && location.pathname.endsWith(href)) {
      link.classList.add('active');
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();

  // handle login page hash to select tab
  if (location.pathname.endsWith('login.html')) {
    const hash = location.hash.slice(1);
    if (hash === 'school') {
      document.querySelector('[data-role="school"]').click();
    } else {
      document.querySelector('[data-role="student"]').click();
    }
  }
});

// also respond if hash changes while on login page
window.addEventListener('hashchange', () => {
  if (location.pathname.endsWith('login.html')) {
    const hash = location.hash.slice(1);
    if (hash === 'school') document.querySelector('[data-role="school"]').click();
    else document.querySelector('[data-role="student"]').click();
  }
});

// call loaders if pages present
if (document.body.classList.contains('student-dashboard-page')) {
  document.addEventListener('DOMContentLoaded', loadStudentDashboard);
}
if (document.body.classList.contains('school-dashboard-page')) {
  document.addEventListener('DOMContentLoaded', loadAdminDashboard);
}

// --------- Authentication modal & navbar helpers ---------

// append login modal markup once per page
function appendLoginModal() {
  if (document.getElementById('loginModal')) return;
  const html = `
  <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Login / Register</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="tabs d-flex mb-3">
            <div class="tab active" data-role="student">Student</div>
            <div class="tab" data-role="school">School</div>
          </div>
          <div id="student-form">
            <h6 id="student-title">Student Login</h6>
            <form id="modal-student-login">
              <div class="form-group">
                <label>Email / Mobile</label>
                <input type="text" class="form-control" id="modal-student-email" required />
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" class="form-control" id="modal-student-password" required />
              </div>
              <button type="submit" class="btn btn-primary btn-block">Login</button>
            </form>
            <form id="modal-student-signup" style="display:none;">
              <div class="form-group"><label>Full Name</label><input type="text" class="form-control" id="modal-s-name" required/></div>
              <div class="form-group"><label>Email</label><input type="email" class="form-control" id="modal-s-email" required/></div>
              <div class="form-group"><label>Mobile</label><input type="tel" class="form-control" id="modal-s-mobile" pattern="[0-9]{10}" required/></div>
              <div class="form-group"><label>Password</label><input type="password" class="form-control" id="modal-s-password" required/></div>
              <button type="submit" class="btn btn-primary btn-block">Sign Up</button>
            </form>
            <div class="toggle-auth text-center mt-2">
              <a href="#" id="modal-student-toggle">Don't have an account? Sign Up</a>
            </div>
          </div>
          <div id="school-form" style="display:none;">
            <h6 id="school-title">School Login</h6>
            <form id="modal-school-login">
              <div class="form-group"><label>UDISE / ID</label><input type="text" class="form-control" id="modal-school-udise" required/></div>
              <div class="form-group"><label>Password</label><input type="password" class="form-control" id="modal-school-password" required/></div>
              <button type="submit" class="btn btn-primary btn-block">Login</button>
            </form>
            <form id="modal-school-signup" style="display:none;">
              <div class="form-group"><label>School Name</label><input type="text" class="form-control" id="modal-school-name" required/></div>
              <div class="form-group"><label>UDISE Code</label><input type="text" class="form-control" id="modal-school-udise-reg" required/></div>
              <div class="form-group"><label>Email</label><input type="email" class="form-control" id="modal-school-email" required/></div>
              <div class="form-group"><label>Password</label><input type="password" class="form-control" id="modal-school-pass" required/></div>
              <button type="submit" class="btn btn-primary btn-block">Register</button>
            </form>
            <div class="toggle-auth text-center mt-2">
              <a href="#" id="modal-school-toggle">New school? Register</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  initAuthForms(document);
}

// attach behavior to any forms inside provided root (document or modal fragment)
function initAuthForms(root) {
  if (!root) return;
  const tabs = root.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.role === 'student') {
        root.querySelector('#student-form').style.display = 'block';
        root.querySelector('#school-form').style.display = 'none';
      } else {
        root.querySelector('#student-form').style.display = 'none';
        root.querySelector('#school-form').style.display = 'block';
      }
    });
  });

  // student toggle
  const stoggle = root.querySelector('#modal-student-toggle');
  if (stoggle) {
    stoggle.addEventListener('click', e => {
      e.preventDefault();
      const login = root.querySelector('#modal-student-login');
      const signup = root.querySelector('#modal-student-signup');
      const title = root.querySelector('#student-title');
      if (login.style.display !== 'none') {
        login.style.display = 'none';
        signup.style.display = 'block';
        title.textContent = 'Student Sign Up';
        stoggle.textContent = 'Already have an account? Login';
      } else {
        login.style.display = 'block';
        signup.style.display = 'none';
        title.textContent = 'Student Login';
        stoggle.textContent = "Don't have an account? Sign Up";
      }
    });
  }
  // school toggle
  const schToggle = root.querySelector('#modal-school-toggle');
  if (schToggle) {
    schToggle.addEventListener('click', e => {
      e.preventDefault();
      const login = root.querySelector('#modal-school-login');
      const signup = root.querySelector('#modal-school-signup');
      const title = root.querySelector('#school-title');
      login.style.display = 'none';
      signup.style.display = 'block';
      title.textContent = 'School Registration';
      schToggle.style.display = 'none';
    });
  }

  // student login
  const sLogin = root.querySelector('#modal-student-login');
  if (sLogin) {
    sLogin.addEventListener('submit', e => {
      e.preventDefault();
      const email = root.querySelector('#modal-student-email').value.trim();
      const pwd = root.querySelector('#modal-student-password').value;
      const user = loginStudent(email, pwd);
      if (user) {
        setCurrentStudent(email);
        localStorage.removeItem('currentSchool');
        localStorage.setItem('role','student');
        $('#loginModal').modal('hide');
        window.location.href = 'pages/student-dashbord.html';
      } else {
        alert('Invalid student credentials');
      }
    });
  }
  // student signup
  const sSign = root.querySelector('#modal-student-signup');
  if (sSign) {
    sSign.addEventListener('submit', e => {
      e.preventDefault();
      const student = {
        name: root.querySelector('#modal-s-name').value.trim(),
        email: root.querySelector('#modal-s-email').value.trim(),
        mobile: root.querySelector('#modal-s-mobile').value.trim(),
        password: root.querySelector('#modal-s-password').value
      };
      if (registerStudent(student)) {
        alert('Student account created! Please login.');
        stoggle.click();
      } else {
        alert('A student with that email or mobile already exists.');
      }
    });
  }
  // school login
  const schLogin = root.querySelector('#modal-school-login');
  if (schLogin) {
    schLogin.addEventListener('submit', e => {
      e.preventDefault();
      const udise = root.querySelector('#modal-school-udise').value.trim();
      const pwd = root.querySelector('#modal-school-password').value;
      const sch = loginSchool(udise, pwd);
      if (sch) {
        setCurrentSchool(udise);
        localStorage.removeItem('currentStudent');
        localStorage.setItem('role','school');
        $('#loginModal').modal('hide');
        window.location.href = 'pages/school-dashboard.html';
      } else {
        alert('Invalid school credentials');
      }
    });
  }
  // school signup
  const schSign = root.querySelector('#modal-school-signup');
  if (schSign) {
    schSign.addEventListener('submit', e => {
      e.preventDefault();
      const school = {
        name: root.querySelector('#modal-school-name').value.trim(),
        udise: root.querySelector('#modal-school-udise-reg').value.trim(),
        email: root.querySelector('#modal-school-email').value.trim(),
        password: root.querySelector('#modal-school-pass').value
      };
      if (registerSchool(school)) {
        alert('School registered successfully! You can now login.');
        window.location.reload();
      } else {
        alert('A school with that UDISE code already exists.');
      }
    });
  }
}

// update navbar links and login button based on role
function updateNavForRole() {
  const loginBtn = document.getElementById('loginBtn');
  const dashLink = document.getElementById('dashboardLink');
  // helper to choose correct relative prefix depending on current file location
  const prefix = location.pathname.includes('/pages/') ? '' : 'pages/';
  if (getCurrentStudent()) {
    if (dashLink) dashLink.href = prefix + 'student-dashbord.html';
    if (loginBtn) {
      loginBtn.textContent = 'Logout';
      loginBtn.onclick = () => { logout(); };
    }
  } else if (getCurrentSchool()) {
    if (dashLink) dashLink.href = prefix + 'school-dashboard.html';
    if (loginBtn) {
      loginBtn.textContent = 'Logout';
      loginBtn.onclick = () => { logoutSchool(); };
    }
  } else {
    if (dashLink) {
      dashLink.href = '#';
      dashLink.onclick = (e) => { e.preventDefault(); $('#loginModal').modal('show'); };
    }
    if (loginBtn) {
      // hide button if we're already on the standalone login page
      if (location.pathname.endsWith('login.html')) {
        loginBtn.style.display = 'none';
      } else {
        loginBtn.style.display = '';
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => { $('#loginModal').modal('show'); };
      }
    }
  }
  // re-highlight after modifications
  highlightActiveNav();
}

// logout helpers
function logout() {
  // clear any stored login data
  localStorage.removeItem('currentStudent');
  localStorage.removeItem('role');
  updateNavForRole();
  // send user to login page explicitly
  window.location.href = 'login.html';
}
function logoutSchool() {
  localStorage.removeItem('currentSchool');
  localStorage.removeItem('role');
  updateNavForRole();
  window.location.href = 'login.html';
}

// initialize modal and navbar when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  appendLoginModal();
  updateNavForRole();
  const heroBtn = document.getElementById('heroLoginBtn');
  if (heroBtn) {
    if (getCurrentStudent() || getCurrentSchool()) {
      heroBtn.textContent = 'Logout';
      heroBtn.onclick = () => {
        if (getCurrentStudent()) logout();
        else logoutSchool();
      };
    } else {
      heroBtn.textContent = 'Login';
      heroBtn.onclick = e => { e.preventDefault(); $('#loginModal').modal('show'); };
    }
  }

  // generic logout helper for any element with .logout-btn
  document.body.addEventListener('click', function(e) {
    if (e.target.matches('.logout-btn')) {
      e.preventDefault();
      // clear storage and redirect
      localStorage.removeItem('currentStudent');
      localStorage.removeItem('currentSchool');
      localStorage.removeItem('role');
      window.location.href = 'login.html';
    }
  });
});