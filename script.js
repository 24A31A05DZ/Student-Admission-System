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

// ---------- Firebase auth ----------
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCj83HXKPSSzbBzQaG7jZAYBv4VzxEl8rI",
  authDomain: "student-admission-system-b64a7.firebaseapp.com",
  projectId: "student-admission-system-b64a7",
  storageBucket: "student-admission-system-b64a7.firebasestorage.app",
  messagingSenderId: "324694363467",
  appId: "1:324694363467:web:0f52ef5119f2bb2f66ecce",
  measurementId: "G-HJK4PGDGY1"
};

let firebaseAuthInitPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });
}

function initFirebaseAuth() {
  if (firebaseAuthInitPromise) return firebaseAuthInitPromise;
  firebaseAuthInitPromise = (async () => {
    try {
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js");
      if (!window.firebase) return null;
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      return firebase.auth();
    } catch (err) {
      console.warn("Firebase Auth initialization failed:", err);
      return null;
    }
  })();
  return firebaseAuthInitPromise;
}

function upsertStudentProfile(student) {
  const list = getStudents();
  const idx = list.findIndex(s => s.email === student.email || (student.uid && s.uid === student.uid));
  if (idx === -1) {
    list.push(student);
  } else {
    list[idx] = { ...list[idx], ...student };
  }
  saveStudents(list);
}

function upsertSchoolProfile(school) {
  const list = getSchools();
  const idx = list.findIndex(s =>
    s.udise === school.udise ||
    s.email === school.email ||
    (school.uid && s.uid === school.uid)
  );
  if (idx === -1) {
    list.push(school);
  } else {
    list[idx] = { ...list[idx], ...school };
  }
  saveSchools(list);
}

async function loginStudentFirebase(email, password) {
  const auth = await initFirebaseAuth();
  if (!auth) return null;
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}

async function registerStudentFirebase(student) {
  const auth = await initFirebaseAuth();
  if (!auth) return null;
  const cred = await auth.createUserWithEmailAndPassword(student.email, student.password);
  if (student.name) {
    await cred.user.updateProfile({ displayName: student.name });
  }
  return cred.user;
}

async function loginSchoolFirebase(identifier, password) {
  const auth = await initFirebaseAuth();
  if (!auth) return null;
  let email = identifier;
  if (!identifier.includes('@')) {
    const school = getSchools().find(s => s.udise === identifier);
    if (!school || !school.email) return null;
    email = school.email;
  }
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}

async function registerSchoolFirebase(school) {
  const auth = await initFirebaseAuth();
  if (!auth) return null;
  const cred = await auth.createUserWithEmailAndPassword(school.email, school.password);
  return cred.user;
}

async function signOutFirebaseIfReady() {
  const auth = await initFirebaseAuth();
  if (auth && auth.currentUser) {
    await auth.signOut();
  }
}

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

function getApplicationStatus(app) {
  return app.application_status || 'applied';
}

function setApplicationStatus(id, status, extraUpdates = {}) {
  return updateApplicationStatus(id, { application_status: status, ...extraUpdates });
}

function addNotification(targetRole, targetId, message) {
  const notes = getStored('notifications', []);
  notes.push({
    id: Date.now(),
    targetRole,
    targetId,
    message,
    createdAt: new Date().toISOString(),
    read: false
  });
  setStored('notifications', notes);
}

window.update_profile = function(student_id, profile_data) {
  const students = getStudents();
  const idx = students.findIndex(s => s.uid === student_id || s.email === student_id || s.mobile === student_id);
  if (idx === -1) return false;
  students[idx] = { ...students[idx], ...profile_data };
  saveStudents(students);
  return true;
};

// minimal backend-like endpoints
window.approve_student = function(student_id) {
  const app = getApplications().find(a => String(a.id) === String(student_id));
  if (!app) return false;
  const ok = setApplicationStatus(student_id, 'approved', { letter: 'Pending' });
  if (ok) {
    addNotification('student', app.studentId, `Your application to ${app.schoolName} was approved. Please submit confirmation form.`);
  }
  return ok;
};

window.submit_confirmation = function(student_id, form_data = {}) {
  const app = getApplications().find(a => String(a.id) === String(student_id));
  if (!app) return false;
  const ok = setApplicationStatus(student_id, 'form_submitted', {
    letter: 'Completed',
    confirmationData: form_data,
    offlineVisitRequired: true
  });
  if (ok) {
    addNotification('school', app.schoolId || app.schoolUdise, `${app.studentName} submitted confirmation. Visit Offline Required.`);
  }
  return ok;
};

async function getAuthUserOrRedirect() {
  const auth = await initFirebaseAuth();
  if (!auth) return null;
  return new Promise(resolve => {
    const stop = auth.onAuthStateChanged(user => {
      stop();
      if (!user && location.pathname.includes('/pages/')) {
        window.location.href = 'login.html';
      }
      resolve(user || null);
    });
  });
}

// ---------- homepage schools ----------
const TOP_SCHOOLS = [
  {id:1,name:'Aditya School', address:'Aditya Nagar, Srinagar, Kakinada, Andhra Pradesh', board:'SSC', estab:'1984', founder:'Dr. N. Sesha Reddy', grades:'LKG – 10', bus:true, hostel:true, features:'Smart Classrooms, Computer Lab, Science Lab, Library, Playground, Bus Transport, Hostel Facility', reviews:['High SSC pass percentage','State rank holders'],
      description:'Established school with strong SSC performance and modern learning.',
      facilities:['Smart Classrooms','Computer Lab','Science Lab','Library','Playground','Bus Transport','Hostel Facility'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Activity-based and digital learning',
      performance:'High pass percentage in SSC exams',
      achievements:['Best Educational Institution Award','State Rank Holders in SSC'],
      phone:'0884-2376666', email:'info@aditya.ac.in', admission:'Open', rating:4.6, googleMaps:'https://maps.google.com?q=Aditya+School+Kakinada',
      images:['assets/school-1.jpg','assets/school-1a.jpg','assets/school-1b.jpg']
  },
  {id:2,name:'Sri Chaitanya School', address:'Santhi Nagar, Kakinada', board:'SSC', estab:'1986', founder:'B. S. Rao', grades:'LKG – 10', bus:true, hostel:true, features:'Smart Classes, Computer Lab, Library, Playground, Bus Transport, Hostel Facility', reviews:['IIT/NEET focus','Top SSC rankers'],
      description:'School with strong SSC record and competitive exam preparation.',
      facilities:['Smart Classes','Computer Lab','Library','Playground','Bus Transport','Hostel Facility'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Weekly assessments and practice tests',
      performance:'Consistent top state SSC results',
      achievements:['Multiple SSC State Rankers','Olympiad winners'],
      phone:'0884-2358899', email:'info@srichaitanya.net', admission:'Open', rating:4.5, googleMaps:'https://maps.google.com?q=Sri+Chaitanya+School+Kakinada',
      images:['assets/school-2.jpg','assets/school-2a.jpg','assets/school-2b.jpg']
  },
  {id:3,name:'Narayana School', address:'Santhi Nagar, Kakinada', board:'CBSE', estab:'1979', founder:'Dr. P. Narayana', grades:'LKG – 10', bus:true, hostel:false, features:'Digital Classrooms, Computer Lab, Science Lab, Library, Bus Transport', reviews:['Strong competitive prep','Top CBSE results'],
      description:'CBSE school focused on competitive examination readiness.',
      facilities:['Digital Classrooms','Computer Lab','Science Lab','Library','Bus Transport'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Focus on competitive exam preparation and technology-based learning',
      performance:'Top CBSE results in district',
      achievements:['Top CBSE results in district'],
      phone:'0884-2364455', email:'info@narayanaschools.in', admission:'Open', rating:4.4, googleMaps:'https://maps.google.com?q=Narayana+School+Kakinada',
      images:['assets/school-3.jpg','assets/school-3b.jpg','assets/school-3c.jpg']
  },
  {id:4,name:'Lakshya School', address:'ABD Road, Achampeta', board:'CBSE', estab:'2005', founder:'N/A', grades:'Nursery – 10', bus:true, hostel:true, features:'Smart classrooms, Computer Lab, Library, Playground, Bus Transport, Hostel', reviews:['Sports achievers','Personality programs'],
      description:'Well-rounded CBSE school with strong sports & development.',
      facilities:['Smart classrooms','Computer Lab','Library','Playground','Bus Transport','Hostel'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Interactive teaching methods and personality development programs',
      performance:'Strong academic and co-curricular outcomes',
      achievements:['District level sports winners'],
      phone:'0884-2387766', email:'info@lakshyaschool.com', admission:'Open', rating:4.3, googleMaps:'https://maps.google.com?q=Lakshya+School+Kakinada',
      images:['assets/school-4.jpg','assets/school-4a.jpg','assets/school-4b.jpg']
  },
  {id:5,name:'Delhi Public School', address:'Panasapadu, Kakinada', board:'CBSE', estab:'2014', founder:'N/A', grades:'Nursery – 12', bus:true, hostel:false, features:'Digital classrooms, Science and Computer Labs, Library, Sports complex, Bus transport', reviews:['Excellent CBSE results','Strong infrastructure'],
      description:'CBSE school with modern pedagogy and high board performance.',
      facilities:['Digital classrooms','Science and Computer Labs','Library','Sports complex','Bus transport'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'CBSE curriculum with modern teaching techniques',
      performance:'Excellence in CBSE board results',
      achievements:['Excellence in CBSE board results'],
      phone:'0884-2345678', email:'info@dpskakinada.org', admission:'Open', rating:4.6, googleMaps:'https://maps.google.com?q=Delhi+Public+School+Kakinada',
      images:['assets/school-5.jpg','assets/school-5a.jpg','assets/school-5b.jpg']
  },
  {id:6,name:'Bhashyam School', address:'Santhi Nagar, Kakinada', board:'SSC', estab:'1993', founder:'N/A', grades:'LKG – 10', bus:true, hostel:true, features:'Smart classrooms, Computer Lab, Library, Playground, Bus and Hostel', reviews:['SSC focus','High district toppers'],
      description:'Established SSC school with result-oriented approach.',
      facilities:['Smart classrooms','Computer Lab','Library','Playground','Bus and Hostel'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Strong focus on SSC results',
      performance:'Consistent top SSC district results',
      achievements:['SSC district toppers'],
      phone:'0884-2377788', email:'info@bhashyamschools.com', admission:'Open', rating:4.2, googleMaps:'https://maps.google.com?q=Bhashyam+School+Kakinada',
      images:['assets/school-6.jpg','assets/school-6a.jpg','assets/school-6b.jpg']
  },
  {id:7,name:'Ashram Public School', address:'Nagamalli Thota Junction, Kakinada', board:'CBSE', estab:'2001', founder:'N/A', grades:'Nursery – 10', bus:true, hostel:false, features:'Smart classrooms, Computer lab, Library, Playground, Bus transport', reviews:['Activity-based learning','Cultural winners'],
      description:'CBSE school with holistic student development and culture.',
      facilities:['Smart classrooms','Computer lab','Library','Playground','Bus transport'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Activity-based learning',
      performance:'Strong academic and cultural outcomes',
      achievements:['Cultural competition winners'],
      phone:'0884-2356677', email:'info@ashramschool.edu', admission:'Open', rating:4.1, googleMaps:'https://maps.google.com?q=Ashram+Public+School+Kakinada',
      images:['assets/school-7.jpg','assets/school-7a.jpg','assets/school-7b.jpg']
  },
  {id:8,name:'Sri Prakash School', address:'Near D-Mart, Kakinada', board:'CBSE', estab:'2007', founder:'N/A', grades:'Nursery – 10', bus:true, hostel:true, features:'Smart classrooms, Computer lab, Science labs, Library, Bus and Hostel', reviews:['Modern digital pedagogy','Strong CBSE records'],
      description:'CBSE school leveraging digital tools for learning improvements.',
      facilities:['Smart classrooms','Computer lab','Science labs','Library','Bus and Hostel'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Modern teaching with digital tools',
      performance:'Good CBSE exam results',
      achievements:['Good CBSE exam results'],
      phone:'0884-2367788', email:'info@sriprakashschool.com', admission:'Open', rating:4.0, googleMaps:'https://maps.google.com?q=Sri+Prakash+School+Kakinada',
      images:['assets/school-8.jpg','assets/school-8a.jpg','assets/school-8b.jpg']
  },
  {id:9,name:'Sri Agastya School', address:'Postal Colony, Kakinada', board:'CBSE', estab:'2010', founder:'N/A', grades:'Nursery – 10', bus:true, hostel:true, features:'Digital classrooms, Computer lab, Library, Playground, Bus and Hostel', reviews:['Concept-based teaching','Science fair champions'],
      description:'CBSE school focused on concept-based learning and practicals.',
      facilities:['Digital classrooms','Computer lab','Library','Playground','Bus and Hostel'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Concept-based teaching',
      performance:'Strong district science performance',
      achievements:['District science fair winners'],
      phone:'0884-2371122', email:'info@sriagastyaschool.com', admission:'Open', rating:4.0, googleMaps:'https://maps.google.com?q=Sri+Agastya+School+Kakinada',
      images:['assets/school-9.jpg','assets/school-9a.jpg','assets/school-9b.jpg']
  },
  {id:10,name:'Dr KKR Gowtham School', address:'Venkat Nagar, Kakinada', board:'SSC', estab:'2002', founder:'N/A', grades:'LKG – 10', bus:true, hostel:false, features:'Smart classrooms, Computer lab, Library, Playground, Bus transport', reviews:['Strong SSC results','Conceptual learning'],
      description:'SSC school that emphasizes conceptual understanding and exam readiness.',
      facilities:['Smart classrooms','Computer lab','Library','Playground','Bus transport'],
      subjects:['Math','Science','English','Social Studies'],
      methodology:'Focus on conceptual learning',
      performance:'High SSC pass percentage',
      achievements:['SSC high pass percentage'],
      phone:'0884-2389900', email:'info@kkrgowthamschool.com', admission:'Open', rating:4.1, googleMaps:'https://maps.google.com?q=Dr+KKR+Gowtham+School+Kakinada',
      images:['assets/school-10.jpg','assets/school-10a.jpg','assets/school-10b.jpg']
  }
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
  getAuthUserOrRedirect().then(user => {
    if (!user) return;
    const student = getStudents().find(s => s.uid === user.uid || s.email === user.email);
    if (student) document.getElementById('student-name').textContent = student.name || user.email;
    const apps = getApplications().filter(a => a.studentId === user.uid);
    // fill stats
    document.getElementById('total-applied').textContent = apps.length;
    document.getElementById('under-review').textContent = apps.filter(a => getApplicationStatus(a) === 'applied').length;
    document.getElementById('admitted').textContent = apps.filter(a => getApplicationStatus(a) === 'approved').length;
    document.getElementById('enrolled').textContent = apps.filter(a => getApplicationStatus(a) === 'form_submitted' || getApplicationStatus(a) === 'visited').length;
    
    // populate table
    const tbody = document.querySelector('#student-apps-table tbody');
    tbody.innerHTML = '';
    if (apps.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No applications found.</td></tr>';
      return;
    }
    apps.forEach(app => {
      const appStatus = getApplicationStatus(app);
      let statusBadge = `<span class="badge badge-warning px-3 py-2" title="Application sent to school">Applied</span>`;
      if (appStatus === 'approved') statusBadge = `<span class="badge badge-success px-3 py-2" title="School approved your application">Approved</span>`;
      else if (appStatus === 'form_submitted') statusBadge = `<span class="badge badge-info px-3 py-2" title="Waiting for offline visit">Form Submitted</span>`;
      else if (appStatus === 'visited') statusBadge = `<span class="badge badge-primary px-3 py-2" title="Offline formalities completed">Visited</span>`;

      let letterStatus = '<span class="text-muted">Waiting for approval</span>';
      if (appStatus === 'approved') {
        letterStatus = `<button class="btn btn-sm btn-primary" onclick="openJoiningModal(${app.id})">Open Confirmation Letter/Form</button>`;
      } else if (appStatus === 'form_submitted') {
        letterStatus = '<span class="badge badge-info">Form Submitted</span>';
      } else if (appStatus === 'visited') {
        letterStatus = '<span class="badge badge-success">Completed</span>';
      }

      const row = `
        <tr>
          <td>${app.schoolName || '-'}</td>
          <td>${app.class || '-'}</td>
          <td>${app.date || '-'}</td>
          <td>${statusBadge}</td>
          <td>${app.testScore||'-'}</td>
          <td>${letterStatus}</td>
          <td><button class="btn btn-sm btn-outline-primary" onclick="viewAppDetails(${app.id})">View Details</button></td>
        </tr>`;
      tbody.innerHTML += row;
    });
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
  const ok = window.submit_confirmation(window.currentApplicationId, { submittedAt: new Date().toISOString() });
  if (!ok) {
    alert('Could not submit confirmation form.');
    return;
  }
  alert('✅ Confirmation form submitted.\nSchool is notified: Visit Offline Required.');
  $('#confirmationModal').modal('hide');
  window.currentApplicationId = null;
  loadStudentDashboard();
};

// ---------- admin dashboard ----------
function loadAdminDashboard() {
  getAuthUserOrRedirect().then(user => {
    if (!user) return;
    const school = getSchools().find(s => s.uid === user.uid || s.email === user.email);
    const title = document.querySelector('.container-fluid.py-4 h2');
    if (school && title) title.textContent = `School Dashboard - ${school.name}`;
    const admissionLink = document.getElementById('admissionNavLink');
    if (admissionLink) {
      admissionLink.href = `admission.html?schoolId=${encodeURIComponent(user.uid)}`;
    }
    let apps = getApplications().filter(a =>
      a.schoolId === user.uid || (school?.udise && a.schoolUdise === school.udise)
    );

    // update stats cards dynamically
    const total = apps.length;
    const admitted = apps.filter(a => getApplicationStatus(a) === 'approved').length;
    const rejected = apps.filter(a => getApplicationStatus(a) === 'visited').length;
    const pending = apps.filter(a => getApplicationStatus(a) === 'applied').length;
    if (document.getElementById('total-apps')) document.getElementById('total-apps').textContent = total;
    if (document.getElementById('pending-apps')) document.getElementById('pending-apps').textContent = pending;
    if (document.getElementById('admitted-apps')) document.getElementById('admitted-apps').textContent = admitted;
    if (document.getElementById('rejected-apps')) document.getElementById('rejected-apps').textContent = rejected;

    const search = document.getElementById('searchInput');
    if (search) {
      search.addEventListener('keyup', function() {
        const term = this.value.toLowerCase();
        renderSchoolTable(apps.filter(a => (a.studentName || '').toLowerCase().includes(term)));
      });
    }
    renderSchoolTable(apps);
  });
}

function renderSchoolTable(list) {
  const tbody = document.querySelector('#school-table tbody');
  tbody.innerHTML = '';
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No applications found.</td></tr>';
    return;
  }
  list.forEach(a => {
    const appStatus = getApplicationStatus(a);
    let approveBtn = `<button class="btn btn-sm btn-success mr-2" onclick="approveStudent(${a.id})">Approve</button>`;
    if (appStatus === 'approved' || appStatus === 'form_submitted' || appStatus === 'visited') {
      approveBtn = '<span class="badge badge-success">Approved</span>';
    }
    const markVisitedBtn = appStatus === 'form_submitted'
      ? `<button class="btn btn-sm btn-dark mr-2" onclick="markVisited(${a.id})">Mark Visited</button>`
      : '';
    const actions = `
      ${approveBtn}
      ${markVisitedBtn}
      <button class="btn btn-sm btn-info" onclick="viewDetails(${a.id})">View</button>
    `;
    let statusClass = 'badge-warning';
    let statusText = 'Applied';
    if (appStatus === 'approved') { statusClass = 'badge-success'; statusText = 'Approved'; }
    else if (appStatus === 'form_submitted') { statusClass = 'badge-info'; statusText = 'Form Submitted'; }
    else if (appStatus === 'visited') { statusClass = 'badge-primary'; statusText = 'Visited'; }
    const offlineLabel = appStatus === 'form_submitted'
      ? '<span class="badge badge-danger" title="Student must visit school">Visit Offline Required</span>'
      : '-';
    const row = `
      <tr>
        <td>${a.studentName || 'N/A'}</td>
        <td>${a.class}</td>
        <td>${a.date}</td>
        <td>${a.testScore||'-'}</td>
        <td><span class="badge ${statusClass}" title="Current application status">${statusText}</span></td>
        <td>${offlineLabel}</td>
        <td>${actions}</td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

window.approveStudent = function(id) {
  const ok = window.approve_student(id);
  if (!ok) {
    alert('Could not approve application.');
    return;
  }
  alert('✅ Student approved. Student can now open confirmation form.');
  loadAdminDashboard();
};
window.markVisited = function(id) {
  const ok = setApplicationStatus(id, 'visited', { offlineVisitRequired: false });
  if (!ok) {
    alert('Could not update visit status.');
    return;
  }
  alert('✅ Student marked as visited.');
  loadAdminDashboard();
};
window.viewDetails = function(id) {
  alert('📄 Show application details (id ' + id + ')');
};

window.changeStatus = function(id) {
  const options = ['applied', 'approved', 'form_submitted', 'visited'];
  const newStatus = prompt('Enter new application status (one of: ' + options.join(', ') + ')');
  if (newStatus && options.includes(newStatus)) {
    setApplicationStatus(id, newStatus);
    alert('Status updated to ' + newStatus);
    loadAdminDashboard();
  } else if (newStatus) {
    alert('Invalid status entered');
  }
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

function loadProfilePage() {
  if (!document.body.classList.contains('profile-page')) return;
  getAuthUserOrRedirect().then(user => {
    if (!user) return;
    const student = getStudents().find(s => s.uid === user.uid || s.email === user.email) || {};
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const phoneEl = document.getElementById('profilePhone');
    const photoEl = document.getElementById('profilePhoto');
    const form = document.getElementById('profileForm');
    const msg = document.getElementById('profileMsg');
    if (nameEl) nameEl.value = student.name || '';
    if (emailEl) emailEl.value = user.email || student.email || '';
    if (phoneEl) phoneEl.value = student.mobile || '';
    if (photoEl) photoEl.src = student.photo || 'https://via.placeholder.com/140x140.png?text=Profile';
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const ok = window.update_profile(user.uid, {
          uid: user.uid,
          name: nameEl.value.trim(),
          mobile: phoneEl.value.trim()
        });
        if (msg) {
          msg.className = ok ? 'alert alert-success mt-3' : 'alert alert-danger mt-3';
          msg.textContent = ok ? 'Profile updated successfully.' : 'Profile update failed.';
        }
      });
    }
  });
}
if (document.body.classList.contains('profile-page')) {
  document.addEventListener('DOMContentLoaded', loadProfilePage);
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
    sLogin.addEventListener('submit', async e => {
      e.preventDefault();
      const email = root.querySelector('#modal-student-email').value.trim();
      const pwd = root.querySelector('#modal-student-password').value;
      let user = null;
      try {
        if (email.includes('@')) {
          user = await loginStudentFirebase(email, pwd);
        }
      } catch (err) {
        console.warn('Firebase student login failed, trying local login.', err);
      }
      if (!user) {
        user = loginStudent(email, pwd);
      } else {
        upsertStudentProfile({
          uid: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email,
          mobile: '',
          password: ''
        });
      }
      if (user) {
        setCurrentStudent(user.email || email);
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
    sSign.addEventListener('submit', async e => {
      e.preventDefault();
      const student = {
        name: root.querySelector('#modal-s-name').value.trim(),
        email: root.querySelector('#modal-s-email').value.trim(),
        mobile: root.querySelector('#modal-s-mobile').value.trim(),
        password: root.querySelector('#modal-s-password').value
      };
      try {
        const firebaseUser = await registerStudentFirebase(student);
        if (firebaseUser) {
          upsertStudentProfile({ ...student, uid: firebaseUser.uid });
          alert('Student account created! Please login.');
          stoggle.click();
          return;
        }
      } catch (err) {
        if (err && err.code === 'auth/email-already-in-use') {
          alert('That email is already registered. Please login.');
          return;
        }
        console.warn('Firebase student signup failed, trying local signup.', err);
      }
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
    schLogin.addEventListener('submit', async e => {
      e.preventDefault();
      const udise = root.querySelector('#modal-school-udise').value.trim();
      const pwd = root.querySelector('#modal-school-password').value;
      let sch = null;
      try {
        const firebaseUser = await loginSchoolFirebase(udise, pwd);
        if (firebaseUser) {
          sch = getSchools().find(s => s.uid === firebaseUser.uid || s.email === firebaseUser.email) || null;
          if (sch && sch.udise) setCurrentSchool(sch.udise);
        }
      } catch (err) {
        console.warn('Firebase school login failed, trying local login.', err);
      }
      if (!sch) {
        sch = loginSchool(udise, pwd);
      }
      if (sch) {
        setCurrentSchool(sch.udise || udise);
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
    schSign.addEventListener('submit', async e => {
      e.preventDefault();
      const school = {
        name: root.querySelector('#modal-school-name').value.trim(),
        udise: root.querySelector('#modal-school-udise-reg').value.trim(),
        email: root.querySelector('#modal-school-email').value.trim(),
        password: root.querySelector('#modal-school-pass').value
      };
      try {
        const firebaseUser = await registerSchoolFirebase(school);
        if (firebaseUser) {
          upsertSchoolProfile({ ...school, uid: firebaseUser.uid });
          alert('School registered successfully! You can now login.');
          window.location.reload();
          return;
        }
      } catch (err) {
        if (err && err.code === 'auth/email-already-in-use') {
          alert('That school email is already registered. Please login.');
          return;
        }
        console.warn('Firebase school signup failed, trying local signup.', err);
      }
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
  const admissionLink = document.querySelector('a.nav-link[href$="admission.html"], a.nav-link[href$="pages/admission.html"]');
  const profileLink = document.getElementById('profileLink');
  const logoutNavLink = document.getElementById('logoutNavLink');
  // helper to choose correct relative prefix depending on current file location
  const prefix = location.pathname.includes('/pages/') ? '' : 'pages/';
  if (getCurrentStudent()) {
    if (dashLink) dashLink.href = prefix + 'student-dashbord.html';
    if (admissionLink) admissionLink.href = prefix + 'admission.html';
    if (profileLink) profileLink.href = prefix + 'profile.html';
    if (logoutNavLink) {
      logoutNavLink.style.display = '';
      logoutNavLink.onclick = (e) => { e.preventDefault(); logout(); };
    }
    if (loginBtn) {
      loginBtn.textContent = 'Logout';
      loginBtn.onclick = () => { logout(); };
    }
  } else if (getCurrentSchool()) {
    if (dashLink) dashLink.href = prefix + 'school-dashboard.html';
    if (admissionLink) admissionLink.href = prefix + 'admission.html';
    if (profileLink) profileLink.href = prefix + 'profile.html';
    if (logoutNavLink) {
      logoutNavLink.style.display = '';
      logoutNavLink.onclick = (e) => { e.preventDefault(); logoutSchool(); };
    }
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
    if (logoutNavLink) logoutNavLink.style.display = 'none';
    if (profileLink) profileLink.href = '#';
  }
  // re-highlight after modifications
  highlightActiveNav();
}

function getLoginPagePath() {
  return location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
}

// logout helpers
function logout(askConfirmation = true) {
  if (askConfirmation && !confirm('Logout?')) return;
  // clear any stored login data
  localStorage.removeItem('currentStudent');
  localStorage.removeItem('role');
  signOutFirebaseIfReady()
    .catch(() => {})
    .finally(() => {
      updateNavForRole();
      // send user to login page explicitly
      window.location.href = getLoginPagePath();
    });
}
function logoutSchool(askConfirmation = true) {
  if (askConfirmation && !confirm('Logout from School Dashboard?')) return;
  localStorage.removeItem('currentSchool');
  localStorage.removeItem('role');
  signOutFirebaseIfReady()
    .catch(() => {})
    .finally(() => {
      updateNavForRole();
      window.location.href = getLoginPagePath();
    });
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
      window.location.href = getLoginPagePath();
    }
  });
});