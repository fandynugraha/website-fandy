const SUPABASE_URL =
    "https://frlipbvpxvmaiirvpwec.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_7pEnNAunj6-93AXf5uT1mg_N__inABq";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

let user = null;
let tugas = [];
let nama = "Fandy";
let filterAktif = "semua";
let timerInterval = null;
let waktu = 25 * 60;


// =========================
// START
// =========================

document.addEventListener("DOMContentLoaded", async () => {

    await cekSession();

    tampilkanTanggal();
    updateTimer();

});


// =========================
// SESSION
// =========================

async function cekSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {

        console.error(error);
        tampilkanLogin();
        return;

    }

    if (data.session) {

        await masukKeApp(
            data.session.user
        );

    } else {

        tampilkanLogin();

    }

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (
                event === "SIGNED_IN" &&
                session
            ) {

                await masukKeApp(
                    session.user
                );

            }

            if (
                event === "SIGNED_OUT"
            ) {

                tampilkanLogin();

            }

        }
    );

}


// =========================
// LOGIN / REGISTER
// =========================

function tampilkanLogin() {

    const auth =
        document.getElementById("authScreen");

    const app =
        document.querySelector(".app");

    if (auth) {
        auth.style.display = "flex";
    }

    if (app) {
        app.style.display = "none";
    }

}


function showLogin() {

    document.getElementById(
        "loginForm"
    ).style.display = "block";

    document.getElementById(
        "registerForm"
    ).style.display = "none";

    document.getElementById(
        "authTitle"
    ).textContent =
        "Login ke akun kamu";

    clearMessages();

}


function showRegister() {

    document.getElementById(
        "loginForm"
    ).style.display = "none";

    document.getElementById(
        "registerForm"
    ).style.display = "block";

    document.getElementById(
        "authTitle"
    ).textContent =
        "Buat akun baru";

    clearMessages();

}


function clearMessages() {

    const login =
        document.getElementById(
            "loginMessage"
        );

    const register =
        document.getElementById(
            "registerMessage"
        );

    if (login) {
        login.textContent = "";
    }

    if (register) {
        register.textContent = "";
    }

}


async function registerUser() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const message =
        document.getElementById(
            "registerMessage"
        );

    if (!name || !email || !password) {

        message.textContent =
            "❌ Isi semua bagian dulu bro.";

        return;

    }

    if (password.length < 6) {

        message.textContent =
            "❌ Password minimal 6 karakter.";

        return;

    }

    message.textContent =
        "⏳ Membuat akun...";

    const {
        data,
        error
    } = await supabaseClient.auth.signUp({

        email: email,

        password: password,

        options: {

            data: {
                full_name: name
            }

        }

    });

    if (error) {

        console.error(error);

        message.textContent =
            "❌ " + error.message;

        return;

    }

    if (!data.session) {

        message.textContent =
            "✅ Akun dibuat. Cek email verifikasi, lalu login.";

        return;

    }

    message.textContent =
        "✅ Akun berhasil dibuat!";

}


async function loginUser() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const message =
        document.getElementById(
            "loginMessage"
        );

    if (!email || !password) {

        message.textContent =
            "❌ Email dan password wajib diisi.";

        return;

    }

    message.textContent =
        "⏳ Login...";

    const {
        error
    } = await supabaseClient.auth.signInWithPassword({

        email: email,
        password: password

    });

    if (error) {

        console.error(error);

        message.textContent =
            "❌ " + error.message;

        return;

    }

    message.textContent =
        "✅ Login berhasil!";

}


async function logoutUser() {

    const yakin =
        confirm("Yakin mau logout?");

    if (!yakin) {
        return;
    }

    const {
        error
    } = await supabaseClient.auth.signOut();

    if (error) {

        alert(
            "Gagal logout:\n" +
            error.message
        );

        return;

    }

    location.reload();

}


// =========================
// MASUK APP
// =========================

async function masukKeApp(currentUser) {

    user = currentUser;

    const auth =
        document.getElementById(
            "authScreen"
        );

    const app =
        document.querySelector(
            ".app"
        );

    if (auth) {
        auth.style.display = "none";
    }

    if (app) {
        app.style.display = "flex";
    }

    nama =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Fandy";

    setText(
        "namaDashboard",
        nama
    );

    setText(
        "introName",
        nama
    );

    setText(
        "akunEmail",
        user.email || "-"
    );

    const nameInput =
        document.getElementById(
            "namaUser"
        );

    if (nameInput) {
        nameInput.value = nama;
    }

    loadTheme();
    loadNotes();

    await ambilTugas();

    updateDashboard();
    tampilkanAchievement();

    const intro =
        document.getElementById(
            "intro"
        );

    if (intro) {

        intro.classList.remove("hide");

        setTimeout(() => {

            intro.classList.add("hide");

        }, 1600);

    }

}


// =========================
// DATABASE
// =========================

async function ambilTugas() {

    if (!user) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq(
            "user_id",
            user.id
        )
        .order(
            "dibuat",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(error);

        alert(
            "Database error:\n" +
            error.message
        );

        return;

    }

    tugas = data || [];

    tampilkanTugas();

}


// =========================
// MENU
// =========================

function bukaMenu(id, tombol) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });

    const halaman =
        document.getElementById(id);

    if (halaman) {

        halaman.classList.add(
            "active"
        );

    }

    document
        .querySelectorAll(".menu")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });

    if (tombol) {

        tombol.classList.add(
            "active"
        );

    }

}


// =========================
// TAMBAH TUGAS
// =========================

async function tambahTugas() {

    const input =
        document.getElementById(
            "taskInput"
        );

    const date =
        document.getElementById(
            "dateInput"
        );

    const priority =
        document.getElementById(
            "priorityInput"
        );

    const namaTugas =
        input.value.trim();

    if (!namaTugas) {

        alert(
            "Isi nama tugas dulu bro 😭"
        );

        return;

    }

    if (!user) {

        alert("Lu belum login.");

        return;

    }

    const {
        data,
        error
    } = await supabaseClient
        .from("tasks")
        .insert({

            user_id:
                user.id,

            nama:
                namaTugas,

            deadline:
                date.value || null,

            priority:
                priority.value,

            selesai:
                false,

            selesai_pada:
                null

        })
        .select()
        .single();

    if (error) {

        console.error(error);

        alert(
            "Gagal menambah tugas:\n" +
            error.message
        );

        return;

    }

    tugas.unshift(data);

    input.value = "";
    date.value = "";

    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();

}


// =========================
// TAMPILKAN TUGAS
// =========================

function tampilkanTugas() {

    const container =
        document.getElementById(
            "taskList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    let hasil = [...tugas];

    const search =
        document
            .getElementById(
                "searchTask"
            )
            ?.value
            .toLowerCase()
            .trim() || "";

    if (search) {

        hasil =
            hasil.filter(
                t =>
                    t.nama
                        .toLowerCase()
                        .includes(search)
            );

    }

    if (
        filterAktif === "belum"
    ) {

        hasil =
            hasil.filter(
                t => !t.selesai
            );

    }

    if (
        filterAktif === "selesai"
    ) {

        hasil =
            hasil.filter(
                t => t.selesai
            );

    }

    if (hasil.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Belum ada tugas di sini 😴
            </div>
        `;

        return;

    }

    hasil.forEach(task => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "task-item";

        if (task.selesai) {

            item.classList.add(
                "completed"
            );

        }

        const checkbox =
            document.createElement(
                "input"
            );

        checkbox.type =
            "checkbox";

        checkbox.className =
            "task-check";

        checkbox.checked =
            Boolean(
                task.selesai
            );

        checkbox.addEventListener(
            "change",
            () => {

                selesaiTugas(
                    task.id
                );

            }
        );

        const info =
            document.createElement(
                "div"
            );

        info.className =
            "task-info";

        const title =
            document.createElement(
                "strong"
            );

        title.textContent =
            task.nama;

        if (task.selesai) {

            title.style.textDecoration =
                "line-through";

        }

        const detail =
            document.createElement(
                "small"
            );

        let detailText = "";

        if (task.deadline) {

            detailText +=
                "📅 " +
                task.deadline;

        }

        if (task.priority) {

            if (detailText) {
                detailText += " • ";
            }

            detailText +=
                "⭐ " +
                task.priority;

        }

        detail.textContent =
            detailText;

        info.appendChild(title);
        info.appendChild(detail);

        const editButton =
            document.createElement(
                "button"
            );

        editButton.textContent =
            "✏️";

        editButton.onclick =
            () => editTugas(task.id);

        const deleteButton =
            document.createElement(
                "button"
            );

        deleteButton.textContent =
            "🗑️";

        deleteButton.onclick =
            () => hapusTugas(task.id);

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "task-actions";

        actions.appendChild(
            editButton
        );

        actions.appendChild(
            deleteButton
        );

        item.appendChild(
            checkbox
        );

        item.appendChild(
            info
        );

        item.appendChild(
            actions
        );

        container.appendChild(
            item
        );

    });

}


// =========================
// SELESAI
// =========================

async function selesaiTugas(id) {

    const task =
        tugas.find(
            t =>
                Number(t.id) ===
                Number(id)
        );

    if (!task) {
        return;
    }

    const selesaiBaru =
        !task.selesai;

    const selesaiPada =
        selesaiBaru
            ? tanggalHariIni()
            : null;

    const {
        error
    } = await supabaseClient
        .from("tasks")
        .update({

            selesai:
                selesaiBaru,

            selesai_pada:
                selesaiPada

        })
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            user.id
        );

    if (error) {

        console.error(error);

        alert(
            "Gagal mengubah tugas:\n" +
            error.message
        );

        return;

    }

    task.selesai =
        selesaiBaru;

    task.selesai_pada =
        selesaiPada;

    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();

}


// =========================
// EDIT
// =========================

async function editTugas(id) {

    const task =
        tugas.find(
            t =>
                Number(t.id) ===
                Number(id)
        );

    if (!task) {
        return;
    }

    const namaBaru =
        prompt(
            "Edit nama tugas:",
            task.nama
        );

    if (namaBaru === null) {
        return;
    }

    if (!namaBaru.trim()) {

        alert(
            "Nama tugas tidak boleh kosong."
        );

        return;

    }

    const {
        error
    } = await supabaseClient
        .from("tasks")
        .update({

            nama:
                namaBaru.trim()

        })
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            user.id
        );

    if (error) {

        alert(
            "Gagal edit:\n" +
            error.message
        );

        return;

    }

    task.nama =
        namaBaru.trim();

    tampilkanTugas();
    updateDashboard();

}


// =========================
// HAPUS
// =========================

async function hapusTugas(id) {

    const yakin =
        confirm(
            "Hapus tugas ini?"
        );

    if (!yakin) {
        return;
    }

    const {
        error
    } = await supabaseClient
        .from("tasks")
        .delete()
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            user.id
        );

    if (error) {

        alert(
            "Gagal menghapus:\n" +
            error.message
        );

        return;

    }

    tugas =
        tugas.filter(
            t =>
                Number(t.id) !==
                Number(id)
        );

    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();

}


// =========================
// SEARCH / FILTER
// =========================

function cariTugas() {
    tampilkanTugas();
}


function filterTugas(
    filter,
    tombol
) {

    filterAktif =
        filter;

    document
        .querySelectorAll(
            ".filter"
        )
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });

    if (tombol) {

        tombol.classList.add(
            "active"
        );

    }

    tampilkanTugas();

}


// =========================
// DASHBOARD
// =========================

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

    setText(
        "dashTotal",
        total
    );

    setText(
        "dashSelesai",
        selesai
    );

    setText(
        "dashBelum",
        belum
    );

    setText(
        "progressPercent",
        persen + "%"
    );

    setText(
        "progressText",
        persen + "% selesai"
    );

    const progressBar =
        document.getElementById(
            "progressBar"
        );

    if (progressBar) {

        progressBar.style.width =
            persen + "%";

    }

    const hariIni =
        tanggalHariIni();

    const selesaiHariIni =
        tugas.filter(
            t =>
                t.selesai &&
                t.selesai_pada ===
                hariIni
        ).length;

    setText(
        "dailyGoalText",
        Math.min(
            selesaiHariIni,
            5
        ) + " / 5"
    );

    const goalBar =
        document.getElementById(
            "dailyGoalBar"
        );

    if (goalBar) {

        goalBar.style.width =
            Math.min(
                selesaiHariIni / 5 * 100,
                100
            ) + "%";

    }

    const goalMessage =
        document.getElementById(
            "dailyGoalMessage"
        );

    if (goalMessage) {

        if (selesaiHariIni >= 5) {

            goalMessage.textContent =
                "🔥 Daily Goal tercapai!";

        } else {

            goalMessage.textContent =
                "Yuk selesaikan " +
                (5 - selesaiHariIni) +
                " tugas lagi 🔥";

        }

    }

    setText(
        "streakUser",
        hitungStreak()
    );

    updateXP();
    tampilkanDeadline();
    tampilkanRecent();

}


// =========================
// XP
// =========================

function updateXP() {

    const selesai =
        tugas.filter(
            t => t.selesai
        ).length;

    const xp =
        selesai * 20;

    const level =
        Math.floor(
            xp / 100
        ) + 1;

    const xpLevel =
        xp % 100;

    setText(
        "levelUser",
        level
    );

    setText(
        "levelText",
        level
    );

    setText(
        "xpSekarang",
        xpLevel
    );

    setText(
        "xpBerikutnya",
        100
    );

    const bar =
        document.getElementById(
            "xpBar"
        );

    if (bar) {

        bar.style.width =
            xpLevel + "%";

    }

}


// =========================
// DEADLINE
// =========================

function tampilkanDeadline() {

    const container =
        document.getElementById(
            "deadlineTasks"
        );

    if (!container) {
        return;
    }

    const data =
        tugas
            .filter(
                t =>
                    !t.selesai &&
                    t.deadline
            )
            .sort(
                (a, b) =>
                    a.deadline.localeCompare(
                        b.deadline
                    )
            )
            .slice(
                0,
                5
            );

    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Tidak ada deadline 🎉
            </div>
        `;

        return;

    }

    container.innerHTML =
        data.map(
            t => `

                <div class="recent-item">

                    <strong>
                        ${escapeHTML(t.nama)}
                    </strong>

                    <small>
                        📅 ${t.deadline}
                    </small>

                </div>

            `
        ).join("");

}


// =========================
// RECENT
// =========================

function tampilkanRecent() {

    const container =
        document.getElementById(
            "recentTasks"
        );

    if (!container) {
        return;
    }

    const data =
        tugas.slice(
            0,
            5
        );

    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Belum ada tugas 😴
            </div>
        `;

        return;

    }

    container.innerHTML =
        data.map(
            t => `

                <div class="recent-item">

                    <strong>
                        ${
                            t.selesai
                                ? "✅"
                                : "⏳"
                        }

                        ${escapeHTML(t.nama)}
                    </strong>

                </div>

            `
        ).join("");

}


// =========================
// ACHIEVEMENT
// =========================

function tampilkanAchievement() {

    const container =
        document.getElementById(
            "achievementList"
        );

    if (!container) {
        return;
    }

    const jumlah =
        tugas.filter(
            t => t.selesai
        ).length;

    const achievements = [

        {
            nama:
                "🌱 Pemula",

            syarat:
                1,

            text:
                "Selesaikan 1 tugas"
        },

        {
            nama:
                "🔥 Rajin",

            syarat:
                5,

            text:
                "Selesaikan 5 tugas"
        },

        {
            nama:
                "🏆 Produktif",

            syarat:
                10,

            text:
                "Selesaikan 10 tugas"
        },

        {
            nama:
                "👑 Master",

            syarat:
                25,

            text:
                "Selesaikan 25 tugas"
        }

    ];

    container.innerHTML =
        achievements.map(
            a => `

                <div
                    class="
                        achievement-card
                        ${
                            jumlah >= a.syarat
                                ? "unlocked"
                                : ""
                        }
                    "
                >

                    <h3>
                        ${a.nama}
                    </h3>

                    <p>
                        ${a.text}
                    </p>

                    <strong>
                        ${
                            jumlah >= a.syarat
                                ? "✅ Terbuka"
                                : "🔒 Terkunci"
                        }
                    </strong>

                </div>

            `
        ).join("");

}


// =========================
// NAMA
// =========================

async function simpanNama() {

    const input =
        document.getElementById(
            "namaUser"
        );

    const namaBaru =
        input.value.trim();

    if (!namaBaru) {

        alert(
            "Nama tidak boleh kosong."
        );

        return;

    }

    const {
        error
    } = await supabaseClient.auth.updateUser({

        data: {
            full_name:
                namaBaru
        }

    });

    if (error) {

        alert(
            "Gagal menyimpan nama:\n" +
            error.message
        );

        return;

    }

    nama =
        namaBaru;

    setText(
        "namaDashboard",
        nama
    );

    setText(
        "introName",
        nama
    );

    alert(
        "Nama berhasil disimpan 👍"
    );

}


// =========================
// CATATAN
// =========================

function noteKey() {

    return (
        "catatanFandy_" +
        user.id
    );

}


function loadNotes() {

    const notes =
        document.getElementById(
            "notes"
        );

    if (!notes) {
        return;
    }

    notes.value =
        localStorage.getItem(
            noteKey()
        ) || "";

}


function simpanCatatan() {

    const notes =
        document.getElementById(
            "notes"
        );

    if (!notes) {
        return;
    }

    localStorage.setItem(
        noteKey(),
        notes.value
    );

    setText(
        "noteStatus",
        "Catatan tersimpan ✅"
    );

}


// =========================
// TIMER
// =========================

function mulaiTimer() {

    if (timerInterval) {
        return;
    }

    timerInterval =
        setInterval(
            () => {

                if (waktu <= 0) {

                    clearInterval(
                        timerInterval
                    );

                    timerInterval =
                        null;

                    alert(
                        "🔥 Waktu fokus selesai!"
                    );

                    return;

                }

                waktu--;

                updateTimer();

            },
            1000
        );

}


function pauseTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval =
        null;

}


function resetTimer() {

    clearInterval(
        timerInterval
    );

    timerInterval =
        null;

    waktu =
        25 * 60;

    updateTimer();

}


function updateTimer() {

    const timer =
        document.getElementById(
            "timer"
        );

    if (!timer) {
        return;
    }

    const menit =
        Math.floor(
            waktu / 60
        )
            .toString()
            .padStart(
                2,
                "0"
            );

    const detik =
        (waktu % 60)
            .toString()
            .padStart(
                2,
                "0"
            );

    timer.textContent =
        `${menit}:${detik}`;

}


// =========================
// THEME
// =========================

function themeKey() {

    return (
        "temaFandy_" +
        user.id
    );

}


function toggleTema() {

    document.body.classList.toggle(
        "light"
    );

    localStorage.setItem(
        themeKey(),
        document.body.classList.contains(
            "light"
        )
            ? "light"
            : "dark"
    );

}


function loadTheme() {

    const tema =
        localStorage.getItem(
            themeKey()
        );

    if (tema === "light") {

        document.body.classList.add(
            "light"
        );

    } else {

        document.body.classList.remove(
            "light"
        );

    }

}


// =========================
// HAPUS SEMUA
// =========================

async function hapusSemuaTugas() {

    const yakin =
        confirm(
            "Yakin mau hapus SEMUA tugas?"
        );

    if (!yakin) {
        return;
    }

    const {
        error
    } = await supabaseClient
        .from("tasks")
        .delete()
        .eq(
            "user_id",
            user.id
        );

    if (error) {

        alert(
            "Gagal menghapus:\n" +
            error.message
        );

        return;

    }

    tugas = [];

    tampilkanTugas();
    updateDashboard();
    tampilkanAchievement();

    alert(
        "Semua tugas berhasil dihapus ✅"
    );

}


// =========================
// KALENDER
// =========================

function lihatTanggal() {

    const date =
        document.getElementById(
            "calendarDate"
        )?.value;

    const result =
        document.getElementById(
            "calendarResult"
        );

    if (!result || !date) {
        return;
    }

    const hasil =
        tugas.filter(
            t =>
                t.deadline ===
                date
        );

    if (hasil.length === 0) {

        result.innerHTML =
            "Tidak ada tugas di tanggal ini 😎";

        return;

    }

    result.innerHTML =
        hasil.map(
            t => `

                <div>

                    ${
                        t.selesai
                            ? "✅"
                            : "⏳"
                    }

                    ${escapeHTML(t.nama)}

                </div>

            `
        ).join("");

}


// =========================
// EXPORT
// =========================

function exportData() {

    const data = {

        nama:
            nama,

        email:
            user?.email || null,

        tugas:
            tugas

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
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            "a"
        );

    a.href =
        url;

    a.download =
        "fandy-task-backup.json";

    a.click();

    URL.revokeObjectURL(
        url
    );

}


// =========================
// IMPORT
// =========================

function importData() {

    const input =
        document.createElement(
            "input"
        );

    input.type =
        "file";

    input.accept =
        ".json";

    input.onchange =
        function (event) {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                async function () {

                    try {

                        const data =
                            JSON.parse(
                                reader.result
                            );

                        const daftar =
                            Array.isArray(
                                data.tugas
                            )
                                ? data.tugas
                                : [];

                        if (
                            daftar.length === 0
                        ) {

                            alert(
                                "Tidak ada tugas dalam file."
                            );

                            return;

                        }

                        const rows =
                            daftar.map(
                                t => ({

                                    user_id:
                                        user.id,

                                    nama:
                                        String(
                                            t.nama || ""
                                        ),

                                    deadline:
                                        t.deadline ||
                                        null,

                                    priority:
                                        t.priority ||
                                        "medium",

                                    selesai:
                                        Boolean(
                                            t.selesai
                                        ),

                                    selesai_pada:
                                        t.selesai_pada ||
                                        null

                                })
                            );

                        const {
                            error
                        } =
                            await supabaseClient
                                .from("tasks")
                                .insert(
                                    rows
                                );

                        if (error) {

                            alert(
                                "Import gagal:\n" +
                                error.message
                            );

                            return;

                        }

                        await ambilTugas();

                        alert(
                            "Data berhasil diimport ✅"
                        );

                    } catch (error) {

                        console.error(
                            error
                        );

                        alert(
                            "File backup tidak valid."
                        );

                    }

                };

            reader.readAsText(file);

        };

    input.click();

}


// =========================
// STREAK
// =========================

function hitungStreak() {

    const tanggal =
        [
            ...new Set(

                tugas
                    .filter(
                        t =>
                            t.selesai &&
                            t.selesai_pada
                    )
                    .map(
                        t =>
                            t.selesai_pada
                    )

            )
        ].sort(
            (a, b) =>
                b.localeCompare(a)
        );

    if (
        tanggal.length === 0
    ) {

        return 0;

    }

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    let streak = 0;

    for (
        let i = 0;
        i < tanggal.length;
        i++
    ) {

        const expected =
            new Date(
                today
            );

        expected.setDate(
            today.getDate() - i
        );

        const expectedString =
            formatDate(
                expected
            );

        if (
            tanggal.includes(
                expectedString
            )
        ) {

            streak++;

        } else {

            break;

        }

    }

    return streak;

}


// =========================
// HELPERS
// =========================

function setText(
    id,
    value
) {

    const el =
        document.getElementById(
            id
        );

    if (el) {

        el.textContent =
            value;

    }

}


function tanggalHariIni() {

    return formatDate(
        new Date()
    );

}


function formatDate(
    date
) {

    const tahun =
        date.getFullYear();

    const bulan =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const hari =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        tahun +
        "-" +
        bulan +
        "-" +
        hari
    );

}


function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


function tampilkanTanggal() {

    const tanggal =
        document.getElementById(
            "tanggalHariIni"
        );

    if (!tanggal) {
        return;
    }

    tanggal.textContent =
        new Date().toLocaleDateString(
            "id-ID",
            {
                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"
            }
        );

}
