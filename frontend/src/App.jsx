import { useEffect, useState } from 'react';
import './App.css';

function App() {
  
  // -------------------------------
  // State Management
  // -------------------------------
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authView, setAuthView] = useState('login');
  const [authError, setAuthError] = useState("");
  const [authData, setAuthData] = useState({
    username: "",
    password: ""
  });
  const [newCategoryName, setNewCategoryName] = useState("");


  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  useEffect(() => {
    fetch("http://localhost:3050/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch((error) => console.error("Fehler beim Laden der Kategorien:", error));
  }, []);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:3050/" , {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then((res) => res.json())
        .then(setTasks)
        .catch((error) => console.error("Fehler beim Laden der Aufgaben:", error));
    }
  }, [selectedCategory]);
  };

  const handleAuthChange = (e) => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value
    });
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3050/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen');
      setAuthView('login');
      setAuthError("");
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3050/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login fehlgeschlagen');
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ username: data.username });
      setAuthError("");
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTasks([]);
  };

  // -------------------------------
  // Aufgabenverwaltung
  // -------------------------------
  const itemHinzufuegen = () => {
    if (!title.trim() || !selectedCategory) {
      return;
    }

    fetch("http://localhost:3050/add_task", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, completed: false, deadline: deadline || null }),
    })
      .then((res) => res.json())
      .then((neueAufgabe) => setTasks([...tasks, neueAufgabe]))
      .catch((error) => console.error("Fehler beim Hinzufügen einer Aufgabe:", error));

    setTitle("");
    setDeadline("");
    setNote("");
  };

  const categoryHinzufuegen = () => {
    if (!newCategoryName.trim()) return;

<<<<<<< HEAD
    try {
        const res = await fetch("http://localhost:3050/add_category", {
            method: "POST",
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}`  },
            body: JSON.stringify({ name: newCategoryName }),
        });
        const neueKategorie = await res.json(); // Annahme: Backend gibt { id: ..., name: ... } zurück
=======
    fetch("http://localhost:3050/add_category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    })
      .then((res) => res.json())
      .then((neueKategorie) => setCategories([...categories, neueKategorie]))
      .catch((error) => console.error("Fehler beim Hinzufügen einer Kategorie:", error));
>>>>>>> parent of 1d9ec3a (Alle erledigten Aufgaben in einer separaten Liste als offenen Aufgaben)

    setNewCategoryName("");
  };

<<<<<<< HEAD
  const categoryLoeschen = async (id) => {
    // Finde die Kategorie, bevor sie aus dem State entfernt wird (für Rollback oder Info)
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (!categoryToDelete) {
        console.warn("Zu löschende Kategorie nicht im State gefunden:", id);
        // Sicherheitshalber: API trotzdem aufrufen? Oder hier abbrechen?
        // Hier rufen wir die API trotzdem auf, falls der State inkonsistent war.
    }

    // Prüfe, ob die Kategorie Tasks enthält 
    if (categoryToDelete && (categoryToDelete.counts?.open_tasks > 0 || categoryToDelete.counts?.completed_tasks > 0)) {
        // Hier könnte man eine Bestätigungsabfrage einbauen
        const confirmDelete = window.confirm(`Die Kategorie "${categoryToDelete.name}" enthält noch Aufgaben. Wirklich löschen? Alle zugehörigen Aufgaben gehen verloren!`);
        if (!confirmDelete) {
            return; // Abbruch durch Benutzer
        }
    }

    // Verhindert visuelles Flackern durch direkte Aktualisierung (Optimistic Update)
    setCategories((prevCategories) => prevCategories.filter(cat => cat.id !== id));

    // Setze selectedCategory zurück, falls die gelöschte Kategorie ausgewählt war
    if (selectedCategory === id) {
        setSelectedCategory(null); // Verhindert Anzeige von Tasks einer nicht mehr existenten Kategorie
    }

    try {
        // Sende die Löschanfrage an das Backend
        const response = await fetch(`http://localhost:3050/delete_category/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } });

        // Fehlerbehandlung mit Rollback für die UI
        if (!response.ok) {
             console.error("Fehler beim Löschen der Kategorie auf dem Server. Status:", response.status);
             // Rollback: Füge die Kategorie wieder zum State hinzu
             if(categoryToDelete) { // Nur wenn wir die Kategorie vorher gefunden haben
                 setCategories((prevCategories) => [...prevCategories, categoryToDelete].sort((a, b) => a.id - b.id));
             }
             // Rollback für selectedCategory, falls es zurückgesetzt wurde
             if (selectedCategory === null && categoryToDelete?.id === id) {
                 setSelectedCategory(id);
             }
             // Wirf einen Fehler, um das .catch unten auszulösen oder weitere Verarbeitung zu stoppen
             throw new Error('Server-Fehler beim Löschen der Kategorie');
        }
        // Kein erneutes Laden der Kategorien hier, um Flackern zu vermeiden. Die UI ist bereits aktuell (optimistisch).

    } catch (error) {
        console.error("Fehler beim Löschen einer Kategorie (Fetch oder Server):", error);
        // Hier ist der Rollback schon passiert (im if(!response.ok)) oder der Fetch schlug fehl
        // Optional: Fehlermeldung für den Benutzer anzeigen
    }
  };

  const taskStatusAktualisieren = (id, completed) => {
    const newCompletedStatus = !completed;

    // *** Optimistic UI Update für den Task ***
    setTasks((prevTasks) =>
        prevTasks.map(task =>
            task.id === id ? { ...task, completed: newCompletedStatus } : task
        )
    );

    // *** NEUE ÄNDERUNG: Aktualisiere die Counts der Kategorie (Optimistic Update) ***
    setCategories((prevCategories) =>
        prevCategories.map(cat => {
            if (cat.id === selectedCategory) {
                const openAdjustment = newCompletedStatus ? -1 : 1; // Wenn erledigt: -1 offen, sonst +1 offen
                const completedAdjustment = newCompletedStatus ? 1 : -1; // Wenn erledigt: +1 erledigt, sonst -1 erledigt
                return {
                    ...cat,
                    counts: {
                        open_tasks: (cat.counts?.open_tasks ?? 0) + openAdjustment,
                        completed_tasks: (cat.counts?.completed_tasks ?? 0) + completedAdjustment
                    }
                };
            }
            return cat;
        })
    );

    // Sende Update an das Backend
    fetch(`http://localhost:3050/update_completed/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ completed: newCompletedStatus }),
    })
    .then(response => {
        // *** NEUE ÄNDERUNG: Fehlerbehandlung mit Rollback ***
        if (!response.ok) {
            console.error("Fehler beim Aktualisieren des Status auf dem Server. Status:", response.status);
            // Rollback Task Status
            setTasks((prevTasks) =>
                prevTasks.map(task =>
                    task.id === id ? { ...task, completed: completed } : task // Zurück zum alten Status
                )
            );
            // Rollback Category Counts
            setCategories((prevCategories) =>
                prevCategories.map(cat => {
                    if (cat.id === selectedCategory) {
                        // Kehre die Anpassungen um
                        const openAdjustment = newCompletedStatus ? 1 : -1;
                        const completedAdjustment = newCompletedStatus ? -1 : 1;
                        return {
                            ...cat,
                            counts: {
                                open_tasks: (cat.counts?.open_tasks ?? 0) + openAdjustment,
                                completed_tasks: (cat.counts?.completed_tasks ?? 0) + completedAdjustment
                            }
                        };
                    }
                    return cat;
                })
            );
             throw new Error('Server-Fehler beim Aktualisieren des Task-Status');
        }
        // Bei Erfolg: Nichts zu tun, die UI wurde bereits optimistisch aktualisiert.
    })
    .catch((error) => {
        console.error("Fehler beim Aktualisieren des Status (Fetch oder Server):", error);
        // Hier ist der Rollback schon passiert oder der Fetch schlug fehl
        // Optional: Fehlermeldung für den Benutzer
    });
  };

  const notizAktualisieren = (id_nummer, note) => {
    fetch(`http://localhost:3050/update_note/${id_nummer}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ note }),
    })
    .then(response => {
         // Fehlerbehandlung mit Rollback
         if (!response.ok) {
             console.error("Fehler beim Aktualisieren der Notiz auf dem Server. Status:", response.status);
             // Rollback Note
             setTasks((prevTasks) =>
                prevTasks.map(task =>
                    task.id === id ? { ...task, note: originalNote } : task // Zurück zur alten Notiz
                )
            );
            throw new Error('Server-Fehler beim Aktualisieren der Notiz');
         }
         // Bei Erfolg: UI ist aktuell.
    })
    .catch((error) => {
        console.error("Fehler beim Aktualisieren der Notiz (Fetch oder Server):", error);
        // Rollback ist oben passiert oder Fetch fehlgeschlagen
        // Optional: Fehlermeldung
    });
  };

=======
  const categoryLoeschen = (id) => {
    fetch(`http://localhost:3050/delete_category/${id}`, { method: "DELETE" })
      .then(() => setCategories((prevCategories) => prevCategories.filter(cat => cat.id !== id)))
      .catch((error) => console.error("Fehler beim Löschen einer Kategorie:", error));
  };

>>>>>>> parent of 1d9ec3a (Alle erledigten Aufgaben in einer separaten Liste als offenen Aufgaben)
  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <div className="header">
        <h1>To-Do List</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="mode-toggle">
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="category-selection">
        <h2>Kategorie auswählen</h2>
        <div className="category-buttons">
          {categories.map((category) => (
            <div key={category.id} className="category-item">
              <button onClick={() => setSelectedCategory(category.id)}>
                {category.name}
              </button>
              <button onClick={() => categoryLoeschen(category.id)} className="delete-button">🗑️</button>
            </div>
          ))}
        </div>

        {selectedCategory ? (
          <button onClick={() => setSelectedCategory(null)}>Zurück zur Kategorie-Auswahl</button>
        ) : (
          <>
            <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Neue Kategorie..." />
            <button onClick={categoryHinzufuegen}>Kategorie hinzufügen</button>
          </>
        )}
      </div>

      {selectedCategory && (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Neue Aufgabe..." />
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Deadline festlegen" />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notiz hinzufügen..." />
          <button disabled={!title.trim()} onClick={itemHinzufuegen}>Add</button>

          <ul className="task-list">
            {tasks.map(({ id, title, completed, deadline, note }) => (
              <li key={id}>
                <span className={`task-text ${completed ? 'completed' : 'pending'}`}>{title}</span>
                <p>Deadline: {deadline ? new Date(deadline).toLocaleString() : "Keine"}</p>
                <textarea value={note || ""} onChange={(e) => setNote(e.target.value)} placeholder="Notiz bearbeiten..."></textarea>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );


export default App;