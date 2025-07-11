let currentUser = null;
let authToken = null;
let currentSection = 'home';
let currentRequestsTab = 'sent';
let currentLeaderboardTab = 'karma';
let selectedRating = 0;
let isSubmittingRating = false; 
let isSubmittingRequest = false; 

const API_BASE = '/api';
document.addEventListener('DOMContentLoaded', function () {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
    loadHomePageData();
    setupEventListeners();
});

function setupEventListeners() {
    const forms = ['loginForm', 'registerForm', 'editProfileForm', 'requestForm', 'ratingForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
        }
    });
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
    document.getElementById('requestForm').addEventListener('submit', handleSendRequest);
    document.getElementById('ratingForm').addEventListener('submit', handleSubmitRating);
    document.getElementById('searchSkills').addEventListener('input', handleSearch);
    document.getElementById('sortBy').addEventListener('change', handleSearch);
    document.getElementById('filterPremium').addEventListener('change', handleSearch);
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function () {
            selectedRating = parseInt(this.dataset.rating);
            updateStarRating();
        });
    });
    window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
            showSection('home');
            showSuccess('Login successful!');
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const bio = formData.get('bio');
    const skillsToTeach = formData.get('skillsToTeach').split(',').map(s => s.trim()).filter(s => s);
    const skillsToLearn = formData.get('skillsToLearn').split(',').map(s => s.trim()).filter(s => s);
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, password, bio, skillsToTeach, skillsToLearn })
        });
        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForLoggedInUser();
            showSection('home');
            showSuccess('Registration successful! Welcome to SkillSync!');
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Network error. Please try again.');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateUIForLoggedOutUser();
    showSection('home');
    showSuccess('Logged out successfully!');
}
function updateUIForLoggedInUser() {
    document.getElementById('navAuth').style.display = 'none';
    document.getElementById('navUser').style.display = 'flex';
    document.getElementById('userNameNav').textContent = currentUser.name;
    loadProfile();
}

function updateUIForLoggedOutUser() {
    document.getElementById('navAuth').style.display = 'flex';
    document.getElementById('navUser').style.display = 'none';
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    currentSection = sectionName;
    switch (sectionName) {
        case 'browse':
            loadBrowseSection();
            break;
        case 'profile':
            if (currentUser) loadProfile();
            break;
        case 'requests':
            if (currentUser) loadRequests();
            break;
        case 'leaderboard':
            loadLeaderboard();
            break;
    }
}
async function loadHomePageData() {
    try {
        const skillsResponse = await fetch(`${API_BASE}/skills/popular`);
        const skillsData = await skillsResponse.json();
        if (skillsResponse.ok) {
            displayPopularSkills(skillsData.teachableSkills, 'popularSkillsHome');
        }
        const usersResponse = await fetch(`${API_BASE}/users`);
        const usersData = await usersResponse.json();
        if (usersResponse.ok) {
            document.getElementById('totalUsers').textContent = usersData.users.length;
            document.getElementById('totalSkills').textContent = skillsData.teachableSkills.length;
            document.getElementById('totalExchanges').textContent = Math.floor(usersData.users.length * 0.3);
        }
    } catch (error) {
        console.error('Error loading home page data:', error);
    }
}
async function loadBrowseSection() {
    try {
        const skillsResponse = await fetch(`${API_BASE}/skills/popular`);
        const skillsData = await skillsResponse.json();
        if (skillsResponse.ok) {
            displayPopularSkills(skillsData.teachableSkills, 'popularSkillsFilter');
        }
        await handleSearch();
    } catch (error) {
        console.error('Error loading browse section:', error);
    }
}
async function handleSearch() {
    const search = document.getElementById('searchSkills').value;
    const sort = document.getElementById('sortBy').value;
    const premium = document.getElementById('filterPremium').value;
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        if (premium) params.append('premium', premium);
        const response = await fetch(`${API_BASE}/users?${params}`);
        const data = await response.json();
        if (response.ok) {
            displayUsers(data.users);
        }
    } catch (error) {
        console.error('Error searching users:', error);
    }
}

function displayUsers(users) {
    const container = document.getElementById('usersGrid');
    if (users.length === 0) {
        container.innerHTML = '<p class="loading">No users found matching your criteria.</p>';
        return;
    }
    container.innerHTML = users.map(user => `
        <div class="user-card" onclick="showUserModal('${user._id}')">
            <div class="user-info">
                <div class="user-avatar">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <h3>
                        ${user.name}
                        ${user.isPremium ? '<span class="premium-badge">Premium</span>' : ''}
                    </h3>
                    <div class="user-stats">
                        <span>⭐ ${user.averageRating.toFixed(1)}</span>
                        <span>🔥 ${user.skillKarma}</span>
                        <span>📊 ${user.totalRatings} ratings</span>
                    </div>
                </div>
            </div>
            <div class="user-skills">
                <h4>Can teach:</h4>
                <div class="skill-tags">
                    ${user.skillsToTeach.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    ${user.skillsToTeach.length > 3 ? `<span class="skill-tag">+${user.skillsToTeach.length - 3} more</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function displayPopularSkills(skills, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = skills.map(skill => `
        <span class="skill-tag" onclick="filterBySkill('${skill.skill}')">${skill.skill}</span>
    `).join('');
}

function filterBySkill(skill) {
    if (currentSection === 'browse') {
        document.getElementById('searchSkills').value = skill;
        handleSearch();
    }
}

async function showUserModal(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`);
        const data = await response.json();
        if (!response.ok) return;
        const user = data.user;
        const ratingsResponse = await fetch(`${API_BASE}/ratings/user/${userId}`);
        const ratingsData = await ratingsResponse.json();
        document.getElementById('userModalBody').innerHTML = `
            <div class="user-profile">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="profile-info">
                        <h2>
                            ${user.name}
                            ${user.isPremium ? '<span class="premium-badge">Premium</span>' : ''}
                        </h2>
                        <p>${user.bio || 'No bio available'}</p>
                        <div class="profile-stats">
                            <div class="stat">
                                <span class="stat-value">${user.skillKarma}</span>
                                <span class="stat-label">Skill Karma</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${user.averageRating.toFixed(1)}</span>
                                <span class="stat-label">Average Rating</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${user.totalRatings}</span>
                                <span class="stat-label">Total Ratings</span>
                            </div>
                        </div>
                    </div>
                    ${currentUser && currentUser.id !== user._id ? `
                        <button class="btn btn-primary" onclick="showRequestModal('${user._id}')">
                            Request Skill
                        </button>
                    ` : ''}
                </div>  
                <div class="profile-skills">
                    <div class="skills-section">
                        <h3>Can Teach</h3>
                        <div class="skill-tags">
                            ${user.skillsToTeach.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                    <div class="skills-section">
                        <h3>Wants to Learn</h3>
                        <div class="skill-tags">
                            ${user.skillsToLearn.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>
                ${ratingsData.ratings && ratingsData.ratings.length > 0 ? `
                    <div class="profile-ratings">
                        <h3>Recent Ratings</h3>
                        <div class="ratings-list">
                            ${ratingsData.ratings.map(rating => `
                                <div class="rating-item">
                                    <div class="rating-header">
                                        <div>
                                            <span class="rating-stars">${'★'.repeat(rating.rating)}</span>
                                            <span class="rating-skill">${rating.skill}</span>
                                        </div>
                                        <span class="rating-date">${new Date(rating.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p>${rating.comment}</p>
                                    <small>by ${rating.rater.name}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('userModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading user modal:', error);
    }
}

function showRequestModal(teacherId) {
    if (!currentUser) {
        showError('Please login to send requests');
        return;
    }
    isSubmittingRequest = false;
    fetch(`${API_BASE}/users/${teacherId}`)
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                const skillSelect = document.getElementById('requestSkill');
                skillSelect.innerHTML = data.user.skillsToTeach.map(skill =>
                    `<option value="${skill}">${skill}</option>`
                ).join('');

                document.getElementById('requestTeacherId').value = teacherId;
                document.getElementById('requestModal').style.display = 'block';
            }
        })
        .catch(error => console.error('Error loading teacher skills:', error));
}

async function handleSendRequest(e) {
    e.preventDefault();
    if (isSubmittingRequest) {
        return;
    }
    isSubmittingRequest = true;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
    }
    const teacherId = document.getElementById('requestTeacherId').value;
    const skillRequested = document.getElementById('requestSkill').value;
    const skillOffered = document.getElementById('requestOffered').value;
    const message = document.getElementById('requestMessage').value;
    try {
        const response = await fetch(`${API_BASE}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ teacherId, skillRequested, skillOffered, message })
        });
        const data = await response.json();
        if (response.ok) {
            showSuccess('Request sent successfully!');
            closeModal('requestModal');
            closeModal('userModal');
            e.target.reset();
            loadRequests();
        } else {
            if (data.requiresPremium) {
                showPremiumRequiredModal(data.error);
                closeModal('requestModal');
                closeModal('userModal');
            } else {
                showError(data.error || 'Failed to send request');
            }
        }
    } catch (err) {
        console.error('Error sending request:', err);
        showError('Network error. Please try again.');
    } finally {
        isSubmittingRequest = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Request';
        }
    }
}

async function loadProfile() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('Loaded User Data:', currentUser);
            document.getElementById('profileName').textContent = currentUser.name;
            document.getElementById('profileBio').textContent = currentUser.bio || 'No bio available';
            document.getElementById('profilePhone').textContent = currentUser.phone ? `Phone: ${currentUser.phone}` : 'Phone: Not provided';
            document.getElementById('profileKarma').textContent = currentUser.skillKarma;
            document.getElementById("profileAvatar").textContent = currentUser.name?.charAt(0).toUpperCase() || '';
            document.getElementById('profileRating').textContent = currentUser.averageRating.toFixed(1);
            document.getElementById('profileTotalRatings').textContent = currentUser.totalRatings;
            const planNames = {
                'free': 'Free Plan',
                'monthly': 'Monthly Plan ($9.99/month)',
                'yearly': 'Yearly Plan ($99.99/year)'
            };

            document.getElementById('currentPlan').textContent = planNames[currentUser.subscriptionPlan] || 'Free Plan';
            const statusElement = document.getElementById('planStatus');
            if (currentUser.isPremium) {
                statusElement.textContent = 'Active';
                statusElement.style.color = 'var(--success)';
            } else {
                statusElement.textContent = 'Active';
                statusElement.style.color = 'var(--text-light)';
            }
            const teachSkills = currentUser.skillsToTeach || [];
            const learnSkills = currentUser.skillsToLearn || [];
            document.getElementById('profileSkillsTeach').innerHTML =
                teachSkills.length
                    ? teachSkills.map(skill => `<span class="skill-tag ${isPremiumSkill(skill) ? 'premium' : ''}">${skill}</span>`).join('')
                    : '<p>No skills added yet</p>';
            document.getElementById('profileSkillsLearn').innerHTML =
                learnSkills.length
                    ? learnSkills.map(skill => `<span class="skill-tag ${isPremiumSkill(skill) ? 'premium' : ''}">${skill}</span>`).join('')
                    : '<p>No skills added yet</p>';
            const ratingsResponse = await fetch(`${API_BASE}/ratings/user/${currentUser.id}`);
            const ratingsData = await ratingsResponse.json();
            if (ratingsResponse.ok && ratingsData.ratings) {
                document.getElementById('profileRatings').innerHTML = ratingsData.ratings.map(rating => `
                    <div class="rating-item">
                        <div class="rating-header">
                            <div>
                                <span class="rating-stars">${'★'.repeat(rating.rating)}</span>
                                <span class="rating-skill ${isPremiumSkill(rating.skill) ? 'premium' : ''}">${rating.skill}</span>
                            </div>
                            <span class="rating-date">${new Date(rating.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p>${rating.comment}</p>
                        <small>by ${rating.rater.name}</small>
                    </div>
                `).join('');
            }
        } else {
            console.error('Failed to load user:', data.error);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function showEditProfile() {
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editSkillsTeach').value = currentUser.skillsToTeach.join(', ');
    document.getElementById('editSkillsLearn').value = currentUser.skillsToLearn.join(', ');
    document.getElementById('editProfileModal').style.display = 'block';
}

async function handleEditProfile(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const bio = formData.get('bio');
    const skillsToTeach = formData.get('skillsToTeach').split(',').map(s => s.trim()).filter(s => s);
    const skillsToLearn = formData.get('skillsToLearn').split(',').map(s => s.trim()).filter(s => s);
    try {
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, phone, bio, skillsToTeach, skillsToLearn })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showSuccess('Profile updated successfully!');
            closeModal('editProfileModal');
            loadProfile();
        } else {
            showError(data.error || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Network error. Please try again.');
    }
}

async function loadRequests() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_BASE}/requests/my`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await response.json();
        if (response.ok) displayRequests(data);
        else showError(data.error || 'Failed to load requests');
    } catch (err) {
        console.error('Error loading requests:', err);
        showError('Network error. Please try again.');
    }
}

function showRequests(evt, tab) {
    if (currentRequestsTab === tab && evt) return;
    currentRequestsTab = tab;
    document.querySelectorAll('.requests-tabs .tab-btn')
        .forEach(btn => btn.classList.remove('active'));
    if (evt?.target) evt.target.classList.add('active');
    else document.querySelector(`.tab-btn[data-tab="${tab}"]`)?.classList.add('active');
    loadRequests();
}

function displayRequests(data) {
    const container = document.getElementById('requestsList');
    const requests = currentRequestsTab === 'sent' ? data.sentRequests : data.receivedRequests;
    if (!requests || requests.length === 0) {
        container.innerHTML = '<p class="loading">No requests found.</p>';
        return;
    }
    container.innerHTML = requests.map(r => {
        const other = currentRequestsTab === 'sent' ? r.teacher : r.requester;
        const isRec = currentRequestsTab === 'received';
        return `
      <div class="request-item">
        <div class="request-header">
          <div class="request-skill">${r.skillRequested}</div>
          <div class="request-status status-${r.status}">${r.status}</div>
        </div>
        <div class="request-info">
          <p><strong>${isRec ? 'From' : 'To'}:</strong> ${other.name}</p>
          ${r.skillOffered ? `<p><strong>Offered in return:</strong> ${r.skillOffered}</p>` : ''}
          ${r.message ? `<p><strong>Message:</strong> ${r.message}</p>` : ''}
          <p><strong>Date:</strong> ${new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="request-actions">
          ${isRec && r.status === 'pending' ? `
            <button class="btn btn-primary" onclick="updateRequestStatus('${r._id}', 'accepted')">Accept</button>
            <button class="btn btn-outline" onclick="updateRequestStatus('${r._id}', 'declined')">Decline</button>` : ''}
          ${!isRec && r.status === 'accepted' ? `
            <button class="btn btn-primary" onclick="updateRequestStatus('${r._id}', 'completed')">Mark Complete</button>` : ''}
          ${r.status === 'completed' && !isRec ? `
            <button class="btn btn-outline" onclick="showRatingModal('${r._id}', '${other._id}', '${r.skillRequested}')">Rate Teacher</button>` : ''}
          ${r.status === 'completed' && isRec ? `
            <button class="btn btn-outline" onclick="showRatingModal('${r._id}', '${other._id}', '${r.skillRequested}')">Rate Student</button>` : ''}
        </div>
      </div>`;
    }).join('');
}

async function updateRequestStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE}/requests/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (response.ok) {
            showSuccess(`Request ${status} successfully!`);
            loadRequests();
        } else showError(data.error || 'Failed to update request');
    } catch (err) {
        console.error('Error updating request:', err);
        showError('Network error. Please try again.');
    }
}
function showRatingModal(requestId, rateeId, skill) {
    isSubmittingRating = false;
    document.getElementById('ratingRequestId').value = requestId;
    document.getElementById('ratingRateeId').value = rateeId;
    document.getElementById('ratingSkill').value = skill;
    selectedRating = 0;
    updateStarRating();
    document.getElementById('ratingModal').style.display = 'block';
}

function updateStarRating() {
    document.querySelectorAll('.star').forEach((star, index) => {
        star.classList.toggle('active', index < selectedRating);
    });
}

async function handleSubmitRating(e) {
    e.preventDefault();
    if (isSubmittingRating) {
        return;
    }   
    isSubmittingRating = true;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }
    if (selectedRating === 0) {
        showError('Please select a rating');
        isSubmittingRating = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Rating';
        }
        return;
    }

    const requestId = document.getElementById('ratingRequestId').value;
    const rateeId = document.getElementById('ratingRateeId').value;
    const skill = document.getElementById('ratingSkill').value;
    const comment = document.getElementById('ratingComment').value;
    try {
        const response = await fetch(`${API_BASE}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ rateeId, requestId, rating: selectedRating, comment, skill })
        });
        const data = await response.json();
        if (response.ok) {
            showSuccess('Rating submitted successfully!');
            closeModal('ratingModal');
            loadRequests();
            e.target.reset();
            selectedRating = 0;
            updateStarRating();
        } else {
            showError(data.error || 'Failed to submit rating');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        showError('Network error. Please try again.');
    } finally {
        isSubmittingRating = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Rating';
        }
    }
}

async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/users/leaderboard/top`);
        const data = await response.json();
        if (response.ok) {
            displayLeaderboard(data);
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function showLeaderboard(tab) {
    currentLeaderboardTab = tab;
    document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    loadLeaderboard();
}

function displayLeaderboard(data) {
    const container = document.getElementById('leaderboardList');
    const users = currentLeaderboardTab === 'karma' ? data.topKarma : data.topRated;
    if (users.length === 0) {
        container.innerHTML = '<p class="loading">No data available.</p>';
        return;
    }
    container.innerHTML = users.map((user, index) => `
        <div class="leaderboard-item">
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-avatar">
                ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">
                    ${user.name}
                    ${user.isPremium ? '<span class="premium-badge">Premium</span>' : ''}
                </div>
                <div class="leaderboard-stats">
                    <span>⭐ ${user.averageRating.toFixed(1)}</span>
                    <span>🔥 ${user.skillKarma}</span>
                    <span>📊 ${user.totalRatings} ratings</span>
                </div>
            </div>
        </div>
    `).join('');
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showError(message) {
    document.querySelectorAll('.error, .success').forEach(el => el.remove());
    const alert = document.createElement('div');
    alert.className = 'error';
    alert.textContent = message;
    const main = document.querySelector('.main-content');
    main.insertBefore(alert, main.firstChild);
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showSuccess(message) {
    document.querySelectorAll('.error, .success').forEach(el => el.remove());
    const alert = document.createElement('div');
    alert.className = 'success';
    alert.textContent = message;
    const main = document.querySelector('.main-content');
    main.insertBefore(alert, main.firstChild);
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

window.showSection = showSection;
window.showUserModal = showUserModal;
window.showRequestModal = showRequestModal;
window.showEditProfile = showEditProfile;
window.showRatingModal = showRatingModal;
window.showRequests = showRequests;
window.showLeaderboard = showLeaderboard;
window.updateRequestStatus = updateRequestStatus;
window.closeModal = closeModal;
window.logout = logout;
window.filterBySkill = filterBySkill;
const PREMIUM_SKILLS = [
    'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Cloud Computing',
    'DevOps', 'Cybersecurity', 'Full-Stack Development', 'Mobile App Development',
    'Advanced Analytics', 'Deep Learning', 'Neural Networks', 'Computer Vision',
    'Natural Language Processing', 'Big Data', 'Kubernetes', 'Docker',
    'Advanced Python', 'Advanced JavaScript', 'System Design'
];

function isPremiumSkill(skill) {
    return PREMIUM_SKILLS.some(premiumSkill =>
        skill.toLowerCase().includes(premiumSkill.toLowerCase()) ||
        premiumSkill.toLowerCase().includes(skill.toLowerCase())
    );
}
async function showSubscriptionModal() {
    try {
        const response = await fetch(`${API_BASE}/users/subscription/plans`);
        const data = await response.json();
        if (response.ok) {
            updateSubscriptionModal(data.plans);
            document.getElementById('subscriptionModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading subscription plans:', error);
    }
}

function updateSubscriptionModal(plans) {
    const currentPlan = currentUser?.subscriptionPlan || 'free';
    document.querySelectorAll('.plan-card .btn').forEach((btn, index) => {
        const planTypes = ['free', 'monthly', 'yearly'];
        const planType = planTypes[index];
        if (planType === currentPlan) {
            btn.textContent = 'Current Plan';
            btn.className = 'btn btn-outline';
            btn.disabled = true;
        } else {
            btn.textContent = planType === 'free' ? 'Downgrade' : 'Subscribe';
            btn.className = 'btn btn-primary';
            btn.disabled = false;
        }
    });
}

async function subscribeToPlan(plan) {
    if (!currentUser) {
        showError('Please login to subscribe');
        return;
    }
    try {
        const response = await fetch(`${API_BASE}/users/subscription/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ plan })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser.subscriptionPlan = data.user.subscriptionPlan;
            currentUser.subscriptionExpiry = data.user.subscriptionExpiry;
            currentUser.isPremium = data.user.isPremium;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showSuccess(data.message);
            closeModal('subscriptionModal');
            loadProfile(); 
        } else {
            showError(data.error || 'Subscription failed');
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showError('Network error. Please try again.');
    }
}

function showPremiumRequiredModal(message) {
    document.getElementById('premiumRequiredMessage').textContent = message;
    document.getElementById('premiumRequiredModal').style.display = 'block';
}
window.showSubscriptionModal = showSubscriptionModal;
window.subscribeToPlan = subscribeToPlan;
window.showPremiumRequiredModal = showPremiumRequiredModal;
