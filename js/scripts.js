// Elementos
const notesContainer = document.querySelector("#notes-container");
const noteInput = document.querySelector("#note-content");
const addNoteBtn = document.querySelector(".add-note");
const searchInput = document.querySelector("#search-input");
const exportBtn = document.querySelector("#export-notes");

// Funções
function showNotes() {
  cleanNotes();

  getNotes().forEach((note) => {
    const noteElement = createNote(note.id, note.content, note.fixed);

    notesContainer.appendChild(noteElement);
  });
}

function cleanNotes() {
  notesContainer.replaceChildren([]);
}

function addNote() {
  const notes = getNotes();

  const noteObject = {
    id: generateId(),
    content: noteInput.value,
    fixed: false,
  };

  const noteElement = createNote(noteObject.id, noteObject.content);

  notesContainer.appendChild(noteElement);

  notes.push(noteObject);
  saveNotes(notes);

  noteInput.value = "";

  showNotes();
}

function createNote(id, text, fixed) {
  const element = document.createElement("div");
  element.classList.add("note");

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.placeholder = "Adicione algum texto...";
  element.appendChild(textArea);

  const pinIcon = document.createElement("i");
  pinIcon.classList.add(...["bi", "bi-pin"]);
  element.append(pinIcon);
  if (fixed) {
    element.classList.add("fixed");
  }

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add(...["bi", "bi-x-lg"]);
  element.append(deleteIcon);

  const duplicateIcon = document.createElement("i");
  duplicateIcon.classList.add(...["bi", "bi-file-earmark-plus"]);
  element.append(duplicateIcon);

  // Eventos do Elemento
  element.querySelector("textarea").addEventListener("keyup", (e) => {
    const noteContent = e.target.value;

    updateNote(id, noteContent);
  }); //não é interessante para quando trabalhamos com backend

  element.querySelector(".bi-pin").addEventListener("click", () => {
    toggleFixNote(id);
  });

  element.querySelector(".bi-x-lg").addEventListener("click", () => {
    if (window.confirm("Deseja excluir esta nota?")) {
      deleteNote(id, element);
    }
  });

  element
    .querySelector(".bi-file-earmark-plus")
    .addEventListener("click", () => {
      copyNote(id);
    });

  return element;
}

function generateId() {
  return Date.now();
}

function toggleFixNote(id) {
  const notes = getNotes();

  const targetNote = notes.filter((note) => note.id === id)[0];

  targetNote.fixed = !targetNote.fixed;

  saveNotes(notes);
  showNotes();
}

function deleteNote(id, element) {
  const notes = getNotes().filter((note) => note.id !== id);

  saveNotes(notes);
  notesContainer.removeChild(element);
}

function copyNote(id) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  const noteObjetc = {
    id: generateId(),
    content: targetNote.content,
    fixed: false,
  };

  const noteElement = createNote(
    noteObjetc.id,
    noteObjetc.content,
    noteObjetc.fixed,
  );

  notesContainer.appendChild(noteElement);
  notes.push(noteObjetc);
  saveNotes(notes);
}

function updateNote(id, newContent) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  targetNote.content = newContent;

  saveNotes(notes);
}

// LocalStorage
function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function getNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const orderedNotes = notes.sort((a, b) => {
    // fixadas primeiro
    if (a.fixed !== b.fixed) {
      return a.fixed ? -1 : 1;
    }

    // depois ordenar por data (id)
    return b.id - a.id; // mais recente primeiro
  });

  return orderedNotes;
}

function searchNotes(search) {
  const searchResults = getNotes().filter((note) => {
    return note.content.toLowerCase().includes(search.toLowerCase());
  });

  if (search !== "") {
    cleanNotes();

    searchResults.forEach((note) => {
      const noteElement = createNote(note.id, note.content, note.fixed);
      notesContainer.appendChild(noteElement);
    });

    return;
  }

  cleanNotes();
  showNotes();
}

function exportData() {
  const notes = getNotes();

  const csvString = [
    ["ID", "Conteúdo", "Fixado?"],
    ...notes.map((note) => [note.id, note.content, note.fixed]),
  ]
    .map((e) => e.join(","))
    .join("\n");

  const element = document.createElement("a");
  element.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
  element.target = "_blank";
  element.download = "notes.csv";
  element.click();
}

// Eventos
addNoteBtn.addEventListener("click", () => addNote());

noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addNote();
});

searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;

  searchNotes(search);
});

exportBtn.addEventListener("click", () => {
  exportData();
});

// Inicialização
showNotes();
