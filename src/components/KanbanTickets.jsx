import { useEffect, useState } from "react";
import axiosCliente from "../api/axiosCliente";

export default function KanbanTickets() {
  const [columns, setColumns] = useState({});

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const res = await axiosCliente.get("/tickets-kanban");
    setColumns(res.data.data);
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      {Object.keys(columns).map((estado) => (
        <div key={estado} style={styles.column}>
          <h3>{estado}</h3>

          {columns[estado].map((ticket) => (
            <div key={ticket.id} style={styles.card}>
              <strong>{ticket.folio}</strong>
              <p>{ticket.titulo}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  column: {
    flex: 1,
    background: "#f4f4f4",
    padding: 10,
    borderRadius: 10,
    minHeight: "70vh",
  },
  card: {
    background: "white",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
};