// Fonction pour générer le contenu dynamique
function generateSessions(data) {
  const sessionsContainer = document.querySelector('.js-sessions-container');

  // Charger les statuts des sessions depuis le localStorage
  const storedSessions = JSON.parse(localStorage.getItem('sessions')) || [];

  data.sessions.forEach(session => {
    const status = getSessionStatus(session);
    const sessionCard = document.createElement('div');
    sessionCard.classList.add('bg-white', 'rounded-2xl', 'shadow-sm', 'border', 'border-gray-100', 'overflow-hidden');

    // Créer le header de la session
    const header = document.createElement('div');
    header.classList.add('p-6', 'cursor-pointer', 'js-accordion-header');
    header.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-1">Semaine ${session.week}</h2>
          <p class="text-sm text-gray-500">${formatDateRange(session.start_date, session.end_date)}</p>
        </div>
        <div class="bg-${getStatusValue(status).color}-100 px-2 py-1 rounded-full">
          <span class="text-xs text-${getStatusValue(status).color}-600 font-medium">${getStatusValue(status).label}</span>
        </div>
      </div>
    `;

    // Créer le contenu caché de la session
    const content = document.createElement('div');
    content.classList.add('px-6', 'pb-6', 'space-y-4', 'js-accordion-content');

    // Vérifier le statut et ajouter la classe 'hidden' uniquement si ce n'est pas 'in-progress'
    if (status !== 'in-progress') {
      content.classList.add('hidden', 'opacity-60', 'pointer-events-none');
    }

    // Si la session a des activités, ajouter les activités
    if (session.activities.length > 0) {
      session.activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.classList.add('flex', 'items-center', 'justify-between');
        activityItem.innerHTML = `
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <span class="text-gray-600 font-medium">${activity.day.charAt(0)}</span>
            </div>
            <div>
              <h3 class="font-medium">${activity.day}</h3>
              <p class="text-sm text-gray-500">${activity.distance_km} km</p>
            </div>
          </div>
          <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600" ${getActivityStatus(session.week, activity.day) ? 'checked' : ''}>
        `;

        // Ajouter un gestionnaire d'événement pour changer l'état du checkbox
        const checkbox = activityItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (event) => {
          // Enregistrer l'état de l'activité dans localStorage
          activity.completed = event.target.checked;

          // Sauvegarder l'état de l'activité spécifique dans la session
          saveSessionStatus(session, activity);
        });

        content.appendChild(activityItem);
      });
    } else {
      const noActivityMessage = document.createElement('p');
      noActivityMessage.classList.add('text-sm');
      noActivityMessage.textContent = 'Aucune session enregistrée pour cette semaine.';
      content.appendChild(noActivityMessage);
    }

    // Ajouter le header et le contenu à la carte de la session
    sessionCard.appendChild(header);
    sessionCard.appendChild(content);

    // Ajouter la carte au conteneur
    sessionsContainer.appendChild(sessionCard);

    // Gérer l'accordéon (affichage du contenu au clic)
    header.addEventListener('click', () => {
      content.classList.toggle('hidden');
    });
  });
}

// Fonction pour obtenir le statut de l'activité à partir du localStorage
function getActivityStatus(week, day) {
  const storedSessions = JSON.parse(localStorage.getItem('sessions')) || [];
  const session = storedSessions.find(s => s.week === week);

  if (session) {
    const activity = session.activities.find(a => a.day === day);
    return activity ? activity.completed : false;
  }

  return false;
}

// Fonction pour sauvegarder le statut de l'activité dans localStorage
function saveSessionStatus(session, activity) {
  const sessionData = JSON.parse(localStorage.getItem('sessions')) || [];

  // Chercher si la session est déjà enregistrée
  const existingSessionIndex = sessionData.findIndex(s => s.week === session.week);

  if (existingSessionIndex !== -1) {
    // Chercher l'activité correspondante dans la session
    const existingActivityIndex = sessionData[existingSessionIndex].activities.findIndex(a => a.day === activity.day);

    if (existingActivityIndex !== -1) {
      // Mettre à jour l'état de l'activité
      sessionData[existingSessionIndex].activities[existingActivityIndex].completed = activity.completed;
    }
  }

  // Sauvegarder les données dans localStorage
  localStorage.setItem('sessions', JSON.stringify(sessionData));
}

// Fonction pour formater la date au format "9 févr. - 15 févr. 2025"
function formatDateRange(startDate, endDate) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString('fr-FR', options).replace('.', '');
  const endFormatted = end.toLocaleDateString('fr-FR', options).replace('.', '');

  return `${startFormatted.slice(0, -5)} - ${endFormatted}`;
}

// Fonction pour déterminer le statut de la semaine
function getSessionStatus(session) {
  const currentDate = new Date();
  const startDate = new Date(session.start_date);
  const endDate = new Date(session.end_date);

  // Vérifier si la semaine est passée
  if (currentDate > endDate) {
    // Semaine passée, vérifier les activités
    const completedActivities = session.activities.filter(activity => activity.completed).length;
    if (completedActivities === session.activities.length) {
      return 'completed'; // Toutes les activités sont complètes
    } else {
      return 'incomplete'; // Certaines activités sont incomplètes
    }
  }

  // Vérifier si la semaine est en cours
  if (currentDate >= startDate && currentDate <= endDate) {
    return 'in-progress'; // Semaine en cours
  }

  // Sinon, la semaine est à venir
  return 'upcoming';
}

// Fonction pour obtenir la couleur et le label en fonction du statut
function getStatusValue(status) {
  switch (status) {
    case 'completed':
      return { color: 'green', label: 'Complété' };
    case 'in-progress':
      return { color: 'blue', label: 'En cours' };
    case 'incomplete':
      return { color: 'red', label: 'Incomplet' };
    case 'upcoming':
      return { color: 'orange', label: 'À venir' };
    default:
      return { color: 'gray', label: 'Inconnu' };
  }
}

// Fonction pour récupérer les données depuis le fichier JSON
function loadData() {
  fetch('data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du fichier JSON');
      }
      return response.json();
    })
    .then(data => {
      generateSessions(data);
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
}

// Initialisation des fonctionnalités
document.addEventListener('DOMContentLoaded', () => {
  loadData();
});
