const STORAGE_KEY = "classPraiseBoard";

let appData = {
    version: 1,
    className: "우리반",
    students: [
        { id: "1", name: "김민준", score: 5 },
        { id: "2", name: "이서준", score: 3 },
        { id: "3", name: "박지우", score: 8 },
        { id: "4", name: "최서연", score: 6 },
        { id: "5", name: "정도윤", score: 4 },
        { id: "6", name: "한예린", score: 7 }
    ]
};

function createEmptyAppData() {
    return {
        version: 1,
        className: "우리반",
        students: []
    };
}

const studentGrid = document.querySelector("#student-grid");
const studentCount = document.querySelector("#student-count");
const tabButtons = document.querySelectorAll(".tab-button");
const screens = document.querySelectorAll(".screen");
const studentForm = document.querySelector("#student-form");
const studentNameInput = document.querySelector("#student-name");
const nameError = document.querySelector("#name-error");
const settingsStudentList = document.querySelector("#settings-student-list");
const exportBackupButton = document.querySelector("#export-backup");
const selectBackupButton = document.querySelector("#select-backup");
const backupFileInput = document.querySelector("#backup-file");
const resetScoresButton = document.querySelector("#reset-scores");

function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return;
        }

        const parsedData = JSON.parse(savedData);

        if (isValidBackup(parsedData)) {
            appData = parsedData;
            return;
        }

        appData = createEmptyAppData();
        console.warn("저장된 데이터 형식이 올바르지 않아 빈 데이터로 시작합니다.");
    } catch (error) {
        appData = createEmptyAppData();
        console.warn("저장된 데이터를 불러오지 못해 빈 데이터로 시작합니다.", error);
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
        console.warn("데이터를 브라우저 저장소에 저장하지 못했습니다.", error);
    }
}

function saveAndRender() {
    saveData();
    renderStudents();
    renderSettings();
}

function renderStudents() {
    studentGrid.replaceChildren();

    if (appData.students.length === 0) {
        renderEmptyBoard();
        studentCount.textContent = "학생 0명";
        return;
    }

    appData.students.forEach((student, index) => {
        const card = document.createElement("article");
        card.className = "student-card";
        card.dataset.studentId = student.id;
        card.dataset.studentNumber = String(index + 1).padStart(2, "0");

        const name = document.createElement("h3");
        name.className = "student-name";
        name.textContent = student.name;

        const score = document.createElement("p");
        score.className = "student-score";
        score.textContent = student.score;
        score.setAttribute("aria-label", `${student.name} 현재 점수 ${student.score}점`);
        score.setAttribute("aria-live", "polite");

        const actions = document.createElement("div");
        actions.className = "score-actions";

        const minusButton = createScoreButton(
            "-1",
            `${student.name} 점수 1점 감소`,
            "minus",
            () => decreaseScore(student.id)
        );
        const plusButton = createScoreButton(
            "+1",
            `${student.name} 점수 1점 증가`,
            "plus",
            () => increaseScore(student.id)
        );

        actions.append(minusButton, plusButton);
        card.append(name, score, actions);
        studentGrid.append(card);
    });

    studentCount.textContent = `학생 ${appData.students.length}명`;
}

function renderEmptyBoard() {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const title = document.createElement("h3");
    title.textContent = "아직 등록된 학생이 없습니다.";

    const description = document.createElement("p");
    description.textContent = "설정에서 학생을 추가해주세요.";

    const addButton = document.createElement("button");
    addButton.className = "empty-state-button";
    addButton.type = "button";
    addButton.textContent = "학생 추가하기";
    addButton.addEventListener("click", openStudentSettings);

    emptyState.append(title, description, addButton);
    studentGrid.append(emptyState);
}

function createScoreButton(label, accessibleLabel, className, clickHandler) {
    const button = document.createElement("button");
    button.className = `score-button ${className}`;
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", accessibleLabel);
    button.addEventListener("click", clickHandler);
    return button;
}

function increaseScore(studentId) {
    const student = appData.students.find((item) => item.id === studentId);

    if (!student) {
        return;
    }

    student.score += 1;
    saveAndRender();
}

function decreaseScore(studentId) {
    const student = appData.students.find((item) => item.id === studentId);

    if (!student) {
        return;
    }

    student.score -= 1;
    saveAndRender();
}

function renderSettings() {
    settingsStudentList.replaceChildren();

    if (appData.students.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "settings-list-empty";
        emptyItem.textContent = "등록된 학생이 없습니다.";
        settingsStudentList.append(emptyItem);
        return;
    }

    appData.students.forEach((student, index) => {
        const listItem = document.createElement("li");
        listItem.className = "settings-student-item";
        listItem.dataset.studentId = student.id;

        const order = document.createElement("span");
        order.className = "student-order";
        order.textContent = `${index + 1}.`;

        const name = document.createElement("span");
        name.className = "managed-student-name";
        name.textContent = student.name;

        const actions = document.createElement("div");
        actions.className = "manage-actions";

        const editButton = createManageButton(
            "수정",
            `${student.name} 학생 이름 수정`,
            "edit",
            () => editStudent(student.id)
        );
        const deleteButton = createManageButton(
            "삭제",
            `${student.name} 학생 삭제`,
            "delete",
            () => deleteStudent(student.id)
        );

        actions.append(editButton, deleteButton);
        listItem.append(order, name, actions);
        settingsStudentList.append(listItem);
    });
}

function createManageButton(label, accessibleLabel, className, clickHandler) {
    const button = document.createElement("button");
    button.className = `manage-button ${className}`;
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", accessibleLabel);
    button.addEventListener("click", clickHandler);
    return button;
}

function createStudentId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addStudent(event) {
    event.preventDefault();
    const studentName = studentNameInput.value.trim();

    if (!studentName) {
        nameError.textContent = "학생 이름을 입력해주세요.";
        studentNameInput.focus();
        return;
    }

    appData.students.push({
        id: createStudentId(),
        name: studentName,
        score: 0
    });

    saveAndRender();
    studentForm.reset();
    nameError.textContent = "";
    studentNameInput.focus();
}

function editStudent(studentId) {
    const student = appData.students.find((item) => item.id === studentId);

    if (!student) {
        return;
    }

    const editedName = window.prompt("변경할 학생 이름을 입력해주세요.", student.name);

    if (editedName === null) {
        return;
    }

    const trimmedName = editedName.trim();

    if (!trimmedName) {
        window.alert("학생 이름을 입력해주세요.");
        return;
    }

    student.name = trimmedName;
    saveAndRender();
}

function deleteStudent(studentId) {
    const student = appData.students.find((item) => item.id === studentId);

    if (!student || !window.confirm(`${student.name} 학생을 삭제하시겠습니까?`)) {
        return;
    }

    appData.students = appData.students.filter((item) => item.id !== studentId);
    saveAndRender();
}

function openStudentSettings() {
    showSettings();
    studentNameInput.focus();
}

function exportBackup() {
    const backupJson = JSON.stringify(appData, null, 2);
    const backupBlob = new Blob([backupJson], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(backupBlob);
    const downloadLink = document.createElement("a");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    downloadLink.href = downloadUrl;
    downloadLink.download = `칭찬포인트_${year}-${month}-${day}.json`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
}

function isValidBackup(data) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
        return false;
    }

    if (!Array.isArray(data.students)) {
        return false;
    }

    return data.students.every((student) => (
        student !== null
        && typeof student === "object"
        && !Array.isArray(student)
        && typeof student.id === "string"
        && student.id.length > 0
        && typeof student.name === "string"
        && student.name.trim().length > 0
        && typeof student.score === "number"
        && Number.isFinite(student.score)
    ));
}

function importBackup(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
        let backupData;

        try {
            backupData = JSON.parse(reader.result);
        } catch (error) {
            window.alert("올바른 칭찬 포인트 백업 파일이 아닙니다.");
            backupFileInput.value = "";
            return;
        }

        if (!isValidBackup(backupData)) {
            window.alert("올바른 칭찬 포인트 백업 파일이 아닙니다.");
            backupFileInput.value = "";
            return;
        }

        const shouldRestore = window.confirm(
            "현재 데이터가 백업 파일의 데이터로 변경됩니다.\n계속하시겠습니까?"
        );

        if (shouldRestore) {
            appData = {
                ...backupData,
                version: typeof backupData.version === "number" ? backupData.version : 1,
                className: typeof backupData.className === "string" ? backupData.className : "우리반"
            };
            saveAndRender();
        }

        backupFileInput.value = "";
    });

    reader.addEventListener("error", () => {
        window.alert("백업 파일을 읽을 수 없습니다.");
        backupFileInput.value = "";
    });

    reader.readAsText(selectedFile);
}

function resetScores() {
    const shouldReset = window.confirm("모든 학생의 점수를 0점으로 초기화하시겠습니까?");

    if (!shouldReset) {
        return;
    }

    appData.students.forEach((student) => {
        student.score = 0;
    });

    saveAndRender();
}

function showBoard() {
    showScreen("board");
}

function showSettings() {
    showScreen("settings");
}

function showScreen(screenName) {
    screens.forEach((screen) => {
        screen.hidden = screen.id !== `${screenName}-screen`;
    });

    tabButtons.forEach((button) => {
        const isActive = button.dataset.screen === screenName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
    });
}

tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (button.dataset.screen === "board") {
            showBoard();
        } else {
            showSettings();
        }
    });
});

studentForm.addEventListener("submit", addStudent);
studentNameInput.addEventListener("input", () => {
    nameError.textContent = "";
});
exportBackupButton.addEventListener("click", exportBackup);
selectBackupButton.addEventListener("click", () => backupFileInput.click());
backupFileInput.addEventListener("change", importBackup);
resetScoresButton.addEventListener("click", resetScores);

loadData();
renderStudents();
renderSettings();
