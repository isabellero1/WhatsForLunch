import React from "react";
// import reactDom from "react-dom";
import App from "./client/components/App.tsx"; // added file format at the end
import { createRoot } from 'react-dom/client';
import "./css/styles.css"

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App />)