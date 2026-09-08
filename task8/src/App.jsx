import React, { useState } from "react";

function App() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState("");

    function addTodo() {
        if (input.trim() === "") return;

        setTodos([
            ...todos,
            {
                id: Date.now(),
                text: input,
                completed: false
            }
        ]);

        setInput("");
    }

    function deleteTodo(id) {
        setTodos(todos.filter((todo) => todo.id !== id));
    }

    function toggleTodo(id) {
        setTodos(
            todos.map((todo) => {
                if (todo.id === id) {
                    return {
                        ...todo,
                        completed: !todo.completed
                    };
                }

                return todo;
            })
        );
    }

    return (
        <div>
            <h1>Todo List</h1>

            <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Add a new task..."
            />

            <button onClick={addTodo}>Add</button>

            {todos.map((todo) => {
                return (
                    <div key={todo.id} style={{ marginTop: "10px" }}>
                        <span
                            onClick={() => toggleTodo(todo.id)}
                            style={{
                                textDecoration: todo.completed
                                    ? "line-through"
                                    : "none",
                                cursor: "pointer",
                                marginRight: "10px"
                            }}
                        >
                            {todo.text}
                        </span>

                        <button onClick={() => deleteTodo(todo.id)}>
                            Delete
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default App;