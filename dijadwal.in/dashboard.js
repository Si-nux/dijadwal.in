// Definisikan variabel calendar, tasks, dan meetings di luar fungsi agar dapat diakses secara global
let calendar;
let tasks = []; // Array untuk menyimpan semua tugas
let meetings = []; // Array untuk menyimpan semua meeting

// Function untuk menampilkan section berdasarkan tab
function showSection(sectionId) {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none'; // Sembunyikan semua
    });
    document.getElementById(sectionId).style.display = 'block'; // Tampilkan yang dipilih
}

function updateGreetingAndTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const greeting = hours < 12 ? 'Good Morning' : (hours < 18 ? 'Good Afternoon' : 'Good Evening');
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const weekNumber = Math.ceil((now.getDate() + now.getDay()) / 7); // Menghitung nomor minggu dalam bulan

    // Update HTML elements
    document.getElementById('greeting-message').textContent = greeting;
    document.getElementById('current-time').textContent = `${hours % 12 || 12}:${minutes}`;
    document.getElementById('current-period').textContent = period;
    document.getElementById('day-of-week').textContent = dayOfWeek;
    document.getElementById('week-number').textContent = weekNumber;
}

// Jalankan fungsi setiap 1 detik (1000 ms)
setInterval(updateGreetingAndTime, 1000);

// Jalankan fungsi pertama kali saat halaman dimuat
updateGreetingAndTime();

// Fungsi untuk memperbarui "Today's Tasks"
function updateTodayTasks() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const todayTasks = tasks.filter(task => task.deadline === todayStr);

    const taskListToday = document.getElementById('task-list-today');
    taskListToday.innerHTML = ''; // Kosongkan daftar tugas hari ini

    todayTasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.name} - ${capitalizeFirstLetter(task.priority)}`;
        taskListToday.appendChild(li);
    });
}

// Fungsi untuk memperbarui "Today's Meetings"
function updateTodayMeetings() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const todayMeetings = meetings.filter(meeting => meeting.date === todayStr);
    
    const meetingListToday = document.getElementById('meeting-list-today');
    meetingListToday.innerHTML = ''; // Kosongkan daftar meeting hari ini
    
    todayMeetings.forEach(meeting => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${meeting.title}</strong><br>
            <a href="${meeting.link}" target="_blank">Join Meeting</a><br>
            <span>${meeting.time}</span>
        `;
        meetingListToday.appendChild(li);
    });
}

// Helper function untuk mengkapitalkan huruf pertama
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initial display setup
document.addEventListener("DOMContentLoaded", function() {
    showSection('calendar-section'); // Tampilkan Kalender sebagai default

    // Inisialisasi FullCalendar
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 500,
    });
    calendar.render();

    updateTodayTasks(); // Perbarui "Today's Tasks" pada awal load
    updateTodayMeetings(); // Perbarui "Today's Meetings" pada awal load
});

// Task modal
const taskModal = document.getElementById("taskModal");
const modalForm = document.getElementById("modal-task-form");
const closeModal = document.getElementsByClassName("close")[0];

// Tampilkan modal saat tombol diklik
document.getElementById("add-task-button").onclick = function() {
    taskModal.style.display = "block";
}

// Tutup modal saat tombol close diklik
closeModal.onclick = function() {
    taskModal.style.display = "none";
}

// Tutup modal saat klik di luar modal
window.onclick = function(event) {
    if (event.target === taskModal) {
        taskModal.style.display = "none";
    }
}

// Tangani pengiriman tugas baru dari modal
modalForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const taskName = document.getElementById('modal-task-name').value.trim();
    const taskPriority = document.getElementById('modal-task-priority').value;
    const taskDeadline = document.getElementById('modal-task-deadline').value;

    if (taskName === '' || taskDeadline === '') {
        alert('Please fill in all required fields.');
        return;
    }

    const todoList = document.getElementById('todo-list');
    const newTask = createTask(taskName, taskPriority, taskDeadline); // Gunakan fungsi createTask
    todoList.appendChild(newTask);

    // Tambahkan tugas ke array tasks
    const taskId = newTask.id;
    tasks.push({
        id: taskId,
        name: taskName,
        priority: taskPriority,
        deadline: taskDeadline
    });

    // Tambahkan event ke FullCalendar
    addEventToCalendar(taskName, taskDeadline, taskId, false); // false menandakan ini adalah task

    // Perbarui "Today's Tasks"
    updateTodayTasks();

    taskModal.style.display = 'none'; // Tutup modal setelah menambahkan tugas
    modalForm.reset(); // Reset form
});

// Fungsi untuk membuat elemen tugas baru
function createTask(taskName, priority, deadline) {
    const taskId = 'task-' + Date.now(); // ID unik untuk tugas
    const task = document.createElement('div');
    task.classList.add('task', priority + '-priority');
    task.id = taskId;
    task.draggable = true;

    // Konten tugas
    task.innerHTML = `
        <span class="label">Task:</span><span class="value">${taskName}</span><br>
        <span class="label">Priority:</span><span class="value">${capitalizeFirstLetter(priority)}</span><br>
        <span class="label">Deadline:</span><span class="value">${deadline}</span>
    `;

    task.ondragstart = function(event) {
        event.dataTransfer.setData('text/plain', taskId); // Simpan ID tugas
    };

    return task;
}

// Fungsi untuk menambahkan event ke FullCalendar
// Parameter `isMeeting` menandakan apakah event ini adalah meeting
function addEventToCalendar(title, date, time, id, isMeeting = false) {
    // Buat ID unik untuk event yang terkait dengan id tugas atau meeting
    const eventId = 'event-' + id;

    // Format waktu jika ini adalah meeting
    let start = date;
    let end = date;
    if (isMeeting) {
        start += 'T' + time;
        // Asumsikan meeting berdurasi 1 jam; Anda bisa mengubahnya sesuai kebutuhan
        const [hour, minute] = time.split(':');
        const endDate = new Date(date + 'T' + time);
        endDate.setHours(endDate.getHours() + 1);
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
        end = date + 'T' + endHours + ':' + endMinutes;
    }

    // Tambahkan event ke kalender
    calendar.addEvent({
        id: eventId,
        title: title,
        start: start,
        end: end,
        allDay: !isMeeting, // Jika bukan meeting, event all-day
        extendedProps: {
            relatedId: id, // Simpan id tugas atau meeting dalam event
            isMeeting: isMeeting
        }
    });
}
// Tangani pengiriman meeting baru dari form
const meetingForm = document.getElementById("meeting-form");

meetingForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const meetingTitle = document.getElementById('meeting-title').value.trim();
    const meetingLink = document.getElementById('meeting-link').value.trim();
    const meetingDate = document.getElementById('meeting-date').value;
    const meetingTime = document.getElementById('meeting-time').value;

    if (meetingTitle === '' || meetingLink === '' || meetingDate === '' || meetingTime === '') {
        alert('Please fill in all required fields.');
        return;
    }

    // Buat elemen meeting baru di daftar all meetings
    const allMeetingsList = document.getElementById('meeting-list-all');
    const newMeeting = createMeeting(meetingTitle, meetingLink, meetingDate, meetingTime);
    allMeetingsList.appendChild(newMeeting);

    // Tambahkan meeting ke array meetings
    const meetingId = newMeeting.id;
    meetings.push({
        id: meetingId,
        title: meetingTitle,
        link: meetingLink,
        date: meetingDate,
        time: meetingTime
    });

    // Tambahkan event ke FullCalendar
    addEventToCalendar(meetingTitle, meetingDate, meetingTime, meetingId, true); // true menandakan ini adalah meeting

    // Perbarui "Today's Meetings"
    updateTodayMeetings();

    // Reset form
    meetingForm.reset();
});

// Event listener untuk tombol "Cancel"
document.getElementById('cancel-button').addEventListener('click', function(event) {
    event.preventDefault(); // Mencegah pengiriman form
    resetMeetingsForm(); // Mereset form
});

// Fungsi untuk mereset form meeting
function resetMeetingsForm() {
    document.getElementById('meeting-form').reset(); // Mereset semua input dalam form
}

// Asumsi createMeeting, meetings, addEventToCalendar, updateTodayMeetings sudah didefinisikan di tempat lain.

// Fungsi untuk membuat elemen meeting baru
function createMeeting(title, link, date, time) {
    const meetingId = 'meeting-' + Date.now(); // ID unik untuk meeting
    const meeting = document.createElement('li');
    meeting.classList.add('meeting-item');
    meeting.id = meetingId;

    meeting.innerHTML = `
        <strong>${title}</strong><br>
        <a href="${link}" target="_blank">Join Meeting</a><br>
        <span>${date} at ${time}</span><br>
        <button class="delete-meeting-button">Delete</button>
    `;

    // Tambahkan event listener untuk tombol hapus
    const deleteButton = meeting.querySelector('.delete-meeting-button');
    deleteButton.addEventListener('click', function() {
        // Hapus event dari kalender
        removeEventFromCalendar(meetingId, true); // true menandakan ini adalah meeting

        // Hapus meeting dari array meetings
        removeMeetingFromArray(meetingId);

        // Perbarui "Today's Meetings"
        updateTodayMeetings();

        // Hapus elemen meeting dari DOM
        meeting.remove();
    });

    return meeting;
}

// Fungsi untuk menghapus event dari FullCalendar berdasarkan ID dan jenis
// Parameter `isMeeting` menandakan apakah event ini adalah meeting
function removeEventFromCalendar(id, isMeeting = false) {
    const eventId = 'event-' + id;
    const event = calendar.getEventById(eventId);
    if (event) {
        event.remove();
    }
}

// Fungsi untuk menghapus meeting dari array meetings berdasarkan ID
function removeMeetingFromArray(meetingId) {
    meetings = meetings.filter(meeting => meeting.id !== meetingId);
}

// Menangani drag-and-drop untuk tugas
const taskLists = document.querySelectorAll('.task-list');

taskLists.forEach(list => {
    list.addEventListener("dragover", function(event) {
        event.preventDefault(); // Cegah default untuk mengizinkan drop
    });

    list.addEventListener("drop", function(event) {
        event.preventDefault(); // Cegah aksi default
        const taskId = event.dataTransfer.getData('text/plain');
        const task = document.getElementById(taskId);

        if (task) {
            list.appendChild(task); // Pindahkan tugas ke list baru
            if (list.id === 'done-list') {
                addDeleteButton(task);  // Tambahkan tombol hapus di "Done"
            } else {
                removeDeleteButton(task);  // Hapus tombol hapus jika dipindahkan dari "Done"
            }
        }
    });
});

// Fungsi untuk menambahkan tombol hapus di kolom "Done"
function addDeleteButton(task) {
    if (!task.querySelector('.delete-button')) {
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete Task';
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = function () {
            // Hapus event dari kalender jika ada
            removeEventFromCalendar(task.id, false); // false menandakan ini adalah task

            // Hapus tugas dari array tasks
            removeTaskFromArray(task.id);

            // Perbarui "Today's Tasks"
            updateTodayTasks();

            // Hapus elemen tugas dari DOM
            task.remove();
        };
        task.appendChild(deleteButton); // Tambahkan tombol di dalam elemen tugas
    }
}

// Fungsi untuk menghapus tombol hapus jika dipindahkan dari "Done"
function removeDeleteButton(task) {
    const deleteButton = task.querySelector('.delete-button');
    if (deleteButton) {
        deleteButton.remove();
    }
}

// Fungsi untuk menghapus tugas dari array tasks berdasarkan ID tugas
function removeTaskFromArray(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
}

// Fungsi untuk menghapus semua event dan tugas (Opsional)
function clearAllTasks() {
    // Hapus semua event dari kalender
    calendar.removeAllEvents();
    // Hapus semua tugas dari DOM
    const allTasks = document.querySelectorAll('.task');
    allTasks.forEach(task => task.remove());
    // Kosongkan array tasks dan meetings
    tasks = [];
    meetings = [];
    // Perbarui "Today's Tasks" dan "Today's Meetings"
    updateTodayTasks();
    updateTodayMeetings();
}

document.querySelector(".sidebar .toggle-btn").addEventListener("click", function() {
    document.querySelector(".sidebar").classList.toggle("active");
});

  document.addEventListener('DOMContentLoaded', function() {
    document.body.style.zoom = "100%";
  });

  window.addEventListener('load', function() {
    window.scrollTo(0, 0);
  });
