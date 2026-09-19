// ==========================================
// FANDY TASK APP V5 - FIXED
// ==========================================

let tugas = JSON.parse(localStorage.getItem("tugasFandy")) || [];

let xp = Number(localStorage.getItem("xpFandy")) || 0;
let streak = Number(localStorage.getItem("streakFandy")) || 0;

let lastProductiveDate =
    localStorage.getItem("lastProductiveDate") || "";

let filterAktif = "semua";
let searchText = "";

let timer = null;
let waktu = 25 * 60;
let sedangBerjalan = false;


// ==========================================
// STORAGE
// ==========================================

function simpanTugas() {
    localStorage.setItem("tugasFandy", JSON.stringify(tugas));
}


// ==========================================
// MENU
// ==========================================

function bukaMenu(menuId, tombol) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(menuId);

    if (page) {
        page.classList.add("active");
    }

    document.querySelectorAll(".menu").forEach(menu => {
        menu.classList.remove("active");
    });

    if (tombol) {
        tombol.classList.add("active");
    }

    updateDashboard();
    tampilkanTugas();
    tampilkanAchievement();
}


// ==========================================
// TAMBAH TUGAS
// ==========================================

function tambahTugas() {

    const input = document.getElementById("taskInput");
    const tanggal = document.getElementById("dateInput");
    const priority = document.getElementById("priorityInput");

    if (!input) return;

    const nama = input.value.trim();

    if (!nama) {
        alert("Isi nama tugas dulu bro 😭");
        input.focus();
        return;
    }

    const tugasBaru = {
        id: Date.now(),
        nama: nama,
        tanggal: tanggal ? tanggal.value : "",
        priority: priority ? priority.value : "medium",
        selesai: false,
        dibuat: new Date().toISOString()
    };

    tugas.unshift(tugasBaru);

    simpanTugas();

    input.value = "";

    if (tanggal) {
        tanggal.value = "";
    }

    // XP pertama kali membuat tugas
    if (tugas.length === 1) {
        tambahXP(10);
    }

    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();
}


// ==========================================
// TAMPILKAN TUGAS
// ==========================================

function tampilkanTugas() {

    const list = document.getElementById("taskList");

    if (!list) return;

    let data = [...tugas];

    // FILTER
    if (filterAktif === "belum") {
        data = data.filter(t => !t.selesai);
    }

    if (filterAktif === "selesai") {
        data = data.filter(t => t.selesai);
    }

    // SEARCH
    if (searchText.trim() !== "") {

        data = data.filter(t =>
            t.nama
                .toLowerCase()
                .includes(searchText.toLowerCase())
        );

    }

    if (data.length === 0) {

        list.innerHTML = `
            <div class="empty">
                Tidak ada tugas yang cocok 😴
            </div>
        `;

        return;
    }

    list.innerHTML = data.map(t => {

        const tanggal = t.tanggal
            ? formatTanggal(t.tanggal)
            : "Tidak ada deadline";

        return `
            <div class="task-item ${t.selesai ? "done" : ""}">

                <input
                    type="checkbox"
                    class="task-check"
                    ${t.selesai ? "checked" : ""}
                    onchange="selesaiTugas(${t.id})"
                >

                <div class="task-info">

                    <div class="task-title">
                        ${escapeHTML(t.nama)}
                    </div>

                    <div class="task-meta">
                        📅 ${tanggal}
                    </div>

                </div>

                <span class="priority priority-${t.priority}">
                    ${t.priority.toUpperCase()}
                </span>

                <button
                    class="edit-btn"
                    onclick="editTugas(${t.id})">
                    ✏️
                </button>

                <button
                    class="delete-btn"
                    onclick="hapusTugas(${t.id})">
                    🗑️
                </button>

            </div>
        `;

    }).join("");
}


// ==========================================
// SELESAI / BATAL SELESAI
// ==========================================

function selesaiTugas(id) {

    const tugasCari = tugas.find(
        t => Number(t.id) === Number(id)
    );

    if (!tugasCari) {
        console.log("Tugas tidak ditemukan:", id);
        return;
    }

    const statusSebelumnya = tugasCari.selesai;

    // TOGGLE STATUS
    tugasCari.selesai = !tugasCari.selesai;

    // Kalau baru selesai
    if (!statusSebelumnya && tugasCari.selesai) {

        tambahXP(20);

        updateStreak();

        tampilkanXPNotification();

    }

    // Simpan
    simpanTugas();

    // Refresh
    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();
}


// ==========================================
// EDIT TUGAS
// ==========================================

function editTugas(id) {

    const tugasCari = tugas.find(
        t => Number(t.id) === Number(id)
    );

    if (!tugasCari) return;

    const namaBaru = prompt(
        "Edit nama tugas:",
        tugasCari.nama
    );

    if (namaBaru === null) return;

    const nama = namaBaru.trim();

    if (!nama) {
        alert("Nama tugas tidak boleh kosong!");
        return;
    }

    tugasCari.nama = nama;

    simpanTugas();

    tampilkanTugas();
    updateDashboard();
}


// ==========================================
// HAPUS TUGAS
// ==========================================

function hapusTugas(id) {

    const yakin = confirm(
        "Hapus tugas ini?"
    );

    if (!yakin) return;

    tugas = tugas.filter(
        t => Number(t.id) !== Number(id)
    );

    simpanTugas();

    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();
}


// ==========================================
// SEARCH
// ==========================================

function cariTugas() {

    const input =
        document.getElementById("searchTask");

    searchText =
        input ? input.value : "";

    tampilkanTugas();
}


// ==========================================
// FILTER
// ==========================================

function filterTugas(filter, tombol) {

    filterAktif = filter;

    document.querySelectorAll(".filter").forEach(btn => {
        btn.classList.remove("active");
    });

    if (tombol) {
        tombol.classList.add("active");
    }

    tampilkanTugas();
}


// ==========================================
// XP
// ==========================================

function tambahXP(jumlah) {

    xp += jumlah;

    localStorage.setItem(
        "xpFandy",
        xp
    );

    updateXP();
}


function updateXP() {

    const xpPerLevel = 100;

    const level =
        Math.floor(xp / xpPerLevel) + 1;

    const xpDalamLevel =
        xp % xpPerLevel;

    const levelUser =
        document.getElementById("levelUser");

    const levelText =
        document.getElementById("levelText");

    const xpSekarang =
        document.getElementById("xpSekarang");

    const xpBerikutnya =
        document.getElementById("xpBerikutnya");

    const xpBar =
        document.getElementById("xpBar");

    if (levelUser) {
        levelUser.textContent = level;
    }

    if (levelText) {
        levelText.textContent = level;
    }

    if (xpSekarang) {
        xpSekarang.textContent = xpDalamLevel;
    }

    if (xpBerikutnya) {
        xpBerikutnya.textContent = xpPerLevel;
    }

    if (xpBar) {
        xpBar.style.width =
            `${xpDalamLevel}%`;
    }
}


// ==========================================
// XP NOTIFICATION
// ==========================================

function tampilkanXPNotification() {

    const notif =
        document.createElement("div");

    notif.className =
        "xp-notification";

    notif.textContent =
        "+20 XP 🔥";

    document.body.appendChild(notif);

    setTimeout(() => {

        if (notif) {
            notif.remove();
        }

    }, 1800);
}


// ==========================================
// STREAK
// ==========================================

function getTanggalLokal() {

    const d = new Date();

    const tahun = d.getFullYear();

    const bulan =
        String(d.getMonth() + 1)
            .padStart(2, "0");

    const hari =
        String(d.getDate())
            .padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
}


function updateStreak() {

    const today =
        getTanggalLokal();

    if (lastProductiveDate === today) {
        updateStreakUI();
        return;
    }

    if (!lastProductiveDate) {

        streak = 1;

    } else {

        const kemarin =
            new Date();

        kemarin.setDate(
            kemarin.getDate() - 1
        );

        const yesterday =
            `${kemarin.getFullYear()}-` +
            `${String(kemarin.getMonth() + 1).padStart(2, "0")}-` +
            `${String(kemarin.getDate()).padStart(2, "0")}`;

        if (lastProductiveDate === yesterday) {

            streak++;

        } else {

            streak = 1;

        }
    }

    lastProductiveDate = today;

    localStorage.setItem(
        "streakFandy",
        streak
    );

    localStorage.setItem(
        "lastProductiveDate",
        lastProductiveDate
    );

    updateStreakUI();
}


function updateStreakUI() {

    const element =
        document.getElementById("streakUser");

    if (element) {
        element.textContent = streak;
    }
}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    const total =
        tugas.length;

    const selesai =
        tugas.filter(
            t => t.selesai
        ).length;

    const belum =
        total - selesai;

    const persen =
        total === 0
            ? 0
            : Math.round(
                (selesai / total) * 100
            );

    const dashTotal =
        document.getElementById("dashTotal");

    const dashSelesai =
        document.getElementById("dashSelesai");

    const dashBelum =
        document.getElementById("dashBelum");

    const progressText =
        document.getElementById("progressText");

    const progressPercent =
        document.getElementById("progressPercent");

    const progressBar =
        document.getElementById("progressBar");

    if (dashTotal) {
        dashTotal.textContent = total;
    }

    if (dashSelesai) {
        dashSelesai.textContent = selesai;
    }

    if (dashBelum) {
        dashBelum.textContent = belum;
    }

    if (progressText) {
        progressText.textContent =
            `${persen}% selesai`;
    }

    if (progressPercent) {
        progressPercent.textContent =
            `${persen}%`;
    }

    if (progressBar) {
        progressBar.style.width =
            `${persen}%`;
    }

    updateXP();
    updateStreakUI();
    tampilkanDeadline();
    tampilkanRecent();
    updateDailyGoal();
}


// ==========================================
// DAILY GOAL
// ==========================================

function updateDailyGoal() {

    const today =
        getTanggalLokal();

    const selesaiHariIni =
        tugas.filter(t => {

            if (!t.selesai) {
                return false;
            }

            if (!t.selesaiPada) {
                return false;
            }

            return t.selesaiPada === today;

        }).length;

    const target = 5;

    const persen =
        Math.min(
            (selesaiHariIni / target) * 100,
            100
        );

    const text =
        document.getElementById(
            "dailyGoalText"
        );

    const bar =
        document.getElementById(
            "dailyGoalBar"
        );

    const message =
        document.getElementById(
            "dailyGoalMessage"
        );

    if (text) {
        text.textContent =
            `${selesaiHariIni} / ${target}`;
    }

    if (bar) {
        bar.style.width =
            `${persen}%`;
    }

    if (message) {

        if (selesaiHariIni >= target) {

            message.textContent =
                "🎉 Daily Goal tercapai! Gokil bro!";

        } else {

            message.textContent =
                `Tinggal ${target - selesaiHariIni} tugas lagi 🔥`;

        }
    }
}


// ==========================================
// DEADLINE
// ==========================================

function tampilkanDeadline() {

    const container =
        document.getElementById(
            "deadlineTasks"
        );

    if (!container) return;

    const today =
        new Date();

    today.setHours(
        0, 0, 0, 0
    );

    const deadline =
        tugas
            .filter(t =>
                !t.selesai &&
                t.tanggal
            )
            .sort((a, b) =>
                a.tanggal.localeCompare(
                    b.tanggal
                )
            )
            .slice(0, 5);

    if (deadline.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Tidak ada deadline 🎉
            </div>
        `;

        return;
    }

    container.innerHTML =
        deadline.map(t => {

            const tanggal =
                new Date(
                    t.tanggal +
                    "T00:00:00"
                );

            const selisih =
                Math.ceil(
                    (
                        tanggal - today
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );

            let icon = "🟢";
            let teks = "Masih aman";

            if (selisih < 0) {

                icon = "🔴";
                teks = "Terlambat";

            } else if (selisih === 0) {

                icon = "🔴";
                teks = "Hari ini";

            } else if (selisih === 1) {

                icon = "🟠";
                teks = "Besok";
            }

            return `
                <div class="recent-item">

                    ${icon}

                    <strong>
                        ${escapeHTML(t.nama)}
                    </strong>

                    <small>
                        — ${formatTanggal(t.tanggal)}
                        (${teks})
                    </small>

                </div>
            `;

        }).join("");
}


// ==========================================
// RECENT TASK
// ==========================================

function tampilkanRecent() {

    const recent =
        document.getElementById(
            "recentTasks"
        );

    if (!recent) return;

    if (tugas.length === 0) {

        recent.innerHTML = `
            <div class="empty">
                Belum ada tugas 😴
            </div>
        `;

        return;
    }

    recent.innerHTML =
        tugas
            .slice(0, 5)
            .map(t => `

                <div class="recent-item">

                    ${t.selesai ? "✅" : "⏳"}

                    <strong>
                        ${escapeHTML(t.nama)}
                    </strong>

                    ${
                        t.tanggal
                        ? `
                            <small>
                                — ${formatTanggal(t.tanggal)}
                            </small>
                        `
                        : ""
                    }

                </div>

            `)
            .join("");
}


// ==========================================
// KALENDER
// ==========================================

function lihatTanggal() {

    const input =
        document.getElementById(
            "calendarDate"
        );

    const result =
        document.getElementById(
            "calendarResult"
        );

    if (!input || !result) return;

    const tanggal =
        input.value;

    if (!tanggal) {

        result.innerHTML =
            "Pilih tanggal dulu bro 📅";

        return;
    }

    const hasil =
        tugas.filter(
            t => t.tanggal === tanggal
        );

    if (hasil.length === 0) {

        result.innerHTML = `
            Tidak ada tugas pada
            <strong>
                ${formatTanggal(tanggal)}
            </strong>
            🎉
        `;

        return;
    }

    result.innerHTML = `

        <strong>
            Tugas ${formatTanggal(tanggal)}:
        </strong>

        <br><br>

        ${hasil.map(t => `
            ${t.selesai ? "✅" : "⏳"}
            ${escapeHTML(t.nama)}
            <br>
        `).join("")}
    `;
}


// ==========================================
// CATATAN
// ==========================================

function simpanCatatan() {

    const textarea =
        document.getElementById("notes");

    if (!textarea) return;

    localStorage.setItem(
        "catatanFandy",
        textarea.value
    );

    const status =
        document.getElementById(
            "noteStatus"
        );

    if (status) {

        status.textContent =
            "✓ Catatan tersimpan";

        setTimeout(() => {

            status.textContent =
                "Tersimpan otomatis";

        }, 2000);
    }
}


function loadCatatan() {

    const textarea =
        document.getElementById("notes");

    if (!textarea) return;

    textarea.value =
        localStorage.getItem(
            "catatanFandy"
        ) || "";

    textarea.addEventListener(
        "input",
        () => {

            localStorage.setItem(
                "catatanFandy",
                textarea.value
            );

            const status =
                document.getElementById(
                    "noteStatus"
                );

            if (status) {
                status.textContent =
                    "✓ Tersimpan";
            }
        }
    );
}


// ==========================================
// POMODORO
// ==========================================

function updateTimer() {

    const menit =
        Math.floor(waktu / 60);

    const detik =
        waktu % 60;

    const timerElement =
        document.getElementById("timer");

    if (timerElement) {

        timerElement.textContent =
            `${String(menit).padStart(2, "0")}:` +
            `${String(detik).padStart(2, "0")}`;
    }

    if (waktu <= 0) {

        clearInterval(timer);

        timer = null;

        sedangBerjalan = false;

        alert(
            "Waktu fokus selesai! 🔥"
        );

        waktu = 25 * 60;

        updateTimer();
    }
}


function mulaiTimer() {

    if (sedangBerjalan) return;

    sedangBerjalan = true;

    timer = setInterval(() => {

        waktu--;

        updateTimer();

    }, 1000);
}


function pauseTimer() {

    clearInterval(timer);

    timer = null;

    sedangBerjalan = false;
}


function resetTimer() {

    clearInterval(timer);

    timer = null;

    sedangBerjalan = false;

    waktu = 25 * 60;

    updateTimer();
}


// ==========================================
// NAMA
// ==========================================

function simpanNama() {

    const input =
        document.getElementById(
            "namaUser"
        );

    if (!input) return;

    const nama =
        input.value.trim();

    if (!nama) {

        alert(
            "Isi nama dulu bro 😭"
        );

        return;
    }

    localStorage.setItem(
        "namaFandy",
        nama
    );

    const dashboard =
        document.getElementById(
            "namaDashboard"
        );

    const intro =
        document.getElementById(
            "introName"
        );

    if (dashboard) {
        dashboard.textContent = nama;
    }

    if (intro) {
        intro.textContent = nama;
    }

    alert(
        "Nama berhasil disimpan 🔥"
    );
}


function loadNama() {

    const nama =
        localStorage.getItem(
            "namaFandy"
        ) || "Fandy";

    const input =
        document.getElementById(
            "namaUser"
        );

    const dashboard =
        document.getElementById(
            "namaDashboard"
        );

    const intro =
        document.getElementById(
            "introName"
        );

    if (input) {
        input.value = nama;
    }

    if (dashboard) {
        dashboard.textContent = nama;
    }

    if (intro) {
        intro.textContent = nama;
    }
}


// ==========================================
// TEMA
// ==========================================

function toggleTema() {

    document.body.classList.toggle(
        "light"
    );

    const light =
        document.body.classList.contains(
            "light"
        );

    localStorage.setItem(
        "temaFandy",
        light ? "light" : "dark"
    );
}


function loadTema() {

    const tema =
        localStorage.getItem(
            "temaFandy"
        );

    if (tema === "light") {

        document.body.classList.add(
            "light"
        );
    }
}


// ==========================================
// HAPUS SEMUA
// ==========================================

function hapusSemuaTugas() {

    if (tugas.length === 0) {

        alert(
            "Belum ada tugas yang bisa dihapus 😭"
        );

        return;
    }

    const yakin =
        confirm(
            "Yakin mau hapus SEMUA tugas?"
        );

    if (!yakin) return;

    tugas = [];

    simpanTugas();

    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();

    alert(
        "Semua tugas berhasil dihapus 🗑️"
    );
}


// ==========================================
// ACHIEVEMENT
// ==========================================

function tampilkanAchievement() {

    const container =
        document.getElementById(
            "achievementList"
        );

    if (!container) return;

    const totalSelesai =
        tugas.filter(
            t => t.selesai
        ).length;

    const achievements = [

        {
            icon: "🌱",
            nama: "First Step",
            deskripsi: "Buat tugas pertama",
            unlocked: tugas.length >= 1
        },

        {
            icon: "✅",
            nama: "5 Tasks",
            deskripsi: "Selesaikan 5 tugas",
            unlocked: totalSelesai >= 5
        },

        {
            icon: "🔥",
            nama: "Streak 3",
            deskripsi: "Capai streak 3 hari",
            unlocked: streak >= 3
        },

        {
            icon: "🚀",
            nama: "Level 2",
            deskripsi: "Capai Level 2",
            unlocked: xp >= 100
        },

        {
            icon: "🏆",
            nama: "10 Tasks",
            deskripsi: "Selesaikan 10 tugas",
            unlocked: totalSelesai >= 10
        },

        {
            icon: "💎",
            nama: "25 Tasks",
            deskripsi: "Selesaikan 25 tugas",
            unlocked: totalSelesai >= 25
        }

    ];

    container.innerHTML =
        achievements.map(a => `

            <div class="achievement-card ${
                a.unlocked
                    ? "unlocked"
                    : "locked"
            }">

                <div class="achievement-icon">
                    ${
                        a.unlocked
                            ? a.icon
                            : "🔒"
                    }
                </div>

                <h3>
                    ${a.nama}
                </h3>

                <p>
                    ${a.deskripsi}
                </p>

                <span>
                    ${
                        a.unlocked
                            ? "✓ Terbuka"
                            : "🔒 Terkunci"
                    }
                </span>

            </div>

        `).join("");
}


// ==========================================
// EXPORT DATA
// ==========================================

function exportData() {

    const data = {

        tugas: tugas,

        xp: xp,

        streak: streak,

        lastProductiveDate:
            lastProductiveDate,

        nama:
            localStorage.getItem(
                "namaFandy"
            ) || "Fandy"

    };

    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "backup-fandy-task-app.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);
}


// ==========================================
// IMPORT DATA
// ==========================================

function importData() {

    const input =
        document.createElement(
            "input"
        );

    input.type = "file";

    input.accept = ".json";

    input.onchange = function(event) {

        const file =
            event.target.files[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload = function(e) {

            try {

                const data =
                    JSON.parse(
                        e.target.result
                    );

                if (
                    !Array.isArray(
                        data.tugas
                    )
                ) {

                    throw new Error(
                        "Data tugas tidak valid"
                    );
                }

                tugas = data.tugas;

                xp =
                    Number(data.xp) || 0;

                streak =
                    Number(data.streak) || 0;

                lastProductiveDate =
                    data.lastProductiveDate || "";

                if (data.nama) {

                    localStorage.setItem(
                        "namaFandy",
                        data.nama
                    );
                }

                simpanTugas();

                localStorage.setItem(
                    "xpFandy",
                    xp
                );

                localStorage.setItem(
                    "streakFandy",
                    streak
                );

                localStorage.setItem(
                    "lastProductiveDate",
                    lastProductiveDate
                );

                loadNama();

                updateDashboard();

                tampilkanTugas();

                tampilkanAchievement();

                alert(
                    "Data berhasil di-import! 🔥"
                );

            } catch (error) {

                console.error(error);

                alert(
                    "File backup tidak valid 😭"
                );
            }
        };

        reader.readAsText(file);
    };

    input.click();
}


// ==========================================
// TANGGAL
// ==========================================

function tampilkanTanggal() {

    const element =
        document.getElementById(
            "tanggalHariIni"
        );

    if (!element) return;

    const sekarang =
        new Date();

    element.textContent =
        sekarang.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


function formatTanggal(tanggal) {

    if (!tanggal) return "";

    return new Date(
        tanggal + "T00:00:00"
    ).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// INTRO
// ==========================================

function jalankanIntro() {

    const intro =
        document.getElementById(
            "intro"
        );

    if (!intro) return;

    setTimeout(() => {

        intro.classList.add("hide");

    }, 2200);
}


// ==========================================
// LOAD APP
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadNama();

        loadTema();

        loadCatatan();

        tampilkanTanggal();

        updateTimer();

        updateXP();

        updateStreakUI();

        tampilkanTugas();

        updateDashboard();

        tampilkanAchievement();

        jalankanIntro();

    }
);