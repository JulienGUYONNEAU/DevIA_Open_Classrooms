const filters = document.getElementsByClassName('filters')[0];
const gallery = document.getElementsByClassName('gallery')[0];
const editGallery = document.getElementsByClassName('editGallery')[0];
const addWorkBtn = document.getElementById('addWork');
let buttonsFilters = [];
let worksList = [];
let categoriesList = [];

fetch('http://localhost:5678/api/categories')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur HTTP : ' + response.status);
    }
    return response.json();
  })
  .then(categories => {
    const buttonTous = document.createElement('button');
    buttonTous.innerHTML = `<span>Tous</span>`;
    filters.appendChild(buttonTous);
    buttonTous.classList.add('selected');
    buttonsFilters.push(buttonTous);

    categoriesList = categories;

    categories.forEach(categorie => {
      const buttonCategorie = document.createElement('button');
      buttonCategorie.innerHTML = `<span>${categorie.name}</span>`;
      filters.appendChild(buttonCategorie);
      buttonsFilters.push(buttonCategorie);
    });

    buttonsFilters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        buttonsFilters.forEach(button => button.classList.remove('selected'));
        btn.classList.add('selected');
        const category = e.currentTarget.textContent;
        const worksFiltered = worksList.filter(work => work.category?.name === category);

        if (category === 'Tous') {
          displayGallery(worksList);
        }else{
          displayGallery(worksFiltered);
        }
      });
    });
 });

fetch('http://localhost:5678/api/works')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur HTTP : ' + response.status);
    }
    return response.json();
  })
  .then(works => {

    worksList = works;
    displayGallery(worksList);
    displayEditGallery(worksList);
  });

function displayGallery(works){
  gallery.innerHTML = '';
  works.forEach(work => {
    const divWork = document.createElement('figure');
    divWork.innerHTML = `
      <img src=${work.imageUrl}>
      <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(divWork);
  });
}

function displayEditGallery(works){
  editGallery.innerHTML = '';
  works.forEach(work => {
    const divWork = document.createElement('figure');
    divWork.classList.add('delete-item');
    divWork.innerHTML = `
      <img src=${work.imageUrl}>
      <button class="delete-btn" data-id="${work.id}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    editGallery.appendChild(divWork);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const editBanner = document.getElementById('editBanner');
  const editModal = document.getElementById('editModal');
  const editProjects = document.getElementById('editProjects');
  const closeModal = editModal.querySelector('.close');

  const token = localStorage.getItem('authToken');
  const loginBtn = document.getElementById('loginBtn');
  if (window.location.pathname.endsWith('login.html')) {
    loginBtn.classList.add('current');
  }else{
    loginBtn.classList.remove('current')
  }
  addWorkBtn.onclick = openAddPhotoModal;

  if (token) {
    editBanner.classList.remove('hidden');
    editProjects.classList.remove('hidden');

    loginBtn.textContent = 'logout';
    loginBtn.removeAttribute('href');
    editBanner.classList.remove('hidden');
    body.classList.add('edit-mode');

    loginBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.reload();
    });

  }else{
    editModal.classList.add('hidden');
    editBanner.classList.add('hidden');
    editProjects.classList.add('hidden');
    body.classList.remove('edit-mode');
    loginBtn.textContent = 'login';
    loginBtn.setAttribute('href', 'login.html');
  }

  editProjects.addEventListener('click', () => {
    editModal.classList.remove('hidden');
  })

  closeModal.addEventListener('click', () => {
    editModal.classList.add('hidden');
  })

  editModal.addEventListener('click', (e) => {
    const modalContent = editModal.querySelector('.modalContent');
    if (!modalContent.contains(e.target)) {
      editModal.classList.add('hidden');
    }
  });

});

editGallery.addEventListener('click', async (e) => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      worksList = worksList.filter(w => w.id != id);
      displayGallery(worksList);
      displayEditGallery(worksList);
    } else {
      alert("Erreur lors de la suppression");
    }

  } catch (error) {
    alert("Impossible de contacter le serveur");
  }
});

function openAddPhotoModal(){

  document.querySelector('.editGallery').classList.add('hidden');
  document.querySelector('.addPhoto').classList.remove('hidden');

  const modalTitle = document.querySelector('#editModal h2');
  modalTitle.textContent = 'Ajout photo';
  
  const modalReturn = document.querySelector('.return');
  modalReturn.style.visibility = 'visible';
  modalReturn.onclick = resetModal;

  addWorkBtn.textContent = 'Valider';
  addWorkBtn.disabled = true;


  const modalContent = document.querySelector('.addPhoto');
  modalContent.innerHTML = `
    <form id="addPhotoForm">
      <div class="photoBrowser">
        <span class="photoIcon"><i class="fa-solid fa-image"></i></span>
        <label>
          + Ajouter photo
          <input type="file" id="photo" name="imageUrl" accept="image/*" required>
        </label>
        <h4>jpg, png : 4mo max</h4>
      </div>

      <label for="photoTitle">Titre</label>
      <input type="text" id="photoTitle" name="title" required>

      <label for="photoCategory">Catégorie</label>
      <select id="photoCategory" name="categoryId" required>
        <option value=""></option>
      </select>
    </form>
  `;

  const photoInput = document.getElementById('photo');
  const titleInput = document.getElementById('photoTitle');
  const categoryValue = document.getElementById('photoCategory');
  const photoBrowser = document.querySelector('.photoBrowser');
  let photoOk, titleOk, categoryOk, formOk;
  let titleValue, categoryId;
  photoOk = titleOk = categoryOk = false;

  function checkForm() {
    titleValue = titleInput.value.trim();
    categoryId = categoryValue.value;
    const titleOk = titleValue !== '';
    const categoryOk = categoryId !== '';
    formOk = photoOk && titleOk && categoryOk;
    addWorkBtn.disabled = !formOk;
  }

  photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const MaxSizeImg = 4*1024*1024; //4Mo max
      if (file.size > MaxSizeImg) {
        alert('La photo doit faire 4Mo ou moins.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(event) {

          const existingImg = photoBrowser.querySelector('img');
          if (existingImg) existingImg.remove();

          const img = document.createElement('img');
          img.src = event.target.result;
          img.style.maxHeight = '100%';
          img.style.objectFit = 'contain';
          photoBrowser.innerHTML = '';
          photoBrowser.appendChild(img);
      }
      reader.readAsDataURL(file);
      photoOk = true;
      checkForm();
  });

  document.getElementById('photoTitle').addEventListener('input', checkForm);
  document.getElementById('photoCategory').addEventListener('change', checkForm);

  const select = document.getElementById('photoCategory');
  categoriesList.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });

  const form = document.getElementById('addPhotoForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');

    const formData = new FormData();
    formData.append('image', photoInput.files[0]);
    formData.append('title', titleValue);
    formData.append('category', categoryId);

    try {
      const response = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newWork = await response.json();
        worksList.push(newWork);
        displayGallery(worksList);
        displayEditGallery(worksList);
        resetModal();
      } else {
        alert('Erreur lors de l’ajout de la photo');
      }
    } catch (error) {
      alert('Impossible de contacter le serveur');
    }
  });

  addWorkBtn.onclick = () => {
    if (form.requestSubmit) form.requestSubmit();
    else form.submit();
  };
};

function resetModal() {
  const modalTitle = document.querySelector('#editModal h2');
  modalTitle.textContent = 'Galerie photo';
  const modalReturn = document.querySelector('.return');
  modalReturn.style.visibility = 'hidden';
  const addWorkBtn = document.querySelector('#addWork');
  addWorkBtn.textContent = 'Ajouter une photo';
  addWorkBtn.disabled = false;
  addWorkBtn.onclick = openAddPhotoModal;
  document.querySelector('.editGallery').classList.remove('hidden');
  document.querySelector('.addPhoto').classList.add('hidden');
  displayEditGallery(worksList);
}