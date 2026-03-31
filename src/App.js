import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

function App() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "students"));
      const loadedStudents = snapshot.docs.map((studentDoc) => ({
        id: studentDoc.id,
        ...studentDoc.data(),
      }));
      setStudents(loadedStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      alert("Unable to load student records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const resetForm = () => {
    setName("");
    setCourse("");
    setYear("");
  };

  const saveStudent = async () => {
    if (!name.trim() || !course.trim() || !year.toString().trim()) {
      alert("Please fill in Name, Course, and Year Level.");
      return;
    }

    try {
      await addDoc(collection(db, "students"), {
        name: name.trim(),
        course: course.trim(),
        year: Number(year),
        createdAt: new Date(),
      });

      alert("Student record saved.");
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error("Failed to save student:", error);
      alert("Unable to save student record.");
    }
  };

  const deleteStudent = async (studentId) => {
    const confirmed = window.confirm("Delete this student record?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "students", studentId));
      setStudents((current) => current.filter((item) => item.id !== studentId));
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Unable to delete student record.");
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Student Record System</h1>

        <div className="student-form">
          <div className="field-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="course">Course</label>
            <input
              id="course"
              type="text"
              placeholder="Enter course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="year">Year Level</label>
            <input
              id="year"
              type="number"
              min="1"
              placeholder="Enter year level"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <button className="primary-button" onClick={saveStudent}>
            Save Student
          </button>
        </div>
      </div>

      <div className="card list-card">
        <div className="list-header">
          <h2>Student Records</h2>
          <span>{students.length} record{students.length === 1 ? "" : "s"}</span>
        </div>

        {loading && <p className="info-text">Loading student records...</p>}

        <div className="student-list">
          {!loading && students.length === 0 && (
            <p className="info-text">No student records found. Add a student above.</p>
          )}

          {students.map((student) => (
            <div className="student-row" key={student.id}>
              <div className="student-details">
                <div>
                  <strong>Name:</strong>
                  <span>{student.name}</span>
                </div>
                <div>
                  <strong>Course:</strong>
                  <span>{student.course}</span>
                </div>
                <div>
                  <strong>Year Level:</strong>
                  <span>{student.year}</span>
                </div>
              </div>

              <button
                className="danger-button"
                onClick={() => deleteStudent(student.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;