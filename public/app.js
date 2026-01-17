// Состояние приложения
const state = {
    currentSection: 'schedule',
    groups: [],
    teachers: [],
    subjects: [],
    classrooms: [],
    schedule: []
};

// API URL
// Используем относительный путь, чтобы он работал и локально, и на хостинге
const API_URL = '/api';

// Утилиты
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadAllData();
    initEventListeners();
});

// Навигация
function initNavigation() {
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(section) {
    // Обновляем навигацию
    $$('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    // Обновляем секции
    $$('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `${section}-section`);
    });
    
    state.currentSection = section;
    
    // Загружаем данные для текущей секции
    switch(section) {
        case 'schedule':
            loadSchedule();
            break;
        case 'groups':
            loadGroups();
            break;
        case 'teachers':
            loadTeachers();
            break;
        case 'subjects':
            loadSubjects();
            break;
        case 'classrooms':
            loadClassrooms();
            break;
    }
}

// Загрузка всех данных
async function loadAllData() {
    await Promise.all([
        loadGroups(),
        loadTeachers(),
        loadSubjects(),
        loadClassrooms()
    ]);
    loadSchedule();
}

// Event Listeners
function initEventListeners() {
    // Модальное окно
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
    
    // Фильтры расписания
    $('#group-filter').addEventListener('change', loadSchedule);
    $('#day-filter').addEventListener('change', loadSchedule);
    
    // Кнопки добавления
    $('#add-schedule-btn').addEventListener('click', () => openScheduleModal());
    $('#add-group-btn').addEventListener('click', () => openGroupModal());
    $('#add-teacher-btn').addEventListener('click', () => openTeacherModal());
    $('#add-subject-btn').addEventListener('click', () => openSubjectModal());
    $('#add-classroom-btn').addEventListener('click', () => openClassroomModal());
}

// === РАСПИСАНИЕ ===
async function loadSchedule() {
    const groupId = $('#group-filter').value;
    const dayOfWeek = $('#day-filter').value;
    
    let url = `${API_URL}/schedule`;
    const params = new URLSearchParams();
    if (groupId) params.append('group_id', groupId);
    if (dayOfWeek) params.append('day_of_week', dayOfWeek);
    if (params.toString()) url += '?' + params.toString();
    
    try {
        const response = await fetch(url);
        state.schedule = await response.json();
        renderSchedule();
    } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
    }
}

function renderSchedule() {
    const container = $('#schedule-grid');
    
    if (state.schedule.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <p>Расписание не найдено</p>
            </div>
        `;
        return;
    }
    
    // Группировка по дням
    const scheduleByDay = {};
    const daysOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    
    state.schedule.forEach(lesson => {
        if (!scheduleByDay[lesson.day_of_week]) {
            scheduleByDay[lesson.day_of_week] = [];
        }
        scheduleByDay[lesson.day_of_week].push(lesson);
    });
    
    let html = '';
    daysOrder.forEach(day => {
        if (scheduleByDay[day]) {
            const lessons = scheduleByDay[day].sort((a, b) => a.lesson_number - b.lesson_number);
            html += `
                <div class="schedule-day">
                    <div class="day-header">${day}</div>
                    <div class="schedule-lessons">
            `;
            
            lessons.forEach(lesson => {
                html += `
                    <div class="lesson-card">
                        <div class="lesson-info">
                            <div class="lesson-number">${lesson.lesson_number}</div>
                            <div class="lesson-details">
                                <div class="lesson-subject">${lesson.subject_name}</div>
                                <div class="lesson-meta">
                                    <span>Группа: ${lesson.group_name}</span>
                                    <span>Преподаватель: ${lesson.teacher_name}</span>
                                    <span>Аудитория: ${lesson.classroom_number}</span>
                                </div>
                            </div>
                        </div>
                        <div class="lesson-actions">
                            <button class="btn btn-sm btn-secondary" onclick="editScheduleItem(${lesson.id})">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteScheduleItem(${lesson.id})">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

function openScheduleModal(scheduleId = null) {
    const isEdit = scheduleId !== null;
    const schedule = isEdit ? state.schedule.find(s => s.id === scheduleId) : null;
    
    $('#modal-title').textContent = isEdit ? 'Редактировать занятие' : 'Добавить занятие';
    $('#modal-body').innerHTML = `
        <form id="schedule-form">
            <div class="form-group">
                <label class="form-label">Группа</label>
                <select class="form-select" name="group_id" required>
                    <option value="">Выберите группу</option>
                    ${state.groups.map(g => `
                        <option value="${g.id}" ${schedule?.group_id === g.id ? 'selected' : ''}>${g.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Дисциплина</label>
                <select class="form-select" name="subject_id" required>
                    <option value="">Выберите дисциплину</option>
                    ${state.subjects.map(s => `
                        <option value="${s.id}" ${schedule?.subject_id === s.id ? 'selected' : ''}>${s.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Преподаватель</label>
                <select class="form-select" name="teacher_id" required>
                    <option value="">Выберите преподавателя</option>
                    ${state.teachers.map(t => `
                        <option value="${t.id}" ${schedule?.teacher_id === t.id ? 'selected' : ''}>${t.full_name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Аудитория</label>
                <select class="form-select" name="classroom_id" required>
                    <option value="">Выберите аудиторию</option>
                    ${state.classrooms.map(c => `
                        <option value="${c.id}" ${schedule?.classroom_id === c.id ? 'selected' : ''}>${c.room_number}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">День недели</label>
                <select class="form-select" name="day_of_week" required>
                    <option value="">Выберите день</option>
                    <option value="Понедельник" ${schedule?.day_of_week === 'Понедельник' ? 'selected' : ''}>Понедельник</option>
                    <option value="Вторник" ${schedule?.day_of_week === 'Вторник' ? 'selected' : ''}>Вторник</option>
                    <option value="Среда" ${schedule?.day_of_week === 'Среда' ? 'selected' : ''}>Среда</option>
                    <option value="Четверг" ${schedule?.day_of_week === 'Четверг' ? 'selected' : ''}>Четверг</option>
                    <option value="Пятница" ${schedule?.day_of_week === 'Пятница' ? 'selected' : ''}>Пятница</option>
                    <option value="Суббота" ${schedule?.day_of_week === 'Суббота' ? 'selected' : ''}>Суббота</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Номер пары</label>
                <select class="form-select" name="lesson_number" required>
                    <option value="">Выберите номер пары</option>
                    ${[1,2,3,4,5,6,7,8].map(n => `
                        <option value="${n}" ${schedule?.lesson_number === n ? 'selected' : ''}>${n} пара</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
    
    $('#schedule-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/schedule/${scheduleId}` : `${API_URL}/schedule`;
            
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            closeModal();
            loadSchedule();
        } catch (error) {
            console.error('Ошибка сохранения занятия:', error);
            alert('Ошибка сохранения занятия. Возможно, это время уже занято.');
        }
    });
    
    openModal();
}

window.editScheduleItem = (id) => openScheduleModal(id);

window.deleteScheduleItem = async (id) => {
    if (!confirm('Удалить это занятие?')) return;
    
    try {
        await fetch(`${API_URL}/schedule/${id}`, { method: 'DELETE' });
        loadSchedule();
    } catch (error) {
        console.error('Ошибка удаления занятия:', error);
    }
};

// === ГРУППЫ ===
async function loadGroups() {
    try {
        const response = await fetch(`${API_URL}/groups`);
        state.groups = await response.json();
        renderGroups();
        updateGroupFilter();
    } catch (error) {
        console.error('Ошибка загрузки групп:', error);
    }
}

function renderGroups() {
    const container = $('#groups-table');
    
    if (state.groups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Группы не найдены</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Название группы</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${state.groups.map(group => `
                    <tr>
                        <td>${group.id}</td>
                        <td>${group.name}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn btn-sm btn-secondary" onclick="editGroup(${group.id})">Изменить</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteGroup(${group.id})">Удалить</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateGroupFilter() {
    const filter = $('#group-filter');
    const currentValue = filter.value;
    filter.innerHTML = `
        <option value="">Все группы</option>
        ${state.groups.map(g => `
            <option value="${g.id}" ${currentValue == g.id ? 'selected' : ''}>${g.name}</option>
        `).join('')}
    `;
}

function openGroupModal(groupId = null) {
    const isEdit = groupId !== null;
    const group = isEdit ? state.groups.find(g => g.id === groupId) : null;
    
    $('#modal-title').textContent = isEdit ? 'Редактировать группу' : 'Добавить группу';
    $('#modal-body').innerHTML = `
        <form id="group-form">
            <div class="form-group">
                <label class="form-label">Название группы</label>
                <input type="text" class="form-input" name="name" value="${group?.name || ''}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
    
    $('#group-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/groups/${groupId}` : `${API_URL}/groups`;
            
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            closeModal();
            loadGroups();
        } catch (error) {
            console.error('Ошибка сохранения группы:', error);
        }
    });
    
    openModal();
}

window.editGroup = (id) => openGroupModal(id);

window.deleteGroup = async (id) => {
    if (!confirm('Удалить эту группу? Все связанные занятия также будут удалены.')) return;
    
    try {
        await fetch(`${API_URL}/groups/${id}`, { method: 'DELETE' });
        loadGroups();
    } catch (error) {
        console.error('Ошибка удаления группы:', error);
    }
};

// === ПРЕПОДАВАТЕЛИ ===
async function loadTeachers() {
    try {
        const response = await fetch(`${API_URL}/teachers`);
        state.teachers = await response.json();
        renderTeachers();
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
    }
}

function renderTeachers() {
    const container = $('#teachers-table');
    
    if (state.teachers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Преподаватели не найдены</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>ФИО</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${state.teachers.map(teacher => `
                    <tr>
                        <td>${teacher.id}</td>
                        <td>${teacher.full_name}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn btn-sm btn-secondary" onclick="editTeacher(${teacher.id})">Изменить</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteTeacher(${teacher.id})">Удалить</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openTeacherModal(teacherId = null) {
    const isEdit = teacherId !== null;
    const teacher = isEdit ? state.teachers.find(t => t.id === teacherId) : null;
    
    $('#modal-title').textContent = isEdit ? 'Редактировать преподавателя' : 'Добавить преподавателя';
    $('#modal-body').innerHTML = `
        <form id="teacher-form">
            <div class="form-group">
                <label class="form-label">ФИО преподавателя</label>
                <input type="text" class="form-input" name="full_name" value="${teacher?.full_name || ''}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
    
    $('#teacher-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/teachers/${teacherId}` : `${API_URL}/teachers`;
            
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            closeModal();
            loadTeachers();
        } catch (error) {
            console.error('Ошибка сохранения преподавателя:', error);
        }
    });
    
    openModal();
}

window.editTeacher = (id) => openTeacherModal(id);

window.deleteTeacher = async (id) => {
    if (!confirm('Удалить этого преподавателя? Все связанные занятия также будут удалены.')) return;
    
    try {
        await fetch(`${API_URL}/teachers/${id}`, { method: 'DELETE' });
        loadTeachers();
    } catch (error) {
        console.error('Ошибка удаления преподавателя:', error);
    }
};

// === ДИСЦИПЛИНЫ ===
async function loadSubjects() {
    try {
        const response = await fetch(`${API_URL}/subjects`);
        state.subjects = await response.json();
        renderSubjects();
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
    }
}

function renderSubjects() {
    const container = $('#subjects-table');
    
    if (state.subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Дисциплины не найдены</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Название дисциплины</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${state.subjects.map(subject => `
                    <tr>
                        <td>${subject.id}</td>
                        <td>${subject.name}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn btn-sm btn-secondary" onclick="editSubject(${subject.id})">Изменить</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteSubject(${subject.id})">Удалить</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openSubjectModal(subjectId = null) {
    const isEdit = subjectId !== null;
    const subject = isEdit ? state.subjects.find(s => s.id === subjectId) : null;
    
    $('#modal-title').textContent = isEdit ? 'Редактировать дисциплину' : 'Добавить дисциплину';
    $('#modal-body').innerHTML = `
        <form id="subject-form">
            <div class="form-group">
                <label class="form-label">Название дисциплины</label>
                <input type="text" class="form-input" name="name" value="${subject?.name || ''}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
    
    $('#subject-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/subjects/${subjectId}` : `${API_URL}/subjects`;
            
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            closeModal();
            loadSubjects();
        } catch (error) {
            console.error('Ошибка сохранения дисциплины:', error);
        }
    });
    
    openModal();
}

window.editSubject = (id) => openSubjectModal(id);

window.deleteSubject = async (id) => {
    if (!confirm('Удалить эту дисциплину? Все связанные занятия также будут удалены.')) return;
    
    try {
        await fetch(`${API_URL}/subjects/${id}`, { method: 'DELETE' });
        loadSubjects();
    } catch (error) {
        console.error('Ошибка удаления дисциплины:', error);
    }
};

// === АУДИТОРИИ ===
async function loadClassrooms() {
    try {
        const response = await fetch(`${API_URL}/classrooms`);
        state.classrooms = await response.json();
        renderClassrooms();
    } catch (error) {
        console.error('Ошибка загрузки аудиторий:', error);
    }
}

function renderClassrooms() {
    const container = $('#classrooms-table');
    
    if (state.classrooms.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Аудитории не найдены</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Номер аудитории</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${state.classrooms.map(classroom => `
                    <tr>
                        <td>${classroom.id}</td>
                        <td>${classroom.room_number}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn btn-sm btn-secondary" onclick="editClassroom(${classroom.id})">Изменить</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteClassroom(${classroom.id})">Удалить</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openClassroomModal(classroomId = null) {
    const isEdit = classroomId !== null;
    const classroom = isEdit ? state.classrooms.find(c => c.id === classroomId) : null;
    
    $('#modal-title').textContent = isEdit ? 'Редактировать аудиторию' : 'Добавить аудиторию';
    $('#modal-body').innerHTML = `
        <form id="classroom-form">
            <div class="form-group">
                <label class="form-label">Номер аудитории</label>
                <input type="text" class="form-input" name="room_number" value="${classroom?.room_number || ''}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
    
    $('#classroom-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/classrooms/${classroomId}` : `${API_URL}/classrooms`;
            
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            closeModal();
            loadClassrooms();
        } catch (error) {
            console.error('Ошибка сохранения аудитории:', error);
        }
    });
    
    openModal();
}

window.editClassroom = (id) => openClassroomModal(id);

window.deleteClassroom = async (id) => {
    if (!confirm('Удалить эту аудиторию? Все связанные занятия также будут удалены.')) return;
    
    try {
        await fetch(`${API_URL}/classrooms/${id}`, { method: 'DELETE' });
        loadClassrooms();
    } catch (error) {
        console.error('Ошибка удаления аудитории:', error);
    }
};

// === МОДАЛЬНОЕ ОКНО ===
function openModal() {
    $('#modal').classList.add('active');
}

function closeModal() {
    $('#modal').classList.remove('active');
}
